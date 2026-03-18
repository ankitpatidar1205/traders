import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const TraderFundsPage = ({ onNavigate }) => {
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        userId: '',
        amount: ''
    });

    const [fundsData, setFundsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFunds();
    }, []);

    const fetchFunds = async (params = {}) => {
        setLoading(true);
        try {
            const data = await api.getTraderFunds(params);
            setFundsData(data.map(f => ({
                id: f.id,
                username: f.username,
                name: f.full_name || '—',
                amount: f.amount,
                txnType: f.type,
                notes: f.remarks || '—',
                pgTxnId: 'MANUAL',
                createdAt: new Date(f.created_at).toLocaleString()
            })));
        } catch (err) {
            console.error('Failed to fetch funds', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchFunds({
            userId: filters.userId,
            amount: filters.amount
        });
    };

    const handleReset = () => {
        setFilters({
            fromDate: '',
            toDate: '',
            userId: '',
            amount: ''
        });
    };

    const handleDownloadReport = () => {
        console.log('Download report for dates:', filters.fromDate, filters.toDate);
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-4 md:space-y-8 overflow-y-auto">

            <div className="px-3 sm:px-4 md:px-6 space-y-4 md:space-y-8 pb-6 md:pb-10">
                {/* Top Bar - Date Filters and Download Button */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <input
                            type="text"
                            name="fromDate"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                            placeholder="From Date"
                            className="bg-white text-slate-900 px-4 py-2.5 rounded text-sm outline-none border border-slate-300 min-w-[180px]"
                        />
                        <input
                            type="text"
                            name="toDate"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                            placeholder="To Date"
                            className="bg-white text-slate-900 px-4 py-2.5 rounded text-sm outline-none border border-slate-300 min-w-[180px]"
                        />
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-bold py-2.5 px-6 rounded uppercase tracking-wide text-xs transition-all shadow-md whitespace-nowrap"
                    >
                        DOWNLOAD FUNDS REPORT
                    </button>
                </div>

                {/* Filter Section */}
                <div className="bg-[#1f283e] p-6 rounded-lg border border-white/10 shadow-xl">
                    <div className="flex flex-col gap-6">
                        {/* Filter Fields Row */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-56">
                                <label className="text-slate-500 text-xs block mb-2">User ID</label>
                                <input
                                    type="text"
                                    name="userId"
                                    value={filters.userId}
                                    onChange={handleFilterChange}
                                    className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                                />
                            </div>
                            <div className="w-full md:w-56">
                                <label className="text-slate-500 text-xs block mb-2">Amount</label>
                                <input
                                    type="text"
                                    name="amount"
                                    value={filters.amount}
                                    onChange={handleFilterChange}
                                    className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Buttons Row */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSearch}
                                className="text-white font-bold py-2 px-5 rounded uppercase tracking-wide text-[11px] transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95"
                                style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                            >
                                SEARCH
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-[#607d8b] hover:bg-[#546e7a] text-white font-bold py-2 px-5 rounded uppercase tracking-wide text-[11px] transition-all shadow-md"
                            >
                                RESET
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        onClick={() => onNavigate?.('create-fund')}
                        className="text-white font-bold py-2.5 px-6 rounded uppercase tracking-wide text-xs transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        CREATE FUNDS WD
                    </button>
                </div>

                {/* Results Section */}
                <div className="bg-[#1f283e] rounded-lg border border-white/10 shadow-xl overflow-hidden">
                    {/* Showing items count */}
                    <div className="px-6 py-4 bg-[#151c2c] border-b border-white/10">
                        <span className="text-slate-400 text-sm">
                            Showing <b className="text-white">{fundsData.length}</b> of <b className="text-white">{fundsData.length}</b> items.
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-white text-sm bg-[#151c2c] border-b border-white/10">
                                    <th className="px-4 py-4 font-bold">ID ↑</th>
                                    <th className="px-4 py-4 font-bold">username</th>
                                    <th className="px-4 py-4 font-bold">name</th>
                                    <th className="px-4 py-4 font-bold">Amount</th>
                                    <th className="px-4 py-4 font-bold">Txn Type</th>
                                    <th className="px-4 py-4 font-bold">Notes</th>
                                    <th className="px-4 py-4 font-bold">PG Txn ID</th>
                                    <th className="px-4 py-4 font-bold">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-300">
                                {fundsData.length > 0 ? (
                                    fundsData.map((fund) => (
                                        <tr key={fund.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-4 text-white">{fund.id}</td>
                                            <td className="px-4 py-4 text-[#00BCD4]">{fund.username}</td>
                                            <td className="px-4 py-4">{fund.name}</td>
                                            <td className={`px-4 py-4 font-bold ${parseFloat(fund.amount || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {fund.amount}
                                            </td>
                                            <td className="px-4 py-4">{fund.txnType}</td>
                                            <td className="px-4 py-4">{fund.notes}</td>
                                            <td className="px-4 py-4">{fund.pgTxnId}</td>
                                            <td className="px-4 py-4">{fund.createdAt}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                                            No funds found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TraderFundsPage;
