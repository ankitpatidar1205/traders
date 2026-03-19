/**
 * Axios API Instance with Automatic Token Handling
 *
 * Features:
 * - Automatically attaches JWT token to every request
 * - Handles 401 (unauthorized) responses
 * - Redirects to login if token is missing
 * - Logs out user on token expiration
 * - Request/Response logging for debugging
 */

import axios from 'axios';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('[API] Initializing with base URL:', API_BASE_URL);

// ═══════════════════════════════════════════════════════════════════════════
// CREATE AXIOS INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,  // 30 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR
// Automatically attach token to every request
// ═══════════════════════════════════════════════════════════════════════════

api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, {
            hasToken: !!token,
            timestamp: new Date().toISOString()
        });

        // If token exists, attach it to Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] ✅ Token attached to request');
        } else {
            console.log('[API] ⚠️  No token found in localStorage');
        }

        return config;
    },
    (error) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR
// Handle errors, token expiration, and unauthorized access
// ═══════════════════════════════════════════════════════════════════════════

api.interceptors.response.use(
    (response) => {
        // Request successful
        console.log(`[API] ✅ ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        const { response, config } = error;

        console.error('[API] ❌ Error:', {
            status: response?.status,
            method: config?.method?.toUpperCase(),
            url: config?.url,
            message: error.message
        });

        // ─────────────────────────────────────────────────────────────────────
        // ERROR 401: Unauthorized (Token expired or invalid)
        // ─────────────────────────────────────────────────────────────────────

        if (response?.status === 401) {
            console.log('[API] 🔴 401 Unauthorized - Token expired or invalid');

            // Clear stored data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();

            // Show error message
            const errorMessage = response?.data?.message || 'Session expired. Please login again.';
            console.log('[API] Logout message:', errorMessage);

            // Redirect to login
            if (window.location.pathname !== '/login') {
                console.log('[API] 🔄 Redirecting to /login');
                window.location.href = '/login';
            }

            return Promise.reject({
                ...error,
                isAuthError: true,
                message: errorMessage
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // ERROR 403: Forbidden (Permission denied)
        // ─────────────────────────────────────────────────────────────────────

        if (response?.status === 403) {
            console.log('[API] 🔴 403 Forbidden - Access denied');
            return Promise.reject({
                ...error,
                isForbidden: true,
                message: response?.data?.message || 'You do not have permission to access this resource'
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // ERROR 404: Not Found
        // ─────────────────────────────────────────────────────────────────────

        if (response?.status === 404) {
            console.log('[API] 🔴 404 Not Found');
            return Promise.reject({
                ...error,
                isNotFound: true,
                message: response?.data?.message || 'Resource not found'
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // ERROR 500: Server Error
        // ─────────────────────────────────────────────────────────────────────

        if (response?.status >= 500) {
            console.log('[API] 🔴 Server Error');
            return Promise.reject({
                ...error,
                isServerError: true,
                message: response?.data?.message || 'Server error. Please try again later.'
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // ERROR 4xx: Client Error (validation, bad request, etc)
        // ─────────────────────────────────────────────────────────────────────

        if (response?.status >= 400) {
            console.log('[API] 🔴 Client Error');
            return Promise.reject({
                ...error,
                isClientError: true,
                message: response?.data?.message || 'Invalid request'
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // Network Error (no internet, timeout, etc)
        // ─────────────────────────────────────────────────────────────────────

        if (!response) {
            console.log('[API] 🔴 Network Error:', error.message);
            return Promise.reject({
                ...error,
                isNetworkError: true,
                message: error.message || 'Network error. Check your connection.'
            });
        }

        // Unknown error
        return Promise.reject(error);
    }
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Set token and save to localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        console.log('[API] ✅ Token saved to localStorage');
    }
};

/**
 * Get token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('[API] Token retrieved:', token ? '✅ Found' : '❌ Not found');
    return token;
};

/**
 * Clear token and logout
 */
export const clearToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    console.log('[API] ✅ Token cleared - User logged out');
};

/**
 * Check if user is authenticated
 * @returns {boolean} true if token exists
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default api;
