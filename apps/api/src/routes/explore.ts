import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { auth } from '../auth.js';

const router = Router();

// Auth middleware (matching project pattern)
const requiredAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });
  req.session = session;
  next();
};

// GET /api/explore/swipe-deck (Professional Filtered Mode)
router.get('/swipe-deck', requiredAuth, async (req: any, res: Response) => {
  try {
    const currentUserId = req.session.user.id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Build the base WHERE clause
    const whereClause: any = {
      AND: [
        // FILTER 1 — Exclude self
        { id: { not: currentUserId } },

        // FILTER 2 — Exclude already swiped in Explore context
        {
          receivedSwipes: {
            none: {
              senderId: currentUserId,
              hackathonId: null,
            },
          },
        },

        // FILTER 3 — Exclude inactive users (7+ days)
        { lastActiveAt: { gte: sevenDaysAgo } },

        // FILTER 4 — Exclude mutually matched users in Explore context
        {
          NOT: {
            matchesAsUser1: {
              some: { user2Id: currentUserId, hackathonId: null },
            },
          },
        },
        {
          NOT: {
            matchesAsUser2: {
              some: { user1Id: currentUserId, hackathonId: null },
            },
          },
        },
      ],
    };

    // 2. Fetch users who swiped RIGHT on current user in Explore context (Prioritized)
    const prioritizedUsers = await prisma.user.findMany({
      where: {
        ...whereClause,
        sentSwipes: {
          some: {
            receiverId: currentUserId,
            hackathonId: null,
            type: 'RIGHT',
          },
        },
      },
      select: {
        id: true,
        name: true,
        college: true,
        city: true,
        bio: true,
        image: true,
        skills: { include: { skill: true } },
      },
    });

    const prioritizedIds = prioritizedUsers.map((u: any) => u.id);

    // 3. Fetch remaining users sorted by lastActiveAt DESC
    const otherUsers = await prisma.user.findMany({
      where: {
        ...whereClause,
        id: { notIn: prioritizedIds },
      },
      select: {
        id: true,
        name: true,
        college: true,
        city: true,
        bio: true,
        image: true,
        skills: { include: { skill: true } },
      },
      orderBy: { lastActiveAt: 'desc' },
      take: 20,
    });

    // 4. Format response
    const formatUser = (u: any) => ({
      id: u.id,
      name: u.name,
      college: u.college,
      city: u.city,
      bio: u.bio,
      image: u.image,
      skills: u.skills.map((s: any) => ({ id: s.skill.id, name: s.skill.name })),
      hasTeam: false,
      teamName: null,
      lookingFor: [],
      alreadySwiped: false,
    });

    const finalUsers = [...prioritizedUsers.map(formatUser), ...otherUsers.map(formatUser)];

    res.json(finalUsers);
  } catch (error) {
    console.error('Error fetching explore swipe deck:', error);
    res.status(500).json({ message: 'Error fetching explore swipe deck' });
  }
});

// GET /api/explore/skills
router.get('/skills', requiredAuth, async (req: any, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching skills' });
  }
});

export default router;
