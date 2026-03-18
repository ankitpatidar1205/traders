import React, { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    ClipboardList,
    ArrowUpRight,
    Search,
    RefreshCw,
    TrendingUp,
    Wallet,
    Box,
    Clock,
    LogIn,
    LogOut,
    Wifi,
    WifiOff
} from 'lucide-react';
import * as api from '../../services/api';

const KiteDashboard = () => {
    const [kiteStatus, setKiteStatus] = useState(null);
    const [profile, setProfile] = useState(null);
    const [margins, setMargins] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [positions, setPositions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [trades, setTrades] = useState([]);
    const [marketWatch, setMarketWatch] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('holdings');

    // Check Kite connection status
    const checkStatus = useCallback(async () => {
        try {
            const status = await api.getKiteStatus();
            setKiteStatus(status);
            return status.connected;
        } catch {
            setKiteStatus({ connected: false });
            return false;
        }
    }, []);

    // Fetch all Kite data
    const fetchKiteData = useCallback(async () => {
        try {
            const [profileData, marginData, holdingsData, positionsData, ordersData, tradesData] = await Promise.all([
                api.getKiteProfile(),
                api.getKiteMargins(),
                api.getKiteHoldings(),
                api.getKitePositions(),
                api.getKiteOrders(),
                api.getKiteTrades()
            ]);

            setProfile(profileData);
            setMargins(marginData);
            setHoldings(Array.isArray(holdingsData) ? holdingsData : []);
            setPositions(Array.isArray(positionsData?.net) ? positionsData.net : []);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setTrades(Array.isArray(tradesData) ? tradesData : []);

            const watchInstruments = ['NSE:RELIANCE', 'NSE:TCS', 'NSE:HDFCBANK', 'NSE:INFY'];
            const quotesData = await api.getKiteQuote(watchInstruments.join(','));
            setMarketWatch(quotesData && typeof quotesData === 'object' && !quotesData.message ? quotesData : {});

            setError(null);
        } catch (err) {
            console.error('Failed to fetch Kite data:', err);
            setError(err.message || 'Failed to load data');
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const connected = await checkStatus();
            if (connected) {
                await fetchKiteData();
                // Auto refresh every 30s
            }
            setLoading(false);
        };
        init();
    }, [checkStatus, fetchKiteData]);

    useEffect(() => {
        if (!kiteStatus?.connected) return;
        const interval = setInterval(fetchKiteData, 30000);
        return () => clearInterval(interval);
    }, [kiteStatus?.connected, fetchKiteData]);

    // Handle Kite Login
    const handleLogin = async () => {
        try {
            const data = await api.getKiteLoginURL();
            if (data.login_url) {
                window.open(data.login_url, '_blank', 'width=600,height=700');
                // Poll for connection after user logs in
                const pollInterval = setInterval(async () => {
                    const connected = await checkStatus();
                    if (connected) {
                        clearInterval(pollInterval);
                        await fetchKiteData();
                    }
                }, 3000);
                // Stop polling after 5 minutes
                setTimeout(() => clearInterval(pollInterval), 300000);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle Disconnect
    const handleDisconnect = async () => {
        try {
            await api.disconnectKite();
            setKiteStatus({ connected: false });
            setProfile(null);
            setMargins(null);
            setHoldings([]);
            setPositions([]);
            setOrders([]);
            setTrades([]);
            setMarketWatch({});
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full bg-[#1a2035] text-white">
            <RefreshCw className="w-8 h-8 animate-spin text-green-500 mr-3" />
            <span className="text-xl font-medium">Checking Kite Connection...</span>
        </div>
    );

    // NOT CONNECTED — Show Login Page
    if (!kiteStatus?.connected) {
        return (
            <div className="flex items-center justify-center h-full bg-[#1a2035]">
                <div className="bg-[#1f283e] rounded-2xl border border-white/10 shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <WifiOff className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Kite Not Connected</h2>
                    <p className="text-slate-400 text-sm mb-8">
                        Login with your Zerodha account to access live market data, holdings, positions, and orders.
                    </p>
                    <button
                        onClick={handleLogin}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                    >
                        <LogIn className="w-5 h-5" />
                        Connect with Zerodha
                    </button>
                    <p className="text-slate-500 text-xs mt-6">
                        You'll be redirected to Zerodha's login page. Token is valid for one trading day.
                    </p>
                    {error && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // CONNECTED — Show Dashboard
    return (
        <div className="flex flex-col h-full bg-[#1a2035] p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Connection Status Bar */}
            <div className="flex items-center justify-between bg-[#1f283e] rounded-xl border border-white/5 px-6 py-3">
                <div className="flex items-center gap-3">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Connected</span>
                    {kiteStatus?.user && (
                        <span className="text-slate-400 text-xs">| {kiteStatus.user} ({kiteStatus.user_id})</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchKiteData} className="text-slate-400 hover:text-white transition-colors p-1" title="Refresh">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={handleDisconnect} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-bold transition-colors">
                        <LogOut className="w-4 h-4" />
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Top Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#1f283e] p-6 rounded-xl border border-white/5 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <Wallet className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available Margin</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {margins?.equity?.available?.cash?.toLocaleString() || '0'}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">Equity & Derivatives</div>
                </div>

                <div className="bg-[#1f283e] p-6 rounded-xl border border-white/5 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-500/10 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total P&L</span>
                    </div>
                    <div className={`text-2xl font-bold ${holdings.reduce((a, b) => a + (b.pnl || 0), 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {holdings.reduce((a, b) => a + (b.pnl || 0), 0).toLocaleString()}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">Current Day</div>
                </div>

                <div className="bg-[#1f283e] p-6 rounded-xl border border-white/5 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-500/10 p-2 rounded-lg">
                            <Box className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Items in Holdings</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{holdings.length}</div>
                    <div className="mt-2 text-[11px] text-slate-400">Total Scripts</div>
                </div>

                <div className="bg-[#1f283e] p-6 rounded-xl border border-white/5 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-500/10 p-2 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Orders</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{orders.filter(o => o.status === 'OPEN' || o.status === 'PENDING').length}</div>
                    <div className="mt-2 text-[11px] text-slate-400">Awaiting Execution</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Portfolio Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#1f283e] rounded-xl border border-white/5 shadow-xl overflow-hidden">
                        <div className="flex border-b border-white/5 bg-[#1a2035]/50 overflow-x-auto">
                            {[
                                { id: 'holdings', label: 'Holdings', icon: Briefcase },
                                { id: 'positions', label: 'Positions', icon: LayoutDashboard },
                                { id: 'orders', label: 'Orders', icon: ClipboardList },
                                { id: 'trades', label: 'Trades', icon: TrendingUp }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                                        activeTab === tab.id
                                        ? 'text-green-500 border-green-500 bg-green-500/5'
                                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-0 overflow-x-auto">
                            {activeTab === 'holdings' && (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#1a2035]/30 text-slate-500 text-[10px] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Instrument</th>
                                            <th className="px-6 py-4">Qty.</th>
                                            <th className="px-6 py-4">Avg. Cost</th>
                                            <th className="px-6 py-4">LTP</th>
                                            <th className="px-6 py-4">P&L</th>
                                            <th className="px-6 py-4">Change</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {holdings.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No holdings found</td></tr>
                                        ) : holdings.map((h, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-white group-hover:text-green-400 transition-colors">{h.tradingsymbol}</td>
                                                <td className="px-6 py-4 text-slate-300">{h.quantity}</td>
                                                <td className="px-6 py-4 text-slate-300">{h.average_price?.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-white font-medium">{h.last_price?.toFixed(2)}</td>
                                                <td className={`px-6 py-4 font-bold ${(h.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {(h.pnl || 0) >= 0 ? '+' : ''}{(h.pnl || 0).toFixed(2)}
                                                </td>
                                                <td className={`px-6 py-4 font-medium ${((h.last_price - h.average_price) / h.average_price) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {(((h.last_price - h.average_price) / h.average_price) * 100).toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'positions' && (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#1a2035]/30 text-slate-500 text-[10px] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Instrument</th>
                                            <th className="px-6 py-4">Net Qty.</th>
                                            <th className="px-6 py-4">Avg. Price</th>
                                            <th className="px-6 py-4">LTP</th>
                                            <th className="px-6 py-4">Realised P&L</th>
                                            <th className="px-6 py-4">Unrealised P&L</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {positions.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No positions found</td></tr>
                                        ) : positions.map((p, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">{p.tradingsymbol}</td>
                                                <td className="px-6 py-4 text-slate-300">{p.quantity}</td>
                                                <td className="px-6 py-4 text-slate-300">{p.average_price?.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-white">{p.last_price?.toFixed(2)}</td>
                                                <td className={`px-6 py-4 font-bold ${(p.realised || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {(p.realised || 0).toFixed(2)}
                                                </td>
                                                <td className={`px-6 py-4 font-bold ${(p.unrealised || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {(p.unrealised || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'orders' && (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#1a2035]/30 text-slate-500 text-[10px] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Instrument</th>
                                            <th className="px-6 py-4">Qty.</th>
                                            <th className="px-6 py-4">Avg. Price</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {orders.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No orders found</td></tr>
                                        ) : orders.map((o, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-slate-400 text-xs">{new Date(o.order_timestamp || o.exchange_timestamp).toLocaleTimeString()}</td>
                                                <td className="px-6 py-4 font-bold">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] ${o.transaction_type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {o.transaction_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-white font-medium">{o.tradingsymbol}</td>
                                                <td className="px-6 py-4 text-slate-300">{o.quantity}</td>
                                                <td className="px-6 py-4 text-slate-300">{(o.average_price || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold tracking-wider ${
                                                        o.status === 'COMPLETE' ? 'text-green-500' :
                                                        o.status === 'REJECTED' || o.status === 'CANCELLED' ? 'text-red-500' : 'text-orange-500'
                                                    }`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'trades' && (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#1a2035]/30 text-slate-500 text-[10px] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Instrument</th>
                                            <th className="px-6 py-4">Qty.</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Order ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {trades.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No trades found</td></tr>
                                        ) : trades.map((t, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-slate-400 text-xs">{new Date(t.fill_timestamp).toLocaleTimeString()}</td>
                                                <td className="px-6 py-4 font-bold">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] ${t.transaction_type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {t.transaction_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-white font-medium">{t.tradingsymbol}</td>
                                                <td className="px-6 py-4 text-slate-300">{t.quantity}</td>
                                                <td className="px-6 py-4 text-white font-bold">{(t.average_price || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-slate-500 text-[10px]">{t.order_id}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Market Watch */}
                <div className="space-y-6">
                    <div className="bg-[#1f283e] rounded-xl border border-white/5 shadow-xl p-6">
                        <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-green-500" />
                             Market Watch
                        </h3>
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search stocks... (NSE/BSE)"
                                className="w-full bg-[#1a2035] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-green-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            {Object.entries(marketWatch).map(([symbol, data]) => (
                                <div key={symbol} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10 transition-all group">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white group-hover:text-green-400 transition-colors uppercase">{symbol.split(':')[1]}</span>
                                        <span className="text-[10px] text-slate-500">{symbol.split(':')[0]}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold text-white">{data.last_price?.toLocaleString()}</span>
                                        <span className={`text-[10px] ${(data.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {(data.change || 0) >= 0 ? '+' : ''}{(data.change || 0).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(marketWatch).length === 0 && (
                                <p className="text-slate-500 text-sm text-center py-4">Loading market data...</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl shadow-xl p-6 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-bold uppercase tracking-[2px] opacity-80 mb-1">Quick Action</h4>
                            <p className="text-lg font-bold mb-4">Place a new market order</p>
                            <button className="bg-white text-green-800 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all hover:shadow-[0_4px_15px_rgba(255,255,255,0.3)] active:scale-95">
                                Buy Stock
                            </button>
                        </div>
                        <ArrowUpRight className="absolute -bottom-2 -right-2 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
                    <span className="text-sm font-bold">{error}</span>
                    <button onClick={() => setError(null)} className="text-white/70 hover:text-white ml-2">x</button>
                </div>
            )}
        </div>
    );
};

export default KiteDashboard;
