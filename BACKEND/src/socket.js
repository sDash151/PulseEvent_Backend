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
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.userId})`);
    
    // Join event room
    socket.on('joinEvent', async (eventId) => {
      try {
        // Verify user has access to event
        const event = await prisma.event.findUnique({
          where: { id: parseInt(eventId) },
          include: {
            rsvps: {
              where: { userId: socket.user.userId }
            }
          }
        });
        
        if (!event) {
          socket.emit('error', 'Event not found');
          return;
        }
        
        // Check if user is host or attendee
        if (event.hostId !== socket.user.userId && event.rsvps.length === 0) {
          socket.emit('error', 'Unauthorized access to event');
          return;
        }
        
        // Join the event room
        socket.join(`event_${eventId}`);
        console.log(`User ${socket.user.userId} joined event_${eventId}`);
      } catch (error) {
        console.error('Join event error:', error);
        socket.emit('error', 'Failed to join event');
      }
    });
    
    // Handle feedback submission
    socket.on('sendFeedback', async ({ eventId, content, emoji }) => {
      try {
        // Use authenticated user ID
        const userId = socket.user.userId;
        
        // Verify user is in the event room
        if (!socket.rooms.has(`event_${eventId}`)) {
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
        
        // Broadcast to everyone in the event room
        io.to(`event_${eventId}`).emit('newFeedback', feedback);
      } catch (error) {
        console.error('Send feedback error:', error);
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