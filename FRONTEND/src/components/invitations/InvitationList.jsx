export default function InvitationList({ invitations }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800'
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Sent Invitations</h3>
      <ul>
        {invitations.map(invite => (
          <li key={invite.id} className="flex justify-between items-center py-2 border-b">
            <div>
              <p>{invite.email}</p>
              {invite.invitedUser && (
                <p className="text-sm text-gray-600">
                  {invite.invitedUser.name} (registered)
                </p>
              )}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[invite.status]}`}>
              {invite.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}