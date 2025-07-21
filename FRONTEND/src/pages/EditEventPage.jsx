import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRoleCheck } from '../hooks/useRoleCheck';
import EventForm from '../components/events/EventForm';
import BackButton from '../components/ui/BackButton';
import { fetchEventById, updateEvent } from '../services/events';

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

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const eventData = await fetchEventById(id);
        setEvent(eventData);
        
        console.log('EditEventPage - Event data loaded:', {
          eventId: id,
          eventHostId: eventData.hostId,
          currentUserId: currentUser?.id,
          isHost: currentUser?.id === eventData.hostId
        });
        
        // Check if user is the host of this specific event
        const isHost = await checkEventHost(id);
        setIsEventHost(isHost);
        setHostCheckComplete(true);
        console.log('EditEventPage - Event host check result:', isHost);
      } catch (err) {
        console.error('EditEventPage - Error loading event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, currentUser]);

  // 🔐 Role-based access control - check if user is the event host
  if (!authLoading && !roleLoading && hostCheckComplete && !isEventHost) {
    console.warn('Access denied: User is not the event host', { 
      userId: currentUser?.id, 
      eventId: id 
    });
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (formData) => {
    if (!currentUser || !event) return;
    
    setSaving(true);
    setError('');
    
    try {
      await updateEvent(id, formData);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSaving(false);
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EditEventPage;
