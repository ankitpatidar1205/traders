import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getTrades } from '../../services/api';

const TradesPage = ({ onCreateClick }) => {
    const [displayedTrades, setDisplayedTrades] = useState([]);
    const [allTrades, setAllTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrades, setSelectedTrades] = useState([]);

    const [filters, setFilters] = useState({
        fromDate: '', toDate: '', id: '', scrip: '', segment: 'All',
        userId: '', buyRate: '', sellRate: '', lots: ''
    });

    useEffect(() => { fetchTrades(); }, []);

    const fetchTrades = async () => {
        setLoading(true);
        try {
            const data = await getTrades();
            const mapped = data.map(t => ({
                id: t.id,
                scrip: t.symbol,
                segment: t.segment || 'MCX',
                userId: `${t.user_id}: ${t.username || ''}`,
                buyRate: t.type === 'BUY' ? t.entry_price : (t.exit_price || '-'),
                sellRate: t.type === 'SELL' ? t.entry_price : (t.exit_price || '-'),
                lots: t.qty,
                boughtAt: t.created_at ? new Date(t.created_at).toLocaleString() : '-',
                soldAt: t.closed_at ? new Date(t.closed_at).toLocaleString() : '-',
            }));
            setAllTrades(mapped);
            setDisplayedTrades(mapped);
        } catch (err) {
            console.error('Failed to fetch trades:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        const filtered = allTrades.filter(trade => {
            const matchId = filters.id ? trade.id.toString().includes(filters.id) : true;
            const matchScrip = filters.scrip ? trade.scrip?.toLowerCase().includes(filters.scrip.toLowerCase()) : true;
            const matchSegment = filters.segment !== 'All' ? trade.segment === filters.segment : true;
            const matchUser = filters.userId ? trade.userId?.toString().includes(filters.userId) : true;
            return matchId && matchScrip && matchSegment && matchUser;
        });
        setDisplayedTrades(filtered);
    };

    const handleReset = () => {
        setFilters({ fromDate: '', toDate: '', id: '', scrip: '', segment: 'All', userId: '', buyRate: '', sellRate: '', lots: '' });
        setDisplayedTrades(allTrades);
    };

    const handleExport = () => {
        if (displayedTrades.length === 0) {
            alert('No trades to export');
            return;
        }

        const headers = ['ID', 'Scrip', 'Segment', 'User ID', 'Buy Rate', 'Sell Rate', 'Lots', 'Bought At', 'Sold At'];
        const csvContent = [
            headers.join(','),
            ...displayedTrades.map(row => [
                row.id, row.scrip, row.segment, row.userId, row.buyRate, row.sellRate, row.lots, row.boughtAt, row.soldAt || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'trades_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTrades(displayedTrades.map(t => t.id));
        } else {
            setSelectedTrades([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedTrades(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const handleCloseTrades = () => {
        if (selectedTrades.length === 0) {
            alert('Please select trades to close');
            return;
        }
        alert(`Closing ${selectedTrades.length} trade(s): ${selectedTrades.join(', ')}`);
        setSelectedTrades([]);
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-4 md:space-y-8 overflow-y-auto">

            {/* Top Actions Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 px-3 sm:px-4 md:px-6 pt-4 flex-wrap">
                <button
                    onClick={onCreateClick || (() => alert('Create Trades functionality'))}
                    className="text-white font-bold py-3.5 px-8 rounded uppercase tracking-wide text-[11px] transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95 w-full sm:w-auto"
                    style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                >
                    CREATE TRADES
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <div className="flex flex-row gap-2 flex-1 sm:flex-none">
                        <input
                            type="text"
                            name="fromDate"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                            placeholder="From Date"
                            className="bg-white text-slate-900 text-xs py-3 px-4 rounded outline-none border border-slate-300 cursor-pointer flex-1 sm:min-w-[140px]"
                        />
                        <input
                            type="text"
                            name="toDate"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                            placeholder="To Date"
                            className="bg-white text-slate-900 text-xs py-3 px-4 rounded outline-none border border-slate-300 cursor-pointer flex-1 sm:min-w-[140px]"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-bold py-3.5 px-8 rounded uppercase tracking-wide text-[11px] transition-all shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <Download className="w-4 h-4" />
                        EXPORT
                    </button>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-[#1f283e] p-6 rounded-lg border border-white/10 shadow-xl mx-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Row 1 */}
                    <div>
                        <label className="text-slate-500 text-xs block mb-2">ID</label>
                        <input
                            type="text"
                            name="id"
                            value={filters.id}
                            onChange={handleFilterChange}
                            className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-slate-500 text-xs block mb-2">Scrip</label>
                        <input
                            type="text"
                            name="scrip"
                            value={filters.scrip}
                            onChange={handleFilterChange}
                            className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-slate-500 text-xs block mb-2">Segment</label>
                        <select
                            name="segment"
                            value={filters.segment}
                            onChange={handleFilterChange}
                            className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors appearance-none cursor-pointer"
                        >
                            <option value="All" className="bg-[#1f283e]">All</option>
                            <option value="NSE" className="bg-[#1f283e]">Equity</option>
                            <option value="MCX" className="bg-[#1f283e]">MCX</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-slate-500 text-xs block mb-2">User ID</label>
                        <input
                            type="text"
                            name="userId"
                            value={filters.userId}
                            onChange={handleFilterChange}
                            className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Row 2 */}
                    <div>
                        <label className="text-slate-500 text-xs block mb-2">Buy Rate</label>
                        <input
                            type="text"
                            name="buyRate"
                            value={filters.buyRate}
                            onChange={handleFilterChange}
                            className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-slate-500 text-xs block mb-2">Sell Rate</label>
                        <input
                            type="text"
                            name="sellRate"
                            value={filters.sellRate}
                            onChange={handleFilterChange}
                            className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-slate-500 text-xs block mb-2">Lots / Units</label>
                        <input
                            type="text"
                            name="lots"
                            value={filters.lots}
                            onChange={handleFilterChange}
                            className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleSearch}
                        className="text-white font-bold py-3 md:py-2.5 px-10 rounded uppercase tracking-wide text-xs transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95 flex-1 md:flex-none"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        SEARCH
                    </button>
                    <button
                        onClick={handleReset}
                        className="bg-[#607d8b] hover:bg-[#546e7a] text-white font-bold py-3 md:py-2.5 px-10 rounded uppercase tracking-wide text-xs transition-all shadow-md flex-1 md:flex-none"
                    >
                        RESET
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-[#1f283e] rounded-lg border border-white/10 shadow-xl overflow-hidden mx-6 mb-10">
                {/* Showing items count */}
                <div className="px-6 py-4 bg-[#151c2c] border-b border-white/10">
                    <span className="text-slate-400 text-sm">
                        Showing <b className="text-white">{displayedTrades.length}</b> of <b className="text-white">{allTrades.length}</b> items.
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-white text-sm bg-[#151c2c] border-b border-white/10">
                                <th className="px-4 py-4 w-12 sticky left-0 bg-[#151c2c] z-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={displayedTrades.length > 0 && selectedTrades.length === displayedTrades.length}
                                        className="w-5 h-5 rounded bg-slate-700 border-slate-600 cursor-pointer accent-[#2196F3]"
                                    />
                                </th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">Actions</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">ID ↑</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">Scrip</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">Segment</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">User ID</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">Buy Rate</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">Sell Rate</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">Lots / Units</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">Bought at</th>
                                <th className="px-4 py-4 font-bold whitespace-nowrap">Sold at</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-300">
                            {displayedTrades.length > 0 ? (
                                displayedTrades.map((trade) => (
                                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4 sticky left-0 bg-[#1f283e] z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedTrades.includes(trade.id)}
                                                onChange={() => handleSelectRow(trade.id)}
                                                className="w-5 h-5 rounded bg-slate-700 border-slate-600 cursor-pointer accent-[#2196F3]"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            {/* Actions placeholder */}
                                        </td>
                                        <td className="px-4 py-4 text-white whitespace-nowrap">{trade.id}</td>
                                        <td className="px-4 py-4 text-[#00BCD4] font-bold whitespace-nowrap">{trade.scrip}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{trade.segment}</td>
                                        <td className="px-4 py-4 font-mono whitespace-nowrap">{trade.userId}</td>
                                        <td className="px-4 py-4 font-mono text-green-400 whitespace-nowrap">{trade.buyRate}</td>
                                        <td className="px-4 py-4 font-mono text-red-400 whitespace-nowrap">{trade.sellRate}</td>
                                        <td className="px-4 py-4 font-bold whitespace-nowrap">{trade.lots}</td>
                                        <td className="px-4 py-4 text-xs whitespace-nowrap">{trade.boughtAt}</td>
                                        <td className="px-4 py-4 text-xs whitespace-nowrap">{trade.soldAt}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="px-6 py-8 text-center text-slate-500">
                                        No trades found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Close Trades Button */}
                <div className="px-6 py-4 bg-[#151c2c] border-t border-white/10">
                    <button
                        onClick={handleCloseTrades}
                        disabled={selectedTrades.length === 0}
                        className={`bg-[#9C27B0] hover:bg-[#8E24AA] text-white font-bold py-3 px-8 rounded uppercase tracking-wide text-xs transition-all shadow-lg ${selectedTrades.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        CLOSE TRADES
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradesPage;
