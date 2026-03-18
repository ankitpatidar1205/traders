const db = require('../config/db');
const { parseCommand } = require('../services/aiService');
const { executeAction } = require('../services/dbService');

// ─────────────────────────────────────────────────────────────────────────────
// MAIN AI COMMAND ENDPOINT (NEW)
// POST /api/ai/ai-command
// Single unified endpoint: parse + validate + execute
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates that parsed command has all required fields
 * @param {object} parsed - Parsed command from aiService
 * @returns {string|null} Error message if invalid, null if valid
 */
const validateParsed = (parsed) => {
    const { action } = parsed;

    switch (action) {
        case 'ADD_FUND':
            if (!parsed.userId || parsed.amount == null) {
                return 'ADD_FUND requires userId and amount';
            }
            break;

        case 'BLOCK_USER':
        case 'UNBLOCK_USER':
            if (!parsed.userId) {
                return `${action} requires userId`;
            }
            break;

        case 'CREATE_ADMIN':
            if (!parsed.name || !parsed.email) {
                return 'CREATE_ADMIN requires name and email';
            }
            break;

        case 'TRANSFER_FUND':
            if (!parsed.fromUserId || !parsed.toUserId || parsed.amount == null) {
                return 'TRANSFER_FUND requires fromUserId, toUserId, and amount';
            }
            break;

        default:
            return `Unknown action: ${action}`;
    }

    return null;  // Valid
};

/**
 * POST /api/ai/ai-command
 * Request:  { "text": "ID 16 me 5000 add karo" }
 * Response: { success: true, action: "ADD_FUND", message: "...", ...data }
 *
 * Fully automated flow:
 * 1. Parse natural language text
 * 2. Validate extracted fields
 * 3. Execute database operation
 * 4. Return success/error
 */
