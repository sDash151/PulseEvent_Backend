// frontend/src/pages/DashboardPage.jsx
import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import EventList from '../components/events/EventList'
import Button from '../components/ui/Button'
import { fetchEvents } from '../services/events'
import CalendarView from '../components/events/CalenderView'
import TabGroup from '../components/ui/TabGroup'
import { AuthContext } from '../context/AuthContext'  // <-- Adjust if named differently

const DashboardPage = () => {
  const { user } = useContext(AuthContext)  // <-- get logged-in user
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [filter, setFilter] = useState('all')

  const pendingInvites = user?.receivedInvitations?.filter(
    invite => invite.status === 'pending'
  ).length || 0

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await fetchEvents()
        setEvents(eventsData)
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  const filteredEvents = events.filter(event => {
    const now = new Date()
    const startTime = new Date(event.startTime)
    const endTime = new Date(event.endTime)

    if (filter === 'upcoming') return startTime > now
    if (filter === 'past') return endTime < now
    if (filter === 'live') return startTime <= now && endTime >= now
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Events</h1>
          <p className="text-gray-600 mt-1">Manage and track your upcoming and past events</p>
        </div>
        <Button as={Link} to="/events/create">Create Event</Button>
      </div>

      {/* ✅ Pending Invitations Alert */}
      {pendingInvites > 0 && (
        <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded mb-6">
          📩 You have {pendingInvites} pending event invitation{pendingInvites > 1 ? 's' : ''}.{' '}
          <a href="/invitations" className="underline font-medium">View now</a>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'upcoming', 'live', 'past'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize ${
              filter === type 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {type === 'live' ? (
              <span className="flex items-center gap-1">
                <span className="live-pulse flex h-2 w-2 rounded-full bg-red-500"></span>
                Live
              </span>
            ) : type}
          </button>
        ))}
      </div>

      <TabGroup
        tabs={[
          { id: 'list', label: 'List View' },
          { id: 'calendar', label: 'Calendar View' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : activeTab === 'list' ? (
        <EventList events={filteredEvents} />
      ) : (
        <CalendarView events={filteredEvents} />
      )}
    </div>
  )
}

export default DashboardPage
