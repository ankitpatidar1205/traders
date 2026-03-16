import React, { useState, useEffect } from 'react';
import { RotateCcw, Loader2, Download } from 'lucide-react';
import { getTraderFunds } from '../../services/api';

const NegativeBalanceTxnsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ userId: '', amount: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Reusing getTraderFunds with filters. 
            // We could add a specific flag if backend supported it, 
            // but for now we'll just show movements.
            const res = await getTraderFunds(filters);
            setData(res);
        } catch (err) {
            console.error('Failed to fetch negative balance txns:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData();
    };

    const handleReset = () => {
        setFilters({ userId: '', amount: '' });
        // After state update, we need to call fetchData with empty filters
        setTimeout(() => fetchData(), 0);
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-8 overflow-y-auto p-4">
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
                <button className="bg-[#17a2b8] hover:bg-[#138496] text-white px-10 py-3 rounded font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all w-full md:w-auto flex items-center gap-2">
                    <Download className="w-4 h-4" /> DOWNLOAD REPORT
                </button>
            </div>

            {/* Search Card Section */}
            <div className="bg-[#1f283e] p-8 rounded shadow-2xl border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                    <div className="group">
                        <label className="block text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">User ID (Username)</label>
                        <input
                            type="text"
                            value={filters.userId}
                            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-[#5cb85c] transition-all"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Amount</label>
                        <input
                            type="text"
                            value={filters.amount}
                            onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-[#5cb85c] transition-all"
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleSearch}
                        className="bg-[#5cb85c] hover:bg-[#4caf50] text-white px-10 py-3 rounded font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all"
                    >
                        SEARCH
                    </button>
                    <button 
                        onClick={handleReset}
                        className="bg-[#808080] hover:bg-[#707070] text-white px-10 py-3 rounded font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
                    >
                        <RotateCcw className="w-4 h-4" /> RESET
                    </button>
                </div>
            </div>

            {/* Summary Statement */}
            <div className="py-4">
                <h3 className="text-white text-[25px] font-medium tracking-tight">
                    Total amount adjusted during the week: <span className="text-[#5cb85c]">₹0.00</span>
                </h3>
            </div>

            {/* Table Results Section */}
            <div className="bg-[#1f283e] rounded-lg shadow-2xl border border-white/5 overflow-hidden">
                <div className="px-8 py-4 bg-[#212a41] border-b border-white/5">
                    <span className="text-slate-400 text-sm">Showing <b className="text-white">{data.length}</b> of <b className="text-white">{data.length}</b> items.</span>
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
                            {loading ? (
                                <tr><td colSpan="8" className="px-8 py-10 text-center">Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="8" className="px-8 py-10 text-center">No records found.</td></tr>
                            ) : data.map((row, i) => (
                                <tr key={row.id || i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-4">{i + 1}</td>
                                    <td className="px-8 py-4 text-white font-bold">{row.id}</td>
                                    <td className="px-8 py-4 text-[#00BCD4]">{row.username}</td>
                                    <td className="px-8 py-4">{row.full_name || '-'}</td>
                                    <td className={`px-8 py-4 font-bold ${parseFloat(row.amount) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        ₹{parseFloat(row.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-4">{row.txn_type || row.type || '-'}</td>
                                    <td className="px-8 py-4">{row.notes || row.remarks || '-'}</td>
                                    <td className="px-8 py-4">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                                </tr>
                            ))}
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
