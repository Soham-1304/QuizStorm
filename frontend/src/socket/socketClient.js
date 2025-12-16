import { io } from 'socket.io-client';

/**
 * Socket.IO client singleton
 * Manages connection lifecycle and authentication
 */
let socket = null;

/**
 * Initialize socket connection with JWT authentication
 * @param {string} token - JWT token for authentication
 * @returns {Socket} Socket instance
 */
export const initSocket = (token) => {
    if (socket && socket.connected) {
        console.log('Socket already connected');
        return socket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000';
    socket = io(socketUrl, {
        auth: {
            token: token, // Note: Backend expects raw token without "Bearer " prefix
        },
        autoConnect: false, // Don't connect automatically
    });

    return socket;
};

/**
 * Connect to socket server
 */
export const connectSocket = () => {
    if (socket && !socket.connected) {
        socket.connect();
    }
};

/**
 * Disconnect from socket server
 */
export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};

/**
 * Get current socket instance
 * @returns {Socket|null} Current socket or null
 */
export const getSocket = () => {
    return socket;
};

/**
 * Check if socket is connected
 * @returns {boolean} Connection status
 */
export const isSocketConnected = () => {
    return socket && socket.connected;
};
