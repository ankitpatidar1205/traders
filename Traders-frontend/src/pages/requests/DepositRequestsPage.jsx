import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, Search, RotateCcw } from 'lucide-react';
import { getRequests, updateRequestStatus } from '../../services/api';

const DepositRequestsPage = () => {
    const [depositRequests, setDepositRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState({ show: false, text: '', type: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getRequests({ type: 'DEPOSIT' });
            setDepositRequests(res);
        } catch (err) {
            showToast('Failed to fetch deposit requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showToast = (text, type = 'success') => {
        setToast({ show: true, text, type });
        setTimeout(() => setToast({ show: false, text: '', type: '' }), 3000);
    };

    const handleAction = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
        
        setActionLoading(id);
        try {
            await updateRequestStatus(id, status, `${status} by Admin`);
            showToast(`Request ${status.toLowerCase()} successfully`);
            fetchData();
        } catch (err) {
            showToast(err.message || 'Action failed', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-8 text-[#a0aec0] overflow-y-auto relative p-4">
             {/* Toast */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded shadow-2xl transition-all border ${
                    toast.type === 'success' ? 'bg-[#1b2a21] border-green-500/30 text-green-400' : 'bg-[#2a1b1b] border-red-500/30 text-red-400'
                }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <p className="text-[14px] font-medium tracking-wide">{toast.text}</p>
                </div>
            )}

            <div className="mb-4 md:mb-6 flex flex-wrap justify-between items-center gap-2">
                <span className="text-sm font-medium">
                    Showing <span className="text-white font-bold">{depositRequests.length}</span> items.
                </span>
                <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 bg-[#202940] rounded-lg border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="sticky top-0 bg-[#202940] z-20 border-b border-white/5">
                            <tr className="text-white text-[14px] font-bold tracking-tight">
                                <th className="px-8 py-6 w-32">ID <span className="text-[10px] ml-1 opacity-50">↑↑</span></th>
                                <th className="px-8 py-6 text-center">User Details</th>
                                <th className="px-8 py-6 text-center">Amount Info</th>
                                <th className="px-8 py-6 text-center">File</th>
                                <th className="px-8 py-6 text-center">Time</th>
                                <th className="px-8 py-6 text-center">Status / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] bg-[#1a2035]">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#4CAF50]" />
                                            <span className="uppercase tracking-widest text-xs opacity-50">Loading Deposits...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : depositRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-500 uppercase tracking-widest text-xs font-bold">
                                        No deposit requests found
                                    </td>
                                </tr>
                            ) : depositRequests.map((req) => (
                                <tr key={req.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-all duration-200">
                                    <td className="px-8 py-10 align-middle text-white font-bold">{req.id}</td>
                                    <td className="px-8 py-10 align-middle">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="text-blue-400 font-bold">{req.full_name || 'User'}</span>
                                            <span className="text-white opacity-70">@{req.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10 align-middle">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="text-[#4CAF50] font-bold text-base">₹{parseFloat(req.amount).toLocaleString()}</span>
                                            <span className="text-xs text-slate-500">Bal: ₹{parseFloat(req.current_balance || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10 align-middle flex justify-center">
                                        <div className="relative group/img">
                                            <div className="w-[80px] h-[110px] bg-black/40 rounded flex flex-col items-center justify-center overflow-hidden border border-white/5 relative shadow-xl">
                                                {req.screenshot_url ? (
                                                     <img
                                                        src={req.screenshot_url}
                                                        alt="Proof"
                                                        className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="text-[9px] text-white/30 text-center px-1 font-bold">NO PROOF UPLOADED</div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    <Search className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10 align-middle text-center text-white font-medium opacity-90">
                                        {new Date(req.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-10 align-middle">
                                        <div className="flex flex-col items-center gap-3">
                                            {req.status === 'PENDING' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(req.id, 'APPROVED')}
                                                        disabled={actionLoading === req.id}
                                                        className="bg-[#4caf50] hover:bg-[#43a047] text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, 'REJECTED')}
                                                        disabled={actionLoading === req.id}
                                                        className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                    req.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepositRequestsPage;
