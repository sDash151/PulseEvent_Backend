import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventForm from '../components/events/EventForm'
import BackButton from '../components/ui/BackButton'
import { createEvent } from '../services/events'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

const CreateEventPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [eventType, setEventType] = useState('STANDALONE')
  const [megaEventId, setMegaEventId] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const eventTypes = [
    { value: 'STANDALONE', label: 'Standalone Event' },
    { value: 'MEGA', label: 'Mega Event' }
  ]

  const handleSubmit = async (formData) => {
    if (!currentUser) return
    setLoading(true)
    try {
      const res = await createEvent({
        ...formData,
        hostId: currentUser.id,
        type: eventType
      })
      if (eventType === 'MEGA') {
        setMegaEventId(res.id || res.data?.id)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const handleSubEventSubmit = async (formData) => {
    if (!currentUser || !megaEventId) return
    setLoading(true)
    try {
      await api.post(`/events/${megaEventId}/sub`, {
        ...formData,
        hostId: currentUser.id
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create sub-event')
    } finally {
      setLoading(false)
    }
  }

  const handleDropdownSelect = (value) => {
    setEventType(value)
    setIsDropdownOpen(false)
  }

  const selectedEventType = eventTypes.find(type => type.value === eventType)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center overflow-hidden px-4 py-24">

      {/* Ambient Glows */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.06)] rounded-2xl p-6 sm:p-8 md:p-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <BackButton to="/dashboard" variant="subtle" label="Dashboard" />
            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Event</h1>
              <p className="text-gray-300 mt-2 text-sm sm:text-base">Fill out the details below to publish your event</p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="mb-6 flex flex-col w-full">
          <label className="text-lg text-amber-300 font-semibold mb-3">Event Type:</label>
          
          {/* Custom Glassmorphic Dropdown */}
          <div className="relative w-full max-w-md mx-auto sm:mx-0">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 sm:px-5 py-3 rounded-2xl bg-[#302b63] text-white font-semibold shadow-[0_8px_32px_rgba(31,38,135,0.37)] border border-white/30 backdrop-blur-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-[#3a3470] flex items-center justify-between text-sm sm:text-base"
              style={{
                background: '#302b63',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <span className="truncate">{selectedEventType?.label}</span>
              <svg 
                className={`w-5 h-5 text-amber-300 transition-transform duration-200 flex-shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24"
              >
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#302b63] backdrop-blur-2xl border border-white/30 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] overflow-hidden" style={{
                background: '#302b63',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
              }}>
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleDropdownSelect(type.value)}
                    className={`w-full px-4 sm:px-5 py-3 text-left text-white font-semibold transition-all duration-200 hover:bg-[#3a3470] focus:outline-none focus:bg-[#3a3470] text-sm sm:text-base ${
                      eventType === type.value ? 'bg-amber-400/90 text-amber-900' : ''
                    }`}
                    style={{
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Click outside to close dropdown */}
          {isDropdownOpen && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-600/10 text-red-400 border border-red-400/30 rounded-lg text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        {!megaEventId ? (
          <EventForm onSubmit={handleSubmit} loading={loading} />
        ) : (
          <div>
            <h2 className="text-xl text-white mb-4">Add Sub-Event to Mega Event</h2>
            <EventForm onSubmit={handleSubEventSubmit} loading={loading} />
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateEventPage