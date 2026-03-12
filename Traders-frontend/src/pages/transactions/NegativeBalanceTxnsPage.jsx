import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const NegativeBalanceTxnsPage = () => {
    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-8 overflow-y-auto">
            {/* Top Date Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="grid grid-cols-2 bg-white rounded overflow-hidden shadow-lg w-full md:w-auto">
                    <input
                        type="text"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.value === "" ? (e.target.type = "text") : null)}
                        placeholder="From Date"
                        className="px-6 py-3 border-r border-slate-200 focus:outline-none text-slate-700 font-medium text-sm min-w-[150px]"
                    />
                    <input
                        type="text"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.value === "" ? (e.target.type = "text") : null)}
                        placeholder="To Date"
                        className="px-6 py-3 focus:outline-none text-slate-700 font-medium text-sm min-w-[150px]"
                    />
                </div>
                <button className="bg-[#17a2b8] hover:bg-[#138496] text-white px-10 py-3 rounded font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all w-full md:w-auto">
                    DOWNLOAD REPORT
                </button>
            </div>

            {/* Search Card Section */}
            <div className="bg-[#1f283e] p-8 rounded shadow-2xl border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                    <div className="group">
                        <label className="block text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">User ID</label>
                        <input
                            type="text"
                            placeholder=" "
                            className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-[#5cb85c] transition-all"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Amount</label>
                        <input
                            type="text"
                            placeholder=" "
                            className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-[#5cb85c] transition-all"
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="bg-[#5cb85c] hover:bg-[#4caf50] text-white px-10 py-3 rounded font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all">SEARCH</button>
                    <button className="bg-[#808080] hover:bg-[#707070] text-white px-10 py-3 rounded font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all">
                        <RotateCcw className="w-4 h-4" /> RESET
                    </button>

                </div>
            </div>

            {/* Summary Statement */}
            <div className="py-4">
                <h3 className="text-white text-[25px] font-medium tracking-tight">Total amount adjusted during the week: 0</h3>
            </div>

            {/* Table Results Section */}
            <div className="bg-[#1f283e] rounded-lg shadow-2xl border border-white/5 overflow-hidden">
                <div className="px-8 py-4 bg-[#212a41] border-b border-white/5">
                    <span className="text-slate-400 text-sm">Showing <b className="text-white">0</b> of <b className="text-white">0</b> items.</span>
                </div>

                <div className="overflow-x-auto min-h-[100px]">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-white text-[13px] font-bold tracking-wider">
                                <th className="px-8 py-5 w-16"></th>
                                <th className="px-8 py-5">ID <span className="text-[10px] opacity-50 ml-1">↑↑</span></th>
                                <th className="px-8 py-5">username</th>
                                <th className="px-8 py-5">name</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Txn Type</th>
                                <th className="px-8 py-5">Notes</th>
                                <th className="px-8 py-5">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] text-slate-400">
                            {/* Empty as per screenshot "Showing 0 of 0" */}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-8 py-6 border-t border-white/5 bg-[#1a2035]/50 outline-none">
                    <div className="w-8 h-8 flex items-center justify-center text-white text-sm font-bold rounded cursor-default">1</div>
                </div>
            </div>
        </div>
    );
};

export default NegativeBalanceTxnsPage;
