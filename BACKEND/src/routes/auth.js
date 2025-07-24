const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeHost } = require('../middleware/auth.js');
const prisma = require('../utils/db.js');
const { sendInvitationEmail, sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeNotification } = require('../utils/email.js');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const disposableDomains = require('disposable-email-domains');
const { parse } = require('tldts');

const router = express.Router();
const saltRounds = 10;

// Rate limiters
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 registration requests per windowMs
  message: { message: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const passwordResetLimiter10Min = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  handler: (req, res) => {
    return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link shortly.' });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const passwordResetLimiterDay = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  handler: (req, res) => {
    return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link shortly.' });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password strength regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// 👥 Fetch all users (host-only)
router.get('/users', authenticateToken, authorizeHost, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB fetch error' });
  }
});

// 📝 Register
router.post('/register', registerLimiter, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    console.log('[REGISTER] Missing fields:', { name, email, password });
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' });
  }

  // Block disposable emails
  const domain = parse(email).domain;
  if (domain && disposableDomains.includes(domain)) {
    console.log('[REGISTER] Disposable email blocked:', email);
    return res.status(400).json({ message: 'Disposable/temporary email addresses are not allowed. Please use a real email.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.verified) {
        console.log('[REGISTER] User already verified:', email);
        return res.status(400).json({
          message: 'Account already exists',
          details: 'An account with this email address already exists. Please sign in instead.',
          code: 'ACCOUNT_EXISTS'
        });
      } else {
        // User exists but not verified
        // Check for existing valid token
        const existingToken = await prisma.emailVerificationToken.findFirst({
          where: {
            userId: existingUser.id,
            expiresAt: { gt: new Date() }
          },
          orderBy: { expiresAt: 'desc' }
        });
        if (existingToken) {
          console.log('[REGISTER] Valid token exists for user:', email, 'Token expires at:', existingToken.expiresAt);
          // Valid token exists, do not send another email
          return res.status(200).json({
            message: 'A verification email has already been sent. Please check your inbox and verify your email. If you did not receive it, you can resend after it expires.'
          });
        }
        // No valid token, remove old tokens and send new one
        await prisma.emailVerificationToken.deleteMany({ where: { userId: existingUser.id } });
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
        await prisma.emailVerificationToken.create({
          data: {
            userId: existingUser.id,
            token,
            expiresAt
          }
        });
        await sendVerificationEmail({ to: email, name, verificationToken: token });
        console.log('[REGISTER] Sent new verification email to existing user:', email);
        return res.status(200).json({
          message: 'Email not verified. Verification email resent. Please check your inbox.'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'attendee',
        verified: false
      }
    });

    // Link any pending invitations for this email to the new user
    await prisma.invitation.updateMany({
      where: {
        email: user.email,
        invitedUserId: null
      },
      data: {
        invitedUserId: user.id
      }
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });
    await sendVerificationEmail({ to: email, name, verificationToken: token });
    console.log('[REGISTER] Sent verification email to new user:', email);

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  const siteUrl = process.env.CLIENT_URL || 'https://eventpulse1.netlify.app';
  if (!token) {
    return res.redirect(`${siteUrl}/email-verified?status=error`);
  }
  try {
    const record = await prisma.emailVerificationToken.findUnique({ where: { token }, include: { user: true } });
    if (!record) {
      return res.redirect(`${siteUrl}/email-verified?status=expired`);
    }
    if (record.user.verified) {
      // Already verified
      await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });
      return res.redirect(`${siteUrl}/email-verified?status=already`);
    }
    if (record.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { token } });
      return res.redirect(`${siteUrl}/email-verified?status=expired`);
    }
    // Mark user as verified
    await prisma.user.update({ where: { id: record.userId }, data: { verified: true } });
    // Delete all tokens for this user
    await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });
    // Redirect to frontend with success
    res.redirect(`${siteUrl}/email-verified?status=success`);
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect(`${siteUrl}/email-verified?status=error`);
  }
});

