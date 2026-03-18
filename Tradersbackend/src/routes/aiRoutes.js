const express = require('express');
const router = express.Router();
const { aiCommand, processVoiceCommand, aiParse, executeVoiceCommand, voiceExecute } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// MAIN AI COMMAND ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/ai-command
// Single unified endpoint: parse text → validate → execute → return result
router.post('/ai-command', authMiddleware, aiCommand);

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY ENDPOINTS (backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/voice-command',  authMiddleware, processVoiceCommand);
router.post('/ai-parse',       authMiddleware, aiParse);
router.post('/execute-command',authMiddleware, executeVoiceCommand);
router.post('/voice-execute',  authMiddleware, voiceExecute);

module.exports = router;
