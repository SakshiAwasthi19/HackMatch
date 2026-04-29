import { prisma } from '../db';
export const lastActiveMiddleware = async (req, res, next) => {
    // If user is authenticated via Better Auth (req.user set elsewhere), update lastActiveAt
    if (req.user && req.user.id) {
        try {
            // Async fire and forget
            prisma.user.update({
                where: { id: req.user.id },
                data: { lastActiveAt: new Date() },
            }).catch((err) => console.error('Failed to update lastActiveAt:', err));
        }
        catch (e) {
            // Ignore
        }
    }
    next(); //passes request to next middleware
};
