import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getTrades } from '../../services/api';

const ClientActivePositionsPage = ({ client, onBack, onNavigateToAccount }) => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);

    const clientId = client?.id ? String(client.id).split(' : ')[0].trim() : null;
    const clientName = client?.id ? String(client.id).split(' : ')[1] || String(client.id) : (client?.username || 'Client');

    useEffect(() => {
        if (!clientId) { setLoading(false); return; }
        const fetchPositions = async () => {
            try {
                const data = await getTrades({ user_id: clientId, status: 'OPEN' });
                // Group by symbol to create position rows
                const grouped = data.reduce((acc, t) => {
                    if (!acc[t.symbol]) acc[t.symbol] = { scrip: t.symbol, buyQty: 0, sellQty: 0, buyTotal: 0, sellTotal: 0 };
                    if (t.type === 'BUY') { acc[t.symbol].buyQty += t.qty; acc[t.symbol].buyTotal += t.entry_price * t.qty; }
                    else { acc[t.symbol].sellQty += t.qty; acc[t.symbol].sellTotal += t.entry_price * t.qty; }
                    return acc;
                }, {});
                setPositions(Object.values(grouped).map(p => ({
                    scrip: p.scrip,
                    buy: p.buyQty,
                    sell: p.sellQty,
                    avgBuy: p.buyQty > 0 ? (p.buyTotal / p.buyQty).toFixed(2) : '0',
                    avgSell: p.sellQty > 0 ? (p.sellTotal / p.sellQty).toFixed(2) : '0',
                    total: p.buyQty + p.sellQty,
                    net: p.buyQty - p.sellQty,
                    m2m: '0',
                    margin: '0',
                    cmp: '-',
                })));
            } catch (err) {
                console.error('Failed to fetch client positions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPositions();
    }, [clientId]);

    const totals = positions.reduce((acc, p) => ({
        buy: acc.buy + p.buy, sell: acc.sell + p.sell,
        total: acc.total + p.total, net: acc.net + p.net,
    }), { buy: 0, sell: 0, total: 0, net: 0 });

    return (
        <div className="flex flex-col h-full bg-[#1a2035] p-6 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl text-slate-300 font-normal">{clientName}'s Active Positions</h1>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-md transition-all text-xs border border-white/10 uppercase font-bold"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Clients
                </button>
            </div>

            {/* Positions Table */}
            <div className="bg-[#1f283e]/50 rounded-lg overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="text-slate-400 text-[13px] font-bold uppercase tracking-wider bg-white/[0.02]">
                                <th className="px-6 py-5 font-medium">Scrip</th>
                                <th className="px-6 py-5 font-medium">Active Buy</th>
                                <th className="px-6 py-5 font-medium">Active Sell</th>
                                <th className="px-6 py-5 font-medium">Avg buy rate</th>
                                <th className="px-6 py-5 font-medium">Avg sell rate</th>
                                <th className="px-6 py-5 font-medium">Total</th>
                                <th className="px-6 py-5 font-medium">Net</th>
                                <th className="px-6 py-5 font-medium text-right">M2m</th>
                                <th className="px-6 py-5 font-medium text-right">Margin Used</th>
                                <th className="px-6 py-5 font-medium">CMP</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-slate-300">
                            {loading ? (
                                <tr><td colSpan="10" className="px-6 py-10 text-center text-slate-500">Loading positions...</td></tr>
                            ) : positions.length === 0 ? (
                                <tr><td colSpan="10" className="px-6 py-10 text-center text-slate-500">No active positions.</td></tr>
                            ) : positions.map((pos, index) => (
                                <tr key={index} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-5 text-slate-200">{pos.scrip}</td>
                                    <td className="px-6 py-5">{pos.buy}</td>
                                    <td className="px-6 py-5">{pos.sell}</td>
                                    <td className="px-6 py-5">{pos.avgBuy}</td>
                                    <td className="px-6 py-5">{pos.avgSell}</td>
                                    <td className="px-6 py-5">{pos.total}</td>
                                    <td className="px-6 py-5">{pos.net}</td>
                                    <td className="px-6 py-5 text-right text-red-400">{pos.m2m}</td>
                                    <td className="px-6 py-5 text-right">{pos.margin}</td>
                                    <td className="px-6 py-5">{pos.cmp}</td>
                                </tr>
                            ))}
                            {positions.length > 0 && (
                                <tr className="bg-white/[0.03] font-black text-slate-100">
                                    <td className="px-6 py-6 uppercase">Total</td>
                                    <td className="px-6 py-6 text-white text-base">{totals.buy}</td>
                                    <td className="px-6 py-6 text-white text-base">{totals.sell}</td>
                                    <td className="px-6 py-6"></td>
                                    <td className="px-6 py-6"></td>
                                    <td className="px-6 py-6 text-white text-base">{totals.total}</td>
                                    <td className="px-6 py-6 text-white text-base">{totals.net}</td>
                                    <td className="px-6 py-6 text-right text-red-500 text-base">0</td>
                                    <td className="px-6 py-6 text-right text-white text-base">0</td>
                                    <td className="px-6 py-6"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
                <button
                    onClick={() => onNavigateToAccount && onNavigateToAccount(client)}
                    className="bg-[#4caf50] hover:bg-[#45a049] text-white px-8 py-3 rounded-md text-[13px] font-black uppercase tracking-widest shadow-lg shadow-green-900/20 transition-all border border-white/10"
                >
                    GO TO {clientName.toUpperCase()}'S ACCOUNT
                </button>
            </div>
        </div>
    );
};

export default ClientActivePositionsPage;
