import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageContainer from '../components/ui/PageContainer';
import Modal from '../components/ui/Modal';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

// Helper functions to parse registration data
const getTeamName = (entry) => {
  // First check if there's a direct teamName field
  if (entry?.teamName && typeof entry.teamName === 'string') {
    return entry.teamName;
  }
  // Check responses for team name fields
  if (entry?.responses && typeof entry.responses === 'object') {
    const teamNameFields = ['Team Name', 'teamName', 'Team', 'Group Name', 'Group'];
    for (const field of teamNameFields) {
      if (typeof entry.responses[field] === 'string' && entry.responses[field].trim()) {
        return entry.responses[field];
      }
    }
    // If no specific team name field, check if any field contains "team" in the label
    for (const [label, value] of Object.entries(entry.responses)) {
      if (label.toLowerCase().includes('team') && typeof value === 'string' && value.trim()) {
        return value;
      }
    }
  }
  return null;
};

const getParticipants = (entry) => {
  const participants = [];
  const isFallbackName = (name) => {
    if (!name || typeof name !== 'string') return true;
    const trimmedName = name.trim();
    if (trimmedName === '') return true;
    const fallbackPatterns = [
      /^participant\s+\d+$/i,
      /^member\s+\d+$/i,
      /^user\s+\d+$/i,
      /^player\s+\d+$/i
    ];
    return fallbackPatterns.some(pattern => pattern.test(trimmedName));
  };
  // Array of participants
  if (Array.isArray(entry?.participants)) {
    entry.participants.forEach((participant) => {
      if (typeof participant === 'object' && participant !== null) {
        let name = null;
        let email = '';
        if (participant.name && typeof participant.name === 'string' && participant.name.trim()) {
          name = participant.name.trim();
        } else if (participant.Name && typeof participant.Name === 'string' && participant.Name.trim()) {
          name = participant.Name.trim();
        } else if (participant.fullName && typeof participant.fullName === 'string' && participant.fullName.trim()) {
          name = participant.fullName.trim();
        } else if (participant.firstName && participant.lastName) {
          name = `${participant.firstName} ${participant.lastName}`.trim();
        }
        if (participant.email && typeof participant.email === 'string' && participant.email.trim()) {
          email = participant.email.trim();
        } else if (participant.Email && typeof participant.Email === 'string' && participant.Email.trim()) {
          email = participant.Email.trim();
        }
        if (name && !isFallbackName(name)) {
          participants.push({ name, email });
        }
      } else if (typeof participant === 'string' && participant.trim() && !isFallbackName(participant)) {
        participants.push({ name: participant.trim(), email: '' });
      }
    });
  } else if (entry?.participants && typeof entry.participants === 'object') {
    // Object of participants
    Object.values(entry.participants).forEach((participant) => {
      if (typeof participant === 'object' && participant !== null) {
        let name = null;
        let email = '';
        if (participant.name && typeof participant.name === 'string' && participant.name.trim()) {
          name = participant.name.trim();
        } else if (participant.Name && typeof participant.Name === 'string' && participant.Name.trim()) {
          name = participant.Name.trim();
        }
        if (participant.email && typeof participant.email === 'string' && participant.email.trim()) {
          email = participant.email.trim();
        } else if (participant.Email && typeof participant.Email === 'string' && participant.Email.trim()) {
          email = participant.Email.trim();
        }
        if (name && !isFallbackName(name)) {
          participants.push({ name, email });
        }
      }
    });
  }
  // Check responses for participant info
  if (entry?.responses && typeof entry.responses === 'object') {
    for (const [label, value] of Object.entries(entry.responses)) {
      if (Array.isArray(value) && label.toLowerCase().includes('participant')) {
        value.forEach((participantName) => {
          if (participantName && typeof participantName === 'string' && !isFallbackName(participantName)) {
            participants.push({ name: participantName.trim(), email: '' });
          }
        });
      }
    }
  }
  return participants;
};

const getResponsesDisplay = (entry) => {
  const displayData = [];
  if (entry?.responses && typeof entry.responses === 'object') {
    for (const [label, value] of Object.entries(entry.responses)) {
      const teamNameFields = ['Team Name', 'teamName', 'Team', 'Group Name', 'Group'];
      if (teamNameFields.includes(label)) continue;
      if (label.toLowerCase().includes('participant')) continue;
      // Only display primitive values or arrays as joined strings
      let displayValue = value;
      if (Array.isArray(value)) {
        displayValue = value.filter(v => typeof v === 'string').join(', ');
      } else if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
      }
      displayData.push({ label, value: displayValue });
    }
  }
  return displayData;
};

const HostReviewRegistrationsPage = () => {
  const { parentId, subId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [waitingList, setWaitingList] = useState([]);
  const [registrations, setRegistrations] = useState([]); // NEW
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [dataFetched, setDataFetched] = useState(false);

  // 🔐 Access control is handled by EventHostRoute wrapper
  // No need for additional checks here since EventHostRoute already verified the user is the host

  useEffect(() => {
    const fetchData = async () => {
      if (!subId || !currentUser) return;
      
      setLoading(true);
      try {
        const [eventRes, waitingRes, regRes] = await Promise.all([
          api.get(`/api/events/${subId}`),
          api.get(`/api/waiting-list/${subId}`),
          api.get(`/api/registration?eventId=${subId}`), // NEW: fetch registrations
        ]);
        
        setEvent(eventRes.data);
        
        // Log the waiting list data to debug participant structure
        console.log('Waiting list data:', waitingRes.data.waitingList);
        
        setWaitingList(waitingRes.data.waitingList || []);
        setRegistrations(regRes.data.registrations || []); // NEW
        setDataFetched(true);
      } catch (err) {
        console.error('Failed to load registrations:', err);
        setError('Failed to load registrations.');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch data if we haven't fetched it yet or if it's a fresh load
    if (subId && currentUser && !authLoading && !dataFetched) {
      console.log('Fetching data for the first time...');
      fetchData();
    }
  }, [subId, currentUser, authLoading, dataFetched]);

  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmEntry, setConfirmEntry] = useState(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowConfirmModal(false);
      }
    };

    if (showConfirmModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showConfirmModal]);

  const handleAction = async (id, status) => {
    if (!id || !status) {
      console.error('Invalid parameters for handleAction:', { id, status });
      setActionError('Invalid action parameters. Please try again.');
      return;
    }
    
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setActionError(null);
    setSuccessMessage(null);
    setShowConfirmModal(false);
    
    try {
      let response;
      if (status === 'approved') {
        response = await api.post(`/api/waiting-list/${id}/approve`, {}, { timeout: 10000 });
      } else if (status === 'rejected') {
        response = await api.post(`/api/waiting-list/${id}/reject`, {}, { timeout: 10000 });
      } else {
        throw new Error('Unknown action');
      }
      // Validate response
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      // Update the waiting list - remove entry if approved, update status if rejected
      console.log('Updating waiting list state:', { status, id, currentWaitingList: waitingList.length });
      
      if (status === 'approved') {
        // Remove from waiting list when approved
        setWaitingList((prev) => {
          const filtered = prev.filter((entry) => entry.id !== id);
          console.log('After filtering approved entry:', { 
            beforeCount: prev.length, 
            afterCount: filtered.length, 
            removedId: id 
          });
          return filtered;
        });
        setSuccessMessage('Registration approved successfully!');
      } else if (status === 'rejected') {
        // Update status when rejected
        setWaitingList((prev) => 
          prev.map((entry) => 
            entry.id === id ? { ...entry, status: 'rejected' } : entry
          )
        );
        setSuccessMessage('Registration rejected successfully!');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Action failed:', error);
      setActionError(
        error.response?.data?.message || 
        error.message || 
        'Failed to process registration. Please try again.'
      );
      
      // Clear error after 5 seconds
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleConfirmAction = (entry, action) => {
    setConfirmEntry(entry);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = () => {
    if (confirmEntry && confirmAction) {
      handleAction(confirmEntry.id, confirmAction);
    }
  };

  // --- Export Participants as CSV ---
  // Remove the handleExportParticipantsCSV function and the export button from the page.

  if (authLoading || loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500/20 border-t-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">
              {authLoading ? 'Authenticating...' : 'Loading registrations...'}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error && !event) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="text-center max-w-md">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Page</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <BackButton />
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-300 mb-2 bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
              Review Registrations
            </h1>
            <p className="text-gray-400">
              {event?.title} - Host Controls
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <BackButton />
          </div>
        </div>

        {/* Host-Only Access Banner */}
        <Card className="mb-8 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-amber-300 text-xl">🔐</span>
            </div>
            <div>
              <h3 className="text-amber-300 font-semibold text-lg mb-1">Event Host-Only Access</h3>
              <p className="text-gray-400">
                Only the event host can review and approve/reject registrations for this event.
              </p>
            </div>
          </div>
        </Card>

        {/* Success/Error Messages */}
        {successMessage && (
          <Card className="mb-6 border-green-500/20 bg-green-500/5">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-sm">✓</span>
              </div>
              <p className="text-green-400 font-medium">{successMessage}</p>
            </div>
          </Card>
        )}

        {actionError && (
          <Card className="mb-6 border-red-500/20 bg-red-500/5">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-400 text-sm">⚠</span>
              </div>
              <p className="text-red-400 font-medium">{actionError}</p>
            </div>
          </Card>
        )}

        {/* Registration Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-8 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-300 text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Total Registrations</h3>
            <p className="text-4xl font-bold text-white">{registrations.length}</p>
          </Card>
          <Card className="text-center p-8 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-300 text-2xl">⏳</span>
            </div>
            <h3 className="text-lg font-semibold text-green-300 mb-2">Pending Review</h3>
            <p className="text-4xl font-bold text-white">
              {waitingList.filter(entry => entry.status === 'pending').length}
            </p>
          </Card>
          <Card className="text-center p-8 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-300 text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Processed</h3>
            <p className="text-4xl font-bold text-white">
              {registrations.length + waitingList.filter(entry => entry.status === 'rejected').length}
            </p>
          </Card>
        </div>

        {/* Registrations List */}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-amber-300 mb-6 flex items-center gap-3">
            <span className="inline-block w-2 h-8 bg-gradient-to-b from-amber-400 to-pink-400 rounded-full"></span>
            Registration Requests
          </h2>
          {waitingList.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No registration requests to review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {waitingList.map((entry) => (
                <div
                  key={entry.id}
                  className={`group relative bg-gradient-to-br from-[#23243a]/80 to-[#302b63]/80 rounded-2xl shadow-xl border border-white/10 p-6 transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl hover:border-amber-400/30 flex flex-col min-h-[340px]`}
                >
                  {/* Status badge and actions */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border ${
                      entry.status === 'pending'
                        ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                        : entry.status === 'approved'
                        ? 'bg-green-400/10 text-green-300 border-green-400/30'
                        : 'bg-red-400/10 text-red-300 border-red-400/30'
                    }`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                    {entry.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleConfirmAction(entry, 'approved')}
                          disabled={actionLoading[entry.id]}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold transition-all duration-200"
                        >
                          {actionLoading[entry.id] ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleConfirmAction(entry, 'rejected')}
                          disabled={actionLoading[entry.id]}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold transition-all duration-200"
                        >
                          {actionLoading[entry.id] ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* User info */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/30 to-pink-400/30 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                      {entry.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg leading-tight mb-1">
                        {entry.user?.name || 'Unknown User'}
                      </h3>
                      <p className="text-gray-300 text-sm">{entry.user?.email || 'No email provided'}</p>
                    </div>
                  </div>
                  {/* Team name */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-amber-300 text-lg">👥</span>
                    <span className="text-amber-200 font-semibold text-sm">Team: {getTeamName(entry) || '-'}</span>
                  </div>
                  {/* Participants */}
                  {getParticipants(entry).length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-blue-300 font-semibold mb-1 flex items-center gap-1">👤 Team Members:</p>
                      <ul className="text-sm text-blue-100 ml-4 list-disc">
                        {getParticipants(entry).map((participant, index) => (
                          <li key={index} className="mb-1">
                            <span className="font-semibold text-white">{participant.name}</span>
                            {participant.email && (
                              <span className="ml-2 text-xs text-blue-200">({participant.email})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Custom responses */}
                  {getResponsesDisplay(entry).length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-pink-300 font-semibold mb-1 flex items-center gap-1">📝 Responses:</p>
                      <ul className="text-sm text-pink-100 ml-4 list-disc">
                        {getResponsesDisplay(entry).map((resp, idx) => (
                          <li key={idx} className="mb-1">
                            <span className="font-semibold text-amber-200">{resp.label}:</span> {resp.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Payment proof */}
                  {entry.paymentProof && (
                    <div className="mb-2">
                      <p className="text-sm text-green-400 font-semibold mb-1 flex items-center gap-1">💳 Payment Proof:</p>
                      <a href={entry.paymentProof} target="_blank" rel="noopener noreferrer">
                        <img
                          src={entry.paymentProof}
                          alt="Payment Proof"
                          className="rounded-lg border border-green-400 max-w-full max-h-40 mt-2 shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                        />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Confirm {confirmAction === 'approved' ? 'Approval' : 'Rejection'}
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to {confirmAction} the registration for{' '}
                <span className="text-white font-semibold">
                  {confirmEntry?.user?.name || 'this user'}
                </span>?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={executeConfirmedAction}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Confirm
                </Button>
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default HostReviewRegistrationsPage; 