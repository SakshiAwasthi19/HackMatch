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

// GET /api/explore/swipe-deck
router.get('/swipe-deck', requiredAuth, async (req: any, res: Response) => {
  try {
    const userId = req.session.user.id;

    // 1. Get IDs of users already swiped on by this user in Explore mode (hackathonId: null)
    const swipedRecords = await prisma.swipe.findMany({
      where: {
        senderId: userId,
        hackathonId: null,
      },
      select: {
        receiverId: true,
      },
    });

    const excludedIds = [userId, ...swipedRecords.map((s: any) => s.receiverId)];

    // 2. Fetch eligible users
    // Criteria: Active in last 30 days, not the current user, not already swiped
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let users = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        lastActiveAt: { gte: thirtyDaysAgo },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      take: 20,
    });

    // Fallback: If no users active in last 30 days, show all users not yet swiped
    if (users.length === 0) {
      users = await prisma.user.findMany({
        where: {
          id: { notIn: excludedIds },
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
        take: 20,
      });
    }

    // 3. Get incoming swipes from these users to identify "Collaborate" opportunities
    const incomingSwipes = await prisma.swipe.findMany({
      where: {
        receiverId: userId,
        senderId: { in: users.map((u: any) => u.id) },
        type: 'RIGHT',
      },
      select: {
        senderId: true,
      }
    });

    const incomingSenderIds = new Set(incomingSwipes.map((s: any) => s.senderId));

    const usersWithStatus = users.map((user: any) => ({
      ...user,
      receivedRequest: incomingSenderIds.has(user.id),
    }));

    res.json(usersWithStatus);
  } catch (err) {
    console.error('Error fetching explore deck:', err);
    res.status(500).json({ message: 'Error fetching explore deck' });
  }
});

export default router;
