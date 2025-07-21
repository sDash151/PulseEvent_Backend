// frontend/src/components/ui/HostOnlyRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { hasRole, logSecurityEvent } from '../../utils/securityUtils'

const HostOnlyRoute = () => {
  const { currentUser, loading } = useAuth()

  console.log('🔐 HostOnlyRoute check:', { currentUser, role: currentUser?.role });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  // Check if user exists and has host role
  if (!currentUser || !hasRole(currentUser, 'host')) {
    console.warn('Access denied: User is not a host', { 
      userId: currentUser?.id, 
      userRole: currentUser?.role 
    });
    
    // Log security event for access denied
    logSecurityEvent('HOST_ONLY_ROUTE_ACCESS_DENIED', {
      userId: currentUser?.id,
      userRole: currentUser?.role,
      action: 'host_only_route_access'
    });
    
    return <Navigate to="/dashboard" replace />
  }

  // Log successful access
  logSecurityEvent('HOST_ONLY_ROUTE_ACCESS_GRANTED', {
    userId: currentUser.id,
    userRole: currentUser.role,
    action: 'host_only_route_access'
  });

  return <Outlet />
}

export default HostOnlyRoute 