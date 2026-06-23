import { io } from 'socket.io-client';

// Use same host if served together, otherwise point to local backend
const URL = import.meta.env.PROD ? undefined : 'http://localhost:3000';
export const socket = io(URL, { autoConnect: false, transports: ['websocket'] });