// 🔐 Login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: 'Account not found',
        details: 'No account exists with this email address. Please create an account first.',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        message: 'Email not verified',
        details: 'Please verify your email before logging in. Check your inbox for the verification link.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid password',
        details: 'The password you entered is incorrect. Please try again.',
        code: 'INVALID_PASSWORD'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔄 Refresh Token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 👤 Get Current User
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend verification email endpoint
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    console.log('[RESEND] No email provided');
    return res.status(200).json({ message: 'If your email is registered and not verified, a new verification email has been sent.', sent: false });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.verified) {
      // Check for existing valid token
      const existingToken = await prisma.emailVerificationToken.findFirst({
        where: {
          userId: user.id,
          expiresAt: { gt: new Date() }
        },
        orderBy: { expiresAt: 'desc' }
      });
      if (existingToken) {
        console.log('[RESEND] Valid token exists for user:', email, 'Token expires at:', existingToken.expiresAt);
        // Valid token exists, do not send another email
        return res.status(200).json({
          message: 'A verification email has already been sent. Please check your inbox and verify your email. If you did not receive it, you can resend after it expires.',
          sent: false,
          nextAllowedAt: existingToken.expiresAt
        });
      }
      // No valid token, remove old tokens and send new one
      await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt
        }
      });
      await sendVerificationEmail({ to: email, name: user.name, verificationToken: token });
      console.log('[RESEND] Sent new verification email to user:', email);
      return res.status(200).json({
        message: 'A verification email has been sent. Please check your inbox.',
        sent: true,
        nextAllowedAt: expiresAt
      });
    } else {
      console.log('[RESEND] User not found or already verified:', email);
    }
    // Always respond with generic message
    res.status(200).json({ message: 'If your email is registered and not verified, a new verification email has been sent.', sent: false });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(200).json({ message: 'If your email is registered and not verified, a new verification email has been sent.', sent: false });
  }
});

// Forgot Password - Request Reset
router.post('/forgot-password', passwordResetLimiter10Min, passwordResetLimiterDay, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link shortly.', sent: false });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Check for existing valid token (10 min window)
      const existingToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          expiresAt: { gt: new Date() }
        },
        orderBy: { expiresAt: 'desc' }
      });
      if (existingToken) {
        // If a valid token exists, do not send another email
        return res.status(200).json({
          message: 'If your email is registered, you will receive a password reset link shortly.',
          sent: false,
          nextAllowedAt: existingToken.expiresAt
        });
      }
      // Remove old tokens
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      // Generate new token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
      await prisma.passwordResetToken.create({
        data: { userId: user.id, token: tokenHash, expiresAt }
      });
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetToken: rawToken });
      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link shortly.',
        sent: true,
        nextAllowedAt: expiresAt
      });
    }
    // Always respond with generic message
    return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link shortly.', sent: false });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link shortly.', sent: false });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' });
  }
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await prisma.passwordResetToken.findUnique({ where: { token: tokenHash }, include: { user: true } });
    if (!record || record.expiresAt < new Date()) {
      if (record) await prisma.passwordResetToken.delete({ where: { token: tokenHash } });
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword, passwordChangedAt: new Date() } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } });
    // Send notification email
    await sendPasswordChangeNotification({ to: record.user.email, name: record.user.name });
    // (Next step: send notification email and handle session invalidation)
    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get verification token status for a user (for accurate resend timer)
router.get('/verification-status', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verified) {
      return res.status(200).json({ hasToken: false });
    }
    const existingToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() }
      },
      orderBy: { expiresAt: 'desc' }
    });
    if (existingToken) {
      return res.status(200).json({ hasToken: true, nextAllowedAt: existingToken.expiresAt });
    } else {
      return res.status(200).json({ hasToken: false });
    }
  } catch (error) {
    console.error('Verification status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get password reset token status for a user (for accurate resend timer)
router.get('/reset-status', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ hasToken: false });
    }
    const existingToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() }
      },
      orderBy: { expiresAt: 'desc' }
    });
    if (existingToken) {
      return res.status(200).json({ hasToken: true, nextAllowedAt: existingToken.expiresAt });
    } else {
      return res.status(200).json({ hasToken: false });
    }
  } catch (error) {
    console.error('Reset status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
