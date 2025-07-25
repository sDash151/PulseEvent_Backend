import React, { useState, useEffect } from 'react';
import { getRejectionNotifications, markRejectionNotificationAsRead } from '../services/rejectionNotifications';
import { useAuth } from '../hooks/useAuth';

const RejectionNotificationPopup = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const data = await getRejectionNotifications();
      if (data && data.length > 0) {
        setNotifications(data);
        setCurrentNotificationIndex(0);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error fetching rejection notifications:', error);
    }
  };

  const handleDismiss = async (notification) => {
    try {
      await markRejectionNotificationAsRead(notification.id);
      const updatedNotifications = notifications.filter(n => n.id !== notification.id);
      setNotifications(updatedNotifications);
      if (updatedNotifications.length === 0) {
        setIsVisible(false);
      } else {
        setCurrentNotificationIndex(0);
      }
    } catch (error) {
      console.error('Error dismissing rejection notification:', error);
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

        {/* Rejection Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Registration Not Approved
        </h2>

        {/* Event Info */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <h3 className="text-red-300 font-semibold mb-1">
            ❌ {currentNotification.eventTitle}
          </h3>
          <p className="text-red-200 text-sm">
            Your registration for this event was not approved by the host.
          </p>
        </div>

        {/* Empathetic Message */}
        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-2">
            We understand this may be disappointing. Please know that every application is reviewed thoughtfully by the host based on event requirements and criteria.
          </p>
          <p className="text-gray-400 text-xs">
            If you have questions, check your email for more details or contact the event host.
          </p>
        </div>

        {/* Disabled Button & On-Spot Registration Info */}
        <div className="mb-6 bg-white/10 rounded-lg p-4 border border-white/20 text-center">
          <div className="text-xs text-gray-300">
            <span className="font-semibold text-amber-300">Do not worry!</span> You cannot register online, but you can do an <span className="font-semibold text-amber-300">on-spot registration at the venue before the RSVP deadline</span>.
          </div>
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
                    index === currentNotificationIndex ? 'bg-red-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            onClick={() => handleDismiss(currentNotification)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Dismiss
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

export default RejectionNotificationPopup; 