// frontend/src/services/feedback.js
import api from './api'

export const fetchFeedbackForEvent = async (eventId) => {
  const response = await api.get(`/feedback?eventId=${eventId}`)
  return response.data
}

export const createFeedback = async (feedbackData) => {
  const response = await api.post('/api/feedback', feedbackData)
  return response.data
}

export const pinFeedback = async (feedbackId) => {
  const response = await api.put(`/api/feedback/${feedbackId}/pin`)
  return response.data
}

export const flagFeedback = async (feedbackId) => {
  const response = await api.put(`/api/feedback/${feedbackId}/flag`)
  return response.data
}