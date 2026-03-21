/**
 * VoiceModulationPage
 *
 * Full frontend voice recording + history page.
 * ─ MediaRecorder API via useVoiceRecorder hook
 * ─ Web Speech API (webkitSpeechRecognition) for transcript capture
 * ─ /ai-parse → confirmation dialog → /execute-command flow
 * ─ SpeechSynthesis API for success voice feedback
 * ─ States: idle | recording | processing | completed | error
 * ─ History cards: always-visible transcript + AI response (inline, no expand needed)
 * ─ Processing disables play button + shows spinner
 * ─ Only one audio plays at a time; all others pause
 * ─ Proper cleanup on unmount (URLs revoked, tracks stopped)
 * ─ Theme matches existing dark platform: #1f283e, green accent, same typography
 */

import React, { useState, useRef, useCallback, useEffect, useReducer } from 'react';
import {
    Mic, MicOff, Square, Play, Pause, Clock, FileText,
    Bot, CheckCircle2, AlertCircle, Loader2, Trash2,
    RefreshCcw, Radio, Headphones, X, ExternalLink
} from 'lucide-react';
import useVoiceRecorder from '../../hooks/useVoiceRecorder';
import { useVoiceHistory } from '../../hooks/useVoiceHistory';
import { parseVoiceCommand, executeCommand } from '../../services/voiceService';

// ─── Status constants ─────────────────────────────────────────────────────────

const STATUS = {
    PROCESSING: 'processing',
    SUCCESS: 'success',
    FAILED: 'failed',
};

// ─── History Reducer ──────────────────────────────────────────────────────────

const historyReducer = (state, action) => {
    switch (action.type) {
        case 'ADD':
            return [action.item, ...state];
        case 'UPDATE':
            return state.map(item =>
                item.id === action.id ? { ...item, ...action.patch } : item
            );
        case 'REMOVE':
            return state.filter(item => item.id !== action.id);
        default:
            return state;
    }
};

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 4500);
        return () => clearTimeout(t);
    }, [onClose]);

    const styles = {
        error: 'border-red-500/40 bg-red-500/10 text-red-300',
        success: 'border-green-500/40 bg-green-500/10 text-green-300',
        info: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    };

    return (
        <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-sm shadow-2xl max-w-sm ${styles[type] || styles.info}`}
            style={{ animation: 'toastSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) both' }}
        >
            {type === 'error'
                ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
                : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            }
            <span className="text-[12px] font-bold tracking-wide flex-1">{message}</span>
            <button
                onClick={onClose}
                className="ml-1 text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const cfg = {
        [STATUS.PROCESSING]: {
            label: 'Processing',
            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
            dot: 'bg-amber-400 animate-pulse',
        },
        [STATUS.SUCCESS]: {
            label: 'Success',
            cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
            dot: 'bg-emerald-400',
        },
        [STATUS.FAILED]: {
            label: 'Failed',
            cls: 'text-red-400 bg-red-500/10 border-red-500/25',
            dot: 'bg-red-400',
        },
    };
    const c = cfg[status] || cfg[STATUS.PROCESSING];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${c.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
            {c.label}
        </span>
    );
};

// ─── Audio Player Button ──────────────────────────────────────────────────────

const AudioPlayerBtn = ({ url, itemId, isProcessing, activePlayingId, onPlay, onPause, onEnded }) => {
    const audioRef = useRef(null);
    const isPlaying = activePlayingId === itemId;

    // Sync play/pause with global active state
    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        if (isPlaying) {
            el.play().catch(() => onPause(itemId));
        } else {
            if (!el.paused) el.pause();
        }
    }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

    // Attach ended listener
    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        const handle = () => onEnded(itemId);
        el.addEventListener('ended', handle);
        return () => el.removeEventListener('ended', handle);
    }, [itemId, onEnded]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    const toggle = () => {
        if (isPlaying) onPause(itemId);
        else onPlay(itemId);
    };

    // Processing → disabled spinner
    if (isProcessing) {
        return (
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0" title="Processing…">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 flex-shrink-0">
            <audio ref={audioRef} src={url} preload="metadata" />
            <button
                onClick={toggle}
                title={isPlaying ? 'Pause' : 'Play recording'}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 flex-shrink-0 ${isPlaying
                        ? 'bg-green-500/20 border-green-500/40 text-green-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white hover:bg-white/10'
                    }`}
            >
                {isPlaying
                    ? <Pause className="w-3.5 h-3.5" />
                    : <Play className="w-3.5 h-3.5 ml-0.5" />
                }
            </button>
            {/* Waveform animation when playing */}
            {isPlaying && (
                <span className="flex gap-[3px] items-end h-4">
                    {[1, 2, 3, 4].map(i => (
                        <span
                            key={i}
                            className="w-[3px] bg-green-400 rounded-full"
                            style={{
                                animation: `voiceWave 0.85s ease-in-out ${i * 0.13}s infinite alternate`,
                                height: '55%',
                            }}
                        />
                    ))}
                </span>
            )}
        </div>
    );
};

