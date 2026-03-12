const express = require('express');
const router = express.Router();
const { getRequests, approveRequest } = require('../controllers/requestController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), getRequests);
router.post('/approve', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), approveRequest);

module.exports = router;
