import React from 'react';

const UserStatistics = ({ users }) => {
  // Handle empty or invalid data
  if (!users || !Array.isArray(users) || users.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-amber-400 mb-4">User Statistics</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-gray-400 mb-2">No user data available</p>
          <p className="text-gray-500 text-sm text-center">User statistics will appear here when people register for the event</p>
        </div>
      </div>
    );
  }

  // Calculate statistics with proper error handling
  const totalUsers = users.length;
  const rsvpUsers = users.filter(u => u && u.registrationType === 'RSVP').length;
  const registrationUsers = users.filter(u => u && u.registrationType === 'Registration').length;
  const waitingListUsers = users.filter(u => u && u.registrationType === 'Waiting List').length;
  
  const confirmedUsers = users.filter(u => u && u.status === 'confirmed').length;
  const pendingUsers = users.filter(u => u && u.status === 'pending').length;
  const rejectedUsers = users.filter(u => u && u.status === 'rejected').length;
  
  const checkedInUsers = users.filter(u => u && u.checkedIn).length;
  const teamEvents = users.filter(u => u && u.teamName).length;
  const totalParticipants = users.reduce((sum, user) => {
    if (user && user.participants && Array.isArray(user.participants)) {
      return sum + user.participants.length;
    }
    return sum;
  }, 0);

  // Calculate registration trends (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const registrationsByDay = last7Days.map(day => ({
    date: day,
    count: users.filter(user => {
      const userDate = new Date(user.registrationDate).toDateString();
      return userDate === day;
    }).length
  }));

  const getPercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-400/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-400/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Checked In</p>
              <p className="text-2xl font-bold text-white">{checkedInUsers}</p>
              <p className="text-green-300 text-xs">{getPercentage(checkedInUsers, totalUsers)}% of total</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Team Events</p>
              <p className="text-2xl font-bold text-white">{teamEvents}</p>
              <p className="text-purple-300 text-xs">{totalParticipants} participants</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-400/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingUsers}</p>
              <p className="text-amber-300 text-xs">{getPercentage(pendingUsers, totalUsers)}% of total</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Type Breakdown */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-amber-400 mb-4">Registration Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 font-medium">RSVP</span>
              <span className="text-white font-bold">{rsvpUsers}</span>
            </div>
            <div className="w-full bg-blue-500/20 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(rsvpUsers, totalUsers)}%` }}
              ></div>
            </div>
            <p className="text-blue-300 text-xs mt-1">{getPercentage(rsvpUsers, totalUsers)}%</p>
          </div>

          <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 font-medium">Registration</span>
              <span className="text-white font-bold">{registrationUsers}</span>
            </div>
            <div className="w-full bg-purple-500/20 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(registrationUsers, totalUsers)}%` }}
              ></div>
            </div>
            <p className="text-purple-300 text-xs mt-1">{getPercentage(registrationUsers, totalUsers)}%</p>
          </div>

          <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 font-medium">Waiting List</span>
              <span className="text-white font-bold">{waitingListUsers}</span>
            </div>
            <div className="w-full bg-orange-500/20 rounded-full h-2">
              <div 
                className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(waitingListUsers, totalUsers)}%` }}
              ></div>
            </div>
            <p className="text-orange-300 text-xs mt-1">{getPercentage(waitingListUsers, totalUsers)}%</p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-amber-400 mb-4">Registration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 font-medium">Confirmed</span>
              <span className="text-white font-bold">{confirmedUsers}</span>
            </div>
            <div className="w-full bg-green-500/20 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(confirmedUsers, totalUsers)}%` }}
              ></div>
            </div>
            <p className="text-green-300 text-xs mt-1">{getPercentage(confirmedUsers, totalUsers)}%</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-medium">Pending</span>
              <span className="text-white font-bold">{pendingUsers}</span>
            </div>
            <div className="w-full bg-amber-500/20 rounded-full h-2">
              <div 
                className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(pendingUsers, totalUsers)}%` }}
              ></div>
            </div>
            <p className="text-amber-300 text-xs mt-1">{getPercentage(pendingUsers, totalUsers)}%</p>
          </div>

          <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 font-medium">Rejected</span>
              <span className="text-white font-bold">{rejectedUsers}</span>
            </div>
            <div className="w-full bg-red-500/20 rounded-full h-2">
              <div 
                className="bg-red-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(rejectedUsers, totalUsers)}%` }}
              ></div>
            </div>
            <p className="text-red-300 text-xs mt-1">{getPercentage(rejectedUsers, totalUsers)}%</p>
          </div>
        </div>
      </div>

      {/* Registration Trends */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-amber-400 mb-4">Registration Trends (Last 7 Days)</h3>
        <div className="space-y-3">
                     {registrationsByDay.map((day, index) => (
             <div key={index} className="flex items-center justify-between">
               <span className="text-gray-300 text-sm">{day.date}</span>
               <div className="flex items-center gap-3">
                 <div className="w-32 bg-gray-600 rounded-full h-2">
                   <div 
                     className="bg-gradient-to-r from-amber-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                     style={{ width: `${Math.max((day.count / Math.max(...registrationsByDay.map(d => d.count))) * 100, 5)}%` }}
                   ></div>
                 </div>
                 <span className="text-white font-medium min-w-[2rem] text-right">{day.count}</span>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default UserStatistics; 