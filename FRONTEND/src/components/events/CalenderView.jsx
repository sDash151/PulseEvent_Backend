// frontend/src/components/events/CalendarView.jsx
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const CalendarView = ({ events }) => {
  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    allDay: false
  }))

  const eventStyleGetter = (event) => {
    const now = new Date()
    let backgroundColor = '#6366F1' // Default: indigo
    
    if (event.end < now) {
      backgroundColor = '#9CA3AF' // Gray for past events
    } else if (event.start <= now && event.end >= now) {
      backgroundColor = '#EF4444' // Red for live events
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        padding: '2px 8px'
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px]">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
      />
    </div>
  )
}

export default CalendarView