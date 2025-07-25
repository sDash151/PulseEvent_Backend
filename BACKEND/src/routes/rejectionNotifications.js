const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../utils/db');

// Get unread rejection notifications for a user
router.get('/rejection-notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.rejectionNotification.findMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching rejection notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark a rejection notification as read
router.patch('/rejection-notifications/:id/read', authenticateToken, async (req, res) => {
  const notificationId = parseInt(req.params.id);
  if (isNaN(notificationId)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }
  try {
    const notification = await prisma.rejectionNotification.findFirst({
      where: {
        id: notificationId,
        userId: req.user.id
      }
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await prisma.rejectionNotification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking rejection notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a rejection notification (for testing/dev)
router.post('/rejection-notifications', authenticateToken, async (req, res) => {
  const { eventId, eventTitle, rejectionReason } = req.body;
  if (!eventId || !eventTitle) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const notification = await prisma.rejectionNotification.create({
      data: {
        userId: req.user.id,
        eventId: parseInt(eventId),
        eventTitle,
        rejectionReason: rejectionReason || null
      }
    });
    res.status(201).json(notification);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Notification already exists' });
    } else {
      console.error('Error creating rejection notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router; 