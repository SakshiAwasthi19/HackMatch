import { Router } from 'express';
import { prisma } from '../db.js';
import { auth } from '../auth.js';
const router = Router();
// Auth middleware (matching project pattern)
const requiredAuth = async (req, res, next) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return res.status(401).json({ message: 'Unauthorized' });
    req.session = session;
    next();
};
// GET /api/explore/swipe-deck
router.get('/swipe-deck', requiredAuth, async (req, res) => {
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
        const excludedIds = [userId, ...swipedRecords.map((s) => s.receiverId)];
        // 2. Fetch eligible users
        // Criteria: Active in last 7 days, not the current user, not already swiped
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const users = await prisma.user.findMany({
            where: {
                id: { notIn: excludedIds },
                lastActiveAt: { gte: sevenDaysAgo },
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
        res.json(users);
    }
    catch (err) {
        console.error('Error fetching explore deck:', err);
        res.status(500).json({ message: 'Error fetching explore deck' });
    }
});
export default router;
