const express = require('express');
const router = express.Router();
const multer = require('multer');
const prisma = require('../utils/db');

// Configure multer for avatar uploads
const upload = multer({ dest: 'public/avatars/' });
const { ensureAuth } = require('../middleware/auth');

// Update user profile (name, avatar)
router.put('/profile', ensureAuth, upload.single('avatar'), async (req, res) => {
  try {
    console.log('--- Profile Update Request ---');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const userId = req.user && req.user.id;
    if (!userId) {
      console.error('No userId found in req.user');
      return res.status(401).json({ error: 'Unauthorized: No userId' });
    }
    const { name } = req.body;
    let avatarUrl;
    if (req.file) {
      avatarUrl = `/avatars/${req.file.filename}`;
      console.log('Avatar file saved at:', avatarUrl);
    }
    const updateData = {
      name,
      ...(avatarUrl && { avatar: avatarUrl }),
    };
    console.log('Update data:', updateData);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    console.log('User updated:', updated);
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(400).json({ error: err.message });
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
