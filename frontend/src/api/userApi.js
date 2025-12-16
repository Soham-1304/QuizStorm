import axiosInstance from './axiosConfig';

/**
 * User/Profile API methods
 */

export const getProfile = async (username) => {
    const response = await axiosInstance.get(`/api/user/profile/${username}`);
    return response;
};

export const getHistory = async () => {
    const response = await axiosInstance.get('/api/user/history');
    return response;
};

export const updateProfile = async (profileData) => {
    const response = await axiosInstance.put('/api/user/profile', profileData);
    return response;
};
