import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import * as api from '../../services/api';

const DeleteTradePage = ({ trade, onClose, onDelete }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            alert('Please enter transaction password');
            return;
        }
        setLoading(true);
        try {
            await api.deleteTrade(trade.id, { transactionPassword: password });
            if (onDelete) onDelete();
            onClose();
        } catch (err) {
            alert('Failed to delete trade: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-[70] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 font-sans">
            {/* Header */}
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
                
                {/* Exit Button - Circular & Hoverable */}
                <div className="absolute right-3 flex items-center gap-2">
                    <button 
                        onClick={onClose} 
                        className="p-2.5 flex items-center justify-center rounded-full hover:bg-black/20 text-white/50 hover:text-white transition-all cursor-pointer group hover:bg-red-500/80 active:scale-95 shadow-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content with Sidebar */}
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

                {/* Content Area */}
                <div className="flex-1 flex flex-col items-start bg-[#1a2035] pt-12 pl-[20px] pr-[20px] overflow-hidden">
                    <div className="w-full relative">
                        {/* Title Badge */}
                        <div className="absolute -top-7 left-6 z-20">
                            <span className="bg-gradient-to-br from-[#43a047] to-[#66bb6a] text-white px-7 py-3 rounded-lg text-[18px] font-bold inline-block shadow-[0_10px_20px_-5px_rgba(76,175,80,0.4)] tracking-wide border border-white/10">
                                Delete Trade
                            </span>
                        </div>

                        {/* Content Box */}
                        <div className="pt-16 pb-12 px-10 bg-[#1e283e]/30 shadow-2xl rounded text-slate-200 border-none w-full">
                            <p className="text-[15px] leading-relaxed mb-12 opacity-90 max-w-5xl">
                                You are about to delete trade of <span className="text-white font-bold">{trade?.qty || '0.000000'}</span> lots of <span className="text-white font-bold">{trade?.symbol || 'SCRIP'}</span> of <span className="text-white font-bold">{trade?.user_id || 'User'}</span>. Brokerage and Profit/Loss of the Buy and SELL Trade will be refunded to the client and the Trade will be removed. In case it is a partial trade of some parent trade, then no. of lots of parent trade will be reduced by <span className="text-white font-bold">{trade?.qty || '0.000000'}</span> lots. Enter Transaction Password to continue.
                            </p>

                            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-x-12 gap-y-8 max-w-5xl">
                                <div className="flex-1 space-y-3 w-full">
                                    <label className="block text-slate-400 text-[14px] font-medium tracking-wide">Transaction Password</label>
                                    <input 
                                        type="password"
                                        autoComplete="new-password"
                                        className="w-full bg-transparent border-b border-white/20 text-white font-mono text-[16px] py-2 focus:outline-none focus:border-[#4caf50] transition-colors"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder=""
                                    />
                                    <style>{`
                                        input:-webkit-autofill {
                                            -webkit-box-shadow: 0 0 0 30px #1a2035 inset !important;
                                            -webkit-text-fill-color: white !important;
                                        }
                                    `}</style>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-bold py-3 px-12 rounded transition-all text-[15px] shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest whitespace-nowrap min-w-[200px]"
                                >
                                    {loading ? 'DELETING...' : 'DELETE TRADE'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteTradePage;
