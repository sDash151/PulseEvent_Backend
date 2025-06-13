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
    
    // Join event room
    socket.on('joinEvent', async (eventId) => {
      try {
        console.log('[SOCKET][Debug] joinEvent called with:', { eventId, user: socket.user });
        console.log(`[SOCKET] joinEvent: user=${socket.user.id}, eventId=${eventId}`);
        // Verify user has access to event
        const event = await prisma.event.findUnique({
          where: { id: parseInt(eventId) },
          include: {
            rsvps: {
              where: { userId: socket.user.id }
            }
          }
        });
        
        if (!event) {
          console.warn(`[SOCKET] joinEvent: Event not found (eventId=${eventId})`);
          socket.emit('error', 'Event not found');
          return;
        }
        
        // Check if user is host or attendee
        if (event.hostId !== socket.user.id && event.rsvps.length === 0) {
          console.warn(`[SOCKET] joinEvent: Unauthorized access (user=${socket.user.id}, eventId=${eventId})`);
          socket.emit('error', 'Unauthorized access to event');
          return;
        }
        
        // Join the event room
        socket.join(`event_${eventId}`);
        console.log(`User ${socket.user.id} joined event_${eventId}`);
      } catch (error) {
        console.error('[SOCKET] Join event error:', error);
        socket.emit('error', 'Failed to join event');
      }
    });
    
    // Handle feedback submission
    socket.on('sendFeedback', async ({ eventId, content, emoji }) => {
      try {
        console.log('[SOCKET][Debug] sendFeedback called with:', { eventId, content, emoji, user: socket.user });
        console.log(`[SOCKET] sendFeedback: user=${socket.user.id}, eventId=${eventId}, content=${content}, emoji=${emoji}`);
        // Use authenticated user ID
        const userId = socket.user.id;
        
        // Verify user is in the event room
        if (!socket.rooms.has(`event_${eventId}`)) {
          console.warn(`[SOCKET] sendFeedback: Not in event room (user=${userId}, eventId=${eventId})`);
          socket.emit('error', 'Not in event room');
          return;
        }
        
        // Create feedback in database
        const feedback = await prisma.feedback.create({
          data: {
            content: content || '',
            emoji: emoji || null,
            eventId: parseInt(eventId),
            userId: parseInt(userId)
          },
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        });
        console.log(`[SOCKET] Feedback created: id=${feedback.id}, eventId=${eventId}, userId=${userId}`);
        
        // Broadcast to everyone in the event room
        io.to(`event_${eventId}`).emit('newFeedback', feedback);
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