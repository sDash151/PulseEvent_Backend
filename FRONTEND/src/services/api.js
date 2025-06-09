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
    if (status === 401 || status === 403) {
      console.warn('Session expired or invalid token, logging out...')
      localStorage.removeItem('token')
      // Redirect user to login page (adjust path as needed)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
