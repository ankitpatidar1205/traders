/**
 * voiceService – Handles submission of audio recordings and voice commands.
 *
 * If the backend endpoint is unavailable the error is propagated to callers.
 * No sensitive data is logged.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const VOICE_ENDPOINT = `${BASE_URL}/voice/record`;
const AI_PARSE_ENDPOINT = `${BASE_URL}/ai/ai-parse`;
const EXECUTE_COMMAND_ENDPOINT = `${BASE_URL}/ai/execute-command`;
const TIMEOUT_MS = 30_000;

const getToken = () => localStorage.getItem('traders_token') || '';

/**
 * Upload an audio Blob to the backend voice endpoint.
 * Returns { transcript, aiResponse, id } on success.
 */
export const submitVoiceRecording = async (audioBlob, meta = {}) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording_${Date.now()}.webm`);
    formData.append('meta', JSON.stringify(meta));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(VOICE_ENDPOINT, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 401) {
            localStorage.clear();
            window.location.href = '/';
            throw new Error('Session expired. Please login again.');
        }
        if (res.status === 403) throw new Error('Access denied to voice API.');
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Voice submission failed. Please try again.');
        }

        return res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
        }
        throw err;
    }
};

/**
 * Send speech text to /ai-parse and return the parsed command JSON.
 * @param {string} text – Captured speech transcript
 * @returns {Promise<{ action: string, userId: number, amount: number }>}
 */
export const parseVoiceCommand = async (text) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(AI_PARSE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ text }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 401) {
            localStorage.clear();
            window.location.href = '/';
            throw new Error('Session expired. Please login again.');
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'AI parsing failed. Please try again.');
        }

        return res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') throw new Error('AI parse request timed out.');
        throw err;
    }
};

/**
 * Send the parsed command to /execute-command.
 * @param {object} commandData – JSON from /ai-parse
 */
export const executeCommand = async (commandData) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(EXECUTE_COMMAND_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(commandData),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 401) {
            localStorage.clear();
            window.location.href = '/';
            throw new Error('Session expired. Please login again.');
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Command execution failed. Please try again.');
        }

        return res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') throw new Error('Execute command request timed out.');
        throw err;
    }
};
