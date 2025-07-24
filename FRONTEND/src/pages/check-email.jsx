import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { resendVerificationEmail } from '../services/auth';

const RESEND_WAIT_MINUTES = 10;
const RESEND_WAIT_MS = RESEND_WAIT_MINUTES * 60 * 1000;

const getResendKey = (email) => `resend_verification_${email}`;

const CheckEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || new URLSearchParams(location.search).get('email') || '';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const alreadySent = location.state?.alreadySent;

  // Timer state
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef();

  // On mount, set timer if alreadySent
  useEffect(() => {
    if (alreadySent && email) {
      // Check localStorage for expiry
      const key = getResendKey(email);
      let expiry = localStorage.getItem(key);
      if (!expiry || isNaN(Number(expiry)) || Number(expiry) < Date.now()) {
        // Set new expiry
        expiry = Date.now() + RESEND_WAIT_MS;
        localStorage.setItem(key, expiry);
      }
      updateRemaining();
      timerRef.current = setInterval(updateRemaining, 1000);
      return () => clearInterval(timerRef.current);
    }
    // eslint-disable-next-line
  }, [alreadySent, email]);

  // Update remaining time
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

  // When resend is successful, reset timer
  const handleResend = async () => {
    setLoading(true);
    const res = await resendVerificationEmail(email);
    setLoading(false);
    setSuccess(true);
    // Set new expiry
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
  };

  // Format mm:ss
  const formatTime = (ms) => {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const canResend = !alreadySent || remaining <= 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center border border-white/20">
        <svg className="w-16 h-16 text-indigo-400 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.66 1.591l-7.5 7.5a2.25 2.25 0 0 1-3.18 0l-7.5-7.5A2.25 2.25 0 0 1 2.25 6.993V6.75" /></svg>
        <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
        {alreadySent ? (
          <p className="text-blue-100 mb-4 text-center">A verification email has already been sent to{email && <> (<span className="font-semibold text-indigo-200">{email}</span>)</>}.<br />Please check your inbox and verify your email. If you did not receive it, you can resend after it expires (<span className="font-semibold text-amber-200">10 minutes</span>).</p>
        ) : (
          <p className="text-blue-100 mb-4 text-center">Registration successful!<br />Please check your inbox{email && <> (<span className="font-semibold text-indigo-200">{email}</span>)</>} and verify your email to activate your account.</p>
        )}
        {alreadySent && !loading && remaining > 0 && (
          <div className="w-full mb-2">
            <div className="bg-amber-100/10 border border-amber-300/30 text-amber-200 rounded-lg px-4 py-2 mb-2 text-center text-sm font-semibold flex flex-col items-center">
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5 text-amber-300 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0121 12.75v6A2.25 2.25 0 0118.75 21h-13.5A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5h13.5zm-6 3v2.25" /></svg>
                <span>Resend available in <span className="font-mono text-lg text-amber-200">{formatTime(remaining)}</span></span>
              </span>
              <span className="mt-1 text-xs text-amber-300">You cannot request another verification email until the previous one expires (10 minutes).<br />Please check your inbox.</span>
            </div>
          </div>
        )}
        <Button
          onClick={handleResend}
          disabled={loading || !email || !canResend}
          className="w-full mb-2"
          icon={(!loading && (!canResend)) ? (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0121 12.75v6A2.25 2.25 0 0118.75 21h-13.5A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5h13.5zm-6 3v2.25" /></svg>
          ) : undefined}
        >
          {loading ? 'Resending...' : 'Resend Verification Email'}
        </Button>
        {alreadySent && !loading && remaining > 0 && (
          <p className="text-xs text-amber-300 mt-1 text-center">You have already been sent a verification email. Please check your inbox. You can resend after <span className="font-semibold">10 minutes</span> if you did not receive it.</p>
        )}
        {success && <p className="text-green-300 text-sm mt-2">If your email is registered and not verified, a new verification email has been sent.</p>}
        <Button variant="secondary" onClick={() => navigate('/login')} className="w-full mt-2">Back to Login</Button>
      </div>
    </div>
  );
};

export default CheckEmailPage; 