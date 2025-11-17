import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:3001';

let socket: Socket | null = null;

export function connectSocket() {
  if (socket && socket.connected) return socket;
  const token = localStorage.getItem('token');
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function getSocket() {
  return socket ?? connectSocket();
}

export function disconnectSocket() {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {
      // ignore
    }
    socket = null;
  }
}

export default { connectSocket, getSocket, disconnectSocket };
