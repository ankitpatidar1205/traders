import React from 'react';

const ActivePositionsTable = () => {
    // Data matching Screenshot 2/3
    const positions = [
        {
            scrip: 'CRUDEOIL26FEBFUT',
            activeBuy: '0 (0)',
            activeSell: '2 (200)',
            avgBuyRate: '0',
            avgSellRate: '5624.5',
            total: '2',
            net: '-2',
            m2m: '700',
            marginUsed: '40000',
            cmp: '5621'
        },
    ];

    const MobileActivePositionCard = ({ pos }) => (
        <div className="bg-[#1f283e] p-4 rounded-lg border border-white/5 shadow-md mb-3 active:scale-[0.98] transition-transform">
            <div className="flex justify-between items-center mb-3">
                <span className="bg-[#4CAF50] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide truncate max-w-[200px]">
                    {pos.scrip}
                </span>
                <span className="text-sm font-bold text-green-400">{pos.m2m}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="flex flex-col">
                    <span className="text-slate-500">Active Sell</span>
                    <span className="text-white font-medium">{pos.activeSell}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-slate-500">Avg Sell</span>
                    <span className="text-white font-medium">{pos.avgSellRate}</span>
                </div>
            </div>
            <div className="flex justify-between items-center border-t border-[#2d3748] pt-2 mt-2 text-xs">
                <div className="flex flex-col">
                    <span className="text-[#01B4EA]">Net Quantity</span>
                    <span className="text-white font-bold">{pos.net}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-slate-500">CMP</span>
                    <span className="text-white font-medium">{pos.cmp}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mb-6">
            <div className="bg-[#1f283e] rounded-t-lg border-t border-x border-white/5 px-6 py-4 flex justify-between items-center shadow-sm">
                <h2 className="text-lg md:text-2xl font-normal text-slate-300 tracking-wide">SHRE072's Active Positions</h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-[#1f283e] rounded-b-lg border border-white/5 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="text-slate-300 text-[13px] font-normal border-b border-white/10 bg-[#1f283e]">
                                <th className="px-6 py-4">Scrip</th>
                                <th className="px-6 py-4">Active Buy</th>
                                <th className="px-6 py-4">Active Sell</th>
                                <th className="px-6 py-4">Avg buy rate</th>
                                <th className="px-6 py-4">Avg sell rate</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Net</th>
                                <th className="px-6 py-4">M2m</th>
                                <th className="px-6 py-4">Margin Used</th>
                                <th className="px-6 py-4">CMP</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] text-slate-300">
                            {positions.map((pos) => (
                                <tr key={pos.scrip} className="border-b border-white/5 bg-[#1a2035]/50">
                                    <td className="px-6 py-4 text-slate-300 uppercase">{pos.scrip}</td>
                                    <td className="px-6 py-4">{pos.activeBuy}</td>
                                    <td className="px-6 py-4">{pos.activeSell}</td>
                                    <td className="px-6 py-4">{pos.avgBuyRate}</td>
                                    <td className="px-6 py-4">{pos.avgSellRate}</td>
                                    <td className="px-6 py-4">{pos.total}</td>
                                    <td className="px-6 py-4">{pos.net}</td>
                                    <td className="px-6 py-4 font-bold text-white">{pos.m2m}</td>
                                    <td className="px-6 py-4">{pos.marginUsed}</td>
                                    <td className="px-6 py-4">{pos.cmp}</td>
                                </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-[#1f283e] border-t border-white/10 font-bold text-slate-200">
                                <td className="px-6 py-4">Total</td>
                                <td className="px-6 py-4">0</td>
                                <td className="px-6 py-4">2</td>
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4">2</td>
                                <td className="px-6 py-4">2</td>
                                <td className="px-6 py-4 text-white">700</td>
                                <td className="px-6 py-4">40000</td>
                                <td className="px-6 py-4"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 mt-2">
                {positions.map((pos) => (
                    <MobileActivePositionCard key={pos.scrip} pos={pos} />
                ))}
            </div>

            <div className="p-4 bg-[#1f283e] rounded-b-lg md:rounded-t-none border-x border-b border-white/5 md:border-none">
                <button className="w-full md:w-auto bg-[#4CAF50] hover:bg-[#43a047] text-white text-[11px] font-bold py-3 px-6 rounded shadow uppercase tracking-wider transition-colors">
                    GO TO SHRE072'S ACCOUNT
                </button>
            </div>
        </div>
    );
};

export default ActivePositionsTable;
