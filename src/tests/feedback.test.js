// jest.mock calls must be at the very top
jest.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: 'host', email: 'test@example.com', name: 'Test User' };
    next();
  },
  authorizeHost: (req, res, next) => {
    req.user = req.user || { id: 1, role: 'host' };
    next();
  }
}));
jest.mock('../utils/db.js', () => ({
  event: {
    findUnique: jest.fn()
  },
  feedback: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}));

const request = require('supertest');
const express = require('express');

describe('Feedback Routes', () => {
  let app, feedbackRoutes, prisma;

  beforeEach(() => {
    jest.resetModules();
    feedbackRoutes = require('../routes/feedback.js');
    prisma = require('../utils/db.js');
    app = express();
    app.use(express.json());
    app.use('/feedback', feedbackRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /feedback', () => {
    it('should return 400 if eventId is missing', async () => {
      const res = await request(app).post('/feedback').send({});
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if event is not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/feedback').send({ eventId: 1, content: 'Nice!' });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Event not found');
    });

    it('should return 400 if feedback is outside event time', async () => {
      prisma.event.findUnique.mockResolvedValue({
        startTime: new Date(Date.now() + 3600000), // +1hr
        endTime: new Date(Date.now() + 7200000)    // +2hr
      });
      const res = await request(app).post('/feedback').send({ eventId: 1, content: 'Too early' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 201 on successful feedback creation', async () => {
      const now = new Date();
      prisma.event.findUnique.mockResolvedValue({
        id: 1,
        startTime: new Date(now.getTime() - 1000),
        endTime: new Date(now.getTime() + 1000)
      });

      prisma.feedback.create.mockResolvedValue({
        id: 1,
        content: 'Nice Event',
        emoji: '🎉',
        eventId: 1,
        user: { id: 1, name: 'Test User' }
      });

      const res = await request(app).post('/feedback').send({ eventId: 1, content: 'Nice Event', emoji: '🎉' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('content', 'Nice Event');
      expect(res.body).toHaveProperty('emoji', '🎉');
    });
  });

  describe('PUT /feedback/:id/pin', () => {
    it('should return 400 for invalid feedback ID', async () => {
      const res = await request(app).put('/feedback/invalid/pin');
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if feedback not found', async () => {
      prisma.feedback.findUnique.mockResolvedValue(null);
      const res = await request(app).put('/feedback/1/pin');
      expect(res.statusCode).toBe(404);
    });

    it('should return 403 if host does not own the event', async () => {
      prisma.feedback.findUnique.mockResolvedValue({
        id: 1,
        isPinned: false,
        event: { hostId: 2 }
      });

      const res = await request(app).put('/feedback/1/pin');
      expect(res.statusCode).toBe(403);
    });

    it('should toggle pin status successfully', async () => {
      prisma.feedback.findUnique.mockResolvedValue({
        id: 1,
        isPinned: false,
        event: { hostId: 1 }
      });

      prisma.feedback.update.mockResolvedValue({
        id: 1,
        isPinned: true,
        user: { id: 1, name: 'Test User' }
      });

      const res = await request(app).put('/feedback/1/pin');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('isPinned', true);
    });
  });

  describe('PUT /feedback/:id/flag', () => {
    it('should return 400 for invalid feedback ID', async () => {
      const res = await request(app).put('/feedback/invalid/flag');
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if feedback not found', async () => {
      prisma.feedback.findUnique.mockResolvedValue(null);
      const res = await request(app).put('/feedback/1/flag');
      expect(res.statusCode).toBe(404);
    });

    it('should return 403 if host does not own the event', async () => {
      prisma.feedback.findUnique.mockResolvedValue({
        id: 1,
        isFlagged: false,
        event: { hostId: 2 }
      });

      const res = await request(app).put('/feedback/1/flag');
      expect(res.statusCode).toBe(403);
    });

    it('should toggle flag status successfully', async () => {
      prisma.feedback.findUnique.mockResolvedValue({
        id: 1,
        isFlagged: false,
        event: { hostId: 1 }
      });

      prisma.feedback.update.mockResolvedValue({
        id: 1,
        isFlagged: true,
        user: { id: 1, name: 'Test User' }
      });

      const res = await request(app).put('/feedback/1/flag');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('isFlagged', true);
    });
  });
});
