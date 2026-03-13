const express = require('express');
const router = express.Router();
const { login, createUser, updateTransactionPassword, changePassword } = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.post('/create-user', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN', 'BROKER']), createUser);
router.post('/change-transaction-password', authMiddleware, updateTransactionPassword);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
