const db = require('../config/db');

/**
 * Action Ledger - Logs every sensitive admin action
 */
const logAction = async (adminId, actionType, targetTable, description) => {
    try {
        await db.execute(
            'INSERT INTO action_ledger (admin_id, action_type, target_table, description) VALUES (?, ?, ?, ?)',
            [adminId, actionType, targetTable, description]
        );
    } catch (err) {
        console.error('Audit logging failed:', err);
    }
};

const getActionLedger = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT a.*, u.username as admin_name FROM action_ledger a JOIN users u ON a.admin_id = u.id ORDER BY a.timestamp DESC LIMIT 200'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * Global Updation - Batch update segments/limits for all users
 */
const globalBatchUpdate = async (req, res) => {
    const { segment, status, limitUpdate } = req.body;
    // status: OPEN/CLOSE, limitUpdate: { field: value }

    try {
        // This is a high-stakes batch operation
        if (status) {
            await db.execute(`UPDATE client_settings SET ${segment}_enabled = ?`, [status === 'OPEN' ? 1 : 0]);
        }
        
        await logAction(req.user.id, 'BATCH_UPDATE', 'client_settings', `Global ${segment} status set to ${status}`);
        res.json({ message: 'Global update completed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getActionLedger, globalBatchUpdate, logAction };
