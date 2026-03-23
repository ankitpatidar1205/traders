const express = require('express');
const router = express.Router();
const {
    smartCommand,
    masterCommand,
    parseOnly,
    getSchema,
    aiCommand,
    processVoiceCommand,
    aiParse,
    executeVoiceCommand,
    voiceExecute,
    chatWithAI,
    transcribeVoice,
} = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// ─────────────────────────────────────────────────────────────────────────────
// NEW SMART AI ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/smart-command — Main AI endpoint (parse + generate + execute)
router.post('/smart-command', authMiddleware, smartCommand);

// POST /api/ai/master-command — Advanced: Master AI brain (single OpenAI call)
router.post('/master-command', authMiddleware, masterCommand);

// POST /api/ai/chat — General chat with AI (conversational, not command execution)
router.post('/chat', authMiddleware, chatWithAI);

// POST /api/ai/transcribe-voice — Convert voice audio to text using Whisper API
router.post('/transcribe-voice', authMiddleware, upload.single('audio'), transcribeVoice);

// POST /api/ai/parse-only — Parse without executing (for preview/confirmation)
router.post('/parse-only', authMiddleware, parseOnly);

// GET /api/ai/schema — Get database schema summary
router.get('/schema', authMiddleware, getSchema);

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY ENDPOINTS (backward compatibility — all still work)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/ai-command — Now routes through smart system with legacy fallback
router.post('/ai-command', authMiddleware, aiCommand);

router.post('/voice-command',   authMiddleware, processVoiceCommand);
router.post('/ai-parse',        authMiddleware, aiParse);
router.post('/execute-command',  authMiddleware, executeVoiceCommand);
router.post('/voice-execute',    authMiddleware, voiceExecute);

module.exports = router;
