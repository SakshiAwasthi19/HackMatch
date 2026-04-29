import { Router, Response } from 'express';
import { prisma } from '../db';
import { auth } from '../auth';

const router = Router();

// Auth middleware (reused pattern)
const requiredAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });
  req.session = session;
  next();
};

// ─────────────────────────────────────────────────────
// GET /api/hackathons/:hackathonId/swipe-deck
// ─────────────────────────────────────────────────────
router.get('/hackathons/:hackathonId/swipe-deck', requiredAuth, async (req: any, res: Response) => {
  try {
    const { hackathonId } = req.params;
    const currentUserId: string = req.session.user.id;

    // 1. Fetch hackathon for eligibility rules
    const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    // 2. Find full teams (4+ members) for this hackathon
    const teamsWithCounts = await prisma.team.findMany({
      where: { hackathonId },
      include: { _count: { select: { members: true } } },
    });
    const fullTeamIds = teamsWithCounts
      .filter((t: any) => t._count.members >= 4)
      .map((t: any) => t.id);

    // 3. Get userIds in full teams
    let fullTeamUserIds: string[] = [];
    if (fullTeamIds.length > 0) {
      const members = await prisma.teamMember.findMany({
        where: { teamId: { in: fullTeamIds } },
        select: { userId: true },
      });
      fullTeamUserIds = members.map((m: { userId: string }) => m.userId);
    }

    // 4. Build WHERE clause
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const whereClause: any = {
      id: { notIn: [...fullTeamUserIds, currentUserId] },
      lastActiveAt: { gte: sevenDaysAgo },
      // Exclude users already swiped on by current user for this hackathon
      receivedSwipes: {
        none: {
          senderId: currentUserId,
          hackathonId,
        },
      },
    };

    // 5. College eligibility filter
    if (hackathon.eligibilityType === 'COLLEGE_SPECIFIC' && hackathon.eligibleCollegesList.length > 0) {
      whereClause.college = { in: hackathon.eligibleCollegesList };
    }

    // 6. Query users
    const users = await prisma.user.findMany({
      where: whereClause,
      take: 20,
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        college: true,
        city: true,
        linkedinUrl: true,
        githubUrl: true,
        skills: {
          include: { skill: true },
        },
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching swipe deck:', error);
    res.status(500).json({ message: 'Error fetching swipe deck' });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/swipes
// ─────────────────────────────────────────────────────
router.post('/swipes', requiredAuth, async (req: any, res: Response) => {
  try {
    const { receiverId, hackathonId, type } = req.body;
    const currentUserId: string = req.session.user.id;

    if (!receiverId || !hackathonId || !type) {
      return res.status(400).json({ message: 'receiverId, hackathonId, and type are required' });
    }

    if (type !== 'LEFT' && type !== 'RIGHT') {
      return res.status(400).json({ message: 'type must be LEFT or RIGHT' });
    }

    // Create swipe record
    await prisma.swipe.create({
      data: {
        senderId: currentUserId,
        receiverId,
        hackathonId,
        type,
      },
    });

    // LEFT swipe — done
    if (type === 'LEFT') {
      return res.json({ matched: false });
    }

    // RIGHT swipe — create interest notification for receiver
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'INTEREST',
        content: `Someone is interested in teaming up with you for ${hackathon?.name || 'a hackathon'}!`,
        relatedId: hackathonId,
      },
    });

    // Check for reciprocal RIGHT swipe
    const reciprocal = await prisma.swipe.findFirst({
      where: {
        senderId: receiverId,
        receiverId: currentUserId,
        hackathonId,
        type: 'RIGHT',
      },
    });

    if (!reciprocal) {
      return res.json({ matched: false });
    }

    // ── MUTUAL MATCH ── Atomic transaction ──────────
    const result = await prisma.$transaction(async (tx: any) => {
      // Check existing team memberships for this hackathon
      const senderTeam = await tx.teamMember.findFirst({
        where: { userId: currentUserId, team: { hackathonId } },
        include: { team: true },
      });

      const receiverTeam = await tx.teamMember.findFirst({
        where: { userId: receiverId, team: { hackathonId } },
        include: { team: true },
      });

      let team: any = null;
      let chat: any;

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
      } else {
        // Case 2: One or both already in a team → create DM Chat only
        chat = await tx.chat.create({
          data: { type: 'DM' },
        });
      }

      // Add both users to chat
      await tx.chatMember.create({
        data: { chatId: chat.id, userId: currentUserId },
      });

      await tx.chatMember.create({
        data: { chatId: chat.id, userId: receiverId },
      });

      // Create match record
      const match = await tx.match.create({
        data: {
          user1Id: currentUserId,
          user2Id: receiverId,
          hackathonId,
          teamId: team?.id || undefined,
        },
      });

      // Create mutual match notifications for both users
      const currentUser = await tx.user.findUnique({
        where: { id: currentUserId },
        select: { name: true },
      });
      const receiverUser = await tx.user.findUnique({
        where: { id: receiverId },
        select: { name: true, image: true },
      });

      await tx.notification.create({
        data: {
          userId: currentUserId,
          type: 'MATCH',
          content: `You matched with ${receiverUser?.name || 'someone'} for ${hackathon?.name || 'a hackathon'}!`,
          relatedId: match.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: receiverId,
          type: 'MATCH',
          content: `You matched with ${currentUser?.name || 'someone'} for ${hackathon?.name || 'a hackathon'}!`,
          relatedId: match.id,
        },
      });

      return {
        matched: true,
        teamId: team?.id || null,
        chatId: chat.id,
        matchedUser: {
          id: receiverId,
          name: receiverUser?.name || '',
          image: receiverUser?.image || null,
        },
      };
    });

    return res.json(result);
  } catch (error: any) {
    // Handle unique constraint violation (already swiped)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'You have already swiped on this user for this hackathon' });
    }
    console.error('Error processing swipe:', error);
    res.status(500).json({ message: 'Error processing swipe' });
  }
});

export default router;
