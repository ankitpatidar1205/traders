import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getLiveM2M } from '../../services/api';

const LiveM2MDetailPage = ({ selectedClient, onBack, onClientClick }) => {
    const [subClients, setSubClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getLiveM2M();
                // Group by user to build sub-client rows
                const grouped = (data || []).reduce((acc, t) => {
                    const key = `${t.user_id} : ${t.username}`;
                    if (!acc[key]) acc[key] = { id: key, ledger: 0, m2m: 0, activePL: 0, trades: 0, margin: 0, holding: 0 };
                    acc[key].trades += 1;
                    acc[key].activePL += parseFloat(t.live_pnl || 0);
                    acc[key].margin += parseFloat(t.margin_used || 0);
                    return acc;
                }, {});
                setSubClients(Object.values(grouped).map(c => ({
                    ...c,
                    ledger: c.ledger.toFixed(2),
                    m2m: c.m2m.toFixed(2),
                    activePL: c.activePL.toFixed(2),
                    margin: c.margin.toFixed(2),
                    holding: '0',
                })));
            } catch (err) {
                console.error('Failed to fetch M2M detail:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedClient]);
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

    const totals = subClients.reduce((acc, c) => ({
        ledger: acc.ledger + parseFloat(c.ledger),
        m2m: acc.m2m + parseFloat(c.m2m),
        activePL: acc.activePL + parseFloat(c.activePL),
        trades: acc.trades + parseInt(c.trades),
        margin: acc.margin + parseFloat(c.margin),
        holding: acc.holding + parseFloat(c.holding)
    }), { ledger: 0, m2m: 0, activePL: 0, trades: 0, margin: 0, holding: 0 });

    // Segment Summary Calculation
    const segmentSummary = subClients.reduce((acc, c) => {
        const seg = c.segment || 'Other';
        if (!acc[seg]) acc[seg] = { pl: 0, users: 0, margin: 0 };
        acc[seg].pl += parseFloat(c.activePL);
        acc[seg].users += 1;
        acc[seg].margin += parseFloat(c.margin);
        return acc;
    }, {});

    const getSegVal = (seg, type) => {
        const val = segmentSummary[seg]?.[type] || 0;
        if (type === 'pl' || type === 'margin') return val.toLocaleString(undefined, { minimumFractionDigits: 0 });
        return val.toString();
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] p-6 space-y-12 overflow-y-auto custom-scrollbar">

            {/* Broker Summary Header Cards - Derived from List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1f283e] p-6 rounded-lg border border-white/5 shadow-xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 text-right">Total Ledger</p>
                    <h3 className="text-white text-2xl font-black text-right">{totals.ledger.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="bg-[#1f283e] p-6 rounded-lg border border-white/5 shadow-xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 text-right">Total P/L</p>
                    <h3 className={`text-2xl font-black text-right ${totals.activePL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totals.activePL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className="bg-[#1f283e] p-6 rounded-lg border border-white/5 shadow-xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 text-right">Active Trades</p>
                    <h3 className="text-white text-2xl font-black text-right">{totals.trades}</h3>
                </div>
                <div className="bg-[#1f283e] p-6 rounded-lg border border-white/5 shadow-xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 text-right">Total Margin</p>
                    <h3 className="text-white text-2xl font-black text-right">{totals.margin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
            </div>

            <div className="relative">
                <div className="bg-[#1f283e] rounded-md shadow-2xl relative pt-12">
                    {/* Header Ribbon */}
                    <div
                        className="absolute -top-6 left-4 rounded-md shadow-[0_4px_20px_0_rgba(0,0,0,0.14),0_7px_10px_-5px_rgba(76,175,80,0.4)] px-10 py-5 z-10 w-[calc(100%-32px)] flex items-center justify-between"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        <h2 className="text-white text-lg font-bold tracking-tight">
                            Live M2M under: {(selectedClient?.username || selectedClient?.id?.split(' : ')[1] || 'RK002').toUpperCase()}
                        </h2>
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-md transition-all text-xs border border-white/20 uppercase font-black"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                    </div>

                    <div className="px-6 py-4 overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="border-b border-white/5">
                                <tr className="text-[#a0aec0] text-[13px] font-bold uppercase tracking-widest leading-none">
                                    <th className="px-4 py-6 font-normal">User ID</th>
                                    <th className="px-4 py-6 font-normal">Ledger Balance</th>
                                    <th className="px-4 py-6 font-normal">M2M</th>
                                    <th className="px-4 py-6 font-normal">Active Profit/Loss</th>
                                    <th className="px-4 py-6 font-normal">Active Trades</th>
                                    <th className="px-4 py-6 font-normal">Margin Used</th>
                                    <th className="px-4 py-6 font-normal">Holding Margin</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px]">
                                {loading ? (
                                    <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">Loading...</td></tr>
                                ) : subClients.length === 0 ? (
                                    <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">No active trades found.</td></tr>
                                ) : null}
                                {subClients.map((client, index) => (
                                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td
                                            className="px-4 py-4 text-[#4caf50] font-bold hover:underline cursor-pointer"
                                            onClick={() => onClientClick && onClientClick({ id: client.id })}
                                        >
                                            {client.id}
                                        </td>
                                        <td className="px-4 py-4 text-white font-medium">{client.ledger}</td>
                                        <td className="px-4 py-4 text-white font-medium">{client.m2m}</td>
                                        <td className={`px-4 py-4 font-bold ${parseFloat(client.activePL) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {client.activePL}
                                        </td>
                                        <td className="px-4 py-4 text-white">{client.trades}</td>
                                        <td className="px-4 py-4 text-white font-medium">{client.margin}</td>
                                        <td className="px-4 py-4 text-white font-medium">{client.holding}</td>
                                    </tr>
                                ))}
                                {/* Total Row */}
                                <tr className="bg-black/20 font-bold text-white uppercase text-[12px] tracking-widest border-t-2 border-white/10">
                                    <td className="px-4 py-6">TOTAL</td>
                                    <td className="px-4 py-6">{totals.ledger.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-6">{totals.m2m.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className={`px-4 py-6 ${totals.activePL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {totals.activePL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-6">{totals.trades}</td>
                                    <td className="px-4 py-6">{totals.margin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-6">{totals.holding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* TURNOVER ROWS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            {/* STATUS ROWS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard
                    title="Active Users"
                    data={[
                        { label: "Mcx", value: getSegVal('MCX', 'users') },
                        { label: "NSE Future", value: getSegVal('NSE Future', 'users') },
                        { label: "Options", value: getSegVal('Options', 'users') },
                        { label: "COMEX", value: getSegVal('Comex', 'users') },
                        { label: "FOREX", value: getSegVal('Forex', 'users') },
                        { label: "CRYPTO", value: getSegVal('Crypto', 'users') },
                    ]}
                />
                <StatCard
                    title="Profit / Loss"
                    data={[
                        { label: "Mcx", value: getSegVal('MCX', 'pl') },
                        { label: "NSE Future", value: getSegVal('NSE Future', 'pl') },
                        { label: "Options", value: getSegVal('Options', 'pl') },
                        { label: "COMEX", value: getSegVal('Comex', 'pl') },
                        { label: "FOREX", value: getSegVal('Forex', 'pl') },
                        { label: "CRYPTO", value: getSegVal('Crypto', 'pl') },
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

            {/* POSITION & MARGIN ROWS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                <StatCard
                    title="Margin (Used)"
                    data={[
                        { label: "Mcx", value: getSegVal('MCX', 'margin') },
                        { label: "NSE Future", value: getSegVal('NSE Future', 'margin') },
                        { label: "Options", value: getSegVal('Options', 'margin') },
                        { label: "COMEX", value: getSegVal('Comex', 'margin') },
                        { label: "FOREX", value: getSegVal('Forex', 'margin') },
                        { label: "CRYPTO", value: getSegVal('Crypto', 'margin') },
                    ]}
                />
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

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0px;
                }
            `}</style>
        </div>
    );
};

export default LiveM2MDetailPage;