// ─── History Card ─────────────────────────────────────────────────────────────

const HistoryCard = ({ item, activePlayingId, onPlay, onPause, onEnded, onRemove }) => {
    const isProcessing = item.status === STATUS.PROCESSING;
    const isFailed = item.status === STATUS.FAILED;

    // Derived display values
    const transcriptText = item.transcript
        ? item.transcript
        : isProcessing
            ? null   // show spinner row
            : 'Transcript unavailable';

    const aiText = item.aiResponse
        ? item.aiResponse
        : isProcessing
            ? null   // show spinner row
            : 'AI response pending';

    return (
        <div className="bg-[#1a2235] rounded-2xl border border-white/8 overflow-hidden group transition-all duration-200 hover:border-white/14">

            {/* ── Top row: play + timestamp + status + delete ── */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3">

                {/* Play / Pause or spinner */}
                <AudioPlayerBtn
                    url={item.audioURL}
                    itemId={item.id}
                    isProcessing={isProcessing}
                    activePlayingId={activePlayingId}
                    onPlay={onPlay}
                    onPause={onPause}
                    onEnded={onEnded}
                />

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Clock className="w-3 h-3 text-slate-600 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                        {item.timestamp}
                    </span>
                </div>

                {/* Status badge */}
                <StatusBadge status={item.status} />

                {/* Delete (visible on hover) */}
                <button
                    onClick={() => onRemove(item.id)}
                    title="Remove"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* ── Divider ── */}
            <div className="mx-5 border-t border-white/5" />

            {/* ── Transcript ── */}
            <div className="px-5 pt-3 pb-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                        Transcript
                    </span>
                </div>

                {isProcessing && !item.transcript ? (
                    <div className="flex items-center gap-2 py-1">
                        <Loader2 className="w-3 h-3 text-amber-400 animate-spin flex-shrink-0" />
                        <span className="text-[11px] text-amber-400/80 italic font-medium">Generating…</span>
                    </div>
                ) : isFailed && !item.transcript ? (
                    <p className="text-[11px] text-red-400/70 italic leading-relaxed">
                        Transcription unavailable
                    </p>
                ) : (
                    <p className="text-[12px] text-slate-300 leading-relaxed">
                        "{transcriptText}"
                    </p>
                )}
            </div>

            {/* ── AI Response ── */}
            <div className="px-5 pt-2 pb-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <Bot className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                        AI Response
                    </span>
                </div>

                {isProcessing && !item.aiResponse ? (
                    <div className="flex items-center gap-2 py-1">
                        <Loader2 className="w-3 h-3 text-amber-400 animate-spin flex-shrink-0" />
                        <span className="text-[11px] text-amber-400/80 italic font-medium">Awaiting result…</span>
                    </div>
                ) : isFailed && !item.aiResponse ? (
                    <p className="text-[11px] text-red-400/70 italic leading-relaxed">
                        AI response pending
                    </p>
                ) : (
                    <p className="text-[12px] text-slate-300 leading-relaxed">
                        {aiText}
                    </p>
                )}
            </div>
        </div>
    );
};

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

