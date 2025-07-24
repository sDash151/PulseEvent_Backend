import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, isBefore, isAfter } from 'date-fns';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import { fetchEventById } from '../services/events';
import { useAuth } from '../hooks/useAuth';
import { checkUserRegistration } from '../services/registration';
import FormattedContent from '../components/FormattedContent';

const SubEventDetailsPage = () => {
  const { parentId, subId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistered: false,
    hasRSVP: false,
    hasRegistration: false,
    onWaitingList: false
  });
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEventById(subId);
        setEvent(eventData);
      } catch (err) {
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [subId]);

  // Check registration status when component mounts or when user changes
  useEffect(() => {
    const checkRegistration = async () => {
      if (!currentUser || !subId) return;
      
      setLoadingRegistration(true);
      try {
        const status = await checkUserRegistration(subId);
        setRegistrationStatus(status);
      } catch (error) {
        console.error('Error checking registration:', error);
        setRegistrationStatus({
          isRegistered: false,
          hasRSVP: false,
          hasRegistration: false,
          onWaitingList: false
        });
      } finally {
        setLoadingRegistration(false);
      }
    };
    
    checkRegistration();
  }, [subId, currentUser]);

  const handleRegister = () => {
    navigate(`/events/${parentId}/sub/${subId}/register`);
  };

  const handleBackToEvent = () => {
    navigate(`/events/${parentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-red-400 text-xl">
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white text-xl">
        Event not found
      </div>
    );
  }

  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const rsvpDeadline = new Date(event.rsvpDeadline);
  const isEventLive = isBefore(now, endTime) && isAfter(now, startTime);
  const isEventUpcoming = isAfter(startTime, now);
  const isEventPast = isAfter(now, endTime);
  
  // Check if event is within 1 hour of starting (for paid events only)
  const oneHourBeforeStart = new Date(startTime.getTime() - 60 * 60 * 1000);
  const isWithinOneHour = isAfter(now, oneHourBeforeStart) && isBefore(now, startTime);
  const registrationClosedEarly = event.paymentEnabled && isWithinOneHour;
  
  const canRSVP = isBefore(now, rsvpDeadline) && event.rsvps?.length < event.maxAttendees && !registrationClosedEarly;
  const isHost = currentUser && event.hostId === currentUser.id;

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Edit Sub-Event Button for Host */}
      {isHost && (
        <div className="absolute top-6 right-6 z-20">
          <Button onClick={() => navigate(`/events/${parentId}/sub/${subId}/edit`)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg">
            Edit Sub-Event
          </Button>
        </div>
      )}
      {/* Animated background elements */}
      <div className="absolute top-0 left-[20%] w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] z-0 animate-pulse-slow" />
      <div className="absolute bottom-10 right-[15%] w-72 h-72 bg-amber-400/10 rounded-full blur-[100px] z-0 animate-pulse-slow animation-delay-2000" />
      <div className="absolute bottom-0 left-[10%] w-60 h-60 bg-blue-400/10 rounded-full blur-[100px] z-0 animate-pulse-slow" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <BackButton 
              to={event.parentEventId ? `/events/${event.parentEventId}` : "/dashboard"} 
              variant="subtle" 
              label={event.parentEventId ? "Back to Mega Event" : "Dashboard"} 
            />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                {event.title}
              </h1>
              <p className="text-gray-300 text-lg">{event.location}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end gap-2">
            {isEventLive && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-semibold text-sm">LIVE NOW</span>
              </div>
            )}
            {isEventUpcoming && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400 font-semibold text-sm">UPCOMING</span>
              </div>
            )}
            {isEventPast && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 border border-gray-400/30 rounded-full">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-400 font-semibold text-sm">COMPLETED</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Event Description */}
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
              <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About This Event
              </h2>
              <FormattedContent content={event.description} />
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-400">Date & Time</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">{format(startTime, 'EEEE, MMMM do, yyyy')}</p>
                  <p className="text-gray-300">{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</p>
                  <p className="text-sm text-gray-400">Duration: {Math.round((endTime - startTime) / (1000 * 60 * 60))} hours</p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-400">Location</h3>
                </div>
                <p className="text-white font-medium">{event.location}</p>
              </div>

              {/* Attendees */}
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-400">Attendees</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">{event.rsvps?.length || 0} / {event.maxAttendees} registered</p>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((event.rsvps?.length || 0) / event.maxAttendees) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400">{event.maxAttendees - (event.rsvps?.length || 0)} spots remaining</p>
                </div>
              </div>

              {/* RSVP Deadline */}
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-400/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-400">RSVP Deadline</h3>
                </div>
                <p className="text-white font-medium">{format(rsvpDeadline, 'MMM do, yyyy')}</p>
                <p className="text-gray-300">{format(rsvpDeadline, 'h:mm a')}</p>
                {isBefore(now, rsvpDeadline) ? (
                  <p className="text-sm text-green-400 mt-2">Registration still open</p>
                ) : (
                  <p className="text-sm text-red-400 mt-2">Registration closed</p>
                )}
              </div>
            </div>

            {/* Event Type & Features */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Event Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center">
                    {event.teamSize ? (
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {event.teamSize ? `Team Event (Max ${event.teamSize})` : 'Solo Event'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {event.teamSize ? 'Collaborate with others' : 'Individual participation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center">
                    {event.paymentEnabled ? (
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {event.paymentEnabled ? 'Paid Event' : 'Free Event'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {event.paymentEnabled ? 'Registration fee required' : 'No cost to participate'}
                    </p>
                  </div>
                </div>

                {event.whatsappGroupEnabled && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">WhatsApp Group</p>
                      <p className="text-sm text-gray-400">Join community chat</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Host Info & Actions */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-6">
            {/* Host Information */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Event Host
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {event.host?.name?.charAt(0)?.toUpperCase() || 'H'}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{event.host?.name}</p>
                  <p className="text-gray-400">Event Organizer</p>
                </div>
              </div>
              
              {/* Host Description */}
              <div className="bg-gradient-to-r from-amber-400/10 to-pink-400/10 border border-amber-400/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-pink-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-amber-400">Relax and Enjoy! You're in the Capable Hands of {event.host?.name || 'Your Host'}.</h4>
                </div>
                
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    A very warm welcome from your hosts, <span className="text-amber-400 font-semibold">{event.host?.name || 'Your Host'}</span>! We want you to focus on what truly matters—learning, competing, and connecting. Why? Because all the background logistics are being handled by a team with a deep reservoir of experience.
                  </p>
                  
                  <p className="leading-relaxed">
                    Our ORGANISATION is a hub of activity and is well-known for hosting amazing events like this one all the time. We've managed everything from massive tech fests to intricate academic conferences, so trust us when we say we know how to make an event successful. Expect a smooth, well-organized, and memorable experience from start to finish! We've got this.
                  </p>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-amber-300 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Professional event management guaranteed</span>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-amber-400 mb-4">Registration Status</h3>
              <div className="space-y-4">
                {isHost ? (
                  <div className="text-center p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                    <p className="text-amber-400 font-semibold">You are the host</p>
                    <p className="text-gray-400 text-sm">Manage your event</p>
                  </div>
                ) : (
                  <>
                    {isEventPast ? (
                      <div className="text-center p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                        <p className="text-gray-400 font-semibold">Event Completed</p>
                        <p className="text-gray-500 text-sm">This event has already ended</p>
                      </div>
                    ) : registrationStatus.onWaitingList ? (
                      <div className="text-center p-6 bg-gradient-to-br from-amber-400/10 via-orange-400/10 to-yellow-400/10 border border-amber-400/30 rounded-xl relative overflow-hidden">
                        {/* Animated background elements */}
                        <div className="absolute top-0 left-0 w-full h-full">
                          <div className="absolute top-4 right-4 w-16 h-16 bg-amber-400/20 rounded-full blur-xl animate-pulse"></div>
                          <div className="absolute bottom-4 left-4 w-12 h-12 bg-orange-400/20 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
                        </div>
                        
                        {/* Status Icon */}
                        <div className="relative z-10 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Status Text */}
                        <div className="relative z-10">
                          <h3 className="text-xl font-bold text-amber-400 mb-2">Registration Submitted! 🎉</h3>
                          <p className="text-amber-300 text-lg font-medium mb-3">Your details are under review</p>
                          
                          {/* Positive Message */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-amber-300 font-semibold text-sm mb-1">Payment Proof Submitted!</p>
                                <p className="text-gray-300 text-xs">Your payment screenshot has been submitted and is awaiting host verification.</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Reassurance Message */}
                          <div className="bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <p className="text-blue-300 font-semibold text-sm">What's Next?</p>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">
                              Sit tight! The host will review your registration details and approve you as soon as possible. 
                              You'll receive a notification once approved, and then you'll have full access to the event.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : registrationStatus.isRegistered ? (
                      <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 font-semibold">You are Registered</p>
                        <p className="text-green-300 text-sm">You can now enter the event when it starts</p>
                      </div>
                    ) : registrationClosedEarly ? (
                      <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-orange-400 font-semibold">Registration Closed</p>
                        <p className="text-orange-300 text-sm">Registration closes 1 hour before paid events start</p>
                        <p className="text-orange-200 text-xs mt-1">Event starts in {Math.round((startTime - now) / (1000 * 60))} minutes</p>
                      </div>
                    ) : !canRSVP ? (
                      <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 font-semibold">Registration Closed</p>
                        <p className="text-red-300 text-sm">RSVP deadline has passed</p>
                      </div>
                    ) : event.rsvps?.length >= event.maxAttendees ? (
                      <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-orange-400 font-semibold">Event Full</p>
                        <p className="text-orange-300 text-sm">Maximum capacity reached</p>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 font-semibold">Registration Open</p>
                        <p className="text-green-300 text-sm">{event.maxAttendees - (event.rsvps?.length || 0)} spots available</p>
                        {event.paymentEnabled && (
                          <p className="text-green-200 text-xs mt-1">Registration closes 1 hour before event start</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-amber-400 mb-4">Actions</h3>
              <div className="space-y-3">
                {isHost ? (
                  <Button
                    onClick={() => navigate(`/events/${parentId}/sub/${subId}`)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Manage Event
                  </Button>
                ) : (
                  <>
                    {registrationStatus.onWaitingList ? (
                      // Special actions for waiting list users
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-amber-400/10 to-orange-400/10 border border-amber-400/20 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-amber-400 font-semibold">Registration Pending</p>
                              <p className="text-amber-300 text-sm">Awaiting host approval</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                            <span>Your registration is being reviewed</span>
                          </div>
                        </div>
                        
                        <Button
                          disabled
                          className="w-full bg-gradient-to-r from-amber-400/50 to-orange-400/50 text-amber-200 cursor-not-allowed opacity-75"
                        >
                          ⏳ Waiting for Approval
                        </Button>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-2">Need to make changes?</p>
                          <div className="text-xs text-gray-500 p-2 bg-gray-500/10 rounded">
                            Please wait for host approval. Contact options will be available after your registration is approved.
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Regular actions for unregistered users
                      <>
                        {!registrationStatus.isRegistered && !isEventPast && !registrationClosedEarly && canRSVP && event.rsvps?.length < event.maxAttendees && (
                          <Button
                            onClick={handleRegister}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold"
                          >
                            Register Now
                          </Button>
                        )}
                        {!registrationStatus.isRegistered && !isEventPast && !canRSVP && event.rsvps?.length < event.maxAttendees && registrationClosedEarly && (
                          <div className="w-full">
                            <Button
                              disabled
                              className="w-full bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                            >
                              Register Now
                            </Button>
                            <p className="text-orange-400 text-xs mt-2 text-center">
                              Registration closes 1 hour before paid events start
                            </p>
                          </div>
                        )}
                        {registrationStatus.isRegistered && isEventLive && (
                          <Button
                            onClick={() => navigate(`/events/${parentId}/sub/${subId}`)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white"
                          >
                            Enter Live Event
                          </Button>
                        )}
                        {registrationStatus.isRegistered && !isEventLive && isEventUpcoming && (
                          <Button
                            disabled
                            className="w-full bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                          >
                            Event Not Started
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
                
                <Button
                  onClick={handleBackToEvent}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Back to Mega Event
                </Button>
              </div>
            </div>

            {/* WhatsApp Group Link - Only visible to registered users and host */}
            {event.whatsappGroupEnabled && event.whatsappGroupLink && (isHost || registrationStatus.isRegistered) && !registrationStatus.onWaitingList && (
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Join Community
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Connect with other participants and get event updates
                </p>
                <Button
                  onClick={() => window.open(event.whatsappGroupLink, '_blank')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Join WhatsApp Group
                </Button>
              </div>
            )}

            {/* WhatsApp Group - Special message for waiting list users */}
            {event.whatsappGroupEnabled && event.whatsappGroupLink && !isHost && registrationStatus.onWaitingList && (
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Community Access Pending
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-amber-400 font-medium">WhatsApp Community</p>
                    <p className="text-sm text-amber-300">Access granted after approval</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-400/10 to-orange-400/10 border border-amber-400/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                                         <div>
                       <p className="text-amber-300 text-sm font-medium mb-1">Coming soon!</p>
                       <p className="text-gray-300 text-xs">
                         You'll get access to the WhatsApp community once your registration is approved by the host. 
                         Connect with other participants and get real-time updates!
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Group Locked State - For unregistered users */}
            {event.whatsappGroupEnabled && event.whatsappGroupLink && !isHost && !registrationStatus.isRegistered && !registrationStatus.onWaitingList && (
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Community Locked
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">WhatsApp Community</p>
                    <p className="text-sm text-gray-500">Register to unlock access</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-400/10 to-orange-400/10 border border-amber-400/20 rounded-lg p-3">
                  <p className="text-amber-300 text-sm font-medium mb-2">🔒 Exclusive Access</p>
                  <p className="text-gray-400 text-xs">
                    Join the WhatsApp community to connect with other participants, get event updates, and share experiences.
                  </p>
                </div>
                {!isEventPast && !registrationClosedEarly && canRSVP && event.rsvps?.length < event.maxAttendees && (
                  <Button
                    onClick={handleRegister}
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                  >
                    Register to Unlock
                  </Button>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubEventDetailsPage; 