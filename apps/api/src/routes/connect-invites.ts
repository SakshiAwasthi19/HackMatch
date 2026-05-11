import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { auth } from '../auth.js';
import { pushNotification } from '../lib/realtime.js';

const router = Router();

// Auth middleware
const requiredAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });
  req.session = session;
  next();
};

// POST /api/connect-invites
router.post('/', requiredAuth, async (req: any, res: Response) => {
  try {
    const { receiverId, hackathonId, message } = req.body;
    const senderId = req.session.user.id;

    if (!receiverId || !hackathonId || !message) {
      return res.status(400).json({ message: 'receiverId, hackathonId, and message are required' });
    }

    // 1. Validate sender has marked interest or registered for that hackathonId
    const hasInterest = await prisma.hackathonInterest.findUnique({
      where: { userId_hackathonId: { userId: senderId, hackathonId } }
    });

    const hasRegistration = await prisma.hackathonRegistration.findUnique({
      where: { userId_hackathonId: { userId: senderId, hackathonId } }
    });

    if (!hasInterest && !hasRegistration) {
      return res.status(403).json({ message: 'You must be interested or registered for this hackathon to send an invite' });
    }

    // 2. Fetch sender info and hackathon title for notification
    const [sender, hackathon, senderTeam] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId }, select: { name: true, image: true } }),
      prisma.hackathon.findUnique({ where: { id: hackathonId }, select: { name: true } }),
      prisma.teamMember.findFirst({
        where: { userId: senderId, team: { hackathonId } },
        include: { team: true }
      })
    ]);

    if (!sender || !hackathon) {
      return res.status(404).json({ message: 'Sender or Hackathon not found' });
    }

    // 3. Create Notification record for the receiver
    const notificationContent = JSON.stringify({
      senderName: sender.name,
      senderAvatar: sender.image,
      hackathonTitle: hackathon.name,
      message,
      teamName: senderTeam?.team.name || null
    });

    const notification = await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CONNECT_INVITE',
        content: notificationContent,
        relatedId: hackathonId,
        actorId: senderId,
      } as any
    });

    // 4. Broadcast via pushNotification
    await pushNotification(`notifications:${receiverId}`, 'new_notification', notification);

    res.json({ success: true });
  } catch (err) {
    console.error('Error sending connect invite:', err);
    res.status(500).json({ message: 'Error sending connect invite' });
  }
});

export default router;
