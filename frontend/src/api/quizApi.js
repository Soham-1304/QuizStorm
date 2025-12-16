import axiosInstance from './axiosConfig';

/**
 * Quiz API methods
 */

export const getAllQuizzes = async () => {
    const response = await axiosInstance.get('/api/quizzes');
    return response;
};

export const getQuizById = async (id) => {
    const response = await axiosInstance.get(`/api/quizzes/${id}`);
    return response;
};
