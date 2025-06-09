// frontend/src/pages/EditEventPage.jsx
import { fetchEventById, updateEvent, deleteEvent } from '../services/events' 
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EventForm from '../components/events/EventForm'
import { useAuth } from '../hooks/useAuth'

const EditEventPage = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEventById(id)
        if (eventData.hostId !== currentUser.id) {
          navigate('/dashboard')
          return
        }
        setEvent(eventData)
      } catch (err) {
        setError(err.message || 'Failed to load event')
      }
    }
    loadEvent()
  }, [id, currentUser, navigate])

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await updateEvent(id, formData)
      navigate(`/events/${id}`)
    } catch (err) {
      setError(err.message || 'Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  // <-- New function to handle event deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this event? This action cannot be undone.'
    )
    if (!confirmDelete) return

    setDeleting(true)
    try {
      await deleteEvent(id)
      navigate('/dashboard')  // navigate away after deletion
    } catch (err) {
      setError(err.message || 'Failed to delete event')
      setDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header + Delete button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600 mt-1">Update your event details below</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          {deleting ? 'Deleting...' : 'Delete Event'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <EventForm event={event} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}

export default EditEventPage