import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, isBefore, isAfter } from 'date-fns'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FeedbackList from '../components/feedback/FeedbackList'
import FeedbackForm from '../components/feedback/FeedbackForm'
import { fetchEventById } from '../services/events'
import { rsvpToEvent, checkInToEvent } from '../services/rsvp'
import { useAuth } from '../hooks/useAuth'
import InviteForm from '../components/invitations/inviteForm'
import InvitationList from '../components/invitations/InvitationList'
import { getEventInvitations } from '../services/invitations'
import { initSocket, connectSocket, joinEventRoom, sendFeedback, subscribeToFeedback, disconnectSocket } from '../services/socket'

const EventDetailPage = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState([])
  const [error, setError] = useState('')
  const [feedbackList, setFeedbackList] = useState([])
  const { currentUser } = useAuth()

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEventById(id)
        setEvent(eventData)
        setFeedbackList(eventData.feedbacks || [])
        
        // Fetch invitations if user is host
        if (currentUser && eventData.hostId === currentUser.id) {
          const invites = await getEventInvitations(id)
          console.log('Invitations response:', invites)
          setInvitations(invites.data)
        }
      } catch (err) {
        setError(err.message || 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [id, currentUser])

  useEffect(() => {
    // Initialize socket connection with token
    if (currentUser && currentUser.token) {
      initSocket(currentUser.token)
      connectSocket()
      joinEventRoom(id)

      const handleNewFeedback = (newFeedback) => {
        setFeedbackList(prev => [newFeedback, ...prev])
      }

      subscribeToFeedback(handleNewFeedback)

      return () => {
        // Clean up: disconnect socket when component unmounts
        disconnectSocket()
      }
    }
  }, [id, currentUser])

  const handleRSVP = async () => {
    try {
      await rsvpToEvent(id)
      // Update event state to reflect new RSVP
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
      // Update event state to reflect check-in
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
    if (!currentUser) return
    sendFeedback(id, content, emoji, currentUser.id)
  }

  const handleInvitationsUpdate = async () => {
    try {
      const invites = await getEventInvitations(id)
      setInvitations(invites.data)
    } catch (err) {
      setError('Failed to refresh invitations')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl">
          {error}
        </div>
      </div>
    )
  }

  const isHost = currentUser && event.hostId === currentUser.id
  const userRSVP = event.rsvps.find(rsvp => rsvp.userId === currentUser?.id)
  const isCheckedIn = userRSVP?.checkedIn
  const now = new Date()
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)
  const rsvpDeadline = new Date(event.rsvpDeadline)
  const isEventLive = isBefore(now, endTime) && isAfter(now, startTime)
  const canCheckIn = isBefore(now, endTime) && isAfter(now, new Date(startTime.getTime() - 60 * 60 * 1000))
  const canRSVP = isBefore(now, rsvpDeadline) && event.rsvps.length < event.maxAttendees

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              {event.title}
              {isEventLive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <span className="live-pulse flex h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Live
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">{event.location}</p>
          </div>
          <div className="flex gap-2">
            {isHost && (
              <Button as={Link} to={`/events/${event.id}/edit`} variant="outline">
                Edit Event
              </Button>
            )}
            <Button as={Link} to="/dashboard" variant="ghost">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="prose max-w-none">
              <p className="text-gray-700">{event.description}</p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Date & Time</h3>
                  <p className="mt-1 text-gray-700">
                    {format(startTime, 'EEEE, MMMM d, yyyy')}
                    <br />
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">RSVP Deadline</h3>
                  <p className="mt-1 text-gray-700">
                    {format(rsvpDeadline, 'MMM d, h:mm a')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Attendees</h3>
                  <p className="mt-1 text-gray-700">
                    {event.rsvps.length} of {event.maxAttendees} registered
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Host</h3>
                  <div className="mt-1 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                      {event.host.name.charAt(0)}
                    </div>
                    <span className="ml-2 text-gray-700">{event.host.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Invitation Management Section - Only for Host */}
          {isHost && (
            <Card title="Invitation Management">
              <InviteForm 
                eventId={event.id} 
                onInviteSent={handleInvitationsUpdate} 
              />
              <InvitationList 
                invitations={invitations} 
                onRefresh={handleInvitationsUpdate} 
              />
            </Card>
          )}
          
          {isEventLive && (
            <Card title="Live Feedback">
              <FeedbackForm onSubmit={handleSendFeedback} />
              <FeedbackList feedbacks={feedbackList} isHost={isHost} />
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card title="Event Actions">
            <div className="space-y-4">
              {!isHost && (
                <>
                  {canRSVP && !userRSVP && (
                    <Button className="w-full" onClick={handleRSVP}>
                      RSVP to Event
                    </Button>
                  )}
                  
                  {userRSVP && !isCheckedIn && canCheckIn && (
                    <Button className="w-full" onClick={handleCheckIn}>
                      Check In Now
                    </Button>
                  )}
                  
                  {userRSVP && isCheckedIn && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-lg text-center">
                      <p className="font-medium">You're checked in!</p>
                      <p className="text-sm mt-1">Enjoy the event</p>
                    </div>
                  )}
                  
                  {userRSVP && !canCheckIn && !isCheckedIn && (
                    <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg">
                      <p className="font-medium">Check-in closed</p>
                      <p className="text-sm mt-1">Check-in period has ended</p>
                    </div>
                  )}
                </>
              )}
              
              {isHost && (
                <div className="space-y-3">
                  <Button as={Link} to={`/analytics/${event.id}`} className="w-full">
                    View Analytics
                  </Button>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-medium text-indigo-700">Host Controls</h4>
                    <p className="text-sm text-indigo-600 mt-1">
                      You have special privileges to manage this event
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <Card title="Attendees">
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Attendees ({event.rsvps.length})</span>
                <span>Checked In: {event.rsvps.filter(r => r.checkedIn).length}</span>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {event.rsvps.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No attendees yet</p>
                ) : (
                  event.rsvps.map(rsvp => (
                    <div key={rsvp.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm">
                          {rsvp.user.name.charAt(0)}
                        </div>
                        <span className="ml-2 text-gray-700">{rsvp.user.name}</span>
                      </div>
                      {rsvp.checkedIn ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Checked In</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Registered</span>
                      )}
                    </div>
                  ))
                ) }
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage