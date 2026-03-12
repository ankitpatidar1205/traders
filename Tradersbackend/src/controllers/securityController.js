const db = require('../config/db');

/**
 * Detects "Multi-Account Clusters"
 * Finding different user_ids that have logged in from the same IP address.
 */
const getIpClusters = async (req, res) => {
    try {
        const query = `
            SELECT ip_address, GROUP_CONCAT(DISTINCT u.username) as users, COUNT(DISTINCT l.user_id) as user_count
            FROM ip_logs l
            JOIN users u ON l.user_id = u.id
            GROUP BY ip_address
            HAVING user_count > 1
            ORDER BY user_count DESC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * Tracks IP at the exact moment of trade placement
 * (This is used by the tradeController during order placement)
 */
const getTradeIpAudit = async (req, res) => {
    try {
        const query = `
            SELECT t.id as trade_id, t.symbol, t.trade_ip, u.username, t.entry_time
            FROM trades t
            JOIN users u ON t.user_id = u.id
            WHERE t.trade_ip IS NOT NULL
            ORDER BY t.entry_time DESC
            LIMIT 100
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * Flags risky IPs (Proxy/VPN/Rapid Switching)
 * Logic: If a single user has > 5 different IPs in the last 24 hours.
 */
const getRiskScoring = async (req, res) => {
    try {
        const query = `
            SELECT u.username, COUNT(DISTINCT l.ip_address) as ip_count
            FROM ip_logs l
            JOIN users u ON l.user_id = u.id
            WHERE l.timestamp > NOW() - INTERVAL 1 DAY
            GROUP BY l.user_id
            HAVING ip_count > 3
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * General Login History
 */
const getIpLogins = async (req, res) => {
    try {
        const query = `
            SELECT l.*, u.full_name, u.role
            FROM ip_logins l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.timestamp DESC
            LIMIT 200
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * Deletes a specific login record
 */
const deleteIpLogin = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM ip_logins WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Log entry not found' });
        }
        res.json({ message: 'Log entry deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getIpClusters, getTradeIpAudit, getRiskScoring, getIpLogins, deleteIpLogin };
// Forensic audit control finalized
