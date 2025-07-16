import { fetchEventById, updateEvent, deleteEvent } from '../services/events';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/events/EventForm';
import { useAuth } from '../hooks/useAuth';

const EditEventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEventById(id);
        if (eventData.hostId !== currentUser.id) {
          navigate('/dashboard');
          return;
        }
        setEvent(eventData);
      } catch (err) {
        setError(err.message || 'Failed to load event');
      }
    };
    loadEvent();
  }, [id, currentUser, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await updateEvent(id, formData);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this event? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await deleteEvent(id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to delete event');
      setDeleting(false);
    }
  };

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex justify-center overflow-hidden">

      {/* Ambient Glows */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-6 md:p-10">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Event</h1>
            <p className="text-gray-300 mt-1">Update your event details below</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all"
          >
            {deleting ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/10 text-red-400 border border-red-400/30 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 shadow-inner">
          <EventForm event={event} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
