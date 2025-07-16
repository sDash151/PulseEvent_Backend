export default function InvitationList({ invitations }) {
  const statusStyles = {
    pending: 'bg-yellow-400/20 text-yellow-300 border border-yellow-500/20',
    accepted: 'bg-green-400/20 text-green-300 border border-green-500/20',
    declined: 'bg-red-400/20 text-red-300 border border-red-500/20',
  };

  return (
    <div className="mt-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg p-6 text-white">
      <h3 className="text-xl font-semibold mb-4 text-amber-300">Sent Invitations</h3>

      {invitations.length === 0 ? (
        <p className="text-gray-300 text-sm">No invitations sent yet.</p>
      ) : (
        <ul className="space-y-3">
          {invitations.map((invite) => (
            <li
              key={invite.id}
              className="flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 transition duration-200"
            >
              <div>
                <p className="font-medium text-white">{invite.email}</p>
                {invite.invitedUser && (
                  <p className="text-sm text-gray-400">
                    {invite.invitedUser.name} (registered)
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[invite.status]}`}
              >
                {invite.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
