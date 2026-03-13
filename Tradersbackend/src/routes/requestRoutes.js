const express = require('express');
const router = express.Router();
const { getRequests, updateRequestStatus } = require('../controllers/requestController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), getRequests);
router.put('/:id', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), updateRequestStatus);

module.exports = router;
