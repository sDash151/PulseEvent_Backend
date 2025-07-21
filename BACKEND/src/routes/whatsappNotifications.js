const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../utils/db');

// Get unread WhatsApp notifications for a user
router.get('/whatsapp-notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.whatsAppNotification.findMany({
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
    console.error('Error fetching WhatsApp notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark a WhatsApp notification as read (user joined the group)
router.patch('/whatsapp-notifications/:id/read', authenticateToken, async (req, res) => {
  const notificationId = parseInt(req.params.id);
  
  if (isNaN(notificationId)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }
  
  try {
    const notification = await prisma.whatsAppNotification.findFirst({
      where: {
        id: notificationId,
        userId: req.user.id
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await prisma.whatsAppNotification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a WhatsApp notification (called when user registers for an event with WhatsApp group)
router.post('/whatsapp-notifications', authenticateToken, async (req, res) => {
  const { eventId, eventTitle, whatsappGroupLink } = req.body;
  
  if (!eventId || !eventTitle || !whatsappGroupLink) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    const notification = await prisma.whatsAppNotification.create({
      data: {
        userId: req.user.id,
        eventId: parseInt(eventId),
        eventTitle,
        whatsappGroupLink
      }
    });
    
    res.status(201).json(notification);
  } catch (error) {
    if (error.code === 'P2002') {
      // Notification already exists for this user and event
      res.status(409).json({ message: 'Notification already exists' });
    } else {
      console.error('Error creating WhatsApp notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router; 