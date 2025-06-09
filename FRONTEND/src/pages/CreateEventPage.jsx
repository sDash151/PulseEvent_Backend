// frontend/src/pages/CreateEventPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventForm from '../components/events/EventForm'
import { createEvent } from '../services/events'
import { useAuth } from '../hooks/useAuth'

const CreateEventPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    if (!currentUser) return
    
    setLoading(true)
    try {
      await createEvent({
        ...formData,
        hostId: currentUser.id,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-1">Fill out the details below to create your event</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <EventForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}

export default CreateEventPage