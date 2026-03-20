/**
 * AI Controller — Main API for the Smart AI-Driven System
 *
 * Endpoints:
 *   POST /api/ai/smart-command   → Full pipeline: parse → generate → execute → respond
 *   POST /api/ai/ai-command      → Legacy unified endpoint (backward compat)
 *   POST /api/ai/schema          → Get database schema summary
 *   POST /api/ai/parse-only      → Parse without executing (for preview)
 *
 * All legacy endpoints still work for backward compatibility.
 */

const db = require('../config/db');
const { parseCommand } = require('../services/aiCommandParser');
const { generateQuery } = require('../services/aiQueryGenerator');
const { executeQuery } = require('../services/aiExecutor');
const { loadSchema, getSchemaSummary } = require('../services/aiSchemaLoader');

// Legacy imports (backward compat)
const { parseCommand: legacyParseCommand } = require('../services/aiService');
const { executeAction: legacyExecuteAction } = require('../services/dbService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/smart-command
// THE MAIN ENDPOINT — Natural Language → Database Action Engine
// ─────────────────────────────────────────────────────────────────────────────

const smartCommand = async (req, res) => {
    const { text } = req.body;
    const reqUser = req.user || {};

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('[smart-command] 📝 Input:', text);
    console.log('[smart-command] 👤 User:', reqUser.full_name || reqUser.id || 'anonymous');
    console.log('═══════════════════════════════════════════════════════════════');

    // ── Step 0: Validate ────────────────────────────────────────────────────
    if (!text || !text.trim()) {
        return res.status(400).json({
            type: 'error',
            message: 'text is required',
            data: [],
            meta: {},
        });
    }

    try {
        // ── Step 1: Load Schema (cached) ────────────────────────────────────
        console.log('[smart-command] 📊 Loading schema...');
        await loadSchema();

        // ── Step 2: Parse Command ───────────────────────────────────────────
        console.log('[smart-command] 🤖 Parsing command...');
        const parsed = await parseCommand(text.trim());
        console.log('[smart-command] ✅ Parsed:', JSON.stringify(parsed, null, 2));

        // ── Step 3: Generate Query ──────────────────────────────────────────
        console.log('[smart-command] 🔧 Generating query...');
        const query = await generateQuery(parsed);
        console.log('[smart-command] ✅ Query:', JSON.stringify({
            type: query.type,
            sql: query.sql || '(composite operation)',
            params: query.params,
        }));

        // ── Step 4: Execute ─────────────────────────────────────────────────
        console.log('[smart-command] ▶️  Executing...');
        const result = await executeQuery(query, parsed, reqUser);
        console.log('[smart-command] ✅ Result:', result.message);

        // ── Step 5: Return ──────────────────────────────────────────────────
        console.log('[smart-command] 🎉 Done');
        console.log('═══════════════════════════════════════════════════════════════\n');

        return res.json({
            success: result.type !== 'error',
            ...result,
            parsed: {
                module: parsed.module,
                operation: parsed.operation,
                filters: parsed.filters,
                route: parsed.route,
            },
        });

    } catch (err) {
        console.error('[smart-command] ❌ Error:', err.message);
        return res.status(500).json({
            type: 'error',
            message: err.message || 'AI command failed',
            data: [],
            meta: { module: 'system' },
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/parse-only
// Parse without executing — for command preview / confirmation UI
// ─────────────────────────────────────────────────────────────────────────────

const parseOnly = async (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'text is required' });
    }

    try {
        await loadSchema();
        const parsed = await parseCommand(text.trim());
        const query = await generateQuery(parsed);

        return res.json({
            success: true,
            parsed,
            query: {
                type: query.type,
                sql: query.sql || null,
                table: query.table || null,
                error: query.error || null,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/schema
// Returns database schema summary (for debugging/admin tools)
// ─────────────────────────────────────────────────────────────────────────────

const getSchema = async (req, res) => {
    try {
        const summary = await getSchemaSummary();
        return res.json({ success: true, schema: summary });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY: POST /api/ai/ai-command (kept for backward compatibility)
// Routes through NEW system but returns OLD format
// ─────────────────────────────────────────────────────────────────────────────

const aiCommand = async (req, res) => {
    const { text } = req.body;

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('[ai-command] 📝 User Input:', text);
    console.log('═══════════════════════════════════════════════════════════════');

    if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'text is required' });
    }

    try {
        // Try new smart system first
        await loadSchema();
        const parsed = await parseCommand(text.trim());
        const query = await generateQuery(parsed);
        const result = await executeQuery(query, parsed, req.user || {});

        return res.json({
            success: result.type !== 'error',
            action: `${parsed.operation}`.toUpperCase(),
            ...result,
        });
    } catch (err) {
        // Fallback to legacy system
        console.warn('[ai-command] Smart system failed, trying legacy:', err.message);
        try {
            const legacyParsed = await legacyParseCommand(text);
            const legacyResult = await legacyExecuteAction(legacyParsed);
            return res.json({ success: true, action: legacyParsed.action, ...legacyResult });
        } catch (legacyErr) {
            return res.status(500).json({ success: false, message: legacyErr.message });
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY ENDPOINTS (unchanged for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

const bcryptLib = require('bcryptjs');

const makeDummy = () => {
    const adj = ['quick', 'smart', 'bold', 'swift', 'prime'][Math.floor(Math.random() * 5)];
    const noun = ['admin', 'trader', 'broker', 'agent', 'user'][Math.floor(Math.random() * 5)];
    const num = Math.floor(Math.random() * 900) + 100;
    return { name: `${adj}_${noun}`, email: `${adj}.${noun}${num}@example.com`, password: `Pass${num}@!` };
};

// ── POST /api/ai/voice-command ──────────────────────────────────────────────

const processVoiceCommand = async (req, res) => {
    const { command } = req.body;
    try {
        let response = "I didn't quite catch that. Try 'Active trades' or 'My balance'.";
        if (command.toLowerCase().includes('balance')) {
            const [rows] = await db.execute('SELECT balance FROM users WHERE id = ?', [req.user.id]);
            response = `Your current balance is ${rows[0].balance}`;
        } else if (command.toLowerCase().includes('trades')) {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM trades WHERE user_id = ? AND status = "OPEN"', [req.user.id]);
            response = `You have ${rows[0].count} active trades.`;
        }
        res.json({ text: response });
    } catch (err) {
        res.status(500).send('AI Engine Error');
    }
};

// ── POST /api/ai/ai-parse (legacy) ─────────────────────────────────────────

const aiParse = async (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'text is required' });
    }

    try {
        // Use new parser
        const parsed = await parseCommand(text.trim());

        // Add backward-compatible fields so legacy UI (VoiceModulationPage) can display summary
        const compat = { ...parsed };
        if (!compat.action) {
            const opMap = {
                add_fund: 'ADD_FUND', withdraw: 'WITHDRAW', transfer: 'TRANSFER_FUND',
                block: 'BLOCK_USER', unblock: 'UNBLOCK_USER', create: 'CREATE_USER',
                read: 'READ', aggregate: 'AGGREGATE', update: 'UPDATE', delete: 'DELETE',
            };
            compat.action = opMap[parsed.operation] || parsed.operation?.toUpperCase() || 'READ';
        }
        if (parsed.filters?.id && !compat.userId) compat.userId = parsed.filters.id;
        if (parsed.data?.amount && !compat.amount) compat.amount = parsed.data.amount;
        if (parsed.data?.fromUserId) compat.fromUserId = parsed.data.fromUserId;
        if (parsed.data?.toUserId) compat.toUserId = parsed.data.toUserId;
        if (parsed.data?.name) compat.name = parsed.data.name;
        if (parsed.data?.email) compat.email = parsed.data.email;

        return res.json(compat);
    } catch (err) {
        return res.status(422).json({
            message: 'Command not understood.',
            hint: 'Try: "trading clients dikhao" or "user 15 block karo"',
        });
    }
};

// ── POST /api/ai/execute-command (legacy) ───────────────────────────────────

const executeVoiceCommand = async (req, res) => {
    const { action, userId, amount, fromUserId, toUserId, name, email, password } = req.body;

    // ── New format detection: if body has module+operation (from new parser), route through smart system
    if (!action && req.body.module && req.body.operation) {
        console.log('[execute-command] Detected new format, routing through smart system');
        try {
            await loadSchema();
            const query = await generateQuery(req.body);
            const result = await executeQuery(query, req.body, req.user || {});
            return res.json({ success: result.type !== 'error', ...result });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    if (!action) {
        return res.status(400).json({ success: false, message: 'action is required' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        if (action === 'ADD_FUND') {
            if (!userId || amount == null) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'userId and amount are required' });
            }
            const amt = parseFloat(amount);
            if (isNaN(amt) || amt <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'amount must be positive' });
            }
            const [rows] = await connection.execute('SELECT id, balance FROM users WHERE id = ?', [userId]);
            if (!rows.length) { await connection.rollback(); return res.status(404).json({ success: false, message: `User ${userId} not found` }); }
            const newBalance = parseFloat(rows[0].balance || 0) + amt;
            await connection.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amt, userId]);
            await connection.execute('INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?, ?, ?, ?, ?)', [userId, amt, 'DEPOSIT', newBalance, 'Voice command: ADD_FUND']);
            await connection.commit();
            return res.json({ success: true, message: 'Fund added successfully', userId, amountAdded: amt, newBalance });
        }

        if (action === 'BLOCK_USER') {
            if (!userId) { await connection.rollback(); return res.status(400).json({ success: false, message: 'userId is required' }); }
            const [rows] = await connection.execute('SELECT id FROM users WHERE id = ?', [userId]);
            if (!rows.length) { await connection.rollback(); return res.status(404).json({ success: false, message: `User ${userId} not found` }); }
            await connection.execute("UPDATE users SET status = 'Suspended' WHERE id = ?", [userId]);
            await connection.commit();
            return res.json({ success: true, message: `User ${userId} blocked successfully` });
        }

        if (action === 'UNBLOCK_USER') {
            if (!userId) { await connection.rollback(); return res.status(400).json({ success: false, message: 'userId is required' }); }
            const [rows] = await connection.execute('SELECT id FROM users WHERE id = ?', [userId]);
            if (!rows.length) { await connection.rollback(); return res.status(404).json({ success: false, message: `User ${userId} not found` }); }
            await connection.execute("UPDATE users SET status = 'Active' WHERE id = ?", [userId]);
            await connection.commit();
            return res.json({ success: true, message: `User ${userId} unblocked successfully` });
        }

        if (action === 'CREATE_ADMIN') {
            if (!name || !email) { await connection.rollback(); return res.status(400).json({ success: false, message: 'name and email required' }); }
            const username = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-5)}`;
            const [dup] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (dup.length) { await connection.rollback(); return res.status(409).json({ success: false, message: `Email ${email} already exists` }); }
            const plainPass = password || `Admin@${Math.floor(Math.random() * 9000) + 1000}`;
            const hashed = await bcryptLib.hash(plainPass, 10);
            const [result] = await connection.execute(`INSERT INTO users (username, password, full_name, email, role, status, balance, credit_limit) VALUES (?, ?, ?, ?, 'ADMIN', 'Active', 0, 0)`, [username, hashed, name, email]);
            await connection.commit();
            return res.json({ success: true, message: 'Admin created', adminId: result.insertId, username, name, email, password: plainPass });
        }

        if (action === 'TRANSFER_FUND') {
            if (!fromUserId || !toUserId || amount == null) { await connection.rollback(); return res.status(400).json({ success: false, message: 'fromUserId, toUserId and amount required' }); }
            const amt = parseFloat(amount);
            const [fromRows] = await connection.execute('SELECT id, balance FROM users WHERE id = ? FOR UPDATE', [fromUserId]);
            if (!fromRows.length) { await connection.rollback(); return res.status(404).json({ success: false, message: `Source user ${fromUserId} not found` }); }
            const [toRows] = await connection.execute('SELECT id, balance FROM users WHERE id = ? FOR UPDATE', [toUserId]);
            if (!toRows.length) { await connection.rollback(); return res.status(404).json({ success: false, message: `Dest user ${toUserId} not found` }); }
            const fromBal = parseFloat(fromRows[0].balance || 0);
            if (fromBal < amt) { await connection.rollback(); return res.status(400).json({ success: false, message: `Insufficient balance` }); }
            const newFrom = fromBal - amt;
            const newTo = parseFloat(toRows[0].balance || 0) + amt;
            await connection.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [amt, fromUserId]);
            await connection.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amt, toUserId]);
            await connection.execute('INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?, ?, ?, ?, ?)', [fromUserId, amt, 'WITHDRAW', newFrom, `Transfer to user ${toUserId}`]);
            await connection.execute('INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?, ?, ?, ?, ?)', [toUserId, amt, 'DEPOSIT', newTo, `Transfer from user ${fromUserId}`]);
            await connection.commit();
            return res.json({ success: true, message: `₹${amt} transferred`, fromUserId, toUserId, amount: amt, fromBalance: newFrom, toBalance: newTo });
        }

        await connection.rollback();
        return res.status(400).json({ success: false, message: `Unknown action: "${action}"` });

    } catch (err) {
        await connection.rollback();
        return res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};

// ── POST /api/ai/voice-execute (legacy) ─────────────────────────────────────

const voiceExecute = async (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'text is required' });
    }

    // Route through smart system
    req.body.text = text;
    return smartCommand(req, res);
};

module.exports = {
    smartCommand,
    parseOnly,
    getSchema,
    aiCommand,
    processVoiceCommand,
    aiParse,
    executeVoiceCommand,
    voiceExecute,
};
