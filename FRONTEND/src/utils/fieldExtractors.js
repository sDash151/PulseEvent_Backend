// Utility to extract the best value for a field from multiple possible sources and label variants
export function getBestField(sources, keys, fallback = '-') {
  for (const key of keys) {
    for (const src of sources) {
      if (src && typeof src === 'object' && src[key]) {
        return src[key];
      }
    }
  }
  // Try case-insensitive match
  for (const key of keys) {
    for (const src of sources) {
      if (src && typeof src === 'object') {
        const found = Object.entries(src).find(([k]) => k.toLowerCase() === key.toLowerCase());
        if (found && found[1]) return found[1];
      }
    }
  }
  return fallback;
}

// Extract participant info (name, email, degree, etc.) from a registration entry
export function extractParticipants(entry) {
  const participants = [];
  const participantSources = [];
  // Gather all possible participant arrays/objects
  if (Array.isArray(entry?.participants)) {
    participantSources.push(...entry.participants);
  } else if (entry?.participants && typeof entry.participants === 'object') {
    participantSources.push(...Object.values(entry.participants));
  }
  // Also check responses for participant arrays
  if (entry?.responses && typeof entry.responses === 'object') {
    for (const [label, value] of Object.entries(entry.responses)) {
      if (Array.isArray(value) && label.toLowerCase().includes('participant')) {
        participantSources.push(...value);
      }
    }
  }
  // Fallback: if no participants, treat the user as a single participant
  if (participantSources.length === 0 && entry?.user) {
    participantSources.push(entry.user);
  }
  // Extract fields for each participant
  for (const participant of participantSources) {
    if (typeof participant === 'object' && participant !== null) {
      const details = participant.details || participant || {};
      const responses = entry.responses || {};
      const name = getBestField([details, responses], ['Name', 'name', 'fullName', 'firstName', 'participantName']);
      const email = getBestField([details, responses], ['EMAIL ID', 'Email', 'email']);
      const degree = getBestField([details, responses], ['Degree Name', 'Degree']);
      const college = getBestField([details, responses], ['College Name', 'College']);
      const usn = getBestField([details, responses], ['USN']);
      const gender = getBestField([details, responses], ['Gender']);
      const whatsapp = getBestField([details, responses], ['WhatsApp Number', 'Whats App Number']);
      // Robust team name extraction
      const teamName = getBestField([
        details,
        responses,
        participant,
        entry,
        entry.user || {},
      ], ['Team Name', 'teamName', 'Team', 'Group Name', 'Group']);
      participants.push({ name, email, degree, college, usn, gender, whatsapp, teamName });
    } else if (typeof participant === 'string' && participant.trim()) {
      participants.push({ name: participant.trim(), email: '-', degree: '-', college: '-', usn: '-', gender: '-', whatsapp: '-', teamName: '-' });
    }
  }
  return participants;
} 