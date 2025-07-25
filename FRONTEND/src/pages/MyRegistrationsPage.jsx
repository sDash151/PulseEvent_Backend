import React, { useEffect, useState, useMemo } from 'react';
import PageContainer from '../components/ui/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const statusStyles = {
  approved: 'bg-green-400/10 text-green-300 border-green-400/30',
  pending: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  rejected: 'bg-red-400/10 text-red-300 border-red-400/30',
};

function getCalendarLinks(app) {
  // Only for approved and upcoming events
  if (app.status !== 'approved') return null;
  const start = new Date(app.eventStartTime);
  const end = new Date(app.eventEndTime);
  const title = encodeURIComponent(app.eventTitle);
  const details = encodeURIComponent('Registered via EventPulse');
  const location = encodeURIComponent(app.eventLocation || '');
  const startStr = start.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const endStr = end.toISOString().replace(/[-:]|\.\d{3}/g, '');
  // Google Calendar
  const google = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  // Outlook
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&location=${location}`;
  // iCal
  const ics = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${title}%0ADESCRIPTION:${details}%0ALOCATION:${location}%0ADTSTART:${startStr}%0ADTEND:${endStr}%0AEND:VEVENT%0AEND:VCALENDAR`;
  return { google, outlook, ics };
}

const MyRegistrationsPage = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('applied'); // 'applied', 'event', 'status'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter, search, and sort logic
  const filteredApplications = applications.filter(app => {
    const matchesStatus = filter === 'all' || app.status === filter;
    const matchesSearch = app.eventTitle.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'applied') {
      return new Date(b.appliedAt) - new Date(a.appliedAt); // Most recent first
    } else if (sortBy === 'event') {
      return new Date(a.eventStartTime) - new Date(b.eventStartTime); // Soonest event first
    } else if (sortBy === 'status') {
      const order = { approved: 0, pending: 1, rejected: 2 };
      return order[a.status] - order[b.status];
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedApplications.length / pageSize);
  const paginatedApplications = sortedApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    // Reset to first page if filter/search/sort changes
    setCurrentPage(1);
  }, [filter, search, sortBy, applications.length]);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/user/my-registrations');
        setApplications(res.data.applications || []);
      } catch (err) {
        setError('Failed to load your registrations.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-20 px-4 overflow-hidden flex justify-center">
      {/* Ambient Glow Spotlights */}
      <div className="absolute top-0 left-[25%] w-96 h-96 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      <PageContainer className="relative z-10 w-full max-w-5xl" glassmorphic>
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-white">My Registrations</h1>
          <Button as="a" href="/dashboard" variant="outline">Back to Dashboard</Button>
        </div>

        {/* Filter, Search, and Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 w-full">
          <div className="flex flex-wrap gap-2">
            {['all', 'approved', 'pending', 'rejected'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 md:py-1.5 rounded-full text-sm capitalize font-semibold transition-all duration-200 border backdrop-blur-md
                  ${filter === type
                    ? 'bg-amber-400/20 text-amber-200 border-amber-400 shadow-md'
                    : 'text-gray-300 border-white/10 hover:bg-white/5'}
                `}
                style={{ minWidth: 90 }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 justify-end items-stretch md:items-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by event name..."
              className="w-full md:w-72 px-4 py-3 md:py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all duration-200 shadow-inner backdrop-blur-md"
              style={{ minWidth: 0 }}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full md:w-48 px-4 py-3 md:py-2 rounded-xl bg-white/10 border border-white/10 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all duration-200 shadow-inner backdrop-blur-md"
            >
              <option value="applied">Sort by Date Applied</option>
              <option value="event">Sort by Event Date</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 font-semibold py-8">{error}</div>
        ) : sortedApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Illustration */}
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-amber-300/80 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <rect x="6" y="14" width="36" height="24" rx="6" fill="#fff8e1" stroke="#fbbf24" strokeWidth="2" />
                <path d="M12 26h24M12 32h24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="20" r="2" fill="#fbbf24" />
                <circle cx="24" cy="20" r="2" fill="#fbbf24" />
                <circle cx="32" cy="20" r="2" fill="#fbbf24" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-amber-200 mb-2">No registrations found</div>
            <div className="text-gray-400 mb-6">You haven’t applied to any events yet. Start exploring and join your first event!</div>
            <Button as="a" href="/" className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200">
              <svg className="w-5 h-5 mr-2 -ml-1 inline-block text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18m-6-6l6 6-6 6" /></svg>
              Browse Events
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {paginatedApplications.map((app) => {
                const now = new Date();
                const eventStart = new Date(app.eventStartTime);
                const isUpcoming = eventStart > now;
                const calendarLinks = useMemo(() => getCalendarLinks(app), [app]);
                return (
                  <Card key={app.id} className="relative" shadow="xl" rounded="xl" hoverEffect>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border ${statusStyles[app.status]}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                      <span className="text-xs text-gray-400">{new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1">{app.eventTitle}</h2>
                    <div className="text-gray-300 text-sm mb-2">
                      <span className="block">{app.eventLocation}</span>
                      <span className="block">{new Date(app.eventStartTime).toLocaleString()} - {new Date(app.eventEndTime).toLocaleString()}</span>
                    </div>
                    {app.teamName && (
                      <div className="mb-2 text-sm text-amber-200"><span className="font-medium">Team:</span> {app.teamName}</div>
                    )}
                    {app.status === 'approved' && app.whatsappGroupEnabled && app.whatsappGroupLink && (
                      <div className="mt-3">
                        <a
                          href={app.whatsappGroupLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          Join WhatsApp Group
                        </a>
                      </div>
                    )}
                    {app.status === 'rejected' && (
                      <div className="mt-3 text-red-300 text-sm font-medium">Your registration was not approved by the host.</div>
                    )}
                    {app.status === 'pending' && (
                      <div className="mt-3 text-amber-300 text-sm font-medium">Your registration is under review by the host.</div>
                    )}
                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        as="a"
                        href={
                          app.status === 'approved'
                            ? `/events/${app.parentId || ''}/sub/${app.eventId}`
                            : `/events/${app.parentId || ''}/sub/${app.eventId}/details`
                        }
                        variant="outline"
                        className="font-semibold flex items-center gap-2"
                      >
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m0 0l3-3m-3 3l3 3" /></svg>
                        View Event Details
                      </Button>
                      {app.status === 'approved' && isUpcoming && calendarLinks && (
                        <div className="relative group">
                          <Button
                            variant="outline"
                            className="font-semibold flex items-center gap-2"
                          >
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Add to Calendar
                          </Button>
                          <div className="absolute left-0 mt-2 w-48 bg-gray-900/95 border border-white/10 rounded-xl shadow-xl z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
                            <a href={calendarLinks.google} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-white hover:bg-amber-400/10 rounded-t-xl">Google Calendar</a>
                            <a href={calendarLinks.outlook} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-white hover:bg-amber-400/10">Outlook</a>
                            <a href={calendarLinks.ics} download={`${app.eventTitle}.ics`} className="block px-4 py-2 text-sm text-white hover:bg-amber-400/10 rounded-b-xl">iCal (.ics)</a>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <nav className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 shadow-lg">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-amber-300 hover:bg-amber-400/10'}`}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${currentPage === page ? 'bg-amber-400/20 text-amber-200 border border-amber-400 shadow' : 'text-gray-300 hover:bg-amber-400/10'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-amber-300 hover:bg-amber-400/10'}`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
};

export default MyRegistrationsPage; 