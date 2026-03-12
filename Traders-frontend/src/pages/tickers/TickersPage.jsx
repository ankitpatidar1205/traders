import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TickersPage = () => {
    const [view, setView] = useState('list'); // 'list' or 'add'
    const [formData, setFormData] = useState({
        startDate: '02/02/2026',
        startHour: '00',
        startMin: '00',
        endDate: '02/02/2026',
        endHour: '00',
        endMin: '00',
        message: '',
        transactionPassword: ''
    });

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Ticker Added:', formData);
        setView('list');
    };

    if (view === 'add') {
        return (
            <div className="flex flex-col h-full bg-[#1a2035]  text-[#a0aec0] overflow-y-auto">
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
                            <h2 className="text-white text-[16px] font-normal uppercase leading-none tracking-tight">Add Ticker</h2>
                        </div>

                        <form onSubmit={handleSave} className="px-6 py-12 pt-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 px-2 lg:px-4">
                                {/* Start Date & Time */}
                                <div className="space-y-2">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Start Date</label>
                                    <div className="flex gap-1 items-end">
                                        <div className="flex-1 border-b border-white/10 focus-within:border-[#4caf50] transition-colors">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px]"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative border-b border-white/10 focus-within:border-[#4caf50] transition-colors w-24">
                                            <select
                                                className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                                value={formData.startHour}
                                                onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                                            >
                                                {hours.map(h => <option key={h} value={h} className="bg-[#202940]">{h}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>
                                        <div className="relative border-b border-white/10 focus-within:border-[#4caf50] transition-colors w-24">
                                            <select
                                                className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                                value={formData.startMin}
                                                onChange={(e) => setFormData({ ...formData, startMin: e.target.value })}
                                            >
                                                {minutes.map(m => <option key={m} value={m} className="bg-[#202940]">{m}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* End Date & Time */}
                                <div className="space-y-2">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">End Date</label>
                                    <div className="flex gap-1 items-end">
                                        <div className="flex-1 border-b border-white/10 focus-within:border-[#4caf50] transition-colors">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px]"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative border-b border-white/10 focus-within:border-[#4caf50] transition-colors w-24">
                                            <select
                                                className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                                value={formData.endHour}
                                                onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                                            >
                                                {hours.map(h => <option key={h} value={h} className="bg-[#202940]">{h}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>
                                        <div className="relative border-b border-white/10 focus-within:border-[#4caf50] transition-colors w-24">
                                            <select
                                                className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                                value={formData.endMin}
                                                onChange={(e) => setFormData({ ...formData, endMin: e.target.value })}
                                            >
                                                {minutes.map(m => <option key={m} value={m} className="bg-[#202940]">{m}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Message</label>
                                    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <textarea
                                            className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px] min-h-[40px]"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Enter message"
                                        />
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
        <div className="flex flex-col h-full text-[#a0aec0]">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Showing <span className="text-white font-bold">0</span> of items.</span>
            </div>

            <div className="mb-4">
                <button
                    onClick={() => setView('add')}
                    className="bg-[#c026d3] hover:bg-[#a21caf] text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-900/10"
                >
                    ADD TICKER
                </button>
            </div>

            {/* Tickers Table */}
            <div className="flex-1 bg-[#202940] rounded-lg border border-[#2d3748] overflow-hidden flex flex-col shadow-xl min-h-[100px]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[#a0aec0] text-[11px] font-bold uppercase tracking-wider border-b border-[#2d3748]">
                                <th className="px-6 py-4 w-32">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                                        ID <span className="text-[9px] align-top">↑↑</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4">Message</th>
                                <th className="px-6 py-4 w-48">Start Time</th>
                                <th className="px-6 py-4 w-48">End Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Empty state implicitly handled by showing 0 items */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TickersPage;
