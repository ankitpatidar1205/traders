import React, { useState, useEffect } from 'react';
import { getHierarchyAccounts } from '../../services/api';

const AccountsPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [accountsData, setAccountsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getHierarchyAccounts(params);
      setAccountsData(data || []);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = accountsData.reduce((acc, row) => ({
    broker: 'Total',
    clientPL: (parseFloat(acc.clientPL || 0) + parseFloat(row.clientPL || 0)).toFixed(2),
    clientBrokerage: (parseFloat(acc.clientBrokerage || 0) + parseFloat(row.clientBrokerage || 0)).toFixed(2),
    clientNet: (parseFloat(acc.clientNet || 0) + parseFloat(row.clientNet || 0)).toFixed(2),
    plShare: (parseFloat(acc.plShare || 0) + parseFloat(row.plShare || 0)).toFixed(2),
    brokerageShare: (parseFloat(acc.brokerageShare || 0) + parseFloat(row.brokerageShare || 0)).toFixed(2),
    netShare: (parseFloat(acc.netShare || 0) + parseFloat(row.netShare || 0)).toFixed(2),
  }), { broker: 'Total', clientPL: '0', clientBrokerage: '0', clientNet: '0', plShare: '0', brokerageShare: '0', netShare: '0' });

  const handleCalculate = () => {
    fetchAccounts({ fromDate, toDate });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden ">
      {/* Date Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="grid grid-cols-2 bg-white rounded overflow-hidden shadow-lg w-full md:w-auto">
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            placeholder="From Date"
            className="px-6 py-3 border-r border-slate-200 focus:outline-none text-slate-700 font-medium text-sm min-w-[150px]"
          />
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            placeholder="To Date"
            className="px-6 py-3 focus:outline-none text-slate-700 font-medium text-sm min-w-[150px]"
          />
        </div>
        <button
          onClick={handleCalculate}
          className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-bold py-3 px-8 rounded uppercase tracking-widest text-[11px] transition-all shadow-lg active:scale-95 w-full md:w-auto"
        >
          CALCULATE FOR CUSTOM DATES
        </button>
      </div>
      {/* Table Section */}
      <div className="flex-1 overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse border border-[#2d3748]">
            <thead className="sticky top-0 bg-[#1c2638] z-10">
              <tr className="text-slate-100 text-xs font-semibold">
                <th className="px-4 py-3 border border-[#2d3748]">Receivable / Payable</th>
                <th className="px-4 py-3 border border-[#2d3748]">Broker:</th>
                <th className="px-4 py-3 border border-[#2d3748]">SUM of Client PL</th>
                <th className="px-4 py-3 border border-[#2d3748]">SUM of Client Brokerage</th>
                <th className="px-4 py-3 border border-[#2d3748]">SUM of Client Net</th>
                <th className="px-4 py-3 border border-[#2d3748]">PL Share</th>
                <th className="px-4 py-3 border border-[#2d3748]">Brokerage Share</th>
                <th className="px-4 py-3 border border-[#2d3748]">Net Share</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {/* Total Row */}
              <tr className="bg-[#202940] font-bold">
                <td className="px-4 py-3 border border-[#2d3748]"></td>
                <td className="px-4 py-3 border border-[#2d3748] text-white">{total.broker}</td>
                <td className="px-4 py-3 border border-[#2d3748]">{total.clientPL}</td>
                <td className="px-4 py-3 border border-[#2d3748]">{total.clientBrokerage}</td>
                <td className="px-4 py-3 border border-[#2d3748]">{total.clientNet}</td>
                <td className="px-4 py-3 border border-[#2d3748]">{total.plShare}</td>
                <td className="px-4 py-3 border border-[#2d3748]">{total.brokerageShare}</td>
                <td className="px-4 py-3 border border-[#2d3748]">{total.netShare}</td>
              </tr>
              {/* Data Rows */}
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : accountsData.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500">No data. Select date range and click Calculate.</td></tr>
              ) : null}
              {accountsData.map((row, idx) => (
                <tr key={idx} className="bg-[#1a2035] hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 border border-[#2d3748]">{row.receivablePayable}</td>
                  <td className="px-4 py-3 border border-[#2d3748]">{row.broker}</td>
                  <td className={`px-4 py-3 border border-[#2d3748] ${parseFloat(row.clientPL) < 0 ? 'text-red-400' : parseFloat(row.clientPL) > 0 ? 'text-green-400' : ''}`}>
                    {row.clientPL}
                  </td>
                  <td className="px-4 py-3 border border-[#2d3748]">{row.clientBrokerage}</td>
                  <td className={`px-4 py-3 border border-[#2d3748] ${parseFloat(row.clientNet) < 0 ? 'text-red-400' : parseFloat(row.clientNet) > 0 ? 'text-green-400' : ''}`}>
                    {row.clientNet}
                  </td>
                  <td className="px-4 py-3 border border-[#2d3748]">{row.plShare}</td>
                  <td className="px-4 py-3 border border-[#2d3748]">{row.brokerageShare}</td>
                  <td className="px-4 py-3 border border-[#2d3748]">{row.netShare}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
