// frontend/src/services/auth.js
import api from './api'

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data.token
  } catch (error) {
    const errorData = error.response?.data
    if (errorData?.code === 'ACCOUNT_NOT_FOUND') {
      throw new Error('No account found with this email. Please create an account first.')
    } else if (errorData?.code === 'INVALID_PASSWORD') {
      throw new Error('Incorrect password. Please try again.')
    } else if (errorData?.message) {
      throw new Error(errorData.message)
    } else {
      throw new Error('Login failed. Please check your credentials and try again.')
    }
  }
}

export const registerUser = async (name, email, password, role, collegeName, collegeState, collegeDistrict, degreeName, specializationName) => {
  try {
    const response = await api.post('/api/auth/register', { 
      name, 
      email, 
      password, 
      role, 
      collegeName, 
      collegeState, 
      collegeDistrict, 
      degreeName, 
      specializationName 
    })
    // Return both message and token for robust UI handling
    return { message: response.data.message, token: response.data.token };
  } catch (error) {
    const errorData = error.response?.data
    if (errorData?.code === 'ACCOUNT_EXISTS') {
      throw new Error('An account with this email already exists. Please sign in instead.')
    } else if (errorData?.message) {
      // Pass through backend error messages for disposable email, rate limit, etc.
      throw new Error(errorData.message)
    } else {
      throw new Error('Registration failed. Please try again.')
    }
  }
}

export const getCurrentUser = async () => {
  try {
    // Check if token exists before making request
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await api.get('/api/auth/me')
    return response.data
  } catch (error) {
    const errorData = error.response?.data
    
    // Handle different types of authentication errors
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token')
      throw new Error('Authentication failed. Please log in again.')
    } else if (error.response?.status === 403) {
      // User doesn't have permission
      throw new Error('Access denied. You do not have permission to perform this action.')
    } else if (error.response?.status === 404) {
      // User not found
      localStorage.removeItem('token')
      throw new Error('User account not found. Please log in again.')
    } else if (errorData?.message) {
      throw new Error(errorData.message)
    } else if (error.message === 'No authentication token found') {
      throw error
    } else {
      throw new Error('Failed to fetch user data. Please try again.')
    }
  }
}

// Add a function to validate token without making API call
export const validateToken = () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return false
    }
    
    // Basic token validation (you could also decode and check expiration)
    return token.length > 0
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

// Add a function to refresh token
export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token to refresh')
    }

    const response = await api.post('/api/auth/refresh')
    const newToken = response.data.token
    localStorage.setItem('token', newToken)
    return newToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    localStorage.removeItem('token')
    throw new Error('Session expired. Please log in again.')
  }
}

// Add a function to resend verification email
export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/api/auth/resend-verification', { email });
    // Return the full response for cooldown logic
    return response.data;
  } catch (error) {
    // Always return generic message for security
    return { message: 'If your email is registered and not verified, a new verification email has been sent.', sent: false };
  }
};

// Request password reset (forgot password)
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    // Return the full response for cooldown logic
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    if (errorData?.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error('Failed to send reset email. Please try again.');
    }
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/api/auth/reset-password', { token, password });
    return response.data.message;
  } catch (error) {
    const errorData = error.response?.data;
    if (errorData?.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error('Failed to reset password. The link may be expired or invalid.');
    }
  }
};

// Get verification token status for a user (for accurate resend timer)
export const getVerificationStatus = async (email) => {
  try {
    const response = await api.get(`/api/auth/verification-status?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    return { hasToken: false };
  }
};

// Get password reset token status for a user (for accurate resend timer)
export const getResetStatus = async (email) => {
  try {
    const response = await api.get(`/api/auth/reset-status?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    return { hasToken: false };
  }
};