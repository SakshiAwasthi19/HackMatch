import { Router } from 'express';
import { prisma } from '../db';
import { requireAdmin } from '../middlewares/requireAdmin';
const router = Router();
// Create Hackathon
router.post('/hackathons', requireAdmin, async (req, res) => {
    try {
        const { name, description, startDate, endDate, location, city, mode, eligibilityType, eligibleCollegesList, websiteUrl } = req.body;
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
                eligibleCollegesList: eligibleCollegesList || [],
                websiteUrl,
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
        const { id } = req.params;
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
        const { id } = req.params;
        await prisma.hackathon.delete({ where: { id } });
        res.json({ message: 'Hackathon deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting hackathon:', error);
        res.status(500).json({ message: 'Error deleting hackathon' });
    }
});
export default router;
