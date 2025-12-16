import axios from 'axios';

/**
 * Axios instance with base configuration
 * Automatically adds JWT token to requests
 * Handles response errors globally
 */
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add JWT token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response.data; // Return only the data part
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (status === 403) {
                console.error('Forbidden:', data.message);
            } else if (status === 500) {
                console.error('Server error:', data.message);
            }

            return Promise.reject(error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error('Network error - no response from server');
            return Promise.reject({
                message: 'Network error. Please check your internet connection.',
            });
        } else {
            // Something else happened
            console.error('Request error:', error.message);
            return Promise.reject({ message: error.message });
        }
    }
);

export default axiosInstance;
