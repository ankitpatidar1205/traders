import React, { useState } from 'react';

const BrokerAccountsPage = () => {
    const [filters, setFilters] = useState({
        fromDate: '02/02/2026',
        toDate: '02/02/2026'
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        console.log('Calculating for:', filters);
    };

    const tableData = [
        {
            broker: 'All',
            sumPL: '',
            sumBrokerage: '',
            sumSwap: '',
            sumNet: '',
            plShare: '',
            brokerageShare: '',
            swapShare: '',
            netShare: ''
        },
        {
            broker: '3761: demo001',
            sumPL: '0',
            sumBrokerage: '0',
            sumSwap: '0',
            sumNet: '0',
            plShare: '0',
            brokerageShare: '0',
            swapShare: '0',
            netShare: '0'
        }
    ];

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-6 overflow-y-auto">

            {/* Filter Section - Matches Screenshot Layout */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex bg-white rounded shadow-md overflow-hidden">
                    <input
                        type="text"
                        name="fromDate"
                        placeholder="From Date"
                        value={filters.fromDate}
                        onChange={handleFilterChange}
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                        className="px-4 py-2 text-slate-800 text-sm focus:outline-none border-r border-slate-200 min-w-[140px]"
                    />
                    <input
                        type="text"
                        name="toDate"
                        placeholder="To Date"
                        value={filters.toDate}
                        onChange={handleFilterChange}
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                        className="px-4 py-2 text-slate-800 text-sm focus:outline-none min-w-[140px]"
                    />
                </div>
                <button
                    onClick={handleCalculate}
                    className="btn-success-gradient text-white font-bold py-2 px-6 rounded uppercase tracking-wider text-[11px] shadow-lg"
                >
                    CALCULATE FOR CUSTOM DATES
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-[#1a2035] border border-white/10 rounded overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1f283e] text-white/90 text-sm border-b border-white/10">
                                <th className="px-4 py-4 font-normal border-r border-white/10">Broker</th>
                                <th className="px-4 py-4 font-normal border-r border-white/10">SUM of Client PL</th>
                                <th className="px-4 py-4 font-normal border-r border-white/10">SUM of Client Brokerage</th>
                                <th className="px-4 py-4 font-normal border-r border-white/10">SUM of Client Swap</th>
                                <th className="px-4 py-4 font-normal border-r border-white/10">SUM of Client Net</th>
                                <th className="px-4 py-4 font-normal border-r border-white/10">PL Share</th>
                                <th className="px-4 py-4 font-normal border-r border-white/10">Brokerage Share</th>
                                <th className="px-4 py-4 font-normal border-r border-white/10">Swap Share</th>
                                <th className="px-4 py-4 font-normal">Net Share</th>
                            </tr>
                        </thead>
                        <tbody className="text-white/80 text-[13px]">
                            {tableData.map((row, index) => (
                                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-5 border-r border-white/5">{row.broker}</td>
                                    <td className="px-4 py-5 border-r border-white/5 text-center">{row.sumPL || '0'}</td>
                                    <td className="px-4 py-5 border-r border-white/5 text-center">{row.sumBrokerage || '0'}</td>
                                    <td className="px-4 py-5 border-r border-white/5 text-center">{row.sumSwap || '0'}</td>
                                    <td className="px-4 py-5 border-r border-white/5 text-center">{row.sumNet || '0'}</td>
                                    <td className="px-4 py-5 border-r border-white/5 text-center">{row.plShare || '0'}</td>
                                    <td className="px-4 py-5 border-r border-white/5 text-center">{row.brokerageShare || '0'}</td>
                                    <td className="px-4 py-5 border-r border-white/5 text-center">{row.swapShare || '0'}</td>
                                    <td className="px-4 py-5 text-center">{row.netShare || '0'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BrokerAccountsPage;