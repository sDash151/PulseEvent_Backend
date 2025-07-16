import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import EventList from '../components/events/EventList';
import Button from '../components/ui/Button';
import { fetchEvents } from '../services/events';
import CalendarView from '../components/events/CalenderView';
import TabGroup from '../components/ui/TabGroup';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const DashboardPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [filter, setFilter] = useState('all');
  const [pendingInvites, setPendingInvites] = useState(0);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await fetchEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const fetchInvites = async () => {
      if (!currentUser) return;
      try {
        const res = await getUserInvitations();
        const userInvites = res.data.filter(
          (invite) =>
            ((invite.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
              invite.invitedUserId === currentUser.id) &&
            invite.status === 'pending'
        );
        setPendingInvites(userInvites.length);
      } catch (err) {
        setPendingInvites(0);
      }
    };
    fetchInvites();
  }, [currentUser]);

  const getUserInvitations = async () => {
    return api.get('/api/invitations');
  };

  const filteredEvents = events.filter((event) => {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    if (filter === 'upcoming') return startTime > now;
    if (filter === 'past') return endTime < now;
    if (filter === 'live') return startTime <= now && endTime >= now;
    return true;
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-20 px-4 overflow-hidden flex justify-center">
      
      {/* Ambient Glow Spotlights */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-6xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.06)] rounded-2xl p-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Events</h1>
            <p className="text-gray-300 mt-1">Manage and track your upcoming and past events</p>
          </div>
          <Button as={Link} to="/events/create">Create Event</Button>
        </div>

        {pendingInvites > 0 && (
          <div className="bg-yellow-100/10 text-yellow-300 border border-yellow-400/20 px-4 py-3 rounded mb-6">
            📩 You have {pendingInvites} pending event invitation{pendingInvites > 1 ? 's' : ''}.{' '}
            <a href="/invitations" className="underline font-medium hover:text-yellow-100">View now</a>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'upcoming', 'live', 'past'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all duration-200 ${
                filter === type 
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {type === 'live' ? (
                <span className="flex items-center gap-1">
                  <span className="live-pulse flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  Live
                </span>
              ) : type}
            </button>
          ))}
        </div>

        {/* Sliding Tab Navigation */}
        <div className="mb-6 relative w-full max-w-xs mx-auto">
          <div className="flex bg-white/10 rounded-full overflow-hidden border border-white/20 relative">
            {['list', 'calendar'].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-1/2 py-2.5 text-sm font-medium transition-all duration-300 z-10 ${activeTab === tab ? 'text-amber-300' : 'text-gray-300 hover:text-amber-200'}`}
              >
                {tab === 'list' ? 'List View' : 'Calendar View'}
              </button>
            ))}
            {/* Sliding Indicator */}
            <span
              className="absolute left-0 top-0 h-full w-1/2 bg-amber-400/20 rounded-full transition-transform duration-500 ease-in-out pointer-events-none"
              style={{ transform: activeTab === 'calendar' ? 'translateX(100%)' : 'translateX(0)' }}
            ></span>
          </div>
        </div>

        {loading ? (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
  </div>
) : (
  <div className="w-full transition-all duration-500 ease-in-out">
    {activeTab === 'list' ? (
      <EventList events={filteredEvents} />
    ) : (
      <CalendarView events={filteredEvents} />
    )}
  </div>
)}
  
      </div>
    </div>
  );
};

export default DashboardPage;
