import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('⚡ Connected to Vignan CommiAI Real-time Socket Server:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Real-time Socket Disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.debug('Socket connection retry...', err.message);
});
