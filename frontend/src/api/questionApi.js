import axiosInstance from './axiosConfig';

/**
 * Questions API methods
 */

/**
 * Get random questions
 * @param {number} count - Number of questions to fetch
 * @returns {Promise<{questions: array}>}
 */
export const getRandomQuestions = async (count = 5) => {
    const response = await axiosInstance.get(`/api/questions/random?count=${count}`);
    return response;
};
