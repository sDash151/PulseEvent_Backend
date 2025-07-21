import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { format } from 'date-fns';
import { exportToJSON } from '../../utils/exportUtils';

// NOTE: To ensure this modal overlays all content (including header/footer) and is always centered,
// render <UserDetailsModal /> at the root of your page/component tree (not inside a table or scrollable container).
// The z-index is set high to guarantee it appears above all other elements.
const UserDetailsModal = ({ user, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'text-green-400',
      pending: 'text-amber-400',
      rejected: 'text-red-400'
    };
    return colors[status] || colors.pending;
  };

  const getRegistrationTypeColor = (type) => {
    const colors = {
      RSVP: 'text-blue-400',
      Registration: 'text-purple-400',
      'Waiting List': 'text-orange-400'
    };
    return colors[type] || colors.Registration;
  };

  // Utility to get the best value for a field from possible variants
  const getBestField = (details, responses, keys) => {
    for (const key of keys) {
      if (details[key]) return details[key];
      if (responses && responses[key]) return responses[key];
    }
    return '-';
  };

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] rounded-2xl border border-white/10 shadow-2xl z-50">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-white/10 bg-gradient-to-r from-[#0f0c29]/80 to-[#302b63]/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={user.avatar ? 'hidden' : 'flex'}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Registration Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Registration Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className={`font-medium ${getRegistrationTypeColor(user.registrationType)}`}>
                    {user.registrationType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-medium ${getStatusColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Registered:</span>
                  <span className="text-white font-medium">
                    {format(new Date(user.registrationDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white font-medium">
                    {format(new Date(user.registrationDate), 'h:mm a')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check-in Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user.checkedIn ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className={`font-medium ${user.checkedIn ? 'text-green-400' : 'text-gray-400'}`}>
                      {user.checkedIn ? 'Checked In' : 'Not Checked In'}
                    </span>
                  </div>
                </div>
                {user.checkedIn && user.checkInDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Check-in Time:</span>
                    <span className="text-white font-medium">
                      {format(new Date(user.checkInDate), 'MMM dd, yyyy h:mm a')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

                     {/* Team Information */}
           {(user.teamName || (user.participants && user.participants.length > 0)) && (
             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
               <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                 </svg>
                 Team Information
               </h3>
               <div className="space-y-4">
                 {user.teamName && (
                   <div className="flex justify-between items-center">
                     <span className="text-gray-400">Team Name:</span>
                     <span className="text-white font-medium bg-gradient-to-r from-amber-400/20 to-pink-400/20 px-3 py-1 rounded-lg border border-amber-400/30">
                       {user.teamName}
                     </span>
                   </div>
                 )}
                 
                 {user.participants && user.participants.length > 0 && (
                   <div>
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-gray-400 font-medium">Team Members ({user.participants.length})</span>
                       <div className="flex items-center gap-2 text-amber-400">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                         </svg>
                         <span className="text-sm font-medium">Team Event</span>
                       </div>
                     </div>
                     
                     <div className="grid gap-3">
                       {user.participants.map((participant, index) => {
                         const details = participant.details || {};
                         const responses = user.responses || {};
                         const name = getBestField(details, responses, ['Name', 'name']);
                         const email = getBestField(details, responses, ['EMAIL ID', 'Email', 'email']);
                         const college = getBestField(details, responses, ['College Name', 'College']);
                         const degree = getBestField(details, responses, ['Degree Name', 'Degree']);
                         const usn = getBestField(details, responses, ['USN']);
                         const gender = getBestField(details, responses, ['Gender']);
                         const whatsapp = getBestField(details, responses, ['WhatsApp Number', 'Whats App Number']);
                         return (
                           <div key={index} className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl p-4 relative overflow-hidden">
                             {/* Background decoration */}
                             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-full blur-xl"></div>
                             
                             <div className="relative z-10">
                               <div className="flex items-center justify-between mb-3">
                                 <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                     {name?.charAt(0)?.toUpperCase() || (index + 1)}
                                   </div>
                                   <div>
                                     <h4 className="text-white font-semibold">
                                       {name || `Participant ${index + 1}`}
                                     </h4>
                                     <p className="text-blue-300 text-sm">Team Member</p>
                                   </div>
                                 </div>
                                 <div className="text-blue-400 text-xs font-medium bg-blue-400/20 px-2 py-1 rounded-full">
                                   #{index + 1}
                                 </div>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <div className="flex items-center gap-2">
                                   <span className="text-gray-400">USN:</span>
                                   <span className="text-gray-300 text-sm">{usn}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-gray-400">Name:</span>
                                   <span className="text-gray-300 text-sm">{name}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-gray-400">Email:</span>
                                   <span className="text-gray-300 text-sm">{email}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-gray-400">Gender:</span>
                                   <span className="text-gray-300 text-sm">{gender}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-gray-400">Team Name:</span>
                                   <span className="text-gray-300 text-sm">{details['Team Name'] || responses['Team Name'] || user.teamName || '-'}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-gray-400">Degree Name:</span>
                                   <span className="text-gray-300 text-sm">{degree}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-gray-400">College Name:</span>
                                   <span className="text-gray-300 text-sm">{college}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-gray-400">Whats App Number:</span>
                                   <span className="text-gray-300 text-sm">{whatsapp}</span>
                                 </div>
                               </div>
                               {/* Additional details if any, excluding already shown fields, only in View All Details */}
                               {details && Object.keys(details).length > 0 && (
                                 <div className="mt-3 pt-3 border-t border-blue-400/20">
                                   <details className="group">
                                     <summary className="cursor-pointer text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                                       View All Details
                                     </summary>
                                     <div className="mt-2 space-y-1">
                                       {Object.entries(details)
                                         .filter(([key]) => !['Name','name','EMAIL ID','Email','email','College Name','College','Degree Name','Degree','USN','Gender','WhatsApp Number','Whats App Number','Team Name'].includes(key))
                                         .map(([key, value]) => (
                                           <div key={key} className="flex justify-between text-xs">
                                             <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                             <span className="text-gray-300">{value}</span>
                                           </div>
                                         ))}
                                     </div>
                                   </details>
                                 </div>
                               )}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}
               </div>
             </div>
           )}

                     {/* Custom Form Responses */}
           {user.responses && Object.keys(user.responses).length > 0 && (
             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
               <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 Registration Responses
               </h3>
               <div className="space-y-3">
                 {Object.entries(user.responses).map(([key, value]) => (
                   <div key={key} className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-lg p-3">
                     <div className="flex items-center gap-2 mb-2">
                       <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <span className="text-green-400 font-medium text-sm capitalize">
                         {key.replace(/([A-Z])/g, ' $1').trim()}
                       </span>
                     </div>
                     <p className="text-white text-sm">{value}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}

                      {/* Payment Proof */}
           {user.paymentProof && (
             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
               <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                 </svg>
                 Payment Proof
               </h3>
               <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-lg p-4">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                     <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div>
                     <p className="text-emerald-400 font-semibold">Payment Proof Submitted</p>
                     <p className="text-emerald-300 text-sm">Screenshot uploaded successfully</p>
                   </div>
                 </div>
                 <div className="flex justify-center">
                   <img 
                     src={user.paymentProof} 
                     alt="Payment Proof" 
                     className="max-w-full h-auto rounded-lg border border-emerald-400/30 max-h-64 object-contain"
                     onError={(e) => {
                       e.target.style.display = 'none';
                       e.target.nextSibling.style.display = 'flex';
                     }}
                   />
                   <div className="hidden items-center justify-center w-full h-32 bg-emerald-500/10 rounded-lg border border-emerald-400/30">
                     <div className="text-center">
                       <svg className="w-8 h-8 text-emerald-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       <p className="text-emerald-400 text-sm">Payment Proof</p>
                       <p className="text-emerald-300 text-xs">Image not available</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* User Profile */}
           <div className="bg-white/5 rounded-xl p-4 border border-white/10">
             <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
               User Profile
             </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white font-mono text-sm">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-white font-medium">
                  {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
              {user.avatar && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avatar:</span>
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
                         <button
               onClick={() => {
                 try {
                   const filename = `user-${user.id}-${user.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
                   exportToJSON([user], filename);
                 } catch (error) {
                   console.error('Export failed:', error);
                 }
               }}
               className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
             >
               Export Data
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default UserDetailsModal; 