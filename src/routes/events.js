const express = require('express');
const { authenticateToken, authorizeHost } = require('../middleware/auth.js');
const prisma = require('../utils/db.js');

const router = express.Router();

// Get all events for current user (host and attendee)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { hostId: req.user.id },
          { rsvps: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        host: {
          select: { id: true, name: true, email: true }
        },
        rsvps: {
          select: { id: true, userId: true, checkedIn: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ✅ Create new event + auto-promote to host if not already
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { title, description, location, startTime, endTime, rsvpDeadline, maxAttendees } = req.body;

  if (!title || !location || !startTime || !endTime || !rsvpDeadline || !maxAttendees) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Promote user to 'host' if they're currently an 'attendee'
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.role !== 'host') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'host' }
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || '',
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rsvpDeadline: new Date(rsvpDeadline),
        maxAttendees: parseInt(maxAttendees),
        hostId: userId
      }
    });

    res.status(201).json(event);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Event already exists' });
    } else {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});


// Get event by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const eventId = parseInt(req.params.id);

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        host: {
          select: { id: true, name: true, email: true }
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        feedbacks: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        invitations: {
          include: {
            invitedUser: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update event (host only)
router.put('/:id', authenticateToken, authorizeHost, async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { title, description, location, startTime, endTime, rsvpDeadline, maxAttendees } = req.body;

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description: description || '',
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rsvpDeadline: new Date(rsvpDeadline),
        maxAttendees: parseInt(maxAttendees)
      },
      include: {
        host: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete event (host only)
router.delete('/:id', authenticateToken, authorizeHost, async (req, res) => {
  const eventId = parseInt(req.params.id);

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    await prisma.feedback.deleteMany({ where: { eventId } });
    await prisma.rsvp.deleteMany({ where: { eventId } });
    await prisma.event.delete({ where: { id: eventId } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
