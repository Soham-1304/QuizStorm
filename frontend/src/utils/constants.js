/**
 * Application constants
 */

// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Socket URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
};

// Game status
export const GAME_STATUS = {
    WAITING: 'waiting',
    LIVE: 'live',
    FINISHED: 'finished',
};

// Route paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    LOBBY: '/lobby',
    GAME: '/game/:roomCode',
    RESULTS: '/results/:roomCode',
};
