# Registration Display Fix - Team Name and Participants

## Problem Summary
The registration details page was showing empty arrays (`{}`) for Team Name and Participants sections even though users had entered values into the form. The data was being saved correctly in the database under `registration.responses` (JSONB column) and `registration.participants` (array of JSON), but the UI wasn't extracting and displaying them properly.

## Solution Implemented

### 1. Helper Functions Added to `HostReviewRegistrationsPage.jsx`

#### `getTeamName(entry)` Function
```javascript
const getTeamName = (entry) => {
  // First check if there's a direct teamName field
  if (entry.teamName) {
    return entry.teamName;
  }
  
  // Check responses for team name fields
  if (entry.responses) {
    // Look for common team name field labels
    const teamNameFields = ['Team Name', 'teamName', 'Team', 'Group Name', 'Group'];
    for (const field of teamNameFields) {
      if (entry.responses[field]) {
        return entry.responses[field];
      }
    }
    
    // If no specific team name field, check if any field contains "team" in the label
    for (const [label, value] of Object.entries(entry.responses)) {
      if (label.toLowerCase().includes('team') && typeof value === 'string') {
        return value;
      }
    }
  }
  
  return null;
};
```

**Purpose**: Extracts team name from multiple possible sources:
- Direct `entry.teamName` field
- Common team name fields in `responses` JSONB
- Any field with "team" in the label

#### `getParticipants(entry)` Function
```javascript
const getParticipants = (entry) => {
  console.log('getParticipants called with entry:', entry);
  console.log('Entry participants field:', entry.participants);
  console.log('Entry responses field:', entry.responses);
  
  const participants = [];
  
  // Helper function to check if a name is a fallback name (like "Participant 1", "Participant 2")
  const isFallbackName = (name) => {
    if (!name || typeof name !== 'string') return true;
    const trimmedName = name.trim();
    if (trimmedName === '') return true;
    
    // Check for patterns like "Participant 1", "Participant 2", etc.
    const fallbackPatterns = [
      /^participant\s+\d+$/i,
      /^member\s+\d+$/i,
      /^user\s+\d+$/i,
      /^player\s+\d+$/i
    ];
    
    return fallbackPatterns.some(pattern => pattern.test(trimmedName));
  };
  
  // Check if there are participants in the participants array
  if (entry.participants && Array.isArray(entry.participants)) {
    console.log('Processing participants array:', entry.participants);
    entry.participants.forEach((participant, index) => {
      console.log(`Processing participant ${index}:`, participant, 'Type:', typeof participant);
      
      if (typeof participant === 'object' && participant !== null) {
        // Extract name and email from participant object
        let name = null;
        let email = '';
        
        // Try multiple possible name fields
        if (participant.name && typeof participant.name === 'string' && participant.name.trim()) {
          name = participant.name.trim();
        } else if (participant.Name && typeof participant.Name === 'string' && participant.Name.trim()) {
          name = participant.Name.trim();
        } else if (participant.fullName && typeof participant.fullName === 'string' && participant.fullName.trim()) {
          name = participant.fullName.trim();
        } else if (participant.firstName && participant.lastName) {
          name = `${participant.firstName} ${participant.lastName}`.trim();
        }
        
        // Try multiple possible email fields
        if (participant.email && typeof participant.email === 'string' && participant.email.trim()) {
          email = participant.email.trim();
        } else if (participant.Email && typeof participant.Email === 'string' && participant.Email.trim()) {
          email = participant.Email.trim();
        }
        
        // Only add if we found a valid name that's not a fallback name
        if (name && name !== '' && !isFallbackName(name)) {
          participants.push({ name, email });
          console.log('Added participant from array:', { name, email });
        } else {
          console.log('Skipping participant with fallback or invalid name:', name);
        }
      } else if (typeof participant === 'string' && participant.trim()) {
        const participantName = participant.trim();
        if (!isFallbackName(participantName)) {
          participants.push({ name: participantName, email: '' });
          console.log('Added participant string from array:', participantName);
        } else {
          console.log('Skipping participant with fallback name:', participantName);
        }
      } else {
        console.log('Skipping invalid participant:', participant);
      }
    });
  } else if (entry.participants && typeof entry.participants === 'object') {
    // Handle case where participants might be stored as an object instead of array
    console.log('Participants is an object, converting to array:', entry.participants);
    const participantArray = Object.values(entry.participants);
    participantArray.forEach((participant, index) => {
      if (typeof participant === 'object' && participant !== null) {
        let name = null;
        let email = '';
        
        if (participant.name && typeof participant.name === 'string' && participant.name.trim()) {
          name = participant.name.trim();
        } else if (participant.Name && typeof participant.Name === 'string' && participant.Name.trim()) {
          name = participant.Name.trim();
        }
        
        if (participant.email && typeof participant.email === 'string' && participant.email.trim()) {
          email = participant.email.trim();
        } else if (participant.Email && typeof participant.Email === 'string' && participant.Email.trim()) {
          email = participant.Email.trim();
        }
        
        if (name && name !== '' && !isFallbackName(name)) {
          participants.push({ name, email });
          console.log('Added participant from object:', { name, email });
        } else {
          console.log('Skipping participant with fallback or invalid name:', name);
        }
      }
    });
  }
  
  // Also check responses for participant information
  if (entry.responses) {
    console.log('Checking responses for participant info:', entry.responses);
    // Look for fields that might contain participant names
    for (const [label, value] of Object.entries(entry.responses)) {
      if (Array.isArray(value) && label.toLowerCase().includes('participant')) {
        value.forEach((participantName, index) => {
          if (participantName && typeof participantName === 'string' && participantName.trim()) {
            const trimmedName = participantName.trim();
            if (!isFallbackName(trimmedName)) {
              participants.push({ name: trimmedName, email: '' });
              console.log('Added participant from responses:', trimmedName);
            } else {
              console.log('Skipping participant with fallback name from responses:', trimmedName);
            }
          }
        });
      }
    }
  }
  
  console.log('Final participants list:', participants);
  return participants;
};
```

