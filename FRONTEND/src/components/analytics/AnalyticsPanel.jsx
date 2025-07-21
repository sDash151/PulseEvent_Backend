// components/analytics/AnalyticsPanel.jsx
import { Link } from 'react-router-dom';
import { useRoleCheck } from '../../hooks/useRoleCheck';

const AnalyticsPanel = ({ eventId, rsvps = [] }) => {
  const { isHost, canAccessHostFeatures } = useRoleCheck();
  
  console.log('AnalyticsPanel received rsvps:', rsvps);
  const checkedInCount = (rsvps || []).filter(r => r.checkedIn).length;

  // 🔐 Only show analytics panel to hosts
  if (!canAccessHostFeatures()) {
    return null;
  }

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
          <span>Attendees ({(rsvps || []).length})</span>
          <span>Checked In: {checkedInCount}</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-amber-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${rsvps.length > 0 ? (checkedInCount / rsvps.length) * 100 : 0}%` }}
          ></div>
        </div>

        <div className="mt-4 text-sm text-gray-300">
          <p>Check-in Rate: {rsvps.length > 0 ? Math.round((checkedInCount / rsvps.length) * 100) : 0}%</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
