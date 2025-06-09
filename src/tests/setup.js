const http = require('http');
const app = require('../app.js');

// Manual mock for middleware
jest.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1 }; // Mock logged-in user
    next();
  },
  authorizeHost: (req, res, next) => {
    next();
  }
}));

let server;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(0, () => done()); // 0 = random available port
});

afterAll((done) => {
  server.close(done);
});