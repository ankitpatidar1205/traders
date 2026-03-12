const express = require('express');
const router = express.Router();
const { processVoiceCommand } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

router.post('/voice-command', authMiddleware, processVoiceCommand);

module.exports = router;
