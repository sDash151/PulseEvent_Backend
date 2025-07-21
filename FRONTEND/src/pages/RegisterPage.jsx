import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import { registerUser } from '../services/auth'
import { useAuth } from '../hooks/useAuth'
import { useErrorHandler } from '../hooks/useErrorHandler'

const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingInvite, setPendingInvite] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Use the custom error handler hook - always call with same parameters
  const {
    error,
    errorType,
    errorId,
    clearError,
    setSmartError,
    dismissError,
    handleInputChange
  } = useErrorHandler(10000); // 10 seconds auto-clear
  
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const inviteInfo = localStorage.getItem('pendingInviteInfo')
    if (inviteInfo) {
      setPendingInvite(JSON.parse(inviteInfo))
      localStorage.removeItem('pendingInviteInfo')
    }
    if (currentUser) {
      navigate('/dashboard')
    }
  }, [currentUser, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setSmartError('Passwords do not match')
      return
    }
    
    // Clear any existing error
    clearError();
    
    setLoading(true)
    
    try {
      const token = await registerUser(name, email, password)
      login(token)
      // Secure redirect logic
      const params = new URLSearchParams(location.search)
      const redirect = params.get('redirect')
      if (redirect && redirect.startsWith('/')) {
        navigate(redirect)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.'
      setSmartError(errorMessage, email)
    } finally {
      setLoading(false)
    }
  }

  // Smart input handlers using the error handler hook
  const handleEmailChange = useCallback((e) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    handleInputChange(newEmail, 'email')
  }, [handleInputChange])

  const handleNameChange = useCallback((e) => {
    const newName = e.target.value
    setName(newName)
    handleInputChange(newName, 'name')
  }, [handleInputChange])

  const handlePasswordChange = useCallback((e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    handleInputChange(newPassword, 'password')
  }, [handleInputChange])

  const handleConfirmPasswordChange = useCallback((e) => {
    const newConfirmPassword = e.target.value
    setConfirmPassword(newConfirmPassword)
    handleInputChange(newConfirmPassword, 'password')
  }, [handleInputChange])

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-8">
     <div className="max-w-md mx-auto relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.08)] p-6">
      {/* Ambient Glow Spotlights */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Registration Card - Compact Design */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-6">
        
        {/* Compact Invitation Banner */}
        {pendingInvite && (
          <div className="mb-4 p-3 bg-amber-400/10 border-l-4 border-amber-500 text-amber-200 rounded-lg shadow animate-fade-in">
            <div className="flex items-start gap-2">
              <span className="text-lg">🎉</span>
              <div>
                <div className="font-medium text-amber-300 text-sm">
                  You've been invited to <b>{pendingInvite.eventTitle}</b> by <b>{pendingInvite.hostName}</b>!
                </div>
                <div className="text-xs text-amber-400 mt-1">
                  After creating your account,{' '}
                  <a href={`/invitation/${pendingInvite.token}`} className="underline font-medium hover:text-amber-300">
                    click here to accept your invitation
                  </a>.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
          <p className="text-gray-300 text-sm mt-1">Join thousands of event organizers using EventPulse</p>
        </div>

        {/* Compact Error Message Component */}
        <ErrorMessage
          error={error}
          type={errorType}
          errorId={errorId}
          onDismiss={dismissError}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 text-xs"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 text-xs"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full justify-center mt-6"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300">
            Sign in
          </Link>
        </div>

        {/* Compact guidance for existing users - only show for account exists errors */}
        {errorType === 'success' && error && (
          <div className="mt-3 p-3 bg-gradient-to-r from-green-400/10 to-blue-400/10 border border-green-400/20 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-green-300 font-medium text-xs">Welcome back!</p>
            </div>
            <p className="text-green-200 text-xs leading-tight mb-2">
              Great to see you again! Your account is already set up and ready to go.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1 text-green-300 hover:text-green-200 font-medium text-xs"
            >
              <span>Sign In Now</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default RegisterPage;
