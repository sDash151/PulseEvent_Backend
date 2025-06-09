const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create invitation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, emails } = req.body;
    const hostId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.hostId !== hostId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const invitations = await Promise.all(
      emails.map(async (email) => {
        const user = await prisma.user.findUnique({ where: { email } });
        return prisma.invitation.create({
          data: {
            eventId,
            email,
            invitedById: hostId,
            invitedUserId: user?.id || null
          }
        });
      })
    );

    res.status(201).json(invitations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get invitations for event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { eventId: parseInt(req.params.eventId) },
      include: {
        invitedUser: { select: { name: true } },
        invitedBy: { select: { name: true } }
      }
    });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept invitation
router.patch('/:token/accept', authenticateToken, async (req, res) => {
  try {
    const invitation = await prisma.invitation.update({
      where: { token: req.params.token },
      data: {
        status: 'accepted',
        invitedUserId: req.user.id
      }
    });

    await prisma.rsvp.create({
      data: {
        eventId: invitation.eventId,
        userId: req.user.id
      }
    });

    res.json({ message: 'Invitation accepted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get invitations received by the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { email: req.user.email },
      include: {
        event: { select: { title: true, id: true } },
        invitedBy: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
