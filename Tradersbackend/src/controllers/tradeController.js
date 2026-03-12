const db = require('../config/db');
const mockEngine = require('../utils/mockEngine');

/**
 * Place a New Order
 */
const placeOrder = async (req, res) => {
    const { symbol, type, qty, price, order_type, is_pending } = req.body;
    const userId = req.user.id;
    const tradeIp = req.ip || req.headers['x-forwarded-for'];

    try {
        const currentPrice = mockEngine.getPrice(symbol);
        const executionPrice = order_type === 'MARKET' ? currentPrice : price;
        const marginUsed = executionPrice * qty * 0.1; // Placeholder for actual margin logic
        const [result] = await db.execute(
            'INSERT INTO trades (user_id, symbol, type, order_type, qty, entry_price, margin_used, is_pending, status, trade_ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, symbol, type, order_type || 'MARKET', qty, executionPrice, marginUsed, is_pending ? 1 : 0, 'OPEN', tradeIp]
        );
        res.status(201).json({ message: 'Order placed', tradeId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * Get Trades by Status (Active, Closed, Deleted)
 */
const getTrades = async (req, res) => {
    const { status } = req.query; // OPEN, CLOSED, DELETED, CANCELLED
    try {
        let query = 'SELECT t.*, u.username FROM trades t JOIN users u ON t.user_id = u.id';
        const params = [];

        if (status) {
            query += ' WHERE t.status = ?';
            params.push(status);
        }

        // Apply role hierarchy filtering
        if (req.user.role !== 'SUPERADMIN') {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' (u.id = ? OR u.parent_id = ?)';
            params.push(req.user.id, req.user.id);
        }

        query += ' ORDER BY t.entry_time DESC';
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * Group Trades (Aggregated View)
 */
const getGroupTrades = async (req, res) => {
    try {
        const query = `
            SELECT symbol, type, SUM(qty) as total_qty, AVG(entry_price) as avg_price, COUNT(*) as trade_count
            FROM trades
            WHERE status = 'OPEN'
            GROUP BY symbol, type
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * Close/Squre-off Trade
 */
const closeTrade = async (req, res) => {
    const { exitPrice } = req.body;
    try {
        const [trades] = await db.execute('SELECT * FROM trades WHERE id = ?', [req.params.id]);
        if (trades.length === 0) return res.status(404).json({ message: 'Trade not found' });
        
        const trade = trades[0];
        const currentPrice = mockEngine.getPrice(trade.symbol);
        const finalExitPrice = exitPrice || currentPrice;
        
        const pnl = trade.type === 'BUY' 
            ? (finalExitPrice - trade.entry_price) * trade.qty 
            : (trade.entry_price - finalExitPrice) * trade.qty;

        await db.execute(
            'UPDATE trades SET status = "CLOSED", exit_price = ?, exit_time = NOW(), pnl = ? WHERE id = ?',
            [finalExitPrice, pnl, req.params.id]
        );

        // Update User Balance with PnL
        await db.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [pnl, trade.user_id]);

        res.json({ message: 'Trade closed successfully', pnl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * Soft Delete Trade (Audit Trail)
 */
const deleteTrade = async (req, res) => {
    try {
        await db.execute('UPDATE trades SET status = "DELETED" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Trade deleted and moved to audit' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { placeOrder, getTrades, getGroupTrades, closeTrade, deleteTrade };
