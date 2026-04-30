import { Router } from 'express';
import { prisma } from '../db';
import { requireAdmin } from '../middlewares/requireAdmin';
import multer from 'multer';
import { uploadAvatar as uploadToStorage } from '../lib/storage';
import { auth } from '../auth';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
// Create Hackathon
router.post('/hackathons', requireAdmin, upload.single('poster'), async (req, res) => {
    try {
        const { name, description, startDate, endDate, location, city, mode, eligibilityType, eligibleCollegesList, websiteUrl, imageUrl, tags } = req.body;
        let posterUrl = imageUrl || null;
        let parsedTags = [];
        let parsedColleges = [];
        if (typeof tags === 'string') {
            try {
                parsedTags = JSON.parse(tags);
            }
            catch (e) {
                parsedTags = [tags];
            }
        }
        else if (Array.isArray(tags)) {
            parsedTags = tags;
        }
        if (typeof eligibleCollegesList === 'string') {
            try {
                parsedColleges = JSON.parse(eligibleCollegesList);
            }
            catch (e) {
                parsedColleges = eligibleCollegesList.split(',').map((c) => c.trim()).filter(Boolean);
            }
        }
        else if (Array.isArray(eligibleCollegesList)) {
            parsedColleges = eligibleCollegesList;
        }
        if (req.file) {
            try {
                const filename = `posters/${Date.now()}-${req.file.originalname}`;
                posterUrl = await uploadToStorage(req.file.buffer, filename);
            }
            catch (uploadErr) {
                console.error('Poster upload failed:', uploadErr);
            }
        }
        const hackathon = await prisma.hackathon.create({
            data: {
                name,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location,
                city,
                mode,
                eligibilityType,
                eligibleCollegesList: parsedColleges,
                websiteUrl,
                imageUrl: posterUrl,
                tags: parsedTags,
            },
        });
        res.status(201).json(hackathon);
    }
    catch (error) {
        console.error('Error creating hackathon:', error);
        res.status(500).json({ message: 'Error creating hackathon' });
    }
});
// Update Hackathon
router.put('/hackathons/:id', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate)
            updateData.endDate = new Date(updateData.endDate);
        const hackathon = await prisma.hackathon.update({
            where: { id },
            data: updateData,
        });
        res.json(hackathon);
    }
    catch (error) {
        console.error('Error updating hackathon:', error);
        res.status(500).json({ message: 'Error updating hackathon' });
    }
});
// Delete Hackathon
router.delete('/hackathons/:id', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.hackathon.delete({ where: { id } });
        res.json({ message: 'Hackathon deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting hackathon:', error);
        res.status(500).json({ message: 'Error deleting hackathon' });
    }
});
// List All Users (Admin)
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                skills: {
                    include: {
                        skill: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});
// Delete User (Admin)
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});
// --- Host Request Workflows ---
// Submit Host Request (User)
router.post('/host-requests', async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session)
            return res.status(401).json({ message: 'Unauthorized' });
        const userId = session.user.id;
        const { reason } = req.body;
        const request = await prisma.hostRequest.create({
            data: {
                userId,
                reason,
                status: 'PENDING'
            }
        });
        // Notify existing admins (Optional, but good practice)
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'ADMIN_REQUEST',
                    content: `${session.user.name} requested to be a host.`,
                    relatedId: request.id
                }
            });
        }
        res.status(201).json(request);
    }
    catch (error) {
        console.error('Error submitting host request:', error);
        res.status(500).json({ message: 'Error submitting host request' });
    }
});
// Check My Host Request Status (User)
router.get('/my-request', async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session)
            return res.status(401).json({ message: 'Unauthorized' });
        const request = await prisma.hostRequest.findFirst({
            where: { userId: session.user.id, status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(request || { status: 'NONE' });
    }
    catch (error) {
        console.error('Error checking host request:', error);
        res.status(500).json({ message: 'Error checking host request' });
    }
});
// List Host Requests (Admin)
router.get('/host-requests', requireAdmin, async (req, res) => {
    try {
        const requests = await prisma.hostRequest.findMany({
            include: {
                user: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        console.error('Error fetching host requests:', error);
        res.status(500).json({ message: 'Error fetching host requests' });
    }
});
// Handle Host Request (Admin)
router.put('/host-requests/:id', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // APPROVED or REJECTED
        const request = await prisma.hostRequest.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!request)
            return res.status(404).json({ message: 'Request not found' });
        const updatedRequest = await prisma.hostRequest.update({
            where: { id },
            data: { status }
        });
        if (status === 'APPROVED') {
            await prisma.user.update({
                where: { id: request.userId },
                data: { role: 'ADMIN' }
            });
            // Notify user
            await prisma.notification.create({
                data: {
                    userId: request.userId,
                    type: 'ADMIN_REQUEST',
                    content: 'Your request to be a host has been approved! You now have admin access.'
                }
            });
        }
        else {
            // Notify user of rejection
            await prisma.notification.create({
                data: {
                    userId: request.userId,
                    type: 'ADMIN_REQUEST',
                    content: 'Your request to be a host has been declined.'
                }
            });
        }
        res.json(updatedRequest);
    }
    catch (error) {
        console.error('Error handling host request:', error);
        res.status(500).json({ message: 'Error handling host request' });
    }
});
export default router;
