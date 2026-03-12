const express = require('express');
const router = express.Router();
const { getUsers, getUserProfile, updateStatus, deleteUser } = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUserProfile);
router.put('/:id/status', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), updateStatus);
router.delete('/:id', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), deleteUser);

module.exports = router;
