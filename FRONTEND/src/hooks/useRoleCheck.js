// frontend/src/hooks/useRoleCheck.js
import { useAuth } from './useAuth'
import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { 
  hasRole, 
  canAccessHostFeatures as canAccessHostFeaturesUtil, 
  isEventHost as isEventHostUtil,
  logSecurityEvent 
} from '../utils/securityUtils'

export const useRoleCheck = () => {
  const { currentUser, loading } = useAuth()
  const [isHost, setIsHost] = useState(false)
  const [isEventHost, setIsEventHost] = useState(false)
  const [checkingEventHost, setCheckingEventHost] = useState(false)

  // Check if user is a host (any event)
  useEffect(() => {
    if (!loading && currentUser) {
      const hostStatus = hasRole(currentUser, 'host')
      setIsHost(hostStatus)
      
      // Log role check for security monitoring
      if (hostStatus) {
        logSecurityEvent('ROLE_CHECK_SUCCESS', {
          userId: currentUser.id,
          role: currentUser.role,
          action: 'host_role_verification'
        })
      }
    } else {
      setIsHost(false)
    }
  }, [currentUser, loading])

  // Function to check if user is the host of a specific event
  const checkEventHost = useCallback(async (eventId) => {
    if (!currentUser || !eventId) {
      console.log('useRoleCheck - checkEventHost: No user or eventId', { currentUser, eventId });
      setIsEventHost(false)
      return false
    }

    setCheckingEventHost(true)
    try {
      console.log('useRoleCheck - checkEventHost: Fetching event data', { eventId, currentUserId: currentUser.id });
      
      const response = await api.get(`/api/events/${eventId}`)
      const event = response.data
      
      console.log('useRoleCheck - checkEventHost: Event data received', { 
        eventId, 
        eventHostId: event.hostId, 
        currentUserId: currentUser.id,
        eventTitle: event.title 
      });
      
      const isHostOfEvent = isEventHostUtil(currentUser, event)
      setIsEventHost(isHostOfEvent)
      
      console.log('useRoleCheck - checkEventHost: Host check result', { 
        eventId, 
        isHost: isHostOfEvent,
        eventHostId: event.hostId,
        currentUserId: currentUser.id
      });
      
      // Log event host check for security monitoring
      logSecurityEvent('EVENT_HOST_CHECK', {
        userId: currentUser.id,
        eventId: eventId,
        isHost: isHostOfEvent,
        eventHostId: event.hostId
      })
      
      return isHostOfEvent
    } catch (error) {
      console.error('useRoleCheck - checkEventHost: Error checking event host', {
        eventId,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setIsEventHost(false)
      
      // Log failed event host check
      logSecurityEvent('EVENT_HOST_CHECK_FAILED', {
        userId: currentUser?.id,
        eventId: eventId,
        error: error.message
      })
      
      return false
    } finally {
      setCheckingEventHost(false)
    }
  }, [currentUser])

  // Function to check if user can access host-only features
  const canAccessHostFeatures = () => {
    const canAccess = canAccessHostFeaturesUtil(currentUser)
    
    // Log access check for security monitoring
    if (!canAccess && currentUser) {
      logSecurityEvent('ACCESS_DENIED', {
        userId: currentUser.id,
        userRole: currentUser.role,
        action: 'host_features_access'
      })
    }
    
    return !loading && canAccess
  }

  // Function to check if user can manage a specific event
  const canManageEvent = (eventId) => {
    return !loading && currentUser && hasRole(currentUser, 'host') && eventId
  }

  // Function to check if user has a specific role
  const hasUserRole = (requiredRole) => {
    return !loading && hasRole(currentUser, requiredRole)
  }

  // Function to validate current session security
  const validateSession = () => {
    if (!currentUser || loading) {
      return false
    }
    
    // Check if token exists and user data is complete
    const token = localStorage.getItem('token')
    if (!token || !currentUser.id || !currentUser.email || !currentUser.name) {
      logSecurityEvent('SESSION_INVALID', {
        userId: currentUser?.id,
        hasToken: !!token,
        hasCompleteData: !!(currentUser.id && currentUser.email && currentUser.name)
      })
      return false
    }
    
    return true
  }

  return {
    isHost,
    isEventHost,
    checkingEventHost,
    checkEventHost,
    canAccessHostFeatures,
    canManageEvent,
    hasUserRole,
    validateSession,
    loading
  }
} 