// jest.mock calls must be at the very top
jest.doMock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 2, role: 'host', email: 'host@example.com', name: 'Host User' }; // Simulate authorized host user
    next();
  },
  authorizeHost: (req, res, next) => {
    if (req.user.role !== 'host') {
      return res.status(403).json({ message: 'Access denied: Host only' });
    }
    next();
  }
}));
jest.mock('../utils/db.js', () => ({
  event: {
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([
      { id: 1, title: 'Mock Event', description: 'Desc' }
    ]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

const request = require('supertest');
const express = require('express');

describe('Events Routes', () => {
  let app, eventRoutes, prisma;

  beforeEach(() => {
    jest.resetModules();
    eventRoutes = require('../routes/events.js');
    prisma = require('../utils/db.js');
    app = express();
    app.use(express.json());
    app.use('/events', eventRoutes);
  });

  it('GET /events should return list of events', async () => {
    const res = await request(app).get('/events');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { id: 1, title: 'Mock Event', description: 'Desc' }
    ]);
  });

  it('POST /events should create a new event', async () => {
    const newEvent = {
      title: 'New',
      description: 'Event',
      location: 'Test Location',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      rsvpDeadline: new Date(Date.now() + 1800000).toISOString(),
      maxAttendees: 100
    };
    prisma.event.create.mockResolvedValue({ ...newEvent, id: 2 });
    const res = await request(app).post('/events').send(newEvent);
    expect(res.statusCode).toBe(201);
  });

  it('should return 403 for unauthorized POST/PUT/DELETE', async () => {
    jest.resetModules();
    jest.doMock('../middleware/auth.js', () => ({
      authenticateToken: (req, res, next) => {
        req.user = { id: 2, role: 'attendee', email: 'attendee@example.com', name: 'Attendee User' }; // Simulate unauthorized user
        next();
      },
      authorizeHost: (req, res, next) => {
        if (req.user.role !== 'host') {
          return res.status(403).json({ message: 'Access denied: Host only' });
        }
        next();
      }
    }));
    const eventRoutes = require('../routes/events.js');
    const app = express();
    app.use(express.json());
    app.use('/events', eventRoutes);

    // POST
    let res = await request(app).post('/events').send({});
    expect(res.statusCode).toBe(403);
    // PUT
    res = await request(app).put('/events/1').send({});
    expect(res.statusCode).toBe(403);
    // DELETE
    res = await request(app).delete('/events/1');
    expect(res.statusCode).toBe(403);
  });

  it('should return 400 if required fields are missing on POST', async () => {
    jest.resetModules();
    jest.doMock('../middleware/auth.js', () => ({
      authenticateToken: (req, res, next) => {
        req.user = { id: 2, role: 'host', email: 'host@example.com', name: 'Host User' }; // Simulate authorized host user
        next();
      },
      authorizeHost: (req, res, next) => {
        if (req.user.role !== 'host') {
          return res.status(403).json({ message: 'Access denied: Host only' });
        }
        next();
      }
    }));
    const eventRoutes = require('../routes/events.js');
    const app = express();
    app.use(express.json());
    app.use('/events', eventRoutes);

    const incompleteEvent = { title: 'Missing Fields' };
    const res = await request(app).post('/events').send(incompleteEvent);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
  });

  it('should return 409 for duplicate event creation', async () => {
    jest.resetModules();
    const prisma = require('../utils/db.js');
    jest.doMock('../middleware/auth.js', () => ({
      authenticateToken: (req, res, next) => {
        req.user = { id: 2, role: 'host', email: 'host@example.com', name: 'Host User' }; // Simulate authorized host user
        next();
      },    
      authorizeHost: (req, res, next) => {
        if (req.user.role !== 'host') {
          return res.status(403).json({ message: 'Access denied: Host only' });
        }
        next();
      }
    }));
    const eventRoutes = require('../routes/events.js');
    const app = express();
    app.use(express.json());
    app.use('/events', eventRoutes);

    const newEvent = {
      title: 'Duplicate',
      description: 'Event',
      location: 'Test Location',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      rsvpDeadline: new Date(Date.now() + 1800000).toISOString(),
      maxAttendees: 100
    };

    // Simulate unique constraint error
    prisma.event.create.mockImplementation(() => {
      const err = new Error('Unique constraint failed');
      err.code = 'P2002';
      throw err;
    });

    const res = await request(app).post('/events').send(newEvent);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already exists|duplicate/i);
  });

  // More tests for PUT, DELETE, edge cases...
});
