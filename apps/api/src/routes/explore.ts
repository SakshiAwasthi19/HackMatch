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
    const { skill, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // 1. Define base filter: Not the current user + active in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const where: any = {
      id: { not: userId },
      lastActiveAt: { gte: sevenDaysAgo },
    };

    // 2. Add skill filter if provided
    if (skill) {
      where.skills = {
        some: {
          skill: {
            name: { equals: skill as string, mode: 'insensitive' }
          }
        }
      };
    }

    // 3. Find IDs of users who have swiped RIGHT on us but we haven't swiped back
    const potentialMatchSwipes = await prisma.swipe.findMany({
      where: {
        receiverId: userId,
        type: 'RIGHT',
        hackathonId: null,
        sender: {
          NOT: {
            receivedSwipes: {
              some: {
                senderId: userId,
                hackathonId: null
              }
            }
          }
        }
      },
      select: { senderId: true }
    });
    const prioritizedIds = potentialMatchSwipes.map(s => s.senderId);

    // 4. Fetch users with pagination
    // We fetch a bit more than 'take' to ensure we can sort and still have enough
    const users = await prisma.user.findMany({
      where,
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { lastActiveAt: 'desc' },
      // Pagination is tricky with prioritization. 
      // For now, we'll apply it after fetching if the total count is small, 
      // or just rely on the fact that these users are likely active.
      skip,
      take,
    });

    // 5. Fetch relationship data for these users to determine button states
    const userIds = users.map((u: any) => u.id);

    const [sentSwipes, receivedSwipes, matches] = await Promise.all([
      prisma.swipe.findMany({
        where: { senderId: userId, receiverId: { in: userIds }, hackathonId: null, type: 'RIGHT' },
      }),
      prisma.swipe.findMany({
        where: { receiverId: userId, senderId: { in: userIds }, hackathonId: null, type: 'RIGHT' },
      }),
      prisma.match.findMany({
        where: {
          OR: [
            { user1Id: userId, user2Id: { in: userIds } },
            { user2Id: userId, user1Id: { in: userIds } },
          ]
        }
      })
    ]);

    const sentIds = new Set(sentSwipes.map((s: any) => s.receiverId));
    const receivedIds = new Set(receivedSwipes.map((s: any) => s.senderId));
    const matchedIds = new Set([
      ...matches.map((m: any) => m.user1Id === userId ? m.user2Id : m.user1Id)
    ]);

    // 6. Merge status and Sort by prioritization
    const usersWithStatus = users.map((user: any) => ({
      ...user,
      isMatched: matchedIds.has(user.id),
      hasSentRequest: sentIds.has(user.id),
      receivedRequest: receivedIds.has(user.id),
      isPrioritized: prioritizedIds.includes(user.id)
    }));

    // Sort: Prioritized users first, then by lastActiveAt (which they already are from the query)
    usersWithStatus.sort((a, b) => {
      if (a.isPrioritized && !b.isPrioritized) return -1;
      if (!a.isPrioritized && b.isPrioritized) return 1;
      return 0;
    });

    res.json(usersWithStatus);
  } catch (err) {
    console.error('Error fetching explore deck:', err);
    res.status(500).json({ message: 'Error fetching explore deck' });
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
