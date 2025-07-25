import api from './api';

// Check if user is registered for a sub-event
export const checkUserRegistration = async (eventId) => {
  try {
    console.log('Checking user registration for event:', eventId);
    
    // Check RSVP, Registration, and Waiting List individually
    const [rsvpResponse, registrationResponse, waitingListResponse] = await Promise.all([
      api.get(`/api/rsvp/${eventId}/check`),
      api.get(`/api/registration/${eventId}/check`),
      api.get(`/api/waiting-list/${eventId}/check`)
    ]);
    
    const hasRSVP = rsvpResponse.data.registered;
    const hasRegistration = registrationResponse.data.registered;
    const onWaitingList = waitingListResponse.data.onWaitingList;
    const rejected = waitingListResponse.data.rejected;
    
    console.log('Registration check results:', {
      hasRSVP,
      hasRegistration,
      onWaitingList,
      rejected
    });
    
    // FIXED: Only consider user registered if they have RSVP or registration (NOT waiting list)
    // Users on waiting list should NOT have access to event features
    const isRegistered = hasRSVP || hasRegistration;
    console.log('Final registration status:', isRegistered);
    
    return {
      isRegistered,
      hasRSVP,
      hasRegistration,
      onWaitingList,
      rejected
    };
  } catch (error) {
    console.error('Error checking user registration:', error);
    return {
      isRegistered: false,
      hasRSVP: false,
      hasRegistration: false,
      onWaitingList: false
    };
  }
}; 