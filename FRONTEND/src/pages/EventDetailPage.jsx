import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, isBefore, isAfter } from 'date-fns'
import Button from '../components/ui/Button'
import BackButton from '../components/ui/BackButton'
import SubEventForm from '../components/events/SubEventForm'
import AnalyticsPanel from '../components/analytics/AnalyticsPanel'
import Card from '../components/ui/Card'
import FeedbackList from '../components/feedback/FeedbackList'
import FeedbackForm from '../components/feedback/FeedbackForm'
import { fetchEventById } from '../services/events'
import { rsvpToEvent, checkInToEvent } from '../services/rsvp'
import { useAuth } from '../hooks/useAuth'
import InviteForm from '../components/invitations/inviteForm'
import InvitationList from '../components/invitations/InvitationList'
import { getEventInvitations } from '../services/invitations'
import SubEventCard from '../components/events/SubEventCard';
import { checkUserRegistration } from '../services/registration';
import { initSocket, connectSocket, joinMegaEventRoom, sendFeedback, subscribeToFeedback, disconnectSocket } from '../services/socket'

const EventDetailPage = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState([])
  const [error, setError] = useState('')
  const [feedbackList, setFeedbackList] = useState([])
  const [socketConnected, setSocketConnected] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const { currentUser, loading: authLoading } = useAuth()
  const [eventLoading, setEventLoading] = useState(true)
  const [subEventRegistrationStatus, setSubEventRegistrationStatus] = useState({
    hasAnyRegistration: false,
    registeredSubEvents: []
  })
  const socketRef = useRef(null)
  const feedbackHandlerRef = useRef(null)
  const autoRefreshIntervalRef = useRef(null)

  // Auto-refresh for mega events (silent background refresh)
  useEffect(() => {
    if (event && event.type === 'MEGA') {
      const now = new Date()
      const startTime = new Date(event?.startTime)
      const endTime = new Date(event?.endTime)
      const isEventLive = isBefore(now, endTime) && isAfter(now, startTime)
      
      if (isEventLive) {
        // Clear any existing interval
        if (autoRefreshIntervalRef.current) {
          clearInterval(autoRefreshIntervalRef.current)
        }

        // Set up silent background refresh every 3 seconds
        autoRefreshIntervalRef.current = setInterval(async () => {
          try {
            const updatedEventData = await fetchEventById(id)
            // Only update if data has actually changed to avoid unnecessary re-renders
            if (JSON.stringify(updatedEventData) !== JSON.stringify(event)) {
              setEvent(updatedEventData)
              setFeedbackList(updatedEventData.feedbacks || [])
              console.log('🔄 Silent background refresh completed')
            }
          } catch (error) {
            console.warn('Silent refresh failed:', error)
            // Don't show error to user - this is background activity
          }
        }, 3000)

        // Cleanup on unmount or when dependencies change
        return () => {
          if (autoRefreshIntervalRef.current) {
            clearInterval(autoRefreshIntervalRef.current)
            autoRefreshIntervalRef.current = null
          }
        }
      }
    }
  }, [event, id])

  // Check sub-event registration status
  const checkSubEventRegistrations = async () => {
    if (!currentUser || !event || event.type !== 'MEGA' || !event.subEvents) return;
    
    try {
      const registrationPromises = event.subEvents.map(subEvent => 
        checkUserRegistration(subEvent.id)
      );
      
      const results = await Promise.all(registrationPromises);
      const registeredSubEvents = event.subEvents.filter((_, index) => 
        results[index].isRegistered || results[index].hasRegistration
      );
      
      setSubEventRegistrationStatus({
        hasAnyRegistration: registeredSubEvents.length > 0,
        registeredSubEvents
      });
      
      console.log('Sub-event registration status:', {
        hasAnyRegistration: registeredSubEvents.length > 0,
        registeredSubEvents: registeredSubEvents.map(sub => sub.title)
      });
    } catch (error) {
      console.error('Error checking sub-event registrations:', error);
    }
  };

  useEffect(() => {
    const loadEvent = async () => {
      try {
        // Add comprehensive debugging
        console.log('=== FRONTEND EVENT DETAIL DEBUG ===')
        console.log('Event ID from params:', id)
        console.log('Current user:', currentUser)
        console.log('Auth loading:', authLoading)
        
        // Validate the ID before making the request
        if (!id || id === 'undefined' || id === 'null') {
          throw new Error('Invalid event ID')
        }
        
        const numericId = parseInt(id)
        if (isNaN(numericId) || numericId < 1) {
          throw new Error(`Invalid event ID: ${id}`)
        }
        
        console.log('Making request for event ID:', numericId)
        
        const eventData = await fetchEventById(id)
        console.log('✅ Event data received:', eventData)
        
        setEvent(eventData)
        setFeedbackList(eventData.feedbacks || [])

        if (currentUser && eventData.hostId === currentUser.id) {
          console.log('User is host, fetching invitations...')
          try {
            const invites = await getEventInvitations(id)
            setInvitations(invites.data)
          } catch (inviteError) {
            console.warn('Failed to load invitations:', inviteError)
            // Don't fail the whole component for invitation errors
          }
        }
      } catch (err) {
        console.error('❌ Error loading event:', err)
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          eventId: id
        })
        setError(err.message || 'Failed to load event')
      } finally {
        setEventLoading(false)
      }
    }

    // Only load if we have an ID and current user is loaded
    if (id && !authLoading) {
      loadEvent()
    }
  }, [id, currentUser, authLoading])

  // Check sub-event registrations when event loads
  useEffect(() => {
    if (event && currentUser && event.type === 'MEGA') {
      checkSubEventRegistrations();
    }
  }, [event, currentUser]);

  // Join mega event room after socket is connected and event is loaded
  useEffect(() => {
    if (socketConnected && event && id) {
      joinMegaEventRoom(id);
    }
  }, [socketConnected, event, id]);

  // Rest of your component remains the same...
  useEffect(() => {
    if (authLoading) return
    if (currentUser && currentUser.token) {
      const socket = initSocket(currentUser.token)
      socketRef.current = socket
      connectSocket()

      socket.off('newFeedback')
      if (feedbackHandlerRef.current) {
        socket.off('newFeedback', feedbackHandlerRef.current)
      }

      feedbackHandlerRef.current = (newFeedback) => {
        setFeedbackList(prev => [newFeedback, ...prev])
      }

      socket.on('connect', () => {
        setSocketConnected(true)
        joinMegaEventRoom(id)
      })
      socket.on('disconnect', () => setSocketConnected(false))
      socket.on('newFeedback', feedbackHandlerRef.current)

      return () => {
        socket.off('connect')
        socket.off('disconnect')
        if (feedbackHandlerRef.current) {
          socket.off('newFeedback', feedbackHandlerRef.current)
        }
      }
    } else {
      setSocketConnected(false)
    }
  }, [id, currentUser, authLoading])

  const handleRSVP = async () => {
    try {
      await rsvpToEvent(id)
      setEvent(prev => ({
        ...prev,
        rsvps: [...prev.rsvps, { userId: currentUser.id, user: { name: currentUser.name } }]
      }))
    } catch (err) {
      setError(err.message || 'Failed to RSVP')
    }
  }

  const handleCheckIn = async () => {
    try {
      await checkInToEvent(id)
      setEvent(prev => ({
        ...prev,
        rsvps: prev.rsvps.map(rsvp =>
          rsvp.userId === currentUser.id ? { ...rsvp, checkedIn: true } : rsvp
        )
      }))
    } catch (err) {
      setError(err.message || 'Failed to check in')
    }
  }

  const handleSendFeedback = (content, emoji) => {
    setFeedbackError('')
    if (!currentUser || !socketRef.current?.connected || !isEventLive) {
      setFeedbackError('Feedback can only be sent during a live event with a valid connection.')
      return
    }
    sendFeedback(id, content, emoji, currentUser.id)
  }

  const handleInvitationsUpdate = async () => {
    try {
      const invites = await getEventInvitations(id)
      setInvitations(invites.data)
    } catch {
      setError('Failed to refresh invitations')
    }
  }

  // Early return if still loading or no event
  if (eventLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    )
  }

  // Early return if event ID is invalid
  if (!id || id === 'undefined' || id === 'null') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-red-400 text-xl">
        <div className="text-center">
          <p className="mb-4">Invalid event link. Please check your invitation or contact the event host.</p>
          <Link 
            to="/dashboard" 
            className="mt-4 inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-red-400 text-xl">
        <div className="text-center">
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-400">Event ID: {id}</p>
          <Link 
            to="/dashboard" 
            className="mt-4 inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // If we don't have event data yet, show loading
  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  console.log('EventDetailPage - Event data:', event);
  console.log('EventDetailPage - RSVPs:', event?.rsvps);
  
  const isHost = currentUser && event?.hostId === currentUser.id
  const userRSVP = event?.rsvps?.find(rsvp => rsvp.userId === currentUser?.id)
  const isCheckedIn = userRSVP?.checkedIn
  const now = new Date()
  const startTime = new Date(event?.startTime)
  const endTime = new Date(event?.endTime)
  const rsvpDeadline = new Date(event?.rsvpDeadline)
  const isEventLive = isBefore(now, endTime) && isAfter(now, startTime)
  const canCheckIn = isBefore(now, endTime) && isAfter(now, new Date(startTime.getTime() - 3600000))
  const canRSVP = isBefore(now, rsvpDeadline) && event?.rsvps?.length < event?.maxAttendees

  // Only show feedback form if RSVP'd (or host) and event is live
  const canSendFeedback = (isHost || userRSVP) && isEventLive;

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-[20%] w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-10 right-[15%] w-72 h-72 bg-amber-400/10 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-0 left-[10%] w-60 h-60 bg-blue-400/10 rounded-full blur-[100px] z-0" />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" variant="subtle" label="Dashboard" />
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-gray-300">{event.location}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isHost && (
              <Link to={`/events/${event.id}/edit`} className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-amber-400 font-semibold">
                Edit Event
              </Link>
            )}
          </div>
        </div>

        {/* Glassmorphic Card */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)] space-y-6">
          <p className="text-gray-300">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-amber-400">Date & Time</h3>
              <p className="text-white">{format(startTime, 'PPP')} | {format(startTime, 'p')} - {format(endTime, 'PPP')} | {format(endTime, 'p')}</p>
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

          {/* Sub-Events for Mega Event */}
          {event.type === 'MEGA' && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-amber-300 mb-4">Sub-Events</h2>

              {event.subEvents?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.subEvents.map((sub) => (
                    <SubEventCard key={sub.id} sub={sub} parentEventId={event.id} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No sub-events have been added yet.</p>
              )}

              {isHost && (
                <div className="mt-8 bg-white/10 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-2">Add Sub-Event</h3>
                  <SubEventForm 
                    megaEventId={event.id}
                    parentLocation={event.location}
                    parentRsvpDeadline={event.rsvpDeadline}
                    parentStartTime={event.startTime}
                    parentEndTime={event.endTime}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* RSVP/Check-in Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!isHost && (
            <>
              {/* Show RSVP button if user hasn't RSVP'd to mega event but has registered for sub-events */}
              {canRSVP && !userRSVP && subEventRegistrationStatus.hasAnyRegistration && (
                <div className="flex flex-col gap-2">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleRSVP}>
                    RSVP to Mega Event
                  </Button>
                  <p className="text-xs text-amber-300">
                    You're registered for {subEventRegistrationStatus.registeredSubEvents.length} sub-event{subEventRegistrationStatus.registeredSubEvents.length > 1 ? 's' : ''}. 
                    RSVP to the mega event to get updates and notifications.
                  </p>
                </div>
              )}
              
              {/* Show RSVP button if user hasn't RSVP'd and hasn't registered for any sub-events */}
              {canRSVP && !userRSVP && !subEventRegistrationStatus.hasAnyRegistration && (
                <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleRSVP}>
                  RSVP Now
                </Button>
              )}
              
              {/* Show message if user has RSVP'd to mega event but no sub-event registrations */}
              {userRSVP && !subEventRegistrationStatus.hasAnyRegistration && (
                <div className="flex flex-col gap-2">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-400 font-semibold">✓ RSVP'd to Mega Event</p>
                    <p className="text-green-300 text-sm">Register for sub-events below to participate</p>
                  </div>
                </div>
              )}
              
              {/* Show success message if user has both RSVP'd and registered for sub-events */}
              {userRSVP && subEventRegistrationStatus.hasAnyRegistration && (
                <div className="flex flex-col gap-2">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-400 font-semibold">✓ Fully Registered</p>
                    <p className="text-green-300 text-sm">
                      RSVP'd to mega event and registered for {subEventRegistrationStatus.registeredSubEvents.length} sub-event{subEventRegistrationStatus.registeredSubEvents.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Show check-in button if user has RSVP'd and can check in */}
              {userRSVP && canCheckIn && !isCheckedIn && (
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleCheckIn}>
                  Check In
                </Button>
              )}
            </>
          )}
        </div>

        {/* Host Analytics & Attendees Panel */}
        {isHost && (
          <AnalyticsPanel eventId={event.id} rsvps={event.rsvps || []} />
        )}

        {/* Invitations (Host Only) */}
        {isHost && (
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Manage Invitations</h2>
            <InviteForm eventId={event.id} onInviteSent={handleInvitationsUpdate} />
            <InvitationList invitations={invitations} onRefresh={handleInvitationsUpdate} />
          </div>
        )}

        {/* Feedback */}
        {canSendFeedback && (
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Live Feedback</h2>
            {feedbackError && <div className="text-red-400 mb-2">{feedbackError}</div>}
            <FeedbackForm onSubmit={handleSendFeedback} />
            <FeedbackList feedbacks={feedbackList} isHost={isHost} />
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetailPage;