import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

const getUserInvitations = async () => {
  return api.get('/api/invitations');
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
      await api.patch(`/api/invitations/${invite.token}/${action}`);
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
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-6 rounded-xl">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-indigo-800">Your Invitations</h1>
      {invitations.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-xl text-center text-gray-500 shadow">No invitations found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full bg-white rounded-xl">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Invited By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map(invite => (
                <tr key={invite.id} className="border-b hover:bg-indigo-50/30 transition">
                  <td className="px-6 py-4 font-medium text-indigo-700">
                    {invite.event?.title || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {invite.invitedBy?.name || '—'}
                    <div className="text-xs text-gray-500">{invite.invitedBy?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4">{invite.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[invite.status] || 'bg-gray-100 text-gray-700'}`}>
                      {invite.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {invite.createdAt ? new Date(invite.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {invite.status === 'pending' && (
                      <>
                        <button
                          className="px-3 py-1 mr-2 rounded bg-green-500 text-white text-xs font-semibold hover:bg-green-600"
                          disabled={actionLoading[invite.id]}
                          onClick={() => handleAction(invite, 'accept')}
                        >
                          Accept
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                          disabled={actionLoading[invite.id]}
                          onClick={() => handleAction(invite, 'decline')}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {invite.status !== 'pending' && (
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
  );
};

export default InvitationsPage;
