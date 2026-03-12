const express = require('express');
const router = express.Router();
const { placeOrder, getTrades, getGroupTrades, closeTrade, deleteTrade } = require('../controllers/tradeController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/health', (req, res) => res.json({ status: 'OK', message: 'Trade routes active' }));
router.get('/', authMiddleware, getTrades);
router.get('/group', authMiddleware, getGroupTrades);
router.get('/active', authMiddleware, getGroupTrades); // Alias for group trades
router.get('/closed', authMiddleware, getTrades); // Can reuse getTrades with status=CLOSED
router.post('/place', authMiddleware, placeOrder);
router.put('/:id/close', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN', 'BROKER']), closeTrade);
router.delete('/:id', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), deleteTrade);

module.exports = router;
