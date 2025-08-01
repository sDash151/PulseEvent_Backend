const express = require('express')
const { authenticateToken, authorizeHost } = require('../middleware/auth.js')
const prisma = require('../utils/db.js')

const router = express.Router()

// Create feedback
router.post('/', authenticateToken, async (req, res) => {
  const { eventId, content, emoji } = req.body

  if (!eventId || (!content && !emoji)) {
    return res.status(400).json({ message: 'Event ID and content or emoji are required' })
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } })
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const now = new Date()
    if (now < new Date(event.startTime) || now > new Date(event.endTime)) {
      return res.status(400).json({ message: 'Feedback can only be submitted during the event' })
    }

    const feedback = await prisma.feedback.create({
      data: {
        content: content || '',
        emoji: emoji || null,
        eventId: parseInt(eventId),
        userId: req.user.id
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    try {
      const io = require('../socket').getIo?.()
      if (io) {
        io.to(`event_${event.id}`).emit('newFeedback', feedback)
      }
    } catch (e) {
      console.warn('Socket emit to sub-event failed:', e)
    }

    // If this is a sub-event, also create feedback for the parent event and emit socket
    if (event.parentEventId) {
      const parentFeedback = await prisma.feedback.create({
        data: {
          content: content || '',
          emoji: emoji || null,
          eventId: event.parentEventId,
          userId: req.user.id
        },
        include: {
          user: { select: { id: true, name: true } }
        }
      })

      try {
        const io = require('../socket').getIo?.()
        if (io) {
          io.to(`event_${event.parentEventId}`).emit('newFeedback', parentFeedback)
        }
      } catch (e) {
        console.warn('Socket emit to parent event failed:', e)
      }
    }

    res.status(201).json(feedback)
  } catch (error) {
    console.error('Feedback creation error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Pin/Unpin feedback (host only)
router.put('/:id/pin', authenticateToken, authorizeHost, async (req, res) => {
  const feedbackId = parseInt(req.params.id)
  if (isNaN(feedbackId)) {
    return res.status(400).json({ message: 'Invalid feedback ID' })
  }

  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: { event: true }
    })

    if (!feedback) return res.status(404).json({ message: 'Feedback not found' })
    if (feedback.event.hostId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: { isPinned: !feedback.isPinned },
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    res.json(updatedFeedback)
  } catch (error) {
    console.error('Pin feedback error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Flag/Unflag feedback (host only)
router.put('/:id/flag', authenticateToken, authorizeHost, async (req, res) => {
  const feedbackId = parseInt(req.params.id)
  if (isNaN(feedbackId)) {
    return res.status(400).json({ message: 'Invalid feedback ID' })
  }

  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: { event: true }
    })

    if (!feedback) return res.status(404).json({ message: 'Feedback not found' })
    if (feedback.event.hostId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: { isFlagged: !feedback.isFlagged },
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    res.json(updatedFeedback)
  } catch (error) {
    console.error('Flag feedback error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router
    