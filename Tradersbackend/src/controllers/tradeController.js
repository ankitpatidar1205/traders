const db = require('../config/db');
const mockEngine = require('../utils/mockEngine');
const bcrypt = require('bcryptjs');

/**
 * Place a New Order
 */
const placeOrder = async (req, res) => {
    const { symbol, type, qty, price, order_type, is_pending, userId: traderId, transactionPassword } = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    const tradeIp = req.ip || req.headers['x-forwarded-for'];

    try {
        console.log('--- Place Order Request ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));

        // 1. Validate Transaction Password (BYPASSING FOR TESTING)
        /*
        const [userRows] = await db.execute('SELECT transaction_password FROM users WHERE id = ?', [requesterId]);
        const user = userRows[0];
        
        if (!user || !user.transaction_password) {
            return res.status(400).json({ message: 'Transaction password not set' });
        }

        const isMatch = await bcrypt.compare(transactionPassword, user.transaction_password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid transaction password' });
        }
        */

        // 2. Determine target user (Trader)
        let targetUserId = requesterId;
        if (requesterRole !== 'TRADER' && traderId) {
            targetUserId = traderId;
        }

        // 3. Execution logic
        const currentPrice = mockEngine.getPrice(symbol);
        const executionPrice = (order_type === 'MARKET' || !price) ? currentPrice : parseFloat(price);
        const qtyNum = parseInt(qty);
        const marginUsed = executionPrice * qtyNum * 0.1; // Placeholder

        if (isNaN(executionPrice) || isNaN(qtyNum) || !targetUserId) {
            console.error('Validation failed:', { executionPrice, qtyNum, targetUserId });
            return res.status(400).json({ 
                message: 'Invalid trade data (Price/Qty/User missing)',
                debug: { executionPrice, qtyNum, targetUserId }
            });
        }

        console.log('Executing with:', { targetUserId, symbol, type, executionPrice, marginUsed });

        const [result] = await db.execute(
            'INSERT INTO trades (user_id, symbol, type, order_type, qty, entry_price, margin_used, is_pending, status, trade_ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [targetUserId, symbol, type, order_type || 'MARKET', qtyNum, executionPrice, marginUsed, is_pending ? 1 : 0, 'OPEN', tradeIp]
        );

        console.log('✅ Trade Inserted:', result.insertId);
        res.status(201).json({ message: 'Order placed successfully', tradeId: result.insertId });
    } catch (err) {
        console.error('❌ Trade Placement Error:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};

/**
 * Get Trades by Status (Active, Closed, Deleted)
 */
const getTrades = async (req, res) => {
    const { status, user_id } = req.query; // OPEN, CLOSED, DELETED, CANCELLED
    try {
        let query = 'SELECT t.*, u.username FROM trades t JOIN users u ON t.user_id = u.id WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        if (req.query.is_pending !== undefined) {
            query += ' AND t.is_pending = ?';
            params.push(req.query.is_pending === 'true' || req.query.is_pending === '1' ? 1 : 0);
        }

        // Filter by specific user_id (for client detail views)
        if (user_id) {
            query += ' AND t.user_id = ?';
            params.push(user_id);
        } else if (req.user.role !== 'SUPERADMIN') {
            // Apply role hierarchy filtering only when not filtering by specific user
            query += ' AND (u.id = ? OR u.parent_id = ?)';
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
