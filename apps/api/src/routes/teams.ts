import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { auth } from '../auth.js';

const router = Router();

// Auth middleware
const requiredAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });
  req.session = session;
  next();
};

// ─────────────────────────────────────────────────────
// GET /api/teams/:teamId — Get team details
// ─────────────────────────────────────────────────────
router.get('/:teamId', requiredAuth, async (req: any, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId: string = req.session.user.id;

    // Verify user is a member
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        hackathon: { select: { id: true, name: true } },
        resources: {
          orderBy: { createdAt: 'desc' }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                college: true,
                city: true,
                skills: {
                  include: {
                    skill: true
                  }
                }
              },
            },
          },
        },
        chats: {
          where: { type: 'GROUP' },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!team) return res.status(404).json({ message: 'Team not found' });

    res.json({
      ...team,
      currentUserRole: membership.role,
      chatId: team.chats[0]?.id || null,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Error fetching team' });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/teams/:teamId/resources — Add a resource
// ─────────────────────────────────────────────────────
router.post('/:teamId/resources', requiredAuth, async (req: any, res: Response) => {
  try {
    const { teamId } = req.params;
    const { title, url, type } = req.body;
    const userId: string = req.session.user.id;

    if (!title || !url || !type) {
      return res.status(400).json({ message: 'Title, URL, and Type are required' });
    }

    // Verify user is a member
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Only team members can add resources' });
    }

    const resource = await prisma.projectResource.create({
      data: {
        teamId,
        title,
        url,
        type,
      }
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Error adding resource' });
  }
});

// ─────────────────────────────────────────────────────
// DELETE /api/teams/resources/:resourceId — Delete a resource
// ─────────────────────────────────────────────────────
router.delete('/resources/:resourceId', requiredAuth, async (req: any, res: Response) => {
  try {
    const { resourceId } = req.params;
    const userId: string = req.session.user.id;

    const resource = await prisma.projectResource.findUnique({
      where: { id: resourceId },
      include: { team: { include: { members: true } } }
    });

    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // Verify user is a member of the team
    const isMember = resource.team.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have permission to delete this resource' });
    }

    await prisma.projectResource.delete({
      where: { id: resourceId }
    });

    res.json({ message: 'Resource deleted' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Error deleting resource' });
  }
});

// ─────────────────────────────────────────────────────
// PUT /api/teams/:teamId/name — Set team name (Leader only)
// ─────────────────────────────────────────────────────
router.put('/:teamId/name', requiredAuth, async (req: any, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;
    const userId: string = req.session.user.id;

    // Validate name
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      return res.status(400).json({ message: 'Team name must be between 2 and 50 characters' });
    }

    // Verify user is the LEADER
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId, role: 'LEADER' },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Only the team leader can name the team' });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { name: trimmed },
    });

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error naming team:', error);
    res.status(500).json({ message: 'Error naming team' });
  }
});

// ─────────────────────────────────────────────────────
// PUT /api/teams/:teamId/tags — Set lookingFor tags (Leader only)
// ─────────────────────────────────────────────────────
router.put('/:teamId/tags', requiredAuth, async (req: any, res: Response) => {
  try {
    const { teamId } = req.params;
    const { tags } = req.body;
    const userId: string = req.session.user.id;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array of strings' });
    }

    // Verify user is the LEADER
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId, role: 'LEADER' },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Only the team leader can manage tags' });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { lookingFor: tags },
    });

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team tags:', error);
    res.status(500).json({ message: 'Error updating team tags' });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/teams/invites/:notificationId/accept — Accept team invite
// ─────────────────────────────────────────────────────
router.post('/invites/:notificationId/accept', requiredAuth, async (req: any, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId: string = req.session.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId || notification.type !== 'TEAM_INVITE') {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const teamId = notification.relatedId;
    if (!teamId) return res.status(400).json({ message: 'Invalid invitation: no teamId found' });

    // Verify team exists and get hackathonId
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { chats: { where: { type: 'GROUP' }, take: 1 } }
    });

    if (!team) return res.status(404).json({ message: 'Team no longer exists' });

    // Verify user not already in a team for this hackathon
    const existingMembership = await prisma.teamMember.findFirst({
      where: { userId, team: { hackathonId: team.hackathonId } }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'You are already in a team for this hackathon' });
    }

    // Atomic acceptance
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Add to Team
      await tx.teamMember.create({
        data: { teamId, userId, role: 'MEMBER' }
      });

      // 2. Add to Chat
      const chatId = team.chats[0]?.id;
      if (chatId) {
        await tx.chatMember.create({
          data: { chatId, userId }
        });
      }

      // 3. Create Match record (confirmed connection)
      await tx.match.create({
        data: {
          user1Id: notification.actorId!, // The leader who invited
          user2Id: userId,
          hackathonId: team.hackathonId,
          teamId: teamId
        }
      });

      // 4. Mark notification as read
      await tx.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      return { success: true, teamId };
    });

    res.json(result);
  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(500).json({ message: 'Error accepting invite' });
  }
});

export default router;
