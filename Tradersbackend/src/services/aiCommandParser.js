/**
 * AI Command Parser — Natural Language → Structured Intent
 *
 * Supports: Hindi · Hinglish · English
 * Handles ALL modules dynamically: users, trades, funds, brokers, signals,
 * banks, ledger, payment_requests, support_tickets, scrip_data, etc.
 *
 * Two engines:
 * 1. Rule-based (fast, always available)
 * 2. OpenAI-enhanced (if OPENAI_API_KEY is valid)
 *
 * Output format:
 * {
 *   module: 'users' | 'trades' | 'ledger' | 'payment_requests' | 'banks' | ...,
 *   operation: 'read' | 'create' | 'update' | 'delete' | 'aggregate',
 *   filters: { status: 'Active', role: 'TRADER', id: 16, ... },
 *   data: { amount: 5000, name: 'Rahul', ... },
 *   sort: { field: 'created_at', order: 'DESC' },
 *   limit: 50,
 *   route: '/trading-clients',
 *   raw: 'original text'
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD DICTIONARIES (Hindi/Hinglish/English)
// ─────────────────────────────────────────────────────────────────────────────

const OP_READ = [
    'show', 'list', 'get', 'fetch', 'view', 'display', 'find', 'search', 'see', 'check',
    'dikhao', 'dikha', 'batao', 'bata', 'dekho', 'dekh', 'dekhao', 'dedo', 'lao', 'la',
    'nikalo', 'nikal', 'kholo', 'kholke', 'all', 'sabhi', 'sab', 'sare', 'total',
];

const OP_CREATE = [
    'create', 'add', 'new', 'insert', 'make', 'register',
    'banao', 'bana', 'naya', 'nayi', 'dalo', 'daalo', 'jodo', 'jod',
];

const OP_UPDATE = [
    'update', 'edit', 'change', 'modify', 'set',
    'badlo', 'badal', 'karo', 'kar',
];

const OP_DELETE = [
    'delete', 'remove', 'destroy', 'drop', 'erase',
    'hatao', 'hata', 'mita', 'mitao', 'nikal',
];

const OP_BLOCK = ['block', 'suspend', 'band', 'roko', 'rok', 'disable'];
const OP_UNBLOCK = ['unblock', 'activate', 'chalu', 'kholo', 'enable', 'restore'];

const OP_ADD_FUND = ['deposit', 'jama', 'credit', 'bdhao', 'badhao'];
const OP_WITHDRAW = ['withdraw', 'deduct', 'debit', 'nikalo', 'paise hatao', 'balance hatao', 'kam karo'];
const OP_TRANSFER = ['transfer', 'bhejo', 'send'];

// ─────────────────────────────────────────────────────────────────────────────
// MODULE DETECTION PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_PATTERNS = [
    // Order matters — most specific first
    {
        module: 'users',
        subtype: 'TRADER',
        route: '/trading-clients',
        patterns: [
            /\btrading\s*client/i, /\btrading\s*member/i, /\btrading\s*account/i,
            /\btrader/i, /\bclient/i, /\btrading\s*user/i,
        ],
    },
    {
        module: 'users',
        subtype: 'BROKER',
        route: '/broker-accounts',
        patterns: [
            /\bbroker/i, /\bdalal/i, /\bsub\s*broker/i,
        ],
    },
    {
        module: 'users',
        subtype: 'ADMIN',
        route: '/accounts',
        patterns: [
            /\badmin/i, /\badministrator/i,
        ],
    },
    {
        module: 'users',
        subtype: 'SUPERADMIN',
        route: '/accounts',
        patterns: [
            /\bsuper\s*admin/i,
        ],
    },
    {
        module: 'users',
        subtype: null,
        route: '/accounts',
        patterns: [
            /\buser/i, /\baccount/i, /\bmember/i,
        ],
    },
    {
        module: 'trades',
        route: '/trades',
        patterns: [
            /\btrade/i, /\border/i, /\bposition/i, /\bsauda/i,
        ],
    },
    {
        module: 'ledger',
        route: '/funds',
        patterns: [
            /\bledger/i, /\btransaction/i, /\blen\s*den/i,
        ],
    },
    {
        module: 'payment_requests',
        subtype: 'DEPOSIT',
        route: '/deposit-requests',
        patterns: [
            /\bdeposit\s*request/i, /\bjama\s*request/i,
        ],
    },
    {
        module: 'payment_requests',
        subtype: 'WITHDRAW',
        route: '/withdrawal-requests',
        patterns: [
            /\bwithdraw(?:al)?\s*request/i, /\bnikasi\s*request/i,
        ],
    },
    {
        module: 'payment_requests',
        route: '/deposit-requests',
        patterns: [
            /\brequest/i, /\bpayment/i,
        ],
    },
    {
        module: 'funds',
        route: '/funds',
        patterns: [
            /\bfund/i, /\bbalance/i, /\bpais[ae]/i, /\bramashi/i, /\bpaisa/i,
        ],
    },
    {
        module: 'signals',
        route: '/signals',
        patterns: [
            /\bsignal/i, /\btip/i, /\bcall/i,
        ],
    },
    {
        module: 'banks',
        route: '/bank-details',
        patterns: [
            /\bbank/i,
        ],
    },
    {
        module: 'ip_logins',
        route: '/ip-logs',
        patterns: [
            /\bip\s*log/i, /\blogin\s*log/i, /\blogin\s*history/i, /\bip\s*track/i,
        ],
    },
    {
        module: 'support_tickets',
        route: '/support',
        patterns: [
            /\bsupport/i, /\bticket/i, /\bcomplaint/i, /\bshikayat/i,
        ],
    },
    {
        module: 'action_ledger',
        route: '/action-ledger',
        patterns: [
            /\baction\s*ledger/i, /\baction\s*log/i, /\baudit/i,
        ],
    },
    {
        module: 'scrip_data',
        route: '/scrip-data',
        patterns: [
            /\bscrip/i, /\bsymbol/i, /\blot\s*size/i,
        ],
    },
    {
        module: 'global_configs',
        route: '/global-settings',
        patterns: [
            /\bsetting/i, /\bconfig/i, /\bglobal/i,
        ],
    },
    {
        module: 'notifications',
        route: '/notifications',
        patterns: [
            /\bnotification/i, /\bsuchna/i, /\balert/i,
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// FILTER / VALUE EXTRACTION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const extractIds = (text) => {
    const ids = [];

    // "id 16", "ID:16", "user 16", "#16", "id=16"
    const patterns = [
        /(?:id|user|user_id|userId)\s*[:#=]?\s*(\d+)/gi,
        /#(\d+)/g,
    ];

    for (const pat of patterns) {
        let m;
        while ((m = pat.exec(text)) !== null) {
            const id = parseInt(m[1], 10);
            if (!ids.includes(id)) ids.push(id);
        }
    }

    return ids;
};

const extractAmount = (text) => {
    // Remove ID references to avoid treating IDs as amounts
    let cleaned = text.replace(/(?:id|user|user_id)\s*[:#=]?\s*\d+/gi, '');
    cleaned = cleaned.replace(/#\d+/g, '');

    // "5k" → 5000, "10k" → 10000
    const kMatch = cleaned.match(/(\d+)\s*k\b/i);
    if (kMatch) return parseInt(kMatch[1], 10) * 1000;

    // "1,00,000" or "10,000" → number
    const commaMatch = cleaned.match(/(\d[\d,]+\d)/);
    if (commaMatch) return parseFloat(commaMatch[1].replace(/,/g, ''));

    // Plain number (3+ digits to avoid matching small id-like numbers)
    const numMatch = cleaned.match(/\b(\d{3,})\b/);
    if (numMatch) return parseFloat(numMatch[1]);

    // Any remaining number
    const anyNum = cleaned.match(/\b(\d+)\b/);
    if (anyNum) return parseFloat(anyNum[1]);

    return null;
};

const extractName = (text) => {
    // "naam Rahul", "name John", "name: Rahul Kumar"
    const m = text.match(/(?:naam|name)\s*[:#]?\s*([A-Za-z][A-Za-z\s]{1,30}?)(?:\s+email|\s+id|\s+pass|\s+mobile|\s*$)/i);
    return m ? m[1].trim() : null;
};

const extractEmail = (text) => {
    const m = text.match(/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i);
    return m ? m[0] : null;
};

const extractPhone = (text) => {
    const m = text.match(/(?:mobile|phone|number)\s*[:#]?\s*(\d{10,12})/i);
    return m ? m[1] : null;
};

const extractPassword = (text) => {
    const m = text.match(/(?:password|pass|pwd)\s*[:#]?\s*(\S+)/i);
    return m ? m[1] : null;
};

const extractStatus = (text) => {
    const tl = text.toLowerCase();

    // User status
    if (/\bblocked\b|\bsuspended\b|\bband\b|\bruka\b/.test(tl)) return 'Suspended';
    if (/\bactive\b|\bchalu\b|\bchalte\b/.test(tl)) return 'Active';
    if (/\binactive\b|\bbandh?\b/.test(tl)) return 'Inactive';

    // Trade status
    if (/\bopen\b|\bchalu\b|\bchalte\b/.test(tl)) return 'OPEN';
    if (/\bclosed?\b|\bband\b|\bcomplete/i.test(tl)) return 'CLOSED';
    if (/\bcancel/i.test(tl)) return 'CANCELLED';

    // Request status
    if (/\bpending\b|\bruka\b/.test(tl)) return 'PENDING';
    if (/\bapproved\b|\bmanzoor\b/.test(tl)) return 'APPROVED';
    if (/\brejected?\b|\bnamanZoor\b/.test(tl)) return 'REJECTED';

    return null;
};

const extractTradeType = (text) => {
    const tl = text.toLowerCase();
    if (/\bbuy\b|\bkhareed/i.test(tl)) return 'BUY';
    if (/\bsell\b|\bbech/i.test(tl)) return 'SELL';
    return null;
};

const extractDateRange = (text) => {
    const tl = text.toLowerCase();
    const now = new Date();

    if (/\baaj\b|\btoday\b/.test(tl)) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { start, end: now };
    }

    if (/\bkal\b|\byesterday\b/.test(tl)) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { start, end };
    }

    if (/\bis\s*hafte?\b|\bthis\s*week\b/.test(tl)) {
        const day = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
    }

    if (/\bpichle?\s*hafte?\b|\blast\s*week\b/.test(tl)) {
        const day = now.getDay();
        const end = new Date(now);
        end.setDate(now.getDate() - day);
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(end.getDate() - 7);
        return { start, end };
    }

    if (/\bis\s*mahine?\b|\bthis\s*month\b/.test(tl)) {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start, end: now };
    }

    if (/\bpichle?\s*mahine?\b|\blast\s*month\b/.test(tl)) {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start, end };
    }

    return null;
};

const extractSymbol = (text) => {
    // Common trading symbols
    const symbols = ['GOLD', 'SILVER', 'CRUDEOIL', 'CRUDE', 'ALUMINIUM', 'COPPER', 'ZINC', 'LEAD',
                     'NIFTY', 'BANKNIFTY', 'SENSEX', 'NATURALGAS', 'NICKEL'];
    const tl = text.toUpperCase();
    for (const sym of symbols) {
        if (tl.includes(sym)) return sym;
    }
    return null;
};

const extractLimit = (text) => {
    const m = text.match(/(?:top|first|last|limit)\s*(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// DUMMY CREDENTIAL GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const makeDummy = () => {
    const adj = ['quick', 'smart', 'bold', 'swift', 'prime'][Math.floor(Math.random() * 5)];
    const noun = ['admin', 'trader', 'broker', 'agent', 'user'][Math.floor(Math.random() * 5)];
    const num = Math.floor(Math.random() * 900) + 100;
    return {
        name: `${adj}_${noun}`,
        email: `${adj}.${noun}${num}@example.com`,
        password: `Pass${num}@!`,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RULE-BASED PARSER
// ─────────────────────────────────────────────────────────────────────────────

const parseWithRules = (rawText) => {
    const text = rawText.trim();
    const tl = text.toLowerCase();
    const words = tl.split(/\s+/);

    const result = {
        module: null,
        operation: 'read',
        filters: {},
        data: {},
        sort: null,
        limit: null,
        route: null,
        raw: rawText,
    };

    // ── 1. Detect Module ────────────────────────────────────────────────────

    let matchedModule = null;
    for (const mp of MODULE_PATTERNS) {
        for (const pat of mp.patterns) {
            if (pat.test(tl)) {
                matchedModule = mp;
                break;
            }
        }
        if (matchedModule) break;
    }

    if (matchedModule) {
        result.module = matchedModule.module;
        result.route = matchedModule.route;

        // Set role/type filter for user subtypes
        if (matchedModule.module === 'users' && matchedModule.subtype) {
            result.filters.role = matchedModule.subtype;
        }
        if (matchedModule.module === 'payment_requests' && matchedModule.subtype) {
            result.filters.type = matchedModule.subtype;
        }
    }

    // ── 2. Detect Operation ─────────────────────────────────────────────────

    // Check most specific operations first

    // TRANSFER (needs two IDs)
    const isTransfer = OP_TRANSFER.some(w => tl.includes(w)) ||
                       /se\s+.*?\s+(?:me|ko|m[eè])\b/.test(tl);
    const ids = extractIds(text);

    if (isTransfer && ids.length >= 2) {
        result.operation = 'transfer';
        result.module = 'funds';
        result.route = '/funds';
        result.data.fromUserId = ids[0];
        result.data.toUserId = ids[1];
        result.data.amount = extractAmount(text) || 0;
        return result;
    }

    // BLOCK/UNBLOCK
    const isBlock = OP_BLOCK.some(w => {
        const re = new RegExp(`(?<!un)\\b${w}\\b`, 'i');
        return re.test(tl);
    });
    const isUnblock = OP_UNBLOCK.some(w => tl.includes(w));

    if (isUnblock && ids.length > 0) {
        result.operation = 'unblock';
        result.module = 'users';
        result.route = '/accounts';
        result.filters.id = ids[0];
        return result;
    }

    if (isBlock && ids.length > 0) {
        result.operation = 'block';
        result.module = 'users';
        result.route = '/accounts';
        result.filters.id = ids[0];
        return result;
    }

    // ADD_FUND / WITHDRAW
    const isAddFund = OP_ADD_FUND.some(w => tl.includes(w)) ||
                      (/\badd\b/.test(tl) && /\bfund\b|\bbalance\b|\bpais[ae]\b|\bramashi\b/.test(tl)) ||
                      (/\badd\b/.test(tl) && ids.length > 0 && extractAmount(text) !== null);
    const isWithdraw = OP_WITHDRAW.some(w => tl.includes(w)) ||
                       (/\bhatao\b|\bhata\b/.test(tl) && /pais[ae]|fund|balance|ramashi/.test(tl));

    if (isWithdraw && ids.length > 0) {
        result.operation = 'withdraw';
        result.module = 'funds';
        result.route = '/funds';
        result.filters.id = ids[0];
        result.data.amount = extractAmount(text) || 0;
        return result;
    }

    if (isAddFund && ids.length > 0) {
        result.operation = 'add_fund';
        result.module = 'funds';
        result.route = '/funds';
        result.filters.id = ids[0];
        result.data.amount = extractAmount(text) || 0;
        return result;
    }

    // CREATE (admin/broker/user)
    const isCreate = OP_CREATE.some(w => tl.includes(w));
    const isCreateAdmin = isCreate && /\badmin\b/.test(tl);
    const isCreateBroker = isCreate && /\bbroker\b/.test(tl);
    const isCreateUser = isCreate && /\buser\b|\btrader\b|\bclient\b/.test(tl);

    if (isCreateAdmin || isCreateBroker || isCreateUser) {
        result.operation = 'create';
        result.module = 'users';

        const isDummy = /dummy|fake|test|sample|random/.test(tl);
        const name = extractName(text);
        const email = extractEmail(text);
        const password = extractPassword(text);
        const phone = extractPhone(text);

        if (isDummy || (!name && !email)) {
            const d = makeDummy();
            result.data = {
                name: name || d.name,
                email: email || d.email,
                password: password || d.password,
            };
        } else {
            result.data = {
                name: name || 'admin',
                email: email || `admin${Date.now()}@example.com`,
                password: password || 'Admin@123',
            };
        }

        if (phone) result.data.mobile = phone;

        if (isCreateAdmin) {
            result.data.role = 'ADMIN';
            result.route = '/accounts';
        } else if (isCreateBroker) {
            result.data.role = 'BROKER';
            result.route = '/broker-accounts';
        } else {
            result.data.role = 'TRADER';
            result.route = '/trading-clients';
        }

        return result;
    }

    // DELETE
    const isDelete = OP_DELETE.some(w => tl.includes(w)) && !isWithdraw;
    if (isDelete && ids.length > 0) {
        result.operation = 'delete';
        result.filters.id = ids[0];
        if (!result.module) result.module = 'users';
        return result;
    }

    // UPDATE (generic)
    const isUpdate = OP_UPDATE.some(w => tl.includes(w));
    if (isUpdate && ids.length > 0 && !isBlock && !isUnblock && !isAddFund && !isWithdraw) {
        result.operation = 'update';
        result.filters.id = ids[0];
        // Extract any name/email/phone for data
        const name = extractName(text);
        const email = extractEmail(text);
        const phone = extractPhone(text);
        if (name) result.data.full_name = name;
        if (email) result.data.email = email;
        if (phone) result.data.mobile = phone;
        return result;
    }

    // ── 3. Default to READ — apply all filters ──────────────────────────────

    result.operation = 'read';

    // Status filter
    const status = extractStatus(text);
    if (status) {
        result.filters.status = status;
    }

    // Trade type filter
    const tradeType = extractTradeType(text);
    if (tradeType && (result.module === 'trades' || !result.module)) {
        result.filters.type = tradeType;
        if (!result.module) { result.module = 'trades'; result.route = '/trades'; }
    }

    // Symbol filter
    const symbol = extractSymbol(text);
    if (symbol) {
        result.filters.symbol = symbol;
        if (!result.module) { result.module = 'trades'; result.route = '/trades'; }
    }

    // Date range
    const dateRange = extractDateRange(text);
    if (dateRange) result.filters.dateRange = dateRange;

    // ID filter (single record)
    if (ids.length === 1) result.filters.id = ids[0];

    // Limit
    const limit = extractLimit(text);
    if (limit) result.limit = limit;

    // Sort detection
    if (/\blatest\b|\brecent\b|\bnaye?\b|\bnayi\b/.test(tl)) {
        result.sort = { field: 'created_at', order: 'DESC' };
    }
    if (/\boldest\b|\bpurane?\b|\bpahle?\b/.test(tl)) {
        result.sort = { field: 'created_at', order: 'ASC' };
    }
    if (/\bhighest\b|\bsabse\s*zyada\b|\bmaximum\b|\bmax\b/.test(tl)) {
        result.sort = { field: 'amount', order: 'DESC' };
    }

    // ── 4. Aggregation detection ────────────────────────────────────────────

    if (/\btotal\b|\bsum\b|\bcount\b|\bkitne?\b|\bkitni\b|\bhow\s*many\b/.test(tl)) {
        result.operation = 'aggregate';
    }

    // ── 5. Fallback module detection ────────────────────────────────────────

    if (!result.module) {
        // If we have fund-related keywords but no module yet
        if (/fund|balance|pais[ae]|deposit|withdraw|ledger|transaction/.test(tl)) {
            result.module = 'ledger';
            result.route = '/funds';
        } else if (/trade|order|position|sauda/.test(tl)) {
            result.module = 'trades';
            result.route = '/trades';
        } else {
            result.module = 'users';
            result.route = '/accounts';
        }
    }

    return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// OPENAI-ENHANCED PARSER
// ─────────────────────────────────────────────────────────────────────────────

const OPENAI_SYSTEM_PROMPT = `You are an AI command parser for a Trading Admin Panel.
Users speak in Hindi, Hinglish, or English. Parse their intent into structured JSON.

DATABASE TABLES:
- users (id, username, full_name, email, mobile, role[SUPERADMIN/ADMIN/BROKER/TRADER], status[Active/Inactive/Suspended], balance, parent_id)
- trades (id, user_id, symbol, type[BUY/SELL], order_type, qty, entry_price, exit_price, status[OPEN/CLOSED/CANCELLED/DELETED], pnl)
- ledger (id, user_id, amount, type[DEPOSIT/WITHDRAW/TRADE_PNL/BROKERAGE/SWAP], balance_after, remarks)
- payment_requests (id, user_id, amount, type[DEPOSIT/WITHDRAW], status[PENDING/APPROVED/REJECTED])
- signals (id, symbol, type[BUY/SELL], entry_price, target, stop_loss, is_active)
- banks (id, bank_name, account_number, ifsc_code, status)
- ip_logins (id, user_id, username, ip_address, location, device, risk_score)
- support_tickets (id, user_id, subject, message, status[PENDING/RESOLVED])
- action_ledger (id, admin_id, action_type, target_table, description)
- scrip_data (id, symbol, lot_size, margin_req, status)
- global_configs (id, config_key, config_value, module)

OUTPUT FORMAT (JSON only):
{
  "module": "users|trades|ledger|payment_requests|funds|signals|banks|ip_logins|support_tickets|action_ledger|scrip_data|global_configs",
  "operation": "read|create|update|delete|block|unblock|add_fund|withdraw|transfer|aggregate",
  "filters": { field: value pairs for WHERE clause },
  "data": { field: value pairs for INSERT/UPDATE },
  "sort": { "field": "column", "order": "ASC|DESC" } or null,
  "limit": number or null,
  "route": "frontend route path"
}

EXAMPLES:
"trading clients dikhao" → {"module":"users","operation":"read","filters":{"role":"TRADER"},"data":{},"sort":null,"limit":null,"route":"/trading-clients"}
"blocked users dikhao" → {"module":"users","operation":"read","filters":{"status":"Suspended"},"data":{},"sort":null,"limit":null,"route":"/accounts"}
"ID 16 me 5000 add karo" → {"module":"funds","operation":"add_fund","filters":{"id":16},"data":{"amount":5000},"sort":null,"limit":null,"route":"/funds"}
"user 20 ko block karo" → {"module":"users","operation":"block","filters":{"id":20},"data":{},"sort":null,"limit":null,"route":"/accounts"}
"aaj ke trades dikhao" → {"module":"trades","operation":"read","filters":{"dateRange":"today"},"data":{},"sort":{"field":"entry_time","order":"DESC"},"limit":null,"route":"/trades"}
"admin banao naam Rahul email rahul@test.com" → {"module":"users","operation":"create","filters":{},"data":{"name":"Rahul","email":"rahul@test.com","role":"ADMIN","password":"Admin@123"},"sort":null,"limit":null,"route":"/accounts"}
"deposit requests pending" → {"module":"payment_requests","operation":"read","filters":{"type":"DEPOSIT","status":"PENDING"},"data":{},"sort":null,"limit":null,"route":"/deposit-requests"}
"ID 10 se ID 20 me 500 transfer karo" → {"module":"funds","operation":"transfer","filters":{},"data":{"fromUserId":10,"toUserId":20,"amount":500},"sort":null,"limit":null,"route":"/funds"}
"total kitne traders hai" → {"module":"users","operation":"aggregate","filters":{"role":"TRADER"},"data":{},"sort":null,"limit":null,"route":"/trading-clients"}
"top 10 trades by pnl" → {"module":"trades","operation":"read","filters":{},"data":{},"sort":{"field":"pnl","order":"DESC"},"limit":10,"route":"/trades"}

RULES:
- Detect intent FIRST, then extract fields
- "trading client" = role TRADER, "broker" = role BROKER, "admin" = role ADMIN
- "blocked" users → status "Suspended" (that's the DB enum value)
- For fund operations, always extract userId + amount
- For create, extract name/email/password/role
- Always return valid JSON, no extra text
- dateRange: use "today","yesterday","this_week","last_week","this_month","last_month"`;

const parseWithOpenAI = async (text) => {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: OPENAI_SYSTEM_PROMPT },
            { role: 'user', content: text },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    // Normalize dateRange strings from OpenAI to actual Date objects
    if (parsed.filters?.dateRange && typeof parsed.filters.dateRange === 'string') {
        const now = new Date();
        const rangeMap = {
            today: () => {
                const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return { start: s, end: now };
            },
            yesterday: () => {
                const s = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                const e = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return { start: s, end: e };
            },
            this_week: () => {
                const s = new Date(now);
                s.setDate(now.getDate() - now.getDay());
                s.setHours(0, 0, 0, 0);
                return { start: s, end: now };
            },
            last_week: () => {
                const e = new Date(now);
                e.setDate(now.getDate() - now.getDay());
                e.setHours(0, 0, 0, 0);
                const s = new Date(e);
                s.setDate(e.getDate() - 7);
                return { start: s, end: e };
            },
            this_month: () => {
                const s = new Date(now.getFullYear(), now.getMonth(), 1);
                return { start: s, end: now };
            },
            last_month: () => {
                const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const e = new Date(now.getFullYear(), now.getMonth(), 1);
                return { start: s, end: e };
            },
        };
        const fn = rangeMap[parsed.filters.dateRange];
        parsed.filters.dateRange = fn ? fn() : null;
    }

    return parsed;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PARSER ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * parseCommand(text) → structured intent JSON
 *
 * 1. Try OpenAI if key is valid
 * 2. Fallback to rule-based
 * 3. Never returns null — always returns a valid structure
 */
const parseCommand = async (text) => {
    const hasValidKey =
        process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY.length > 30 &&
        !process.env.OPENAI_API_KEY.startsWith('sk-your') &&
        !process.env.OPENAI_API_KEY.includes('placeholder');

    let result;

    if (hasValidKey) {
        try {
            result = await parseWithOpenAI(text);
            console.log('[aiCommandParser] ✅ OpenAI parsed:', JSON.stringify(result));
        } catch (err) {
            console.warn('[aiCommandParser] ⚠️ OpenAI failed:', err.message);
            result = parseWithRules(text);
            console.log('[aiCommandParser] ✅ Rule-based parsed:', JSON.stringify(result));
        }
    } else {
        result = parseWithRules(text);
        console.log('[aiCommandParser] ✅ Rule-based parsed:', JSON.stringify(result));
    }

    // Ensure required fields
    result.module = result.module || 'users';
    result.operation = result.operation || 'read';
    result.filters = result.filters || {};
    result.data = result.data || {};
    result.raw = text;

    return result;
};

module.exports = { parseCommand, parseWithRules, extractIds, extractAmount };
