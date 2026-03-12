/**
 * voiceService – Handles submission of audio recordings to the backend.
 *
 * If the backend endpoint is unavailable the error is propagated to callers.
 * No sensitive data is logged.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';
const VOICE_ENDPOINT = `${BASE_URL}/voice/record`;
const TIMEOUT_MS = 30_000;

/**
 * Upload an audio Blob to the backend voice endpoint.
 * Returns { transcript, aiResponse, id } on success.
 * Throws an Error with a user-friendly message on failure.
 *
 * @param {Blob} audioBlob – WebM audio blob from MediaRecorder
 * @param {Object} meta    – Optional metadata (e.g. timestamp)
 * @returns {Promise<{transcript: string, aiResponse: string, id: string}>}
 */
export const submitVoiceRecording = async (audioBlob, meta = {}) => {
    const token = localStorage.getItem('traders_token') || '';

    const formData = new FormData();
    formData.append('audio', audioBlob, `recording_${Date.now()}.webm`);
    formData.append('meta', JSON.stringify(meta));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(VOICE_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                // Do NOT set Content-Type – browser sets multipart/form-data boundary automatically
            },
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
