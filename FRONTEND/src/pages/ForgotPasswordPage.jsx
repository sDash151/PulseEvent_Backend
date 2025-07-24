import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import { requestPasswordReset, getResetStatus } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const RESEND_WAIT_MINUTES = 10;
const RESEND_WAIT_MS = RESEND_WAIT_MINUTES * 60 * 1000;
const getResendKey = (email) => `reset_password_cooldown_${email}`;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef();
  const navigate = useNavigate();

  // Timer logic: update on email or success
  useEffect(() => {
    let cancelled = false;
    async function checkToken() {
      if (email) {
        const key = getResendKey(email);
        const status = await getResetStatus(email);
        let expiry;
        if (status.hasToken && status.nextAllowedAt) {
          expiry = new Date(status.nextAllowedAt).getTime();
          localStorage.setItem(key, expiry);
          setRemaining(expiry - Date.now());
        } else {
          // No valid token, allow immediate resend
          localStorage.removeItem(key);
          setRemaining(0);
        }
        if (!cancelled) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(updateRemaining, 1000);
        }
      }
    }
    checkToken();
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [email, success]);

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

  const formatTime = (ms) => {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const canResend = remaining <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setSuccess(true);
      const key = getResendKey(email);
      let expiry;
      if (res.sent && res.nextAllowedAt) {
        expiry = new Date(res.nextAllowedAt).getTime();
        localStorage.setItem(key, expiry);
        setRemaining(expiry - Date.now());
      } else if (!res.sent && res.nextAllowedAt) {
        expiry = new Date(res.nextAllowedAt).getTime();
        localStorage.setItem(key, expiry);
        setRemaining(expiry - Date.now());
      } else {
        // fallback: 10 min
        expiry = Date.now() + RESEND_WAIT_MS;
        localStorage.setItem(key, expiry);
        setRemaining(RESEND_WAIT_MS);
      }
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(updateRemaining, 1000);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setError('');
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center overflow-hidden px-4 py-8">
      {/* Ambient Glow Spotlights */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-6 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
          <p className="text-gray-300 text-sm mt-1">Enter your email to receive a password reset link</p>
        </div>
        <ErrorMessage error={error} onDismiss={() => setError('')} />
        {success && (
          <div className="mb-4 p-3 rounded-lg border bg-green-500/10 border-green-500/20 text-green-400 text-sm text-center animate-fade-in">
            If your email is registered, a password reset link has been sent. Please check your inbox.
          </div>
        )}
        {success && remaining > 0 && (
          <div className="w-full mb-2">
            <div className="bg-amber-100/10 border border-amber-300/30 text-amber-200 rounded-lg px-4 py-2 mb-2 text-center text-sm font-semibold flex flex-col items-center">
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5 text-amber-300 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0121 12.75v6A2.25 2.25 0 0118.75 21h-13.5A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5h13.5zm-6 3v2.25" /></svg>
                <span>Resend available in <span className="font-mono text-lg text-amber-200">{formatTime(remaining)}</span></span>
              </span>
              <span className="mt-1 text-xs text-amber-300">You cannot request another reset email until the previous one expires (10 minutes).<br />Please check your inbox.</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm"
              placeholder="you@example.com"
              required
              disabled={loading || (success && !canResend)}
            />
          </div>
          <Button
            type="submit"
            className="w-full justify-center mt-2"
            disabled={loading || (success && !canResend)}
          >
            {loading ? 'Sending...' : (success && !canResend ? 'Resend Disabled' : 'Send Reset Link')}
          </Button>
        </form>
        <div className="mt-4 text-center text-xs text-gray-400">
          <button onClick={() => navigate('/login')} className="font-medium text-amber-400 hover:text-amber-300">Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 