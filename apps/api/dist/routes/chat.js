import { Router } from 'express';
import { prisma } from '../db.js';
import { pushNotification } from '../lib/realtime.js';
import { auth } from '../auth.js';
const router = Router();
// Auth middleware
const requiredAuth = async (req, res, next) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session)
        return res.status(401).json({ message: 'Unauthorized' });
    req.user = session.user; // Set req.user for downstream use
    next();
};
// Middleware to ensure the user is a member of the chat
const ensureChatMember = async (req, res, next) => {
    const { chatId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const member = await prisma.chatMember.findUnique({
            where: {
                chatId_userId: {
                    chatId,
                    userId,
                },
            },
        });
        if (!member) {
            return res.status(403).json({ error: 'Forbidden: You are not a member of this chat' });
        }
        next();
    }
    catch (error) {
        console.error('Error in ensureChatMember:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
// GET /api/chat - List all chats for the current user
router.get('/', requiredAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const chats = await prisma.chat.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        hackathon: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return res.json(chats);
    }
    catch (error) {
        console.error('Error fetching user chats:', error);
        return res.status(500).json({ error: 'Failed to fetch chats' });
    }
});
router.use('/:chatId', requiredAuth, ensureChatMember);
// GET /api/chat/:chatId/messages
router.get('/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;
    const { cursor } = req.query;
    try {
        const take = 30;
        const skip = cursor ? 1 : 0;
        const cursorObj = cursor ? { id: cursor } : undefined;
        const messages = await prisma.chatMessage.findMany({
            where: { chatId },
            take,
            skip,
            cursor: cursorObj,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });
        return res.json(messages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// POST /api/chat/:chatId/messages
router.post('/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required and must be a string' });
    }
    try {
        const message = await prisma.chatMessage.create({
            data: {
                chatId,
                senderId: userId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });
        // Broadcast the message using Supabase Realtime
        await pushNotification(`chat:${chatId}`, 'new_message', message);
        return res.status(201).json(message);
    }
    catch (error) {
        console.error('Error posting message:', error);
        return res.status(500).json({ error: 'Failed to post message' });
    }
});
export default router;
