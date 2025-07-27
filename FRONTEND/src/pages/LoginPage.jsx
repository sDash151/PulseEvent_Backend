import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import { loginUser, resendVerificationEmail } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { getSafeRedirectUrl } from '../utils/redirectValidation';

const RESEND_WAIT_MINUTES = 10;
const RESEND_WAIT_MS = RESEND_WAIT_MINUTES * 60 * 1000;
const getResendKey = (email) => `resend_verification_${email}`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  
  // Timer state
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef();
  
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
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const showResendForm = params.get('resend') === '1';
  const redirectPath = params.get('redirect');

  // Timer logic: update on email or resendSuccess
  useEffect(() => {
    if (email) {
      const key = getResendKey(email);
      let expiry = localStorage.getItem(key);
      if (expiry && !isNaN(Number(expiry)) && Number(expiry) > Date.now()) {
        updateRemaining();
        timerRef.current = setInterval(updateRemaining, 1000);
        return () => clearInterval(timerRef.current);
      } else {
        setRemaining(0);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
    // eslint-disable-next-line
  }, [email, resendSuccess]);

  const updateRemaining = () => {
    const key = getResendKey(email);
    const expiry = Number(localStorage.getItem(key));
    const now = Date.now();
    const diff = expiry - now;
    setRemaining(diff > 0 ? diff : 0);
    if (diff <= 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Format mm:ss
  const formatTime = (ms) => {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const canResend = remaining <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any existing error
    clearError();
    
    setLoading(true);
    setResendSuccess('');
    
    try {
      const token = await loginUser(email, password);
      await login(token); // Wait for login to complete
      
      // Secure redirect logic with validation
      const safeRedirectUrl = getSafeRedirectUrl(redirectPath, '/');
      navigate(safeRedirectUrl);
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setSmartError(errorMessage, email);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e?.preventDefault?.();
    setResendLoading(true);
    setResendSuccess('');
    try {
      const message = await resendVerificationEmail(email);
      setResendSuccess(message);
      // Set new expiry
      const key = getResendKey(email);
      const expiry = Date.now() + RESEND_WAIT_MS;
      localStorage.setItem(key, expiry);
      setRemaining(RESEND_WAIT_MS);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(updateRemaining, 1000);
    } finally {
      setResendLoading(false);
    }
  };

  // Smart input handlers using the error handler hook
  const handleEmailChange = useCallback((e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    handleInputChange(newEmail, 'email');
  }, [handleInputChange]);

  const handlePasswordChange = useCallback((e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    handleInputChange(newPassword, 'password');
  }, [handleInputChange]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center overflow-hidden px-4 py-8">
      
      {/* Enhanced Ambient Glow Spotlights with Animation */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0 animate-pulse"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0 animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Floating Particles Effect */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Enhanced Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-pink-400 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-300 text-sm">
            Sign in to your EventPulse account
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-8">
          
          {/* Redirect Message - Only show if user came from event link */}
          {redirectPath && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-1">
                    Event Access Required
                  </p>
                  <p className="text-blue-200 text-xs">
                    Sign in to access the event. You'll be redirected to the event page after successful login.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Error Message Component */}
          <ErrorMessage
            error={error}
            type={errorType}
            errorId={errorId}
            onDismiss={dismissError}
          />
          
          {/* Resend Verification Success Message */}
          {resendSuccess && (
            <div className="mb-6 p-4 rounded-xl border bg-green-500/10 border-green-500/20 text-green-400 text-sm text-center animate-fade-in">
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {resendSuccess}
              </div>
            </div>
          )}
          
          {/* Email Not Verified Section */}
          {error && error.toLowerCase().includes('not verified') && !resendSuccess && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-400/10 to-orange-400/10 border border-amber-400/30 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-200 text-sm font-medium mb-2">
                    Email verification required
                  </p>
                  <p className="text-amber-100 text-xs mb-3">
                    Please verify your email address to access your account.
                  </p>
                  <Button
                    onClick={() => navigate('/check-email', { state: { email, alreadySent: true } })}
                    variant="outline"
                    className="w-full text-xs py-2"
                  >
                    Go to Email Verification
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Resend Verification Form */}
          {showResendForm ? (
            <form onSubmit={handleResend} className="space-y-6">
              <div>
                <label htmlFor="resend-email" className="block text-sm font-semibold text-gray-200 mb-2">
                  Resend Verification Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="resend-email"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                    className={`w-full px-4 py-3 bg-white/10 text-white border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                      isFocused.email 
                        ? 'border-amber-400 focus:ring-amber-400/20' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder="Enter your email address"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full justify-center py-3 text-base font-semibold" 
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
                  ← Back to Login
                </Link>
              </div>
            </form>
          ) : (
            /* Main Login Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                    className={`w-full px-4 py-3 bg-white/10 text-white border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                      isFocused.email 
                        ? 'border-amber-400 focus:ring-amber-400/20' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder="you@example.com"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-200">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setIsFocused({ ...isFocused, password: true })}
                    onBlur={() => setIsFocused({ ...isFocused, password: false })}
                    className={`w-full px-4 py-3 bg-white/10 text-white border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 text-sm pr-12 ${
                      isFocused.password 
                        ? 'border-amber-400 focus:ring-amber-400/20' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full justify-center py-3 text-base font-semibold bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Resend Verification Button */}
              {error && error.toLowerCase().includes('not verified') && !resendSuccess && (
                <Button
                  onClick={handleResend}
                  className="w-full justify-center py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200"
                  disabled={resendLoading || !canResend}
                >
                  {resendLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : !canResend ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Resend in {formatTime(remaining)}
                    </div>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              )}
            </form>
          )}
        </div>

        {/* Enhanced Sign Up Section */}
        <div className="mt-6 p-6 bg-gradient-to-r from-amber-400/10 via-pink-400/10 to-purple-400/10 border border-amber-400/20 rounded-2xl backdrop-blur-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-pink-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">New to EventPulse?</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Join thousands of event organizers and attendees. Create amazing events, discover new opportunities, and connect with like-minded people.
            </p>
            <Button 
              as={Link} 
              to="/register" 
              className="w-full justify-center py-3 text-base font-semibold bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Your Account
            </Button>
          </div>
        </div>

        {/* Enhanced Guidance for New Users */}
        {errorType === 'info' && error && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-blue-300 font-medium text-sm mb-1">Account not found?</p>
                <p className="text-blue-200 text-xs leading-tight mb-2">
                  Create your account to start organizing and attending amazing events.
                </p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium text-xs transition-colors"
                >
                  <span>Create Account</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;