const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeHost } = require('../middleware/auth');
const prisma = new PrismaClient();
const { sendRegistrationRejectionEmail } = require('../utils/email');

// Get all waiting list entries for an event (host only)
router.get('/:eventId', authenticateToken, authorizeHost, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Verify host owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { hostId: true }
    });

    if (!event || event.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Only fetch waiting list entries with status 'pending'
    const waitingList = await prisma.waitingList.findMany({
      where: { eventId, status: 'pending' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ waitingList });
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    res.status(500).json({ error: 'Failed to fetch waiting list' });
  }
});

// Approve waiting list entry and create registration
router.post('/:waitingId/approve', authenticateToken, authorizeHost, async (req, res) => {
  try {
    const waitingId = parseInt(req.params.waitingId);
    
    if (isNaN(waitingId)) {
      return res.status(400).json({ error: 'Invalid waiting list ID' });
    }

    // Get waiting list entry with all data
    const waitingEntry = await prisma.waitingList.findUnique({
      where: { id: waitingId },
      include: {
        user: true,
        event: {
          select: { hostId: true, title: true }
        }
      }
    });

    if (!waitingEntry) {
      return res.status(404).json({ error: 'Waiting list entry not found' });
    }

    // Verify host owns the event
    if (waitingEntry.event.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId: waitingEntry.eventId,
        userId: waitingEntry.userId
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'User is already registered for this event' });
    }

    // Start transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // Prepare participants data for registration
      let participantsData = [];
      if (waitingEntry.participants && Array.isArray(waitingEntry.participants) && waitingEntry.participants.length > 0) {
        participantsData = waitingEntry.participants.map(details => ({
          details: { ...(waitingEntry.responses || {}), ...(details || {}) }
        }));
      }

      // Create registration with ALL data from waiting list
      const registration = await tx.registration.create({
        data: {
          eventId: waitingEntry.eventId,
          userId: waitingEntry.userId,
          teamName: waitingEntry.teamName,
          responses: waitingEntry.responses, // All custom form responses
          paymentProof: waitingEntry.paymentProof, // Payment proof URL
          participants: {
            create: participantsData // All team participants
          }
        },
        include: {
          participants: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      // Auto-create RSVP for paid events (sub-event)
      const eventDetails = await tx.event.findUnique({ where: { id: waitingEntry.eventId } });
      if (eventDetails && eventDetails.paymentEnabled && waitingEntry.userId) {
        const existingRsvp = await tx.rsvp.findUnique({
          where: { eventId_userId: { eventId: waitingEntry.eventId, userId: waitingEntry.userId } }
        });
        if (!existingRsvp) {
          await tx.rsvp.create({ data: { eventId: waitingEntry.eventId, userId: waitingEntry.userId } });
          console.log('Auto-created RSVP for paid event (waiting list approval):', { eventId: waitingEntry.eventId, userId: waitingEntry.userId });
        }
        // Auto-create RSVP for parent (mega) event if applicable
        if (eventDetails.parentEventId) {
          const existingParentRsvp = await tx.rsvp.findUnique({
            where: { eventId_userId: { eventId: eventDetails.parentEventId, userId: waitingEntry.userId } }
          });
          if (!existingParentRsvp) {
            await tx.rsvp.create({ data: { eventId: eventDetails.parentEventId, userId: waitingEntry.userId } });
            console.log('Auto-created RSVP for parent mega event (waiting list approval):', { eventId: eventDetails.parentEventId, userId: waitingEntry.userId });
          }
        }
      }

      // Update waiting list status to approved
      await tx.waitingList.update({
        where: { id: waitingId },
        data: { status: 'approved' }
      });

      // Create WhatsApp notification if event has WhatsApp group enabled
      const event = await tx.event.findUnique({
        where: { id: waitingEntry.eventId },
        select: { whatsappGroupEnabled: true, whatsappGroupLink: true }
      });

      if (event?.whatsappGroupEnabled && event?.whatsappGroupLink) {
        try {
          await tx.whatsAppNotification.create({
            data: {
              userId: waitingEntry.userId,
              eventId: waitingEntry.eventId,
              eventTitle: waitingEntry.event.title,
              whatsappGroupLink: event.whatsappGroupLink
            }
          });
        } catch (error) {
          if (error.code !== 'P2002') { // Ignore duplicate notification errors
            console.error('Error creating WhatsApp notification:', error);
          }
        }
      }

      // Log data inside transaction where participantsData is in scope
      console.log('📊 Data transferred:', {
        userId: waitingEntry.userId,
        teamName: waitingEntry.teamName,
        hasResponses: !!waitingEntry.responses,
        hasPaymentProof: !!waitingEntry.paymentProof,
        participantsCount: participantsData.length,
        responsesData: waitingEntry.responses
      });

      return registration;
    });

    console.log(`🎉 TRANSACTION SUCCESS: Registration approved and user removed from waiting list: ${waitingEntry.user.name} (${waitingEntry.user.email}) for event: ${waitingEntry.event.title}`);

    res.json({ 
      success: true, 
      registration: result,
      message: 'Registration approved successfully'
    });

  } catch (error) {
    console.error('Error approving waiting list entry:', error);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
});

