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
  }
}));

const request = require('supertest');
const express = require('express');

describe('Analytics Routes', () => {
  let app, analyticsRoutes, prisma;

  beforeEach(() => {
    jest.resetModules();
    analyticsRoutes = require('../routes/analytics.js');
    prisma = require('../utils/db.js');
    app = express();
    app.use(express.json());
    app.use('/analytics', analyticsRoutes);
  });

  it('should return 400 for invalid event ID', async () => {
    const res = await request(app).get('/analytics/invalid-id');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid event ID');
  });

  it('should return 404 for non-existent event', async () => {
    prisma.event.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/analytics/123');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Event not found');
  });

  it('should return 403 if host does not own the event', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 123,
      title: 'Sample Event',
      hostId: 99, // not matching req.user.id (1)
      rsvps: [],
      feedbacks: [],
      startTime: new Date(),
      endTime: new Date(),
    });

    const res = await request(app).get('/analytics/123');
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('should return analytics data for a valid event', async () => {
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    prisma.event.findUnique.mockResolvedValue({
      id: 123,
      title: 'Demo Event',
      hostId: 1,
      startTime: now,
      endTime: later,
      rsvps: [
        { checkedIn: true, user: { id: 2, name: 'User A' } },
        { checkedIn: false, user: { id: 3, name: 'User B' } },
      ],
      feedbacks: [
        { content: 'Great event!', emoji: '🎉', createdAt: now },
        { content: 'Could be better.', emoji: '😐', createdAt: now },
      ],
    });

    const res = await request(app).get('/analytics/123');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('eventId', 123);
    expect(res.body).toHaveProperty('eventTitle', 'Demo Event');
    expect(res.body).toHaveProperty('totalRsvps', 2);
    expect(res.body).toHaveProperty('totalCheckIns', 1);
    expect(res.body).toHaveProperty('feedbackCount', 2);
    expect(res.body).toHaveProperty('feedbackPerHour');
    expect(res.body).toHaveProperty('topEmojis');
    expect(res.body).toHaveProperty('topKeywords');
    expect(res.body).toHaveProperty('sentiment');
    expect(res.body).toHaveProperty('engagementRate');
  });

  it('should return 400 if event is missing startTime or endTime', async () => {
    // Missing startTime
    prisma.event.findUnique.mockResolvedValue({
      id: 123,
      title: 'No Start',
      hostId: 1,
      endTime: new Date(),
      rsvps: [],
      feedbacks: []
    });
    let res = await request(app).get('/analytics/123');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/startTime and endTime required/);

    // Missing endTime
    prisma.event.findUnique.mockResolvedValue({
      id: 123,
      title: 'No End',
      hostId: 1,
      startTime: new Date(),
      rsvps: [],
      feedbacks: []
    });
    res = await request(app).get('/analytics/123');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/startTime and endTime required/);
  });

  it('should return analytics with zeroes if no RSVPs or feedback', async () => {
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    prisma.event.findUnique.mockResolvedValue({
      id: 123,
      title: 'Empty Event',
      hostId: 1,
      startTime: now,
      endTime: later,
      rsvps: [],
      feedbacks: []
    });
    const res = await request(app).get('/analytics/123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      eventId: 123,
      eventTitle: 'Empty Event',
      totalRsvps: 0,
      totalCheckIns: 0,
      feedbackCount: 0
    });
    expect(res.body.feedbackPerHour).toBeDefined();
    expect(res.body.topEmojis).toBeDefined();
    expect(res.body.topKeywords).toBeDefined();
    expect(res.body.sentiment).toBeDefined();
    expect(res.body.engagementRate).toBeDefined();
  });
});
