import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { auth } from '../auth.js';
import { pushNotification } from '../lib/realtime.js';
import { getOrCreateDMChat } from '../lib/chat-utils.js';

const router = Router();

// Auth middleware (reused pattern)
const requiredAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });
  req.session = session;
  next();
};

// POST /api/swipes
router.post('/swipes', requiredAuth, async (req: any, res: Response) => {
  try {
    const { receiverId, hackathonId, type } = req.body;
    const currentUserId: string = req.session.user.id;

    if (!receiverId || !type) {
      return res.status(400).json({ message: 'receiverId and type are required' });
    }

    if (type !== 'LEFT' && type !== 'RIGHT') {
      return res.status(400).json({ message: 'type must be LEFT or RIGHT' });
    }

    // Create or update swipe record
    const existingSwipe = await prisma.swipe.findFirst({
      where: {
        senderId: currentUserId,
        receiverId,
        hackathonId: hackathonId || null,
      },
    });

    if (existingSwipe) {
      await prisma.swipe.update({
        where: { id: existingSwipe.id },
        data: { type },
      });
    } else {
      await prisma.swipe.create({
        data: {
          senderId: currentUserId,
          receiverId,
          hackathonId: hackathonId || null,
          type,
        },
      });
    }

    // LEFT swipe — done
    if (type === 'LEFT') {
      return res.json({ matched: false });
    }

    // RIGHT swipe — create interest notification for receiver
    let hackathonName = 'a hackathon';
    if (hackathonId) {
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { name: true },
      });
      if (hackathon) hackathonName = hackathon.name;
    }

    // ─────────────────────────────────────────────────────
    // LEADER SWIPE ON SOLO USER (Team Invite Flow)
    // ─────────────────────────────────────────────────────
    if (hackathonId) {
      const senderLeaderMembership = await prisma.teamMember.findFirst({
        where: { userId: currentUserId, team: { hackathonId }, role: 'LEADER' },
        include: { team: true }
      });

      const receiverInTeam = await prisma.teamMember.findFirst({
        where: { userId: receiverId, team: { hackathonId } }
      });

      if (senderLeaderMembership && !receiverInTeam) {
        console.log(`[Swipe] Leader inviting solo user. Creating TEAM_INVITE notification...`);
        const currentUser = await prisma.user.findUnique({ where: { id: currentUserId }, select: { name: true } });
        
        const inviteNotification = await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'TEAM_INVITE',
            content: `${currentUser?.name || 'A team leader'} wants you to join their team "${senderLeaderMembership.team.name || 'Unnamed Team'}" for ${hackathonName}!`,
            relatedId: senderLeaderMembership.teamId,
            actorId: currentUserId,
          } as any,
        });

        await pushNotification(`notifications:${receiverId}`, 'new_notification', inviteNotification);
        
        // No match record created yet as per Issue 1
        return res.json({ matched: false, inviteSent: true });
      }
    }

    // Standard RIGHT swipe notification
    const interestNotification = await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'INTEREST',
        content: `Someone is interested in teaming up with you for ${hackathonName}!`,
        relatedId: hackathonId || null,
        actorId: currentUserId,
      } as any,
    });
    
    await pushNotification(`notifications:${receiverId}`, 'new_notification', interestNotification);

    // Check for reciprocal RIGHT swipe
    const reciprocal = await prisma.swipe.findFirst({
      where: {
        senderId: receiverId,
        receiverId: currentUserId,
        type: 'RIGHT',
        hackathonId: hackathonId || null // Ensure context matches
      },
    });

    if (!reciprocal) {
      console.log(`[Swipe] No reciprocal RIGHT swipe found.`);
      return res.json({ matched: false });
    }

    console.log(`[Swipe] MUTUAL MATCH FOUND! Proceeding with match creation...`);

    // ── MUTUAL MATCH ── Atomic transaction ──────────
    const result = await prisma.$transaction(async (tx: any) => {
      let senderTeam: any = null;
      let receiverTeam: any = null;

      if (hackathonId) {
        // Check existing team memberships for this hackathon
        senderTeam = await tx.teamMember.findFirst({
          where: { userId: currentUserId, team: { hackathonId } },
          include: { team: true },
        });

        receiverTeam = await tx.teamMember.findFirst({
          where: { userId: receiverId, team: { hackathonId } },
          include: { team: true },
        });
      }

      let team: any = null;
      let chat: any;

      if (hackathonId) {
        if (!senderTeam && !receiverTeam) {
          // Case 1: Neither in a team → create new Team + GROUP Chat
          team = await tx.team.create({
            data: { hackathonId },
          });

          await tx.teamMember.create({
            data: { teamId: team.id, userId: currentUserId, role: 'LEADER' },
          });

          await tx.teamMember.create({
            data: { teamId: team.id, userId: receiverId, role: 'MEMBER' },
          });

          chat = await tx.chat.create({
            data: { type: 'GROUP', teamId: team.id },
          });

          // Also create a private DM chat between them for individual networking
          await getOrCreateDMChat(currentUserId, receiverId, tx);
        } else {
          // Case 2: One or both already in a team → create DM Chat only
          chat = await getOrCreateDMChat(currentUserId, receiverId, tx);
        }
      } else {
        // Global Explore Match → Create DM only
        chat = await getOrCreateDMChat(currentUserId, receiverId, tx);
      }

      // Add both users to chat (if it's a NEW chat, getOrCreateDMChat already handles membership)
      // If it's a GROUP chat (from Case 1), we still need to add members to THAT chat.
      // Wait, in Case 1, chat is the GROUP chat. dmChat is the DM chat.
      // The current code adds members to 'chat'.
      
      if (chat.type === 'GROUP') {
        await tx.chatMember.create({
          data: { chatId: chat.id, userId: currentUserId },
        }).catch(() => {}); // Ignore if already member

        await tx.chatMember.create({
          data: { chatId: chat.id, userId: receiverId },
        }).catch(() => {}); // Ignore if already member
      }

      // Check if match already exists
      const existingMatch = await tx.match.findFirst({
        where: {
          OR: [
            { user1Id: currentUserId, user2Id: receiverId, hackathonId: hackathonId || null },
            { user1Id: receiverId, user2Id: currentUserId, hackathonId: hackathonId || null },
          ],
        },
      });

      let match;
      if (existingMatch) {
        console.log(`[Match] Match already exists, reusing: ${existingMatch.id}`);
        match = existingMatch;
      } else {
        console.log(`[Match] Creating new match record...`);
        match = await tx.match.create({
          data: {
            user1Id: currentUserId,
            user2Id: receiverId,
            hackathonId: hackathonId || null,
            teamId: team?.id || undefined,
          },
        });
      }

      // Create mutual match notifications for both users
      const currentUser = await tx.user.findUnique({
        where: { id: currentUserId },
        select: { name: true },
      });
      const receiverUser = await tx.user.findUnique({
        where: { id: receiverId },
        select: { name: true, image: true },
      });

      const matchNotification1 = await tx.notification.create({
        data: {
          userId: currentUserId,
          type: 'MATCH',
          content: `You matched with ${receiverUser?.name || 'someone'} for ${hackathonName}!`,
          relatedId: match.id,
          actorId: receiverId,
        } as any,
      });

      const matchNotification2 = await tx.notification.create({
        data: {
          userId: receiverId,
          type: 'MATCH',
          content: `You matched with ${currentUser?.name || 'someone'} for ${hackathonName}!`,
          relatedId: match.id,
          actorId: currentUserId,
        } as any,
      });

      await pushNotification(`notifications:${currentUserId}`, 'new_notification', matchNotification1);
      await pushNotification(`notifications:${receiverId}`, 'new_notification', matchNotification2);

      return {
        matched: true,
        teamId: team?.id || null,
        chatId: chat.id,
        matchedUser: {
          id: receiverId,
          name: receiverUser?.name || '',
          image: receiverUser?.image || null,
        },
        hackathonName,
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('Error processing swipe:', error);
    res.status(500).json({ message: 'Error processing swipe' });
  }
});

