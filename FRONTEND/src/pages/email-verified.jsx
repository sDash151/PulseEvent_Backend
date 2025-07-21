import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { CheckCircleIcon, ExclamationTriangleIcon, EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const statusConfig = {
  success: {
    icon: <CheckCircleIcon className="w-12 h-12 text-green-400 mb-4" />,
    title: 'Email Verified!',
    message: 'Your email has been successfully verified. You can now log in to your account.',
    action: 'login',
    actionLabel: 'Log In',
  },
  already: {
    icon: <CheckCircleIcon className="w-12 h-12 text-amber-400 mb-4" />,
    title: 'Already Verified',
    message: 'This email is already verified. You can log in to your account.',
    action: 'login',
    actionLabel: 'Log In',
  },
  expired: {
    icon: <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-4" />,
    title: 'Link Expired',
    message: 'This verification link has expired. Please request a new verification email.',
    action: 'resend',
    actionLabel: 'Resend Verification',
  },
  error: {
    icon: <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-4" />,
    title: 'Verification Error',
    message: 'There was a problem verifying your email. Please try again or request a new link.',
    action: 'resend',
    actionLabel: 'Resend Verification',
  },
};

const EmailVerifiedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const status = params.get('status') || 'error';
  const config = statusConfig[status] || statusConfig.error;

  const handleAction = () => {
    if (config.action === 'login') {
      navigate('/login');
    } else if (config.action === 'resend') {
      navigate('/login?resend=1');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-8 flex flex-col items-center text-center">
        {config.icon}
        <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
        <p className="text-gray-300 text-base mb-6">{config.message}</p>
        <Button onClick={handleAction} className="w-full justify-center">
          {config.action === 'login' ? <EnvelopeIcon className="w-5 h-5 mr-2" /> : <ArrowPathIcon className="w-5 h-5 mr-2" />}
          {config.actionLabel}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerifiedPage; 