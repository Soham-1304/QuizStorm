import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as authApi from '../api/authApi';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Authentication Context
 * Manages user authentication state and methods
 */
const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    /**
     * Register new user
     */
    const register = async (username, email, password) => {
        try {
            const response = await authApi.register(username, email, password);

            // Store token and user
            localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

            setToken(response.token);
            setUser(response.user);

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            // Extract meaningful message from backend response
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed';
            return {
                success: false,
                error: msg,
            };
        }
    };

    /**
     * Login user
     */
    const login = async (email, password) => {
        try {
            const response = await authApi.login(email, password);

            // Store token and user
            localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

            setToken(response.token);
            setUser(response.user);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
            return {
                success: false,
                error: msg,
            };
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        authApi.logout();
        setToken(null);
        setUser(null);
    };

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: !!token,
            loading,
            register,
            login,
            logout,
        }),
        [user, token, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
