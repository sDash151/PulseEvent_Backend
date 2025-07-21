import api from './api';

export const getInvitationByToken = (token) =>
  api.get(`/invitations/token/${token}`);
