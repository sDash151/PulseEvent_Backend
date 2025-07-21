import api from './api';

// Check if user is registered for a sub-event
export const checkUserRegistration = async (eventId) => {
  try {
    console.log('Checking user registration for event:', eventId);
    
    // Check RSVP, Registration, and Waiting List individually
    const [rsvpResponse, registrationResponse, waitingListResponse] = await Promise.all([
      api.get(`/rsvp/${eventId}/check`),
      api.get(`/registration/${eventId}/check`),
      api.get(`/waiting-list/${eventId}/check`)
    ]);
    
    const hasRSVP = rsvpResponse.data.registered;
    const hasRegistration = registrationResponse.data.registered;
    const onWaitingList = waitingListResponse.data.onWaitingList;
    
    console.log('Registration check results:', {
      hasRSVP,
      hasRegistration,
      onWaitingList
    });
    
    // FIXED: Only consider user registered if they have RSVP or registration (NOT waiting list)
    // Users on waiting list should NOT have access to event features
    const isRegistered = hasRSVP || hasRegistration;
    console.log('Final registration status:', isRegistered);
    
    return {
      isRegistered,
      hasRSVP,
      hasRegistration,
      onWaitingList
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