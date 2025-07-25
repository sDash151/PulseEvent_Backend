import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import { resetPassword } from '../services/auth';
import Modal from '../components/ui/Modal';
import { ExclamationTriangleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return regex.test(password);
};

// Password strength regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function getPasswordStrength(password) {
  if (!password) return '';
  if (strongPasswordRegex.test(password)) return 'Strong';
  if (password.length >= 8) return 'Medium';
  return 'Weak';
}

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenStatus, setTokenStatus] = useState('valid'); // valid, expired, invalid
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenStatus('invalid');
        setCheckingToken(false);
        return;
      }
      try {
        // Call backend to check token validity (simulate by calling reset endpoint with GET or a new endpoint)
        const res = await api.get(`/api/auth/reset-status?token=${encodeURIComponent(token)}`);
        if (res.data.valid) {
          setTokenStatus('valid');
        } else if (res.data.expired) {
          setTokenStatus('expired');
        } else {
          setTokenStatus('invalid');
        }
      } catch {
        setTokenStatus('invalid');
      } finally {
        setCheckingToken(false);
      }
    };
    checkToken();
    // eslint-disable-next-line
  }, [token]);

  if (checkingToken) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (tokenStatus !== 'valid') {
    const config = {
      expired: {
        icon: (
          <span className="flex flex-col items-center">
            <span className="text-5xl mb-2 animate-pulse">⌛</span>
            <ExclamationTriangleIcon className="w-14 h-14 text-red-400 drop-shadow-lg" />
          </span>
        ),
        title: 'Link Expired',
        message: 'Oops! This password reset link has expired. Please request a new one to reset your password.',
        action: 'resend',
        actionLabel: 'Request New Reset Link',
      },
      invalid: {
        icon: (
          <span className="flex flex-col items-center">
            <span className="text-5xl mb-2 animate-pulse">😕</span>
            <XCircleIcon className="w-14 h-14 text-red-400 drop-shadow-lg" />
          </span>
        ),
        title: 'Invalid Link',
        message: 'This password reset link is invalid or has already been used. Please request a new one.',
        action: 'resend',
        actionLabel: 'Request New Reset Link',
      }
    }[tokenStatus];
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center overflow-hidden px-4 py-8">
        <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
        <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
        <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>
        <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center animate-fade-in">
          <div className="mb-4">{config.icon}</div>
          <h2 className="text-3xl font-extrabold text-white mb-3 drop-shadow-lg animate-fade-in-up">{config.title}</h2>
          <p className="text-gray-200 text-lg mb-8 animate-fade-in-up delay-100">{config.message}</p>
          <Button
            onClick={() => navigate('/forgot-password')}
            className="w-full justify-center text-lg py-3 font-bold shadow-xl animate-pop-in"
            variant="primary"
            icon={<ArrowPathIcon className="w-5 h-5" />}
            iconPosition="left"
          >
            {config.actionLabel}
          </Button>
        </div>
        <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pop-in { 0% { transform: scale(0.8); opacity: 0; } 80% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
          .animate-fade-in { animation: fade-in 0.7s both; }
          .animate-fade-in-up { animation: fade-in-up 0.8s both; }
          .animate-pop-in { animation: pop-in 0.5s both; }
          .delay-100 { animation-delay: 0.1s; }
        `}</style>
      </div>
    );
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(getPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={success} onClose={() => navigate('/login')} title="Password Changed!" size="sm" backdrop="heavy" animation="scale" showCloseButton={false}>
        <div className="flex flex-col items-center gap-6 p-4">
          <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
          </svg>
          <p className="text-2xl font-bold text-green-400">Password Changed!</p>
          <p className="text-gray-200 text-center">Your password has been updated. You can now log in with your new password.</p>
          <Button
            variant="success"
            size="lg"
            className="w-full mt-2"
            onClick={() => navigate('/login')}
            autoFocus
          >
            Go to Login
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center overflow-hidden px-4 py-8">
      {/* Ambient Glow Spotlights */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-6 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
          <p className="text-gray-300 text-sm mt-1">Enter your new password below</p>
        </div>
        <ErrorMessage error={error} onDismiss={() => setError('')} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm pr-12"
                placeholder="Enter new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:underline focus:outline-none bg-transparent px-2 py-1 rounded"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && (
              <div className={`mt-1 text-xs font-semibold ${passwordStrength === 'Strong' ? 'text-green-400' : passwordStrength === 'Medium' ? 'text-amber-300' : 'text-red-400'}`}>Strength: {passwordStrength}</div>
            )}
            {/* Password requirements */}
            <ul className="mt-1 text-xs text-gray-300 space-y-0.5">
              <li className={password.length >= 8 ? 'text-green-400' : ''}>• At least 8 characters</li>
              <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>• At least 1 uppercase letter</li>
              <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>• At least 1 lowercase letter</li>
              <li className={/\d/.test(password) ? 'text-green-400' : ''}>• At least 1 number</li>
              <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-green-400' : ''}>• At least 1 special character</li>
            </ul>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm pr-12"
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:underline focus:outline-none bg-transparent px-2 py-1 rounded"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <div className="mt-1 text-xs text-red-400">Passwords do not match.</div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full justify-center mt-2"
            disabled={loading || success || passwordStrength !== 'Strong' || password !== confirmPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        <div className="mt-4 text-center text-xs text-gray-400">
          <button onClick={() => navigate('/login')} className="font-medium text-amber-400 hover:text-amber-300">Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 