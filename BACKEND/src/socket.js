const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // Added missing jwt import

let io;

const initSocket = (server, prisma) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      console.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);
    
    // Join mega event room (only eventId)
    socket.on('joinMegaEvent', async (eventId) => {
      try {
        if (!eventId || isNaN(parseInt(eventId))) {
          console.warn('[SOCKET] joinMegaEvent: Missing or invalid eventId:', eventId);
          socket.emit('error', 'Missing or invalid eventId');
          return;
        }
        console.log(`[SOCKET] joinMegaEvent: user=${socket.user.id}, eventId=${eventId}`);
        const event = await prisma.event.findUnique({
          where: { id: parseInt(eventId) },
          include: {
            rsvps: {
              where: { userId: socket.user.id }
            }
          }
        });
        if (!event) {
          console.warn(`[SOCKET] joinMegaEvent: Event not found (eventId=${eventId})`);
          socket.emit('error', 'Event not found');
          return;
        }
        if (event.hostId !== socket.user.id && event.rsvps.length === 0) {
          console.warn(`[SOCKET] joinMegaEvent: Unauthorized access (user=${socket.user.id}, eventId=${eventId})`);
          socket.emit('error', 'Unauthorized access to event');
          return;
        }
        socket.join(`event_${eventId}`);
        socket.currentEventId = eventId;
        socket.currentSubeventId = null;
        console.log(`User ${socket.user.id} joined event_${eventId}`);
      } catch (error) {
        console.error('[SOCKET] Join mega event error:', error);
        socket.emit('error', 'Failed to join mega event');
      }
    });

    // Join subevent room (requires both eventId and subeventId)
    socket.on('joinSubEvent', async ({ eventId, subeventId }) => {
      try {
        if (!eventId || isNaN(parseInt(eventId)) || !subeventId || isNaN(parseInt(subeventId))) {
          console.warn('[SOCKET] joinSubEvent: Missing or invalid eventId or subeventId:', eventId, subeventId);
          socket.emit('error', 'Missing or invalid eventId or subeventId');
          return;
        }
        console.log(`[SOCKET] joinSubEvent: user=${socket.user.id}, eventId=${eventId}, subeventId=${subeventId}`);
        // Check parent event exists
        const parentEvent = await prisma.event.findUnique({
          where: { id: parseInt(eventId) }
        });
        if (!parentEvent) {
          socket.emit('error', 'Parent event not found');
          return;
        }
        // Check subevent exists and is a child of parent
        const subevent = await prisma.event.findUnique({
          where: { id: parseInt(subeventId) },
          include: {
            rsvps: {
              where: { userId: socket.user.id }
            }
          }
        });
        if (!subevent || subevent.parentEventId !== parseInt(eventId)) {
          socket.emit('error', 'Subevent not found or not a child of the specified event');
          return;
        }
        if (subevent.hostId !== socket.user.id && subevent.rsvps.length === 0) {
          socket.emit('error', 'Unauthorized access to subevent');
          return;
        }
        socket.join(`subevent_${subeventId}`);
        socket.currentEventId = eventId;
        socket.currentSubeventId = subeventId;
        console.log(`User ${socket.user.id} joined subevent_${subeventId}`);
      } catch (error) {
        console.error('[SOCKET] Join subevent error:', error);
        socket.emit('error', 'Failed to join subevent');
      }
    });

    // Keep joinEvent for backward compatibility (auto-detects type)
    socket.on('joinEvent', async ({ eventId, subeventId }) => {
      try {
        let joinId = eventId;
        let joinType = 'event';
        if (subeventId) {
          joinId = subeventId;
          joinType = 'subevent';
        }
        if (!joinId || isNaN(parseInt(joinId))) {
          socket.emit('error', `Missing or invalid ${joinType}Id`);
          return;
        }
        if (joinType === 'event') {
          socket.emit('info', 'Consider using joinMegaEvent for mega events.');
        } else {
          socket.emit('info', 'Consider using joinSubEvent for subevents.');
        }
        // Reuse previous logic
        if (joinType === 'event') {
          socket.emit('joinMegaEvent', eventId);
        } else {
          socket.emit('joinSubEvent', { eventId, subeventId });
        }
      } catch (error) {
        socket.emit('error', 'Failed to join event');
      }
    });
    
    // Handle feedback submission
    socket.on('sendFeedback', async ({ eventId, subeventId, content, emoji }) => {
      try {
        console.log('[SOCKET][Debug] sendFeedback called with:', { eventId, subeventId, content, emoji, user: socket.user });
        // Use authenticated user ID
        const userId = socket.user.id;

        // Determine which room to check
        let room = null;
        let targetId = null;
        if (subeventId) {
          room = `subevent_${subeventId}`;
          targetId = subeventId;
        } else {
          room = `event_${eventId}`;
          targetId = eventId;
        }

        // Debug: log current rooms
        console.log('[SOCKET][Debug] Current socket.rooms:', Array.from(socket.rooms));

        // Enforce: user must have joined the correct room before sending feedback
        if (!socket.rooms.has(room)) {
          console.warn(`[SOCKET] sendFeedback: Not in room (user=${userId}, room=${room})`);
          socket.emit('error', `You must join the ${subeventId ? 'subevent' : 'event'} before sending feedback.`);
          return;
        }

        // Create feedback in database
        const feedback = await prisma.feedback.create({
          data: {
            content: content || '',
            emoji: emoji || null,
            eventId: parseInt(targetId),
            userId: parseInt(userId)
          },
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        });
        console.log(`[SOCKET] Feedback created: id=${feedback.id}, eventId=${targetId}, userId=${userId}`);

        // Broadcast to everyone in the correct room
        io.to(room).emit('newFeedback', feedback);
      } catch (error) {
        console.error('[SOCKET] Send feedback error:', error);
        socket.emit('error', 'Failed to send feedback');
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => io;

// CommonJS exports
module.exports = {
  initSocket,
  getIo
};