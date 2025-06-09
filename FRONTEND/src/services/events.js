// frontend/src/services/events.js
import api from './api'

export const fetchEvents = async () => {
  const response = await api.get('/api/events')
  return response.data
}

export const fetchEventById = async (id) => {
  const response = await api.get(`/api/events/${id}`)
  return response.data
}

export const createEvent = async (eventData) => {
  const response = await api.post('/api/events', eventData)
  return response.data
}

export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/api/events/${id}`, eventData)
  return response.data
}

export const deleteEvent = async (id) => {
  const response = await api.delete(`/api/events/${id}`)
  return response.data
}