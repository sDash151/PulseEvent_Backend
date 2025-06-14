import { useState } from 'react';
import { sendInvitations } from '../../services/invitations';
import { useLocation } from 'react-router-dom';

export default function InviteForm({ eventId }) {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();

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

  // Generate event link and message for sharing
  const eventUrl = `${window.location.origin}/events/${eventId}`;
  const invitingMsg = `Hey! 🎉\nI'm hosting an event on EventPulse and would love for you to join.\nClick the link to see details and RSVP: ${eventUrl}`;
  const shareMessage = encodeURIComponent(invitingMsg);

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${shareMessage}`, '_blank');
  };

  const handleSMSShare = () => {
    window.open(`sms:?body=${shareMessage}`);
  };

  return (
    <div className="card p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Invite Attendees</h3>
      <div className="mb-2 text-gray-700 text-sm bg-indigo-50 rounded p-2">
        <span className="font-medium">Invitation message:</span>
        <div className="mt-1 whitespace-pre-line">{invitingMsg}</div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="Enter emails, separated by commas"
          className="w-full p-2 border rounded mb-2"
          rows="3"
        />
        <div className="flex flex-wrap gap-2 mb-2">
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send Invites
          </button>
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleWhatsAppShare}
          >
            Send via WhatsApp
          </button>
          <button
            type="button"
            className="bg-yellow-500 text-white px-4 py-2 rounded"
            onClick={handleSMSShare}
          >
            Send via SMS
          </button>
        </div>
        {message && <p className="mt-2 text-green-600">{message}</p>}
      </form>
    </div>
  );
}