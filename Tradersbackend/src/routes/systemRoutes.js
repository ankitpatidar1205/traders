const express = require('express');
const router = express.Router();
const { getActionLedger, globalBatchUpdate } = require('../controllers/systemController');
const { getAllScrips, updateScrip, getTickers, updateTicker } = require('../controllers/scripController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/audit-log', authMiddleware, roleMiddleware(['SUPERADMIN']), getActionLedger);
router.post('/global-update', authMiddleware, roleMiddleware(['SUPERADMIN']), globalBatchUpdate);

// Scrip & Ticker Management
router.get('/scrips', authMiddleware, getAllScrips);
router.put('/scrips', authMiddleware, roleMiddleware(['SUPERADMIN']), updateScrip);
router.get('/tickers', authMiddleware, getTickers);
router.put('/tickers/:id', authMiddleware, roleMiddleware(['SUPERADMIN']), updateTicker);

module.exports = router;
