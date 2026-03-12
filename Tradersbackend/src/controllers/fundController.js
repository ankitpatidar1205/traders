const db = require('../config/db');

const handleTransaction = async (req, res) => {
    const { userId, amount, type, remarks } = req.body; // type: DEPOSIT, WITHDRAW

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Current Balance
        const [userRows] = await connection.execute('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId]);
        if (userRows.length === 0) throw new Error('User not found');
        const currentBalance = parseFloat(userRows[0].balance);
        const newBalance = type === 'DEPOSIT' ? currentBalance + parseFloat(amount) : currentBalance - parseFloat(amount);

        // 2. Record in Ledger
        await connection.execute(
            'INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?, ?, ?, ?, ?)',
            [userId, amount, type, newBalance, remarks]
        );

        // 3. Update User Balance
        await connection.execute(
            'UPDATE users SET balance = ? WHERE id = ?',
            [newBalance, userId]
        );

        await connection.commit();
        res.json({ message: 'Transaction successful', newBalance });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        connection.release();
    }
};

const getLedger = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM ledger WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { handleTransaction, getLedger };
