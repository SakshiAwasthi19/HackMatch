import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { auth } from '../auth';

const router = Router();

// Middleware to inject session
const optionalAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.getSession({ headers: req.headers });
  req.session = session;
  next();
};

const requiredAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.getSession({ headers: req.headers });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });
  req.session = session;
  next();
};

// List Hackathons (Sorted by nearest start date)
router.get('/', async (req: Request, res: Response) => {
  try {
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
      },
    });
    res.json(hackathons);
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    res.status(500).json({ message: 'Error fetching hackathons' });
  }
});

// Get Single Hackathon
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      },
    });
    
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    res.json(hackathon);
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    res.status(500).json({ message: 'Error fetching hackathon' });
  }
});

// Mark Interest
router.post('/:id/interest', requiredAuth, async (req: any, res: Response) => {
  try {
    const { id: hackathonId } = req.params;
    const userId = req.session.user.id;

    const interest = await prisma.hackathonInterest.upsert({
      where: {
        userId_hackathonId: { userId, hackathonId },
      },
      update: {},
      create: { userId, hackathonId },
    });

    res.json(interest);
  } catch (error) {
    console.error('Error marking interest:', error);
    res.status(500).json({ message: 'Error marking interest' });
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

export default router;