const aiCommand = async (req, res) => {
    const { text } = req.body;

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('[ai-command] 📝 User Input:', text);
    console.log('═══════════════════════════════════════════════════════════════');

    // ── Step 0: Validate input ─────────────────────────────────────────────────
    if (!text || !text.trim()) {
        console.log('[ai-command] ❌ text is required');
        return res.status(400).json({ success: false, message: 'text is required' });
    }

    // ── Step 1: Parse ──────────────────────────────────────────────────────────
    let parsed;
    try {
        console.log('[ai-command] 🤖 Parsing command...');
        parsed = await parseCommand(text);
        console.log('[ai-command] ✅ Parsed:', parsed);
    } catch (err) {
        console.log('[ai-command] ❌ Parse error:', err.message);
        return res.status(422).json({ success: false, message: err.message });
    }

    // ── Step 2: Validate ───────────────────────────────────────────────────────
    console.log('[ai-command] ✓ Validating parsed data...');
    const validationError = validateParsed(parsed);
    if (validationError) {
        console.log('[ai-command] ❌ Validation error:', validationError);
        return res.status(400).json({ success: false, message: validationError });
    }
    console.log('[ai-command] ✅ Validation passed');

    // ── Step 3: Execute ───────────────────────────────────────────────────────
    console.log('[ai-command] ▶️  Executing database operation...');
    let result;
    try {
        result = await executeAction(parsed);
        console.log('[ai-command] ✅ Execution result:', result);
    } catch (err) {
        console.error('[ai-command] ❌ Execution error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }

    // ── Step 4: Return success ─────────────────────────────────────────────────
    console.log('[ai-command] 🎉 Command completed successfully');
    console.log('═══════════════════════════════════════════════════════════════\n');

    return res.json({
        success: true,
        action: parsed.action,
        ...result,
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY PARSERS & HANDLERS (kept for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// RULE-BASED PARSER
// Supports: Hindi · Hinglish · English
// Actions : ADD_FUND | CREATE_ADMIN | BLOCK_USER | UNBLOCK_USER | TRANSFER_FUND
// ─────────────────────────────────────────────────────────────────────────────

// ── Dummy credential generator ────────────────────────────────────────────────
const makeDummy = () => {
    const adjectives = ['quick', 'smart', 'bold', 'swift', 'prime'];
    const nouns      = ['admin', 'trader', 'broker', 'agent', 'user'];
    const adj  = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num  = Math.floor(Math.random() * 900) + 100;
    return {
        name    : `${adj}_${noun}`,
        email   : `${adj}.${noun}${num}@example.com`,
        password: `Pass${num}@!`,
    };
};

const parseWithRules = (rawText) => {
    const t  = rawText.trim();
    const tl = t.toLowerCase();

    // ── Helpers ───────────────────────────────────────────────────────────────

    const extractIdAfter = (str, keywordPattern) => {
        const re = new RegExp(keywordPattern.source + String.raw`\s*[:#]?\s*(\d+)`, 'i');
        const m  = str.match(re);
        return m ? { value: parseInt(m[1], 10), fullMatch: m[0] } : null;
    };

    const parseAmount = (str) => {
        const km = str.match(/(\d+)\s*k\b/i);
        if (km) return parseInt(km[1], 10) * 1000;
        const nm = str.match(/(\d[\d,]{2,})/);      // 3+ digit → likely an amount
        if (nm) return parseFloat(nm[1].replace(/,/g, ''));
        const sm = str.match(/(\d+)/);
        return sm ? parseFloat(sm[1]) : null;
    };

    // ── Intent signals ────────────────────────────────────────────────────────

    // TRANSFER: must have two user references OR "transfer/bhejo" keyword
    const isTransfer = /transfer|bhejo|send\s+to|se\s+.*?\s+(?:me|ko)|from\s+.*?\s+to/.test(tl)
                    && /(?:id|user)\s*[:#]?\s*\d+/.test(tl);

    // CREATE_ADMIN: "admin" + any creation word OR "add a admin" / "create admin"
    const isCreateAdmin = /(?:new|naya|create|bana[ao]|add\s+a?n?\s*)\s*admin|admin\s+(?:banao|create|add|bana)|admin\s+with/.test(tl);

    // BLOCK: block/suspend keyword — NOT inside "unblock"
    const isBlock   = /(?<!un)\bblock\b|suspend|band\s*karo|\broko\b/.test(tl);

    // UNBLOCK: must explicitly say unblock/activate/chalu
    const isUnblock = /unblock|activate|chalu\s*karo|kholo/.test(tl);

    // ADD_FUND: add/deposit + amount + userId (all three must be present)
    const isAddWord  = /\badd\b|deposit|jama|daalo|dalo|credit|bdhao|badhao/.test(tl);

    // ── Priority order: most specific → least specific ────────────────────────

    // 1. TRANSFER_FUND
    if (isTransfer) {
        const fromMatch = tl.match(/(?:id|user)\s*[:#]?\s*(\d+)\s+(?:se|from)/i)
                       || tl.match(/(?:se|from)\s+(?:id|user)?\s*[:#]?\s*(\d+)/i)
                       || tl.match(/(?:id|user)\s*[:#]?\s*(\d+)/i);
        const fromUserId = fromMatch ? parseInt(fromMatch[1], 10) : null;

        const allIds = [...tl.matchAll(/(?:id|user)\s*[:#]?\s*(\d+)/gi)].map(m => parseInt(m[1], 10));
        const toUserId = allIds.length >= 2 ? allIds[1] : null;

        let stripped = tl;
        for (const m of tl.matchAll(/(?:id|user)\s*[:#]?\s*\d+/gi)) stripped = stripped.replace(m[0], '');
        const amount = parseAmount(stripped) || 0;

        return {
            action     : 'TRANSFER_FUND',
            fromUserId : fromUserId || null,
            toUserId   : toUserId   || null,
            amount,
        };
    }

    // 2. CREATE_ADMIN
    if (isCreateAdmin) {
        const emailMatch = tl.match(/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i);
        const nameMatch  = t.match(/(?:naam|name)\s+([A-Za-z][A-Za-z\s]{1,30}?)(?:\s+email|\s+id|\s+pass|\s*$)/i);
        const passMatch  = t.match(/(?:password|pass|pwd)\s+([^\s]+)/i);

        const isDummy = /dummy|fake|test|sample|random/.test(tl);

        if (isDummy || (!nameMatch && !emailMatch)) {
            // Generate dummy credentials
            const d = makeDummy();
            return {
                action  : 'CREATE_ADMIN',
                name    : nameMatch ? nameMatch[1].trim() : d.name,
                email   : emailMatch ? emailMatch[0]      : d.email,
                password: passMatch  ? passMatch[1]       : d.password,
            };
        }

        return {
            action  : 'CREATE_ADMIN',
            name    : nameMatch  ? nameMatch[1].trim()    : 'admin',
            email   : emailMatch ? emailMatch[0]          : `admin${Date.now()}@example.com`,
            password: passMatch  ? passMatch[1]           : 'Admin@123',
        };
    }

    // 3. BLOCK_USER
    if (isBlock) {
        const userIdMatch = extractIdAfter(tl, /(?:user\s*id|user|id)/);
        return {
            action: 'BLOCK_USER',
            userId: userIdMatch ? userIdMatch.value : null,
        };
    }

    // 4. UNBLOCK_USER
    if (isUnblock) {
        const userIdMatch = extractIdAfter(tl, /(?:user\s*id|user|id)/);
        return {
            action: 'UNBLOCK_USER',
            userId: userIdMatch ? userIdMatch.value : null,
        };
    }

    // 5. ADD_FUND — only if add-word AND a userId AND an amount are all present
    if (isAddWord) {
        const userIdMatch = extractIdAfter(tl, /(?:user\s*id|user|id)/);
        const textWithoutId = userIdMatch ? tl.replace(userIdMatch.fullMatch, '') : tl;
        const amount = parseAmount(textWithoutId);

        // Require both userId AND amount — else it's not a fund command
        if (userIdMatch && amount !== null) {
            return {
                action: 'ADD_FUND',
                userId: userIdMatch.value,
                amount,
            };
        }
    }

    // 6. UNKNOWN
    return { action: 'UNKNOWN', raw: rawText };
};

// ─────────────────────────────────────────────────────────────────────────────
// OPENAI PARSER  (used only when OPENAI_API_KEY is valid)
// ─────────────────────────────────────────────────────────────────────────────

const OPENAI_SYSTEM_PROMPT = `You are an AI command parser for a trading admin panel.
Users may give commands in Hindi, Hinglish, or English.
Your job is to detect INTENT first, then extract fields. Return structured JSON only — no extra text.

⚠️  IMPORTANT: Do NOT default to ADD_FUND. Detect the correct intent from the sentence.

Supported actions:
1. ADD_FUND      → requires userId + amount   → { "action": "ADD_FUND", "userId": <int>, "amount": <int> }
2. CREATE_ADMIN  → requires name + email      → { "action": "CREATE_ADMIN", "name": "<str>", "email": "<str>", "password": "<str>" }
3. BLOCK_USER    → requires userId            → { "action": "BLOCK_USER", "userId": <int> }
4. UNBLOCK_USER  → requires userId            → { "action": "UNBLOCK_USER", "userId": <int> }
5. TRANSFER_FUND → requires fromUserId + toUserId + amount → { "action": "TRANSFER_FUND", "fromUserId": <int>, "toUserId": <int>, "amount": <int> }

Examples:
Input : "ID 16 me 2000 add karo"
Output: { "action": "ADD_FUND", "userId": 16, "amount": 2000 }

Input : "add a admin with dummy credentials"
Output: { "action": "CREATE_ADMIN", "name": "dummy_admin", "email": "dummy@example.com", "password": "Admin@123" }

Input : "new admin banao naam Rahul email rahul@gmail.com"
Output: { "action": "CREATE_ADMIN", "name": "Rahul", "email": "rahul@gmail.com", "password": "Admin@123" }

Input : "user 10 block karo"
Output: { "action": "BLOCK_USER", "userId": 10 }

Input : "ID 12 ko unblock karo"
Output: { "action": "UNBLOCK_USER", "userId": 12 }

Input : "ID 10 se ID 20 me 500 transfer karo"
Output: { "action": "TRANSFER_FUND", "fromUserId": 10, "toUserId": 20, "amount": 500 }

Rules:
- Detect intent FIRST before extracting fields
- "add admin" / "create admin" / "admin banao" → always CREATE_ADMIN, never ADD_FUND
- ADD_FUND requires BOTH a numeric userId AND a numeric amount in the sentence
- If dummy/fake/test/sample is mentioned for admin → generate placeholder credentials
- Never return null — always use a meaningful default value
- Return valid JSON only, no extra text`;

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
// POST /voice-execute  — parse + execute in ONE call
// Body: { text: "ID 16 me 5000 add karo" }
// ─────────────────────────────────────────────────────────────────────────────

const voiceExecute = async (req, res) => {
    const { text } = req.body;

    console.log('\n[voice-execute] ← text:', text);

    if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'text is required' });
    }

    // ── Step 1: Parse ─────────────────────────────────────────────────────────
    const hasValidKey =
        process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY.length > 30 &&
        !process.env.OPENAI_API_KEY.startsWith('sk-your') &&
        !process.env.OPENAI_API_KEY.includes('placeholder');

    let parsed;
    try {
        parsed = hasValidKey ? await parseWithOpenAI(text) : parseWithRules(text);
    } catch {
        parsed = parseWithRules(text);
    }

    console.log('[voice-execute] Parsed:', parsed);

    if (!parsed.action || parsed.action === 'UNKNOWN') {
        return res.status(422).json({
            success: false,
            message: 'Command not understood.',
            hint: 'Try: "ID 16 me 5000 add karo" or "user 15 block karo"',
        });
    }

    // ── Step 2: Execute straight into DB ─────────────────────────────────────
    // Reuse executeVoiceCommand logic by forwarding to it internally
    req.body = parsed;    // swap body to parsed command
    console.log('[voice-execute] Executing:', parsed);
    return executeVoiceCommand(req, res);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /execute-command
// ─────────────────────────────────────────────────────────────────────────────

const executeVoiceCommand = async (req, res) => {
    // Schema reference (from DESCRIBE):
    // users: id, username(NOT NULL UNIQUE), password(NOT NULL), full_name(NOT NULL),
    //        email, mobile, role ENUM('SUPERADMIN','ADMIN','BROKER','TRADER'),
    //        status ENUM('Active','Inactive','Suspended'), balance decimal(18,4)
    // ledger: user_id, amount, type ENUM('DEPOSIT','WITHDRAW','TRADE_PNL','BROKERAGE','SWAP'),
    //         balance_after, remarks

    const { action, userId, amount, fromUserId, toUserId, name, email, password } = req.body;

    console.log('\n[execute-command] ← Incoming command:', req.body);

    if (!action) {
        return res.status(400).json({ success: false, message: 'action is required' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // ── A. ADD_FUND ───────────────────────────────────────────────────────
        // users.balance is decimal(18,4) — use balance + ?
        // ledger.type ENUM only: 'DEPOSIT','WITHDRAW','TRADE_PNL','BROKERAGE','SWAP'
        if (action === 'ADD_FUND') {
            if (!userId || amount == null) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'userId and amount are required' });
            }
            const amt = parseFloat(amount);
            if (isNaN(amt) || amt <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'amount must be a positive number' });
            }

            const [rows] = await connection.execute(
                'SELECT id, balance FROM users WHERE id = ?', [userId]
            );
            if (!rows.length) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: `User ${userId} not found` });
            }

            const newBalance = parseFloat(rows[0].balance || 0) + amt;

            // 1. Update users.balance
            const [updateResult] = await connection.execute(
                'UPDATE users SET balance = balance + ? WHERE id = ?',
                [amt, userId]
            );
            console.log('[execute-command] DB Response (users update):', updateResult);

            // 2. Insert into ledger — type must be 'DEPOSIT' (valid ENUM value)
            const [ledgerResult] = await connection.execute(
                'INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?, ?, ?, ?, ?)',
                [userId, amt, 'DEPOSIT', newBalance, 'Voice command: ADD_FUND']
            );
            console.log('[execute-command] DB Response (ledger insert):', ledgerResult);

            await connection.commit();

            const [updated] = await connection.execute(
                'SELECT balance FROM users WHERE id = ?', [userId]
            );
            console.log('[execute-command] ✅ ADD_FUND done. newBalance:', updated[0].balance);
            return res.json({
                success   : true,
                message   : 'Fund added successfully',
                userId,
                amountAdded: amt,
                newBalance : updated[0].balance,
            });
        }

        // ── B. BLOCK_USER ─────────────────────────────────────────────────────
        // users.status ENUM: 'Active','Inactive','Suspended'  — use 'Suspended'
        if (action === 'BLOCK_USER') {
            if (!userId) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'userId is required' });
            }

            const [rows] = await connection.execute(
                'SELECT id, status FROM users WHERE id = ?', [userId]
            );
            if (!rows.length) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: `User ${userId} not found` });
            }

            const [result] = await connection.execute(
                "UPDATE users SET status = 'Suspended' WHERE id = ?", [userId]
            );
            console.log('[execute-command] DB Response:', result);

            await connection.commit();
            console.log('[execute-command] ✅ BLOCK_USER done');
            return res.json({ success: true, message: `User ${userId} blocked (Suspended) successfully` });
        }

        // ── C. UNBLOCK_USER ───────────────────────────────────────────────────
        // users.status ENUM: use 'Active' to restore
        if (action === 'UNBLOCK_USER') {
            if (!userId) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'userId is required' });
            }

            const [rows] = await connection.execute(
                'SELECT id, status FROM users WHERE id = ?', [userId]
            );
            if (!rows.length) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: `User ${userId} not found` });
            }

            const [result] = await connection.execute(
                "UPDATE users SET status = 'Active' WHERE id = ?", [userId]
            );
            console.log('[execute-command] DB Response:', result);

            await connection.commit();
            console.log('[execute-command] ✅ UNBLOCK_USER done');
            return res.json({ success: true, message: `User ${userId} unblocked (Active) successfully` });
        }

        // ── D. CREATE_ADMIN ───────────────────────────────────────────────────
        // users table: username NOT NULL UNIQUE, password NOT NULL, full_name NOT NULL
        // role ENUM must be 'ADMIN' (valid value)
        // status ENUM must be 'Active' (valid value)
        if (action === 'CREATE_ADMIN') {
            if (!name || !email) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'name and email are required' });
            }

            // Generate unique username from name (lowercase, no spaces)
            const baseUsername = name.toLowerCase().replace(/\s+/g, '_');
            const username = `${baseUsername}_${Date.now().toString().slice(-5)}`;

            // Check duplicate email OR username
            const [emailCheck] = await connection.execute(
                'SELECT id FROM users WHERE email = ?', [email]
            );
            if (emailCheck.length) {
                await connection.rollback();
                return res.status(409).json({ success: false, message: `Email ${email} already exists` });
            }

            const bcrypt = require('bcryptjs');
            // Use provided password from ai-parse, else generate one
            const plainPassword = password || `Admin@${Math.floor(Math.random() * 9000) + 1000}`;
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            // Insert with all NOT NULL fields satisfied
            const [result] = await connection.execute(
                `INSERT INTO users
                    (username, password, full_name, email, role, status, balance, credit_limit)
                 VALUES (?, ?, ?, ?, 'ADMIN', 'Active', 0, 0)`,
                [username, hashedPassword, name, email]
            );
            console.log('[execute-command] DB Response:', result);

            await connection.commit();
            console.log('[execute-command] ✅ CREATE_ADMIN done. id:', result.insertId);
            return res.json({
                success  : true,
                message  : 'Admin created successfully',
                adminId  : result.insertId,
                username,
                name,
                email,
                password : plainPassword,   // returned once so admin can log in
            });
        }

        // ── E. TRANSFER_FUND ──────────────────────────────────────────────────
        // ledger.type ENUM valid values: 'DEPOSIT','WITHDRAW','TRADE_PNL','BROKERAGE','SWAP'
        // Use 'WITHDRAW' for sender, 'DEPOSIT' for receiver
        if (action === 'TRANSFER_FUND') {
            if (!fromUserId || !toUserId || amount == null) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'fromUserId, toUserId and amount are required' });
            }

            const amt = parseFloat(amount);
            if (isNaN(amt) || amt <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'amount must be a positive number' });
            }

            // Lock both rows for update
            const [fromRows] = await connection.execute(
                'SELECT id, balance FROM users WHERE id = ? FOR UPDATE', [fromUserId]
            );
            if (!fromRows.length) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: `Source user ${fromUserId} not found` });
            }

            const [toRows] = await connection.execute(
                'SELECT id, balance FROM users WHERE id = ? FOR UPDATE', [toUserId]
            );
            if (!toRows.length) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: `Destination user ${toUserId} not found` });
            }

            const fromBal = parseFloat(fromRows[0].balance || 0);
            const toBal   = parseFloat(toRows[0].balance   || 0);

            if (fromBal < amt) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient balance. User ${fromUserId} has ₹${fromBal}`,
                });
            }

            const newFromBal = fromBal - amt;
            const newToBal   = toBal   + amt;

            // 1. Deduct from sender
            await connection.execute(
                'UPDATE users SET balance = balance - ? WHERE id = ?', [amt, fromUserId]
            );
            // 2. Add to receiver
            await connection.execute(
                'UPDATE users SET balance = balance + ? WHERE id = ?', [amt, toUserId]
            );
            // 3. Ledger for sender — type 'WITHDRAW' (valid ENUM)
            await connection.execute(
                'INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?, ?, ?, ?, ?)',
                [fromUserId, amt, 'WITHDRAW', newFromBal, `Voice: TRANSFER to user ${toUserId}`]
            );
            // 4. Ledger for receiver — type 'DEPOSIT' (valid ENUM)
            await connection.execute(
                'INSERT INTO ledger (user_id, amount, type, balance_after, remarks) VALUES (?, ?, ?, ?, ?)',
                [toUserId, amt, 'DEPOSIT', newToBal, `Voice: TRANSFER from user ${fromUserId}`]
            );

            await connection.commit();
            console.log('[execute-command] ✅ TRANSFER_FUND done');
            return res.json({
                success    : true,
                message    : `₹${amt} transferred from user ${fromUserId} to user ${toUserId}`,
                fromUserId,
                toUserId,
                amount     : amt,
                fromBalance: newFromBal,
                toBalance  : newToBal,
            });
        }

        // ── Unknown action ────────────────────────────────────────────────────
        await connection.rollback();
        return res.status(400).json({
            success: false,
            message: `Unknown action: "${action}". Supported: ADD_FUND, BLOCK_USER, UNBLOCK_USER, CREATE_ADMIN, TRANSFER_FUND`,
        });

    } catch (err) {
        await connection.rollback();
        console.error('[execute-command] ❌ DB Error:', err.message);
        return res.status(500).json({ success: false, message: err.message || 'Database operation failed' });
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

module.exports = { aiCommand, processVoiceCommand, aiParse, executeVoiceCommand, voiceExecute };
