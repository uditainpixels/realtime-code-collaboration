import { io } from 'socket.io-client';

export const initSocket = () => {
    const options = {
        forceNew: true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        transports: ['websocket', 'polling'],
    };

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    console.log('Connecting to backend:', backendUrl);
    return io(backendUrl, options);
};