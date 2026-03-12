import React from 'react';

const FundWithdrawalTable = () => {
  const data = [
    { id: 1, amount: "-40000", date: "2026-02-02 19:44:11", notes: "" },
    { id: 2, amount: "-60000", date: "2026-02-02 11:45:10", notes: "" },
    { id: 3, amount: "-100000", date: "2026-02-02 09:33:45", notes: "" },
    { id: 4, amount: "164845.7", date: "2026-02-02 00:00:00", notes: "Opening Balance", highlight: true },
  ];

  const MobileFundCard = ({ item }) => (
    <div className="bg-[#151c2c] p-4 rounded-lg border border-[#2d3748] shadow-md mb-3 active:scale-[0.98] transition-transform">
      <div className="flex justify-between items-start mb-2">
         <span className={`text-sm font-bold ${item.highlight ? 'text-[#01B4EA]' : 'text-slate-200'}`}>
           {item.amount}
         </span>
         <span className="text-xs text-slate-500 font-mono">{item.date}</span>
      </div>
      {item.notes && (
          <div className="mt-2 pt-2 border-t border-[#2d3748]">
            <p className="text-xs text-slate-400 italic">{item.notes}</p>
          </div>
      )}
    </div>
  );

  return (
    <div className="mb-6">
      <div className="bg-[#151c2c] rounded-t-lg border-t border-x border-[#2d3748] px-6 py-4 flex justify-between items-center bg-[#151c2c] shadow-sm">
        <h2 className="text-lg md:text-xl font-normal text-slate-300 tracking-wide">Fund - Withdrawal & Deposits</h2>
        <p className="text-xs text-slate-500">Showing 4 of 4 items.</p>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden md:block bg-[#151c2c] rounded-b-lg border border-[#2d3748] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-100 text-sm font-semibold border-b border-[#2d3748]">
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.map((item, index) => (
                <tr key={item.id} className="border-b border-[#2d3748] hover:bg-slate-800/20 transition-colors">
                  <td className={`px-6 py-4 ${item.highlight ? 'text-[#01B4EA] bg-[#01B4EA]/10 font-bold' : 'text-slate-300'}`}>
                    {item.amount}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.date}</td>
                  <td className="px-6 py-4 text-slate-300">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 mt-2">
          {data.map((item, index) => (
              <MobileFundCard key={item.id} item={item} />
          ))}
      </div>
    </div>
  );
};

export default FundWithdrawalTable;
