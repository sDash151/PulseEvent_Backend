// frontend/src/services/rsvp.js
import api from './api'

export const rsvpToEvent = async (eventId) => {
  const response = await api.post(`/rsvp/${eventId}`)
  return response.data
}

export const checkInToEvent = async (eventId) => {
  const response = await api.post(`/api/rsvp/${eventId}/checkin`)
  return response.data
}