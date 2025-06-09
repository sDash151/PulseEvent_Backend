// frontend/src/services/socket.js
import io from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL

let socket

export const initSocket = () => {
  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
  })
  return socket
}

export const connectSocket = (token) => {
  if (socket) {
    socket.auth = { token }
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