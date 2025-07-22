import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, isBefore, isAfter } from 'date-fns';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import AnalyticsPanel from '../components/analytics/AnalyticsPanel';
import FeedbackList from '../components/feedback/FeedbackList';
import FeedbackForm from '../components/feedback/FeedbackForm';
import { fetchEventById } from '../services/events';
import { rsvpToEvent, checkInToEvent } from '../services/rsvp';
import { useAuth } from '../hooks/useAuth';
import InviteForm from '../components/invitations/inviteForm';
import InvitationList from '../components/invitations/InvitationList';
import { getEventInvitations } from '../services/invitations';
import { initSocket, connectSocket, joinSubEventRoom, sendFeedback } from '../services/socket';
import api from '../services/api';

const SubEventDetailPage = () => {
  const { parentId, subId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const { currentUser, loading: authLoading } = useAuth();
  const [eventLoading, setEventLoading] = useState(true);
  const [isUserRegistered, setIsUserRegistered] = useState(false);

  const [registrationLoading, setRegistrationLoading] = useState(false);
  const socketRef = useRef(null);
  const feedbackHandlerRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is registered for this event
  const checkUserRegistration = async () => {
    if (!currentUser || !subId) return false;
    
    try {
      console.log('Checking user registration for event:', subId, 'User:', currentUser.id);
      
      // Check RSVP, Registration, and Waiting List individually for better debugging
      console.log('Making RSVP check request...');
      const rsvpResponse = await api.get(`/api/rsvp/${subId}/check`);
      console.log('RSVP response:', rsvpResponse.data);
      
      console.log('Making registration check request...');
      const registrationResponse = await api.get(`/api/registration/${subId}/check`);
      console.log('Registration response:', registrationResponse.data);
      
      console.log('Making waiting list check request...');
      const waitingListResponse = await api.get(`/api/waiting-list/${subId}/check`);
      console.log('Waiting list response:', waitingListResponse.data);
      
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
      
      return isRegistered;
    } catch (error) {
      console.error('Error checking user registration:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return false;
    }
  };

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEventById(subId);
        setEvent(eventData);
        setFeedbackList(eventData.feedbacks || []);
        
        if (currentUser && eventData.hostId === currentUser.id) {
          const invites = await getEventInvitations(subId);
          setInvitations(invites.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load event');
      } finally {
        setEventLoading(false);
      }
    };
    loadEvent();
  }, [subId, currentUser]);

  // Separate effect for registration check to avoid blocking event loading
  useEffect(() => {
    const checkRegistration = async () => {
      if (!currentUser || !subId) return;
      
      setRegistrationLoading(true);
      try {
        const registered = await checkUserRegistration();
        setIsUserRegistered(registered);
      } catch (error) {
        console.error('Error checking registration:', error);
        setIsUserRegistered(false);
      } finally {
        setRegistrationLoading(false);
      }
    };
    
    checkRegistration();
  }, [subId, currentUser]);

  useEffect(() => {
    if (authLoading) return;
    if (currentUser && currentUser.token) {
      const socket = initSocket(currentUser.token);
      socketRef.current = socket;
      connectSocket();
      socket.off('newFeedback');
      if (feedbackHandlerRef.current) {
        socket.off('newFeedback', feedbackHandlerRef.current);
      }
      feedbackHandlerRef.current = (newFeedback) => {
        setFeedbackList(prev => [newFeedback, ...prev]);
      };
      socket.on('connect', () => {
        setSocketConnected(true);
        // Join subevent room: event.parentEventId is the mega event, subId is the subevent id
        if (event && event.parentEventId) {
          joinSubEventRoom(event.parentEventId, subId);
        }
      });
      socket.on('disconnect', () => setSocketConnected(false));
      socket.on('newFeedback', feedbackHandlerRef.current);
      return () => {
        socket.off('connect');
        socket.off('disconnect');
        if (feedbackHandlerRef.current) {
          socket.off('newFeedback', feedbackHandlerRef.current);
        }
      };
    } else {
      setSocketConnected(false);
    }
  }, [subId, currentUser, authLoading]);

  // Join subevent room after socket is connected and event is loaded
  useEffect(() => {
    if (socketConnected && event && subId) {
      // Use event.parentEventId if available, else fallback to parentId from params
      const parentEventId = event.parentEventId || parentId;
      if (parentEventId && subId) {
        joinSubEventRoom(parentEventId, subId);
      }
    }
  }, [socketConnected, event, subId, parentId]);

  // Handle access control logic
  useEffect(() => {
    if (eventLoading || authLoading || !event || !currentUser || registrationLoading) return;

    const isHost = currentUser.id === event.hostId;
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const isEventLive = isBefore(now, endTime) && isAfter(now, startTime);

    console.log('Access Control Debug:', {
      currentUserId: currentUser.id,
      eventHostId: event.hostId,
      isHost,
      isUserRegistered,
      isEventLive,
      eventLoading,
      authLoading,
      registrationLoading
    });

    // Functionality 1: If user is not registered and not host, redirect to registration
    if (!isHost && !isUserRegistered) {
      console.log('Redirecting to registration - User not registered and not host');
      navigate(`/events/${parentId}/sub/${subId}/register`);
      return;
    }

    // Functionality 2: If user is registered but not host and event is not live, allow access to details page
    // (no popup, just show the normal page with appropriate messaging)
    if (!isHost && isUserRegistered && !isEventLive) {
      console.log('Event not live but user registered - showing details page');
      // Don't show popup, just continue with normal page flow
    }

    // Functionality 3: If user is host, allow access regardless of live status
    // (no additional checks needed, just continue with normal flow)
    console.log('Access granted - User is host or event is live');
  }, [event, currentUser, isUserRegistered, eventLoading, authLoading, registrationLoading, navigate, parentId, subId]);

  const handleRSVP = async () => {
    try {
      await rsvpToEvent(subId);
      setEvent(prev => ({
        ...prev,
        rsvps: [...prev.rsvps, { userId: currentUser.id, user: { name: currentUser.name } }]
      }));
    } catch (err) {
      setError(err.message || 'Failed to RSVP');
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkInToEvent(subId);
      setEvent(prev => ({
        ...prev,
        rsvps: prev.rsvps.map(rsvp =>
          rsvp.userId === currentUser.id ? { ...rsvp, checkedIn: true } : rsvp
        )
      }));
    } catch (err) {
      setError(err.message || 'Failed to check in');
    }
  };

  const handleSendFeedback = (content, emoji) => {
    setFeedbackError('');
    if (!currentUser || !socketRef.current?.connected) {
      setFeedbackError('Feedback can only be sent during a live event with a valid connection.');
      return;
    }
    // Send feedback with both eventId (parent) and subeventId (current subevent)
    sendFeedback(event?.parentEventId, content, emoji, currentUser.id, subId);
  };

  const handleInvitationsUpdate = async () => {
    try {
      const invites = await getEventInvitations(subId);
      setInvitations(invites.data);
    } catch {
      setError('Failed to refresh invitations');
    }
  };

  const handleGoToRegistration = () => {
    navigate(`/events/${parentId}/sub/${subId}/register`);
  };



  const isHost = currentUser && event?.hostId === currentUser.id;
  const userRSVP = event?.rsvps?.find(rsvp => rsvp.userId === currentUser?.id);
  const isCheckedIn = userRSVP?.checkedIn;
  const now = new Date();
  const startTime = new Date(event?.startTime);
  const endTime = new Date(event?.endTime);
  const rsvpDeadline = new Date(event?.rsvpDeadline);
  const isEventLive = isBefore(now, endTime) && isAfter(now, startTime);
  const canCheckIn = isBefore(now, endTime) && isAfter(now, new Date(startTime.getTime() - 3600000));
  const canRSVP = isBefore(now, rsvpDeadline) && event?.rsvps?.length < event?.maxAttendees;

  if (eventLoading || authLoading || registrationLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-red-400 text-xl">
        {error}
      </div>
    );
  }



  return (
    <div className="relative min-h-screen px-4 pt-28 pb-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="absolute top-0 left-[20%] w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-10 right-[15%] w-72 h-72 bg-amber-400/10 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-0 left-[10%] w-60 h-60 bg-blue-400/10 rounded-full blur-[100px] z-0" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <BackButton 
              to={event.parentEventId ? `/events/${event.parentEventId}` : "/dashboard"} 
              variant="subtle" 
              label={event.parentEventId ? "Mega Event" : "Dashboard"} 
            />
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-gray-300">{event.location}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isHost && (
              <Button onClick={() => navigate(`/events/${parentId}/sub/${subId}/edit`)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg">
                Edit Sub-Event
              </Button>
            )}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)] space-y-6">
          <p className="text-gray-300">{event.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-amber-400">Date & Time</h3>
              <p className="text-white">{format(startTime, 'PPP')} | {format(startTime, 'p')} - {format(endTime, 'p')}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-400">RSVP Deadline</h3>
              <p className="text-white">{format(rsvpDeadline, 'PPPp')}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-400">Attendees</h3>
              <p className="text-white">{event.rsvps.length} / {event.maxAttendees}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-400">Host</h3>
              <p className="text-white">{event.host.name}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {!isHost && canRSVP && !userRSVP && (
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleRSVP}>
                RSVP Now
              </Button>
            )}
            {!isHost && userRSVP && canCheckIn && !isCheckedIn && (
              <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleCheckIn}>
                Check In
              </Button>
            )}
          </div>
          {isHost && (
            <AnalyticsPanel eventId={event.id} rsvps={event.rsvps} />
          )}
          {isHost && (
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <h2 className="text-xl font-bold text-amber-400 mb-4">Manage Invitations</h2>
              <InviteForm eventId={event.id} onInviteSent={handleInvitationsUpdate} />
              <InvitationList invitations={invitations} onRefresh={handleInvitationsUpdate} />
            </div>
          )}
          {isHost && (
            <Button
              className="bg-amber-400/20 text-amber-300 font-semibold px-5 py-2 rounded-lg hover:bg-amber-400/40 transition ml-2"
              onClick={() => navigate(`/events/${parentId}/sub/${subId}/registrations/review`)}
            >
              Review Registrations
            </Button>
          )}

          {/* WhatsApp Group Section - Only visible to registered users and host */}
          {event.whatsappGroupEnabled && event.whatsappGroupLink && (isHost || isUserRegistered) && (
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-400">Join WhatsApp Group</h2>
                  <p className="text-gray-300 text-sm">Connect with other participants and get event updates</p>
                </div>
              </div>
              
              <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 font-medium mb-1">📱 Event WhatsApp Group</p>
                    <p className="text-green-200 text-sm">Click the button below to join the group and stay connected!</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => window.open(event.whatsappGroupLink, '_blank')}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        Join Group
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-600/20 rounded-lg border border-gray-500/20">
                <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs text-gray-300">
                  <p className="font-medium mb-1">💡 Benefits of joining:</p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Get real-time event updates and announcements</li>
                    <li>• Network with other participants before the event</li>
                    <li>• Ask questions and get quick responses</li>
                    <li>• Stay connected with the community after the event</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Group Locked State - For unregistered users */}
          {event.whatsappGroupEnabled && event.whatsappGroupLink && !isHost && !isUserRegistered && (
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-400">Community Locked</h2>
                  <p className="text-gray-300 text-sm">Register to unlock access</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-400/10 to-orange-400/10 border border-amber-400/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 font-medium mb-1">🔒 Exclusive Access</p>
                    <p className="text-amber-200 text-sm">Join the WhatsApp community to connect with other participants, get event updates, and share experiences.</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-600/20 rounded-lg border border-gray-500/20">
                <div className="w-5 h-5 bg-amber-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs text-gray-300">
                  <p className="font-medium mb-1">💡 Benefits of joining:</p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Get real-time event updates and announcements</li>
                    <li>• Network with other participants before the event</li>
                    <li>• Ask questions and get quick responses</li>
                    <li>• Stay connected with the community after the event</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {(isEventLive || isHost) && (
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <h2 className="text-xl font-bold text-amber-400 mb-4">Live Feedback</h2>
              {feedbackError && <div className="text-red-400 mb-2">{feedbackError}</div>}
              <FeedbackForm onSubmit={handleSendFeedback} />
              <FeedbackList feedbacks={feedbackList} isHost={isHost} />
            </div>
          )}
   
        </div>
      </div>
    </div>
  );
};

export default SubEventDetailPage;
