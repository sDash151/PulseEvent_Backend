// frontend/src/components/ui/EventHostRoute.jsx
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { isEventHost, logSecurityEvent } from '../../utils/securityUtils'

const EventHostRoute = () => {
  const { currentUser, loading } = useAuth()
  const { id, parentId, subId } = useParams()
  const [event, setEvent] = useState(null)
  const [checkingHost, setCheckingHost] = useState(true)
  const [error, setError] = useState(null)

  // Determine which event ID to check (for sub-events, we need the sub-event ID)
  const eventId = subId || id

  useEffect(() => {
    const checkEventHost = async () => {
      if (!currentUser || !eventId) {
        setCheckingHost(false)
        return
      }

      try {
        console.log('🔍 Checking event host for:', { currentUser: currentUser.id, eventId })
        const response = await api.get(`/api/events/${eventId}`)
        const eventData = response.data
        setEvent(eventData)
        
        // Enhanced debugging for host check
        console.log('📋 Event data received:', {
          eventId: eventData.id,
          eventHostId: eventData.hostId,
          currentUserId: currentUser.id,
          hostIdType: typeof eventData.hostId,
          userIdType: typeof currentUser.id
        })
        
        // Log security event for monitoring
        const isHost = isEventHost(currentUser, eventData)
        logSecurityEvent('EVENT_HOST_ROUTE_CHECK', {
          userId: currentUser.id,
          eventId: eventId,
          isHost: isHost,
          eventHostId: eventData.hostId,
          hostIdType: typeof eventData.hostId,
          userIdType: typeof currentUser.id
        })
        
      } catch (err) {
        console.error('❌ Error checking event host:', err)
        setError('Failed to verify event ownership')
        
        // Log security event for failed check
        logSecurityEvent('EVENT_HOST_ROUTE_CHECK_FAILED', {
          userId: currentUser?.id,
          eventId: eventId,
          error: err.message,
          response: err.response?.data
        })
      } finally {
        setCheckingHost(false)
      }
    }

    checkEventHost()
  }, [currentUser, eventId])

  console.log('🔐 EventHostRoute check:', { 
    currentUser, 
    eventHostId: event?.hostId, 
    isHost: event ? isEventHost(currentUser, event) : false 
  });

  if (loading || checkingHost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  // Check if user exists and is the host of this specific event
  const isHost = event ? isEventHost(currentUser, event) : false;
  const hasHostRole = currentUser?.role === 'host';
  
  console.log('🔐 Final access check:', {
    userId: currentUser?.id,
    eventHostId: event?.hostId,
    eventId,
    isHost,
    hasHostRole,
    userRole: currentUser?.role
  });
  
  if (!currentUser || !event || (!isHost && !hasHostRole)) {
    console.warn('❌ Access denied: User is not the event host', { 
      userId: currentUser?.id, 
      eventHostId: event?.hostId,
      eventId,
      isHost,
      hasHostRole
    });
    
    // Log security event for access denied
    logSecurityEvent('EVENT_HOST_ROUTE_ACCESS_DENIED', {
      userId: currentUser?.id,
      eventId: eventId,
      eventHostId: event?.hostId,
      isHost,
      hasHostRole
    });
    
    return <Navigate to="/dashboard" replace />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default EventHostRoute 