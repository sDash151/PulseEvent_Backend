// frontend/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import RollingCounter from '../components/RollingCounter';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getFeaturedEvents } from '../services/events';
import { format } from 'date-fns';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const statsRef = useRef(null);
  const [animateStats, setAnimateStats] = useState(false);

  // Fetch featured events
  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoadingEvents(true);
        const events = await getFeaturedEvents();
        setFeaturedEvents(events);
      } catch (error) {
        console.error('Error fetching featured events:', error);
        setFeaturedEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Optionally, you can redirect to dashboard automatically
      // navigate('/dashboard')
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const ref = statsRef.current;
    if (!ref) return;
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setAnimateStats(false); // reset first to allow re-trigger
            setTimeout(() => setAnimateStats(true), 50);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(ref);
    }
    return () => {
      if (observer && ref) observer.unobserve(ref);
    };
  }, []);

  // Handle join event click
  const handleJoinEvent = (event) => {
    if (!currentUser) {
      // Redirect to registration with redirect param
      navigate(`/register?redirect=/events/${event.id}`);
      return;
    }
    // If logged in, go directly to mega event page
    navigate(`/events/${event.id}`);
  };

  // Format attendee count for display
  const formatAttendeeCount = (count) => {
    if (count >= 1000) {
      return `+${(count / 1000).toFixed(1)}K+`;
    } else if (count >= 100) {
      return `+${count}+`;
    } else {
      return count.toString();
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-xs font-bold px-3 py-1 rounded-full';
      case 'UPCOMING':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-xs font-bold px-3 py-1 rounded-full';
      default:
        return 'bg-gray-600 text-xs font-bold px-3 py-1 rounded-full';
    }
  };

  return (
    <div className="relative overflow-hidden text-white page-transition">
      
      {/* 🎥 Enhanced Video Background with better performance */}
      <video 
        className="absolute inset-0 w-full h-full object-cover z-0 transform-gpu" 
        autoPlay 
        loop 
        muted 
        playsInline
        loading="lazy"
      >
        <source src="/assets/concert-loop.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🔮 Enhanced Dim Overlay with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50 z-10"></div>

      <div className="container relative z-10 mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Transform Your Events With{' '}
            <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
              Real-Time Engagement
            </span>
          </h1>
          <p className="text-gray-300 leading-relaxed md:text-lg max-w-2xl mx-auto mb-10">
            EventPulse revolutionizes event management with instant RSVPs, live feedback, and actionable insights – perfect for conferences, workshops, and social gatherings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!currentUser ? (
              <>
                <Button
                  as={Link}
                  to="/register"
                  size="lg"
                  className="relative px-6 py-3 rounded-xl text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] before:absolute before:inset-0 before:bg-gradient-to-r from-white/10 via-white/30 to-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity before:duration-700 before:blur-sm"
                >
                  Get Started Free
                </Button>
                <Button
                  as={Link}
                  to="/demo"
                  size="lg"
                  variant="outline"
                  className="px-6 py-3 rounded-xl text-white font-bold bg-white/5 backdrop-blur-md border border-amber-300/30 hover:border-amber-400 hover:bg-amber-200/10 hover:text-amber-400 hover:scale-105 hover:shadow-[0_0_12px_#fbbf24] transition-all duration-300"
                >
                  View Live Demo
                </Button>
              </>
            ) : (
              <Button 
                as={Link} 
                to="/dashboard" 
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* ✨ Enhanced Feature Cards with Premium Effects */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-Time RSVPs",
              description: "Watch as attendees confirm their participation instantly with live updates.",
              icon: "📝",
              gradient: "from-blue-500/10 to-cyan-500/5"
            },
            {
              title: "Live Feedback",
              description: "Capture audience sentiment during your event with emoji reactions and comments.",
              icon: "💬",
              gradient: "from-green-500/10 to-emerald-500/5"
            },
            {
              title: "Powerful Analytics",
              description: "Gain insights into attendee engagement and feedback trends post-event.",
              icon: "📊",
              gradient: "from-purple-500/10 to-pink-500/5"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className={`
                group relative overflow-hidden
                bg-gradient-to-br ${feature.gradient}
                backdrop-blur-md border border-white/10 rounded-2xl p-8 
                shadow-xl hover:shadow-2xl
                transition-all duration-500 ease-out
                hover:scale-[1.05] hover:-translate-y-2
                hover:border-amber-400/30
                card-lift interactive stagger-${index + 1}
                animate-fadeInUp
              `}
              style={{ animationFillMode: 'both' }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-transparent to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              {/* Floating icon with pulse effect */}
              <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:animate-float transition-transform duration-300">
                {feature.icon}
              </div>
              
              {/* Enhanced typography */}
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                {feature.description}
              </p>
              
              {/* Subtle shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Features Button */}
        <div className="mt-12 text-center">
          <Button
            as={Link}
            to="/features"
            size="lg"
            variant="outline"
            className="px-8 py-4 rounded-xl text-white font-bold bg-white/5 backdrop-blur-md border border-amber-300/30 hover:border-amber-400 hover:bg-amber-200/10 hover:text-amber-400 hover:scale-105 hover:shadow-[0_0_12px_#fbbf24] transition-all duration-300"
          >
            View All Features
          </Button>
        </div>

        {/* 📊 Stats Section */}
        <div ref={statsRef} className="flex flex-col sm:flex-row justify-center gap-16 mt-16 mb-20">
          <div className="flex flex-col items-center">
            <div className="flex items-end">
              <RollingCounter value={animateStats ? "100" : "0"} duration={2000} />
              <span className="text-emerald-400 text-6xl md:text-7xl ml-4 mb-2 select-none font-bold">+</span>
            </div>
            <span className="text-gray-400 mt-3 text-lg md:text-xl uppercase tracking-wide">Active Users</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-violet-400 text-6xl md:text-7xl font-bold">120+</span>
            <span className="text-gray-400 mt-3 text-base md:text-lg uppercase tracking-wide">Events Hosted</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-pink-400 text-6xl md:text-7xl font-bold">98%</span>
            <span className="text-gray-400 mt-3 text-base md:text-lg uppercase tracking-wide">Positive Feedback</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-yellow-400 text-6xl md:text-7xl font-bold">24/7</span>
            <span className="text-gray-400 mt-3 text-base md:text-lg uppercase tracking-wide">Support</span>
          </div>
        </div>

        {/* 📅 Upcoming Events */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Upcoming Events</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-10">
            Discover and participate in exciting events happening right now
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {loadingEvents ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 rounded-xl border border-gray-700 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-gray-600 h-6 w-20 rounded-full"></div>
                    <div className="bg-gray-600 h-6 w-16 rounded-md"></div>
                  </div>
                  <div className="bg-gray-600 h-6 w-full rounded mb-2"></div>
                  <div className="bg-gray-600 h-4 w-3/4 rounded mb-4"></div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex -space-x-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-600"></div>
                      ))}
                    </div>
                    <div className="bg-gray-600 h-4 w-20 rounded"></div>
                  </div>
                </div>
              ))
            ) : featuredEvents.length > 0 ? (
              // Real events
              featuredEvents.slice(0, 2).map((event, index) => (
                <div
                  key={event.id}
                  className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 rounded-xl border border-gray-700 hover:border-amber-500 transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] animate-fadeInUp cursor-pointer"
                  style={{ animationDelay: `${index * 120}ms`, animationFillMode: "both" }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={getStatusBadge(event.status)}>
                      {event.status === 'LIVE' ? 'LIVE NOW' : event.status}
                    </div>
                    <div className="bg-gray-800 text-amber-400 font-bold px-3 py-1 rounded-md">
                      {format(new Date(event.startTime), 'MMM dd').toUpperCase()}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 text-left">
                    {event.title}
                  </h3>
                  {/* Host name in bold and with design */}
                  <div className="mb-2 text-left">
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400 text-lg drop-shadow-md">
                      Host: {event.host?.name}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm text-left mb-2 line-clamp-2">
                    {event.location}
                  </p>
                  {event.subEventCount > 0 && (
                    <p className="text-blue-400 text-xs text-left mb-4">
                      {event.subEventCount} sub-event{event.subEventCount > 1 ? 's' : ''} available
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex -space-x-3">
                      {[...Array(Math.min(4, event.attendeeCount))].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-gray-800"></div>
                      ))}
                      {event.attendeeCount > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs">
                          {formatAttendeeCount(event.attendeeCount)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      {event.isUserRegistered ? (
                        <span className="text-green-400 text-xs font-medium mb-1">✓ Registered</span>
                      ) : (
                        <span className="text-amber-400 text-xs font-medium mb-1">Join Now</span>
                      )}
                      <button
                        className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                        onClick={() => handleJoinEvent(event)}
                      >
                        {event.isUserRegistered ? 'View Event →' : 'Join Event →'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // No events message
              <div className="col-span-2 bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 rounded-xl border border-gray-700 text-center">
                <p className="text-gray-400">No upcoming events at the moment.</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for new events!</p>
              </div>
            )}
            
            {/* CTA Card */}
            <div
              className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 rounded-xl border border-gray-700 hover:border-amber-500 transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] animate-fadeInUp flex flex-col justify-center items-center"
              style={{ animationDelay: "240ms", animationFillMode: "both" }}
            >
              <h3 className="text-white text-xl font-semibold mb-2">Want to see your event here?</h3>
              <p className="text-gray-400 mb-6">Start creating today and be featured on our homepage.</p>
              <Button
                as={Link}
                to="/register"
                className="bg-white/10 text-white border border-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-semibold hover:bg-white/20 hover:border-white/40 hover:scale-105 transition"
              >
                Host an Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
