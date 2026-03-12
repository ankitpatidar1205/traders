import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PendingOrdersPage = () => {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [formData, setFormData] = useState({
        script: '',
        userId: '',
        lots: '',
        price: '',
        orderType: '',
        transactionPassword: ''
    });

    const handleCreateClick = () => setView('create');

    const handleSave = (e) => {
        e.preventDefault();
        // Mock save logic
        console.log('Order Saved:', formData);
        setView('list');
        setFormData({
            script: '',
            userId: '',
            lots: '',
            price: '',
            orderType: '',
            transactionPassword: ''
        });
    };

    if (view === 'create') {
        return (
            <div className="flex flex-col h-full bg-[#1a2035] p-6 text-[#a0aec0] overflow-y-auto custom-scrollbar">
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #1a2035; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #4CAF50; border-radius: 4px; }
                `}</style>

                <div className="max-w-6xl w-full mx-auto mt-4">
                    <div className="bg-[#202940] rounded shadow-2xl relative border border-white/5 mt-8">
                        {/* Floating Header Ribbon */}
                        <div
                            className="absolute -top-6 left-5 px-6 py-4 rounded shadow-xl z-10"
                            style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
                        >
                            <h2 className="text-white text-[16px] font-normal uppercase leading-none tracking-tight">Create Limit Order</h2>
                        </div>

                        <form onSubmit={handleSave} className="px-6 py-12 pt-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 px-2 lg:px-4">
                                {/* Script */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Script</label>
                                    <div className="relative border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <select
                                            className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                            value={formData.script}
                                            onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                                        >
                                            <option value="" disabled className="bg-[#202940]">Select Scrip</option>
                                            <option value="GOLD" className="bg-[#202940]">GOLD</option>
                                            <option value="SILVER" className="bg-[#202940]">SILVER</option>
                                        </select>
                                        <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* User ID */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">User ID</label>
                                    <div className="relative border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <select
                                            className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                            value={formData.userId}
                                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                        >
                                            <option value="" disabled className="bg-[#202940]">Select User</option>
                                            <option value="SHRE072" className="bg-[#202940]">SHRE072</option>
                                        </select>
                                        <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Lots / Units */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Lots / Units</label>
                                    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <input
                                            type="text"
                                            className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px]"
                                            value={formData.lots}
                                            onChange={(e) => setFormData({ ...formData, lots: e.target.value })}
                                            placeholder="Enter lots"
                                        />
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Price</label>
                                    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <input
                                            type="text"
                                            className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px]"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="Enter price"
                                        />
                                    </div>
                                </div>

                                {/* Order Type */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Order Type</label>
                                    <div className="relative border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <select
                                            className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                            value={formData.orderType}
                                            onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                                        >
                                            <option value="" disabled className="bg-[#202940]">Select Order Type</option>
                                            <option value="BUY" className="bg-[#202940]">BUY LIMIT</option>
                                            <option value="SELL" className="bg-[#202940]">SELL LIMIT</option>
                                        </select>
                                        <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Transaction Password */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Transaction Password</label>
                                    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <input
                                            type="password"
                                            className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px]"
                                            value={formData.transactionPassword}
                                            onChange={(e) => setFormData({ ...formData, transactionPassword: e.target.value })}
                                            placeholder="******"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-12 px-2 lg:px-4">
                                <button
                                    type="submit"
                                    className="text-white font-bold py-2.5 px-10 rounded transition-all uppercase text-[13px] tracking-wider shadow-lg active:scale-95"
                                    style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
                                >
                                    SAVE
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="bg-[#344675] hover:bg-[#263148] text-white font-bold py-2.5 px-10 rounded transition-all uppercase text-[13px] tracking-wider shadow-lg active:scale-95"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#1a2035] p-4 space-y-8 text-[#a0aec0] overflow-y-auto">
            <div>
                <button
                    onClick={handleCreateClick}
                    className="bg-[#4CAF50] hover:bg-green-600 text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-green-900/10"
                >
                    CREATE PENDING ORDERS
                </button>
            </div>

            <div className="bg-[#151c2c] p-6 rounded border border-[#2d3748] shadow-sm">
                <p className="text-sm font-medium">No Pending Orders</p>
            </div>
        </div>
    );
};

export default PendingOrdersPage;
