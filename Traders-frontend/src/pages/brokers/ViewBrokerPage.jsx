import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import * as api from '../../services/api';

const ViewBrokerPage = ({ onBack }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        if (id) fetchBrokerClients();
    }, [id]);

    const fetchBrokerClients = async () => {
        setLoading(true);
        try {
            const data = await api.getBrokerClients(id);
            setClients(data || []);
        } catch (err) {
            console.error('Failed to fetch broker clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = !searchTerm ||
            (client.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.username || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || client.status === statusFilter;
        const clientDate = client.created_at ? new Date(client.created_at).toISOString().split('T')[0] : null;
        const matchesFrom = !fromDate || (clientDate && clientDate >= fromDate);
        const matchesTo = !toDate || (clientDate && clientDate <= toDate);
        return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });

    return (
        <div className="space-y-6 p-4 w-full overflow-hidden">
            {/* Back Button & Broker Info Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onBack ? onBack() : navigate('/brokers')}
                    className="flex items-center gap-2 text-white hover:text-green-400 transition-colors font-bold text-sm"
                >
                    <ArrowLeft className="w-5 h-5" /> BACK
                </button>
            </div>

            {/* Search & Filter */}
            <div className="bg-[#202940] rounded-lg border border-white/5 shadow-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">Username</label>
                        <input
                            type="text"
                            placeholder="Search username..."
                            className="w-full bg-[#151c2c] border border-white/10 rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#4CAF50] transition-all text-xs font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">Account Status</label>
                        <select
                            className="w-full bg-[#151c2c] border border-white/10 rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#4CAF50] transition-all text-xs font-bold"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">From Date</label>
                        <input
                            type="date"
                            className="w-full bg-[#151c2c] border border-white/10 rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#4CAF50] transition-all [color-scheme:dark] text-xs font-bold"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">To Date</label>
                        <input
                            type="date"
                            className="w-full bg-[#151c2c] border border-white/10 rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#4CAF50] transition-all [color-scheme:dark] text-xs font-bold"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {}}
                        className="text-white px-8 py-2.5 rounded font-bold text-xs tracking-widest transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95 uppercase"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >SEARCH</button>
                    <button
                        onClick={() => { setSearchTerm(''); setStatusFilter(''); setFromDate(''); setToDate(''); }}
                        className="bg-[#808080] hover:bg-[#707070] text-white px-8 py-2.5 rounded font-bold text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all uppercase"
                    >
                        <RotateCcw className="w-4 h-4" /> RESET
                    </button>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-[#1f283e] overflow-hidden rounded-lg border border-white/5 shadow-2xl min-w-0">
                <div className="px-6 py-4 bg-[#1a2035] border-b border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 text-sm font-medium">
                        Broker's Clients — Showing <b className="text-white">{filteredClients.length}</b> of <b className="text-white">{clients.length}</b> clients.
                    </span>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse" style={{ minWidth: '1200px' }}>
                        <thead className="bg-[#1a2035]/50">
                            <tr className="text-white/90 text-[13px] uppercase tracking-wider">
                                <th className="px-4 py-5 font-bold w-16">#</th>
                                <th className="px-4 py-5 font-bold">ID ↑</th>
                                <th className="px-4 py-5 font-bold">Full Name ↑</th>
                                <th className="px-4 py-5 font-bold">Username</th>
                                <th className="px-4 py-5 font-bold">Email</th>
                                <th className="px-4 py-5 font-bold">Mobile</th>
                                <th className="px-4 py-5 font-bold">Ledger Balance ↑</th>
                                <th className="px-4 py-5 font-bold">Gross P/L ↑</th>
                                <th className="px-4 py-5 font-bold">Brokerage ↑</th>
                                <th className="px-4 py-5 font-bold">Swap Charges ↑</th>
                                <th className="px-4 py-5 font-bold">Net P/L</th>
                                <th className="px-4 py-5 font-bold">Admin</th>
                                <th className="px-4 py-5 font-bold">Demo Account?</th>
                                <th className="px-4 py-5 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan="14" className="px-4 py-12 text-center text-slate-500 font-medium italic">
                                        Loading clients...
                                    </td>
                                </tr>
                            ) : filteredClients.length > 0 ? filteredClients.map((client, index) => (
                                <tr key={client.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-6">{index + 1}</td>
                                    <td className="px-4 py-6">{client.id}</td>
                                    <td className="px-4 py-6 font-medium text-white">{client.full_name || '-'}</td>
                                    <td className="px-4 py-6 font-mono">{client.username}</td>
                                    <td className="px-4 py-6">{client.email || '-'}</td>
                                    <td className="px-4 py-6">{client.mobile || '-'}</td>
                                    <td className="px-4 py-6 font-mono text-white/80">{parseFloat(client.ledger_balance || 0).toFixed(2)}</td>
                                    <td className="px-4 py-6">{client.gross_pl || '0.00'}</td>
                                    <td className="px-4 py-6">{client.brokerage || '0.00'}</td>
                                    <td className="px-4 py-6">{client.swap_charges || '0.00'}</td>
                                    <td className="px-4 py-6 font-bold text-white">{client.net_pl || '0.00'}</td>
                                    <td className="px-4 py-6">{client.parent_username || 'superadmin'}</td>
                                    <td className="px-4 py-6">{client.is_demo ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            client.status === 'Active'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {client.status || 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="14" className="px-4 py-12 text-center text-slate-500 font-medium italic">
                                        No clients found for this broker.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-6 border-t border-white/5 flex items-center justify-between bg-[#1a2035]">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#5cb85c] text-white text-sm font-bold rounded shadow-lg">1</div>
                </div>
            </div>
        </div>
    );
};

export default ViewBrokerPage;
