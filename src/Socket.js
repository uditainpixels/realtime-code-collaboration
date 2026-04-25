import { io } from 'socket.io-client';

export const initSocket = () => {
    const options = {
        forceNew: true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        transports: ['polling', 'websocket'], // Use polling first for better compatibility
    };

    // If we are in production, use the same origin where the app is hosted.
    // Otherwise fallback to VITE_BACKEND_URL or localhost for local development.
    const backendUrl = import.meta.env.PROD ? "" : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    console.log('Connecting to backend:', backendUrl || window.location.origin);
    return io(backendUrl, options);
};