// frontend/src/components/ui/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth()

   console.log('🔐 ProtectedRoute check:', currentUser);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoute