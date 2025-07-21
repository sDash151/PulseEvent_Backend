import api from './api';

export const sendInvitations = (eventId, emails) => 
  api.post('/api/invitations', { eventId, emails });

export const getEventInvitations = (eventId) => 
  api.get(`/invitations/event/${eventId}`);

export const acceptInvitation = (token) => 
  api.patch(`/api/invitations/${token}/accept`);