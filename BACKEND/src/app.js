// backend/src/app.js
require('dotenv').config(); // Add this at the top of app.js
const express = require('express')
const cors = require('cors')
const prisma = require('./utils/db.js')
const authRoutes = require('./routes/auth.js')
const { router: eventRoutes, getFeaturedEventsHandler } = require('./routes/events.js');
const rsvpRoutes = require('./routes/rsvp.js')
const feedbackRoutes = require('./routes/feedback.js')
const analyticsRoutes = require('./routes/analytics.js')
const { authenticateToken } = require('./middleware/auth.js')
const invitationRouter = require('./routes/invitation.js')
const path = require('path')    

const app = express()
app.set('trust proxy', 1); // Trust first proxy (Render, Heroku, etc.)

app.use(express.static(path.join(process.cwd(), 'public')))

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())

// Debug: Test route to check if routing is working
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working', timestamp: new Date().toISOString() })
})

// Debug: Log route loading
console.log('Loading routes...')

// Public routes (no authentication required)
app.use('/api/auth', authRoutes)
// Register the featured events handler as a public route
app.get('/api/events/featured', getFeaturedEventsHandler);
console.log('✓ Featured events route loaded at /api/events/featured (PUBLIC)')
console.log('✓ Auth routes loaded at /api/auth')

// Protected routes (authentication required)
app.use('/api/events', authenticateToken, eventRoutes)
console.log('✓ Event routes loaded at /api/events (PROTECTED)')

app.use('/api/rsvp', authenticateToken, rsvpRoutes)
app.use('/api/feedback', authenticateToken, feedbackRoutes)
app.use('/api/analytics', authenticateToken, analyticsRoutes)
console.log('✓ RSVP, Feedback, Analytics routes loaded (PROTECTED)')

app.use('/api/invitations', authenticateToken, invitationRouter);
console.log('✓ Invitation routes loaded at /api/invitations (PROTECTED)')

app.use('/api/user', authenticateToken, require('./routes/user.js'));
app.use('/api', authenticateToken, require('./routes/registration.js'));
app.use('/api/waiting-list', authenticateToken, require('./routes/waitingList.js'));
app.use('/api', authenticateToken, require('./routes/upload.js'));
app.use('/api', authenticateToken, require('./routes/whatsappNotifications.js'));
app.use('/api', authenticateToken, require('./routes/rejectionNotifications.js'));
console.log('✓ User, Registration, WaitingList, Upload, WhatsApp, RejectionNotification routes loaded (PROTECTED)');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Debug: List all registered routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`Route: ${Object.keys(r.route.methods)} ${r.route.path}`)
  }
})

// Catch-all route for client-side routing (after all API routes, before error handler)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

module.exports = app
module.exports.prisma = prisma
