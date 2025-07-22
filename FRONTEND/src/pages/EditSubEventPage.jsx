import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SubEventEditForm from '../components/events/SubEventEditForm';
import { fetchEventById } from '../services/events';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import { deleteEvent } from '../services/events';

const EditSubEventPage = () => {
  const { parentId, subId } = useParams();
  const [subEvent, setSubEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSubEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchEventById(subId);
        setSubEvent(data);
      } catch (err) {
        setError(err.message || 'Failed to load sub-event');
      } finally {
        setLoading(false);
      }
    };
    loadSubEvent();
  }, [subId]);

  if (loading) return <Loading />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-400 text-xl">{error}</div>
      <Button onClick={() => navigate(-1)} className="ml-4">Back</Button>
    </div>
  );
  if (!subEvent) return null;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this sub-event? This action cannot be undone.')) return;
    try {
      await deleteEvent(subId);
      navigate(`/events/${parentId}`);
    } catch (err) {
      alert('Failed to delete sub-event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-12">
      {/* Back Button above the card */}
      <div className="w-full max-w-3xl mb-4 flex items-center">
        <BackButton to={`/events/${parentId}/sub/${subId}`} label="Back to Sub-Event" />
      </div>
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-lg relative">
        <h1 className="text-2xl font-bold text-amber-400 mb-6 mt-2">Edit Sub-Event</h1>
        <SubEventEditForm initialData={subEvent} parentId={parentId} subId={subId} onSuccess={() => navigate(`/events/${parentId}/sub/${subId}`)} />
        {/* Delete Sub-Event Button */}
        <div className="mt-8 flex justify-end">
          <button
            className="px-6 py-2 font-bold text-base rounded bg-red-600 hover:bg-red-700 text-white shadow transition"
            onClick={handleDelete}
          >
            🗑️ Delete Sub-Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSubEventPage; 