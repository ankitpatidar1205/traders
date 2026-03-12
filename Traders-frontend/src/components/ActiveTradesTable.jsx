import React from 'react';

const ActiveTradesTable = () => {
  const data = [
    { x: "X", id: "4239596", scrip: "CRUDEOIL 26FEBFUT", buyRate: "0", sellRate: "5620", lots: "1 / 100", buyTurnover: "0", sellTurnover: "562000", cmp: "5621", activePL: "-100", margin: "20000", bought: "(not set)" },
    // Only showing 1 item in screenshot 4 active trades bottom part visible, but let's keep 2 for demo
  ];

  const MobileActiveTradeCard = ({ item }) => (
    <div className="bg-[#151c2c] p-4 rounded-lg border border-[#2d3748] shadow-md mb-3 active:scale-[0.98] transition-transform">
        <div className="flex justify-between items-start mb-2">
            <div>
                <span className="text-xs text-slate-400 font-mono">#{item.id}</span>
                <h3 className="text-[#90caf9] font-bold text-sm uppercase mt-0.5">{item.scrip}</h3>
            </div>
            <div className={`text-sm font-bold ${item.activePL.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                {item.activePL}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
             <div className="flex flex-col">
                <span className="text-slate-500">Sell Rate</span>
                <span className="text-white font-medium">{item.sellRate}</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-slate-500">CMP</span>
                <span className="text-white font-medium">{item.cmp}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-slate-500">Lots</span>
                <span className="text-white font-medium">{item.lots}</span>
            </div>
             <div className="flex flex-col text-right">
                <span className="text-slate-500">Margin</span>
                <span className="text-white font-medium">{item.margin}</span>
            </div>
        </div>
    </div>
  );

  return (
    <div className="mb-6">
      <div className="bg-[#151c2c] rounded-t-lg border-t border-x border-[#2d3748] px-6 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-lg md:text-xl font-normal text-slate-300 tracking-wide">Active Trades</h2>
        <p className="text-xs text-slate-500">Showing {data.length} items.</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[#151c2c] rounded-b-lg border border-[#2d3748] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
            <thead>
                <tr className="text-slate-300 text-[13px] font-normal border-b border-[#2d3748] bg-[#151c2c]">
                <th className="px-6 py-4">X</th>
                <th className="px-6 py-4">ID ↑</th>
                <th className="px-6 py-4">Scrip</th>
                <th className="px-6 py-4">Buy Rate</th>
                <th className="px-6 py-4">Sell Rate</th>
                <th className="px-6 py-4">Lots / Units</th>
                <th className="px-6 py-4">Buy Turnover</th>
                <th className="px-6 py-4">Sell Turnover</th>
                <th className="px-6 py-4">CMP</th>
                <th className="px-6 py-4">Active P/L</th>
                <th className="px-6 py-4">Margin Used</th>
                <th className="px-6 py-4">Bough</th>
                </tr>
            </thead>
            <tbody className="text-[13px] text-slate-300">
                {data.map((item, index) => (
                <tr key={item.id} className="border-b border-[#2d3748] hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-slate-400">{item.x}</td>
                    <td className="px-6 py-4 text-slate-300">{item.id}</td>
                    <td className="px-6 py-4 text-[#90caf9] uppercase">{item.scrip}</td>
                    <td className="px-6 py-4 text-slate-300">{item.buyRate}</td>
                    <td className="px-6 py-4 text-slate-300">{item.sellRate}</td>
                    <td className="px-6 py-4 text-slate-300">{item.lots}</td>
                    <td className="px-6 py-4 text-slate-300">{item.buyTurnover}</td>
                    <td className="px-6 py-4 text-slate-300">{item.sellTurnover}</td>
                    <td className="px-6 py-4 text-slate-300">{item.cmp}</td>
                    <td className={`px-6 py-4 ${item.activePL.startsWith('-') ? 'text-slate-300' : 'text-slate-300'}`}>
                    {item.activePL}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{item.margin}</td>
                    <td className="px-6 py-4 text-slate-300">{item.bought}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

       {/* Mobile Cards */}
       <div className="md:hidden space-y-3 mt-2">
          {data.map((item, index) => (
              <MobileActiveTradeCard key={item.id} item={item} />
          ))}
      </div>
    </div>
  );
};

export default ActiveTradesTable;
