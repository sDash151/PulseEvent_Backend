// backend/src/routes/analytics.js
const express = require('express');
const { authenticateToken, authorizeHost } = require('../middleware/auth.js');
const prisma = require('../utils/db.js');

const router = express.Router();

// Get analytics for an event
router.get('/:eventId', authenticateToken, authorizeHost, async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  
  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' })
  }
  
  try {
    // Get event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        feedbacks: true
      }
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Verify host owns the event
    if (event.hostId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Check for required startTime and endTime
    if (!event.startTime || !event.endTime) {
      return res.status(400).json({ message: 'startTime and endTime required' });
    }
    
    // Calculate basic stats
    const totalRsvps = event.rsvps.length
    const totalCheckIns = event.rsvps.filter(r => r.checkedIn).length
    const feedbackCount = event.feedbacks.length
    
    // Calculate feedback per hour
    const feedbackPerHour = []
    if (event.feedbacks.length > 0) {
      const start = new Date(event.startTime)
      const end = new Date(event.endTime)
      const durationHours = Math.ceil((end - start) / (1000 * 60 * 60))
      
      for (let i = 0; i < durationHours; i++) {
        const hourStart = new Date(start.getTime() + i * 60 * 60 * 1000)
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
        
        const count = event.feedbacks.filter(f => {
          const feedbackTime = new Date(f.createdAt)
          return feedbackTime >= hourStart && feedbackTime < hourEnd
        }).length
        
        feedbackPerHour.push({
          hour: hourStart.toISOString(),
          count
        })
      }
    }
    
    // Calculate top emojis
    const emojiCounts = {}
    event.feedbacks.forEach(f => {
      if (f.emoji) {
        emojiCounts[f.emoji] = (emojiCounts[f.emoji] || 0) + 1
      }
    })
    
    const topEmojis = Object.entries(emojiCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emoji, count]) => ({ emoji, count }))
    
    // Calculate top keywords
    const wordCounts = {}
    const stopWords = new Set(['the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'that', 'this', 'was', 'i', 'for', 'on', 'with', 'as', 'at', 'be', 'by'])
    
    event.feedbacks.forEach(f => {
      if (f.content) {
        const words = f.content
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 2 && !stopWords.has(word))
          
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1
        })
      }
    })
    
    const topKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))
    
    // Calculate sentiment (simple version)
    const positiveWords = ['good', 'great', 'excellent', 'awesome', 'love', 'like', 'fun', 'happy', 'amazing', 'best','😀', '😍', '👍','❤️', '🔥', '👏', '🎉','🤣']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'boring', 'sad', 'worst', 'poor', 'angry', 'frustrated', '😡', '😞', '👎', '💔', '😢', '😭', '😠', '😤','💩']
    
    let positive = 0
    let negative = 0
    let neutral = 0
    
    event.feedbacks.forEach(f => {
      // Combine content and emoji for sentiment analysis
      const content = (f.content ? f.content.toLowerCase() : '') + (f.emoji ? ` ${f.emoji}` : '')
      const hasPositive = positiveWords.some(word => content.includes(word))
      const hasNegative = negativeWords.some(word => content.includes(word))
      if (hasPositive && !hasNegative) positive++
      else if (hasNegative && !hasPositive) negative++
      else neutral++
    })
    
    const totalSentiment = positive + negative + neutral
    const sentiment = {
      positive: totalSentiment > 0 ? Math.round((positive / totalSentiment) * 100) : 0,
      negative: totalSentiment > 0 ? Math.round((negative / totalSentiment) * 100) : 0,
      neutral: totalSentiment > 0 ? Math.round((neutral / totalSentiment) * 100) : 0
    }
    
    // Calculate engagement rate (RSVPs vs check-ins)
    const engagementRate = totalRsvps > 0 
      ? Math.round((totalCheckIns / totalRsvps) * 100) 
      : 0
    
    // Calculate feedback types (optional, for frontend)
    const feedbackTypes = [];
    if (event.feedbacks.length > 0) {
      const withEmoji = event.feedbacks.filter(f => f.emoji).length;
      const withText = event.feedbacks.filter(f => f.content && f.content.trim().length > 0).length;
      feedbackTypes.push({ type: 'Emoji', count: withEmoji, percentage: Math.round((withEmoji / event.feedbacks.length) * 100) });
      feedbackTypes.push({ type: 'Text', count: withText, percentage: Math.round((withText / event.feedbacks.length) * 100) });
    }

    // Dummy change values for now (could be improved with historical data)
    const rsvpChange = 0;
    const feedbackChange = 0;
    const engagementChange = 0;

    // Prepare response
    const analytics = {
      eventId: event.id,
      eventTitle: event.title,
      totalRsvps,
      rsvpChange,
      totalCheckIns,
      checkinRate: 0, // Not implemented, but expected by frontend
      feedbackCount,
      feedbackChange,
      engagementRate,
      engagementChange,
      feedbackPerHour,
      topEmojis,
      topKeywords,
      feedbackTypes,
      sentiment,
      createdAt: new Date().toISOString()
    }
    
    res.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router;