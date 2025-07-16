import React, { useState } from 'react'
import Button from '../ui/Button'

const EventForm = ({ event, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    startTime: event ? new Date(event.startTime).toISOString().slice(0, 16) : '',
    endTime: event ? new Date(event.endTime).toISOString().slice(0, 16) : '',
    rsvpDeadline: event ? new Date(event.rsvpDeadline).toISOString().slice(0, 16) : '',
    maxAttendees: event?.maxAttendees || 50,
  })

  // Reset form data when event prop changes
  React.useEffect(() => {
    setFormData({
      title: event?.title || '',
      description: event?.description || '',
      location: event?.location || '',
      startTime: event ? new Date(event.startTime).toISOString().slice(0, 16) : '',
      endTime: event ? new Date(event.endTime).toISOString().slice(0, 16) : '',
      rsvpDeadline: event ? new Date(event.rsvpDeadline).toISOString().slice(0, 16) : '',
      maxAttendees: event?.maxAttendees || 50,
    })
  }, [event])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-200">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-amber-300 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Company Retreat 2023"
            className="w-full px-4 py-2.5 bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-amber-300 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="123 Main St, New York"
            className="w-full px-4 py-2.5 bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-amber-300 mb-1">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your event..."
          className="w-full px-4 py-2.5 bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-amber-300 mb-1">
            Start Time *
          </label>
          <input
            type="datetime-local"
            name="startTime"
            id="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-amber-300 mb-1">
            End Time *
          </label>
          <input
            type="datetime-local"
            name="endTime"
            id="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="rsvpDeadline" className="block text-sm font-medium text-amber-300 mb-1">
            RSVP Deadline *
          </label>
          <input
            type="datetime-local"
            name="rsvpDeadline"
            id="rsvpDeadline"
            value={formData.rsvpDeadline}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="maxAttendees" className="block text-sm font-medium text-amber-300 mb-1">
          Maximum Attendees *
        </label>
        <input
          type="number"
          name="maxAttendees"
          id="maxAttendees"
          min="1"
          value={formData.maxAttendees}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
          required
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Event'}
        </Button>
      </div>
    </form>
  )
}

export default EventForm
