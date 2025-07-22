import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRoleCheck } from '../hooks/useRoleCheck';
import EventForm from '../components/events/EventForm';
import BackButton from '../components/ui/BackButton';
import { fetchEventById, updateEvent, deleteEvent } from '../services/events';
import Button from '../components/ui/Button';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { checkEventHost, loading: roleLoading } = useRoleCheck();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEventHost, setIsEventHost] = useState(false);
  const [hostCheckComplete, setHostCheckComplete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const eventData = await fetchEventById(id);
        setEvent(eventData);
        const isHost = await checkEventHost(id);
        setIsEventHost(isHost);
        setHostCheckComplete(true);
      } catch (err) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id, currentUser]);

  if (!authLoading && !roleLoading && hostCheckComplete && !isEventHost) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (formData) => {
    if (!currentUser || !event) return;
    setSaving(true);
    setError('');
    // Convert local datetime-local values to UTC ISO strings
    const toISOString = (local) => local ? new Date(local).toISOString() : '';
    try {
      await updateEvent(id, {
        ...formData,
        startTime: toISOString(formData.startTime),
        endTime: toISOString(formData.endTime),
        rsvpDeadline: toISOString(formData.rsvpDeadline),
      });
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteEvent(id);
      setShowDeleteModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || roleLoading || !hostCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <BackButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-300 mb-2">
              Edit Event
            </h1>
            <p className="text-gray-300">
              {event?.title} - Host Controls
            </p>
          </div>
          <BackButton />
        </div>

        {/* 🔐 Event host-only warning banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mr-3">
              <span className="text-amber-300 text-sm">🔐</span>
            </div>
            <div>
              <h3 className="text-amber-300 font-semibold">Event Host-Only Access</h3>
              <p className="text-gray-300 text-sm">
                Only the event host can edit event details and settings.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {event && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)] p-6">
            <EventForm
              initialData={event}
              onSubmit={handleSubmit}
              loading={saving}
              submitText="Update Event"
            />
            {/* Delete Event Button (Host Only) */}
            <div className="mt-8 flex justify-end">
              <Button
                variant="danger"
                className="px-6 py-2 font-bold text-base"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
              >
                🗑️ Delete Event
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center animate-fade-in">
            <h2 className="text-2xl font-extrabold text-red-400 mb-3 drop-shadow-lg animate-fade-in-up">Delete Event?</h2>
            <p className="text-gray-200 text-lg mb-8 animate-fade-in-up delay-100">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button
                variant="danger"
                className="w-full sm:w-auto px-8 py-3 font-bold text-lg shadow-xl animate-pop-in"
                onClick={handleDelete}
                loading={deleting}
                disabled={deleting}
              >
                Yes, Delete
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto px-8 py-3 font-bold text-lg animate-pop-in"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          </div>
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
      )}
    </div>
  );
};

export default EditEventPage;
