import axiosInstance from './axiosConfig';

/**
 * Game API methods
 */

/**
 * Create a new game room
 * @returns {Promise<{roomCode: string, hostId: string, players: array, status: string}>}
 */
export const createRoom = async (roomData = {}) => {
    const response = await axiosInstance.post('/api/game/create', roomData);
    return response;
};

/**
 * Join an existing game room
 * @param {string} roomCode - Room code to join
 * @returns {Promise<{roomCode: string, hostId: string, players: array, status: string}>}
 */
export const joinRoom = async (roomCode) => {
    const response = await axiosInstance.post('/api/game/join', {
        roomCode,
    });
    return response;
};

/**
 * Get room details
 * @param {string} roomCode - Room code
 * @returns {Promise<{roomCode: string, hostId: string, players: array, status: string}>}
 */
export const getRoom = async (roomCode) => {
    const response = await axiosInstance.get(`/api/game/${roomCode}`);
    return response;
};
