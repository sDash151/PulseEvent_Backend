// frontend/src/components/layout/Header.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

const Header = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const scrollPositionRef = useRef(0)

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    setScrolled(currentScrollY > 10)
  }, [])

  useEffect(() => {
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [handleScroll])

  // Enhanced body scroll lock with better restoration
  useEffect(() => {
    if (mobileMenuOpen) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY
      
      // Apply scroll lock
      document.body.style.cssText = `
        overflow: hidden;
        position: fixed;
        top: -${scrollPositionRef.current}px;
        width: 100%;
        height: 100vh;
      `
      
      return () => {
        // Restore body styles
        document.body.style.cssText = ''
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current)
      }
    }
  }, [mobileMenuOpen])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) setMobileMenuOpen(false)
        if (showConfirm) setShowConfirm(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen, showConfirm])

  const handleLogout = useCallback(() => {
    setShowConfirm(true)
  }, [])

  const confirmLogout = useCallback(() => {
    setShowConfirm(false)
    setMobileMenuOpen(false)
    logout()
    navigate('/')
  }, [logout, navigate])

  const cancelLogout = useCallback(() => {
    setShowConfirm(false)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Navigation items configuration
  const navigationItems = [
    { to: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', showAlways: true },
    { to: '/dashboard', label: 'Dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', authRequired: true },
    { to: '/events/create', label: 'Create Event', icon: 'M12 4v16m8-8H4', authRequired: true },
    { to: '/invitations', label: 'Invitations', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', authRequired: true },
    { to: '/profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', authRequired: true, mobileOnly: true },
    { to: '/features', label: 'Features', icon: 'M13 10V3L4 14h7v7l9-11h-7z', showAlways: true },
  ]

  const visibleNavItems = navigationItems.filter(item => 
    item.showAlways || (item.authRequired && currentUser)
  )

  const mobileNavItems = navigationItems.filter(item => 
    item.showAlways || (item.authRequired && currentUser) || item.mobileOnly
  )

  return (
    <>
      <header className={`
        fixed w-full top-0 z-[100] transition-all duration-300 ease-out
        ${scrolled 
          ? 'bg-gray-900/95 backdrop-blur-xl py-2 shadow-2xl border-b border-white/10' 
          : 'bg-gray-900/30 backdrop-blur-md py-4'
        }
      `}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center relative">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 z-10 group"
              aria-label="EventPulse Home"
            >
              <div className="relative">
                <img 
                  src={import.meta.env.BASE_URL + 'assets/logo2.png'} 
                  alt="EventPulse Logo" 
                  className="w-10 h-10 rounded-full shadow-lg object-cover transition-transform duration-200 group-hover:scale-105" 
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                EventPulse
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" role="navigation">
              {visibleNavItems.filter(item => !item.mobileOnly).map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="
                    relative px-4 py-2 text-gray-200 hover:text-white 
                    transition-all duration-200 rounded-lg hover:bg-white/5 group
                  "
                >
                  {item.label}
                  <span className="
                    absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 
                    bg-gradient-to-r from-amber-400 to-orange-500 
                    transition-all duration-300 group-hover:w-3/4
                  " />
                </Link>
              ))}
              
              <a 
                href="https://souravdash151.netlify.app/" 
                target="_blank"
                rel="noopener noreferrer"
                className="
                  relative px-4 py-2 text-gray-200 hover:text-white 
                  transition-all duration-200 rounded-lg hover:bg-white/5 group
                "
              >
                Contact
                <span className="
                  absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 
                  bg-gradient-to-r from-amber-400 to-orange-500 
                  transition-all duration-300 group-hover:w-3/4
                " />
              </a>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  {/* Desktop User Profile */}
                  <div className="hidden sm:flex items-center gap-3">
                    <Link 
                      to="/profile" 
                      className="
                        flex items-center gap-2 px-3 py-2 rounded-lg 
                        hover:bg-white/5 transition-all duration-200 group
                      "
                      title={`Profile - ${currentUser.name}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:scale-105 transition-transform duration-200">
                        {currentUser.avatar ? (
                          <img 
                            src={currentUser.avatar} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover" 
                          />
                        ) : (
                          currentUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                        {currentUser.name.split(' ')[0]}
                      </span>
                    </Link>
                  </div>
                  
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    size="sm"
                    className="
                      border-amber-500/50 text-amber-400 hover:bg-amber-500/10 
                      hover:border-amber-400 transition-all duration-200
                    "
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
                    size="sm"
                    className="
                      hidden sm:flex px-4 py-2 rounded-xl text-white font-medium 
                      bg-white/5 backdrop-blur-md border border-amber-300/30 
                      hover:border-amber-400 hover:bg-amber-200/10 hover:text-amber-400 
                      hover:scale-105 hover:shadow-[0_0_12px_rgba(251,191,36,0.3)] 
                      transition-all duration-300
                    "
                  >
                    Login
                  </Button>
                  
                  <Button 
                    as={Link} 
                    to="/register" 
                    size="sm"
                    className="
                      hidden sm:flex relative px-4 py-2 rounded-xl text-white font-medium
                      bg-gradient-to-r from-amber-500 to-orange-500 
                      hover:from-amber-400 hover:to-orange-400
                      hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] 
                      transition-all duration-300 shadow-lg
                    "
                  >
                    Register
                  </Button>
                </>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                onClick={toggleMobileMenu}
                className="
                  md:hidden p-2 rounded-lg text-gray-200 hover:text-white 
                  hover:bg-white/10 transition-all duration-200 z-[110]
                "
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                <div className="w-6 h-6 relative">
                  <span className={`
                    absolute inset-0 transition-all duration-300 ease-in-out
                    ${mobileMenuOpen ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-1'}
                  `}>
                    <span className="block w-full h-0.5 bg-current" />
                  </span>
                  <span className={`
                    absolute inset-0 transition-all duration-300 ease-in-out
                    ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}
                  `}>
                    <span className="block w-full h-0.5 bg-current" />
                  </span>
                  <span className={`
                    absolute inset-0 transition-all duration-300 ease-in-out
                    ${mobileMenuOpen ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-1'}
                  `}>
                    <span className="block w-full h-0.5 bg-current" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Portal */}
      {mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
          {/* Background Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          />
          
          {/* Menu Panel */}
          <div 
            ref={menuRef}
            className="
              absolute top-0 right-0 h-full w-[85%] max-w-[380px] 
              bg-slate-900/95 backdrop-blur-xl shadow-2xl
              transform transition-transform duration-300 ease-out
              border-l border-slate-700/50
            "
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 bg-slate-800/50 border-b border-slate-700/50">
              <Link 
                to="/" 
                onClick={closeMobileMenu} 
                className="flex items-center gap-3 group"
                aria-label="EventPulse Home"
              >
                <img 
                  src={import.meta.env.BASE_URL + 'assets/logo2.png'} 
                  alt="EventPulse Logo" 
                  className="w-8 h-8 rounded-full object-cover group-hover:scale-105 transition-transform duration-200" 
                />
                <span className="text-lg font-bold text-white">
                  Event<span className="text-amber-400">Pulse</span>
                </span>
              </Link>
              
              <button 
                onClick={closeMobileMenu}
                className="
                  p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 
                  text-white transition-colors duration-200
                "
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Menu Content */}
            <div className="h-[calc(100%-88px)] overflow-y-auto">
              
              {/* User Profile Section */}
              {currentUser && (
                <div className="p-6 bg-slate-800/30 border-b border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {currentUser.avatar ? (
                        <img 
                          src={currentUser.avatar} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover" 
                        />
                      ) : (
                        currentUser.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-base truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-amber-400 text-sm">Welcome back!</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Links */}
              <nav className="py-4" role="navigation">
                <div className="px-4 space-y-1">
                  {mobileNavItems.map((item) => (
                    <Link 
                      key={item.to}
                      to={item.to} 
                      className="
                        flex items-center gap-4 px-4 py-4 text-slate-200 
                        hover:text-white hover:bg-slate-800/50 rounded-lg 
                        transition-all duration-200 font-medium group
                      "
                      onClick={closeMobileMenu}
                    >
                      <svg className="h-6 w-6 text-amber-400 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className="text-base">{item.label}</span>
                    </Link>
                  ))}
                  
                  <a 
                    href="https://souravdash151.netlify.app/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex items-center gap-4 px-4 py-4 text-slate-200 
                      hover:text-white hover:bg-slate-800/50 rounded-lg 
                      transition-all duration-200 font-medium group
                    "
                    onClick={closeMobileMenu}
                  >
                    <svg className="h-6 w-6 text-amber-400 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-base">Contact</span>
                  </a>
                </div>
              </nav>
              
              {/* Action Buttons */}
              <div className="px-6 py-6 mt-auto border-t border-slate-700/50 bg-slate-800/20">
                {currentUser ? (
                  <button 
                    onClick={handleLogout} 
                    className="
                      w-full flex items-center justify-center gap-2 px-6 py-4 
                      bg-red-600/90 hover:bg-red-600 text-white font-semibold 
                      rounded-lg transition-all duration-200 shadow-lg
                      hover:shadow-red-500/25
                    "
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      to="/login" 
                      className="
                        w-full flex items-center justify-center px-6 py-4 
                        border-2 border-amber-500/70 text-amber-400 font-semibold 
                        rounded-lg hover:bg-amber-500/10 hover:border-amber-400
                        transition-all duration-200
                      "
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="
                        w-full flex items-center justify-center px-6 py-4 
                        bg-gradient-to-r from-amber-500 to-orange-500 text-white 
                        font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400
                        hover:shadow-lg hover:shadow-amber-500/25 
                        transition-all duration-200
                      "
                      onClick={closeMobileMenu}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Logout Confirmation Dialog */}
      {showConfirm && createPortal(
        <div 
          className="
            fixed inset-0 z-[10000] flex items-center justify-center 
            bg-black/70 backdrop-blur-sm p-4
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="
            bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl 
            border border-gray-700/50 shadow-2xl p-6 w-full max-w-sm 
            text-center transform transition-all duration-300 scale-100
          ">
            <div className="mb-6 flex justify-center">
              <div className="
                w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 
                flex items-center justify-center shadow-lg
              ">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            
            <h3 id="logout-title" className="mb-2 text-xl font-bold text-white">
              Confirm Logout
            </h3>
            <p className="mb-6 text-gray-300 leading-relaxed">
              Are you sure you want to log out of your account?
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={confirmLogout} 
                className="
                  flex-1 bg-gradient-to-r from-amber-500 to-orange-500 
                  hover:from-amber-400 hover:to-orange-400 shadow-lg
                  hover:shadow-amber-500/25 transition-all duration-200
                "
              >
                Yes, Logout
              </Button>
              <Button 
                onClick={cancelLogout} 
                variant="outline"
                className="
                  flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50
                  hover:border-gray-500 transition-all duration-200
                "
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Header