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

  if (!currentUser && !loading) {
    // Save redirect path so user returns after login/register
    const redirectPath = `/invitation/${token}`;
    // Store invitation info for post-registration banner
    useEffect(() => {
      localStorage.setItem('pendingInviteInfo', JSON.stringify({ token, eventTitle: '', hostName: '' }))
    }, [token])
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-100 animate-fade-in">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full animate-drop-in">
          {/* Animated EventPulse logo or icon */}
          <div className="flex justify-center mb-4">
            <span className="inline-block animate-bounce text-5xl select-none">🎉</span>
          </div>
          <h2 className="text-3xl font-extrabold mb-2 text-indigo-700 tracking-tight animate-fade-in-slow">Welcome to EventPulse!</h2>
          <p className="mb-2 text-lg text-gray-700 animate-fade-in-slow">You've been invited to join an event on our platform.</p>
          <p className="mb-6 text-gray-600 animate-fade-in-slow">To accept your invitation and join the event, please log in or create a free account. It only takes a moment!</p>
          <div className="flex justify-center gap-4 animate-fade-in-slow">
            <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400">Log In</Link>
            <Link to={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="px-5 py-2 bg-pink-100 text-indigo-700 rounded-lg shadow hover:bg-pink-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300">Register</Link>
          </div>
        </div>
        {/* Animations */}
        <style>{`
          .animate-fade-in { animation: fadeIn 1s ease; }
          .animate-fade-in-slow { animation: fadeIn 1.5s ease; }
          .animate-drop-in { animation: dropIn 0.8s cubic-bezier(.18,.89,.32,1.28); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes dropIn { 0% { opacity: 0; transform: translateY(-40px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {error ? (
          <div className="text-red-500">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="text-green-500">
            <h2 className="text-xl font-bold mb-2">Success!</h2>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}