// frontend/src/utils/securityUtils.js

/**
 * Security utilities for role checking and access control
 */

/**
 * Validate JWT token structure and expiration
 * @param {string} token - JWT token to validate
 * @returns {boolean} - True if token is valid
 */
export const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  try {
    // Basic JWT structure validation (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    // Check for required fields
    if (!payload.id || !payload.email || !payload.name) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

/**
 * Check if user has required role
 * @param {Object} user - User object with role property
 * @param {string} requiredRole - Required role ('host', 'attendee')
 * @returns {boolean} - True if user has required role
 */
export const hasRole = (user, requiredRole) => {
  if (!user || !user.role) {
    return false;
  }

  return user.role === requiredRole;
};

/**
 * Check if user can access host features
 * @param {Object} user - User object
 * @returns {boolean} - True if user can access host features
 */
export const canAccessHostFeatures = (user) => {
  return hasRole(user, 'host');
};

/**
 * Check if user is the host of a specific event
 * @param {Object} user - User object
 * @param {Object} event - Event object with hostId
 * @returns {boolean} - True if user is the event host
 */
export const isEventHost = (user, event) => {
  if (!user || !event || !user.id || !event.hostId) {
    console.log('❌ isEventHost check failed:', { 
      hasUser: !!user, 
      hasEvent: !!event, 
      userId: user?.id, 
      eventHostId: event?.hostId,
      userKeys: user ? Object.keys(user) : null,
      eventKeys: event ? Object.keys(event) : null
    });
    return false;
  }

  // Convert both IDs to strings for comparison to handle different types
  const userId = String(user.id);
  const eventHostId = String(event.hostId);
  
  const isHost = userId === eventHostId;
  
  console.log('🔍 isEventHost comparison:', { 
    userId, 
    eventHostId, 
    isHost,
    userType: typeof user.id,
    eventHostType: typeof event.hostId,
    userObject: { id: user.id, role: user.role },
    eventObject: { id: event.id, hostId: event.hostId }
  });

  return isHost;
};

/**
 * Sanitize user input for security
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if current session is secure
 * @returns {boolean} - True if session is secure
 */
export const isSecureSession = () => {
  // Check if running on HTTPS
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
    return false;
  }

  // Check if token exists and is valid
  const token = localStorage.getItem('token');
  if (!validateToken(token)) {
    return false;
  }

  return true;
};

/**
 * Log security events for monitoring
 * @param {string} event - Security event type
 * @param {Object} details - Event details
 */
export const logSecurityEvent = (event, details = {}) => {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.warn('🔐 Security Event:', securityEvent);
  
  // In production, you might want to send this to a logging service
  // Example: sendToLoggingService(securityEvent);
};

/**
 * Rate limiting utility for client-side protection
 */
export class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   * @param {string} key - Rate limit key (e.g., user ID, IP)
   * @returns {boolean} - True if request is allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  /**
   * Clear rate limit for a key
   * @param {string} key - Rate limit key
   */
  clear(key) {
    this.requests.delete(key);
  }
}

/**
 * Create a rate limiter instance for authentication attempts
 */
export const authRateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute

/**
 * Check if authentication attempt is allowed
 * @param {string} identifier - User identifier (email, IP, etc.)
 * @returns {boolean} - True if authentication attempt is allowed
 */
export const isAuthAttemptAllowed = (identifier) => {
  return authRateLimiter.isAllowed(identifier);
};

/**
 * Clear authentication rate limit for a user
 * @param {string} identifier - User identifier
 */
export const clearAuthRateLimit = (identifier) => {
  authRateLimiter.clear(identifier);
}; 