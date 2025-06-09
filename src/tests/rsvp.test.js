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
    findUnique: jest.fn(),
    rsvps: []
  },
  rsvp: {
    create: jest.fn(),
    update: jest.fn()
  }
}));

const request = require('supertest');
const express = require('express');

describe('RSVP Routes', () => {
  let app, rsvpRoutes, prisma;

  beforeEach(() => {
    jest.resetModules();
    rsvpRoutes = require('../routes/rsvp.js');
    prisma = require('../utils/db.js');
    app = express();
    app.use(express.json());
    app.use('/rsvp', rsvpRoutes);
  });

  // ========== RSVP ==========
  describe('POST /rsvp/:eventId', () => {
    it('should return 400 for invalid event ID', async () => {
      const res = await request(app).post('/rsvp/invalid');
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if event not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/rsvp/123');
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 if RSVP deadline passed', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        rsvpDeadline: new Date(Date.now() - 1000),
        rsvps: []
      });

      const res = await request(app).post('/rsvp/123');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/RSVP deadline has passed/);
    });

    it('should return 400 if already RSVPed', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        rsvpDeadline: new Date(Date.now() + 100000),
        maxAttendees: 5,
        rsvps: [{ userId: 1 }]
      });

      const res = await request(app).post('/rsvp/123');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Already RSVP'd/);
    });

    it('should return 400 if event is full', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        rsvpDeadline: new Date(Date.now() + 100000),
        maxAttendees: 1,
        rsvps: [{ userId: 2 }]
      });

      const res = await request(app).post('/rsvp/123');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/full capacity/);
    });

    it('should RSVP successfully', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        rsvpDeadline: new Date(Date.now() + 100000),
        maxAttendees: 5,
        rsvps: []
      });

      prisma.rsvp.create.mockResolvedValue({
        id: 10,
        eventId: 123,
        userId: 1,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      });

      const res = await request(app).post('/rsvp/123');
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('user');
    });
  });

  // ========== USER CHECK-IN ==========
  describe('POST /rsvp/:eventId/checkin', () => {
    it('should return 400 if user never RSVP\'d', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        startTime: new Date(Date.now() - 1000),
        endTime: new Date(Date.now() + 1000000),
        rsvps: []
      });

      const res = await request(app).post('/rsvp/123/checkin');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/must RSVP/);
    });

    it('should return 400 if already checked in', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        startTime: new Date(Date.now() - 1000),
        endTime: new Date(Date.now() + 1000000),
        rsvps: [{ userId: 1, checkedIn: true }]
      });

      const res = await request(app).post('/rsvp/123/checkin');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Already checked in/);
    });

    it('should return 400 if check-in is outside allowed time', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        startTime: new Date(Date.now() + 2 * 3600000), // 2hr from now
        endTime: new Date(Date.now() + 3 * 3600000),
        rsvps: [{ userId: 1, checkedIn: false, id: 10 }]
      });

      const res = await request(app).post('/rsvp/123/checkin');
      expect(res.statusCode).toBe(400);
    });

    it('should successfully check in', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        startTime: new Date(Date.now() + 300000), // 5min from now
        endTime: new Date(Date.now() + 3600000), // 1hr
        rsvps: [{ userId: 1, checkedIn: false, id: 10 }]
      });

      prisma.rsvp.update.mockResolvedValue({
        id: 10,
        userId: 1,
        checkedIn: true,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      });

      const res = await request(app).post('/rsvp/123/checkin');
      expect(res.statusCode).toBe(200);
      expect(res.body.checkedIn).toBe(true);
    });
  });

  // ========== HOST CHECK-IN ==========
  describe('POST /rsvp/:eventId/checkin/:userId', () => {
    it('should return 400 for invalid IDs', async () => {
      const res = await request(app).post('/rsvp/abc/checkin/xyz');
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if event not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/rsvp/123/checkin/1');
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 if user has not RSVP\'d', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        rsvps: []
      });

      const res = await request(app).post('/rsvp/123/checkin/2');
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if user already checked in', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        rsvps: [{ userId: 2, checkedIn: true }]
      });

      const res = await request(app).post('/rsvp/123/checkin/2');
      expect(res.statusCode).toBe(400);
    });

    it('should allow host to check in a user', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 123,
        rsvps: [{ userId: 2, checkedIn: false, id: 33 }]
      });

      prisma.rsvp.update.mockResolvedValue({
        id: 33,
        checkedIn: true,
        user: {
          id: 2,
          name: 'Attendee',
          email: 'attendee@example.com'
        }
      });

      const res = await request(app).post('/rsvp/123/checkin/2');
      expect(res.statusCode).toBe(200);
      expect(res.body.checkedIn).toBe(true);
    });
  });
});