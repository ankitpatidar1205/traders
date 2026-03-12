const db = require('../config/db');

const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = `
            SELECT u.*, p.username as parent_username 
            FROM users u 
            LEFT JOIN users p ON u.parent_id = p.id
        `;
        const params = [];

        // If not SUPERADMIN, only show direct subordinates
        if (req.user.role !== 'SUPERADMIN') {
            query += ' WHERE u.parent_id = ?';
            params.push(req.user.id);
        } else {
            query += ' WHERE 1=1'; // Placeholder for consistency
        }

        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const getUserProfile = async (req, res) => {
    try {
        const [userRows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
        const [settingsRows] = await db.execute('SELECT * FROM client_settings WHERE user_id = ?', [req.params.id]);
        
        if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });
        
        res.json({
            profile: userRows[0],
            settings: settingsRows[0] || {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const resetPassword = async (req, res) => {
    const { newPassword } = req.body;
    // Note: Hash this in actual logic
    try {
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [newPassword, req.params.id]);
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const deleteUser = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getUsers, getUserProfile, updateStatus, resetPassword, deleteUser };
