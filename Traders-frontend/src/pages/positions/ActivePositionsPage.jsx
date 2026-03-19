import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

const ActivePositionsPage = () => {
    const [filters, setFilters] = useState({ username: '', status: '' });
    const [positionsData, setPositionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({ buy: 0, sell: 0, total: 0, net: 0, m2m: 0 });

    React.useEffect(() => {
        const fetchPositions = async () => {
            try {
                const { getActivePositions } = await import('../../services/api');
                const data = await getActivePositions();
                setPositionsData(data);
                
                // Calculate totals
                const t = data.reduce((acc, pos) => ({
                    buy: acc.buy + (pos.type === 'BUY' ? pos.total_qty : 0),
                    sell: acc.sell + (pos.type === 'SELL' ? pos.total_qty : 0),
                    total: acc.total + pos.total_qty,
                    net: acc.net + (pos.type === 'BUY' ? pos.total_qty : -pos.total_qty),
                    m2m: acc.m2m + (pos.m2m || 0)
                }), { buy: 0, sell: 0, total: 0, net: 0, m2m: 0 });
                setTotals(t);
            } catch (err) {
                console.error('Fetch positions error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPositions();
    }, []);

    return (
        <div className="flex flex-col h-full space-y-4 overflow-y-auto custom-scrollbar px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            {/* Table Section matching Screenshot */}
            <div className="bg-[#1f283e] rounded-lg border border-white/5 shadow-2xl overflow-hidden w-full">
                <div className="p-3 sm:p-4 border-b border-white/5">
                    <button className="bg-[#ab47bc] hover:bg-[#9c27b0] text-white px-6 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95">
                        SHOW EQUITY POSITIONS
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="text-slate-400 text-[13px] font-medium border-b border-white/5 bg-white/[0.01]">
                                <th className="px-6 py-4">Scrip</th>
                                <th className="px-6 py-4 text-center">Active Buy</th>
                                <th className="px-6 py-4 text-center">Active Sell</th>
                                <th className="px-6 py-4 text-center">Avg buy rate</th>
                                <th className="px-6 py-4 text-center">Avg sell rate</th>
                                <th className="px-6 py-4 text-center">Total</th>
                                <th className="px-6 py-4 text-center">Net</th>
                                <th className="px-6 py-4 text-center">M2m</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-slate-300">
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-10">Loading positions...</td></tr>
                            ) : positionsData.length > 0 ? (
                                positionsData.map((pos, index) => (
                                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4">{pos.symbol}</td>
                                        <td className="px-6 py-4 text-center">{pos.type === 'BUY' ? pos.total_qty : 0}</td>
                                        <td className="px-6 py-4 text-center">{pos.type === 'SELL' ? pos.total_qty : 0}</td>
                                        <td className="px-6 py-4 text-center">{pos.type === 'BUY' ? pos.avg_price : '0'}</td>
                                        <td className="px-6 py-4 text-center">{pos.type === 'SELL' ? pos.avg_price : '0'}</td>
                                        <td className="px-6 py-4 text-center">{pos.total_qty}</td>
                                        <td className="px-6 py-4 text-center">{pos.type === 'BUY' ? pos.total_qty : -pos.total_qty}</td>
                                        <td className="px-6 py-4 text-center">{pos.m2m || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="text-center py-10 text-slate-500">No active positions.</td></tr>
                            )}
                            {/* Total Row matching screenshot exactly */}
                            <tr className="bg-white/[0.02] font-bold text-slate-100">
                                <td className="px-6 py-5">Total</td>
                                <td className="px-6 py-5 text-center">{totals.buy}</td>
                                <td className="px-6 py-5 text-center">{totals.sell}</td>
                                <td className="px-6 py-5"></td>
                                <td className="px-6 py-5"></td>
                                <td className="px-6 py-5 text-center">{totals.total}</td>
                                <td className="px-6 py-5 text-center">{totals.net}</td>
                                <td className="px-6 py-5 text-center">{totals.m2m}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivePositionsPage;
