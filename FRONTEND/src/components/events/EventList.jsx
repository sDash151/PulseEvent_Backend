import EventCard from './EventCard'
import EmptyState from '../ui/EmptyState'

const EventList = ({ events }) => {
  if (events.length === 0) {
    return (
      <EmptyState 
        title="No events found"
        description="Create your first event to get started"
        actionText="Create Event"
        actionLink="/events/create"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

export default EventList
