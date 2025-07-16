import { useState, useEffect } from 'react';
import { sendInvitations } from '../../services/invitations';
import { useLocation } from 'react-router-dom';
import { fetchEventById } from '../../services/events';

export default function InviteForm({ eventId }) {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [eventName, setEventName] = useState('');
  const location = useLocation();

  useEffect(() => {
    async function getEventName() {
      try {
        const event = await fetchEventById(eventId);
        setEventName(event.title || 'this event');
      } catch {
        setEventName('this event');
      }
    }
    getEventName();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendInvitations(eventId, emails.split(',').map(e => e.trim()));
      setMessage('Invitations sent successfully!');
      setEmails('');
    } catch (error) {
      setMessage('Error sending invitations');
    }
  };

  const eventUrl = `${window.location.origin}/events/${eventId}`;
  const invitingMsg = `Hey! 🎉\nI'm inviting you to join the event: "${eventName}" on EventPulse.\nClick the link to see details and RSVP: ${eventUrl}`;
  const shareMessage = encodeURIComponent(invitingMsg);

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${shareMessage}`, '_blank');
  };

  const handleSMSShare = () => {
    window.open(`sms:?body=${shareMessage}`);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6 text-white">
      <h3 className="text-xl font-semibold mb-4">Invite Attendees</h3>

      <div className="mb-4 bg-white/10 p-4 rounded-lg text-sm text-amber-100 border border-white/10">
        <span className="font-medium text-amber-300">Invitation message:</span>
        <div className="mt-2 whitespace-pre-line">{invitingMsg}</div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="Enter emails, separated by commas"
          className="w-full p-3 rounded-lg bg-white/10 border border-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
          rows="3"
        />
        <div className="flex flex-wrap gap-3 mb-4">
          <button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:brightness-110 transition"
          >
            Send Invites
          </button>
          <button
            type="button"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-lg hover:brightness-110 transition"
            onClick={handleWhatsAppShare}
          >
            Send via WhatsApp
          </button>
          <button
            type="button"
            className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-5 py-2 rounded-lg hover:brightness-110 transition"
            onClick={handleSMSShare}
          >
            Send via SMS
          </button>
        </div>
        {message && (
          <p className="mt-2 text-emerald-400 font-medium">{message}</p>
        )}
      </form>
    </div>
  );
}
