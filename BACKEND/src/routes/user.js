const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const prisma = require('../utils/db');
const { ensureAuth } = require('../middleware/auth');

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

module.exports = router;
