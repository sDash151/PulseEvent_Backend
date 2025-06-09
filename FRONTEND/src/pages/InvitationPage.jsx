import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { acceptInvitation } from '../services/invitations';

export default function InvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing invitation...');
  const [error, setError] = useState('');

  useEffect(() => {
    const accept = async () => {
      try {
        await acceptInvitation(token);
        setMessage('Invitation accepted successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err) {
        setError('Invalid or expired invitation token');
      }
    };
    
    accept();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {error ? (
          <div className="text-red-500">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="text-green-500">
            <h2 className="text-xl font-bold mb-2">Success!</h2>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}