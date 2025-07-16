// frontend/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import RollingCounter from '../components/RollingCounter';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const statsRef = useRef(null);
  const [animateStats, setAnimateStats] = useState(false);

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

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden text-white">
      
      {/* 🎥 Video Background */}
      <video 
        className="absolute inset-0 w-full h-full object-cover z-0" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/assets/concert-loop.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🔮 Optional Dim Overlay (for contrast) */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

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

        {/* ✨ Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-Time RSVPs",
              description: "Watch as attendees confirm their participation instantly with live updates.",
              icon: "📝"
            },
            {
              title: "Live Feedback",
              description: "Capture audience sentiment during your event with emoji reactions and comments.",
              icon: "💬"
            },
            {
              title: "Powerful Analytics",
              description: "Gain insights into attendee engagement and feedback trends post-event.",
              icon: "📊"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] hover:border-amber-500"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* 📊 Stats Section */}
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
            {/* Event 1 */}
            <div
              className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 rounded-xl border border-gray-700 hover:border-amber-500 transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] animate-fadeInUp"
              style={{ animationDelay: "0ms", animationFillMode: "both" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold px-3 py-1 rounded-full">
                  LIVE NOW
                </div>
                <div className="bg-gray-800 text-amber-400 font-bold px-3 py-1 rounded-md">
                  AUG 30
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 text-left">
                CUEST 2.0 at Atria Institute of Technology, AnandNagar, Bengaluru
              </h3>
              <div className="flex items-center justify-between mt-6">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-gray-800"></div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs">
                    +1.2K+
                  </div>
                </div>
                <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                  Join Event →
                </button>
              </div>
            </div>
            {/* Event 2 */}
            <div
              className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 rounded-xl border border-gray-700 hover:border-amber-500 transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] animate-fadeInUp"
              style={{ animationDelay: "120ms", animationFillMode: "both" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold px-3 py-1 rounded-full">
                  LIVE NOW
                </div>
                <div className="bg-gray-800 text-amber-400 font-bold px-3 py-1 rounded-md">
                  SEP 12
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 text-left">
                Seminar on AI at Seminar Hall, Atria Institute of Technology, AnandNagar, Bengaluru
              </h3>
              <div className="flex items-center justify-between mt-6">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-gray-800"></div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs">
                    +780+
                  </div>
                </div>
                <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                  Join Event →
                </button>
              </div>
            </div>
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