// GET /api/matches
router.get('/matches', requiredAuth, async (req: any, res: Response) => {
  try {
    const currentUserId = req.session.user.id;
    const { hackathonId } = req.query;

    const query: any = {
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId },
        ]
      }
    };

    // If hackathonId is provided, filter by it.
    // Use 'null' string to represent global matches if explicitly requested, 
    // or just pass the ID if it's a specific hackathon.
    if (hackathonId) {
      const hId = hackathonId === 'null' ? null : hackathonId;
      query.where = {
        AND: [
          { OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }] },
          { hackathonId: hId }
        ]
      };
    }

    const matches = await prisma.match.findMany({
      ...query,
      include: {
        user1: {
          select: {
            id: true, name: true, image: true, bio: true, title: true,
            skills: { include: { skill: true } }
          }
        },
        user2: {
          select: {
            id: true, name: true, image: true, bio: true, title: true,
            skills: { include: { skill: true } }
          }
        },
        hackathon: { select: { name: true } },
        team: { include: { chats: { take: 1 } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedMatches = matches.map((m: any) => {
      const otherUser = m.user1Id === currentUserId ? m.user2 : m.user1;
      return {
        id: m.id,
        hackathonName: m.hackathon?.name || 'Explore Connection',
        matchedUser: otherUser,
        teamId: m.teamId,
        createdAt: m.createdAt
      };
    });

    // Deduplicate by matchedUser.id if viewing ALL matches
    // This prevents the same person appearing multiple times if matched across different contexts
    if (!hackathonId) {
      const uniqueMatches: any[] = [];
      const seenUserIds = new Set();

      for (const match of formattedMatches) {
        if (!seenUserIds.has(match.matchedUser.id)) {
          seenUserIds.add(match.matchedUser.id);
          uniqueMatches.push(match);
        }
      }
      return res.json(uniqueMatches);
    }

    res.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches' });
  }
});

// GET /api/matches/:id
router.get('/matches/:id', requiredAuth, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.session.user.id;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        user1: { select: { id: true, name: true, image: true } },
        user2: { select: { id: true, name: true, image: true } },
        hackathon: { select: { name: true } },
        team: { include: { chats: { select: { id: true }, take: 1 } } }
      }
    });

    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    const isUser1 = match.user1Id === currentUserId;
    const isUser2 = match.user2Id === currentUserId;
    if (!isUser1 && !isUser2) return res.status(403).json({ message: 'Unauthorized' });

    const otherUser = isUser1 ? match.user2 : match.user1;
    
    // Find chat
    let chatId = match.team?.chats[0]?.id;
    if (!chatId) {
      const chat = await prisma.chat.findFirst({
        where: {
          type: 'DM',
          members: {
            every: {
              userId: { in: [match.user1Id, match.user2Id] }
            }
          }
        },
        select: { id: true }
      });
      chatId = chat?.id;
    }

    res.json({
      id: match.id,
      matchedUser: otherUser,
      hackathonName: match.hackathon?.name || 'Explore Connection',
      chatId,
      teamId: match.teamId
    });
  } catch (error) {
    console.error('Error fetching match details:', error);
    res.status(500).json({ message: 'Error fetching match details' });
  }
});

export default router;
