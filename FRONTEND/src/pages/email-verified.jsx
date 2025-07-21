import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { CheckCircleIcon, ExclamationTriangleIcon, EnvelopeIcon, ArrowPathIcon, SparklesIcon, FaceSmileIcon, XCircleIcon } from '@heroicons/react/24/outline';

const statusConfig = {
  success: {
    icon: (
      <span className="flex flex-col items-center">
        <span className="text-5xl mb-2 animate-bounce">🎉</span>
        <CheckCircleIcon className="w-14 h-14 text-green-400 drop-shadow-lg" />
      </span>
    ),
    title: 'Congratulations! Your Email is Verified 🎊',
    message: 'Welcome aboard! Your email has been successfully verified. You can now log in and start exploring all the features we have to offer. We’re excited to have you with us!',
    action: 'login',
    actionLabel: 'Log In & Explore',
  },
  already: {
    icon: (
      <span className="flex flex-col items-center">
        <span className="text-5xl mb-2 animate-bounce">😊</span>
        <CheckCircleIcon className="w-14 h-14 text-amber-400 drop-shadow-lg" />
      </span>
    ),
    title: 'Already Verified!',
    message: 'Looks like your email is already verified. You can log in and continue enjoying our platform!',
    action: 'login',
    actionLabel: 'Go to Login',
  },
  expired: {
    icon: (
      <span className="flex flex-col items-center">
        <span className="text-5xl mb-2 animate-pulse">⌛</span>
        <ExclamationTriangleIcon className="w-14 h-14 text-red-400 drop-shadow-lg" />
      </span>
    ),
    title: 'Link Expired',
    message: 'Oops! This verification link has expired. No worries, you can request a new one and get verified in no time.',
    action: 'resend',
    actionLabel: 'Resend Verification Email',
  },
  error: {
    icon: (
      <span className="flex flex-col items-center">
        <span className="text-5xl mb-2 animate-pulse">😕</span>
        <XCircleIcon className="w-14 h-14 text-red-400 drop-shadow-lg" />
      </span>
    ),
    title: 'Something Went Wrong',
    message: 'There was a problem verifying your email. Please try again or request a new link. We’re here to help!',
    action: 'resend',
    actionLabel: 'Resend Verification Email',
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
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center animate-fade-in">
        {/* Icon/Emoji */}
        <div className="mb-4">{config.icon}</div>
        <h2 className="text-3xl font-extrabold text-white mb-3 drop-shadow-lg animate-fade-in-up">{config.title}</h2>
        <p className="text-gray-200 text-lg mb-8 animate-fade-in-up delay-100">{config.message}</p>
        <Button
          onClick={handleAction}
          className="w-full justify-center text-lg py-3 font-bold shadow-xl animate-pop-in"
          variant={config.action === 'login' ? 'gradient' : 'primary'}
          icon={config.action === 'login' ? <EnvelopeIcon className="w-5 h-5" /> : <ArrowPathIcon className="w-5 h-5" />}
          iconPosition="left"
        >
          {config.actionLabel}
        </Button>
        {status === 'success' && (
          <div className="mt-6 flex flex-col items-center animate-fade-in-up delay-200">
            <span className="text-2xl">Need help? <a href="/support" className="text-amber-300 underline hover:text-amber-200 transition">Contact Support</a></span>
          </div>
        )}
      </div>
      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          80% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.7s both; }
        .animate-fade-in-up { animation: fade-in-up 0.8s both; }
        .animate-pop-in { animation: pop-in 0.5s both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};

export default EmailVerifiedPage; 