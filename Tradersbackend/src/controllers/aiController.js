const db = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
// RULE-BASED PARSER
// Supports: Hindi · Hinglish · English
// Actions : ADD_FUND | CREATE_ADMIN | BLOCK_USER | UNBLOCK_USER | TRANSFER_FUND
// ─────────────────────────────────────────────────────────────────────────────

const parseWithRules = (rawText) => {
    const t = rawText.trim();
    const tl = t.toLowerCase();

    // ── Helpers ──────────────────────────────────────────────────────────────

    // Extract a number that immediately follows a keyword group
    // e.g. extractIdAfter(tl, /(?:user\s*id|user|id)/) → {value, fullMatch}
    const extractIdAfter = (str, keywordPattern) => {
        const re = new RegExp(keywordPattern.source + String.raw`\s*[:#]?\s*(\d+)`, 'i');
        const m = str.match(re);
        return m ? { value: parseInt(m[1], 10), fullMatch: m[0] } : null;
    };

    // Parse amount — handles "5000", "5,000", "5k", "10K"
    const parseAmount = (str) => {
        const km = str.match(/(\d+)\s*k\b/i);
        if (km) return parseInt(km[1], 10) * 1000;
        const nm = str.match(/(\d[\d,]{2,})/);           // 3+ digit number
        if (nm) return parseFloat(nm[1].replace(/,/g, ''));
        const sm = str.match(/(\d+)/);                   // any number fallback
        return sm ? parseFloat(sm[1]) : null;
    };

    // Extract email
    const emailMatch = tl.match(/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i);
    const email = emailMatch ? emailMatch[0].toLowerCase() : null;

    // Extract name after keywords like "naam", "name", "banao naam"
    const nameMatch = t.match(/(?:naam|name)\s+([A-Za-z][A-Za-z\s]{1,30}?)(?:\s+email|\s+id|\s*$)/i);
    const name = nameMatch ? nameMatch[1].trim() : null;

    // ── Action Detection (priority order) ────────────────────────────────────

    const isTransfer   = /transfer|bhejo|send\s+to|se\s+.*\s+me|se\s+.*\s+ko/.test(tl);
    const isCreateAdmin = /(?:new|naya|create|add)\s+admin|admin\s+banao|admin\s+create/.test(tl);
    const isBlock      = /\bblock\b|suspend|band\s*karo|roko/.test(tl);
    const isUnblock    = /unblock|activate|\bactive karo\b|chalu\s*karo|kholo/.test(tl);
    const isAdd        = /\badd\b|deposit|jama|daalo|dalo|credit|bdhao|badhao|\bplus\b/.test(tl);

    // ── TRANSFER_FUND ─────────────────────────────────────────────────────────
    // Patterns: "ID 10 se ID 20 me 500 transfer karo"
    //           "user 10 se user 20 ko 500 bhejo"
    if (isTransfer) {
        // fromUserId: first id/user number
        const fromMatch = tl.match(/(?:id|user)\s*[:#]?\s*(\d+)\s+(?:se|from)/i)
                       || tl.match(/(?:se|from)\s+(?:id|user)?\s*[:#]?\s*(\d+)/i)
                       || tl.match(/(?:id|user)\s*[:#]?\s*(\d+)/i);
        const fromUserId = fromMatch ? parseInt(fromMatch[1], 10) : null;

        // toUserId: second id/user number
        const allIds = [...tl.matchAll(/(?:id|user)\s*[:#]?\s*(\d+)/gi)].map(m => parseInt(m[1], 10));
        const toUserId = allIds.length >= 2 ? allIds[1] : null;

        // amount: strip out id numbers then parse
        let stripped = tl;
        for (const m of tl.matchAll(/(?:id|user)\s*[:#]?\s*\d+/gi)) stripped = stripped.replace(m[0], '');
        const amount = parseAmount(stripped);

        return { action: 'TRANSFER_FUND', fromUserId, toUserId, amount };
    }

    // ── CREATE_ADMIN ──────────────────────────────────────────────────────────
    // Pattern: "new admin banao naam Rahul email rahul@gmail.com"
    if (isCreateAdmin) {
        return { action: 'CREATE_ADMIN', name, email };
    }

    // ── For remaining actions — extract single userId ─────────────────────────
    const userIdMatch = extractIdAfter(tl, /(?:user\s*id|user|id)/);
    const userId = userIdMatch ? userIdMatch.value : null;

    // ── BLOCK_USER ────────────────────────────────────────────────────────────
    if (isBlock) return { action: 'BLOCK_USER', userId };

    // ── UNBLOCK_USER ──────────────────────────────────────────────────────────
    if (isUnblock) return { action: 'UNBLOCK_USER', userId };

    // ── ADD_FUND ──────────────────────────────────────────────────────────────
    if (isAdd) {
        const textWithoutId = userIdMatch ? tl.replace(userIdMatch.fullMatch, '') : tl;
        const amount = parseAmount(textWithoutId);
        return { action: 'ADD_FUND', userId, amount };
    }

    // ── Fallback ──────────────────────────────────────────────────────────────
    return { action: 'UNKNOWN', userId, raw: rawText };
};

// ─────────────────────────────────────────────────────────────────────────────
// OPENAI PARSER  (used only when OPENAI_API_KEY is valid)
// ─────────────────────────────────────────────────────────────────────────────

const OPENAI_SYSTEM_PROMPT = `You are an AI command parser for a trading admin panel.
Users may give commands in Hindi, Hinglish, or English.
Your job is to detect INTENT and return structured JSON only — no extra text.

Supported actions:
1. ADD_FUND        → { "action": "ADD_FUND",        "userId": <int>, "amount": <int> }
2. CREATE_ADMIN    → { "action": "CREATE_ADMIN",    "name": "<str>", "email": "<str>" }
3. BLOCK_USER      → { "action": "BLOCK_USER",      "userId": <int> }
4. UNBLOCK_USER    → { "action": "UNBLOCK_USER",    "userId": <int> }
5. TRANSFER_FUND   → { "action": "TRANSFER_FUND",   "fromUserId": <int>, "toUserId": <int>, "amount": <int> }

Examples:
Input : "ID 16 me 5000 add karo"
Output: { "action": "ADD_FUND", "userId": 16, "amount": 5000 }

Input : "new admin banao naam Rahul email rahul@gmail.com"
Output: { "action": "CREATE_ADMIN", "name": "Rahul", "email": "rahul@gmail.com" }

Input : "user 15 block karo"
Output: { "action": "BLOCK_USER", "userId": 15 }

Input : "ID 10 se ID 20 me 500 transfer karo"
Output: { "action": "TRANSFER_FUND", "fromUserId": 10, "toUserId": 20, "amount": 500 }

Rules:
- Always return valid JSON only
- If a field is missing, use null for that field
- Never return error messages — always return a JSON object`;

const parseWithOpenAI = async (text) => {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: OPENAI_SYSTEM_PROMPT },
            { role: 'user',   content: text },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /ai-parse
// ─────────────────────────────────────────────────────────────────────────────

const aiParse = async (req, res) => {
    const { text } = req.body;

    console.log('\n[ai-parse] ← Request:', { text });

    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'text is required' });
    }

    const hasValidKey =
        process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY.length > 30 &&
        !process.env.OPENAI_API_KEY.startsWith('sk-your') &&
        !process.env.OPENAI_API_KEY.includes('placeholder');

    let result;

    if (hasValidKey) {
        try {
            result = await parseWithOpenAI(text);
            console.log('[ai-parse] ✅ OpenAI parsed:', result);
        } catch (err) {
            console.warn('[ai-parse] ⚠️  OpenAI failed (' + err.message + '), falling back to rule engine');
            result = parseWithRules(text);
            console.log('[ai-parse] ✅ Rule-based parsed:', result);
        }
    } else {
        result = parseWithRules(text);
        console.log('[ai-parse] ✅ Rule-based parsed:', result);
    }

    if (result.action === 'UNKNOWN') {
        console.log('[ai-parse] ❌ Unknown command');
        return res.status(422).json({
            message: 'Command not understood.',
            hint: 'Try: "ID 16 me 5000 add karo" or "user 15 block karo"',
        });
    }

    console.log('[ai-parse] → Response:', result);
    return res.json(result);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /execute-command
// ─────────────────────────────────────────────────────────────────────────────

const executeVoiceCommand = async (req, res) => {
    const { action, userId, amount, fromUserId, toUserId, name, email } = req.body;

    console.log('\n[execute-command] ← Request:', req.body);

    if (!action) {
        return res.status(400).json({ message: 'action is required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ── ADD_FUND ──────────────────────────────────────────────────────────
        if (action === 'ADD_FUND') {
            if (!userId || !amount) {
                await connection.rollback();
                return res.status(400).json({ message: 'userId and amount are required for ADD_FUND' });
            }

            const [rows] = await connection.execute(
                'SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId]
            );
            if (!rows.length) {
                await connection.rollback();
                return res.status(404).json({ message: `User ${userId} not found` });
            }

            const newBalance = parseFloat(rows[0].balance || 0) + parseFloat(amount);
            await connection.execute(
                'INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?,?,?,?,?)',
                [userId, amount, 'DEPOSIT', newBalance, 'Voice: ADD_FUND']
            );
            await connection.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);
            await connection.commit();

            console.log('[execute-command] ✅ ADD_FUND done. newBalance:', newBalance);
            return res.json({ success: true, message: `₹${amount} added to user ${userId}`, newBalance });
        }

        // ── TRANSFER_FUND ─────────────────────────────────────────────────────
        if (action === 'TRANSFER_FUND') {
            if (!fromUserId || !toUserId || !amount) {
                await connection.rollback();
                return res.status(400).json({ message: 'fromUserId, toUserId and amount are required for TRANSFER_FUND' });
            }

            const [fromRows] = await connection.execute(
                'SELECT balance FROM users WHERE id = ? FOR UPDATE', [fromUserId]
            );
            if (!fromRows.length) {
                await connection.rollback();
                return res.status(404).json({ message: `Source user ${fromUserId} not found` });
            }

            const [toRows] = await connection.execute(
                'SELECT balance FROM users WHERE id = ? FOR UPDATE', [toUserId]
            );
            if (!toRows.length) {
                await connection.rollback();
                return res.status(404).json({ message: `Destination user ${toUserId} not found` });
            }

            const fromBal = parseFloat(fromRows[0].balance || 0);
            const amt     = parseFloat(amount);
            if (fromBal < amt) {
                await connection.rollback();
                return res.status(400).json({ message: `Insufficient balance. User ${fromUserId} has ₹${fromBal}` });
            }

            const newFromBal = fromBal - amt;
            const newToBal   = parseFloat(toRows[0].balance || 0) + amt;

            await connection.execute(
                'INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?,?,?,?,?)',
                [fromUserId, amt, 'TRANSFER_OUT', newFromBal, `Voice: TRANSFER to user ${toUserId}`]
            );
            await connection.execute(
                'INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?,?,?,?,?)',
                [toUserId, amt, 'TRANSFER_IN', newToBal, `Voice: TRANSFER from user ${fromUserId}`]
            );
            await connection.execute('UPDATE users SET balance = ? WHERE id = ?', [newFromBal, fromUserId]);
            await connection.execute('UPDATE users SET balance = ? WHERE id = ?', [newToBal, toUserId]);
            await connection.commit();

            console.log('[execute-command] ✅ TRANSFER_FUND done');
            return res.json({
                success: true,
                message: `₹${amt} transferred from user ${fromUserId} to user ${toUserId}`,
                fromBalance: newFromBal,
                toBalance: newToBal,
            });
        }

        // ── BLOCK_USER ────────────────────────────────────────────────────────
        if (action === 'BLOCK_USER') {
            if (!userId) {
                await connection.rollback();
                return res.status(400).json({ message: 'userId is required for BLOCK_USER' });
            }
            await connection.execute("UPDATE users SET status = 'blocked' WHERE id = ?", [userId]);
            await connection.commit();
            console.log('[execute-command] ✅ BLOCK_USER done');
            return res.json({ success: true, message: `User ${userId} has been blocked` });
        }

        // ── UNBLOCK_USER ──────────────────────────────────────────────────────
        if (action === 'UNBLOCK_USER') {
            if (!userId) {
                await connection.rollback();
                return res.status(400).json({ message: 'userId is required for UNBLOCK_USER' });
            }
            await connection.execute("UPDATE users SET status = 'active' WHERE id = ?", [userId]);
            await connection.commit();
            console.log('[execute-command] ✅ UNBLOCK_USER done');
            return res.json({ success: true, message: `User ${userId} has been unblocked` });
        }

        // ── CREATE_ADMIN ──────────────────────────────────────────────────────
        if (action === 'CREATE_ADMIN') {
            if (!name || !email) {
                await connection.rollback();
                return res.status(400).json({ message: 'name and email are required for CREATE_ADMIN' });
            }

            const [existing] = await connection.execute(
                'SELECT id FROM users WHERE email = ?', [email]
            );
            if (existing.length) {
                await connection.rollback();
                return res.status(409).json({ message: `Email ${email} already exists` });
            }

            const bcrypt = require('bcryptjs');
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            const [insertResult] = await connection.execute(
                'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, 'admin', 'active']
            );
            await connection.commit();

            console.log('[execute-command] ✅ CREATE_ADMIN done. id:', insertResult.insertId);
            return res.json({
                success: true,
                message: `Admin "${name}" created successfully`,
                adminId: insertResult.insertId,
                tempPassword,   // show once — user should change this
            });
        }

        // ── Unknown action ────────────────────────────────────────────────────
        await connection.rollback();
        return res.status(400).json({ message: `Unknown action: ${action}` });

    } catch (err) {
        await connection.rollback();
        console.error('[execute-command] ❌ Error:', err.message);
        return res.status(500).json({ message: err.message || 'Command execution failed' });
    } finally {
        connection.release();
    }
};

// ─── Legacy handler (kept for /api/ai/voice-command) ─────────────────────────

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

module.exports = { processVoiceCommand, aiParse, executeVoiceCommand };
