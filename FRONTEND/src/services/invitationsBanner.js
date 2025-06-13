import api from './api';

export const getInvitationByToken = (token) =>
  api.get(`/api/invitations/token/${token}`);
