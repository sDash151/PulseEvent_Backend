// backend/src/routes/rsvp.js
const express = require('express')
const prisma = require('../utils/db.js')
const { authenticateToken, authorizeHost } = require('../middleware/auth.js')

const router = express.Router()

// RSVP to an event
router.post('/:eventId',authenticateToken, async (req, res) => {
  const eventId = parseInt(req.params.eventId)
  
  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' })
  }
  
  try {
    // Get event
    const event = await prisma.event.findUnique({ 
      where: { id: eventId },
      include: { rsvps: true }
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Check RSVP deadline
    const now = new Date()
    if (now > new Date(event.rsvpDeadline)) {
      return res.status(400).json({ message: 'RSVP deadline has passed' })
    }
    
    // Check if already RSVP'd
    const existingRSVP = event.rsvps.find(rsvp => rsvp.userId === req.user.id)
    if (existingRSVP) {
      return res.status(400).json({ message: 'Already RSVP\'d to this event' })
    }
    
    // Check capacity
    if (event.rsvps.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is at full capacity' })
    }
    
    // Create RSVP
    const rsvp = await prisma.rsvp.create({
      data: {
        eventId,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    res.status(201).json(rsvp)
  } catch (error) {
    console.error('RSVP error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Check-in to an event
router.post('/:eventId/checkin', authenticateToken, async (req, res) => {
  const eventId = parseInt(req.params.eventId)
  
  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' })
  }
  
  try {
    // Get event
    const event = await prisma.event.findUnique({ 
      where: { id: eventId },
      include: { rsvps: true }
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Check if user RSVP'd
    const userRSVP = event.rsvps.find(rsvp => rsvp.userId === req.user.id)
    if (!userRSVP) {
      return res.status(400).json({ message: 'You must RSVP before checking in' })
    }
    
    // Check if already checked in
    if (userRSVP.checkedIn) {
      return res.status(400).json({ message: 'Already checked in' })
    }
    
    // Check event time (allow check-in 1 hour before start until end)
    const now = new Date()
    const startTime = new Date(event.startTime)
    const endTime = new Date(event.endTime)
    const checkInStart = new Date(startTime.getTime() - 60 * 60 * 1000) // 1 hour before
    
    if (now < checkInStart || now > endTime) {
      return res.status(400).json({ message: 'Check-in is not available at this time' })
    }
    
    // Update RSVP to checked in
    const updatedRSVP = await prisma.rsvp.update({
      where: { id: userRSVP.id },
      data: { checkedIn: true },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    res.json(updatedRSVP)
  } catch (error) {
    console.error('Check-in error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Host check-in an attendee
router.post('/:eventId/checkin/:userId', authenticateToken, authorizeHost, async (req, res) => {
  const eventId = parseInt(req.params.eventId)
  const userId = parseInt(req.params.userId)
  
  if (isNaN(eventId) || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid IDs' })
  }
  
  try {
    // Get event
    const event = await prisma.event.findUnique({ 
      where: { id: eventId },
      include: { rsvps: true }
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Check if user RSVP'd
    const userRSVP = event.rsvps.find(rsvp => rsvp.userId === userId)
    if (!userRSVP) {
      return res.status(400).json({ message: 'User has not RSVP\'d to this event' })
    }
    
    // Check if already checked in
    if (userRSVP.checkedIn) {
      return res.status(400).json({ message: 'User already checked in' })
    }
    
    // Update RSVP to checked in
    const updatedRSVP = await prisma.rsvp.update({
      where: { id: userRSVP.id },
      data: { checkedIn: true },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    res.json(updatedRSVP)
  } catch (error) {
    console.error('Host check-in error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router