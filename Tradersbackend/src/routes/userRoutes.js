const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getUsers, getUserProfile, updateStatus, deleteUser, updatePasswords, resetPassword,
    updateUser, updateClientSettings, getBrokerShares, updateBrokerShares,
    getDocuments, updateDocuments, getUserSegments, updateUserSegments
} = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}-${file.originalname}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// ─── EXISTING ROUTES ─────────────────────────────────
router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUserProfile);
router.put('/:id/status', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), updateStatus);
router.delete('/:id', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), deleteUser);
router.put('/:id/passwords', authMiddleware, updatePasswords);
router.post('/:id/reset-password', authMiddleware, roleMiddleware(['SUPERADMIN', 'ADMIN']), resetPassword);

// ─── NEW ROUTES ───────────────────────────────────────
router.put('/:id', authMiddleware, updateUser);
router.put('/:id/settings', authMiddleware, updateClientSettings);
router.get('/:id/broker-shares', authMiddleware, getBrokerShares);
router.put('/:id/broker-shares', authMiddleware, updateBrokerShares);
router.get('/:id/documents', authMiddleware, getDocuments);
router.put('/:id/documents', authMiddleware, upload.fields([
    { name: 'panScreenshot', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
    { name: 'bankProof', maxCount: 1 }
]), updateDocuments);
router.get('/:id/segments', authMiddleware, getUserSegments);
router.put('/:id/segments', authMiddleware, updateUserSegments);

module.exports = router;