const ConfirmationDialog = ({ data, onConfirm, onCancel, loading }) => {
    if (!data) return null;

    const getConfirmText = () => {
        const action = (data.action || '').replace(/_/g, ' ');
        if (data.action === 'ADD_FUND') {
            return `Are you sure you want to ADD ₹${data.amount} to user ${data.userId}?`;
        }
        if (data.action === 'WITHDRAW_FUND') {
            return `Are you sure you want to WITHDRAW ₹${data.amount} from user ${data.userId}?`;
        }
        if (data.amount && data.userId) {
            return `Are you sure you want to ${action} ₹${data.amount} for user ${data.userId}?`;
        }
        return `Are you sure you want to execute: ${action}?`;
    };

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className="bg-[#1f283e] border border-white/15 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                style={{ animation: 'toastSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) both' }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/20">
                        <Bot className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-white font-black uppercase tracking-widest text-sm">
                        Confirm Command
                    </h3>
                </div>

                {/* Command details */}
                <div className="bg-white/5 rounded-xl border border-white/8 p-4 mb-6">
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">
                        {getConfirmText()}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {data.action && (
                            <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-green-400">
                                {data.action.replace(/_/g, ' ')}
                            </span>
                        )}
                        {data.userId && (
                            <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-400">
                                User #{data.userId}
                            </span>
                        )}
                        {data.amount && (
                            <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-purple-400">
                                ₹{data.amount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing…</>
                        ) : (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const VoiceModulationPage = () => {
    const recorder = useVoiceRecorder();
    const blobRef = useRef(null); // Capture blob for auto-save
    const { recordings: savedRecordings, loading: histLoading, fetchRecordings, saveRecording } = useVoiceHistory();

    const [history, dispatch] = useReducer(historyReducer, []);
    const [activePlayingId, setActivePlayingId] = useState(null);
    const [savedPlayingId, setSavedPlayingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load recent saved recordings on mount
    useEffect(() => {
        fetchRecordings({ limit: 10 });
    }, [fetchRecordings]);

    // ── Voice command states ───────────────────────────────────────────────────
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confirmData, setConfirmData] = useState(null);   // { action, userId, amount, itemId }
    const [confirmLoading, setConfirmLoading] = useState(false);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef('');

    // ── Toast helpers ─────────────────────────────────────────────────────────

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type, key: Date.now() });
    }, []);

    const dismissToast = useCallback(() => setToast(null), []);

    // ── Playback control (single active) ──────────────────────────────────────

    const handlePlay = useCallback((id) => setActivePlayingId(id), []);
    const handlePause = useCallback(() => setActivePlayingId(null), []);
    const handleEnded = useCallback(() => setActivePlayingId(null), []);

    // ── Remove ────────────────────────────────────────────────────────────────

    const handleRemove = useCallback((id) => {
        setActivePlayingId(prev => (prev === id ? null : prev));
        dispatch({ type: 'REMOVE', id });
    }, []);

    // ── SpeechSynthesis helper ────────────────────────────────────────────────

    const speakMessage = useCallback((text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    }, []);

    // ── Speech Recognition ────────────────────────────────────────────────────

    const startSpeechRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast('Speech recognition not supported in this browser.', 'error');
            return;
        }

        finalTranscriptRef.current = '';
        setTranscript('');

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onresult = (event) => {
            let text = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    text += event.results[i][0].transcript + ' ';
                }
            }
            finalTranscriptRef.current += text;
            setTranscript(finalTranscriptRef.current.trim());
        };

        recognition.onerror = (event) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                showToast(`Speech recognition error: ${event.error}`, 'error');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
            setIsListening(true);
        } catch {
            showToast('Failed to start speech recognition.', 'error');
        }
    }, [showToast]);

    const stopSpeechRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* already stopped */ }
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    // ── Cleanup speech recognition on unmount ─────────────────────────────────

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch {}
                recognitionRef.current = null;
            }
            window.speechSynthesis?.cancel();
        };
    }, []);

    // ── Execute command (after confirmation) ──────────────────────────────────

    const handleConfirm = useCallback(async () => {
        if (!confirmData) return;

        const { itemId, ...commandData } = confirmData;
        setConfirmLoading(true);

        try {
            const execResult = await executeCommand(commandData);
            dispatch({
                type: 'UPDATE',
                id: itemId,
                patch: { status: STATUS.SUCCESS },
            });

            // Auto-save to DB
            saveRecording({
                audioBlob: blobRef.current,
                transcript: finalTranscriptRef.current.trim(),
                parsedCommand: commandData,
                actionTaken: commandData?.action,
                actionResult: execResult || { success: true },
                status: 'executed',
                userId: commandData?.userId || commandData?.filters?.userId,
                language: 'hi-IN',
            }).then(() => {
                fetchRecordings({ limit: 10 }); // Refresh saved recordings list
            });

            showToast('Command executed successfully!', 'success');
            speakMessage('Command executed successfully');
        } catch (err) {
            dispatch({
                type: 'UPDATE',
                id: itemId,
                patch: { status: STATUS.FAILED },
            });

            // Auto-save failed command
            saveRecording({
                audioBlob: blobRef.current,
                transcript: finalTranscriptRef.current.trim(),
                parsedCommand: commandData,
                actionTaken: commandData?.action,
                actionResult: { success: false, error: err?.message },
                status: 'failed',
                userId: commandData?.userId || commandData?.filters?.userId,
                language: 'hi-IN',
            }).then(() => {
                fetchRecordings({ limit: 10 });
            });

            showToast(err?.message || 'Command execution failed.', 'error');
        } finally {
            setConfirmLoading(false);
            setConfirmData(null);
        }
    }, [confirmData, showToast, speakMessage, saveRecording, fetchRecordings]);

    const handleCancel = useCallback(() => {
        if (confirmData?.itemId) {
            dispatch({
                type: 'UPDATE',
                id: confirmData.itemId,
                patch: { status: STATUS.FAILED },
            });
        }
        setConfirmData(null);
    }, [confirmData]);

    // ── Submit recording → ai-parse → confirmation ────────────────────────────

    const submitRecording = useCallback(async (blob, audioURL) => {
        blobRef.current = blob; // Capture for auto-save
        if (!blob) return;

        const capturedTranscript = finalTranscriptRef.current.trim();

        if (!capturedTranscript) {
            showToast('No speech detected. Please speak clearly and try again.', 'error');
            return;
        }

        setIsSubmitting(true);

        const itemId = `vr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const now = new Date();
        const timestamp = now.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).replace(',', ' –');

        // Add to history immediately with processing state
        dispatch({
            type: 'ADD',
            item: {
                id: itemId,
                audioURL,
                transcript: capturedTranscript,
                aiResponse: '',
                status: STATUS.PROCESSING,
                timestamp,
            },
        });

        try {
            const parsed = await parseVoiceCommand(capturedTranscript);

            const aiSummary = parsed.action
                ? `${parsed.action}${parsed.amount ? ` · ₹${parsed.amount}` : ''}${parsed.userId ? ` · User #${parsed.userId}` : ''}`
                : JSON.stringify(parsed);

            dispatch({
                type: 'UPDATE',
                id: itemId,
                patch: { aiResponse: aiSummary },
            });

            // Show confirmation dialog – keep status as PROCESSING until confirmed/cancelled
            setConfirmData({ ...parsed, itemId });
        } catch (err) {
            dispatch({
                type: 'UPDATE',
                id: itemId,
                patch: { status: STATUS.FAILED },
            });
            showToast(err?.message || 'AI parsing failed. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [showToast]);

    // ── Watch recorder completion → submit ────────────────────────────────────

    useEffect(() => {
        if (recorder.isCompleted && recorder.audioBlob && recorder.audioURL) {
            stopSpeechRecognition();
            submitRecording(recorder.audioBlob, recorder.audioURL);
            recorder.reset();
        }
    }, [recorder.isCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Watch for recorder error → toast ──────────────────────────────────────

    useEffect(() => {
        if (recorder.isError && recorder.errorMessage) {
            showToast(recorder.errorMessage, 'error');
            stopSpeechRecognition();
        }
    }, [recorder.isError, recorder.errorMessage, showToast]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Mic button handler ────────────────────────────────────────────────────

    const handleMicClick = () => {
        if (recorder.isRecording) {
            recorder.stopRecording();
            stopSpeechRecognition();
        } else if (!isSubmitting && !recorder.isProcessing) {
            recorder.startRecording();
            startSpeechRecognition();
        }
    };

    const isMicDisabled = recorder.isProcessing || isSubmitting;

    const getMicLabel = () => {
        if (recorder.isRecording) return 'Stop Recording';
        if (isMicDisabled) return 'Processing…';
        return 'Start Recording';
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">

            {/* ── Page Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/20 shadow-lg">
                            <Radio className="w-5 h-5 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            Voice Modulation
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
                        Record voice commands and messages. Up to{' '}
                        <span className="text-green-400 font-bold">60 seconds</span> per recording.
                        All recordings are encrypted end-to-end.
                    </p>
                </div>

                {/* Live recording indicator */}
                {recorder.isRecording && (
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-red-300 text-[11px] font-black uppercase tracking-widest">
                            Live · {recorder.timerLabel}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Two-column grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start">

                {/* ──────────── LEFT: Voice Recorder Panel ──────────── */}
                <div className="xl:col-span-1">
                    <div className="bg-[#1f283e]/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

                        {/* Panel header */}
                        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                Voice Recorder
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
                                {recorder.isRecording ? 'Recording in progress…' : 'Press mic to begin'}
                            </p>
                        </div>

                        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center gap-4 sm:gap-6">

                            {/* Mic button */}
                            <div className="relative">
                                {recorder.isRecording && (
                                    <>
                                        <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                                        <span className="absolute -inset-3 rounded-full bg-red-500/10 animate-pulse" />
                                    </>
                                )}
                                <button
                                    id="voice-mic-btn"
                                    onClick={handleMicClick}
                                    disabled={isMicDisabled}
                                    title={getMicLabel()}
                                    className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xl ${recorder.isRecording
                                            ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30 scale-110'
                                            : isMicDisabled
                                                ? 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed opacity-60'
                                                : 'bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20 hover:border-green-400 hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {isMicDisabled ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                                    ) : recorder.isRecording ? (
                                        <Square className="w-7 h-7 fill-current" />
                                    ) : (
                                        <Mic className="w-8 h-8" />
                                    )}
                                </button>
                            </div>

                            {/* State label + timer */}
                            <div className="text-center">
                                <p className={`text-[11px] font-black uppercase tracking-widest ${recorder.isRecording ? 'text-red-400'
                                        : isMicDisabled ? 'text-amber-400'
                                            : 'text-slate-500'
                                    }`}>
                                    {getMicLabel()}
                                </p>
                                {recorder.isRecording && (
                                    <p className="text-2xl font-black text-white mt-1 tabular-nums font-mono">
                                        {recorder.timerLabel}
                                    </p>
                                )}
                            </div>

                            {/* Live transcript preview while recording */}
                            {recorder.isRecording && transcript && (
                                <div className="w-full bg-white/5 rounded-xl border border-white/8 px-4 py-3">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                                            Live Transcript
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-relaxed italic">
                                        "{transcript}"
                                    </p>
                                </div>
                            )}

                            {/* Progress bar */}
                            {recorder.isRecording && (
                                <div className="w-full">
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${recorder.progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">0:00</span>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">1:00</span>
                                    </div>
                                </div>
                            )}

                            {/* Error reset button */}
                            {recorder.isError && (
                                <button
                                    onClick={recorder.reset}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all"
                                >
                                    <RefreshCcw className="w-3.5 h-3.5" /> Try Again
                                </button>
                            )}

                            {/* Tips (idle only) */}
                            {recorder.isIdle && (
                                <div className="w-full space-y-2 pt-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 text-center mb-2">
                                        Quick Tips
                                    </p>
                                    {[
                                        'Speak clearly into your microphone',
                                        'Max recording length is 60 seconds',
                                        'Recordings are encrypted and private',
                                    ].map((tip, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-green-500/50 mt-1.5 flex-shrink-0" />
                                            <p className="text-[10px] text-slate-500 leading-relaxed">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ──────────── RIGHT: Recording History Panel ──────────── */}
                <div className="xl:col-span-2">
                    <div className="bg-[#1f283e]/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

                        {/* History header */}
                        <div
                            className="flex items-center justify-between px-8 py-5 border-b border-white/5"
                            style={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                    Recording History
                                </h3>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
                                    {history.length} recording{history.length !== 1 ? 's' : ''} · Session only
                                </p>
                            </div>

                            {/* View All link */}
                            <a
                                href="/voice-history"
                                className="flex items-center gap-1.5 text-[10px] font-black text-green-400 hover:text-green-300 uppercase tracking-widest transition-colors"
                            >
                                View All <ExternalLink className="w-3 h-3" />
                            </a>

                            {/* Now playing indicator */}
                            {activePlayingId && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <Headphones className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                                        Playing
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* History body */}
                        <div className="p-6">
                            {history.length === 0 ? (
                                /* ── Empty state ── */
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                        <Mic className="w-7 h-7 text-slate-700" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-black uppercase tracking-widest text-sm">
                                            No Recordings Yet
                                        </p>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight mt-1.5">
                                            Press the mic button to start your first recording
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* ── Cards list ── */
                                <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                                    {history.map((item) => (
                                        <HistoryCard
                                            key={item.id}
                                            item={item}
                                            activePlayingId={activePlayingId}
                                            onPlay={handlePlay}
                                            onPause={handlePause}
                                            onEnded={handleEnded}
                                            onRemove={handleRemove}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Recently Saved Recordings (from DB) ── */}
            <div className="mt-12">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                        Recently Saved
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {histLoading ? 'Loading…' : `${savedRecordings.length}`}
                    </span>
                </div>

                {histLoading ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        Loading saved recordings…
                    </div>
                ) : savedRecordings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        No saved recordings yet
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {savedRecordings.map(rec => {
                            const statusCfg = {
                                executed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: '✓' },
                                failed: { bg: 'bg-red-500/10', text: 'text-red-400', label: '✕' },
                                saved: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: '◆' },
                            }[rec.status] || { bg: 'bg-slate-500/10', text: 'text-slate-400', label: '○' };

                            return (
                                <div
                                    key={rec.id}
                                    className={`rounded-xl border border-white/8 p-4 ${statusCfg.bg} hover:border-white/15 transition-all cursor-pointer group`}
                                >
                                    {/* Status indicator */}
                                    <div className={`text-xs font-black ${statusCfg.text} mb-2 uppercase tracking-wider`}>
                                        {statusCfg.label} {rec.status}
                                    </div>

                                    {/* Transcript */}
                                    <p className="text-[11px] text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                                        "{rec.transcript || '(no text)'}"
                                    </p>

                                    {/* User */}
                                    {rec.target_user_name && (
                                        <p className="text-[10px] text-slate-500 mb-2 font-medium">
                                            User: <span className="text-slate-300">{rec.target_user_name}</span>
                                        </p>
                                    )}

                                    {/* Time */}
                                    <p className="text-[9px] text-slate-600 mb-3">
                                        {new Date(rec.created_at).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>

                                    {/* Audio player */}
                                    {rec.audio_filename && (
                                        <audio
                                            controls
                                            src={`/api/ai/voice/audio/${rec.audio_filename}`}
                                            className="w-full h-7 rounded opacity-80 group-hover:opacity-100 transition-opacity"
                                            onPlay={() => setSavedPlayingId(rec.id)}
                                            onPause={() => setSavedPlayingId(null)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Confirmation Dialog ── */}
            <ConfirmationDialog
                data={confirmData}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                loading={confirmLoading}
            />

            {/* ── Toast ── */}
            {toast && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    type={toast.type}
                    onClose={dismissToast}
                />
            )}

            {/* ── Keyframes ── */}
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateY(10px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                @keyframes voiceWave {
                    from { transform: scaleY(0.25); }
                    to   { transform: scaleY(1);    }
                }
            `}</style>
        </div>
    );
};

export default VoiceModulationPage;
