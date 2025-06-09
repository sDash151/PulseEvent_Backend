// auth.test.js

const request = require('supertest');
const express = require('express');

// ✅ Mock the prisma module before importing the router
jest.mock('../index.js', () => ({
  prisma: {
    user: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Test User', email: 'test@example.com', role: 'host' }
      ]),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock auth middleware
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

process.env.JWT_SECRET = 'testsecret';

// ✅ Import the router after mocking
const authRouter = require('../routes/auth.js');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  describe('GET /auth/users', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/auth/users');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /auth/register', () => {
    it('should return 400 if fields are missing', async () => {
      const res = await request(app).post('/auth/register').send({});
      expect(res.statusCode).toBe(400);
    });
    // ✅ You can add more tests for successful registration
  });

  describe('POST /auth/login', () => {
    it('should return 400 if fields are missing', async () => {
      const res = await request(app).post('/auth/login').send({});
      expect(res.statusCode).toBe(400);
    });
    // ✅ Add success and failure scenarios for login
  });
});
