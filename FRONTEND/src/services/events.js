// frontend/src/services/events.js
import api from './api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export const updateSubEvent = async (subEventId, subEventData) => {
  const response = await api.put(`/api/events/${subEventId}/sub-event`, subEventData);
  return response.data;
};

// Fetch featured events for homepage (mega events only)
export const getFeaturedEvents = async () => {
  try {
    // Check if API_BASE_URL is available
    if (!API_BASE_URL) {
      console.warn('VITE_API_BASE_URL not set, skipping featured events fetch');
      return [];
    }

    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add auth header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Fetching featured events from:', `${API_BASE_URL}/api/events/featured`);

    const response = await fetch(`${API_BASE_URL}/api/events/featured`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Featured events API error:', response.status, errorText);
      // Don't throw error, just return empty array
      return [];
    }

    const data = await response.json();
    console.log('Featured events response:', data);
    return data.events || [];
  } catch (error) {
    console.error('Error fetching featured events:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};