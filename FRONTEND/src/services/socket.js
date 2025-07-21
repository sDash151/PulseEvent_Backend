/*
Example usage in a React component:

import { handleJoinSubeventRoom } from '../services/socket';

const SubeventJoinButton = ({ parentEventId, subeventId }) => (
  <button onClick={() => handleJoinSubeventRoom(parentEventId, subeventId)}>
    Join Subevent
  </button>
);

// Usage:
// <SubeventJoinButton parentEventId={mainEventId} subeventId={subId} />
*/
// Helper for subevent join button: emits joinSubEvent with both eventId and subeventId
// Usage example in a React component:
//   handleJoinSubeventRoom(parentEventId, subeventId)
export const handleJoinSubeventRoom = (parentEventId, subeventId) => {
  joinSubEventRoom(parentEventId, subeventId);
}
// frontend/src/services/socket.js
import io from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'https://pulseevent-backend.onrender.com';

let socket

export const initSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      auth: { token },
    })
  } else {
    // Update token if user changes
    socket.auth = { token }
  }
  return socket
}

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = () => {
  if (socket) socket.disconnect()
}

// Join a mega event room (only eventId)
export const joinMegaEventRoom = (eventId) => {
  if (socket) socket.emit('joinMegaEvent', eventId)
}

// Join a subevent room (requires both eventId and subeventId)
export const joinSubEventRoom = (eventId, subeventId) => {
  if (socket) socket.emit('joinSubEvent', { eventId, subeventId })
}

export const sendFeedback = (eventId, content, emoji, userId, subeventId) => {
  if (socket) socket.emit('sendFeedback', { eventId, subeventId, content, emoji, userId });
}

export const subscribeToFeedback = (callback) => {
  if (socket) socket.on('newFeedback', callback)
}

export const unsubscribeFromFeedback = () => {
  if (socket) socket.off('newFeedback')
}