import React, { useState, useEffect } from 'react';
import SegmentDashboard from '../../components/dashboard/SegmentDashboard';
import * as api from '../../services/api';

const LiveM2MPage = ({ onNavigate, user }) => {
  const isClient = user?.role === 'TRADER';
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isClient) fetchM2M();
  }, []);

  const fetchM2M = async () => {
    setLoading(true);
    try {
      const data = await api.getLiveM2M();
      setClients(data.clients || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Failed to fetch live M2M:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isClient) {
    return (
      <div className="p-8 pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Live Market Dashboard</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Hello, {user?.username} – Segment: {user?.segment}</p>
          </div>
        </div>
        <SegmentDashboard segment={user?.segment} userName={user?.username} />
      </div>
    );
  }

  const StatCard = ({ title, data }) => (
    <div className="bg-[#1f283e] rounded-md shadow-2xl relative mt-10 mb-6">
      {/* Offset Header */}
      <div
        className="absolute -top-6 left-4 right-4 rounded-md shadow-[0_4px_20px_0_rgba(0,0,0,0.14),0_7px_10px_-5px_rgba(76,175,80,0.4)] px-6 py-4 z-10"
        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
      >
        <h3 className="text-white text-base font-bold uppercase tracking-tight">{title}</h3>
      </div>

      {/* Card Body */}
      <div className="pt-12 px-6 pb-6">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex flex-col items-end py-4">
              <span className="text-slate-400 text-sm font-normal mb-2">{item.label}</span>
              <h3 className="text-white text-3xl font-bold tracking-tight">
                {item.value.split(' ')[0]}{' '}
                {item.value.includes('Lakhs') && (
                  <span className="text-sm font-normal">Lakhs</span>
                )}
              </h3>
            </div>
            {index < data.length - 1 && (
              <hr className="border-white/10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#1a2035] p-4 space-y-12 overflow-y-auto custom-scrollbar">

      {/* 1. Live M2M Table Section */}
      <div className="relative mt-4">
        <div className="bg-[#1f283e] rounded-md shadow-2xl relative pt-12">
          {/* Table Offset Header */}
          <div
            className="absolute -top-6 left-4 rounded-md shadow-[0_4px_20px_0_rgba(0,0,0,0.14),0_7px_10px_-5px_rgba(76,175,80,0.4)] px-10 py-5 z-10 w-[calc(100%-32px)]"
            style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
          >
            <h2 className="text-white text-base font-bold uppercase tracking-tight">
              Live M2M under: RK002
            </h2>
          </div>

          <div className="px-6 py-4 overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="border-b border-white/5">
                <tr className="text-white text-[12px] font-bold uppercase tracking-widest">
                  <th className="px-4 py-4">User ID</th>
                  <th className="px-4 py-4">Active Profit/Loss</th>
                  <th className="px-4 py-4">Active Trades</th>
                  <th className="px-4 py-4">Margin Used</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-300">
                {loading ? (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : clients.length === 0 ? (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500">No active traders</td></tr>
                ) : clients.map((client, index) => (
                  <tr key={client.id || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onNavigate('live-m2m-detail', client)}
                        className="inline-block px-4 py-1 rounded-full text-[11px] font-bold text-white shadow-[0_4px_10px_rgba(76,175,80,0.4)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.6)] transition-all cursor-pointer border border-white/10"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                      >
                        {client.id} : {client.username}
                      </button>
                    </td>
                    <td className={`px-4 py-4 font-bold ${parseFloat(client.activePL) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(client.activePL || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">{client.activeTrades || 0}</td>
                    <td className="px-4 py-4">{parseFloat(client.margin || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {!loading && clients.length > 0 && (
                  <tr className="bg-black/10 font-bold text-white uppercase text-[11px] tracking-widest">
                    <td className="px-4 py-4">Total</td>
                    <td className={`px-4 py-4 ${clients.reduce((s, c) => s + parseFloat(c.activePL || 0), 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {clients.reduce((s, c) => s + parseFloat(c.activePL || 0), 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">{clients.reduce((s, c) => s + parseInt(c.activeTrades || 0), 0)}</td>
                    <td className="px-4 py-4">{clients.reduce((s, c) => s + parseFloat(c.margin || 0), 0).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Turnover Rows - Full Width Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <StatCard
          title="Buy Turnover"
          data={[
            { label: "Mcx", value: "12.45 Lakhs" },
            { label: "NSE Futures", value: "8.20 Lakhs" },
            { label: "Options", value: "45.12 Lakhs" },
            { label: "COMEX", value: "3.20 Lakhs" },
            { label: "FOREX", value: "1.15 Lakhs" },
            { label: "CRYPTO", value: "0.85 Lakhs" },
          ]}
        />
        <StatCard
          title="Sell Turnover"
          data={[
            { label: "Mcx", value: "10.15 Lakhs" },
            { label: "NSE Future", value: "7.45 Lakhs" },
            { label: "Options", value: "32.88 Lakhs" },
            { label: "COMEX", value: "2.10 Lakhs" },
            { label: "FOREX", value: "0.95 Lakhs" },
            { label: "CRYPTO", value: "0.45 Lakhs" },
          ]}
        />
        <StatCard
          title="Total Turnover"
          data={[
            { label: "Mcx", value: "22.60 Lakhs" },
            { label: "NSE Future", value: "15.65 Lakhs" },
            { label: "Options", value: "78.00 Lakhs" },
            { label: "COMEX", value: "5.30 Lakhs" },
            { label: "FOREX", value: "2.10 Lakhs" },
            { label: "CRYPTO", value: "1.30 Lakhs" },
          ]}
        />
      </div>

      {/* 3. Status Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
        <StatCard
          title="Active Users"
          data={[
            { label: "Mcx", value: "9" },
            { label: "NSE Future", value: "9" },
            { label: "Options", value: "12" },
            { label: "COMEX", value: "4" },
            { label: "FOREX", value: "2" },
            { label: "CRYPTO", value: "1" },
          ]}
        />
        <StatCard
          title="Profit / Loss"
          data={[
            { label: "Mcx", value: "48,250" },
            { label: "NSE Future", value: "-12,400" },
            { label: "Options", value: "1,85,600" },
            { label: "COMEX", value: "12,100" },
            { label: "FOREX", value: "4,500" },
            { label: "CRYPTO", value: "-1,200" },
          ]}
        />
        <StatCard
          title="Brokerage"
          data={[
            { label: "Mcx", value: "4,500" },
            { label: "NSE Future", value: "2,100" },
            { label: "Options", value: "18,400" },
            { label: "COMEX", value: "1,200" },
            { label: "FOREX", value: "450" },
            { label: "CRYPTO", value: "150" },
          ]}
        />
      </div>

      {/* 4. Active Positions Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        <StatCard
          title="Active Buy"
          data={[
            { label: "Mcx", value: "0" },
            { label: "NSE Future", value: "0" },
            { label: "NSE Spot", value: "0" },
            { label: "Options", value: "0" },
            { label: "COMEX", value: "0" },
          ]}
        />
        <StatCard
          title="Active Sell"
          data={[
            { label: "Mcx", value: "0" },
            { label: "NSE Future", value: "0" },
            { label: "NSE Spot", value: "0" },
            { label: "Options", value: "0" },
            { label: "COMEX", value: "0" },
          ]}
        />
      </div>

    </div>
  );
};

export default LiveM2MPage;
