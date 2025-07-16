import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-dark.css'; // Custom styles

const localizer = momentLocalizer(moment);

const CalendarView = ({ events }) => {
  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    allDay: false
  }));

  const eventStyleGetter = (event) => {
    const now = new Date();
    let backgroundColor = '#6366F1'; // indigo
    if (event.end < now) backgroundColor = '#9CA3AF';
    else if (event.start <= now && event.end >= now) backgroundColor = '#EF4444';

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        border: 'none',
        padding: '4px 8px',
        boxShadow: '0 0 6px rgba(255,255,255,0.1)'
      }
    };
  };

  return (
    <div className="w-full overflow-auto">
      <div className="min-h-[calc(100vh-16rem)] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.06)] p-4">
        <Calendar
          localizer={localizer}
          events={formattedEvents}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={['month', 'week', 'day']}
          popup
          eventPropGetter={eventStyleGetter}
          style={{ height: 'auto', minHeight: '650px' }}
        />
      </div>
    </div>
  );
};

export default CalendarView;
