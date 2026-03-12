import React, { useState } from 'react';

const ClosedTradesPage = () => {
    const [filters, setFilters] = useState({
        timeDiff: '',
        scrip: '',
        username: ''
    });

    const [selectedTrades, setSelectedTrades] = useState([]);
    const tradesData = [];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        console.log('Search with filters:', filters);
    };

    const handleReset = () => {
        setFilters({
            timeDiff: '',
            scrip: '',
            username: ''
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTrades(tradesData.map(trade => trade.id));
        } else {
            setSelectedTrades([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedTrades.includes(id)) {
            setSelectedTrades(selectedTrades.filter(tradeId => tradeId !== id));
        } else {
            setSelectedTrades([...selectedTrades, id]);
        }
    };

    const handleDeleteTrades = () => {
        if (selectedTrades.length === 0) {
            alert('Please select trades to delete');
            return;
        }
        console.log('Delete trades:', selectedTrades);
        alert(`Deleting ${selectedTrades.length} trade(s)`);
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035]  space-y-8 overflow-y-auto">

            {/* Filter Card */}
            <div className="bg-[#1f283e] p-6 rounded-lg border border-white/10 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    {/* Filter Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-slate-500 text-xs block mb-2">Time Diff.</label>
                            <input
                                type="text"
                                name="timeDiff"
                                value={filters.timeDiff}
                                onChange={handleFilterChange}
                                placeholder="No. of seconds"
                                className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs block mb-2">Scrip</label>
                            <input
                                type="text"
                                name="scrip"
                                value={filters.scrip}
                                onChange={handleFilterChange}
                                placeholder="e.g. GOLD"
                                className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs block mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={filters.username}
                                onChange={handleFilterChange}
                                className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-slate-600 focus:border-[#4CAF50] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 shrink-0">
                        <button
                            onClick={handleSearch}
                            className="bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold py-2.5 px-8 rounded uppercase tracking-wide text-xs transition-all shadow-md"
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
            </div>

            {/* Results Section */}
            <div className="bg-[#1f283e] rounded-lg border border-white/10 shadow-xl overflow-hidden">
                {/* Showing items count */}
                <div className="px-6 py-4 bg-[#151c2c] border-b border-white/10">
                    <span className="text-slate-400 text-sm">
                        Showing <b className="text-white">{tradesData.length}</b> of <b className="text-white">{tradesData.length}</b> items.
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
                                        checked={tradesData.length > 0 && selectedTrades.length === tradesData.length}
                                        className="w-5 h-5 rounded bg-slate-700 border-slate-600 cursor-pointer accent-[#2196F3]"
                                    />
                                </th>
                                <th className="px-4 py-4 font-bold">ID ↑</th>
                                <th className="px-4 py-4 font-bold">Scrip</th>
                                <th className="px-4 py-4 font-bold">Segment</th>
                                <th className="px-4 py-4 font-bold">User ID</th>
                                <th className="px-4 py-4 font-bold">Buy Rate</th>
                                <th className="px-4 py-4 font-bold">Sell Rate</th>
                                <th className="px-4 py-4 font-bold">Lots / Units</th>
                                <th className="px-4 py-4 font-bold">Profit/Loss</th>
                                <th className="px-4 py-4 font-bold">Time Diff</th>
                                <th className="px-4 py-4 font-bold">Bought at</th>
                                <th className="px-4 py-4 font-bold">Sold at</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-300">
                            {tradesData.length > 0 ? (
                                tradesData.map((trade) => (
                                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedTrades.includes(trade.id)}
                                                onChange={() => handleSelectRow(trade.id)}
                                                className="w-5 h-5 rounded bg-slate-700 border-slate-600 cursor-pointer accent-[#2196F3]"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-white">{trade.id}</td>
                                        <td className="px-4 py-4 text-[#00BCD4]">{trade.scrip}</td>
                                        <td className="px-4 py-4">{trade.segment}</td>
                                        <td className="px-4 py-4">{trade.userId}</td>
                                        <td className="px-4 py-4">{trade.buyRate}</td>
                                        <td className="px-4 py-4">{trade.sellRate}</td>
                                        <td className="px-4 py-4">{trade.lots}</td>
                                        <td className={`px-4 py-4 font-bold ${parseFloat(trade.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {trade.profitLoss || '-'}
                                        </td>
                                        <td className="px-4 py-4">{trade.timeDiff || '-'}</td>
                                        <td className="px-4 py-4">{trade.boughtAt}</td>
                                        <td className="px-4 py-4">{trade.soldAt || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="px-6 py-8 text-center text-slate-500">
                                        No trades found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Delete Trades Button */}
                <div className="px-6 py-4 bg-[#151c2c] border-t border-white/10">
                    <button
                        onClick={handleDeleteTrades}
                        disabled={selectedTrades.length === 0}
                        className={`${selectedTrades.length === 0
                            ? 'bg-[#9C27B0]/50 cursor-not-allowed'
                            : 'bg-[#9C27B0] hover:bg-[#8E24AA]'
                            } text-white font-bold py-2.5 px-8 rounded uppercase tracking-wide text-xs transition-all shadow-md`}
                    >
                        DELETE TRADES
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClosedTradesPage;
