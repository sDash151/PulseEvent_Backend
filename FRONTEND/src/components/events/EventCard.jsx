import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { CalendarIcon, UserIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
          <span className="live-pulse flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-red-400 font-medium">Live</span>
        </span>
      )
    }
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          status === 'Scheduled'
            ? 'bg-blue-400/10 text-blue-300 border border-blue-500/30'
            : 'bg-gray-400/10 text-gray-300 border border-gray-500/30'
        }`}
      >
        {status}
      </span>
    )
  }

  const rsvpCount = event.rsvps?.length || 0
  const checkInCount = event.rsvps?.filter(r => r.checkedIn).length || 0

  return (
    <Link to={`/events/${event.id}`} className="group transition-all duration-300">
      <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-amber-400/30">
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
              {event.title}
            </h3>
            {renderStatus()}
          </div>

          <p className="mt-2 text-gray-400 text-sm line-clamp-2">{event.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-400">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1 text-amber-400" />
              <span>{format(new Date(event.startTime), 'MMM dd, h:mm a')}</span>
            </div>

            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1 text-amber-400" />
              <span>{rsvpCount} / {event.maxAttendees}</span>
            </div>

            <div className="flex items-center col-span-2">
              <MapPinIcon className="h-4 w-4 mr-1 text-amber-400" />
              <span className="truncate">{event.location}</span>
            </div>
            
            {event.college && (
              <div className="flex items-center col-span-2">
                <span className="text-amber-400 mr-1">🎓</span>
                <span className="truncate text-sm">
                  {event.college.name}
                  {event.college.city && `, ${event.college.city}`}
                </span>
              </div>
            )}
          </div>

          {/* Show sub-events for MEGA events (only real sub-events added by host) */}
          {event.type === 'MEGA' && Array.isArray(event.subEvents) && event.subEvents.length > 0 && (
            <div className="mt-6">
              <h4 className="text-amber-300 font-semibold mb-2">Sub-Events:</h4>
              <ul className="space-y-1">
                {event.subEvents.slice(0, 2).map(sub => (
                  <li key={sub.id} className="bg-white/10 rounded px-2 py-1 text-white text-sm">
                    <span className="cursor-pointer hover:text-amber-300 transition-colors" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/events/${sub.id}`;
                    }}>
                      {sub.title}
                    </span>
                  </li>
                ))}
                {event.subEvents.length > 2 && (
                  <li className="bg-white/10 rounded px-2 py-1 text-amber-300 text-sm font-semibold cursor-pointer">
                    and {event.subEvents.length - 2} More...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white/5 border-t border-white/10 px-5 py-3 text-xs text-gray-300 flex justify-between items-center">
          <div>
            <span className="font-medium text-amber-400">{checkInCount}</span>
            <span className="text-gray-400 ml-1">checked in</span>
          </div>

          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-semibold text-xs">
              {event.host.name.charAt(0)}
            </div>
            <span className="ml-2 truncate max-w-[100px]">{event.host.name}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default EventCard
