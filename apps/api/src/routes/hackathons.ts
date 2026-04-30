import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { auth } from '../auth';

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

// GET Swipe Deck (Debug Mode: Returns everyone)
router.get('/:id/swipe-deck', requiredAuth, async (req: any, res: Response) => {
  try {
    const { id: hackathonId } = req.params;
    const currentUserId = req.session.user.id;

    // 1. Get IDs of people the user has already swiped on for this hackathon
    const swipedRecords = await prisma.swipe.findMany({
      where: { senderId: currentUserId, hackathonId },
      select: { receiverId: true }
    });
    const swipedUserIds = swipedRecords.map((s: any) => s.receiverId);

    // 2. Get IDs of people who have already swiped RIGHT on current user (Globally OR for this hackathon)
    const receivedRightSwipes = await prisma.swipe.findMany({
      where: { 
        receiverId: currentUserId, 
        type: 'RIGHT',
        senderId: { notIn: [currentUserId, ...swipedUserIds] }
      },
      select: { senderId: true }
    });
    const potentialMatchIds = receivedRightSwipes.map((s: any) => s.senderId);

    // 3. Fetch prioritized users (People who liked you first - either globally or for this hackathon)
    const prioritizedUsers = await prisma.user.findMany({
      where: { id: { in: potentialMatchIds } },
      select: {
        id: true, name: true, image: true, bio: true, title: true,
        college: true, city: true, linkedinUrl: true, githubUrl: true,
        skills: { include: { skill: true } }
      }
    });

    // 4. Fetch regular users who are specifically interested in this hackathon
    const otherInterests = await prisma.hackathonInterest.findMany({
      where: { 
        hackathonId,
        userId: {
          notIn: [currentUserId, ...swipedUserIds, ...potentialMatchIds]
        }
      },
      include: {
        user: {
          select: {
            id: true, name: true, image: true, bio: true, title: true,
            college: true, city: true, linkedinUrl: true, githubUrl: true,
            skills: { include: { skill: true } }
          }
        }
      },
      take: 20 - prioritizedUsers.length
    });

    const users = [
      ...prioritizedUsers,
      ...otherInterests.map((i: any) => i.user)
    ];

    res.json(users);
  } catch (error) {
    console.error('Error fetching swipe deck:', error);
    res.status(500).json({ message: 'Error fetching swipe deck' });
  }
});

export default router;
