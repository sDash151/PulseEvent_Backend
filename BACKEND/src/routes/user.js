const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const prisma = require('../utils/db');
const { ensureAuth } = require('../middleware/auth');
const { authenticateToken } = require('../middleware/auth');

// Set up cloudinary multer storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});
const upload = multer({ storage });

// Update user profile (name, avatar)
router.put('/profile', ensureAuth, upload.single('avatar'), async (req, res) => {
  try {
    console.log('🔔 Profile update called');
    const userId = req.user?.id;
    const { name } = req.body;
    let avatarUrl;
    if (req.file) {
      avatarUrl = req.file.path; // cloudinary URL
      console.log('✅ Uploaded avatar URL:', avatarUrl);
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatarUrl && { avatar: avatarUrl }),
      },
    });
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('❌ Cloudinary upload error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get current user profile
router.get('/profile', ensureAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all registrations and waiting list entries for the current user
router.get('/my-registrations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Get all registrations (approved)
    const registrations = await prisma.registration.findMany({
      where: { userId },
      include: {
        event: true,
        participants: true
      },
      orderBy: { createdAt: 'desc' }
    });
    // Get all waiting list entries (pending/rejected)
    const waitingList = await prisma.waitingList.findMany({
      where: { userId },
      include: {
        event: true
      },
      orderBy: { createdAt: 'desc' }
    });
    // Merge and format results
    const allApplications = [
      ...registrations.map(reg => ({
        id: reg.id,
        eventId: reg.eventId,
        eventTitle: reg.event.title,
        eventStartTime: reg.event.startTime,
        eventEndTime: reg.event.endTime,
        eventLocation: reg.event.location,
        status: 'approved',
        teamName: reg.teamName,
        paymentProof: null, // Always hide payment proof for all users
        appliedAt: reg.createdAt,
        participants: reg.participants,
        responses: reg.responses,
        whatsappGroupEnabled: reg.event.whatsappGroupEnabled,
        whatsappGroupLink: reg.event.whatsappGroupLink
      })),
      ...waitingList.map(wl => ({
        id: wl.id,
        eventId: wl.eventId,
        eventTitle: wl.event.title,
        eventStartTime: wl.event.startTime,
        eventEndTime: wl.event.endTime,
        eventLocation: wl.event.location,
        status: wl.status === 'pending' ? 'pending' : 'rejected',
        teamName: wl.teamName,
        paymentProof: null, // Always hide payment proof for all users
        appliedAt: wl.createdAt,
        participants: wl.participants,
        responses: wl.responses,
        whatsappGroupEnabled: null, // Hide WhatsApp info for pending/rejected
        whatsappGroupLink: null
      }))
    ];
    // Sort by appliedAt descending
    allApplications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    res.json({ applications: allApplications });
  } catch (err) {
    console.error('Error fetching my registrations:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

module.exports = router;
