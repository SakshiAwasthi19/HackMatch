import { Router, Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../db';
import { auth } from '../auth';
import { uploadAvatar } from '../lib/storage';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put('/', upload.single('avatar'), async (req: any, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
  
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;
    const { bio, college, city, linkedinUrl, githubUrl, skills } = req.body;
    
    let imageUrl = session.user.image;

    // Handle avatar upload if present
    if (req.file) {
      const filename = `avatars/${userId}-${Date.now()}.jpg`;
      imageUrl = await uploadAvatar(req.file.buffer, filename);
    }

    // Parse skills if they come as a string (JSON stringified array)
    const parsedSkills: string[] = typeof skills === 'string' ? JSON.parse(skills) : skills || [];

    // Update user profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        bio,
        college,
        city,
        linkedinUrl,
        githubUrl,
        image: imageUrl,
      },
    });

    // Handle Skills upsert
    if (parsedSkills.length > 0) {
      // 1. Create skills that don't exist
      await Promise.all(
        parsedSkills.map((skillName: string) =>
          prisma.skill.upsert({
            where: { name: skillName },
            update: {},
            create: { name: skillName },
          })
        )
      );

      // 2. Get all skill records
      const dbSkills = await prisma.skill.findMany({
        where: { name: { in: parsedSkills } },
      });

      // 3. Clear existing user skills and set new ones
      await prisma.userSkill.deleteMany({
        where: { userId },
      });

      await prisma.userSkill.createMany({
        data: dbSkills.map((s: { id: string }) => ({
          userId,
          skillId: s.id,
        })),
      });
    }

    res.json({ message: 'Profile updated successfully', image: imageUrl });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
