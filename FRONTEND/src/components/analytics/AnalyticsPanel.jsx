// components/analytics/AnalyticsPanel.jsx
import { Link } from 'react-router-dom';

const AnalyticsPanel = ({ eventId, rsvps }) => {
  const checkedInCount = rsvps.filter(r => r.checkedIn).length;

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Event Actions</h2>

        <Link
          to={`/analytics/${eventId}`}
          className="w-full block text-center py-2 px-4 rounded-lg bg-amber-500/80 text-white hover:bg-amber-500 transition-all duration-200"
        >
          View Analytics
        </Link>

        <div className="bg-amber-100/10 p-4 rounded-lg mt-4">
          <h4 className="text-amber-400 font-medium">Host Controls</h4>
          <p className="text-sm text-gray-300 mt-1">
            You have full access to manage and analyze event insights.
          </p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Attendees</h2>

        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Attendees ({rsvps.length})</span>
          <span>Checked In: {checkedInCount}</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-transparent pr-1">
          {rsvps.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No attendees yet</p>
          ) : (
            rsvps.map(rsvp => (
              <div
                key={rsvp.id}
                className="flex items-center justify-between p-2 hover:bg-white/10 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100/10 text-amber-400 flex items-center justify-center text-sm">
                    {rsvp.user.name.charAt(0)}
                  </div>
                  <span className="ml-2 text-white">{rsvp.user.name}</span>
                </div>
                {rsvp.checkedIn ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-400/10 text-green-300">
                    Checked In
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-400/10 text-yellow-300">
                    Registered
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
