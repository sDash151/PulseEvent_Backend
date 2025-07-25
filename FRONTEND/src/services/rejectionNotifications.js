import api from './api';

// Get unread rejection notifications for the current user
export const getRejectionNotifications = async () => {
  const response = await api.get('/api/rejection-notifications');
  return response.data;
};

// Mark a rejection notification as read
export const markRejectionNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/api/rejection-notifications/${notificationId}/read`);
  return response.data;
};

// Create a rejection notification (for testing purposes)
export const createRejectionNotification = async (eventId, eventTitle, rejectionReason) => {
  const response = await api.post('/api/rejection-notifications', {
    eventId,
    eventTitle,
    rejectionReason
  });
  return response.data;
}; 