const express = require('express');
const router = express.Router();
const {
    smartCommand,
    parseOnly,
    getSchema,
    aiCommand,
    processVoiceCommand,
    aiParse,
    executeVoiceCommand,
    voiceExecute,
} = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// NEW SMART AI ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/smart-command — Main AI endpoint (parse + generate + execute)
router.post('/smart-command', authMiddleware, smartCommand);

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
