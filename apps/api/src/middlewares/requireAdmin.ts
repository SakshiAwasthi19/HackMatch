import { Response, NextFunction } from 'express';
import { auth } from '../auth';

export const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: req.headers
  });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // session.user.role comes from Better Auth which we linked to Prisma
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  
  req.session = session;
  next();
};
