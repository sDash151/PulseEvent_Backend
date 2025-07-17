// frontend/src/components/layout/Header.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import React, { useState, useEffect } from 'react'

const Header = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/90 backdrop-blur-md py-2 shadow-xl' : 'bg-transparent py-3'}`}>
      
      <div className="container mx-auto px-4 flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-10">
          <img src={import.meta.env.BASE_URL + 'assets/logo2.png'} alt="EventPulse Logo" className="w-10 h-10 rounded-full shadow-lg object-cover" />
          <span className="text-xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            EventPulse
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="relative text-gray-200 hover:text-white transition-colors group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          {currentUser ? (
            <>
              <Link 
                to="/dashboard" 
                className="relative text-gray-200 hover:text-white transition-colors group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                to="/events/create" 
                className="relative text-gray-200 hover:text-white transition-colors group"
              >
                Create Event
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                to="/invitations" 
                className="relative text-gray-200 hover:text-white transition-colors group"
              >
                Invitations
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </>
          ) : null}
          <Link 
            to="/features" 
            className="relative text-gray-200 hover:text-white transition-colors group"
          >
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/contact" 
            className="relative text-gray-200 hover:text-white transition-colors group"
          >
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <div className="hidden sm:flex items-center">
                <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold shadow hover:scale-105 transition-all" title="Profile">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </Link>
                <span className="ml-2 text-sm font-medium text-gray-200">Hi, {currentUser.name.split(' ')[0]}</span>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              {/* Login Button (Secondary) */}
              <Button 
                as={Link} 
                to="/login" 
                variant="outline" 
                size="sm"
                className="
                  px-6 py-3 rounded-xl text-white font-bold bg-white/5 backdrop-blur-md border border-amber-300/30 hover:border-amber-400 hover:bg-amber-200/10 hover:text-amber-400 hover:scale-105 hover:shadow-[0_0_12px_#fbbf24] transition-all duration-300
                "
              >
                Login
              </Button>
              {/* Register Button (Primary CTA) */}
              <Button 
                as={Link} 
                to="/register" 
                size="sm"
                className="
                  relative px-6 py-3 rounded-xl text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] before:absolute before:inset-0 before:bg-gradient-to-r from-white/10 via-white/30 to-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity before:duration-700 before:blur-sm
                "
              >
                Register
              </Button>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden ml-2 text-gray-200 focus:outline-none z-20"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-900/95 backdrop-blur-lg z-30 pt-20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-6">
              <Link 
                to="/" 
                className="text-xl text-white py-3 border-b border-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {currentUser ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-xl text-white py-3 border-b border-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/events/create" 
                    className="text-xl text-white py-3 border-b border-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                  <Link 
                    to="/invitations" 
                    className="text-xl text-white py-3 border-b border-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Invitations
                  </Link>
                </>
              ) : null}
              <Link 
                to="/features" 
                className="text-xl text-white py-3 border-b border-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/contact" 
                className="text-xl text-white py-3 border-b border-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-10 flex flex-col gap-4">
                {currentUser ? (
                  <>
                    <Button 
                      as={Link}
                      to="/profile"
                      className="justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Button>
                    <Button 
                      onClick={handleLogout} 
                      variant="outline"
                      className="border-amber-500 text-amber-400 justify-center"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      as={Link} 
                      to="/login" 
                      variant="outline"
                      className="border-amber-500 text-amber-400 justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Button>
                    <Button 
                      as={Link} 
                      to="/register" 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Logout Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl p-6 w-full max-w-xs text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <div className="mb-4 text-lg font-semibold text-white">Confirm Logout</div>
            <div className="mb-6 text-gray-300">Are you sure you want to log out?</div>
            <div className="flex justify-center gap-3">
              <Button 
                onClick={confirmLogout} 
                className="bg-gradient-to-r from-amber-500 to-orange-500 shadow hover:shadow-md"
              >
                Yes, Logout
              </Button>
              <Button 
                onClick={cancelLogout} 
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
    </header>
  )
}

export default Header