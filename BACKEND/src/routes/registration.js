const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const prisma = new PrismaClient();

router.post('/registration', async (req, res) => {
  try {
    let { eventId, userId, teamName, responses, paymentProof, participants } = req.body;
    
    // Validate and parse eventId
    eventId = parseInt(eventId);
    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    // Parse userId if provided
    if (userId !== undefined) {
      userId = parseInt(userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
    }
    
    console.log('=== REGISTRATION SUBMISSION ===');
    console.log('Registration data:', {
      eventId,
      userId,
      teamName,
      responses,
      participants: participants?.length,
      participantsData: participants
    });
    
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Use paymentEnabled to determine approval requirement
    const approvalRequired = !!event.paymentEnabled;
    if (approvalRequired) {
      console.log('Payment required, creating waiting list entry...');
      const waiting = await prisma.waitingList.create({
        data: { 
          eventId, 
          userId, 
          teamName, 
          responses, 
          participants, 
          paymentProof, 
          status: 'pending' 
        }
      });
      console.log('Waiting list entry created:', waiting);
      return res.status(201).json({ waitingList: waiting, message: 'Added to waiting list' });
    }
    
    // Prepare participants data for database
    let participantsData = [];
    if (participants && Array.isArray(participants) && participants.length > 0) {
      participantsData = participants.map(details => ({
        details: { ...(responses || {}), ...(details || {}) }
      }));
    }
    
    console.log('Creating registration with participants data:', participantsData);
    
    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        teamName,
        responses,
        paymentProof,
        participants: {
          create: participantsData
        }
      },
      include: {
        participants: true
      }
    });

    console.log('Registration created successfully:', registration);

    // After registration is created, for paid events, auto-create RSVP if not already present
    if (event.paymentEnabled && userId) {
      try {
        const existingRsvp = await prisma.rsvp.findUnique({
          where: { eventId_userId: { eventId, userId } }
        });
        if (!existingRsvp) {
          await prisma.rsvp.create({
            data: { eventId, userId }
          });
          console.log('Auto-created RSVP for paid event:', { eventId, userId });
        } else {
          console.log('RSVP already exists for paid event:', { eventId, userId });
        }
      } catch (err) {
        console.error('Error auto-creating RSVP for paid event:', err);
        // Do not fail registration if RSVP creation fails
      }
    }

    // Create WhatsApp notification if event has WhatsApp group enabled
    if (event.whatsappGroupEnabled && event.whatsappGroupLink) {
      try {
        await prisma.whatsAppNotification.create({
          data: {
            userId,
            eventId,
            eventTitle: event.title,
            whatsappGroupLink: event.whatsappGroupLink
          }
        });
        console.log('WhatsApp notification created for user:', userId, 'event:', eventId);
      } catch (error) {
        if (error.code !== 'P2002') { // Ignore duplicate notification errors
          console.error('Error creating WhatsApp notification:', error);
        }
      }
    }

    res.status(201).json({ registration });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
});

router.post('/waiting-list', async (req, res) => {
  try {
    let { eventId, userId, teamName, responses, participants, paymentProof } = req.body;
    
    // Validate and parse eventId
    eventId = parseInt(eventId);
    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    // Parse userId if provided
    if (userId !== undefined) {
      userId = parseInt(userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
    }
    
    console.log('=== WAITING LIST CREATION ===');
    console.log('Waiting list data:', {
      eventId,
      userId,
      teamName,
      responses,
      participants: participants?.length,
      participantsData: participants
    });
    
    const waiting = await prisma.waitingList.create({
      data: { 
        eventId, 
        userId, 
        teamName, 
        responses, 
        participants, 
        paymentProof, 
        status: 'pending' 
      }
    });
    
    console.log('Waiting list entry created successfully:', waiting);
    res.status(201).json({ waitingList: waiting });
  } catch (error) {
    console.error('Waiting list error:', error);
    res.status(500).json({ error: 'Could not add to waiting list. Please try again later.' });
  }
});

// POST /api/registration/:id/participants
router.post('/registration/:id/participants', async (req, res) => {
  const { id } = req.params;
  const { participants } = req.body;
  if (!participants || !Array.isArray(participants)) {
    return res.status(400).json({ error: 'participants array required' });
  }
  const registration = await prisma.registration.findUnique({ where: { id: Number(id) } });
  if (!registration) return res.status(404).json({ error: 'Registration not found' });
  const created = await prisma.participant.createMany({
    data: participants.map(details => ({ registrationId: Number(id), details })),
    skipDuplicates: true
  });
  const updated = await prisma.registration.findUnique({
    where: { id: Number(id) },
    include: { participants: true }
  });
  res.status(201).json({ participants: updated.participants });
});

// GET /api/registration?eventId=...
router.get('/registration', async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }
    const registrations = await prisma.registration.findMany({
      where: { eventId: parseInt(eventId) },
      include: {
        user: true,
        participants: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Check if user is registered for an event
router.get('/registration/:eventId/check', authenticateToken, async (req, res) => {
  console.log('=== REGISTRATION CHECK ENDPOINT HIT ===');
  const eventId = parseInt(req.params.eventId);
  
  console.log('Registration Check Request:', { eventId, userId: req.user.id });
  
  if (isNaN(eventId)) {
    console.log('Invalid event ID:', req.params.eventId);
    return res.status(400).json({ message: 'Invalid event ID' });
  }
  
  try {
    console.log('Querying registration with:', { eventId, userId: req.user.id });
    const registration = await prisma.registration.findFirst({
      where: {
        eventId,
        userId: req.user.id
      }
    });
    
    console.log('Registration Check Result:', { eventId, userId: req.user.id, found: !!registration, registration });
    res.json({ registered: !!registration });
  } catch (error) {
    console.error('Registration check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
