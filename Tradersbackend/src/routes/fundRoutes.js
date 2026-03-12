const express = require('express');
const router = express.Router();
const { handleTransaction, getLedger } = require('../controllers/fundController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/transaction', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), handleTransaction);
router.get('/ledger', authMiddleware, getLedger);

module.exports = router;
