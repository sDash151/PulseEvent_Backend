import api from './api';

// Get unread WhatsApp notifications for the current user
export const getWhatsAppNotifications = async () => {
  const response = await api.get('/api/whatsapp-notifications');
  return response.data;
};

// Mark a WhatsApp notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/api/whatsapp-notifications/${notificationId}/read`);
  return response.data;
};

// Create a WhatsApp notification (for testing purposes)
export const createWhatsAppNotification = async (eventId, eventTitle, whatsappGroupLink) => {
  const response = await api.post('/api/whatsapp-notifications', {
    eventId,
    eventTitle,
    whatsappGroupLink
  });
  return response.data;
}; 