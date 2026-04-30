import { Router } from 'express';
import { prisma } from '../db';
import { auth } from '../auth';
const router = Router();
// Auth middleware (reused pattern)
const requiredAuth = async (req, res, next) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return res.status(401).json({ message: 'Unauthorized' });
    req.session = session;
    next();
};
// POST /api/swipes
router.post('/swipes', requiredAuth, async (req, res) => {
    try {
        const { receiverId, hackathonId, type } = req.body;
        const currentUserId = req.session.user.id;
        if (!receiverId || !type) {
            return res.status(400).json({ message: 'receiverId and type are required' });
        }
        if (type !== 'LEFT' && type !== 'RIGHT') {
            return res.status(400).json({ message: 'type must be LEFT or RIGHT' });
        }
        // Create or update swipe record
        await prisma.swipe.upsert({
            where: {
                senderId_receiverId_hackathonId: {
                    senderId: currentUserId,
                    receiverId,
                    hackathonId,
                },
            },
            update: {
                type,
            },
            create: {
                senderId: currentUserId,
                receiverId,
                hackathonId,
                type,
            },
        });
        // LEFT swipe — done
        if (type === 'LEFT') {
            return res.json({ matched: false });
        }
        // RIGHT swipe — create interest notification for receiver
        let hackathonName = 'a hackathon';
        if (hackathonId) {
            const hackathon = await prisma.hackathon.findUnique({
                where: { id: hackathonId },
                select: { name: true },
            });
            if (hackathon)
                hackathonName = hackathon.name;
        }
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: 'INTEREST',
                content: `Someone is interested in teaming up with you for ${hackathonName}!`,
                relatedId: hackathonId || null,
                actorId: currentUserId,
            },
        });
        // Check for reciprocal RIGHT swipe (Any hackathon or global)
        const reciprocal = await prisma.swipe.findFirst({
            where: {
                senderId: receiverId,
                receiverId: currentUserId,
                type: 'RIGHT',
            },
        });
        if (!reciprocal) {
            console.log(`[Swipe] No reciprocal RIGHT swipe found.`);
            return res.json({ matched: false });
        }
        console.log(`[Swipe] MUTUAL MATCH FOUND! Proceeding with match creation...`);
        // ── MUTUAL MATCH ── Atomic transaction ──────────
        const result = await prisma.$transaction(async (tx) => {
            // Check existing team memberships for this hackathon
            const senderTeam = await tx.teamMember.findFirst({
                where: { userId: currentUserId, team: { hackathonId } },
                include: { team: true },
            });
            const receiverTeam = await tx.teamMember.findFirst({
                where: { userId: receiverId, team: { hackathonId } },
                include: { team: true },
            });
            let team = null;
            let chat;
            if (!senderTeam && !receiverTeam) {
                // Case 1: Neither in a team → create new Team + GROUP Chat
                team = await tx.team.create({
                    data: { hackathonId },
                });
                await tx.teamMember.create({
                    data: { teamId: team.id, userId: currentUserId, role: 'LEADER' },
                });
                await tx.teamMember.create({
                    data: { teamId: team.id, userId: receiverId, role: 'MEMBER' },
                });
                chat = await tx.chat.create({
                    data: { type: 'GROUP', teamId: team.id },
                });
            }
            else {
                // Case 2: One or both already in a team → create DM Chat only
                chat = await tx.chat.create({
                    data: { type: 'DM' },
                });
            }
            // Add both users to chat
            await tx.chatMember.create({
                data: { chatId: chat.id, userId: currentUserId },
            });
            await tx.chatMember.create({
                data: { chatId: chat.id, userId: receiverId },
            });
            // Check if match already exists
            const existingMatch = await tx.match.findFirst({
                where: {
                    OR: [
                        { user1Id: currentUserId, user2Id: receiverId, hackathonId },
                        { user1Id: receiverId, user2Id: currentUserId, hackathonId },
                    ],
                },
            });
            let match;
            if (existingMatch) {
                console.log(`[Match] Match already exists, reusing: ${existingMatch.id}`);
                match = existingMatch;
            }
            else {
                console.log(`[Match] Creating new match record...`);
                match = await tx.match.create({
                    data: {
                        user1Id: currentUserId,
                        user2Id: receiverId,
                        hackathonId,
                        teamId: team?.id || undefined,
                    },
                });
            }
            // Create mutual match notifications for both users
            const currentUser = await tx.user.findUnique({
                where: { id: currentUserId },
                select: { name: true },
            });
            const receiverUser = await tx.user.findUnique({
                where: { id: receiverId },
                select: { name: true, image: true },
            });
            await tx.notification.create({
                data: {
                    userId: currentUserId,
                    type: 'MATCH',
                    content: `You matched with ${receiverUser?.name || 'someone'} for ${hackathonName}!`,
                    relatedId: match.id,
                    actorId: receiverId,
                },
            });
            await tx.notification.create({
                data: {
                    userId: receiverId,
                    type: 'MATCH',
                    content: `You matched with ${currentUser?.name || 'someone'} for ${hackathonName}!`,
                    relatedId: match.id,
                    actorId: currentUserId,
                },
            });
            return {
                matched: true,
                teamId: team?.id || null,
                chatId: chat.id,
                matchedUser: {
                    id: receiverId,
                    name: receiverUser?.name || '',
                    image: receiverUser?.image || null,
                },
                hackathonName,
            };
        });
        return res.json(result);
    }
    catch (error) {
        console.error('Error processing swipe:', error);
        res.status(500).json({ message: 'Error processing swipe' });
    }
});
// GET /api/matches
router.get('/matches', requiredAuth, async (req, res) => {
    try {
        const currentUserId = req.session.user.id;
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { user1Id: currentUserId },
                    { user2Id: currentUserId },
                ]
            },
            include: {
                user1: {
                    select: {
                        id: true, name: true, image: true, bio: true, title: true,
                        skills: { include: { skill: true } }
                    }
                },
                user2: {
                    select: {
                        id: true, name: true, image: true, bio: true, title: true,
                        skills: { include: { skill: true } }
                    }
                },
                hackathon: { select: { name: true } },
                team: { include: { chats: { take: 1 } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        const formattedMatches = matches.map((m) => {
            const otherUser = m.user1Id === currentUserId ? m.user2 : m.user1;
            // Find DM chat if no team chat
            return {
                id: m.id,
                hackathonName: m.hackathon?.name || 'Hackathon',
                matchedUser: otherUser,
                teamId: m.teamId,
                createdAt: m.createdAt
            };
        });
        res.json(formattedMatches);
    }
    catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ message: 'Error fetching matches' });
    }
});
// GET /api/matches/:id
router.get('/matches/:id', requiredAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.session.user.id;
        const match = await prisma.match.findUnique({
            where: { id },
            include: {
                user1: { select: { id: true, name: true, image: true } },
                user2: { select: { id: true, name: true, image: true } },
                hackathon: { select: { name: true } },
                team: { include: { chats: { select: { id: true }, take: 1 } } }
            }
        });
        if (!match)
            return res.status(404).json({ message: 'Match not found' });
        const isUser1 = match.user1Id === currentUserId;
        const isUser2 = match.user2Id === currentUserId;
        if (!isUser1 && !isUser2)
            return res.status(403).json({ message: 'Unauthorized' });
        const otherUser = isUser1 ? match.user2 : match.user1;
        // Find chat
        let chatId = match.team?.chats[0]?.id;
        if (!chatId) {
            const chat = await prisma.chat.findFirst({
                where: {
                    type: 'DM',
                    members: {
                        every: {
                            userId: { in: [match.user1Id, match.user2Id] }
                        }
                    }
                },
                select: { id: true }
            });
            chatId = chat?.id;
        }
        res.json({
            id: match.id,
            matchedUser: otherUser,
            hackathonName: match.hackathon?.name || 'Hackathon',
            chatId,
            teamId: match.teamId
        });
    }
    catch (error) {
        console.error('Error fetching match details:', error);
        res.status(500).json({ message: 'Error fetching match details' });
    }
});
// GET /api/swipes/deck (Global Deck)
router.get('/swipes/deck', requiredAuth, async (req, res) => {
    try {
        const currentUserId = req.session.user.id;
        // 1. Get IDs of people the user has already swiped on (Any context)
        const swipedRecords = await prisma.swipe.findMany({
            where: { senderId: currentUserId },
            select: { receiverId: true }
        });
        const swipedUserIds = swipedRecords.map((s) => s.receiverId);
        // 2. Get prioritized admirers
        const receivedRightSwipes = await prisma.swipe.findMany({
            where: {
                receiverId: currentUserId,
                type: 'RIGHT',
                senderId: { notIn: [currentUserId, ...swipedUserIds] }
            },
            select: { senderId: true }
        });
        const potentialMatchIds = receivedRightSwipes.map((s) => s.senderId);
        const prioritizedUsers = await prisma.user.findMany({
            where: { id: { in: potentialMatchIds } },
            select: {
                id: true, name: true, image: true, bio: true, title: true,
                college: true, city: true, githubUrl: true, linkedinUrl: true,
                skills: { include: { skill: true } }
            }
        });
        const otherUsers = await prisma.user.findMany({
            where: {
                id: { notIn: [currentUserId, ...swipedUserIds, ...potentialMatchIds] }
            },
            select: {
                id: true, name: true, image: true, bio: true, title: true,
                college: true, city: true, githubUrl: true, linkedinUrl: true,
                skills: { include: { skill: true } }
            },
            take: 20 - prioritizedUsers.length
        });
        res.json([...prioritizedUsers, ...otherUsers]);
    }
    catch (error) {
        console.error('Error fetching global swipe deck:', error);
        res.status(500).json({ message: 'Error fetching swipe deck' });
    }
});
export default router;
