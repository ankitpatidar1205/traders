const express = require('express');
const router = express.Router();
const { createFund, getFunds } = require('../controllers/fundController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), createFund);
router.get('/', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), getFunds);

module.exports = router;
