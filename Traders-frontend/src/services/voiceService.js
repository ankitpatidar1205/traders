/**
 * Voice Service – Uses centralized Axios API with automatic token handling
 *
 * Token is attached automatically via interceptors - no manual headers needed!
 */

import * as apiService from './api';

const TIMEOUT_MS = 30_000;

/**
 * Upload an audio Blob to the backend voice endpoint.
 * Token is attached automatically by Axios interceptor
 * @returns { transcript, aiResponse, id } on success
 */
export const submitVoiceRecording = async (audioBlob, meta = {}) => {
    try {
        const result = await Promise.race([
            apiService.submitVoiceRecording(audioBlob, meta),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS)
            )
        ]);
        return result;
    } catch (err) {
        if (err.message === 'Request timed out') {
            throw new Error('Voice submission timed out. Please check your connection and try again.');
        }
        throw err;
    }
};

/**
 * Send speech text to /ai-parse and return the parsed command JSON.
 * Token is attached automatically by Axios interceptor
 * @param {string} text – Captured speech transcript
 * @returns {Promise<{ action: string, userId: number, amount: number }>}
 */
export const parseVoiceCommand = async (text) => {
    try {
        const result = await Promise.race([
            apiService.parseVoiceCommand(text),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS)
            )
        ]);
        return result;
    } catch (err) {
        if (err.message === 'Request timed out') {
            throw new Error('AI parse request timed out.');
        }
        throw err;
    }
};

/**
 * Send the parsed command to /execute-command.
 * Token is attached automatically by Axios interceptor
 * @param {object} commandData – JSON from /ai-parse
 */
export const executeCommand = async (commandData) => {
    try {
        const result = await Promise.race([
            apiService.executeCommand(commandData),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS)
            )
        ]);
        return result;
    } catch (err) {
        if (err.message === 'Request timed out') {
            throw new Error('Execute command request timed out.');
        }
        throw err;
    }
};
