import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/Config';
import * as api from '../services/api';

const TradeContext = createContext();

export const useTrades = () => useContext(TradeContext);

// Initial Static Data (Sync with MARKET_DATA in Dashboard)
const INITIAL_MARKET_STATE = {
    'CRUDEOIL': 5812.00,
    'NATURALGAS': 310.70,
    'TCS': 4135.50,
    'INFY': 1662.25,
    'SBIN': 782.10,
    'RELIANCE': 2950.00,
    'HDFCBANK': 1455.00,
    'GOLD': 2045.80,
    'SILVER': 23.05,
    'EUR/USD': 1.0842,
    'BTC/USDT': 52150.00,
    'XAU/USD': 2045.50
};

export const INSTRUMENT_META = {
    'CRUDEOIL': { multiplier: 100, market: 'MCX' },
    'NATURALGAS': { multiplier: 1250, market: 'MCX' },
    'GOLD': { multiplier: 100, market: 'MCX' },
    'SILVER': { multiplier: 30, market: 'MCX' },
    'TCS': { multiplier: 1, market: 'NSE' },
    'RELIANCE': { multiplier: 1, market: 'NSE' },
    'SBIN': { multiplier: 1, market: 'NSE' },
    'INFY': { multiplier: 1, market: 'NSE' },
    'BTC/USDT': { multiplier: 1, market: 'Crypto' }
};

