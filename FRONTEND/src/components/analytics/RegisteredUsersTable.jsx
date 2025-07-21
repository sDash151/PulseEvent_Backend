import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import UserDetailsModal from './UserDetailsModal';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import { saveAs } from 'file-saver';
import CustomDropdown from '../ui/CustomDropdown';

const RegisteredUsersTable = ({ users, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('registrationDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Apply registration type filter
    if (registrationTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.registrationType === registrationTypeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'registrationDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, statusFilter, registrationTypeFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-500/20 border-green-400/30 text-green-400', text: 'Confirmed' },
      pending: { color: 'bg-amber-500/20 border-amber-400/30 text-amber-400', text: 'Pending' },
      rejected: { color: 'bg-red-500/20 border-red-400/30 text-red-400', text: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRegistrationTypeBadge = (type) => {
    const typeConfig = {
      RSVP: { color: 'bg-blue-500/20 border-blue-400/30 text-blue-400', icon: '👥' },
      Registration: { color: 'bg-purple-500/20 border-purple-400/30 text-purple-400', icon: '📝' },
      'Waiting List': { color: 'bg-orange-500/20 border-orange-400/30 text-orange-400', icon: '⏳' }
    };
    const config = typeConfig[type] || typeConfig.Registration;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon} {type}
      </span>
    );
  };

  const getCheckInStatus = (checkedIn) => {
    return checkedIn ? (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-green-400 text-sm">Checked In</span>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-gray-400 text-sm">Not Checked In</span>
      </div>
    );
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Enhanced export handlers with comprehensive data
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `event_registrations_complete_${timestamp}.csv`;
    exportToCSV(filteredAndSortedUsers, filename);
  };
  
  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `event_registrations_complete_${timestamp}.json`;
    exportToJSON(filteredAndSortedUsers, filename);
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-amber-400 mb-2">Registered Users</h3>
            <p className="text-gray-300 text-sm">
              {filteredAndSortedUsers.length} of {users?.length || 0} total registrations
            </p>
          </div>
          {/* Export Buttons */}
          <div className="flex gap-3 mt-2 lg:mt-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg transition flex items-center gap-2"
              title="Export complete participant data as CSV - includes all registration responses and participant details"
            >
              <span role="img" aria-label="csv">📊</span> Export Complete CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg transition flex items-center gap-2"
              title="Export as JSON"
            >
              <span role="img" aria-label="json">🗂️</span> Export JSON
            </button>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Search by name, email, or team name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <CustomDropdown
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'pending', label: 'Pending' },
                { value: 'rejected', label: 'Rejected' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Status"
            />
          </div>
          
          {/* Registration Type Filter */}
          <div>
            <CustomDropdown
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'RSVP', label: 'RSVP' },
                { value: 'Registration', label: 'Registration' },
                { value: 'Waiting List', label: 'Waiting List' }
              ]}
              value={registrationTypeFilter}
              onChange={setRegistrationTypeFilter}
              placeholder="All Types"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                >
                  User
                  {sortField === 'name' && (
                    <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('registrationType')}
                  className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                >
                  Type
                  {sortField === 'registrationType' && (
                    <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                >
                  Status
                  {sortField === 'status' && (
                    <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('checkedIn')}
                  className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                >
                  Check-in
                  {sortField === 'checkedIn' && (
                    <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                >
                  Registered
                  {sortField === 'registrationDate' && (
                    <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-amber-400 font-semibold">Team/Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover"
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
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRegistrationTypeBadge(user.registrationType)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getCheckInStatus(user.checkedIn)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-white">{format(new Date(user.registrationDate), 'MMM dd, yyyy')}</p>
                      <p className="text-gray-400">{format(new Date(user.registrationDate), 'h:mm a')}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {user.teamName && (
                        <p className="text-white font-medium mb-1">{user.teamName}</p>
                      )}
                      {user.participants && user.participants.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">{user.participants.length} participants</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination or Load More */}
      {filteredAndSortedUsers.length > 0 && (
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Showing {filteredAndSortedUsers.length} of {users?.length || 0} users</span>
            <div className="flex items-center gap-2">
              <span>Sorted by {sortField} ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default RegisteredUsersTable; 