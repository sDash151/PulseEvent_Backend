const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeHost } = require('../middleware/auth.js');
const prisma = require('../utils/db.js');

// Get all events for current user (host and attendee)
// Get all top-level events (mega or standalone)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        parentEventId: null,
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
        },
        subEvents: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            paymentEnabled: true,
            maxAttendees: true,
            teamSize: true,
            teamSizeMin: true,
            teamSizeMax: true,
            flexibleTeamSize: true,
            whatsappGroupEnabled: true,
            whatsappGroupLink: true,
            host: { select: { id: true, name: true, email: true } },
            rsvps: {
              select: {
                userId: true,
                checkedIn: true
              }
            }
          }
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

// Get featured events for homepage (mega events only)
async function getFeaturedEventsHandler(req, res) {
  try {
    const now = new Date();
    const userId = req.user?.id; // Get user ID if authenticated
    // Get mega events (parent events only) that haven't ended yet
    const featuredEvents = await prisma.event.findMany({
      where: {
        parentEventId: null, // Only mega events
        endTime: { gte: now } // Events that haven't ended yet
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        rsvps: userId
          ? {
              where: { userId },
              select: { id: true, userId: true, checkedIn: true }
            }
          : {
              select: { id: true, userId: true, checkedIn: true }
            },
        registrations: userId
          ? {
              where: { userId },
              select: { id: true, userId: true, teamName: true }
            }
          : {
              select: { id: true, userId: true, teamName: true }
            },
        _count: {
          select: {
            rsvps: true,
            registrations: true,
            subEvents: true
          }
        }
      },
      orderBy: [
        { startTime: 'asc' }
      ],
      take: 6 // Limit to 6 featured events
    });
    // Transform events for frontend
    const transformedEvents = featuredEvents.map(event => {
      const isLive = new Date(event.startTime) <= now && new Date(event.endTime) >= now;
      const isUpcoming = new Date(event.startTime) > now;
      // Check if current user is registered/RSVP'd
      const userRSVP = event.rsvps.find(rsvp => rsvp.userId === userId);
      const userRegistration = event.registrations.find(reg => reg.userId === userId);
      const isUserRegistered = !!(userRSVP || userRegistration);
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startTime: event.startTime,
        endTime: event.endTime,
        maxAttendees: event.maxAttendees,
        host: event.host,
        isLive,
        isUpcoming,
        status: isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'ENDED',
        attendeeCount: event._count.rsvps + event._count.registrations,
        registrationCount: event._count.registrations,
        rsvpCount: event._count.rsvps,
        subEventCount: event._count.subEvents,
        isUserRegistered,
        userRegistrationType: userRegistration ? 'registration' : userRSVP ? 'rsvp' : null
      };
    });
    res.json({
      success: true,
      events: transformedEvents
    });
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured events'
    });
  }
}
// Keep the router version for compatibility
router.get('/featured', getFeaturedEventsHandler);

