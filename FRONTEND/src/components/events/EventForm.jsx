import React, { useState, useEffect } from 'react'
import Button from '../ui/Button'
import CustomDropdown from '../ui/CustomDropdown'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

const EventForm = ({ event, initialData, onSubmit, loading, submitText = 'Save Event' }) => {
  // Use either event or initialData prop
  const eventData = event || initialData;
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    title: eventData?.title || '',
    description: eventData?.description || '',
    location: eventData?.location || '',
    startTime: eventData ? new Date(eventData.startTime).toISOString().slice(0, 16) : '',
    endTime: eventData ? new Date(eventData.endTime).toISOString().slice(0, 16) : '',
    rsvpDeadline: eventData ? new Date(eventData.rsvpDeadline).toISOString().slice(0, 16) : '',
    maxAttendees: eventData?.maxAttendees || 50,
    collegeId: eventData?.collegeId || null,
  })

  // College data state
  const [colleges, setColleges] = useState([])
  const [loadingColleges, setLoadingColleges] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)

  // Fetch colleges on component mount
  useEffect(() => {
    fetchColleges()
  }, [])

  // Auto-fill college from user profile if available
  useEffect(() => {
    if (currentUser?.collegeName && colleges.length > 0) {
      const userCollege = colleges.find(college => 
        college.name.toLowerCase() === currentUser.collegeName.toLowerCase()
      )
      if (userCollege && !selectedCollege) {
        setSelectedCollege(userCollege.id)
        setFormData(prev => ({ ...prev, collegeId: userCollege.id }))
      }
    }
  }, [colleges, currentUser, selectedCollege])

  const fetchColleges = async () => {
    setLoadingColleges(true)
    try {
      const response = await api.get('/api/colleges')
      setColleges(response.data.colleges || [])
    } catch (error) {
      console.error('Error fetching colleges:', error)
    } finally {
      setLoadingColleges(false)
    }
  }

  // Reset form data when event prop changes
  React.useEffect(() => {
    setFormData({
      title: eventData?.title || '',
      description: eventData?.description || '',
      location: eventData?.location || '',
      startTime: eventData ? new Date(eventData.startTime).toISOString().slice(0, 16) : '',
      endTime: eventData ? new Date(eventData.endTime).toISOString().slice(0, 16) : '',
      rsvpDeadline: eventData ? new Date(eventData.rsvpDeadline).toISOString().slice(0, 16) : '',
      maxAttendees: eventData?.maxAttendees || 50,
      collegeId: eventData?.collegeId || null,
    })
    setSelectedCollege(eventData?.collegeId || null)
  }, [eventData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCollegeChange = (collegeId) => {
    setSelectedCollege(collegeId)
    setFormData(prev => ({ ...prev, collegeId }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert local datetime-local values to UTC ISO strings
    const toISOString = (local) => local ? new Date(local).toISOString() : '';
    onSubmit({
      ...formData,
      startTime: toISOString(formData.startTime),
      endTime: toISOString(formData.endTime),
      rsvpDeadline: toISOString(formData.rsvpDeadline),
    });
  }

  // Prepare college options for dropdown
  const collegeOptions = [
    { value: 'none', label: 'Not College-Specific' },
    ...colleges.map(college => ({
      value: college.id,
      label: `${college.name}${college.city ? ` (${college.city})` : ''}`
    }))
  ]

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

      {/* College Field */}
      <div>
        <label htmlFor="college" className="block text-sm font-medium text-amber-300 mb-1">
          College (Optional)
        </label>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400">🎓</span>
          <span className="text-xs text-gray-400">
            {currentUser?.collegeName ? 
              `Auto-filled from your profile: ${currentUser.collegeName}` : 
              'Select a college or choose "Not College-Specific"'
            }
          </span>
        </div>
        <CustomDropdown
          options={loadingColleges ? [] : collegeOptions}
          value={selectedCollege || 'none'}
          onChange={handleCollegeChange}
          placeholder={loadingColleges ? "Loading colleges..." : "Select a College (Optional)"}
          disabled={loadingColleges}
          className="w-full"
          searchable={true}
        />
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
          {loading ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  )
}

export default EventForm
