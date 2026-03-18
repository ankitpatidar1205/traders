const express = require('express');
const router = express.Router();
const { processVoiceCommand, aiParse, executeVoiceCommand } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

// Legacy
router.post('/voice-command', authMiddleware, processVoiceCommand);

// Voice modulation AI routes
router.post('/ai-parse', authMiddleware, aiParse);
router.post('/execute-command', authMiddleware, executeVoiceCommand);

module.exports = router;