// Get sub-events of a mega event
router.get('/:id/sub-events', async (req, res) => {
  const megaEventId = parseInt(req.params.id);
  if (isNaN(megaEventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }
  try {
    const subEvents = await prisma.event.findMany({
      where: { parentEventId: megaEventId },
      include: {
        host: { select: { id: true, name: true, email: true } },
        rsvps: { select: { id: true, userId: true, checkedIn: true } }
      },
      orderBy: { startTime: 'asc' }
    });
    res.json(subEvents);
  } catch (error) {
    console.error('Error fetching sub-events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a sub-event under a mega event
router.post('/:id/sub-events', authenticateToken, async (req, res) => {
  const megaEventId = parseInt(req.params.id);
  const userId = req.user.id;
  const { title, description, location, startTime, endTime, rsvpDeadline, maxAttendees } = req.body;
  
  if (isNaN(megaEventId) || !title || !location || !startTime || !endTime || !rsvpDeadline || !maxAttendees) {
    return res.status(400).json({ message: 'Missing required fields or invalid event ID' });
  }
  
  try {
    const subEvent = await prisma.event.create({
      data: {
        title,
        description: description || '',
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rsvpDeadline: new Date(rsvpDeadline),
        maxAttendees: parseInt(maxAttendees),
        hostId: userId,
        type: 'SUB',
        parentEventId: megaEventId
      },
      include: {
        host: { select: { id: true, name: true, email: true } }
      }
    });
    res.status(201).json(subEvent);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Sub-event already exists' });
    } else {
      console.error('Error creating sub-event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Create new event + auto-promote to host if not already
// POST /events (standalone or mega)
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { title, description, location, startTime, endTime, rsvpDeadline, maxAttendees, type } = req.body;

  if (!title || !location || !startTime || !endTime || !rsvpDeadline || !maxAttendees || !type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Promote user to 'host' if they're currently an 'attendee'
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'host') {
      await prisma.user.update({ where: { id: userId }, data: { role: 'host' } });
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
        hostId: userId,
        type,
        parentEventId: null
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

// POST /events/:megaEventId/sub (sub-event)
router.post('/:megaEventId/sub', authenticateToken, async (req, res) => {
  const megaEventId = parseInt(req.params.megaEventId);
  const userId = req.user.id;
  const { title, description, location, startTime, endTime, rsvpDeadline, maxAttendees, teamSize, teamSizeMin, teamSizeMax, flexibleTeamSize, paymentEnabled, customFields, whatsappGroupEnabled, whatsappGroupLink } = req.body;
  
  console.log('Creating sub-event with data:', {
    megaEventId,
    title,
    customFields,
    teamSize,
    paymentEnabled,
    whatsappGroupEnabled,
    whatsappGroupLink
  });
  
  if (isNaN(megaEventId) || !title || !location || !startTime || !endTime || !rsvpDeadline || !maxAttendees) {
    return res.status(400).json({ message: 'Missing required fields or invalid event ID' });
  }
  
  try {
    // Get parent mega event to validate timing constraints
    const parentEvent = await prisma.event.findUnique({
      where: { id: megaEventId },
      select: { startTime: true, endTime: true, type: true }
    });

    if (!parentEvent) {
      return res.status(404).json({ message: 'Parent mega event not found' });
    }

    if (parentEvent.type !== 'MEGA') {
      return res.status(400).json({ message: 'Can only create sub-events under mega events' });
    }

    const parentStart = new Date(parentEvent.startTime);
    const parentEnd = new Date(parentEvent.endTime);
    const subStart = new Date(startTime);
    const subEnd = new Date(endTime);

    // Validate timing constraints
    if (subStart < parentStart) {
      return res.status(400).json({ 
        message: `Sub-event cannot start before the mega event. Mega event starts on ${parentStart.toLocaleDateString()} at ${parentStart.toLocaleTimeString()}.`
      });
    }

    if (subEnd > parentEnd) {
      return res.status(400).json({ 
        message: `Sub-event cannot end after the mega event. Mega event ends on ${parentEnd.toLocaleDateString()} at ${parentEnd.toLocaleTimeString()}.`
      });
    }

    if (subStart >= subEnd) {
      return res.status(400).json({ 
        message: 'Sub-event start time must be before end time.'
      });
    }

    const subEvent = await prisma.event.create({
      data: {
        title,
        description: description || '',
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rsvpDeadline: new Date(rsvpDeadline),
        maxAttendees: parseInt(maxAttendees),
        teamSize: teamSize ? parseInt(teamSize) : null,
        teamSizeMin: flexibleTeamSize && teamSizeMin ? parseInt(teamSizeMin) : null,
        teamSizeMax: flexibleTeamSize && teamSizeMax ? parseInt(teamSizeMax) : null,
        flexibleTeamSize: !!flexibleTeamSize,
        hostId: userId,
        type: 'SUB',
        parentEventId: megaEventId,
        paymentEnabled: !!paymentEnabled,
        customFields: customFields || null,
        whatsappGroupEnabled: !!whatsappGroupEnabled,
        whatsappGroupLink: whatsappGroupEnabled ? whatsappGroupLink : null
      },
      include: {
        host: { select: { id: true, name: true, email: true } }
      }
    });
    
    console.log('Sub-event created successfully:', subEvent.id);
    res.status(201).json(subEvent);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Sub-event already exists' });
    } else {
      console.error('Error creating sub-event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Update a sub-event (host only)
router.put('/:subEventId/sub-event', authenticateToken, authorizeHost, async (req, res) => {
  const subEventId = parseInt(req.params.subEventId);
  const {
    title, description, location, startTime, endTime, rsvpDeadline, maxAttendees,
    teamSize, teamSizeMin, teamSizeMax, flexibleTeamSize, paymentEnabled,
    paymentProofRequired, customFields, qrCode, whatsappGroupEnabled, whatsappGroupLink
  } = req.body;

  if (isNaN(subEventId)) {
    return res.status(400).json({ message: 'Invalid sub-event ID' });
  }

  try {
    const updated = await prisma.event.update({
      where: { id: subEventId },
      data: {
        title,
        description,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rsvpDeadline: new Date(rsvpDeadline),
        maxAttendees: parseInt(maxAttendees),
        teamSize: teamSize ? parseInt(teamSize) : null,
        teamSizeMin: flexibleTeamSize && teamSizeMin ? parseInt(teamSizeMin) : null,
        teamSizeMax: flexibleTeamSize && teamSizeMax ? parseInt(teamSizeMax) : null,
        flexibleTeamSize: !!flexibleTeamSize,
        paymentEnabled: !!paymentEnabled,
        paymentProofRequired: !!paymentProofRequired,
        customFields: customFields || null,
        qrCode: qrCode || null,
        whatsappGroupEnabled: !!whatsappGroupEnabled,
        whatsappGroupLink: whatsappGroupEnabled ? whatsappGroupLink : null
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating sub-event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get event by ID - DEBUG VERSION with extensive logging
router.get('/:id', authenticateToken, async (req, res) => {
  // Add debug logging
  console.log('=== EVENT DETAIL REQUEST ===');
  console.log('Raw params:', req.params);
  console.log('Event ID from params:', req.params.id);
  console.log('User from token:', req.user);
  
  const eventId = parseInt(req.params.id);
  console.log('Parsed eventId:', eventId);
  console.log('Is eventId NaN?', isNaN(eventId));
  
  // More lenient validation - allow 0 and check for NaN specifically
  if (isNaN(eventId) || eventId < 1) {
    console.log('❌ Invalid event ID validation failed');
    return res.status(400).json({ 
      error: 'Invalid event ID',
      received: req.params.id,
      parsed: eventId
    });
  }
  
  try {
    console.log('🔍 Querying database for event ID:', eventId);
    
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId
      },
      include: {
        host: { select: { id: true, name: true, avatar: true } },
        feedbacks: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        invitations: true,
        rsvps: true,
        subEvents: {
          include: {
            rsvps: {
              where: { userId: req.user.id },
              select: { checkedIn: true }
            }
          }
        }
      }
    });

    console.log('📊 Database query result:', event ? 'Found event' : 'No event found');
    
    if (!event) {
      console.log('❌ Event not found in database');
      return res.status(404).json({ error: 'Event not found' });
    }

    // Derive joined and checkedIn for parent event
    const joined = event.rsvps.some(r => r.userId === req.user.id);
    const checkedIn = event.rsvps.find(r => r.userId === req.user.id)?.checkedIn || false;

    console.log('👤 User status - joined:', joined, 'checkedIn:', checkedIn);

    // Format subEvents
    event.subEvents = event.subEvents.map(sub => ({
      ...sub,
      joined: sub.rsvps.length > 0,
      checkedIn: sub.rsvps[0]?.checkedIn || false
    }));

    console.log('✅ Returning event data successfully');
    console.log('Event customFields:', event.customFields);
    console.log('Event teamSize:', event.teamSize, 'IsTeamEvent:', !!event.teamSize);
    res.json({ ...event, joined, checkedIn });
    
  } catch (error) {
    console.error('❌ Database error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});


// Add this route to your backend events.js file
// GET /api/events/:parentId/sub/:subId
router.get('/:parentId/sub/:subId', authenticateToken, async (req, res) => {
  const parentId = parseInt(req.params.parentId);
  const subId = parseInt(req.params.subId);
  
  if (!parentId || isNaN(parentId) || !subId || isNaN(subId)) {
    return res.status(400).json({ error: 'Invalid event IDs' });
  }
  
  try {
    const subEvent = await prisma.event.findUnique({
      where: { 
        id: subId,
        parentEventId: parentId // Ensure it's actually a sub-event of the parent
      },
      include: {
        host: { select: { id: true, name: true, avatar: true } },
        feedbacks: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        invitations: true,
        rsvps: true,
        parent: { // Include parent event info
          select: { id: true, title: true, type: true }
        }
      }
    });

    if (!subEvent) {
      return res.status(404).json({ error: 'Sub-event not found' });
    }

    // Derive joined and checkedIn status
    const joined = subEvent.rsvps.some(r => r.userId === req.user.id);
    const checkedIn = subEvent.rsvps.find(r => r.userId === req.user.id)?.checkedIn || false;

    console.log('Sub-event customFields:', subEvent.customFields);
    console.log('Sub-event teamSize:', subEvent.teamSize, 'IsTeamEvent:', !!subEvent.teamSize);
    res.json({ ...subEvent, joined, checkedIn });
  } catch (error) {
    console.error('Error fetching sub-event detail:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    // Delete related records first to avoid foreign key constraint errors
    await prisma.invitation.deleteMany({ where: { eventId } });
    await prisma.feedback.deleteMany({ where: { eventId } });
    await prisma.rsvp.deleteMany({ where: { eventId } });
    await prisma.registration.deleteMany({ where: { eventId } });
    await prisma.waitingList.deleteMany({ where: { eventId } });
    
    // Delete sub-events if this is a mega event
    const subEvents = await prisma.event.findMany({ where: { parentEventId: eventId } });
    for (const subEvent of subEvents) {
      await prisma.invitation.deleteMany({ where: { eventId: subEvent.id } });
      await prisma.feedback.deleteMany({ where: { eventId: subEvent.id } });
      await prisma.rsvp.deleteMany({ where: { eventId: subEvent.id } });
      await prisma.registration.deleteMany({ where: { eventId: subEvent.id } });
      await prisma.waitingList.deleteMany({ where: { eventId: subEvent.id } });
    }
    await prisma.event.deleteMany({ where: { parentEventId: eventId } });
    
    // Finally delete the main event
    await prisma.event.delete({ where: { id: eventId } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/event/:id/custom-fields
router.patch('/:id/custom-fields', authenticateToken, authorizeHost, async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { customFields } = req.body;
  
  if (!customFields) {
    return res.status(400).json({ error: 'customFields required' });
  }
  
  try {
    // Only host can update
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { customFields }
    });
    
    res.json({ event: updated });
  } catch (error) {
    console.error('Error updating custom fields:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/event/:id/custom-fields
router.get('/:id/custom-fields', async (req, res) => {
  const eventId = parseInt(req.params.id);
  
  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ customFields: event.customFields || {} });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router, getFeaturedEventsHandler };