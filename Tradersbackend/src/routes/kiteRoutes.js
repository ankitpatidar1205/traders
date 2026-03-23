const express = require('express');
const kiteService = require('../utils/kiteService');
const kiteTicker = require('../utils/kiteTicker');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ── AUTH FLOW ─────────────────────────────────────────

// Step 1: Get login URL (frontend calls this, then redirects user)
router.get('/login', authMiddleware, (req, res) => {
    try {
        const url = kiteService.getLoginURL();
        res.json({ login_url: url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Step 2: Zerodha redirects here after login (NO auth needed — this is a redirect from Zerodha)
router.get('/callback', asyncHandler(async (req, res) => {
    const { request_token, status } = req.query;

    if (status === 'cancelled') {
        return res.send(`
            <html><body style="background:#1a1a2e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
                <div style="text-align:center">
                    <h1 style="color:#e74c3c">❌ Login Cancelled</h1>
                    <p>You cancelled the Zerodha login.</p>
                    <script>setTimeout(()=>window.close(),3000)</script>
                </div>
            </body></html>
        `);
    }

    if (!request_token) {
        return res.status(400).send(`
            <html><body style="background:#1a1a2e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
                <div style="text-align:center">
                    <h1 style="color:#e74c3c">❌ Error</h1>
                    <p>No request_token received from Zerodha.</p>
                </div>
            </body></html>
        `);
    }

    try {
        const session = await kiteService.handleCallback(request_token);

        // Start Kite Ticker for live data
        try {
            kiteTicker.disconnect();
            kiteTicker.fallbackToMock = false;
            await kiteTicker.start();
        } catch (e) {
            console.log('Ticker start after login failed:', e.message);
        }

        // Return success page that auto-closes
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.send(`
            <html><body style="background:#1a1a2e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
                <div style="text-align:center">
                    <h1 style="color:#2ecc71">✅ Kite Connected Successfully!</h1>
                    <p>User: <strong>${session.user_name || session.user_id || 'N/A'}</strong></p>
                    <p>Redirecting back...</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = '${FRONTEND_URL}/kite-dashboard';
                        }, 2000);
                    </script>
                </div>
            </body></html>
        `);
    } catch (err) {
        res.status(500).send(`
            <html><body style="background:#1a1a2e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
                <div style="text-align:center">
                    <h1 style="color:#e74c3c">❌ Authentication Failed</h1>
                    <p>${err.message}</p>
                    <p style="color:#888">Try logging in again.</p>
                </div>
            </body></html>
        `);
    }
}));

// Set access token directly (skip OAuth)
router.post('/set-token', authMiddleware, asyncHandler(async (req, res) => {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: 'access_token is required' });

    const session = await kiteService.setAccessToken(access_token);

    // Start Kite Ticker
    try {
        kiteTicker.disconnect();
        kiteTicker.fallbackToMock = false;
        await kiteTicker.start();
    } catch (e) {
        console.log('Ticker start after set-token failed:', e.message);
    }

    res.json({ success: true, ...kiteService.getStatus() });
}));

// Check connection status
router.get('/status', authMiddleware, (req, res) => {
    res.json(kiteService.getStatus());
});

// Disconnect / logout
router.post('/disconnect', authMiddleware, (req, res) => {
    kiteService.clearSession();
    kiteTicker.disconnect();
    res.json({ success: true, message: 'Kite disconnected' });
});

// ── MCX Market Data (all symbols at once) ────────────
const MCX_SYMBOLS = [
    'MCX:ALUMINIUM26APRFUT',
    'MCX:COPPER26APRFUT',
    'MCX:CRUDEOIL26APRFUT',
    'MCX:GOLD26APRFUT',
    'MCX:GOLDM26APRFUT',
    'MCX:SILVER26APRFUT',
    'MCX:SILVERM26APRFUT',
    'MCX:ZINC26APRFUT',
    'MCX:LEAD26APRFUT',
    'MCX:NATURALGAS26APRFUT',
    'MCX:NICKEL26APRFUT',
    'MCX:GOLDGUINEA26APRFUT',
    'MCX:GOLDPETAL26APRFUT',
    'MCX:SILVERMIC26APRFUT',
];

router.get('/market', authMiddleware, asyncHandler(async (req, res) => {
    if (!kiteService.isAuthenticated()) {
        return res.status(401).json({ error: 'Kite not connected. Re-login required.' });
    }
    try {
        const quotes = await kiteService.getQuote(MCX_SYMBOLS);
        console.log('MCX Market Data fetched:', Object.keys(quotes).length, 'symbols');

        // Parse response like Java service — extract bid, ask, ohlc, depth
        const parsed = {};
        for (const [symbol, quote] of Object.entries(quotes)) {
            parsed[symbol] = {
                symbol,
                last_price: quote.last_price,
                volume: quote.volume,
                oi: quote.oi,
                change: quote.net_change,
                change_percent: quote.ohlc?.close ? (((quote.last_price - quote.ohlc.close) / quote.ohlc.close) * 100).toFixed(2) : 0,
                ohlc: quote.ohlc || {},
                high: quote.ohlc?.high || 0,
                low: quote.ohlc?.low || 0,
                open: quote.ohlc?.open || 0,
                close: quote.ohlc?.close || 0,
                bid: quote.depth?.buy?.[0]?.price || 0,
                ask: quote.depth?.sell?.[0]?.price || 0,
                bid_qty: quote.depth?.buy?.[0]?.quantity || 0,
                ask_qty: quote.depth?.sell?.[0]?.quantity || 0,
                timestamp: quote.timestamp || null,
                depth: quote.depth || {},
            };
        }

        res.json(parsed);
    } catch (err) {
        if (err.message?.includes('expired') || err.message?.includes('403')) {
            return res.status(401).json({ error: 'Token expired. Re-login required.' });
        }
        console.error('MCX Market fetch error:', err.message);
        res.status(500).json({ error: 'Failed to fetch market data: ' + err.message });
    }
}));

// ── KITE DATA APIs ────────────────────────────────────

router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
    const data = await kiteService.getProfile();
    res.json(data);
}));

