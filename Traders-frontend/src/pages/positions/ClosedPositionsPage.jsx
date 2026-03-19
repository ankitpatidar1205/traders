import React from 'react';

const ClosedPositionsPage = () => {
    const [closedData, setClosedData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [totals, setTotals] = React.useState({ lots: 0, pnl: 0, brokerage: 0, netPnL: 0 });

    React.useEffect(() => {
        const fetchClosed = async () => {
            try {
                const { getClosedPositions } = await import('../../services/api');
                const data = await getClosedPositions();
                setClosedData(data);
                
                // Calculate totals
                const t = data.reduce((acc, pos) => ({
                    lots: acc.lots + pos.qty,
                    pnl: acc.pnl + (parseFloat(pos.pnl) || 0),
                    brokerage: acc.brokerage + (parseFloat(pos.brokerage) || 0),
                    netPnL: acc.netPnL + ((parseFloat(pos.pnl) || 0) - (parseFloat(pos.brokerage) || 0))
                }), { lots: 0, pnl: 0, brokerage: 0, netPnL: 0 });
                setTotals(t);
            } catch (err) {
                console.error('Fetch closed error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchClosed();
    }, []);

    return (
        <div className="flex flex-col h-full space-y-4 overflow-y-auto custom-scrollbar px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            {/* Table Section matching Screenshot */}
            <div className="bg-[#1f283e] rounded-lg border border-white/5 shadow-2xl overflow-hidden w-full">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="text-slate-400 text-[13px] font-medium border-b border-white/5 bg-white/[0.01]">
                                <th className="px-6 py-5">Scrip</th>
                                <th className="px-6 py-5 text-center">Lots</th>
                                <th className="px-6 py-5 text-center">Avg buy rate</th>
                                <th className="px-6 py-5 text-center">Avg sell rate</th>
                                <th className="px-6 py-5 text-center">Profit / Loss</th>
                                <th className="px-6 py-5 text-center">Brokerage</th>
                                <th className="px-6 py-5 text-center">Net P/L</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-slate-300">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-10">Loading closed positions...</td></tr>
                            ) : closedData.length > 0 ? (
                                closedData.map((pos, index) => (
                                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-5">{pos.symbol}</td>
                                        <td className="px-6 py-5 text-center">{pos.qty}</td>
                                        <td className="px-6 py-5 text-center">{pos.entry_price}</td>
                                        <td className="px-6 py-5 text-center">{pos.exit_price || '-'}</td>
                                        <td className={`px-6 py-5 text-center font-bold ${parseFloat(pos.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {pos.pnl || '0'}
                                        </td>
                                        <td className="px-6 py-5 text-center">{pos.brokerage || '0'}</td>
                                        <td className={`px-6 py-5 text-center font-bold ${(parseFloat(pos.pnl) || 0) - (parseFloat(pos.brokerage) || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {(parseFloat(pos.pnl) || 0) - (parseFloat(pos.brokerage) || 0)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center py-10 text-slate-500">No closed positions.</td></tr>
                            )}
                            {/* Total Row matching screenshot theme */}
                            <tr className="bg-white/[0.02] font-bold text-white border-t border-white/10">
                                <td className="px-6 py-6 uppercase tracking-wider">Total</td>
                                <td className="px-6 py-6 text-center text-base">{totals.lots}</td>
                                <td className="px-6 py-6 text-center"></td>
                                <td className="px-6 py-6 text-center"></td>
                                <td className={`px-6 py-6 text-center text-base ${totals.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totals.pnl}</td>
                                <td className="px-6 py-6 text-center text-base">{totals.brokerage}</td>
                                <td className={`px-6 py-6 text-center text-base ${totals.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totals.netPnL}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClosedPositionsPage;
