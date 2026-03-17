const db = require('../config/db');
const { getIo } = require('../config/socket');

// ─── GET notifications for logged-in user ─────────────────────────────────────
const getNotifications = async (req, res) => {
    const userId = req.user.id;
    const role   = req.user.role;

    try {
        // Build WHERE clause based on role
        // A user sees notifications targeted to their role OR to 'ALL' OR to them specifically
        const [rows] = await db.execute(`
            SELECT
                n.*,
                CASE WHEN nr.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_read
            FROM notifications n
            LEFT JOIN notification_reads nr
                ON nr.notification_id = n.id AND nr.user_id = ?
            WHERE
                n.target_role = 'ALL'
                OR n.target_role = ?
                OR n.target_user_id = ?
            ORDER BY n.created_at DESC
            LIMIT 100
        `, [userId, role, userId]);

        res.json(rows);
    } catch (err) {
        console.error('getNotifications:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── MARK single notification as read ────────────────────────────────────────
const markRead = async (req, res) => {
    const userId = req.user.id;
    const { id }  = req.params;

    try {
        await db.execute(
            'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
            [id, userId]
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error('markRead:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── MARK ALL as read for current user ────────────────────────────────────────
const markAllRead = async (req, res) => {
    const userId = req.user.id;
    const role   = req.user.role;

    try {
        await db.execute(`
            INSERT IGNORE INTO notification_reads (notification_id, user_id)
            SELECT n.id, ?
            FROM notifications n
            LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
            WHERE nr.user_id IS NULL
              AND (n.target_role = 'ALL' OR n.target_role = ? OR n.target_user_id = ?)
        `, [userId, userId, role, userId]);

        res.json({ message: 'All marked as read' });
    } catch (err) {
        console.error('markAllRead:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── CREATE notification ──────────────────────────────────────────────────────
const createNotification = async (req, res) => {
    const { title, message, type = 'info', target_role = 'ALL', target_user_id = null } = req.body;
    const createdBy = req.user.id;

    if (!title || !message) {
        return res.status(400).json({ message: 'title and message are required' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO notifications (title, message, type, target_role, target_user_id, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, message, type, target_role, target_user_id || null, createdBy]
        );

        const notifId = result.insertId;

        // Fetch the new notification row to emit
        const [[notif]] = await db.execute(
            'SELECT * FROM notifications WHERE id = ?', [notifId]
        );

        // Emit via socket to the right room
        const io = getIo();
        if (io) {
            if (target_user_id) {
                io.to(`user:${target_user_id}`).emit('notification', { ...notif, is_read: 0 });
            } else if (target_role === 'ALL') {
                io.emit('notification', { ...notif, is_read: 0 });
            } else {
                io.to(`role:${target_role}`).emit('notification', { ...notif, is_read: 0 });
            }
        }

        res.status(201).json({ message: 'Notification sent', id: notifId });
    } catch (err) {
        console.error('createNotification:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── DELETE notification (admin/superadmin only) ──────────────────────────────
const deleteNotification = async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute('DELETE FROM notification_reads WHERE notification_id = ?', [id]);
        await db.execute('DELETE FROM notifications WHERE id = ?', [id]);

        const io = getIo();
        if (io) io.emit('notification_deleted', { id: Number(id) });

        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('deleteNotification:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getNotifications, markRead, markAllRead, createNotification, deleteNotification };
