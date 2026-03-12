import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const TradesPage = ({ trades = [], onCreateClick }) => {
    const [displayedTrades, setDisplayedTrades] = useState(trades);
    const [selectedTrades, setSelectedTrades] = useState([]);

    // Sync displayed trades when props change
    useEffect(() => {
        setDisplayedTrades(trades);
    }, [trades]);

    // Search State
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        id: '',
        scrip: '',
        segment: 'All',
        userId: '',
        buyRate: '',
        sellRate: '',
        lots: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        const filtered = trades.filter(trade => {
            const matchId = filters.id ? trade.id.toString().includes(filters.id) : true;
            const matchScrip = filters.scrip ? trade.symbol?.toLowerCase().includes(filters.scrip.toLowerCase()) : true;
            const matchSegment = filters.segment !== 'All' ? trade.segment === filters.segment : true;
            const matchUser = filters.userId ? trade.user_id?.toString().includes(filters.userId) : true;
            const matchBuy = filters.buyRate ? trade.entry_price?.toString().includes(filters.buyRate) : true;
            const matchSell = filters.sellRate ? trade.exit_price?.toString().includes(filters.sellRate) : true;
            const matchLots = filters.lots ? trade.qty?.toString().includes(filters.lots) : true;
            return matchId && matchScrip && matchSegment && matchUser && matchBuy && matchSell && matchLots;
        });
        setDisplayedTrades(filtered);
    };

    const handleReset = () => {
        setFilters({
            fromDate: '',
            toDate: '',
            id: '',
            scrip: '',
            segment: 'All',
            userId: '',
            buyRate: '',
            sellRate: '',
            lots: ''
        });
        setDisplayedTrades(trades);
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
        <div className="flex flex-col h-full bg-[#1a2035] space-y-8 overflow-y-auto">

            {/* Top Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6">
                <button
                    onClick={onCreateClick || (() => alert('Create Trades functionality'))}
                    className="text-white font-bold py-3 px-6 rounded uppercase tracking-wide text-xs transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95"
                    style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                >
                    CREATE TRADES
                </button>

                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        name="fromDate"
                        value={filters.fromDate}
                        onChange={handleFilterChange}
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                        placeholder="From Date"
                        className="bg-white text-slate-900 text-sm py-2.5 px-4 rounded outline-none border border-slate-300 cursor-pointer min-w-[150px]"
                    />
                    <input
                        type="text"
                        name="toDate"
                        value={filters.toDate}
                        onChange={handleFilterChange}
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                        placeholder="To Date"
                        className="bg-white text-slate-900 text-sm py-2.5 px-4 rounded outline-none border border-slate-300 cursor-pointer min-w-[150px]"
                    />
                    <button
                        onClick={handleExport}
                        className="bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-bold py-3 px-6 rounded uppercase tracking-wide text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        EXPORT TRADES
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

                <div className="flex gap-3">
                    <button
                        onClick={handleSearch}
                        className="text-white font-bold py-2.5 px-8 rounded uppercase tracking-wide text-xs transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        SEARCH
                    </button>
                    <button
                        onClick={handleReset}
                        className="bg-[#607d8b] hover:bg-[#546e7a] text-white font-bold py-2.5 px-8 rounded uppercase tracking-wide text-xs transition-all shadow-md"
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
                        Showing <b className="text-white">{displayedTrades.length}</b> of <b className="text-white">{trades.length}</b> items.
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-white text-sm bg-[#151c2c] border-b border-white/10">
                                <th className="px-4 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={displayedTrades.length > 0 && selectedTrades.length === displayedTrades.length}
                                        className="w-5 h-5 rounded bg-slate-700 border-slate-600 cursor-pointer accent-[#2196F3]"
                                    />
                                </th>
                                <th className="px-4 py-4 font-bold">Actions</th>
                                <th className="px-4 py-4 font-bold">ID ↑</th>
                                <th className="px-4 py-4 font-bold">Scrip</th>
                                <th className="px-4 py-4 font-bold">Segment</th>
                                <th className="px-4 py-4 font-bold">User ID</th>
                                <th className="px-4 py-4 font-bold">Buy Rate</th>
                                <th className="px-4 py-4 font-bold">Sell Rate</th>
                                <th className="px-4 py-4 font-bold">Lots / Units</th>
                                <th className="px-4 py-4 font-bold">Bought at</th>
                                <th className="px-4 py-4 font-bold">Sold at</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-300">
                            {displayedTrades.length > 0 ? (
                                displayedTrades.map((trade) => (
                                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4">
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
                                        <td className="px-4 py-4 text-white">{trade.id}</td>
                                        <td className="px-4 py-4 text-[#00BCD4] font-bold">{trade.symbol}</td>
                                        <td className="px-4 py-4">{trade.type || 'NSE'}</td>
                                        <td className="px-4 py-4 font-mono">{trade.username || trade.user_id}</td>
                                        <td className="px-4 py-4 font-mono text-green-400">{trade.entry_price}</td>
                                        <td className="px-4 py-4 font-mono text-red-400">{trade.exit_price || '-'}</td>
                                        <td className="px-4 py-4 font-bold">{trade.qty}</td>
                                        <td className="px-4 py-4 text-xs">{new Date(trade.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-4 text-xs">{trade.closed_at ? new Date(trade.closed_at).toLocaleString() : '-'}</td>
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
