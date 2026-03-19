import React, { useState, useEffect } from 'react';
import { getHierarchyAccounts } from '../../services/api';

const BrokerAccountsPage = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (params = {}) => {
        setLoading(true);
        try {
            const data = await getHierarchyAccounts(params);
            setTableData(data || []);
        } catch (err) {
            console.error('Failed to fetch broker accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        fetchData({ fromDate, toDate });
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-4 md:space-y-6 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">

            {/* Filter Section - Matches Screenshot Layout */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex bg-white rounded shadow-md overflow-hidden">
                    <input
                        type="date"
                        placeholder="From Date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="px-4 py-2 text-slate-800 text-sm focus:outline-none border-r border-slate-200 min-w-[140px]"
                    />
                    <input
                        type="date"
                        placeholder="To Date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
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
                            {loading ? (
                                <tr><td colSpan="9" className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : tableData.length === 0 ? (
                                <tr><td colSpan="9" className="px-4 py-8 text-center text-slate-500">No data. Select date range and calculate.</td></tr>
                            ) : null}
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