// Reject waiting list entry
router.post('/:waitingId/reject', authenticateToken, authorizeHost, async (req, res) => {
  try {
    const waitingId = parseInt(req.params.waitingId);
    
    if (isNaN(waitingId)) {
      return res.status(400).json({ error: 'Invalid waiting list ID' });
    }

    const waitingEntry = await prisma.waitingList.findUnique({
      where: { id: waitingId },
      include: {
        user: true,
        event: {
          select: { hostId: true, title: true }
        }
      }
    });

    if (!waitingEntry) {
      return res.status(404).json({ error: 'Waiting list entry not found' });
    }

    // Verify host owns the event
    if (waitingEntry.event.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update status to rejected
    await prisma.waitingList.update({
      where: { id: waitingId },
      data: { status: 'rejected' }
    });

    // Create a one-time rejection notification for the user
    try {
      await prisma.rejectionNotification.create({
        data: {
          userId: waitingEntry.user.id,
          eventId: waitingEntry.eventId,
          eventTitle: waitingEntry.event.title,
          rejectionReason: null // You can add a reason if available
        }
      });
    } catch (err) {
      if (err.code !== 'P2002') {
        console.error('Failed to create rejection notification:', err);
      }
      // Ignore duplicate notification errors
    }

    // Fetch host details for email
    const host = await prisma.user.findUnique({
      where: { id: waitingEntry.event.hostId },
      select: { name: true, email: true }
    });

    // Send rejection email (do not block response if it fails)
    sendRegistrationRejectionEmail({
      to: waitingEntry.user.email,
      name: waitingEntry.user.name,
      eventTitle: waitingEntry.event.title,
      hostName: host?.name || 'Event Host',
      hostEmail: host?.email || ''
    }).catch(e => console.error('Failed to send rejection email:', e));

    console.log(`❌ Registration rejected: ${waitingEntry.user.name} (${waitingEntry.user.email}) for event: ${waitingEntry.event.title}`);

    res.json({ 
      success: true, 
      message: 'Registration rejected successfully' 
    });

  } catch (error) {
    console.error('Error rejecting waiting list entry:', error);
    res.status(500).json({ error: 'Failed to reject registration' });
  }
});

// Get waiting list statistics
router.get('/:eventId/stats', authenticateToken, authorizeHost, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Verify host owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { hostId: true }
    });

    if (!event || event.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.waitingList.count({ where: { eventId } }),
      prisma.waitingList.count({ where: { eventId, status: 'pending' } }),
      prisma.waitingList.count({ where: { eventId, status: 'approved' } }),
      prisma.waitingList.count({ where: { eventId, status: 'rejected' } })
    ]);

    res.json({
      total,
      pending,
      approved,
      rejected,
      pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0,
      approvedPercentage: total > 0 ? Math.round((approved / total) * 100) : 0,
      rejectedPercentage: total > 0 ? Math.round((rejected / total) * 100) : 0
    });

  } catch (error) {
    console.error('Error fetching waiting list stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Bulk approve/reject waiting list entries
router.post('/:eventId/bulk-action', authenticateToken, authorizeHost, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { action, waitingIds } = req.body; // action: 'approve' or 'reject'
    
    if (isNaN(eventId) || !action || !Array.isArray(waitingIds) || waitingIds.length === 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Verify host owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { hostId: true }
    });

    if (!event || event.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (action === 'approve') {
      // Bulk approve - create registrations for all
      const results = await Promise.all(
        waitingIds.map(async (waitingId) => {
          try {
            const waitingEntry = await prisma.waitingList.findUnique({
              where: { id: waitingId },
              include: { user: true }
            });

            if (!waitingEntry || waitingEntry.eventId !== eventId) {
              return { waitingId, success: false, error: 'Invalid entry' };
            }

            // Check if already registered
            const existingRegistration = await prisma.registration.findFirst({
              where: {
                eventId: waitingEntry.eventId,
                userId: waitingEntry.userId
              }
            });

            if (existingRegistration) {
              return { waitingId, success: false, error: 'Already registered' };
            }

            // Prepare participants data
            let participantsData = [];
            if (waitingEntry.participants && Array.isArray(waitingEntry.participants) && waitingEntry.participants.length > 0) {
              participantsData = waitingEntry.participants.map(details => ({
                details: { ...(waitingEntry.responses || {}), ...(details || {}) }
              }));
            }

            // Create registration
            const registration = await prisma.registration.create({
              data: {
                eventId: waitingEntry.eventId,
                userId: waitingEntry.userId,
                teamName: waitingEntry.teamName,
                responses: waitingEntry.responses,
                paymentProof: waitingEntry.paymentProof,
                participants: {
                  create: participantsData
                }
              }
            });

            // Auto-create RSVP for paid events
            const eventDetails = await prisma.event.findUnique({ where: { id: waitingEntry.eventId } });
            if (eventDetails && eventDetails.paymentEnabled && waitingEntry.userId) {
              const existingRsvp = await prisma.rsvp.findUnique({
                where: { eventId_userId: { eventId: waitingEntry.eventId, userId: waitingEntry.userId } }
              });
              if (!existingRsvp) {
                await prisma.rsvp.create({ data: { eventId: waitingEntry.eventId, userId: waitingEntry.userId } });
                console.log('Auto-created RSVP for paid event (waiting list approval):', { eventId: waitingEntry.eventId, userId: waitingEntry.userId });
              }
            }

            // Update waiting list status
            await prisma.waitingList.update({
              where: { id: waitingId },
              data: { status: 'approved' }
            });

            return { waitingId, success: true, registration };
          } catch (error) {
            return { waitingId, success: false, error: error.message };
          }
        })
      );

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      res.json({
        success: true,
        message: `Bulk approval completed: ${successful} approved, ${failed} failed`,
        results
      });

    } else if (action === 'reject') {
      // Bulk reject
      const results = await Promise.all(
        waitingIds.map(async (waitingId) => {
          try {
            await prisma.waitingList.update({
              where: { id: waitingId },
              data: { status: 'rejected' }
            });
            return { waitingId, success: true };
          } catch (error) {
            return { waitingId, success: false, error: error.message };
          }
        })
      );

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      res.json({
        success: true,
        message: `Bulk rejection completed: ${successful} rejected, ${failed} failed`,
        results
      });

    } else {
      res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

// Check if current user is on the waiting list for an event
router.get('/:eventId/check', authenticateToken, async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  if (isNaN(eventId)) {
    return res.status(400).json({ onWaitingList: false, error: 'Invalid event ID' });
  }
  try {
    const entry = await prisma.waitingList.findFirst({
      where: {
        eventId,
        userId: req.user.id,
        status: 'pending'
      }
    });
    res.json({ onWaitingList: !!entry });
  } catch (error) {
    console.error('Waiting list check error:', error);
    res.status(500).json({ onWaitingList: false, error: 'Internal server error' });
  }
});

module.exports = router;
