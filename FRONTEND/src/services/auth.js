// frontend/src/services/auth.js
import api from './api'

export const loginUser = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data.token
}

export const registerUser = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password })
  return response.data.token
}

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me')
  return response.data
}