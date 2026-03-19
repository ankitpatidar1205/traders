/**
 * useVoiceSearch Hook
 *
 * Uses browser's Web Speech API to record voice, transcribe it,
 * and return the transcript for search.
 * Supports both Hindi and English.
 */

import { useState, useRef, useCallback } from 'react';

export const useVoiceSearch = ({ onTranscript }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Voice search is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        setError(null);

        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN';          // Hindi + English mixed
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(true);
            console.log('[VoiceSearch] 🎙️ Listening started');
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log('[VoiceSearch] 🛑 Listening stopped');
        };

        recognition.onerror = (e) => {
            setIsListening(false);
            if (e.error === 'no-speech') {
                setError('No speech detected. Please try again.');
            } else if (e.error === 'not-allowed') {
                setError('Microphone access denied. Please allow mic permission.');
            } else {
                setError(`Voice error: ${e.error}`);
            }
            console.error('[VoiceSearch] Error:', e.error);
        };

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            console.log('[VoiceSearch] ✅ Transcript:', transcript);
            onTranscript(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [onTranscript]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { isListening, error, isSupported, startListening, stopListening, clearError };
};

export default useVoiceSearch;
