import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import { resetPassword } from '../services/auth';

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

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(getPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
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
        {success && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white/20 backdrop-blur-lg border border-green-400/30 rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-pop-in">
              <svg className="w-16 h-16 text-green-400 mb-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="text-2xl font-bold text-green-300 mb-2">Password Changed!</h3>
              <p className="text-green-100 mb-4 text-center">Your password has been updated. You can now log in with your new password.</p>
              <Button className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
            <div className="fixed inset-0 bg-black/60 z-40" />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm"
              placeholder="••••••••"
              required
              disabled={loading || success}
            />
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
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm"
              placeholder="••••••••"
              required
              disabled={loading || success}
            />
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