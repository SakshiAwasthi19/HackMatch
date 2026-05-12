import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { auth } from '../auth.js';

const router = Router();

// Middleware to inject session
const optionalAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers });
  req.session = session;
  next();
};

const requiredAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });
  req.session = session;
  next();
};

// List Hackathons (Sorted by nearest start date)
router.get('/', async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;

    const hackathons = await prisma.hackathon.findMany({
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: {
            interests: true,
            registrations: true,
          },
        },
        interests: userId ? {
          where: { userId },
          select: { id: true }
        } : false
      },
    });

    const hackathonsWithStatus = hackathons.map((h: any) => ({
      ...h,
      isInterested: h.interests?.length > 0
    }));

    res.json(hackathonsWithStatus);
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    res.status(500).json({ message: 'Error fetching hackathons' });
  }
});

// GET /api/hackathons/my-active
// Returns hackathons the user is interested in or registered for, and are still active
router.get('/my-active', requiredAuth, async (req: any, res: Response) => {
  try {
    const userId = req.session.user.id;
    const now = new Date();

    const hackathons = await prisma.hackathon.findMany({
      where: {
        endDate: { gte: now },
        OR: [
          { interests: { some: { userId } } },
          { registrations: { some: { userId } } }
        ]
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true
      },
      orderBy: { startDate: 'asc' }
    });

    res.json(hackathons);
  } catch (error) {
    console.error('Error fetching my active hackathons:', error);
    res.status(500).json({ message: 'Error fetching my active hackathons' });
  }
});

// Get Single Hackathon
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;

    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            interests: true,
            registrations: true,
            teams: true,
          },
        },
        interests: userId ? {
          where: { userId },
          select: { id: true }
        } : false
      },
    });
    
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    const hackathonWithStatus = {
      ...hackathon,
      isInterested: (hackathon as any).interests?.length > 0
    };

    res.json(hackathonWithStatus);
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    res.status(500).json({ message: 'Error fetching hackathon' });
  }
});

// Toggle Interest
router.post('/:id/interest', requiredAuth, async (req: any, res: Response) => {
  try {
    const { id: hackathonId } = req.params;
    const userId = req.session.user.id;

    console.log(`[Interest] Toggling interest for user ${userId} on hackathon ${hackathonId}`);

    const existing = await prisma.hackathonInterest.findUnique({
      where: { userId_hackathonId: { userId, hackathonId } }
    });

    if (existing) {
      await prisma.hackathonInterest.delete({
        where: { id: existing.id }
      });
      console.log(`[Interest] Removed interest`);
      return res.json({ interested: false });
    } else {
      const created = await prisma.hackathonInterest.create({
        data: { userId, hackathonId }
      });
      console.log(`[Interest] Created interest`);
      return res.json({ interested: true, ...created });
    }
  } catch (error) {
    console.error('Error toggling interest:', error);
    res.status(500).json({ message: 'Error toggling interest' });
  }
});

// Register
router.post('/:id/register', requiredAuth, async (req: any, res: Response) => {
  try {
    const { id: hackathonId } = req.params;
    const userId = req.session.user.id;

    const registration = await prisma.hackathonRegistration.upsert({
      where: {
        userId_hackathonId: { userId, hackathonId },
      },
      update: {},
      create: { userId, hackathonId },
    });

    res.json(registration);
  } catch (error) {
    console.error('Error registering for hackathon:', error);
    res.status(500).json({ message: 'Error registering for hackathon' });
  }
});

// GET Swipe Deck (Professional Filtered Mode)
router.get('/:id/swipe-deck', requiredAuth, async (req: any, res: Response) => {
  try {
    const { id: hackathonId } = req.params;
    const currentUserId = req.session.user.id;

    // 1. Fetch hackathon details for filtering (eligibility, maxTeamSize)
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        eligibilityType: true,
        eligibleCollegesList: true,
        maxTeamSize: true,
      },
    });

    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    // 1.5 Fetch full team IDs for this hackathon
    const teamsWithCounts = await prisma.team.findMany({
      where: { hackathonId },
      select: {
        id: true,
        _count: { select: { members: true } }
      }
    });
    const fullTeamIds = teamsWithCounts
      .filter(t => t._count.members >= hackathon.maxTeamSize)
      .map(t => t.id);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 2. Build the complex WHERE clause
    const whereClause: any = {
      AND: [
        // FILTER 1 — Exclude self
        { id: { not: currentUserId } },

        // FILTER 2 — Exclude already swiped (any direction)
        {
          receivedSwipes: {
            none: {
              senderId: currentUserId,
              hackathonId: hackathonId,
            },
          },
        },

        // FILTER 3 — Exclude inactive users (7+ days)
        { lastActiveAt: { gte: sevenDaysAgo } },

        // FILTER 4 — Exclude users in a FULL team for this hackathon
        {
          teamMemberships: {
            none: {
              teamId: { in: fullTeamIds },
            },
          },
        },

        // FILTER 5 — Only show users who marked interest in this hackathon
        {
          hackathonInterests: {
            some: {
              hackathonId: hackathonId,
            },
          },
        },

        // FILTER 7 — Exclude mutually matched users
        {
          NOT: {
            matchesAsUser1: {
              some: {
                user2Id: currentUserId,
                hackathonId: hackathonId,
              },
            },
          },
        },
        {
          NOT: {
            matchesAsUser2: {
              some: {
                user1Id: currentUserId,
                hackathonId: hackathonId,
              },
            },
          },
        },
      ],
    };

    // FILTER 6 — College eligibility
    if (hackathon.eligibilityType === 'COLLEGE_SPECIFIC') {
      whereClause.AND.push({
        college: {
          in: hackathon.eligibleCollegesList,
        },
      });
    }

    // 3. Fetch users who swiped RIGHT on current user (Prioritized Array)
    const prioritizedUsers = await prisma.user.findMany({
      where: {
        ...whereClause,
        sentSwipes: {
          some: {
            receiverId: currentUserId,
            hackathonId: hackathonId,
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
        teamMemberships: {
          where: { team: { hackathonId } },
          include: { team: true },
        },
      },
    });

    const prioritizedIds = prioritizedUsers.map((u: any) => u.id);

    // 4. Fetch remaining users
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
        teamMemberships: {
          where: { team: { hackathonId } },
          include: { team: true },
        },
      },
      take: 40 - prioritizedUsers.length,
    });

    // 5. Format response
    const formatUser = (u: any) => {
      const membership = u.teamMemberships[0];
      return {
        id: u.id,
        name: u.name,
        college: u.college,
        city: u.city,
        bio: u.bio,
        image: u.image,
        skills: u.skills.map((s: any) => ({ id: s.skill.id, name: s.skill.name })),
        hasTeam: !!membership,
        teamName: membership?.team?.name || null,
        lookingFor: membership?.team?.lookingFor || [],
        alreadySwiped: false,
      };
    };

    const finalUsers = [...prioritizedUsers.map(formatUser), ...otherUsers.map(formatUser)];

    res.json(finalUsers);
  } catch (error) {
    console.error('Error fetching hackathon swipe deck:', error);
    res.status(500).json({ message: 'Error fetching swipe deck' });
  }
});

export default router;
