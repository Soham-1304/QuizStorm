import axiosInstance from './axiosConfig';

/**
 * Authentication API methods
 */

/**
 * Register a new user
 * @param {string} username - Username
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Promise<{token: string, user: object}>}
 */
export const register = async (username, email, password) => {
    const response = await axiosInstance.post('/api/auth/register', {
        username,
        email,
        password,
    });
    return response;
};

/**
 * Login user
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Promise<{token: string, user: object}>}
 */
export const login = async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
    });
    return response;
};

/**
 * Logout user (client-side)
 * Clears local storage
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
