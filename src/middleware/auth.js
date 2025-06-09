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
};
