import { Router, Response } from 'express';
import { prisma } from '../db';
import { auth } from '../auth';

const router = Router();

const requiredAuth = async (req: any, res: Response, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });
  req.session = session;
  next();
};

router.get('/', requiredAuth, async (req: any, res: Response) => {
  try {
    const userId = req.session.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Fetch actor details for relevant notifications
    const actorIds = (notifications as any[])
      .map((n: any) => n.actorId)
      .filter((id): id is string => !!id);

    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: {
        id: true,
        name: true,
        image: true,
        title: true,
        bio: true,
        college: true,
        city: true,
        linkedinUrl: true,
        githubUrl: true,
        skills: { include: { skill: true } }
      }
    });

    const actorsMap = new Map(actors.map((a: any) => [a.id, a]));

    const enrichedNotifications = (notifications as any[]).map((n: any) => ({
      ...n,
      actor: n.actorId ? actorsMap.get(n.actorId) : null
    }));

    res.json(enrichedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

router.post('/:id/read', requiredAuth, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

export default router;
