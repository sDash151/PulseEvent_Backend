import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, isBefore, isAfter } from 'date-fns'
import Button from '../components/ui/Button'
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
import { initSocket, connectSocket, joinEventRoom, sendFeedback, subscribeToFeedback, disconnectSocket } from '../services/socket'

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
  const socketRef = useRef(null)
  const feedbackHandlerRef = useRef(null)

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEventById(id)
        setEvent(eventData)
        setFeedbackList(eventData.feedbacks || [])

        if (currentUser && eventData.hostId === currentUser.id) {
          const invites = await getEventInvitations(id)
          setInvitations(invites.data)
        }
      } catch (err) {
        setError(err.message || 'Failed to load event')
      } finally {
        setEventLoading(false)
      }
    }
    loadEvent()
  }, [id, currentUser])

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
        joinEventRoom(id)
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

  if (eventLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-red-400 text-xl">
        {error}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-[20%] w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-10 right-[15%] w-72 h-72 bg-amber-400/10 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-0 left-[10%] w-60 h-60 bg-blue-400/10 rounded-full blur-[100px] z-0" />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-gray-300">{event.location}</p>
          </div>
          <div className="flex gap-3">
            {isHost && (
              <Link to={`/events/${event.id}/edit`} className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-amber-400 font-semibold">
                Edit Event
              </Link>
            )}
            <Link to="/dashboard" className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Glassmorphic Card */}
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
        </div>

        {/* RSVP/Check-in Actions */}
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
        {/* Host Analytics & Attendees Panel */}
        {isHost && (
          <AnalyticsPanel eventId={event.id} rsvps={event.rsvps} />
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
        {isEventLive && (
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-amber-400 mb-4">Live Feedback</h2>
            {feedbackError && <div className="text-red-400 mb-2">{feedbackError}</div>}
            <FeedbackForm onSubmit={handleSendFeedback} />
            <FeedbackList feedbacks={feedbackList} isHost={isHost} />
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetailPage
