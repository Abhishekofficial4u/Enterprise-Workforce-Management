import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
    if (socket) return socket;

    const token = localStorage.getItem('userToken');
    if (!token) return null;

    // Use production backend or local depending on env. For simplicity, fallback to onrender
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'https://enterprise-workforce-management.onrender.com';

    let decoded = null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        decoded = JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to parse token');
    }

    socket = io(SOCKET_URL, {
        auth: {
            token
        },
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        if (decoded && decoded.id) {
            socket.emit('register', decoded.id);
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) return connectSocket();
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
