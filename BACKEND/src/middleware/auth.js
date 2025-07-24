const jwt = require('jsonwebtoken');
const prisma = require('../utils/db'); // adjust if needed

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token missing or malformed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        sentInvitations: true,
        receivedInvitations: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Session invalidation: check if passwordChangedAt is after token's iat
    if (user.passwordChangedAt) {
      const passwordChangedAt = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < passwordChangedAt) {
        return res.status(403).json({ message: 'Session invalidated. Please log in again.' });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authorizeHost = (req, res, next) => {
  if (req.user && req.user.role === 'host') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Host only' });
};

module.exports = {
  authenticateToken,
  authorizeHost,
  ensureAuth: (req, res, next) => {
    if (req.user && req.user.id) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
