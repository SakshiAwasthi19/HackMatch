import { Router, Response } from 'express';
import { prisma } from '../db';
import { auth } from '../auth';

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
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                college: true,
                city: true,
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

export default router;
