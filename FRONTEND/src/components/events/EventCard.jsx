// frontend/src/components/events/EventCard.jsx
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { CalendarIcon, UserIcon, LocationMarkerIcon } from '@heroicons/react/outline'

const EventCard = ({ event }) => {
  const getStatusString = () => {
    const now = new Date()
    if (now < new Date(event.startTime)) return 'Scheduled'
    if (now >= new Date(event.startTime) && now <= new Date(event.endTime)) return 'Live'
    return 'Completed'
  }

  const renderStatus = () => {
    const status = getStatusString()
    if (status === 'Live') {
      return (
        <span className="flex items-center gap-1">
          <span className="live-pulse flex h-2 w-2 rounded-full bg-red-500"></span>
          Live
        </span>
      )
    }
    return status
  }
  
  const rsvpCount = event.rsvps?.length || 0
  const checkInCount = event.rsvps?.filter(r => r.checkedIn).length || 0

  return (
    <Link to={`/events/${event.id}`} className="group">
      <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:border-indigo-200">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {event.title}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              getStatusString() === 'Live'
                ? 'bg-red-100 text-red-800' 
                : getStatusString() === 'Scheduled' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
            }`}>
              {renderStatus()}
            </span>
          </div>
          
          <p className="mt-3 text-gray-600 text-sm line-clamp-2">{event.description}</p>
          
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span>{format(new Date(event.startTime), 'MMM dd, h:mm a')}</span>
            </div>
            
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span>{rsvpCount} / {event.maxAttendees}</span>
            </div>
            
            <div className="flex items-center col-span-2">
              <LocationMarkerIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-medium text-gray-700">{checkInCount}</span>
              <span className="text-gray-500"> checked in</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700">
                {event.host.name.charAt(0)}
              </div>
              <span className="ml-2 text-gray-600 truncate max-w-[80px]">{event.host.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default EventCard