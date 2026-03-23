import React, { useState, useEffect } from 'react';
import { X, User, Settings, ArrowLeft, Edit3, Trash2, RotateCcw } from 'lucide-react';
import * as api from '../../services/api';
import UpdateTradePage from './UpdateTradePage';
import DeleteTradePage from './DeleteTradePage';
import RestoreBuyPage from './RestoreBuyPage';

const TradeDetailPage = ({ tradeId, onClose }) => {
    const [trade, setTrade] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showRestore, setShowRestore] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!tradeId) return;
        const fetchTrade = async () => {
            try {
                // Fetch trade details
                const data = await api.getTrades({ id: tradeId });
                const found = Array.isArray(data) ? data.find(t => t.id === tradeId) : (data?.data?.find(t => t.id === tradeId) || data);
                setTrade(found);
            } catch (err) {
                console.error('Failed to fetch trade detail:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrade();
    }, [tradeId]);

    // Remove loading check to avoid transition lag
    const isFetching = loading && !trade;

    const fmtTime = (t) => {
        if (!t) return '(not set)';
        try {
            return new Date(t).toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            }).replace(/\//g, '-');
        } catch { return t; }
    };

    const details = trade ? [
        { label: 'ID', value: trade.id },
        { label: 'TYPE', value: trade.type, highlight: true },
        { label: 'SCRIP', value: trade.symbol || trade.scrip },
        { label: 'BUY RATE', value: trade.type === 'BUY' ? (trade.entry_price || '-') : (trade.exit_price || '-') },
        { label: 'SELL RATE', value: trade.type === 'SELL' ? (trade.entry_price || '-') : (trade.exit_price || '-') },
        { label: 'LOTS / UNITS', value: trade.qty },
        { label: 'BUY TURNOVER', value: trade.type === 'BUY' ? (trade.qty * (trade.entry_price || 0)).toFixed(2) : '-' },
        { label: 'SELL TURNOVER', value: trade.type === 'SELL' ? (trade.qty * (trade.entry_price || 0)).toFixed(2) : '-' },
        { label: 'CMP', value: trade.cmp || '-' },
        { label: 'ACTIVE P/L', value: trade.pnl || trade.live_pnl || '0.0000', highlight: true },
        { label: 'MARGIN USED', value: trade.margin_used || trade.margin || '0.0000' },
        { label: 'BOUGHT AT', value: trade.type === 'BUY' ? fmtTime(trade.entry_time) : '-' },
        { label: 'SOLD AT', value: trade.type === 'SELL' ? fmtTime(trade.entry_time) : (trade.exit_time ? fmtTime(trade.exit_time) : '-') },
        { label: 'BUY IP', value: trade.type === 'BUY' ? (trade.trade_ip || '-') : '-' },
        { label: 'SELL IP', value: trade.type === 'SELL' ? (trade.trade_ip || '-') : (trade.exit_ip || '-') },
        { label: 'Brokerage', value: trade.brokerage || '0' },
        { label: 'Buy Type', value: trade.order_type || 'Market' },
        { label: 'Sell Type', value: trade.exit_order_type || 'Market' },
        { label: 'Buy Order ID', value: trade.buy_order_id || '(not set)' },
        { label: 'Sell Order ID', value: trade.sell_order_id || '(not set)' },
    ] : [];

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-[60] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-4 shadow-md shrink-0 relative">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-white hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-[14px] font-bold uppercase tracking-tight">Back</span>
                    </button>
                </div>


                <div className="flex items-center gap-4 text-white mr-10">
                    <button className="hover:bg-black/10 p-2 rounded-full transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 font-bold uppercase text-[13px] hover:bg-black/10 px-3 py-1.5 rounded transition-colors select-none">
                        <span className="mr-4 text-[12px] opacity-90 lowercase font-medium">{new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} {currentTime}</span>
                        <User className="text-white text-xs scale-125 mr-1" />
                        DEMO PANNEL
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Scrollable but Hidden Scrollbar */}
                <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-2 shrink-0 overflow-y-auto no-scrollbar">
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                    {[
                        { icon: 'fa-table-columns', label: 'DashBoard' },
                        { icon: 'fa-chart-line', label: 'Market Watch' },
                        { icon: 'fa-bell', label: 'Notifications' },
                        { icon: 'fa-podcast', label: 'Action Ledger' },
                        { icon: 'fa-certificate', label: 'Active Positions' },
                        { icon: 'fa-history', label: 'Closed Positions' },
                        { icon: 'fa-user-circle', label: 'Trading Clients' },
                        { icon: 'fa-tag', label: 'Trades' },
                        { icon: 'fa-tag', label: 'Group Trades' },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={`text-slate-300 text-[12px] flex items-center gap-3 py-2.5 px-4 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.label === 'Trades' ? 'bg-[#4caf50] text-white shadow-lg font-bold' : ''}`}
                        >
                            <div className="w-5 h-5 flex items-center justify-center opacity-80 text-sm">
                                <span className={`fa-solid ${item.icon}`}></span>
                            </div>
                            <span className="truncate tracking-wide">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-8 bg-[#1a2035] relative">
                    <div className="ml-4 space-y-8 max-w-5xl">
                        {/* Styled Exit Button - Aligned lower */}
                        <div className="absolute top-6 right-8">
                            <button
                                onClick={onClose}
                                className="text-white/40 hover:text-white transition-colors active:scale-95"
                                title="Exit"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-4">

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowUpdate(true)}
                                    className="bg-[#ab47bc] hover:bg-[#9c27b0] text-white font-bold py-2 px-8 rounded transition-all text-[13px] shadow-lg active:scale-95 min-w-[120px]"
                                >
                                    UPDATE
                                </button>
                                <button
                                    onClick={() => setShowDelete(true)}
                                    className="bg-[#f44336] hover:bg-[#d32f2f] text-white font-bold py-2 px-8 rounded transition-all text-[13px] shadow-lg active:scale-95 min-w-[120px]"
                                >
                                    DELETE
                                </button>
                            </div>
                            <button
                                onClick={() => setShowRestore(true)}
                                className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-bold py-2 px-6 rounded transition-all text-[13px] shadow-lg active:scale-95 min-w-[140px]"
                            >
                                RESTORE BUY
                            </button>
                        </div>

                        {/* Details Table */}
                        <div className="bg-[#1a2235] rounded-none shadow-2xl overflow-hidden border-none text-left mb-6">
                            <table className="w-full border-collapse border-none">
                                <tbody className="text-[14px]">
                                    {details.map((row, idx) => {
                                        const isNegative = row.highlight && (parseFloat(row.value) < 0 || row.value === 'SELL');
                                        const isPositive = row.highlight && (parseFloat(row.value) > 0 || row.value === 'BUY');
                                        return (
                                            <tr key={idx} className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-5 text-slate-400 font-bold w-[280px] border-r border-white/[0.08] transition-colors text-[14px] uppercase tracking-wide">{row.label}</td>
                                                <td className="px-6 py-5 border-none">
                                                    {row.label === 'Type' ? (
                                                        <span className={`px-4 py-1.5 rounded text-[12px] font-black uppercase ${row.value === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {row.value}
                                                        </span>
                                                    ) : (
                                                        <span className={`font-medium tracking-tight text-[15px] ${isNegative ? 'text-red-400' : isPositive ? 'text-green-400' : 'text-slate-200'}`}>
                                                            {row.value}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a2035; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4caf50; border-radius: 4px; }
            `}</style>
            {/* UPDATE TRADE MODAL */}
            {showUpdate && (
                <UpdateTradePage
                    trade={trade}
                    onClose={() => setShowUpdate(false)}
                    onUpdate={() => {
                        api.getTrades({ id: tradeId }).then(data => {
                            const found = Array.isArray(data) ? data.find(t => t.id === tradeId) : (data?.data?.find(t => t.id === tradeId) || data);
                            setTrade(found);
                        });
                    }}
                />
            )}

            {/* DELETE TRADE MODAL */}
            {showDelete && (
                <DeleteTradePage
                    trade={trade}
                    onClose={() => setShowDelete(false)}
                    onDelete={() => { if (onClose) onClose(); }}
                />
            )}

            {/* RESTORE BUY MODAL */}
            {showRestore && (
                <RestoreBuyPage
                    trade={trade}
                    onClose={() => setShowRestore(false)}
                    onRestore={() => { if (onClose) onClose(); }}
                />
            )}
        </div>
    );
};

export default TradeDetailPage;
