import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import { loginUser, resendVerificationEmail } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { useErrorHandler } from '../hooks/useErrorHandler';

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
      login(token);
      // Secure redirect logic
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        navigate(redirect);
      } else {
        navigate('/dashboard');
      }
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
      
      {/* Ambient Glow Spotlights */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Glassmorphic Card - Compact Design */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-300 text-sm mt-1">Sign in to your EventPulse account</p>
        </div>

        {/* Compact Error Message Component */}
        <ErrorMessage
          error={error}
          type={errorType}
          errorId={errorId}
          onDismiss={dismissError}
        />
        {/* Resend Verification Success Message */}
        {resendSuccess && (
          <div className="mb-4 p-3 rounded-lg border bg-green-500/10 border-green-500/20 text-green-400 text-sm text-center animate-fade-in">
            {resendSuccess}
          </div>
        )}
        {/* If error is 'Email not verified', show info and button to /check-email */}
        {error && error.toLowerCase().includes('not verified') && !resendSuccess && (
          <div className="mb-4 w-full flex flex-col items-center">
            <div className="bg-amber-100/10 border border-amber-300/30 text-amber-200 rounded-lg px-4 py-2 mb-2 text-center text-sm font-semibold">
              You are not a registered user. You will only be considered registered if you verify your registration.
            </div>
            <Button
              className="w-full mt-2"
              onClick={() => navigate('/check-email', { state: { email, alreadySent: true } })}
              variant="outline"
            >
              Go to Verify Email Page
            </Button>
          </div>
        )}
        {/* Resend Verification Form (direct access via ?resend=1) */}
        {showResendForm ? (
          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label htmlFor="resend-email" className="block text-sm font-medium text-gray-300 mb-1">
                Enter your email to resend verification
              </label>
              <input
                type="email"
                id="resend-email"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full justify-center mt-2" disabled={resendLoading}>
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <div className="mt-2 text-xs text-gray-400 text-center">
              <Link to="/login" className="text-amber-400 hover:text-amber-300">Back to Login</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300">
                    Forgot password?
                  </Link>
                </div>
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

              <Button 
                type="submit" 
                className="w-full justify-center mt-6"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            {/* Resend Verification Button if error is 'Email not verified' */}
            {error && error.toLowerCase().includes('not verified') && !resendSuccess && (
              <Button
                onClick={handleResend}
                className="w-full justify-center mt-4"
                disabled={resendLoading || !canResend}
                variant="outline"
                icon={(!canResend) ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0121 12.75v6A2.25 2.25 0 0118.75 21h-13.5A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5h13.5zm-6 3v2.25" /></svg>
                ) : undefined}
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            )}
          </form>
        )}
        <div className="mt-4 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-amber-400 hover:text-amber-300">
            Sign up
          </Link>
        </div>

        {/* Compact guidance for new users - only show for account not found errors */}
        {errorType === 'info' && error && (
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 bg-blue-400/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-300 font-medium text-xs">New to EventPulse?</p>
            </div>
            <p className="text-blue-200 text-xs leading-tight mb-2">
              Create your account to start organizing and attending amazing events.
            </p>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium text-xs"
            >
              <span>Create Account</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;