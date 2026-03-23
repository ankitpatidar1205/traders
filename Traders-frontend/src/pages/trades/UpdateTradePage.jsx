import React, { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import * as api from '../../services/api';

const UpdateTradePage = ({ trade, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        symbol: trade?.symbol || '',
        scripType: 'Mega',
        userId: trade?.user_id || '',
        qty: trade?.qty || '',
        entry_price: trade?.entry_price || '',
        exit_price: trade?.exit_price || '',
        transactionPassword: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateTrade(trade.id, formData);
            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            alert('Failed to update trade: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-[70] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
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
                {/* Sidebar */}
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
                        {/* Title Overlapping Area (now borderless) */}
                        <div className="absolute -top-7 left-6 z-20">
                            <span className="bg-gradient-to-br from-[#43a047] to-[#66bb6a] text-white px-7 py-3 rounded-lg text-[18px] font-bold inline-block shadow-[0_10px_20px_-5px_rgba(76,175,80,0.4)] tracking-wide border border-white/10">
                                Update Trades
                            </span>
                        </div>

                        {/* Borderless Form Box */}
                        <div className="pt-10 pb-8 px-8 bg-[#1e283e]/30 shadow-2xl">
                            <style>{`
                                input:-webkit-autofill,
                                input:-webkit-autofill:hover, 
                                input:-webkit-autofill:focus, 
                                input:-webkit-autofill:active{
                                    -webkit-box-shadow: 0 0 0 30px #1a2035 inset !important;
                                    -webkit-text-fill-color: white !important;
                                }
                            `}</style>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {/* Scrip Section */}
                                <div className="space-y-3">
                                    <label className="block text-slate-400 text-[13px] font-medium tracking-wide uppercase opacity-70">Scrip</label>
                                    <div className="space-y-0.5">
                                        <select 
                                            className="w-full bg-white text-black font-bold py-2 px-3 rounded-t border-b border-gray-200 focus:outline-none text-[14px]"
                                            value={formData.symbol}
                                            onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                                        >
                                            <option value={formData.symbol}>{formData.symbol}</option>
                                        </select>
                                        <select 
                                            className="w-full bg-white text-black font-bold py-2 px-3 rounded-b focus:outline-none text-[14px]"
                                            value={formData.scripType}
                                            onChange={(e) => setFormData({...formData, scripType: e.target.value})}
                                        >
                                            <option value="Mega">Mega</option>
                                            <option value="Mini">Mini</option>
                                        </select>
                                    </div>
                                    <p className="text-[11px] bg-blue-600 inline-block px-1.5 py-0.5 text-white font-medium">(Mini Works on Silver and Gold only)</p>
                                </div>

                                {/* User ID Section */}
                                <div className="space-y-3">
                                    <label className="block text-slate-400 text-[13px] font-medium tracking-wide uppercase opacity-70">User ID</label>
                                    <select 
                                        className="w-full bg-white text-black font-bold py-2 px-3 rounded focus:outline-none border-none text-[14px]"
                                        value={formData.userId}
                                        onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                    >
                                        <option value={formData.userId}>3705377 : Demo0174 (Demo ji)</option>
                                    </select>
                                </div>

                                {/* Lots / Units */}
                                <div className="space-y-1.5">
                                    <label className="block text-slate-400 text-[13px] font-medium tracking-wide uppercase opacity-70">Lots / Units</label>
                                    <input 
                                        type="text"
                                        autoComplete="off"
                                        className="w-full bg-transparent border-b border-white/20 text-white font-mono text-[15px] py-1 focus:outline-none focus:border-[#4caf50] transition-colors"
                                        value={formData.qty}
                                        onChange={(e) => setFormData({...formData, qty: e.target.value})}
                                    />
                                </div>

                                {/* Buy Rate */}
                                <div className="space-y-1.5">
                                    <label className="block text-slate-400 text-[13px] font-medium tracking-wide uppercase opacity-70">Buy Rate</label>
                                    <input 
                                        type="text"
                                        autoComplete="off"
                                        className="w-full bg-transparent border-b border-white/20 text-white font-mono text-[15px] py-1 focus:outline-none focus:border-[#4caf50] transition-colors"
                                        value={formData.entry_price}
                                        onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                                    />
                                </div>

                                {/* Sell Rate */}
                                <div className="space-y-1.5">
                                    <label className="block text-slate-400 text-[13px] font-medium tracking-wide uppercase opacity-70">Sell Rate</label>
                                    <input 
                                        type="text"
                                        autoComplete="off"
                                        className="w-full bg-transparent border-b border-white/20 text-white font-mono text-[15px] py-1 focus:outline-none focus:border-[#4caf50] transition-colors"
                                        value={formData.exit_price}
                                        onChange={(e) => setFormData({...formData, exit_price: e.target.value})}
                                    />
                                </div>

                                {/* Transaction Password */}
                                <div className="space-y-1.5">
                                    <label className="block text-slate-400 text-[13px] font-medium tracking-wide uppercase opacity-70">Transaction Password</label>
                                    <input 
                                        type="password"
                                        autoComplete="new-password"
                                        className="w-full bg-transparent border-b border-white/20 text-white font-mono text-[15px] py-1 focus:outline-none focus:border-[#4caf50] transition-colors"
                                        value={formData.transactionPassword}
                                        onChange={(e) => setFormData({...formData, transactionPassword: e.target.value})}
                                        placeholder=""
                                    />
                                </div>

                                {/* Save Button */}
                                <div className="col-span-full pt-4">
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-bold py-2 px-8 rounded transition-all text-[14px] shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                                    >
                                        {loading ? 'SAVING...' : 'SAVE'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateTradePage;
