const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';

const { authenticateToken, authorizeHost } = require('../middleware/auth');

// Create test app
const createApp = () => {
  const app = express();
  app.use(express.json());
  
  app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ user: req.user });
  });
  
  app.get('/host-only', authenticateToken, authorizeHost, (req, res) => {
    res.status(200).json({ message: 'Welcome, host!' });
  });
  
  return app;
};

describe('🧪 Auth Middleware', () => {
  let app;
  let verifySpy;
  
  // Generate a valid test token
  const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  };

  beforeEach(() => {
    // Create spy before creating app
    verifySpy = jest.spyOn(jwt, 'verify');
    app = createApp();
  });
  
  afterEach(() => {
    verifySpy.mockRestore();
  });

  describe('🔐 authenticateToken', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/protected');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Access token missing or malformed');
    });

    it('should return 401 for malformed token format', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Access token missing or malformed');
    });

    it('should return 403 for invalid token', async () => {
      verifySpy.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid.token');

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Invalid or expired token');
    });

    it('should decode valid token and call next()', async () => {
      const mockUser = { id: 1, name: 'Test User', role: 'attendee' };
      const validToken = generateToken(mockUser);
      
      // Use real verification for this test
      verifySpy.mockRestore();

      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        role: expect.any(String)
      });
    });
  });

  describe('🛑 authorizeHost', () => {
    it('should return 403 if user is not a host', async () => {
      const attendeeToken = generateToken({ id: 2, role: 'attendee' });
      
      const res = await request(app)
        .get('/host-only')
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Access denied: Host only');
    });

    it('should allow access for host users', async () => {
      const hostToken = generateToken({ id: 3, role: 'host' });
      
      const res = await request(app)
        .get('/host-only')
        .set('Authorization', `Bearer ${hostToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Welcome, host!');
    });
  });
});