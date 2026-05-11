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

    // 3. Fetch users with pagination
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
      skip,
      take,
    });

    // 4. Fetch relationship data for these users to determine button states
    const userIds = users.map((u: any) => u.id);

    const [sentSwipes, receivedSwipes, matches] = await Promise.all([
      prisma.swipe.findMany({
        where: { senderId: userId, receiverId: { in: userIds }, hackathonId: null },
      }),
      prisma.swipe.findMany({
        where: { receiverId: userId, senderId: { in: userIds }, hackathonId: null, type: 'RIGHT' },
      }),
      prisma.match.findMany({
        where: {
          OR: [
            { user1Id: userId, user2Id: { in: userIds }, hackathonId: null },
            { user2Id: userId, user1Id: { in: userIds }, hackathonId: null },
          ]
        }
      })
    ]);

    const sentIds = new Set(sentSwipes.map((s: any) => s.receiverId));
    const receivedIds = new Set(receivedSwipes.map((s: any) => s.senderId));
    const matchedIds = new Set([
      ...matches.map((m: any) => m.user1Id === userId ? m.user2Id : m.user1Id)
    ]);

    // 5. Merge status into user objects
    const usersWithStatus = users.map((user: any) => ({
      ...user,
      isMatched: matchedIds.has(user.id),
      hasSentRequest: sentIds.has(user.id),
      receivedRequest: receivedIds.has(user.id),
    }));

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
