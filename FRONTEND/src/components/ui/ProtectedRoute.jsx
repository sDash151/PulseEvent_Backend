// frontend/src/components/ui/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  console.log('🔐 ProtectedRoute check:', { currentUser: currentUser?.id, loading, pathname: location.pathname });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500/20 border-t-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    console.log('🔐 ProtectedRoute: No currentUser, redirecting to login');
    
    // Check if this is a mega event page (only /events/:id, not sub-events)
    const isMegaEventPage = /^\/events\/\d+$/.test(location.pathname)
    
    if (isMegaEventPage) {
      // For mega event pages, add redirect parameter
      const redirectUrl = `/login?redirect=${encodeURIComponent(location.pathname)}`
      console.log('🔐 ProtectedRoute: Mega event page detected, redirecting with parameter:', redirectUrl)
      return <Navigate to={redirectUrl} replace />
    } else {
      // For other protected pages, redirect to login without parameter
      console.log('🔐 ProtectedRoute: Non-event page, redirecting to login without parameter')
      return <Navigate to="/login" replace />
    }
  }

  console.log('🔐 ProtectedRoute: User authenticated, rendering protected content');
  return <Outlet />
}

export default ProtectedRoute