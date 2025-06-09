// frontend/src/services/analytics.js
import api from './api'

export const fetchAnalytics = async (eventId) => {
  const response = await api.get(`/api/analytics/${eventId}`)
  return response.data
}