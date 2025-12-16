import axiosInstance from './axiosConfig';

/**
 * Admin API methods
 */

export const getStats = async () => {
    const response = await axiosInstance.get('/api/admin/stats');
    return response;
};

export const getQuestions = async () => {
    const response = await axiosInstance.get('/api/admin/questions');
    return response;
};

export const addQuestion = async (questionData) => {
    const response = await axiosInstance.post('/api/admin/questions', questionData);
    return response;
};

export const deleteQuestion = async (id) => {
    const response = await axiosInstance.delete(`/api/admin/questions/${id}`);
    return response;
};

export const resetRoom = async (roomCode) => {
    const response = await axiosInstance.post(`/api/admin/reset-game/${roomCode}`);
    return response;
};
