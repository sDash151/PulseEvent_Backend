// backend/src/app.js
require('dotenv').config(); // Add this at the top of app.js
const express = require('express')
const cors = require('cors')
const prisma = require('./utils/db.js')
const authRoutes = require('./routes/auth.js')
const eventRoutes = require('./routes/events.js')
const rsvpRoutes = require('./routes/rsvp.js')
const feedbackRoutes = require('./routes/feedback.js')
const analyticsRoutes = require('./routes/analytics.js')
const { authenticateToken } = require('./middleware/auth.js')
const invitationRouter = require('./routes/invitation.js')
const path = require('path')    

const app = express()

app.use(express.static(path.join(process.cwd(), 'public')))

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', authenticateToken, eventRoutes)
app.use('/api/rsvp', authenticateToken, rsvpRoutes)
app.use('/api/feedback', authenticateToken, feedbackRoutes)
app.use('/api/analytics', authenticateToken, analyticsRoutes)
app.use('/api/invitations', invitationRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Catch-all route for client-side routing (after all API routes, before error handler)
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

module.exports = app
module.exports.prisma = prisma