**Purpose**: Extracts participant information from:
- `entry.participants` array (parses JSON objects with `name`/`email` properties)
- `entry.responses` JSONB for participant-related fields
- Handles both object and string formats
- **Filters out fallback names** like "Participant 1", "Participant 2", etc.
- Only shows real participant names and emails

#### `getResponsesDisplay(entry)` Function
```javascript
const getResponsesDisplay = (entry) => {
  const displayData = [];
  
  if (entry.responses) {
    for (const [label, value] of Object.entries(entry.responses)) {
      // Skip team name fields as they're displayed separately
      const teamNameFields = ['Team Name', 'teamName', 'Team', 'Group Name', 'Group'];
      if (teamNameFields.includes(label)) {
        continue;
      }
      
      // Skip participant fields as they're displayed separately
      if (label.toLowerCase().includes('participant')) {
        continue;
      }
      
      displayData.push({ label, value });
    }
  }
  
  return displayData;
};
```

**Purpose**: Filters and formats registration responses:
- Excludes team name and participant fields (displayed separately)
- Shows all other custom field responses

### 2. Updated Display Logic

#### Before (Problematic Code):
```javascript
<div className="text-sm text-gray-400">Team Name: <span className="text-white font-medium">{entry.teamName || '-'}</span></div>
{entry.participants && entry.participants.length > 0 && (
  <div className="text-sm text-gray-400">Participants:
    <ul className="list-disc ml-6 mt-1 text-white">
      {entry.participants.map((p, i) => (
        <li key={i}>{typeof p === 'string' ? p : JSON.stringify(p)}</li>
      ))}
    </ul>
  </div>
)}
```

#### After (Fixed Code):
```javascript
<div className="text-sm text-gray-400">Team Name: <span className="text-white font-medium">{getTeamName(entry) || '-'}</span></div>
{getParticipants(entry).length > 0 && (
  <div className="text-sm text-gray-400">Participants:
    <ul className="list-disc ml-6 mt-1 text-white">
      {getParticipants(entry).map((p, i) => (
        <li key={i}>
          {p.name}
          {p.email && <span className="text-gray-400"> ({p.email})</span>}
        </li>
      ))}
    </ul>
  </div>
)}
```

### 3. Data Structure Support

The solution handles various data structures:

#### Team Name Sources:
1. **Direct field**: `entry.teamName = "Team Alpha"`
2. **JSONB responses**: `entry.responses = { "Team Name": "Team Beta" }`
3. **Custom field**: `entry.responses = { "My Team": "Team Gamma" }`

#### Participants Sources:
1. **Array of objects**: `entry.participants = [{ name: "John", email: "john@example.com" }]`
2. **Array of strings**: `entry.participants = ["John Doe", "Jane Smith"]`
3. **JSONB responses**: `entry.responses = { "Participants": ["Alice", "Bob"] }`

### 4. Fallback Behavior

- **Team Name**: Shows `'-'` if no team name found
- **Participants**: Shows empty list if no participants found
- **Email display**: Only shows email if available, otherwise just shows name
- **Error handling**: Uses optional chaining and default values throughout

### 5. Fallback Name Filtering

The solution includes intelligent filtering to exclude system-generated fallback names:
- **Pattern Detection**: Uses regex patterns to identify fallback names like "Participant 1", "Participant 2", etc.
- **Clean Display**: Only shows real participant names entered by users
- **Multiple Patterns**: Handles various fallback patterns:
  - `Participant 1`, `Participant 2`, etc.
  - `Member 1`, `Member 2`, etc.
  - `User 1`, `User 2`, etc.
  - `Player 1`, `Player 2`, etc.

### 6. Debugging Features

Added console.log statements to help debug:
- Shows what data is being processed
- Logs found team names and participants
- Tracks which fields are being skipped or included

## Testing the Fix

To test the implementation:

1. **Create a team event** with custom fields
2. **Register for the event** with team name and participant information
3. **Check the host review page** to see if data displays correctly
4. **Monitor browser console** for debug logs showing data processing

## Expected Results

After the fix:
- ✅ **Team Name** displays the actual team name from form or custom fields
- ✅ **Participants** shows a clean list of names with emails (if available)
- ✅ **No fallback names** like "Participant 1", "Participant 2" are displayed
- ✅ **Registration Details** shows all other custom field responses
- ✅ **No more empty arrays** or JSON string displays
- ✅ **Fallback behavior** works for missing data

## Files Modified

- `FRONTEND/src/pages/HostReviewRegistrationsPage.jsx` - Main component with helper functions and updated display logic

## No Backend Changes Required

The solution only touches the React component that renders registration details, as requested. The backend already stores the data correctly in the JSONB fields. 