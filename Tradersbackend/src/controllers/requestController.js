const db = require('../config/db');
const { logAction } = require('./systemController');

const getRequests = async (req, res) => {
    const { type, status } = req.query; // type: DEPOSIT/WITHDRAW, status: PENDING
    try {
        let query = `
            SELECT r.*, u.username, u.full_name, u.balance as current_balance
            FROM payment_requests r 
            JOIN users u ON r.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (type) { query += ' AND r.type = ?'; params.push(type); }
        if (status) { query += ' AND r.status = ?'; params.push(status); }

        query += ' ORDER BY r.created_at DESC';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status, remark } = req.body; // status: APPROVED, REJECTED

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Request Details
        const [requests] = await connection.execute('SELECT * FROM payment_requests WHERE id = ? AND status = "PENDING" FOR UPDATE', [id]);
        if (requests.length === 0) throw new Error('Request not found or already processed');
        const request = requests[0];

        if (status === 'APPROVED') {
            // 2. Update User Balance
            const operator = request.type === 'DEPOSIT' ? '+' : '-';
            await connection.execute(`UPDATE users SET balance = balance ${operator} ? WHERE id = ?`, [request.amount, request.user_id]);

            // 3. Get New Balance for Ledger
            const [userRows] = await connection.execute('SELECT balance FROM users WHERE id = ?', [request.user_id]);
            const newBalance = userRows[0].balance;

            // 4. Record in Ledger
            await connection.execute(
                'INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?, ?, ?, ?, ?)',
                [request.user_id, request.amount, request.type, newBalance, remark || `Request Approved: ${request.type}`]
            );
        }

        // 5. Update Request Status
        await connection.execute('UPDATE payment_requests SET status = ?, admin_remarks = ? WHERE id = ?', [status, remark, id]);

        await connection.commit();
        await logAction(req.user.id, `${status}_PAYMENT`, 'payment_requests', `${status} ${request.type} of ${request.amount} for user ID ${request.user_id}`);
        
        res.json({ message: `Request ${status.toLowerCase()}` });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(400).json({ message: err.message });
    } finally {
        connection.release();
    }
};

module.exports = { getRequests, updateRequestStatus };
