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
    // Get event with all related data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, createdAt: true }
            }
          }
        },
        registrations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, createdAt: true }
            },
            participants: {
              select: { id: true, details: true }
            }
          }
        },
        waitingList: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, createdAt: true }
            }
          }
        },
        feedbacks: true,
        subEvents: {
          include: {
            feedbacks: true
          }
        },
        parentEvent: {
          include: {
            feedbacks: true
          }
        }
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
    
    // Determine feedback scope based on event type
    let feedbacksToAnalyze = [];
    const isMegaEvent = event.subEvents && event.subEvents.length > 0;
    const isSubEvent = event.parentEvent !== null;
    
    if (isMegaEvent) {
      // For mega events: include own feedbacks + all subevent feedbacks
      feedbacksToAnalyze = [...event.feedbacks];
      event.subEvents.forEach(subEvent => {
        if (subEvent.feedbacks && Array.isArray(subEvent.feedbacks)) {
          feedbacksToAnalyze.push(...subEvent.feedbacks);
        }
      });
    } else if (isSubEvent) {
      // For subevents: only include own feedbacks (exclude parent event feedbacks)
      feedbacksToAnalyze = [...event.feedbacks];
    } else {
      // For regular events: only include own feedbacks
      feedbacksToAnalyze = [...event.feedbacks];
    }

    // Calculate basic stats
    const totalRsvps = event.rsvps.length
    const totalCheckIns = event.rsvps.filter(r => r.checkedIn).length
    const feedbackCount = feedbacksToAnalyze.length
    
    // Calculate feedback per hour using the appropriate feedback set
    const feedbackPerHour = []
    if (feedbacksToAnalyze.length > 0) {
      const start = new Date(event.startTime)
      const end = new Date(event.endTime)
      const durationHours = Math.ceil((end - start) / (1000 * 60 * 60))
      
      for (let i = 0; i < durationHours; i++) {
        const hourStart = new Date(start.getTime() + i * 60 * 60 * 1000)
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
        
        const count = feedbacksToAnalyze.filter(f => {
          const feedbackTime = new Date(f.createdAt)
          return feedbackTime >= hourStart && feedbackTime < hourEnd
        }).length
        
        feedbackPerHour.push({
          hour: hourStart.toISOString(),
          count
        })
      }
    }
    
    // Calculate top emojis using appropriate feedback set
    const emojiCounts = {}
    feedbacksToAnalyze.forEach(f => {
      if (f.emoji) {
        emojiCounts[f.emoji] = (emojiCounts[f.emoji] || 0) + 1
      }
    })
    
    const topEmojis = Object.entries(emojiCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emoji, count]) => ({ emoji, count }))
    
    // Calculate top keywords using appropriate feedback set
    const wordCounts = {}
    const stopWords = new Set(['the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'that', 'this', 'was', 'i', 'for', 'on', 'with', 'as', 'at', 'be', 'by'])
    
    feedbacksToAnalyze.forEach(f => {
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
    
    // Calculate sentiment using appropriate feedback set
    const positiveWords = ['good', 'great', 'excellent', 'awesome', 'love', 'like', 'fun', 'happy', 'amazing', 'best','😀', '😍', '👍','❤️', '🔥', '👏', '🎉','🤣']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'boring', 'sad', 'worst', 'poor', 'angry', 'frustrated', '😡', '😞', '👎', '💔', '😢', '😭', '😠', '😤','💩']
    
    let positive = 0
    let negative = 0
    let neutral = 0
    
    feedbacksToAnalyze.forEach(f => {
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
    
    // Calculate feedback types using appropriate feedback set
    const feedbackTypes = [];
    if (feedbacksToAnalyze.length > 0) {
      const withEmoji = feedbacksToAnalyze.filter(f => f.emoji).length;
      const withText = feedbacksToAnalyze.filter(f => f.content && f.content.trim().length > 0).length;
      feedbackTypes.push({ type: 'Emoji', count: withEmoji, percentage: Math.round((withEmoji / feedbacksToAnalyze.length) * 100) });
      feedbackTypes.push({ type: 'Text', count: withText, percentage: Math.round((withText / feedbacksToAnalyze.length) * 100) });
    }

    // Dummy change values for now (could be improved with historical data)
    const rsvpChange = 0;
    const feedbackChange = 0;
    const engagementChange = 0;

    // Add metadata about event type for frontend understanding
    const eventMetadata = {
      isMegaEvent,
      isSubEvent,
      subEventCount: isMegaEvent ? event.subEvents.length : 0,
      parentEventId: isSubEvent ? event.parentEvent.id : null,
      parentEventTitle: isSubEvent ? event.parentEvent.title : null
    };

    // --- Merge RSVP and Registration for each user (production-grade) ---
    const userMap = new Map();
    // First, add all registrations (preferred)
    event.registrations.forEach(registration => {
      let participants = registration.participants || [];
      userMap.set(registration.user.id, {
        id: registration.user.id,
        name: registration.user.name,
        email: registration.user.email,
        avatar: registration.user.avatar,
        registrationType: 'Registration',
        registrationDate: registration.createdAt,
        checkedIn: false, // will update below if RSVP exists
        checkInDate: null,
        teamName: registration.teamName,
        participants: participants,
        responses: registration.responses,
        paymentProof: registration.paymentProof,
        createdAt: registration.user.createdAt,
        status: 'confirmed'
      });
    });
    // Next, add RSVP check-in info to registration users, or add RSVP-only users
    event.rsvps.forEach(rsvp => {
      if (userMap.has(rsvp.user.id)) {
        // Merge check-in info
        const regUser = userMap.get(rsvp.user.id);
        regUser.checkedIn = rsvp.checkedIn;
        regUser.checkInDate = rsvp.checkedInAt;
        // Prefer earliest registration date
        if (rsvp.createdAt < regUser.registrationDate) regUser.registrationDate = rsvp.createdAt;
      } else {
        // RSVP-only user
        userMap.set(rsvp.user.id, {
          id: rsvp.user.id,
          name: rsvp.user.name,
          email: rsvp.user.email,
          avatar: rsvp.user.avatar,
          registrationType: 'RSVP',
          registrationDate: rsvp.createdAt,
          checkedIn: rsvp.checkedIn,
          checkInDate: rsvp.checkedInAt,
          teamName: null,
          participants: [],
          responses: null,
          paymentProof: null,
          createdAt: rsvp.user.createdAt,
          status: 'confirmed'
        });
      }
    });
    // Add waiting list users (only those with status 'pending')
    event.waitingList.forEach(waiting => {
      if (waiting.status === 'pending' && waiting.user && !userMap.has(waiting.user.id)) {
        let participants = waiting.participants || [];
        userMap.set(waiting.user.id, {
          id: waiting.user.id,
          name: waiting.user.name,
          email: waiting.user.email,
          avatar: waiting.user.avatar,
          registrationType: 'Waiting List',
          registrationDate: waiting.createdAt,
          checkedIn: false,
          checkInDate: null,
          teamName: waiting.teamName,
          participants: participants,
          responses: waiting.responses,
          paymentProof: waiting.paymentProof,
          createdAt: waiting.user.createdAt,
          status: waiting.status
        });
      }
    });
    // Convert to array and sort
    const registeredUsers = Array.from(userMap.values()).sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));

    // Calculate registration rate
    let registrationRate = 0;
    if (isMegaEvent && event.subEvents && event.subEvents.length > 0) {
      let totalSubRegistrations = 0;
      let totalSubMaxAttendees = 0;
      for (const sub of event.subEvents) {
        // Count registrations for each sub event
        const subRegs = await prisma.registration.count({ where: { eventId: sub.id } });
        totalSubRegistrations += subRegs;
        totalSubMaxAttendees += sub.maxAttendees || 0;
      }
      // Only calculate if there are max attendees set
      if (totalSubMaxAttendees > 0) {
        registrationRate = Math.round((totalSubRegistrations / totalSubMaxAttendees) * 100);
      } else {
        // If no max attendees set, show percentage of sub events with registrations
        const subEventsWithRegs = event.subEvents.filter(sub => {
          return prisma.registration.count({ where: { eventId: sub.id } }) > 0;
        }).length;
        registrationRate = event.subEvents.length > 0 ? Math.round((subEventsWithRegs / event.subEvents.length) * 100) : 0;
      }
    } else {
      const totalRegistrations = event.registrations.length;
      const maxAttendees = event.maxAttendees || 0;
      registrationRate = maxAttendees > 0 ? Math.round((totalRegistrations / maxAttendees) * 100) : 0;
    }

    // --- Heatmap Data: Hourly Engagement (per day/hour) ---
    // We'll use RSVP check-ins as the main engagement metric for heatmap
    const hourlyEngagement = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Build a 7x24 grid: for each day of week, for each hour, count check-ins
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const day = daysOfWeek[dayIdx];
      const hours = [];
      for (let hour = 0; hour < 24; hour++) {
        // Count check-ins for this day/hour
        const count = event.rsvps.filter(rsvp => {
          if (!rsvp.checkedInAt) return false;
          const d = new Date(rsvp.checkedInAt);
          return d.getDay() === dayIdx && d.getHours() === hour;
        }).length;
        hours.push({ hour, value: count, events: count });
      }
      hourlyEngagement.push({ day, hours });
    }

    // --- Heatmap Data: Monthly Activity (per month/week) ---
    // We'll use RSVP check-ins as the main activity metric
    const monthlyActivity = [];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const month = months[monthIdx];
      // For each week (1-4) in the month
      const weeks = [];
      for (let week = 1; week <= 4; week++) {
        // Count check-ins for this month/week
        const count = event.rsvps.filter(rsvp => {
          if (!rsvp.checkedInAt) return false;
          const d = new Date(rsvp.checkedInAt);
          return d.getMonth() === monthIdx && Math.ceil(d.getDate() / 7) === week;
        }).length;
        weeks.push({ week, value: count, events: count });
      }
      monthlyActivity.push({ month, weeks });
    }

    // --- Funnel Data for EngagementFunnelChart ---
    // 1. Invited: total invitations sent for the event
    // 2. Registered: total registrations (not RSVPs)
    // 3. CheckedIn: total RSVP check-ins
    // 4. Completed: users who checked in and event has ended
    // 5. Feedback: unique users who submitted feedback
    let invited = 0;
    if (event.invitations && Array.isArray(event.invitations)) {
      invited = event.invitations.length;
    } else if (event.invitations) {
      // If not included, fallback to 0
      invited = 0;
    }
    const registered = event.registrations.length;
    const checkedIn = event.rsvps.filter(r => r.checkedIn).length;
    // Completed: checked in and event has ended
    const now = new Date();
    const completed = event.rsvps.filter(r => r.checkedIn && new Date(event.endTime) < now).length;
    // Feedback: unique users who submitted feedback
    const feedbackUserIds = new Set();
    feedbacksToAnalyze.forEach(f => {
      if (f.userId) feedbackUserIds.add(f.userId);
    });
    const feedback = feedbackUserIds.size;
    const funnelData = { invited, registered, checkedIn, completed, feedback };

    // --- Advanced Stats for StatCards ---
    // 1. avgSessionTime: average duration between RSVP check-in and event end (for checked-in users)
    let avgSessionTime = null;
    const checkedInRsvps = event.rsvps.filter(r => r.checkedIn && r.checkedInAt);
    if (checkedInRsvps.length > 0) {
      const now = new Date();
      const end = new Date(event.endTime);
      const endTime = end < now ? end : now; // Use current time if event hasn't ended
      
      const totalMs = checkedInRsvps.reduce((sum, r) => {
        const checkIn = new Date(r.checkedInAt);
        return sum + Math.max(0, endTime - checkIn);
      }, 0);
      
      if (totalMs > 0) {
        const avgMs = totalMs / checkedInRsvps.length;
        const avgMinutes = Math.floor(avgMs / 60000);
        const hours = Math.floor(avgMinutes / 60);
        const minutes = avgMinutes % 60;
        avgSessionTime = `${hours}h ${minutes}m`;
      }
    }

    // 2. satisfactionScore: average sentiment score from feedbacks (1-5 scale)
    // We'll use: positive=5, neutral=3, negative=1
    let satisfactionScore = null;
    if (feedbacksToAnalyze.length > 0) {
      let totalScore = 0;
      feedbacksToAnalyze.forEach(f => {
        // Use sentiment analysis from earlier
        const content = (f.content ? f.content.toLowerCase() : '') + (f.emoji ? ` ${f.emoji}` : '');
        const hasPositive = positiveWords.some(word => content.includes(word));
        const hasNegative = negativeWords.some(word => content.includes(word));
        if (hasPositive && !hasNegative) totalScore += 5;
        else if (hasNegative && !hasPositive) totalScore += 1;
        else totalScore += 3;
      });
      satisfactionScore = (totalScore / feedbacksToAnalyze.length).toFixed(1);
    }

    // 3. totalTeams: unique team names in registrations
    const teamNames = new Set();
    event.registrations.forEach(reg => {
      if (reg.teamName) teamNames.add(reg.teamName);
    });
    const totalTeams = teamNames.size;

    // 4. Trend fields (dummy for now)
    const avgSessionTimeTrend = '+0m';
    const satisfactionScoreTrend = '+0.0';
    const totalTeamsTrend = '+0';
    const engagementRateTrend = '+0%';

    // For mega events, prepare sub-event registration stats for charting
    let subEventRegistrations = [];
    if (isMegaEvent && event.subEvents && event.subEvents.length > 0) {
      for (const sub of event.subEvents) {
        const regCount = await prisma.registration.count({ where: { eventId: sub.id } });
        subEventRegistrations.push({
          subEventId: sub.id,
          subEventTitle: sub.title,
          registrationCount: regCount,
          maxAttendees: sub.maxAttendees || 0
        });
      }
    }

    // Add rejected candidates (waiting list with status 'rejected')
    const rejectedCandidates = event.waitingList
      .filter(waiting => waiting.status === 'rejected' && waiting.user)
      .map(waiting => {
        // Defensive: fallback for missing user fields
        const user = waiting.user || {};
        // Defensive: normalize responses (map 'Email ID' to 'email' if present)
        let responses = waiting.responses || {};
        if (responses['Email ID'] && !responses['email']) {
          responses['email'] = responses['Email ID'];
        }
        return {
          id: user.id || '-',
          name: user.name || '-',
          email: user.email || responses['email'] || '-',
          avatar: user.avatar || null,
          registrationType: 'Waiting List',
          registrationDate: waiting.createdAt || null,
          checkedIn: false,
          checkInDate: null,
          teamName: waiting.teamName || '-',
          participants: waiting.participants || [],
          responses,
          paymentProof: waiting.paymentProof || null,
          createdAt: user.createdAt || null,
          status: waiting.status || 'rejected'
        };
      });

    // --- Attendance Data: Registered vs Feedback Users ---
    const attendanceData = [];
    if (event.startTime && event.endTime) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
      
      // Get unique users who sent feedback (at least once) - EXCLUDE HOST
      const feedbackUserIds = new Set();
      feedbacksToAnalyze.forEach(feedback => {
        if (feedback.userId && feedback.userId !== event.hostId) {
          feedbackUserIds.add(feedback.userId);
        }
      });
      
      console.log('🔍 Attendance Data Debug:', {
        totalRegisteredUsers: registeredUsers.length,
        totalFeedbacks: feedbacksToAnalyze.length,
        uniqueFeedbackUsers: feedbackUserIds.size,
        eventHostId: event.hostId,
        eventDuration: durationHours
      });
      
      for (let i = 0; i < durationHours; i++) {
        const hourStart = new Date(start.getTime() + i * 60 * 60 * 1000);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
        
        // Count registered users up to this hour (using the already calculated registeredUsers)
        const registeredUpToHour = registeredUsers.filter(user => {
          const regTime = new Date(user.registrationDate);
          return regTime <= hourEnd;
        }).length;
        
        // Count unique feedback users up to this hour (users who gave feedback at least once) - EXCLUDE HOST
        const feedbackUsersUpToHour = new Set();
        feedbacksToAnalyze.forEach(f => {
          const feedbackTime = new Date(f.createdAt);
          if (feedbackTime <= hourEnd && f.userId && f.userId !== event.hostId) {
            feedbackUsersUpToHour.add(f.userId);
          }
        });
        
        attendanceData.push({
          hour: hourStart.toISOString(),
          registered: registeredUpToHour,
          feedback: feedbackUsersUpToHour.size, // Count unique users, not total feedbacks
          registeredUnique: registeredUpToHour,
          feedbackUnique: feedbackUsersUpToHour.size
        });
      }
      
      console.log('📊 Attendance Data Generated:', attendanceData);
    }

    // Prepare response
    const analytics = {
      eventId: event.id,
      eventTitle: event.title,
      eventMetadata,
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
      registeredUsers,
      rejectedCandidates,
      registrationRate, // <-- Add this field
      hourlyEngagement, // <-- NEW
      monthlyActivity,  // <-- NEW
      funnelData,       // <-- NEW
      avgSessionTime,   // <-- NEW
      satisfactionScore, // <-- NEW
      totalTeams,        // <-- NEW
      avgSessionTimeTrend, // <-- NEW
      satisfactionScoreTrend, // <-- NEW
      totalTeamsTrend,        // <-- NEW
      engagementRateTrend,    // <-- NEW
      subEventRegistrations, // <-- NEW for mega events
      attendanceData, // <-- NEW for attendance data
      createdAt: new Date().toISOString()
    }
    
    res.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router;