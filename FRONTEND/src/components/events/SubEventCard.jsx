// src/components/events/SubEventCard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isBefore, isAfter } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { useRoleCheck } from '../../hooks/useRoleCheck';
import Button from '../ui/Button';
import { checkUserRegistration } from '../../services/registration';
import { checkInToEvent } from '../../services/rsvp';

const SubEventCard = ({ sub, parentEventId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isEventHost, checkEventHost } = useRoleCheck();
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistered: false,
    hasRSVP: false,
    hasRegistration: false,
    onWaitingList: false
  });
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [checkedIn, setCheckedIn] = useState(sub.checkedIn || false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Check registration status when component mounts or when user changes
  useEffect(() => {
    const checkRegistration = async () => {
      if (!currentUser || !sub.id) return;
      
      setLoadingRegistration(true);
      try {
        const status = await checkUserRegistration(sub.id);
        setRegistrationStatus(status);
      } catch (error) {
        console.error('Error checking registration:', error);
        setRegistrationStatus({
          isRegistered: false,
          hasRSVP: false,
          hasRegistration: false,
          onWaitingList: false
        });
      } finally {
        setLoadingRegistration(false);
      }
    };
    
    checkRegistration();
  }, [sub.id, currentUser]);

  // Check if user is the host of this specific event
  useEffect(() => {
    if (currentUser && sub.id) {
      checkEventHost(sub.id);
    }
  }, [currentUser, sub.id]);

  // Ensure sub object exists and has required properties
  console.log('SubEventCard rendering with:', {
    subId: sub.id,
    parentEventId: parentEventId,
    subParentEventId: sub.parentEventId,
    propParentEventId: parentEventId
  });

  // Assume sub.startTime and sub.endTime are ISO strings
  const now = new Date();
  const eventStart = new Date(sub.startTime);
  const eventEnd = new Date(sub.endTime);
  const isLive = now >= eventStart && now <= eventEnd;

  function handleJoinClick() {
    try {
      // Check if user is authenticated
      if (!currentUser) {
        console.log('User not authenticated, redirecting to login');
        navigate('/login');
        return;
      }

      // Check if required IDs exist
      if (!parentEventId || !sub.id) {
        console.error('Missing required event IDs:', { 
          parentEventId: parentEventId, 
          subId: sub.id 
        });
        return;
      }

      console.log('Join click - User:', currentUser.id, 'Host:', sub.hostId, 'Joined:', sub.joined, 'IsLive:', isLive);

      // Host: always go to event detail
      if (currentUser.id === sub.hostId) {
        const hostPath = `/events/${parentEventId}/sub/${sub.id}`;
        console.log('Navigating to host path:', hostPath);
        navigate(hostPath);
        return;
      }

      // Not registered, not host: go to registration form
      if (!sub.joined) {
        const registerPath = `/events/${parentEventId}/sub/${sub.id}/register`;
        console.log('Navigating to register path:', registerPath);
        navigate(registerPath);
        return;
      }

      // Registered, not host: navigate to event details page (no popup)
      if (sub.joined && currentUser.id !== sub.hostId) {
        const eventPath = `/events/${parentEventId}/sub/${sub.id}/details`;
        console.log('Navigating to event details path:', eventPath);
        navigate(eventPath);
      }
    } catch (error) {
      console.error('Error in handleJoinClick:', error);
    }
  }

  // Handle check-in functionality
  async function handleCheckIn() {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setCheckInLoading(true);
    try {
      await checkInToEvent(sub.id);
      setCheckedIn(true);
      // Optionally show a toast: "Checked in successfully!"
    } catch (error) {
      // Optionally show error toast
      console.error('Check-in failed:', error);
    } finally {
      setCheckInLoading(false);
    }
  }

  // Handle feedback functionality
  function handleFeedback() {
    try {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      // Navigate to sub-event detail page where feedback is available
      const subEventPath = `/events/${parentEventId}/sub/${sub.id}`;
      console.log('Navigating to sub-event detail for feedback:', subEventPath);
      navigate(subEventPath);
    } catch (error) {
      console.error('Error in handleFeedback:', error);
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)] p-6 hover:shadow-[0_0_35px_rgba(255,255,255,0.08)] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{sub.title}</h3>
            {/* Solo Event Label */}
            {(!sub.teamSize || sub.teamSize === 1) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30 ml-2">
                SOLO EVENT
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm line-clamp-2">{sub.description}</p>
        </div>
        
        {/* Status Badge */}
        <div className="ml-4">
          {isLive ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
              LIVE
            </span>
          ) : now < eventStart ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              UPCOMING
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30">
              ENDED
            </span>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-1">Date & Time</h4>
          <p className="text-white text-sm">
            {format(eventStart, 'MMM dd, yyyy')} at {format(eventStart, 'h:mm a')}
          </p>
          <p className="text-gray-400 text-xs">
            Duration: {Math.round((eventEnd - eventStart) / (1000 * 60))} minutes
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-1">Location</h4>
          <p className="text-white text-sm">{sub.location}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-1">Capacity</h4>
          <p className="text-white text-sm">
            {sub.rsvps?.length || 0} / {sub.maxAttendees} attendees
          </p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div 
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${sub.maxAttendees > 0 ? Math.min((sub.rsvps?.length || 0) / sub.maxAttendees * 100, 100) : 0}%` 
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-1">Host</h4>
          <p className="text-white text-sm">{sub.host?.name || 'Unknown Host'}</p>
        </div>
      </div>

      {/* Team Event Info or Solo Event Info */}
      {sub.teamSize && sub.teamSize > 1 ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-300">👥</span>
            <span className="text-amber-300 font-medium">Team Event</span>
          </div>
          <p className="text-gray-300 text-sm mt-1">
            {sub.flexibleTeamSize 
              ? `Team size: ${sub.teamSizeMin || 1}-${sub.teamSizeMax || sub.teamSize} members`
              : `Team size: ${sub.teamSize} members`
            }
          </p>
        </div>
      ) : (!sub.teamSize || sub.teamSize === 1) && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-300">🧑‍💻</span>
            <span className="text-blue-300 font-medium">Solo Event</span>
          </div>
          <p className="text-gray-300 text-sm mt-1">
            1 member
          </p>
        </div>
      )}

      {/* Payment Info */}
      {sub.paymentEnabled && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-300">💳</span>
            <span className="text-green-300 font-medium">Payment Required</span>
          </div>
          <p className="text-gray-300 text-sm mt-1">
            Registration requires payment confirmation
          </p>
        </div>
      )}

      {/* WhatsApp Group */}
      {sub.whatsappGroupEnabled && sub.whatsappGroupLink && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-300">📱</span>
            <span className="text-green-300 font-medium">WhatsApp Group</span>
          </div>
          <a 
            href={sub.whatsappGroupLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 text-sm mt-1 hover:text-green-300 transition-colors"
          >
            Join the group chat
          </a>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => navigate(`/events/${parentEventId}/sub/${sub.id}/details`)}
        >
          See Details
        </Button>
        {!currentUser ? (
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => navigate('/login')}
          >
            Login to Join
          </Button>
        ) : currentUser.id === sub.hostId ? (
          // Host actions
          <>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => navigate(`/events/${parentEventId}/sub/${sub.id}`)}
            >
              Manage Event
            </Button>
            {/* 🔐 Only show Review Registrations button to event host */}
            {isEventHost && (
              <button
                className="ml-2 px-3 py-1 rounded bg-amber-400/20 text-amber-300 text-xs font-semibold hover:bg-amber-400/40 transition"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/events/${parentEventId}/sub/${sub.id}/registrations/review`);
                }}
              >
                Review Registrations
              </button>
            )}
          </>
        ) : registrationStatus.onWaitingList ? (
          // Pending approval - show disabled button
          <Button
            className="bg-amber-400/30 text-amber-300 font-semibold cursor-not-allowed flex items-center gap-2"
            disabled
            title="Your registration is pending host approval. You will be notified once approved."
          >
            <span role="img" aria-label="locked">🔒</span>
            Pending Approval
          </Button>
        ) : !registrationStatus.isRegistered ? (
          // Not registered - show registration button
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => navigate(`/events/${parentEventId}/sub/${sub.id}/register`)}
          >
            {sub.paymentEnabled ? 'Register (Pay)' : 'Register Now'}
          </Button>
        ) : (
          // Registered - show event access button
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => navigate(`/events/${parentEventId}/sub/${sub.id}`)}
          >
            Enter Event
          </Button>
        )}
        
        {registrationStatus.isRegistered && !registrationStatus.onWaitingList && !checkedIn && (
          <Button className="bg-blue-500 text-white" onClick={handleCheckIn} loading={checkInLoading}>
            Check In
          </Button>
        )}
        {checkedIn && (
          <Button className="bg-green-500 text-white" disabled>
            Checked In
          </Button>
        )}
        
        {sub.checkedIn && (
          <Button className="bg-pink-500 text-white" onClick={handleFeedback}>
            Give Feedback
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubEventCard;