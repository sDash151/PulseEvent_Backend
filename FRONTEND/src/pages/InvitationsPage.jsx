import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import BackButton from '../components/ui/BackButton';

const statusColors = {
  pending: 'bg-yellow-400/10 text-yellow-300 border border-yellow-300/30',
  accepted: 'bg-green-400/10 text-green-300 border border-green-300/30',
  declined: 'bg-red-400/10 text-red-300 border border-red-300/30',
};

const getUserInvitations = async () => {
  return api.get('/invitations');
};

const InvitationsPage = () => {
  const { currentUser } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!currentUser) return;
      try {
        const res = await getUserInvitations();
        setInvitations(res.data);
      } catch (err) {
        setError('Failed to load invitations');
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();
  }, [currentUser]);

  const handleAction = async (invite, action) => {
    setActionLoading(prev => ({ ...prev, [invite.id]: true }));
    try {
      await api.patch(`/invitations/${invite.token}/${action}`);
      setInvitations(prev =>
        prev.map(i =>
          i.id === invite.id ? { ...i, status: action === 'accept' ? 'accepted' : 'declined' } : i
        )
      );
    } catch (err) {
      alert(`Failed to ${action} invitation`);
    } finally {
      setActionLoading(prev => ({ ...prev, [invite.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-red-400 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-start justify-center overflow-hidden">

      {/* Ambient Glows */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-6">
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/dashboard" variant="subtle" label="Dashboard" />
          <h1 className="text-3xl font-bold text-white">Your Invitations</h1>
        </div>

        {invitations.length === 0 ? (
          <div className="text-gray-300 text-center p-8 bg-white/5 border border-white/10 rounded-xl">
            No invitations found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full text-left text-sm text-gray-300">
              <thead className="uppercase text-xs text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Invited By</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map(invite => (
                  <tr key={invite.id} className="hover:bg-white/5 border-b border-white/10 transition">
                    <td className="px-6 py-4 font-medium text-white">
                      {invite.event?.title || '—'}
                      {invite.event?.id && (
                        <a
                          href={`/events/${invite.event.id}`}
                          className="ml-2 text-amber-400 underline"
                        >
                          View
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {invite.invitedBy?.name || '—'}
                      <div className="text-xs text-gray-400">{invite.invitedBy?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4">{invite.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[invite.status] || 'bg-gray-400/10 text-gray-200'}`}>
                        {invite.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {invite.createdAt ? new Date(invite.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {invite.status === 'pending' ? (
                        <>
                          <button
                            className="px-3 py-1 mr-2 rounded bg-green-500/90 text-white text-xs font-semibold hover:bg-green-400 transition"
                            disabled={actionLoading[invite.id]}
                            onClick={() => handleAction(invite, 'accept')}
                          >
                            Accept
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-500/90 text-white text-xs font-semibold hover:bg-red-400 transition"
                            disabled={actionLoading[invite.id]}
                            onClick={() => handleAction(invite, 'decline')}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[invite.status] || 'bg-gray-100 text-gray-700'}`}>
                          {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;