router.get('/margins', authMiddleware, asyncHandler(async (req, res) => {
    const data = await kiteService.getMargins();
    res.json(data);
}));

router.get('/holdings', authMiddleware, asyncHandler(async (req, res) => {
    const data = await kiteService.getHoldings();
    res.json(data);
}));

router.get('/positions', authMiddleware, asyncHandler(async (req, res) => {
    const data = await kiteService.getPositions();
    res.json(data);
}));

router.get('/orders', authMiddleware, asyncHandler(async (req, res) => {
    const data = await kiteService.getOrders();
    res.json(data);
}));

router.get('/trades', authMiddleware, asyncHandler(async (req, res) => {
    const data = await kiteService.getTrades();
    res.json(data);
}));

router.get('/quote', authMiddleware, asyncHandler(async (req, res) => {
    const { i } = req.query;
    if (!i) return res.status(400).json({ error: 'Instrument Required' });
    const data = await kiteService.getQuote(i);
    res.json(data);
}));

router.get('/quote/ltp', authMiddleware, asyncHandler(async (req, res) => {
    const { i } = req.query;
    if (!i) return res.status(400).json({ error: 'Instrument Required' });
    const data = await kiteService.getLTP(i);
    res.json(data);
}));

router.get('/instruments', authMiddleware, asyncHandler(async (req, res) => {
    const data = await kiteService.getInstruments();
    res.json(data);
}));

router.get('/instruments/historical/:instrumentToken/:interval', authMiddleware, asyncHandler(async (req, res) => {
    const { instrumentToken, interval } = req.params;
    const { from, to } = req.query;
    const data = await kiteService.getHistoricalData(instrumentToken, interval, from, to);
    res.json(data);
}));

// ── Kite Ticker (WebSocket) routes ──

router.get('/ticker/status', authMiddleware, asyncHandler(async (req, res) => {
    res.json({
        connected: kiteTicker.isConnected(),
        fallbackToMock: kiteTicker.fallbackToMock,
        subscribedCount: kiteTicker.subscribedTokens.length,
    });
}));

router.get('/ticker/prices', authMiddleware, asyncHandler(async (req, res) => {
    res.json(kiteTicker.getPrices());
}));

router.post('/ticker/subscribe', authMiddleware, asyncHandler(async (req, res) => {
    const { tokens, instrumentMap } = req.body;
    if (!tokens || !Array.isArray(tokens)) {
        return res.status(400).json({ error: 'tokens array required' });
    }
    if (instrumentMap) kiteTicker.setInstrumentMap(instrumentMap);
    kiteTicker.subscribe(tokens);
    res.json({ success: true, subscribedCount: kiteTicker.subscribedTokens.length });
}));

router.post('/ticker/unsubscribe', authMiddleware, asyncHandler(async (req, res) => {
    const { tokens } = req.body;
    if (!tokens || !Array.isArray(tokens)) {
        return res.status(400).json({ error: 'tokens array required' });
    }
    kiteTicker.unsubscribe(tokens);
    res.json({ success: true, subscribedCount: kiteTicker.subscribedTokens.length });
}));

router.post('/ticker/reconnect', authMiddleware, asyncHandler(async (req, res) => {
    kiteTicker.disconnect();
    kiteTicker.fallbackToMock = false;
    const started = await kiteTicker.start();
    res.json({ success: started, connected: kiteTicker.isConnected() });
}));

module.exports = router;
