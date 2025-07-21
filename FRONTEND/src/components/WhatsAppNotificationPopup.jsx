import React, { useState, useEffect } from 'react';
import { getWhatsAppNotifications, markNotificationAsRead } from '../services/whatsappNotifications';
import { useAuth } from '../hooks/useAuth';

const WhatsAppNotificationPopup = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const data = await getWhatsAppNotifications();
      if (data && data.length > 0) {
        setNotifications(data);
        setCurrentNotificationIndex(0);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp notifications:', error);
    }
  };

  const handleJoinGroup = async (notification) => {
    setIsLoading(true);
    try {
      // Mark notification as read
      await markNotificationAsRead(notification.id);
      
      // Open WhatsApp group link
      window.open(notification.whatsappGroupLink, '_blank');
      
      // Remove the notification from the list
      const updatedNotifications = notifications.filter(n => n.id !== notification.id);
      setNotifications(updatedNotifications);
      
      if (updatedNotifications.length === 0) {
        setIsVisible(false);
      } else {
        setCurrentNotificationIndex(0);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async (notification) => {
    try {
      // Mark notification as read without opening the link
      await markNotificationAsRead(notification.id);
      
      // Remove the notification from the list
      const updatedNotifications = notifications.filter(n => n.id !== notification.id);
      setNotifications(updatedNotifications);
      
      if (updatedNotifications.length === 0) {
        setIsVisible(false);
      } else {
        setCurrentNotificationIndex(0);
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleNext = () => {
    if (currentNotificationIndex < notifications.length - 1) {
      setCurrentNotificationIndex(currentNotificationIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentNotificationIndex > 0) {
      setCurrentNotificationIndex(currentNotificationIndex - 1);
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentNotificationIndex];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={() => handleDismiss(currentNotification)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* WhatsApp Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Join WhatsApp Group!
        </h2>

        {/* Event Info */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
          <h3 className="text-green-300 font-semibold mb-1">
            📱 {currentNotification.eventTitle}
          </h3>
          <p className="text-green-200 text-sm">
            Connect with other participants and get event updates
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-2">Benefits:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Get real-time event updates and announcements</li>
            <li>• Network with other participants</li>
            <li>• Ask questions and get quick responses</li>
            <li>• Stay connected with the community</li>
          </ul>
        </div>

        {/* Navigation dots if multiple notifications */}
        {notifications.length > 1 && (
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNotificationIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentNotificationIndex ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleJoinGroup(currentNotification)}
            disabled={isLoading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Joining...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Join Group
              </div>
            )}
          </button>
          
          <button
            onClick={() => handleDismiss(currentNotification)}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Later
          </button>
        </div>

        {/* Navigation arrows for multiple notifications */}
        {notifications.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-2 pointer-events-none">
            <button
              onClick={handlePrevious}
              disabled={currentNotificationIndex === 0}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={currentNotificationIndex === notifications.length - 1}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppNotificationPopup; 