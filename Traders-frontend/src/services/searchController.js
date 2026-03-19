/**
 * Universal Search Controller
 *
 * Sends user query to backend AI parser → gets structured JSON instruction
 * → executes the right API call → returns data
 *
 * Flow:
 *   User query  →  POST /ai/ai-parse  →  { module, operation, filters, route, riskLevel }
 *               →  executeSearch(module, filters)
 *               →  return { success, data, query, count }
 */

import api from '../utils/api';
import * as apiService from './api';

// ─── Step 1: Ask backend AI to parse the query ───────────────────────────────

// ─── Intent → structured instruction map ────────────────────────────────────

// Helper to build a read entry quickly
const _r = (module, filters, route) => ({ module, filters: filters || {}, route, riskLevel: 'low' });

const INTENT_MAP = {
    // ── Users / Trading Clients ───────────────────────────────────────────────
    get_trading_clients:        _r('users', { role: 'TRADER' },               '/trading-clients'),
    show_trading_clients:       _r('users', { role: 'TRADER' },               '/trading-clients'),
    list_trading_clients:       _r('users', { role: 'TRADER' },               '/trading-clients'),
    fetch_trading_clients:      _r('users', { role: 'TRADER' },               '/trading-clients'),
    view_trading_clients:       _r('users', { role: 'TRADER' },               '/trading-clients'),
    get_all_trading_clients:    _r('users', { role: 'TRADER' },               '/trading-clients'),
    get_clients:                _r('users', { role: 'TRADER' },               '/trading-clients'),
    show_clients:               _r('users', { role: 'TRADER' },               '/trading-clients'),
    list_clients:               _r('users', { role: 'TRADER' },               '/trading-clients'),
    get_all_clients:            _r('users', {},                                '/trading-clients'),
    get_users:                  _r('users', {},                                '/trading-clients'),
    show_users:                 _r('users', {},                                '/trading-clients'),
    list_users:                 _r('users', {},                                '/trading-clients'),
    get_active_clients:         _r('users', { role: 'TRADER', status: 'ACTIVE' },  '/trading-clients'),
    get_blocked_clients:        _r('users', { role: 'TRADER', status: 'BLOCKED' }, '/trading-clients'),
    show_active_clients:        _r('users', { role: 'TRADER', status: 'ACTIVE' },  '/trading-clients'),
    show_blocked_clients:       _r('users', { role: 'TRADER', status: 'BLOCKED' }, '/trading-clients'),

    // ── Admins ────────────────────────────────────────────────────────────────
    get_admins:                 _r('admins', {},                               '/admins'),
    show_admins:                _r('admins', {},                               '/admins'),
    list_admins:                _r('admins', {},                               '/admins'),
    fetch_admins:               _r('admins', {},                               '/admins'),
    view_admins:                _r('admins', {},                               '/admins'),
    get_all_admins:             _r('admins', {},                               '/admins'),

    // ── Brokers ───────────────────────────────────────────────────────────────
    get_brokers:                _r('brokers', {},                              '/broker-accounts'),
    show_brokers:               _r('brokers', {},                              '/broker-accounts'),
    list_brokers:               _r('brokers', {},                              '/broker-accounts'),
    fetch_brokers:              _r('brokers', {},                              '/broker-accounts'),
    view_brokers:               _r('brokers', {},                              '/broker-accounts'),
    get_all_brokers:            _r('brokers', {},                              '/broker-accounts'),
    get_broker_list:            _r('brokers', {},                              '/broker-accounts'),
    show_broker_list:           _r('brokers', {},                              '/broker-accounts'),
    get_active_brokers:         _r('brokers', { status: 'ACTIVE' },           '/broker-accounts'),
    show_active_brokers:        _r('brokers', { status: 'ACTIVE' },           '/broker-accounts'),
    list_active_brokers:        _r('brokers', { status: 'ACTIVE' },           '/broker-accounts'),

    // ── Trades ────────────────────────────────────────────────────────────────
    get_trades:                 _r('trades', {},                               '/trades'),
    show_trades:                _r('trades', {},                               '/trades'),
    list_trades:                _r('trades', {},                               '/trades'),
    fetch_trades:               _r('trades', {},                               '/trades'),
    view_trades:                _r('trades', {},                               '/trades'),
    get_all_trades:             _r('trades', {},                               '/trades'),
    get_active_trades:          _r('trades', { status: 'ACTIVE' },            '/trades'),
    show_active_trades:         _r('trades', { status: 'ACTIVE' },            '/trades'),
    list_active_trades:         _r('trades', { status: 'ACTIVE' },            '/trades'),
    get_closed_trades:          _r('trades', { status: 'CLOSED' },            '/closed-positions'),
    show_closed_trades:         _r('trades', { status: 'CLOSED' },            '/closed-positions'),
    list_closed_trades:         _r('trades', { status: 'CLOSED' },            '/closed-positions'),
    get_positions:              _r('trades', {},                               '/trades'),
    show_positions:             _r('trades', {},                               '/trades'),
    get_open_positions:         _r('trades', { status: 'ACTIVE' },            '/trades'),

    // ── Funds ─────────────────────────────────────────────────────────────────
    get_funds:                  _r('funds', {},                                '/funds'),
    show_funds:                 _r('funds', {},                                '/funds'),
    list_funds:                 _r('funds', {},                                '/funds'),
    fetch_funds:                _r('funds', {},                                '/funds'),
    view_funds:                 _r('funds', {},                                '/funds'),
    get_all_funds:              _r('funds', {},                                '/funds'),
    get_deposit_requests:       _r('funds', { type: 'deposit' },               '/funds'),
    show_deposit_requests:      _r('funds', { type: 'deposit' },               '/funds'),
    list_deposit_requests:      _r('funds', { type: 'deposit' },               '/funds'),
    get_deposits:               _r('funds', { type: 'deposit' },               '/funds'),
    show_deposits:              _r('funds', { type: 'deposit' },               '/funds'),
    get_withdrawal_requests:    _r('funds', { type: 'withdrawal' },            '/funds'),
    show_withdrawal_requests:   _r('funds', { type: 'withdrawal' },            '/funds'),
    list_withdrawal_requests:   _r('funds', { type: 'withdrawal' },            '/funds'),
    get_withdrawals:            _r('funds', { type: 'withdrawal' },            '/funds'),
    show_withdrawals:           _r('funds', { type: 'withdrawal' },            '/funds'),
    add_fund:                   { module: 'funds', operation: 'add',      riskLevel: 'high', requiresConfirmation: true, route: '/funds' },
    withdraw_fund:              { module: 'funds', operation: 'withdraw', riskLevel: 'high', requiresConfirmation: true, route: '/funds' },

    // ── Orders / Requests ─────────────────────────────────────────────────────
    get_orders:                 _r('orders', {},                               '/pending-orders'),
    show_orders:                _r('orders', {},                               '/pending-orders'),
    list_orders:                _r('orders', {},                               '/pending-orders'),
    fetch_orders:               _r('orders', {},                               '/pending-orders'),
    view_orders:                _r('orders', {},                               '/pending-orders'),
    get_all_orders:             _r('orders', {},                               '/pending-orders'),
    get_pending_orders:         _r('orders', { status: 'PENDING' },            '/pending-orders'),
    show_pending_orders:        _r('orders', { status: 'PENDING' },            '/pending-orders'),
    list_pending_orders:        _r('orders', { status: 'PENDING' },            '/pending-orders'),
    get_approved_orders:        _r('orders', { status: 'APPROVED' },           '/pending-orders'),
    show_approved_orders:       _r('orders', { status: 'APPROVED' },           '/pending-orders'),
    get_rejected_orders:        _r('orders', { status: 'REJECTED' },           '/pending-orders'),
    show_rejected_orders:       _r('orders', { status: 'REJECTED' },           '/pending-orders'),
    get_requests:               _r('orders', {},                               '/pending-orders'),
    show_requests:              _r('orders', {},                               '/pending-orders'),
    list_requests:              _r('orders', {},                               '/pending-orders'),

    // ── Notifications ───────────────────────────────────────────────────────
    get_notifications:          _r('notifications', {},                  '/notifications'),
    show_notifications:         _r('notifications', {},                  '/notifications'),
    list_notifications:         _r('notifications', {},                  '/notifications'),
    fetch_notifications:        _r('notifications', {},                  '/notifications'),
    view_notifications:         _r('notifications', {},                  '/notifications'),
    get_all_notifications:      _r('notifications', {},                  '/notifications'),
    show_all_notifications:     _r('notifications', {},                  '/notifications'),
    get_unread_notifications:   _r('notifications', { unread: true },    '/notifications'),
    show_unread_notifications:  _r('notifications', { unread: true },    '/notifications'),

    // ── Action Ledger ────────────────────────────────────────────────────────
    get_action_ledger:          _r('action_ledger', {},                  '/action-ledger'),
    show_action_ledger:         _r('action_ledger', {},                  '/action-ledger'),
    list_action_ledger:         _r('action_ledger', {},                  '/action-ledger'),
    view_action_ledger:         _r('action_ledger', {},                  '/action-ledger'),
    get_logs:                   _r('action_ledger', {},                  '/action-ledger'),
    show_logs:                  _r('action_ledger', {},                  '/action-ledger'),
    get_activity_log:           _r('action_ledger', {},                  '/action-ledger'),
    show_activity_log:          _r('action_ledger', {},                  '/action-ledger'),

    // ── Active Positions ─────────────────────────────────────────────────────
    get_active_positions:       _r('active_positions', {},               '/active-positions'),
    show_active_positions:      _r('active_positions', {},               '/active-positions'),
    list_active_positions:      _r('active_positions', {},               '/active-positions'),
    view_active_positions:      _r('active_positions', {},               '/active-positions'),

    // ── Closed Positions ─────────────────────────────────────────────────────
    get_closed_positions:       _r('closed_positions', {},               '/closed-positions'),
    show_closed_positions:      _r('closed_positions', {},               '/closed-positions'),
    list_closed_positions:      _r('closed_positions', {},               '/closed-positions'),
    view_closed_positions:      _r('closed_positions', {},               '/closed-positions'),

    // ── Group Trades ─────────────────────────────────────────────────────────
    get_group_trades:           _r('group_trades', {},                   '/group-trades'),
    show_group_trades:          _r('group_trades', {},                   '/group-trades'),
    list_group_trades:          _r('group_trades', {},                   '/group-trades'),
    view_group_trades:          _r('group_trades', {},                   '/group-trades'),

    // ── Deleted Trades ───────────────────────────────────────────────────────
    get_deleted_trades:         _r('deleted_trades', {},                 '/deleted-trades'),
    show_deleted_trades:        _r('deleted_trades', {},                 '/deleted-trades'),
    list_deleted_trades:        _r('deleted_trades', {},                 '/deleted-trades'),
    view_deleted_trades:        _r('deleted_trades', {},                 '/deleted-trades'),

    // ── IP Logins ────────────────────────────────────────────────────────────
    get_ip_logins:              _r('ip_logins', {},                      '/ip-logins'),
    show_ip_logins:             _r('ip_logins', {},                      '/ip-logins'),
    list_ip_logins:             _r('ip_logins', {},                      '/ip-logins'),
    view_ip_logins:             _r('ip_logins', {},                      '/ip-logins'),
    get_login_history:          _r('ip_logins', {},                      '/ip-logins'),
    show_login_history:         _r('ip_logins', {},                      '/ip-logins'),

    // ── Tickers ──────────────────────────────────────────────────────────────
    get_tickers:                _r('tickers', {},                        '/tickers'),
    show_tickers:               _r('tickers', {},                        '/tickers'),
    list_tickers:               _r('tickers', {},                        '/tickers'),
    view_tickers:               _r('tickers', {},                        '/tickers'),

    // ── Bank Details ─────────────────────────────────────────────────────────
    get_bank_details:           _r('bank_details', {},                   '/bank'),
    show_bank_details:          _r('bank_details', {},                   '/bank'),
    list_bank_details:          _r('bank_details', {},                   '/bank'),
    view_bank_details:          _r('bank_details', {},                   '/bank'),
    get_banks:                  _r('bank_details', {},                   '/bank'),
    show_banks:                 _r('bank_details', {},                   '/bank'),

    // ── Negative Balance ─────────────────────────────────────────────────────
    get_negative_balance:       _r('negative_balance', {},               '/negative-balance'),
    show_negative_balance:      _r('negative_balance', {},               '/negative-balance'),
    list_negative_balance:      _r('negative_balance', {},               '/negative-balance'),

    // ── Banned Orders ────────────────────────────────────────────────────────
    get_banned_orders:          _r('banned_orders', {},                  '/banned'),
    show_banned_orders:         _r('banned_orders', {},                  '/banned'),
    list_banned_orders:         _r('banned_orders', {},                  '/banned'),

    // ── Dangerous ─────────────────────────────────────────────────────────────
    delete_user:                { module: 'users',  operation: 'delete', riskLevel: 'high', requiresConfirmation: true, route: '/trading-clients' },
    block_user:                 { module: 'users',  operation: 'block',  riskLevel: 'high', requiresConfirmation: true, route: '/trading-clients' },
    delete_trade:               { module: 'trades', operation: 'delete', riskLevel: 'high', requiresConfirmation: true, route: '/trades' },
};