export const TradeProvider = ({ children }) => {
    const [trades, setTrades] = useState([
        // Active Trades
        { id: '1', name: 'CRUDEOIL', displayName: 'CRUDEOIL26FEBFUT', type: 'BUY', qty: '1', entryPrice: '5770.00', time: '10:15:22', isCompleted: false, isPending: false, market: 'MCX' },
        { id: '2', name: 'GOLD', displayName: 'GOLD26FEBFUT', type: 'SELL', qty: '1', entryPrice: '2050.00', time: '11:30:05', isCompleted: false, isPending: false, market: 'MCX' },

        // Pending Trades
        { id: '3', name: 'RELIANCE', displayName: 'RELIANCE26FEBFUT', type: 'BUY', qty: '10', entryPrice: '2900.00', time: '09:45:10', isCompleted: false, isPending: true, market: 'NSE' },
        { id: '4', name: 'NATURALGAS', displayName: 'NATURALGAS26FEBFUT', type: 'SELL', qty: '1', entryPrice: '320.00', time: '10:05:45', isCompleted: false, isPending: true, market: 'MCX' },
        { id: '7', name: 'TCS', displayName: 'TCS26FEBFUT', type: 'BUY', qty: '5', entryPrice: '4155.00', time: '10:30:15', isCompleted: false, isPending: true, market: 'NSE' },
        { id: '8', name: 'SBIN', displayName: 'SBIN26FEBFUT', type: 'SELL', qty: '2', entryPrice: '785.50', time: '10:45:30', isCompleted: false, isPending: true, market: 'NSE' },
        { id: '9', name: 'SILVER', displayName: 'SILVER26FEBFUT', type: 'BUY', qty: '3', entryPrice: '23.00', time: '11:00:45', isCompleted: false, isPending: true, market: 'MCX' },
        { id: '10', name: 'INFY', displayName: 'INFY26FEBFUT', type: 'BUY', qty: '7', entryPrice: '1650.00', time: '10:15:20', isCompleted: false, isPending: true, market: 'NSE' },
        { id: '11', name: 'HDFCBANK', displayName: 'HDFCBANK26FEBFUT', type: 'SELL', qty: '4', entryPrice: '1460.00', time: '11:20:35', isCompleted: false, isPending: true, market: 'NSE' },

        // Closed Trades
        { id: '5', name: 'ALUMINIUM', displayName: 'ALUMINIUM26FEBFUT', type: 'BUY', qty: '1', entryPrice: '305.50', exitPrice: '308.15', time: '09:15:00', exitTime: '2026-02-25 09:45:30', isCompleted: true, isPending: false, market: 'MCX' },
        { id: '6', name: 'COPPER', displayName: 'COPPER26FEBFUT', type: 'SELL', qty: '5', entryPrice: '4150.00', exitPrice: '4135.50', time: '10:00:10', exitTime: '2026-02-25 10:20:15', isCompleted: true, isPending: false, market: 'MCX' },
    ]);

    const [livePrices, setLivePrices] = useState(INITIAL_MARKET_STATE);
    const [priceHistory, setPriceHistory] = useState(() => {
        const initialHistory = {};
        Object.keys(INITIAL_MARKET_STATE).forEach(key => {
            initialHistory[key] = [INITIAL_MARKET_STATE[key], INITIAL_MARKET_STATE[key]];
        });
        return initialHistory;
    });

    // Live Price Socket Integration
    useEffect(() => {
        const socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('✅ Mobile connected to Market Socket');
            // Send join event with user info to subscribe to personalized updates
            const user = api.getSessionUser();
            socket.emit('join', {
                userId: user?.id || 'mobile-user',
                role: user?.role || 'TRADER',
                username: user?.username || 'anonymous'
            });
        });

        socket.on('connected', (data) => {
            console.log('📡 Server response:', data);
        });

        socket.on('joined', (data) => {
            console.log('✅ Successfully joined socket rooms:', data);
        });

        socket.on('price_update', (newPrices) => {
            setLivePrices(prev => {
                const updatedPrices = { ...prev, ...newPrices };
                setPriceHistory(prevHistory => {
                    const nextHistory = { ...prevHistory };

                    Object.keys(newPrices).forEach(symbol => {
                        if (!nextHistory[symbol]) nextHistory[symbol] = [];
                        const updatedHistory = [...nextHistory[symbol], newPrices[symbol]];
                        if (updatedHistory.length > 20) updatedHistory.shift();
                        nextHistory[symbol] = updatedHistory;
                    });

                    return nextHistory;
                });
                return updatedPrices;
            });
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from socket:', reason);
        });

        // Listen for admin notifications (from web dashboard)
        socket.on('notification', (notif) => {
            console.log('📢 New notification received:', notif);
            // Add to adminNotifications (displays in "Admin Messages" tab)
            addAdminNotification({
                id: notif.id?.toString() || `notif-${Date.now()}`,
                title: notif.title || 'Notification',
                message: notif.message || '',
                type: notif.type || 'info',
                time: notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                acknowledged: notif.is_read ? true : false,
                createdAt: new Date(notif.created_at || Date.now())
            });
        });

        // Listen for notification deletion
        socket.on('notification_deleted', (data) => {
            console.log('🗑️ Notification deleted:', data.id);
        });

        return () => socket.disconnect();
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        if (!api.hasSession()) return;
        try {
            // Fetch all trades (Open, Pending, etc.)
            const allTrades = await api.getTrades('');
            // Only update if API returns data with substantial trades, otherwise keep mock data
            if (allTrades && allTrades.length > 0) {
                const newTrades = allTrades.map(t => ({
                    id: t.id.toString(),
                    name: t.symbol,
                    displayName: t.symbol,
                    type: t.type,
                    qty: t.qty.toString(),
                    entryPrice: t.entry_price.toString(),
                    time: new Date(t.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isCompleted: t.status === 'CLOSED',
                    isPending: t.status === 'PENDING',
                    market: 'MCX'
                }));
                // Merge with existing mock data to preserve pending trades
                setTrades(prev => {
                    const mockPending = prev.filter(t => t.isPending);
                    const apiNonPending = newTrades.filter(t => !t.isPending);
                    return [...apiNonPending, ...mockPending];
                });
            }

            const idx = await api.getIndices();
            setIndices(idx);

            const wl = await api.getWatchlist();
            setWatchlist(wl);

            const wds = await api.getWithdrawals();
            setWithdrawalRequests(wds);

            // Fetch admin notifications from backend
            try {
                const notifs = await api.getNotifications();
                if (notifs && Array.isArray(notifs)) {
                    const adminNotifs = notifs.map(n => ({
                        id: n.id?.toString() || `notif-${Date.now()}`,
                        title: n.title || 'Notification',
                        message: n.message || '',
                        type: n.type || 'info',
                        time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                        acknowledged: n.is_read ? true : false,
                        createdAt: new Date(n.created_at || Date.now())
                    }));
                    setAdminNotifications(adminNotifs);
                    console.log('✅ Loaded', adminNotifs.length, 'notifications from backend');
                }
            } catch (notifErr) {
                console.log('ℹ️ Could not fetch notifications:', notifErr.message);
            }

            // Fetch balance etc.
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const addTrade = async (trade) => {
        try {
            const res = await api.placeOrder({
                symbol: trade.name,
                type: trade.type,
                qty: trade.qty,
                price: trade.price,
                order_type: 'MARKET',
                is_pending: false
            });
            fetchInitialData(); // Refresh list
        } catch (err) {
            alert('Order failed: ' + err.message);
        }
    };

    const closeTrade = (id, exitPrice, exitTime) => {
        let tradeToClose = trades.find(t => t.id === id);
        if (tradeToClose) {
            const meta = INSTRUMENT_META[tradeToClose.name] || { multiplier: 1 };
            const pnl = (parseFloat(exitPrice) - parseFloat(tradeToClose.entryPrice)) * parseInt(tradeToClose.qty) * meta.multiplier * (tradeToClose.type === 'BUY' ? 1 : -1);
            setLedgerBalance(prev => prev + pnl);

            setTrades(prev => prev.map(t => t.id === id ? {
                ...t,
                isCompleted: true,
                exitPrice: exitPrice,
                exitTime: exitTime
            } : t));
        }
    };

    const setTargetSL = (id, target, sl) => {
        setTrades(prev => prev.map(t => t.id === id ? { ...t, target, sl } : t));
    };

    const cancelTrade = (id) => {
        const tradeToCancel = trades.find(t => t.id === id);
        if (tradeToCancel) {
            addNotification({
                title: 'Order Cancelled',
                message: `Your ${tradeToCancel.type} order for ${tradeToCancel.displayName} has been cancelled.`,
                type: 'info'
            });
        }
        setTrades(prev => prev.filter(t => t.id !== id));
    };

    const [ledgerBalance, setLedgerBalance] = useState(5000000); // 50 Lakh

    // Calculate Active P/L and Margin
    const activeTrades = trades.filter(t => !t.isCompleted && !t.isPending);
    const activePL = activeTrades.reduce((acc, trade) => {
        const livePrice = livePrices[trade.name] || parseFloat(trade.entryPrice);
        const meta = INSTRUMENT_META[trade.name] || { multiplier: 1 };
        const pl = (livePrice - parseFloat(trade.entryPrice)) * parseInt(trade.qty) * meta.multiplier * (trade.type === 'BUY' ? 1 : -1);
        return acc + pl;
    }, 0);

    const marginUsed = activeTrades.length * 50000; // Realistic margin calculation
    const marginAvailable = ledgerBalance - marginUsed; // More realistic calculation

    // Helper function to generate random price near base price
    const generateRandomPrice = (basePrice) => {
        const base = parseFloat(basePrice);
        const variance = base * 0.01; // 1% variance
        const random = base + (Math.random() - 0.5) * variance * 2;
        return random.toFixed(2);
    };

    const [watchlist, setWatchlist] = useState([
        // MCX Futures
        { id: '1', name: 'ALUMINIUM', category: 'MCX Futures', ltp: '307.75', price2: generateRandomPrice('307.75'), change: '-0.45', high: '308.5', low: '306.5', open: '308.2', date: '2026-02-27', status: 'active' },
        { id: '2', name: 'COPPER', category: 'MCX Futures', ltp: '725.40', price2: generateRandomPrice('725.40'), change: '3.40', high: '730.00', low: '720.50', open: '722.00', date: '2026-02-27', status: 'pending' },
        { id: '3', name: 'CRUDEOIL', category: 'MCX Futures', ltp: '5770', price2: generateRandomPrice('5770'), change: '6.00', high: '5796', low: '5763', open: '5764', date: '2026-02-19', status: 'active' },

        // NSE Futures
        { id: '4', name: 'RELIANCE', category: 'NSE Futures', ltp: '2950.00', price2: generateRandomPrice('2950.00'), change: '10.00', high: '2965.00', low: '2930.00', open: '2940.00', date: '2026-02-27', status: 'pending' },
        { id: '5', name: 'TCS', category: 'NSE Futures', ltp: '4135.50', price2: generateRandomPrice('4135.50'), change: '-19.50', high: '4160.00', low: '4120.00', open: '4155.00', date: '2026-03-27', status: 'active' },
        { id: '6', name: 'HDFCBANK', category: 'NSE Futures', ltp: '1455.00', price2: generateRandomPrice('1455.00'), change: '5.00', high: '1462.00', low: '1448.00', open: '1450.00', date: '2026-02-27', status: 'active' },

        // Options
        { id: '7', name: 'NIFTY 22000 CE', category: 'Options', ltp: '180.45', price2: generateRandomPrice('180.45'), change: '45.20', high: '195.00', low: '140.00', open: '150.00', date: '2026-02-26', status: 'pending' },
        { id: '8', name: 'BANKNIFTY 46000 PE', category: 'Options', ltp: '210.30', price2: generateRandomPrice('210.30'), change: '-80.40', high: '290.00', low: '180.50', open: '285.00', date: '2026-02-26', status: 'active' },
    ]);

    const [indices, setIndices] = useState([
        { name: 'NIFTY 50', ltp: '22456.20', change: '-101.30', pct: '-0.45' },
        { name: 'BANK NIFTY', ltp: '47890.15', change: '57.45', pct: '+0.12' },
        { name: 'FINNIFTY', ltp: '21123.50', change: '-42.10', pct: '-0.20' },
    ]);


    // ─── Alert Engine Refs (avoid stale closures in intervals) ────
    const userAlertsRef = useRef([]);
    const alertSettingsRef = useRef({});
    const triggeredRef = useRef(new Set()); // track fired alert IDs
    const lastPriceRef = useRef({});        // track prev price per symbol
    const marketFiredRef = useRef(new Set()); // track market timing fired
    const priceHistorySnap = useRef({});    // snapshot for technical alerts

    // Simulation removed - using Socket.IO from lines 63-88
    useEffect(() => {
        // We still want to update indices locally or fetch them
    }, []);

    // ── Market Timing Alerts ──────────────────────────────────────
    useEffect(() => {
        const t = setInterval(() => {
            if (!alertSettingsRef.current.marketTiming) return;
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            const day = now.toDateString();

            const fire = (key, title, message) => {
                if (marketFiredRef.current.has(key)) return;
                marketFiredRef.current.add(key);
                setNotifications(pn => [{
                    id: Date.now().toString() + key,
                    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    title, message, type: 'info'
                }, ...pn]);
            };

            if (h === 9 && m === 15) fire(`open-${day}`, '🟢 Market Opened', 'NSE & BSE markets are now open for trading. Good luck!');
            if (h === 15 && m === 15) fire(`soon-${day}`, '⏰ Market Closing Soon', 'Markets close in 15 minutes (3:30 PM). Review your open positions.');
            if (h === 15 && m === 30) fire(`closed-${day}`, '🔴 Market Closed', 'NSE & BSE markets closed for the day.');
        }, 30000);
        return () => clearInterval(t);
    }, []);

    // ── Technical Alerts (RSI-like from price history) ────────────
    useEffect(() => {
        const t = setInterval(() => {
            if (!alertSettingsRef.current.technical) return;
            const snap = priceHistorySnap.current;
            Object.keys(snap).forEach(symbol => {
                const prices = snap[symbol] || [];
                if (prices.length < 10) return;
                const recent = prices.slice(-10);
                let ups = 0, downs = 0;
                for (let i = 1; i < recent.length; i++) {
                    if (recent[i] > recent[i - 1]) ups++;
                    else if (recent[i] < recent[i - 1]) downs++;
                }
                const minKey = Math.floor(Date.now() / 120000); // fire at most once per 2 min per symbol
                if (ups >= 8) {
                    const k = `rsi-ob-${symbol}-${minKey}`;
                    if (!triggeredRef.current.has(k)) {
                        triggeredRef.current.add(k);
                        setNotifications(pn => [{
                            id: k, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            title: `⚡ RSI Overbought: ${symbol}`,
                            message: `${symbol} showing overbought signals. Price rose in 8/10 recent intervals. Consider booking profits.`,
                            type: 'warning'
                        }, ...pn]);
                    }
                }
                if (downs >= 8) {
                    const k = `rsi-os-${symbol}-${minKey}`;
                    if (!triggeredRef.current.has(k)) {
                        triggeredRef.current.add(k);
                        setNotifications(pn => [{
                            id: k, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            title: `⚡ RSI Oversold: ${symbol}`,
                            message: `${symbol} showing oversold signals. Price fell in 8/10 recent intervals. Potential bounce opportunity.`,
                            type: 'info'
                        }, ...pn]);
                    }
                }
            });
        }, 10000);
        return () => clearInterval(t);
    }, []);

    const globalSearchData = [
        { id: 's1', name: 'ACE JAN 0 CE', ltp: '877.2', change: '-0.70', high: '897.8', low: '857.55', open: '877.9', lot: '1' },
        { id: 's2', name: 'ADANIENT FEB 1940 CE', ltp: '308.95', change: '8.30', high: '319.6', low: '285.15', open: '300.65', lot: '309' },
        { id: 's3', name: 'ADANIENT FEB 1940 PE', ltp: '13.85', change: '-2.65', high: '16.6', low: '12.65', open: '16.5', lot: '309' },
        { id: 's4', name: 'ADANIENT FEB 1960 CE', ltp: '287.35', change: '25.35', high: '305.8', low: '255', open: '262', lot: '309' },
        { id: 's5', name: 'ADANIENT FEB 1960 PE', ltp: '15.15', change: '-2.85', high: '19.2', low: '14.5', open: '18', lot: '309' },
        { id: 's6', name: 'BANKNIFTY FEB 46000 CE', ltp: '450.55', change: '120.50', high: '480.20', low: '390.10', open: '410.00', lot: '15' },
        { id: 's7', name: 'BANKNIFTY FEB 46000 PE', ltp: '210.30', change: '-80.40', high: '290.00', low: '180.50', open: '285.00', lot: '15' },
        { id: 's8', name: 'NIFTY FEB 22000 CE', ltp: '180.45', change: '45.20', high: '195.00', low: '140.00', open: '150.00', lot: '50' },
        { id: 's9', name: 'NIFTY FEB 22000 PE', ltp: '85.60', change: '-30.10', high: '120.00', low: '75.00', open: '115.00', lot: '50' },
        { id: 's10', name: 'RELIANCE FEB 3000 CE', ltp: '45.20', change: '5.60', high: '48.00', low: '40.00', open: '41.50', lot: '250' },
        { id: 's11', name: 'TCS FEB 4200 CE', ltp: '85.00', change: '12.00', high: '90.00', low: '75.00', open: '78.00', lot: '175' },
        { id: 's12', name: 'INFY FEB 1700 CE', ltp: '32.50', change: '4.50', high: '35.00', low: '28.00', open: '29.00', lot: '400' },
    ];

    const toggleWatchlist = (item) => {
        setWatchlist(prev => {
            const exists = prev.find(i => i.name === item.name); // Check by name to avoid double add
            if (exists) {
                return prev.filter(i => i.name !== item.name);
            } else {
                return [...prev, item];
            }
        });
    };

    // ─── User Price Alerts ────────────────────────────────────────
    const [userAlerts, setUserAlerts] = useState([
        { id: 'ua1', symbol: 'CRUDEOIL', type: 'above', targetPrice: 5820, status: 'active', createdAt: new Date() },
        { id: 'ua2', symbol: 'GOLD', type: 'below', targetPrice: 2030, status: 'active', createdAt: new Date() },
    ]);

    const [alertSettings, setAlertSettings] = useState({
        priceAlerts: true,
        percentChange: true,
        percentThreshold: 2,
        marketTiming: true,
        technical: true,
        tradeAlerts: true,
    });

    // Keep refs in sync so intervals always have fresh values
    useEffect(() => { userAlertsRef.current = userAlerts; }, [userAlerts]);
    useEffect(() => { alertSettingsRef.current = alertSettings; }, [alertSettings]);

    // Sync priceHistory into a ref for technical alert engine
    useEffect(() => { priceHistorySnap.current = priceHistory; }, [priceHistory]);

    const addUserAlert = (alert) => {
        setUserAlerts(prev => [{
            id: 'ua' + Date.now(),
            ...alert,
            status: 'active',
            createdAt: new Date(),
        }, ...prev]);
    };

    const removeUserAlert = (id) => {
        setUserAlerts(prev => prev.filter(a => a.id !== id));
        triggeredRef.current.delete(id); // allow re-fire if re-added
    };

    const resetUserAlert = (id) => {
        setUserAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'active', triggeredAt: null } : a));
        triggeredRef.current.delete(id);
    };

    const updateAlertSetting = (key, value) => {
        setAlertSettings(prev => ({ ...prev, [key]: value }));
    };

    const [notifications, setNotifications] = useState([
        {
            id: '1',
            title: 'Order Executed',
            message: 'Your buy order for CRUDEOIL 26FEBFUT at 5770.00 has been executed successfully.',
            time: 'Just now',
            type: 'success'
        },
        {
            id: '2',
            title: 'Withdrawal Success',
            message: 'Your withdrawal request for ₹5,000 has been processed.',
            time: '2 hours ago',
            type: 'info'
        }
    ]);

    const addNotification = (notif) => {
        setNotifications(prev => [{
            id: Date.now().toString(),
            time: 'Just now',
            ...notif
        }, ...prev]);
    };

    const clearNotifications = () => setNotifications([]);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // ─── Admin Notification System ───────────────────────────────
    const [adminNotifications, setAdminNotifications] = useState([
        {
            id: 'a1',
            title: '📢 Market Update',
            message: 'Crude Oil is showing strong bullish momentum. Consider reviewing your positions before market close.',
            time: '10:30 AM',
            sentAt: new Date(Date.now() - 30 * 60 * 1000),
            acknowledged: false,
        },
        {
            id: 'a2',
            title: '⚠️ Risk Alert',
            message: 'High volatility expected today due to RBI policy announcement at 2 PM. Please manage risk accordingly.',
            time: '9:45 AM',
            sentAt: new Date(Date.now() - 75 * 60 * 1000),
            acknowledged: false,
        },
    ]);

    const acknowledgeNotification = (id) => {
        setAdminNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, acknowledged: true, acknowledgedAt: new Date() } : n)
        );
    };

    const addAdminNotification = (notif) => {
        setAdminNotifications(prev => [{
            id: 'a' + Date.now().toString(),
            sentAt: new Date(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            acknowledged: false,
            ...notif
        }, ...prev]);
    };

    const unreadAdminCount = adminNotifications.filter(n => !n.acknowledged).length;

    const [withdrawalRequests, setWithdrawalRequests] = useState([]);

    const addWithdrawalRequest = async (formData) => {
        try {
            await api.createWithdrawal(formData);
            addNotification({
                title: 'Withdrawal Requested',
                message: `Your request for ₹${formData.amount} has been submitted for admin review.`,
                type: 'info'
            });
            // Fetch fresh requests
            const reqs = await api.getWithdrawals();
            setWithdrawalRequests(reqs);
        } catch (err) {
            console.error('Withdrawal failed:', err);
            throw err;
        }
    };

    // Admin manually updates status (for real backend integration)
    const updateWithdrawalStatus = (id, status, remark = '') => {
        setWithdrawalRequests(prev =>
            prev.map(r => r.id === id
                ? { ...r, status, remark, statusUpdatedAt: new Date() }
                : r
            )
        );
    };


    return (
        <TradeContext.Provider value={{
            trades,
            addTrade,
            livePrices,
            priceHistory,
            closeTrade,
            cancelTrade,
            setTargetSL,
            ledgerBalance,
            activePL,
            marginUsed,
            marginAvailable,
            notifications,
            addNotification,
            clearNotifications,
            removeNotification,
            adminNotifications,
            acknowledgeNotification,
            addAdminNotification,
            unreadAdminCount,
            withdrawalRequests,
            addWithdrawalRequest,
            updateWithdrawalStatus,
            INSTRUMENT_META,
            watchlist,
            toggleWatchlist,
            globalSearchData,
            indices,
            userAlerts,
            addUserAlert,
            removeUserAlert,
            resetUserAlert,
            alertSettings,
            updateAlertSetting,
            fetchInitialData
        }}>
            {children}
        </TradeContext.Provider>
    );
};
