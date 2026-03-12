/**
 * Mobile App Configuration
 * Centralized settings for API and Sockets
 */

// For local development with Expo, use your machine's IP address
// If using Tunnel, you can set it to the tunnel URL
const SERVER_IP = 'localhost'; // Change this to your local IP
const PORT = '5000';

export const BASE_URL = `http://${SERVER_IP}:${PORT}/api`;
export const SOCKET_URL = `http://${SERVER_IP}:${PORT}`;

export default {
    BASE_URL,
    SOCKET_URL,
    TIMEOUT: 10000,
};
