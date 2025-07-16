import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { acceptInvitation } from '../services/invitations';
import { useAuth } from '../hooks/useAuth';

export default function InvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading } = useAuth();
  const [message, setMessage] = useState('Processing invitation...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      setMessage('Please log in or register to accept your invitation.');
      return;
    }
    const accept = async () => {
      try {
        await acceptInvitation(token);
        setMessage('Invitation accepted successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err) {
        setError('Invalid or expired invitation token');
      }
    };
    accept();
  }, [token, navigate, currentUser, loading]);

  const redirectPath = `/invitation/${token}`;

  useEffect(() => {
    if (!currentUser && !loading) {
      localStorage.setItem('pendingInviteInfo', JSON.stringify({ token, eventTitle: '', hostName: '' }))
    }
  }, [token, currentUser, loading]);

  if (!currentUser && !loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center overflow-hidden px-4 pt-28">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
        <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
        <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

        {/* Glassmorphic Card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-10 text-center max-w-md w-full animate-drop-in">
          <div className="flex justify-center mb-4">
            <span className="inline-block animate-bounce text-5xl select-none">🎉</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 animate-fade-in-slow">You're Invited!</h2>
          <p className="mb-2 text-gray-300 animate-fade-in-slow">Join your event on EventPulse.</p>
          <p className="mb-6 text-gray-400 animate-fade-in-slow">To accept the invitation, please log in or register. It only takes a moment!</p>
          <div className="flex justify-center gap-4 animate-fade-in-slow">
            <Link
              to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="px-5 py-2 bg-amber-400 text-black font-medium rounded-lg shadow hover:bg-amber-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Log In
            </Link>
            <Link
              to={`/register?redirect=${encodeURIComponent(redirectPath)}`}
              className="px-5 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Animations */}
        <style>{`
          .animate-fade-in { animation: fadeIn 1s ease; }
          .animate-fade-in-slow { animation: fadeIn 1.5s ease; }
          .animate-drop-in { animation: dropIn 0.8s cubic-bezier(.18,.89,.32,1.28); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes dropIn {
            0% { opacity: 0; transform: translateY(-40px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden pt-28">
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Status Message Card */}
      <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] p-8 text-center max-w-md w-full">
        {error ? (
          <div className="text-red-400">
            <h2 className="text-2xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="text-green-400">
            <h2 className="text-2xl font-semibold mb-2">Success!</h2>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
