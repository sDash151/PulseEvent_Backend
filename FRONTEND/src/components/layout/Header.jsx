// frontend/src/components/layout/Header.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import React, { useState } from 'react'

const Header = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    setShowConfirm(true)
  }

  const confirmLogout = () => {
    setShowConfirm(false)
    logout()
    navigate('/')
  }

  const cancelLogout = () => {
    setShowConfirm(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            EventPulse
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-indigo-600 transition-colors">Home</Link>
          {currentUser && (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 transition-colors">Dashboard</Link>
              <Link to="/events/create" className="text-gray-700 hover:text-indigo-600 transition-colors">Create Event</Link>
              <Link to="/invitations" className="text-gray-700 hover:text-indigo-600 transition-colors">Invitations</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <div className="hidden sm:flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Hi, {currentUser.name.split(' ')[0]}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="outline" size="sm">Login</Button>
              <Button as={Link} to="/register" size="sm">Register</Button>
            </>
          )}
        </div>
      </div>
      {/* Logout Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <div className="mb-4 text-lg font-semibold text-gray-800">Confirm Logout</div>
            <div className="mb-6 text-gray-600">Are you sure you want to log out?</div>
            <div className="flex justify-center gap-3">
              <Button onClick={confirmLogout} variant="danger" size="sm">Yes, Logout</Button>
              <Button onClick={cancelLogout} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header