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
    const userId = req.user.id;
    const { name } = req.body;
    let avatarUrl;
    if (req.file) {
      avatarUrl = `/avatars/${req.file.filename}`;
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
    });
    res.json({ success: true, user: updated });
  } catch (err) {
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
