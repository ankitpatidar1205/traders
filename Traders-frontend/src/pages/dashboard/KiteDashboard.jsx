import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, TrendingUp, LogIn, LogOut, Wifi, WifiOff } from 'lucide-react';
import * as api from '../../services/api';

const KiteDashboard = () => {
    const [kiteStatus, setKiteStatus] = useState(null);
    const [marketWatch, setMarketWatch] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tokenInput, setTokenInput] = useState('');
    const [settingToken, setSettingToken] = useState(false);
    const previousRatesRef = useRef({});

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

    const getTrend = (newPrice, oldPrice) => {
        if (!oldPrice || newPrice === oldPrice) return 'neutral';
        return newPrice > oldPrice ? 'up' : 'down';
    };

    const fetchMarketData = useCallback(async () => {
        try {
            const data = await api.getKiteMarketData();
            if (data && typeof data === 'object' && !data.error) {
                const prev = previousRatesRef.current;
                const withTrends = {};
                for (const [symbol, quote] of Object.entries(data)) {
                    const prevQuote = prev[symbol];
                    withTrends[symbol] = {
                        ...quote,
                        bidTrend: prevQuote ? getTrend(quote.bid, prevQuote.bid) : 'neutral',
                        askTrend: prevQuote ? getTrend(quote.ask, prevQuote.ask) : 'neutral',
                        priceTrend: prevQuote ? getTrend(quote.last_price, prevQuote.last_price) : 'neutral',
                    };
                }
                previousRatesRef.current = data;
                setMarketWatch(withTrends);
                setError(null);
            }
        } catch (err) {
            console.log('Market data fetch skipped:', err.message);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await checkStatus();
            setLoading(false);
        };
        init();
    }, [checkStatus]);

    useEffect(() => {
        if (!kiteStatus?.connected) return;
        fetchMarketData();
        const marketInterval = setInterval(fetchMarketData, 1000);
        return () => clearInterval(marketInterval);
    }, [kiteStatus?.connected, fetchMarketData]);

    const handleLogin = async () => {
        try {
            const data = await api.getKiteLoginURL();
            if (data.login_url) {
                window.open(data.login_url, '_blank', 'width=600,height=700');
                const pollInterval = setInterval(async () => {
                    const connected = await checkStatus();
                    if (connected) clearInterval(pollInterval);
                }, 3000);
                setTimeout(() => clearInterval(pollInterval), 300000);
            }
        } catch (err) { setError(err.message); }
    };

    const handleSetToken = async () => {
        if (!tokenInput.trim()) return;
        try {
            setSettingToken(true);
            setError(null);
            await api.setKiteAccessToken(tokenInput.trim());
            setTokenInput('');
            await checkStatus();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Invalid access token');
        } finally { setSettingToken(false); }
    };

    const handleDisconnect = async () => {
        try {
            await api.disconnectKite();
            setKiteStatus({ connected: false });
            setMarketWatch({});
        } catch (err) { setError(err.message); }
    };

    // Format number with commas
    const fmt = (n) => n != null ? Number(n).toLocaleString('en-IN') : '-';

    if (loading) return (
        <div className="flex items-center justify-center h-full bg-[#1a2035] text-white">
            <RefreshCw className="w-8 h-8 animate-spin text-green-500 mr-3" />
            <span className="text-xl font-medium">Checking Kite Connection...</span>
        </div>
    );

    if (!kiteStatus?.connected) {
        return (
            <div className="flex items-center justify-center h-full bg-[#1a2035]">
                <div className="bg-[#1f283e] rounded-2xl border border-white/10 shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <WifiOff className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Kite Not Connected</h2>
                    <p className="text-slate-400 text-sm mb-8">Login with your Zerodha account to access live MCX market data.</p>
                    <button onClick={handleLogin} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-95 flex items-center gap-3 mx-auto">
                        <LogIn className="w-5 h-5" /> Connect with Zerodha
                    </button>
                    <p className="text-slate-500 text-xs mt-6">Token is valid for one trading day.</p>
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-slate-500 text-xs font-bold uppercase">or paste access token</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={tokenInput} onChange={e => setTokenInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSetToken()} placeholder="Paste access token here..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50" />
                        <button onClick={handleSetToken} disabled={settingToken || !tokenInput.trim()} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold text-[12px] uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap">
                            {settingToken ? 'Connecting...' : 'Connect'}
                        </button>
                    </div>
                    {error && <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
                </div>
            </div>
        );
    }

    const entries = Object.entries(marketWatch);

    return (
        <div className="flex flex-col h-full bg-[#0f1729] overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between bg-[#1a2240] border-b border-white/5 px-4 py-2.5 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-green-400 text-[11px] font-bold uppercase tracking-wider">Live</span>
                    </div>
                    <div className="w-px h-4 bg-white/10"></div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-white text-[13px] font-bold tracking-wide">MCX COMMODITY RATES</span>
                    <span className="text-slate-500 text-[11px]">({entries.length} symbols)</span>
                </div>
                <div className="flex items-center gap-3">
                    {kiteStatus?.user && (
                        <span className="text-slate-400 text-[11px]">
                            <Wifi className="w-3 h-3 inline mr-1 text-green-400" />
                            {kiteStatus.user} ({kiteStatus.user_id})
                        </span>
                    )}
                    <button onClick={fetchMarketData} className="text-slate-400 hover:text-white transition-colors p-1" title="Refresh">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handleDisconnect} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-[10px] font-bold transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Disconnect
                    </button>
                </div>
            </div>

            {/* Full Screen Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-[#141c30] text-[10px] uppercase tracking-wider border-b border-white/10">
                            <th className="px-3 py-3 text-left text-slate-400 font-semibold w-8">#</th>
                            <th className="px-3 py-3 text-left text-slate-400 font-semibold">Symbol</th>
                            <th className="px-3 py-3 text-center text-green-500 font-bold">Bid</th>
                            <th className="px-3 py-3 text-center text-slate-500 font-semibold">Bid Qty</th>
                            <th className="px-3 py-3 text-center text-red-500 font-bold">Ask</th>
                            <th className="px-3 py-3 text-center text-slate-500 font-semibold">Ask Qty</th>
                            <th className="px-3 py-3 text-center text-yellow-500 font-bold">LTP</th>
                            <th className="px-3 py-3 text-center text-slate-400 font-semibold">Change</th>
                            <th className="px-3 py-3 text-center text-slate-400 font-semibold">Open</th>
                            <th className="px-3 py-3 text-center text-slate-400 font-semibold">High</th>
                            <th className="px-3 py-3 text-center text-slate-400 font-semibold">Low</th>
                            <th className="px-3 py-3 text-center text-slate-400 font-semibold">Close</th>
                            <th className="px-3 py-3 text-right text-slate-400 font-semibold">Volume</th>
                            <th className="px-3 py-3 text-right text-slate-400 font-semibold">OI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan="14" className="px-6 py-20 text-center">
                                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-green-500" />
                                    <p className="text-slate-500 text-sm">Connecting to MCX market data...</p>
                                </td>
                            </tr>
                        ) : entries.map(([symbol, data], index) => {
                            const name = symbol.split(':')[1]?.replace(/\d{2}[A-Z]{3}FUT$/, '') || symbol;
                            const changeVal = Number(data.change_percent) || 0;
                            const isUp = changeVal > 0;
                            const isDown = changeVal < 0;
                            const changeColor = isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-slate-400';
                            const changeBg = isUp ? 'bg-green-500/10' : isDown ? 'bg-red-500/10' : 'bg-white/5';
                            const rowBg = index % 2 === 0 ? 'bg-[#141c30]/50' : 'bg-[#1a2240]/30';

                            return (
                                <tr key={symbol} className={`${rowBg} hover:bg-white/5 transition-all border-b border-white/[0.03]`}>
                                    {/* # */}
                                    <td className="px-3 py-2.5 text-slate-600 text-xs font-mono">{index + 1}</td>

                                    {/* Symbol */}
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-8 rounded-full ${isUp ? 'bg-green-500' : isDown ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                                            <div>
                                                <div className="text-[13px] font-bold text-white tracking-wide">{name}</div>
                                                <div className="text-[9px] text-slate-500 mt-0.5">MCX</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Bid */}
                                    <td className="px-3 py-2.5 text-center">
                                        <span className={`text-[13px] font-bold transition-colors duration-300 ${
                                            data.bidTrend === 'up' ? 'text-green-400' :
                                            data.bidTrend === 'down' ? 'text-red-400' : 'text-green-300'
                                        }`}>
                                            {fmt(data.bid)}
                                        </span>
                                    </td>

                                    {/* Bid Qty */}
                                    <td className="px-3 py-2.5 text-center text-slate-500 text-xs">{data.bid_qty || 0}</td>

                                    {/* Ask */}
                                    <td className="px-3 py-2.5 text-center">
                                        <span className={`text-[13px] font-bold transition-colors duration-300 ${
                                            data.askTrend === 'up' ? 'text-green-400' :
                                            data.askTrend === 'down' ? 'text-red-400' : 'text-red-300'
                                        }`}>
                                            {fmt(data.ask)}
                                        </span>
                                    </td>

                                    {/* Ask Qty */}
                                    <td className="px-3 py-2.5 text-center text-slate-500 text-xs">{data.ask_qty || 0}</td>

                                    {/* LTP */}
                                    <td className="px-3 py-2.5 text-center">
                                        <span className={`text-[14px] font-extrabold transition-colors duration-300 ${
                                            data.priceTrend === 'up' ? 'text-green-400' :
                                            data.priceTrend === 'down' ? 'text-red-400' : 'text-white'
                                        }`}>
                                            {fmt(data.last_price)}
                                        </span>
                                    </td>

                                    {/* Change % */}
                                    <td className="px-3 py-2.5 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold ${changeBg} ${changeColor}`}>
                                            {isUp ? '▲' : isDown ? '▼' : '–'} {isUp ? '+' : ''}{changeVal}%
                                        </span>
                                    </td>

                                    {/* Open */}
                                    <td className="px-3 py-2.5 text-center text-slate-400 text-[12px]">{fmt(data.open)}</td>

                                    {/* High */}
                                    <td className="px-3 py-2.5 text-center text-green-400/70 text-[12px] font-medium">{fmt(data.high)}</td>

                                    {/* Low */}
                                    <td className="px-3 py-2.5 text-center text-red-400/70 text-[12px] font-medium">{fmt(data.low)}</td>

                                    {/* Close */}
                                    <td className="px-3 py-2.5 text-center text-slate-400 text-[12px]">{fmt(data.close)}</td>

                                    {/* Volume */}
                                    <td className="px-3 py-2.5 text-right text-slate-400 text-[12px] font-mono">{fmt(data.volume)}</td>

                                    {/* OI */}
                                    <td className="px-3 py-2.5 text-right text-slate-400 text-[12px] font-mono">{fmt(data.oi)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {error && (
                <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50">
                    <span className="text-sm font-bold">{error}</span>
                    <button onClick={() => setError(null)} className="text-white/70 hover:text-white ml-2">x</button>
                </div>
            )}
        </div>
    );
};

export default KiteDashboard;
