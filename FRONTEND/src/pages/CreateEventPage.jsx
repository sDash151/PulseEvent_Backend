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
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center overflow-hidden px-4 py-24">

      {/* Ambient Glows */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.06)] rounded-2xl p-8 md:p-10">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Create New Event</h1>
          <p className="text-gray-300 mt-2">Fill out the details below to publish your event</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-600/10 text-red-400 border border-red-400/30 rounded-lg text-center">
            {error}
          </div>
        )}

        <EventForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}

export default CreateEventPage
