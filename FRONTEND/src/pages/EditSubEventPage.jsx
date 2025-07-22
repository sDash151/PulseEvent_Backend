import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SubEventEditForm from '../components/events/SubEventEditForm';
import { fetchEventById } from '../services/events';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import { deleteEvent } from '../services/events';
import Modal from '../components/ui/Modal';

const EditSubEventPage = () => {
  const { parentId, subId } = useParams();
  const [subEvent, setSubEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

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
    setDeleteError('');
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    setDeleteError('');
    setDeleteErrorMessage('');
    try {
      await deleteEvent(subId);
      navigate(`/events/${parentId}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete sub-event.';
      if (msg.toLowerCase().includes('registered participants') || msg.toLowerCase().includes('foreign key')) {
        setDeleteErrorMessage('Cannot delete sub-event: there are registered participants. Please remove all registrations before deleting the sub-event.');
        setShowDeleteErrorModal(true);
      } else {
        setDeleteError(msg);
      }
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-12">
      {/* Back Button above the card */}
      <div className="w-full max-w-3xl mb-4 flex items-center">
        <BackButton to={`/events/${parentId}/sub/${subId}`} label="Back to Sub-Event" />
      </div>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Sub-Event" size="sm" backdrop="blur">
        <div className="text-center">
          <div className="text-2xl mb-4 text-amber-400 font-bold">Are you sure?</div>
          <p className="mb-6 text-gray-300">This action cannot be undone. All registrations and data for this sub-event will be permanently deleted.</p>
          {deleteError && <div className="mb-4 text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2 font-medium">{deleteError}</div>}
          <div className="flex justify-center gap-4">
            <button onClick={confirmDelete} className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold shadow transition">Delete</button>
            <button onClick={() => setShowDeleteModal(false)} className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-800 text-gray-200 font-semibold shadow transition">Cancel</button>
          </div>
        </div>
      </Modal>
      {/* Delete Error Modal */}
      <Modal isOpen={showDeleteErrorModal} onClose={() => setShowDeleteErrorModal(false)} title="Cannot Delete Sub-Event" size="sm" backdrop="blur">
        <div className="text-center">
          <div className="text-2xl mb-4 text-red-400 font-bold flex items-center justify-center gap-2">
            <span>⚠️</span>
            Cannot Delete Sub-Event
          </div>
          <p className="mb-6 text-gray-300">
            {deleteErrorMessage || 'This sub-event has registered participants. Please remove all registrations before deleting the sub-event.'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteErrorModal(false)}
              className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold shadow transition"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
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