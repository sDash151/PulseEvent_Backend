// frontend/src/services/api.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||"https://pulseevent-backend.onrender.com"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Request interceptor to add the auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle expired/invalid tokens
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    const url = error.config?.url
    
    console.log(`[API Interceptor] ${status} error for ${url}:`, error.response?.data)
    
    // Handle authentication errors for protected endpoints
    if (status === 401 || status === 403) {
      // Always handle auth errors for these endpoints
      const protectedEndpoints = [
        '/auth/me',
        '/events',
        '/rsvp',
        '/feedback', 
        '/analytics',
        '/invitations',
        '/user',
        '/registration',
        '/waitingList',
        '/upload',
        '/whatsappNotifications'
      ]
      
      const isProtectedEndpoint = protectedEndpoints.some(endpoint => 
        url?.includes(endpoint)
      )
      
      if (isProtectedEndpoint) {
        console.warn('Session expired or invalid token, logging out...')
        localStorage.removeItem('token')
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
