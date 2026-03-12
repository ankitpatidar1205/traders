const db = require('../config/db');
const { logAction } = require('./systemController');

const getRequests = async (req, res) => {
    const { type, status } = req.query; // type: DEPOSIT/WITHDRAW, status: PENDING
    try {
        let query = 'SELECT r.*, u.username FROM payment_requests r JOIN users u ON r.user_id = u.id';
        const params = [];

        if (type || status) {
            query += ' WHERE';
            if (type) { query += ' r.type = ?'; params.push(type); }
            if (status) { query += (params.length > 0 ? ' AND' : '') + ' r.status = ?'; params.push(status); }
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const approveRequest = async (req, res) => {
    const { requestId, remarks } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Get Request Details
        const [requests] = await connection.execute('SELECT * FROM payment_requests WHERE id = ? AND status = "PENDING"', [requestId]);
        if (requests.length === 0) throw new Error('Request not found or already processed');
        const request = requests[0];

        // 2. Update Balance
        const operator = request.type === 'DEPOSIT' ? '+' : '-';
        await connection.execute(`UPDATE users SET balance = balance ${operator} ? WHERE id = ?`, [request.amount, request.user_id]);

        // 3. Update Request Status
        await connection.execute('UPDATE payment_requests SET status = "APPROVED", admin_remarks = ? WHERE id = ?', [remarks, requestId]);

        await connection.commit();
        await logAction(req.user.id, 'APPROVE_PAYMENT', 'payment_requests', `Approved ${request.type} of ${request.amount} for user ID ${request.user_id}`);
        
        res.json({ message: 'Request approved' });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ message: err.message });
    } finally {
        connection.release();
    }
};

module.exports = { getRequests, approveRequest };
