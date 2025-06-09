import { useState } from 'react';
import { sendInvitations } from '../../services/invitations';

export default function InviteForm({ eventId }) {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');

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

  return (
    <div className="card p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Invite Attendees</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="Enter emails, separated by commas"
          className="w-full p-2 border rounded mb-2"
          rows="3"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Invites
        </button>
        {message && <p className="mt-2 text-green-600">{message}</p>}
      </form>
    </div>
  );
}