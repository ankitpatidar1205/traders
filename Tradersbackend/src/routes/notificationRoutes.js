const express = require('express');
const router  = express.Router();
const { authMiddleware: authenticate } = require('../middleware/auth');
const {
    getNotifications,
    markRead,
    markAllRead,
    createNotification,
    deleteNotification,
} = require('../controllers/notificationController');

router.get ('/',          authenticate, getNotifications);
router.put ('/read-all',  authenticate, markAllRead);
router.put ('/:id/read',  authenticate, markRead);
router.post('/',          authenticate, createNotification);
router.delete('/:id',     authenticate, deleteNotification);

module.exports = router;
