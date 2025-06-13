// frontend/src/services/socket.js
import io from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL

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

export const joinEventRoom = (eventId) => {
  if (socket) socket.emit('joinEvent', eventId)
}

export const sendFeedback = (eventId, content, emoji, userId) => {
  if (socket) socket.emit('sendFeedback', { eventId, content, emoji, userId })
}

export const subscribeToFeedback = (callback) => {
  if (socket) socket.on('newFeedback', callback)
}

export const unsubscribeFromFeedback = () => {
  if (socket) socket.off('newFeedback')
}