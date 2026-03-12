import React, { useState } from 'react';

const GroupTradesPage = () => {
    const [filters, setFilters] = useState({
        id: '',
        scrip: '',
        segment: 'All',
        userId: '',
        buyRate: '',
        sellRate: '',
        lots: ''
    });

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
            id: '',
            scrip: '',
            segment: 'All',
            userId: '',
            buyRate: '',
            sellRate: '',
            lots: ''
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-8 overflow-y-auto">

            {/* Filter Card */}
            <div className="bg-[#1f283e] p-6 rounded-lg border border-white/10 shadow-xl">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6  mb-6">
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
                            {tradesData.length > 0 ? (
                                tradesData.map((trade) => (
                                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4">
                                            {/* Actions placeholder */}
                                        </td>
                                        <td className="px-4 py-4 text-white">{trade.id}</td>
                                        <td className="px-4 py-4 text-[#00BCD4]">{trade.scrip}</td>
                                        <td className="px-4 py-4">{trade.segment}</td>
                                        <td className="px-4 py-4">{trade.userId}</td>
                                        <td className="px-4 py-4">{trade.buyRate}</td>
                                        <td className="px-4 py-4">{trade.sellRate}</td>
                                        <td className="px-4 py-4">{trade.lots}</td>
                                        <td className="px-4 py-4">{trade.boughtAt}</td>
                                        <td className="px-4 py-4">{trade.soldAt || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="px-6 py-8 text-center text-slate-500">
                                        No trades found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GroupTradesPage;
