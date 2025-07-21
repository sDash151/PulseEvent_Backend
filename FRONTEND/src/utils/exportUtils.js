// Utility functions for exporting data

// Helper function to safely format CSV values
const formatCSVValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains special characters
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Helper function to get best field value from multiple sources
const getBestField = (details, responses, keys) => {
  for (const key of keys) {
    if (details && details[key]) return details[key];
    if (responses && responses[key]) return responses[key];
  }
  return '';
};

// Enhanced CSV export with complete participant data
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Comprehensive CSV export with all participant data
  const csvRows = [];
  
  // Enhanced headers for comprehensive data
  const headers = [
    'Registration ID',
    'User ID',
    'User Name',
    'User Email',
    'Registration Type',
    'Status',
    'Registration Date',
    'Registration Time',
    'Check-in Status',
    'Check-in Date',
    'Member Since',
    'Avatar URL',
    'Payment Proof',
    'Team Name',
    'Total Participants',
    'Participant Type',
    'Participant Number',
    'Participant Name',
    'Participant Email',
    'Participant USN',
    'Participant Gender',
    'Participant College',
    'Participant Degree',
    'Participant WhatsApp',
    'All Registration Responses',
    'All Participant Details'
  ];
  
  csvRows.push(headers.map(formatCSVValue).join(','));

  // Process each user
  data.forEach(user => {
    const baseUserData = [
      user.id,
      user.id,
      user.name || '',
      user.email || '',
      user.registrationType || '',
      user.status || '',
      user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('en-US') : '',
      user.registrationDate ? new Date(user.registrationDate).toLocaleTimeString('en-US') : '',
      user.checkedIn ? 'Yes' : 'No',
      user.checkInDate ? new Date(user.checkInDate).toLocaleString('en-US') : '',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : '',
      user.avatar || '',
      user.paymentProof || '',
      user.teamName || '',
      user.participants?.length || 0
    ];

    // Format all registration responses as a readable string
    const allResponses = user.responses ? 
      Object.entries(user.responses).map(([key, value]) => `${key}: ${value}`).join('; ') : '';

    // If user has participants (team event), create a row for each participant
    if (user.participants && user.participants.length > 0) {
      user.participants.forEach((participant, index) => {
        const details = participant.details || {};
        const responses = user.responses || {};
        
        // Extract participant information using the same logic as the modal
        const participantName = getBestField(details, responses, ['Name', 'name']);
        const participantEmail = getBestField(details, responses, ['EMAIL ID', 'Email', 'email']);
        const participantUSN = getBestField(details, responses, ['USN']);
        const participantGender = getBestField(details, responses, ['Gender']);
        const participantCollege = getBestField(details, responses, ['College Name', 'College']);
        const participantDegree = getBestField(details, responses, ['Degree Name', 'Degree']);
        const participantWhatsApp = getBestField(details, responses, ['WhatsApp Number', 'Whats App Number']);
        
        // Format all participant details as a readable string
        const allParticipantDetails = details ? 
          Object.entries(details).map(([key, value]) => `${key}: ${value}`).join('; ') : '';

        const participantRow = [
          ...baseUserData,
          'Team Member',
          index + 1,
          participantName,
          participantEmail,
          participantUSN,
          participantGender,
          participantCollege,
          participantDegree,
          participantWhatsApp,
          allResponses,
          allParticipantDetails
        ];
        
        csvRows.push(participantRow.map(formatCSVValue).join(','));
      });
    } else {
      // Individual registration - single row with user data
      const individualRow = [
        ...baseUserData,
        'Individual',
        1,
        user.name || '',
        user.email || '',
        '', // USN
        '', // Gender
        '', // College
        '', // Degree
        '', // WhatsApp
        allResponses,
        '' // No participant details for individual registration
      ];
      
      csvRows.push(individualRow.map(formatCSVValue).join(','));
    }
  });

  // Create and download file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data, filename = 'export.json') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Calculate summary statistics
  const totalUsers = data.length;
  const totalParticipants = data.reduce((sum, user) => sum + (user.participants?.length || 0), 0);
  const registrationTypes = {
    RSVP: data.filter(u => u.registrationType === 'RSVP').length,
    Registration: data.filter(u => u.registrationType === 'Registration').length,
    'Waiting List': data.filter(u => u.registrationType === 'Waiting List').length
  };
  const statusCounts = {
    confirmed: data.filter(u => u.status === 'confirmed').length,
    pending: data.filter(u => u.status === 'pending').length,
    rejected: data.filter(u => u.status === 'rejected').length
  };

  // Prepare comprehensive data for export
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      exportedBy: 'EventPulse Analytics',
      description: 'Complete event registration data with all participant details',
      version: '2.0'
    },
    summary: {
      totalUsers,
      totalParticipants,
      totalIndividualRegistrations: data.filter(u => !u.participants || u.participants.length === 0).length,
      totalTeamRegistrations: data.filter(u => u.participants && u.participants.length > 0).length,
      registrationTypes,
      statusCounts,
      checkedInUsers: data.filter(u => u.checkedIn).length
    },
    registrations: data.map(user => ({
      // User basic info
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatar,
      memberSince: user.createdAt,
      
      // Registration info
      registrationType: user.registrationType,
      registrationStatus: user.status,
      registrationDate: user.registrationDate,
      registrationResponses: user.responses || {},
      
      // Check-in info
      checkedIn: user.checkedIn,
      checkInDate: user.checkInDate,
      
      // Team info
      teamName: user.teamName,
      isTeamEvent: user.participants && user.participants.length > 0,
      participantCount: user.participants?.length || 0,
      
      // Payment info
      paymentProof: user.paymentProof,
      
      // Detailed participants (for team events)
      participants: user.participants ? user.participants.map((participant, index) => ({
        participantNumber: index + 1,
        details: participant.details || {},
        // Extract common fields for easy access
        name: getBestField(participant.details || {}, user.responses || {}, ['Name', 'name']),
        email: getBestField(participant.details || {}, user.responses || {}, ['EMAIL ID', 'Email', 'email']),
        usn: getBestField(participant.details || {}, user.responses || {}, ['USN']),
        gender: getBestField(participant.details || {}, user.responses || {}, ['Gender']),
        college: getBestField(participant.details || {}, user.responses || {}, ['College Name', 'College']),
        degree: getBestField(participant.details || {}, user.responses || {}, ['Degree Name', 'Degree']),
        whatsapp: getBestField(participant.details || {}, user.responses || {}, ['WhatsApp Number', 'Whats App Number'])
      })) : []
    }))
  };

  // Create and download file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json;charset=utf-8;' 
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateUserReport = (users) => {
  if (!users || users.length === 0) {
    return {
      totalUsers: 0,
      statistics: {},
      summary: 'No user data available'
    };
  }

  const totalUsers = users.length;
  const rsvpUsers = users.filter(u => u.registrationType === 'RSVP').length;
  const registrationUsers = users.filter(u => u.registrationType === 'Registration').length;
  const waitingListUsers = users.filter(u => u.registrationType === 'Waiting List').length;
  
  const confirmedUsers = users.filter(u => u.status === 'confirmed').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const rejectedUsers = users.filter(u => u.status === 'rejected').length;
  
  const checkedInUsers = users.filter(u => u.checkedIn).length;
  const teamEvents = users.filter(u => u.teamName).length;
  const totalParticipants = users.reduce((sum, user) => sum + (user.participants?.length || 0), 0);

  return {
    totalUsers,
    statistics: {
      registrationTypes: {
        rsvp: rsvpUsers,
        registration: registrationUsers,
        waitingList: waitingListUsers
      },
      status: {
        confirmed: confirmedUsers,
        pending: pendingUsers,
        rejected: rejectedUsers
      },
      checkIn: {
        checkedIn: checkedInUsers,
        notCheckedIn: totalUsers - checkedInUsers
      },
      teams: {
        teamEvents,
        totalParticipants
      }
    },
    summary: `Total: ${totalUsers} users | Checked in: ${checkedInUsers} | Teams: ${teamEvents} | Pending: ${pendingUsers}`
  };
};

export const formatDateForExport = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 