/**
 * Convert intent string like "get_trading_clients" → structured instruction
 */
const intentToInstruction = (intent, originalText) => {
    if (!intent) return null;

    const key = intent.toLowerCase().trim();
    const mapped = INTENT_MAP[key];

    if (mapped) {
        // Extract userId/amount from original text if present
        const idMatch = originalText.match(/(?:id|ID|user|#)\s*[:#]?\s*(\d+)/i) || originalText.match(/\b(\d{2,6})\b/);
        const limitMatch = originalText.match(/(?:top|last|recent|first)\s+(\d+)/i);
        const filters = { ...(mapped.filters || {}) };
        if (idMatch)    filters.userId = parseInt(idMatch[1]);
        if (limitMatch) filters.limit  = parseInt(limitMatch[1]);

        return {
            ...mapped,
            operation: mapped.operation || 'get',
            filters,
            message: `Searching ${mapped.module}${filters.status ? ` (${filters.status})` : ''}`,
        };
    }

    // Unknown intent → try to derive from intent string itself
    console.warn('[SearchController] Unknown intent:', key, '→ deriving from string');
    return deriveFromIntentString(key, originalText);
};

/**
 * Last resort: derive module from intent string keywords
 * e.g. "get_xyz_clients" → users, "get_xyz_trades" → trades
 */
const deriveFromIntentString = (intent, originalText) => {
    const i = intent.toLowerCase();
    let module = 'users';
    let route = '/trading-clients';

    // Check most specific first to avoid false matches (e.g. "trading_client" contains "trade")
    if (i.includes('notification') || i.includes('notif'))
                                    { module = 'notifications'; route = '/notifications'; }
    else if (i.includes('action') && i.includes('ledger'))
                                    { module = 'action_ledger'; route = '/action-ledger'; }
    else if (i.includes('active') && i.includes('position'))
                                    { module = 'active_positions'; route = '/active-positions'; }
    else if (i.includes('closed') && i.includes('position'))
                                    { module = 'closed_positions'; route = '/closed-positions'; }
    else if (i.includes('group') && i.includes('trade'))
                                    { module = 'group_trades'; route = '/group-trades'; }
    else if (i.includes('deleted') && i.includes('trade'))
                                    { module = 'deleted_trades'; route = '/deleted-trades'; }
    else if (i.includes('ip') && (i.includes('login') || i.includes('log')))
                                    { module = 'ip_logins'; route = '/ip-logins'; }
    else if (i.includes('ticker'))  { module = 'tickers'; route = '/tickers'; }
    else if (i.includes('bank'))    { module = 'bank_details'; route = '/bank'; }
    else if (i.includes('negative') && i.includes('balance'))
                                    { module = 'negative_balance'; route = '/negative-balance'; }
    else if (i.includes('banned'))  { module = 'banned_orders'; route = '/banned'; }
    else if (i.includes('broker'))  { module = 'brokers'; route = '/broker-accounts'; }
    else if (i.includes('admin'))   { module = 'admins';  route = '/admins'; }
    else if (i.includes('fund') || i.includes('balance') || i.includes('deposit') || i.includes('withdraw'))
                                    { module = 'funds';   route = '/funds'; }
    else if (i.includes('order') || i.includes('request'))
                                    { module = 'orders';  route = '/pending-orders'; }
    else if ((i.includes('client') || i.includes('user') || i.includes('trader') || i.includes('member')) && !i.includes('broker'))
                                    { module = 'users';   route = '/trading-clients'; }
    else if (i.includes('trade') || i.includes('position'))
                                    { module = 'trades';  route = '/trades'; }

    const filters = {};
    if (i.includes('active'))   filters.status = 'ACTIVE';
    if (i.includes('closed'))   filters.status = 'CLOSED';
    if (i.includes('blocked'))  filters.status = 'BLOCKED';
    if (i.includes('pending'))  filters.status = 'PENDING';

    return { module, operation: 'get', filters, route, riskLevel: 'low', message: `Searching ${module}` };
};

/**
 * Extract a valid parsed object from any backend response shape:
 *   - Intent format:  { intent: "get_trading_clients" }
 *   - Direct:         { module, operation, ... }
 *   - Wrapped:        { data: { module, ... } } or { data: { intent: ... } }
 */
const extractParsed = (raw, originalText) => {
    if (!raw) return null;

    // ── Intent format (most likely from this backend) ──
    const intentValue = raw.intent || raw.data?.intent || raw.result?.intent;
    if (intentValue) {
        console.log('[SearchController] Intent detected:', intentValue);
        return intentToInstruction(intentValue, originalText);
    }

    // ── Direct structured format ──
    if (raw.module) return raw;
    if (raw.data?.module) return raw.data;
    if (raw.result?.module) return raw.result;

    // ── Stringified JSON in text field ──
    const textField = raw.text || raw.response || raw.content || raw.output;
    if (typeof textField === 'string') {
        try {
            const m = textField.match(/\{[\s\S]*\}/);
            if (m) {
                const obj = JSON.parse(m[0]);
                if (obj.intent) return intentToInstruction(obj.intent, originalText);
                if (obj.module) return obj;
            }
        } catch (_) { /* ignore */ }
    }

    return null;
};

const parseWithAI = async (userQuery) => {
    try {
        const response = await api.post('/ai/ai-parse', { text: userQuery });
        console.log('[SearchController] Raw AI response:', response.data);

        const parsed = extractParsed(response.data, userQuery);

        if (parsed) {
            console.log('[SearchController] AI parsed successfully:', parsed);
            return parsed;
        }

        console.warn('[SearchController] Could not extract from AI response, using fallback');
        return fallbackLocalParse(userQuery);

    } catch (err) {
        console.error('[SearchController] AI endpoint error:', err.message, '→ using fallback');
        return fallbackLocalParse(userQuery);
    }
};

// ─── Fallback: smart local keyword parse ─────────────────────────────────────

const fallbackLocalParse = (text) => {
    const t = text.toLowerCase();
    let module = null;
    let route = '/dashboard';
    const filters = {};

    // ── Module detection (English + Hindi + Hinglish) ──
    // IMPORTANT: Check "trading client" BEFORE generic "trade" to avoid false matches

    // ── Multi-word compound matches first (highest priority) ──
    if (t.match(/\baction\s*ledger|activity\s*log|action\s*log\b/))
        { module = 'action_ledger'; route = '/action-ledger'; }
    else if (t.match(/\bactive\s*position|open\s*position/))
        { module = 'active_positions'; route = '/active-positions'; }
    else if (t.match(/\bclosed?\s*position|band\s*position/))
        { module = 'closed_positions'; route = '/closed-positions'; }
    else if (t.match(/\bgroup\s*trade/))
        { module = 'group_trades'; route = '/group-trades'; }
    else if (t.match(/\bdelete[d]?\s*trade|hataye?\s*trade/))
        { module = 'deleted_trades'; route = '/deleted-trades'; }
    else if (t.match(/\bip\s*login|login\s*history|ip\s*log\b/))
        { module = 'ip_logins'; route = '/ip-logins'; }
    else if (t.match(/\bnegative\s*balance|negative\s*txn\b/))
        { module = 'negative_balance'; route = '/negative-balance'; }
    else if (t.match(/\bpending\s*order/))
        { module = 'orders'; route = '/pending-orders'; }
    else if (t.match(/\btrading\s*client|trading\s*member|trading\s*account/))
        { module = 'users'; route = '/trading-clients'; }
    else if (t.match(/\bbank\s*detail/))
        { module = 'bank_details'; route = '/bank'; }
    else if (t.match(/\bbanned\s*order|ban\s*limit/))
        { module = 'banned_orders'; route = '/banned'; }

    // ── Single-word exact matches ──
    else if (t.match(/\b(notification|notifications|suchna|soochna)\b/))
        { module = 'notifications'; route = '/notifications'; }
    else if (t.match(/\b(ledger)\b/))
        { module = 'action_ledger'; route = '/action-ledger'; }
    else if (t.match(/\b(ticker|tickers)\b/))
        { module = 'tickers'; route = '/tickers'; }
    else if (t.match(/\b(banned)\b/))
        { module = 'banned_orders'; route = '/banned'; }
    else if (t.match(/\b(bank)\b/))
        { module = 'bank_details'; route = '/bank'; }
    else if (t.match(/\b(broker|brokers|dalal)\b/))
        { module = 'brokers'; route = '/broker-accounts'; }
    else if (t.match(/\b(admin|admins|administrator|manager)\b/))
        { module = 'admins'; route = '/admins'; }
    else if (t.match(/\b(fund|funds|deposit|withdraw|paise|paisa|wallet|money)\b/))
        { module = 'funds'; route = '/funds'; }
    else if (t.match(/\b(order|orders|request|requests)\b/))
        { module = 'orders'; route = '/pending-orders'; }
    else if (t.match(/\b(client|clients|user|users|trader|traders|member|members)\b/))
        { module = 'users'; route = '/trading-clients'; }
    else if (t.match(/\b(trade|trades|position|positions|deal|kharid|bikri)\b/))
        { module = 'trades'; route = '/trades'; }

    // ── Fuzzy prefix match — ANY prefix of any keyword matches ──
    // e.g. "no", "not", "noti", "notif", "notifi"... all match "notification"
    if (!module) {
        const words = t.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= 2);

        // Each entry: [keywords[], module, route, priority (lower = higher)]
        // Priority ensures specific matches win over generic ones
        const FUZZY_MAP = [
            { keys: ['notification', 'suchna', 'soochna'],                          m: 'notifications',    r: '/notifications',    p: 1 },
            { keys: ['ledger', 'actionledger', 'activitylog'],                       m: 'action_ledger',    r: '/action-ledger',    p: 1 },
            { keys: ['activeposition', 'openposition'],                              m: 'active_positions', r: '/active-positions', p: 1 },
            { keys: ['closedposition', 'bandposition'],                              m: 'closed_positions', r: '/closed-positions', p: 1 },
            { keys: ['grouptrade', 'grouptrades'],                                   m: 'group_trades',     r: '/group-trades',     p: 1 },
            { keys: ['deletedtrade', 'deletedtrades', 'hatayetrade'],                m: 'deleted_trades',   r: '/deleted-trades',   p: 1 },
            { keys: ['iplogin', 'iplogins', 'loginhistory'],                         m: 'ip_logins',        r: '/ip-logins',        p: 1 },
            { keys: ['ticker', 'tickers'],                                           m: 'tickers',          r: '/tickers',          p: 2 },
            { keys: ['banned', 'bannedorder', 'banlimit'],                           m: 'banned_orders',    r: '/banned',            p: 2 },
            { keys: ['negativebalance', 'negativetxn'],                              m: 'negative_balance', r: '/negative-balance', p: 2 },
            { keys: ['bankdetail', 'bankdetails'],                                   m: 'bank_details',     r: '/bank',              p: 2 },
            { keys: ['pendingorder', 'pendingorders'],                               m: 'orders',           r: '/pending-orders',   p: 2 },
            { keys: ['tradingclient', 'tradingclients'],                             m: 'users',            r: '/trading-clients',  p: 1 },
            { keys: ['broker', 'brokers', 'dalal'],                                  m: 'brokers',          r: '/broker-accounts',  p: 3 },
            { keys: ['admin', 'admins', 'administrator', 'manager'],                 m: 'admins',           r: '/admins',            p: 3 },
            { keys: ['fund', 'funds', 'balance', 'deposit', 'withdraw', 'paisa', 'wallet', 'money'], m: 'funds', r: '/funds',       p: 3 },
            { keys: ['order', 'orders', 'request', 'requests'],                      m: 'orders',           r: '/pending-orders',   p: 4 },
            { keys: ['client', 'clients', 'user', 'users', 'trader', 'traders', 'member', 'members'], m: 'users', r: '/trading-clients', p: 4 },
            { keys: ['trade', 'trades', 'position', 'positions', 'deal', 'kharid', 'bikri'], m: 'trades', r: '/trades',             p: 5 },
        ];

        let bestMatch = null;
        let bestLen = 0;   // longer prefix match = better
        let bestPri = 99;  // lower priority number = wins ties

        for (const word of words) {
            for (const entry of FUZZY_MAP) {
                for (const key of entry.keys) {
                    // word is a prefix of keyword OR keyword is a prefix of word
                    if (key.startsWith(word) || word.startsWith(key)) {
                        const matchLen = Math.min(word.length, key.length);
                        // Prefer: longer match, then higher priority
                        if (matchLen > bestLen || (matchLen === bestLen && entry.p < bestPri)) {
                            bestMatch = entry;
                            bestLen = matchLen;
                            bestPri = entry.p;
                        }
                    }
                }
            }
        }

        if (bestMatch) {
            module = bestMatch.m;
            route = bestMatch.r;
        }
    }

    // ── Still no match → default to trading clients ──
    if (!module) {
        console.warn('[SearchController] Fallback: no module keyword found, defaulting to trading clients');
        module = 'users';
        route = '/trading-clients';
        filters.role = 'TRADER';
    }

    // ── Status filters ──
    if (t.match(/\bactive|chalte|open\b/))   filters.status = 'ACTIVE';
    if (t.match(/\bclosed|band|close\b/))    filters.status = 'CLOSED';
    if (t.match(/\bblocked|block\b/))        filters.status = 'BLOCKED';
    if (t.match(/\bpending|wait\b/))         filters.status = 'PENDING';
    if (t.match(/\bapproved|approve\b/))     filters.status = 'APPROVED';
    if (t.match(/\brejected|reject\b/))      filters.status = 'REJECTED';

    // ── User ID ──
    const idMatch = text.match(/(?:id|ID|user|#)\s*[:#]?\s*(\d+)/i) || text.match(/\b(\d{1,6})\b/);
    if (idMatch) filters.userId = parseInt(idMatch[1]);

    // ── Limit ──
    const limitMatch = text.match(/(?:top|last|recent|first)\s+(\d+)/i)
                    || text.match(/(\d+)\s+(?:records|results|rows)/i);
    if (limitMatch) filters.limit = parseInt(limitMatch[1]);

    // ── Role override for users module ──
    if (module === 'users' && !filters.role) {
        if (t.match(/\btrading\s+client|client|trader\b/) && !t.match(/\bbroker|admin/))
            filters.role = 'TRADER';
        else if (t.match(/\bbroker\b/))
            filters.role = 'BROKER';
        else if (t.match(/\badmin\b/))
            filters.role = 'ADMIN';
        // No explicit role → let backend return all users
    }

    console.log('[SearchController] Fallback result:', { module, filters });
    return {
        module,
        operation: 'get',
        filters,
        route,
        riskLevel: 'low',
        message: `Searching ${module}${filters.status ? ` (${filters.status})` : ''}`,
    };
};

// ─── Step 2: Execute the structured instruction ───────────────────────────────

const executeSearch = async (module, filters = {}) => {
    console.log(`[SearchController] Executing: ${module}`, filters);

    switch (module) {
        case 'trades': {
            let raw;
            if (filters.status === 'ACTIVE') raw = await apiService.getActivePositions(filters);
            else if (filters.status === 'CLOSED') raw = await apiService.getClosedPositions(filters);
            else raw = await apiService.getTrades(filters);
            return normalizeResults(raw);
        }

        case 'users': {
            if (filters.userId) {
                const raw = await apiService.getClientById(filters.userId);
                const r = normalizeResults(raw);
                return r.length ? r : [raw];
            }
            const params = {};
            if (filters.role)   params.role   = filters.role;
            if (filters.status) params.status = filters.status;
            if (filters.limit)  params.limit  = filters.limit;
            const raw = await apiService.getClients(params);
            return normalizeResults(raw);
        }

        case 'funds': {
            let raw;
            if (filters.status === 'PENDING' || filters.type === 'deposit')
                raw = await apiService.getDepositRequests();
            else if (filters.type === 'withdrawal')
                raw = await apiService.getWithdrawalRequests();
            else
                raw = await apiService.getTraderFunds(filters);
            return normalizeResults(raw);
        }

        case 'brokers': {
            const raw = await apiService.getClients({ role: 'BROKER' });
            let result = normalizeResults(raw);
            if (filters.status) result = result.filter(b => b.status === filters.status);
            if (filters.limit)  result = result.slice(0, filters.limit);
            return result;
        }

        case 'admins': {
            const raw = await apiService.getClients({ role: 'ADMIN' });
            let result = normalizeResults(raw);
            if (filters.status) result = result.filter(u => u.status === filters.status);
            if (filters.limit)  result = result.slice(0, filters.limit);
            return result;
        }

        case 'orders': {
            const raw = await apiService.getTrades({ status: 'OPEN', is_pending: 1 });
            let result = normalizeResults(raw);
            if (filters.limit) result = result.slice(0, filters.limit);
            return result;
        }

        case 'notifications': {
            const raw = await apiService.getNotifications();
            let result = normalizeResults(raw);
            if (filters.unread) result = result.filter(n => !n.is_read);
            if (filters.limit) result = result.slice(0, filters.limit);
            return result;
        }

        case 'action_ledger': {
            const raw = await apiService.getActionLedger(filters);
            let result = normalizeResults(raw);
            if (filters.limit) result = result.slice(0, filters.limit);
            return result;
        }

        case 'active_positions': {
            const raw = await apiService.getActivePositions(filters);
            return normalizeResults(raw);
        }

        case 'closed_positions': {
            const raw = await apiService.getClosedPositions(filters);
            return normalizeResults(raw);
        }

        case 'group_trades': {
            const raw = await apiService.getGroupTrades(filters);
            return normalizeResults(raw);
        }

        case 'deleted_trades': {
            const raw = await apiService.getTrades({ ...filters, status: 'DELETED' });
            return normalizeResults(raw);
        }

        case 'ip_logins': {
            const raw = await apiService.getIpLogins(filters);
            return normalizeResults(raw);
        }

        case 'tickers': {
            const raw = await apiService.getTickers();
            let result = normalizeResults(raw);
            if (filters.limit) result = result.slice(0, filters.limit);
            return result;
        }

        case 'bank_details': {
            const raw = await apiService.getBanks();
            return normalizeResults(raw);
        }

        case 'negative_balance': {
            const raw = await apiService.getNegativeBalances();
            return normalizeResults(raw);
        }

        case 'banned_orders': {
            const raw = await apiService.getBannedOrders();
            return normalizeResults(raw);
        }

        default:
            throw new Error(`Unknown module: ${module}`);
    }
};

// ─── Normalize backend response (array or { data: [] } or single object) ─────

const normalizeResults = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    // Check all common wrapper keys
    const keys = ['data', 'users', 'trades', 'funds', 'brokers', 'admins', 'orders', 'requests', 'notifications', 'positions', 'tickers', 'banks', 'logs', 'ledger', 'logins', 'results', 'records', 'list', 'items'];
    for (const key of keys) {
        if (Array.isArray(raw[key])) return raw[key];
    }
    if (typeof raw === 'object') return [raw];
    return [];
};

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Main entry point: send query → AI parse → fetch → return
 *
 * @param {string} userQuery - Natural language query
 * @returns {Promise<{ success, data, query, count, message, requiresConfirmation? }>}
 */
export const processSearch = async (userQuery) => {
    console.log('[SearchController] Query:', userQuery);

    // Step 0: Try local fuzzy parse first — if clear match, skip slow AI call
    const localParsed = fallbackLocalParse(userQuery);
    const isDefaultFallback = localParsed.module === 'users' && localParsed.filters?.role === 'TRADER' && !userQuery.toLowerCase().match(/\b(client|user|trader|member|show|list|get|all)\b/);

    // Step 1: If local parse found a specific module (not the default), use it directly
    // Otherwise, try AI parse for smarter understanding
    let parsed;
    if (!isDefaultFallback) {
        parsed = localParsed;
        console.log('[SearchController] Local fuzzy match:', parsed);
    } else {
        parsed = await parseWithAI(userQuery);
        console.log('[SearchController] AI parsed:', parsed);
    }

    if (parsed.error) {
        return { success: false, error: parsed.error, message: parsed.error };
    }

    const { module, operation, filters = {}, route, message, riskLevel, requiresConfirmation } = parsed;

    // High-risk operations (delete/block/financial) — don't auto-execute, return for confirmation
    if (requiresConfirmation || riskLevel === 'high') {
        return {
            success: false,
            requiresConfirmation: true,
            riskLevel,
            parsed,
            message: message || `⚠️ This is a high-risk operation. Please confirm before proceeding.`,
            query: parsed,
            data: [],
        };
    }

    // Only execute read (get) operations from search bar
    if (operation !== 'get') {
        return {
            success: false,
            requiresConfirmation: true,
            riskLevel: riskLevel || 'medium',
            parsed,
            message: `This action requires confirmation: ${message || operation} on ${module}`,
            query: parsed,
            data: [],
        };
    }

    // Step 2: Fetch data
    try {
        const raw = await executeSearch(module, filters);
        const data = normalizeResults(raw);

        console.log('[SearchController] Results:', data.length, 'records');

        return {
            success: true,
            data,
            count: data.length,
            message: message || `Found ${data.length} result(s) in ${module}`,
            query: { module, operation, filters, route },
        };
    } catch (err) {
        console.error('[SearchController] Execution error:', err.message);
        return {
            success: false,
            error: err.message,
            message: `Could not fetch ${module}: ${err.message}`,
            query: parsed,
        };
    }
};

/**
 * Quick search (already structured, no AI needed)
 */
export const quickSearch = async (module, filters = {}) => {
    try {
        const raw = await executeSearch(module, filters);
        const data = normalizeResults(raw);
        return { success: true, data, count: data.length };
    } catch (err) {
        return { success: false, error: err.message };
    }
};
