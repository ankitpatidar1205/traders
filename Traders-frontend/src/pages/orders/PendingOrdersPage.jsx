import React, { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle, AlertCircle, Loader2, Trash2, X } from 'lucide-react';
import * as api from '../../services/api';

const PendingOrdersPage = () => {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [scrips, setScrips] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', text: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, orderId: null });

    const [formData, setFormData] = useState({
        script: '',
        userId: '',
        lots: '',
        price: '',
        orderType: '',
        transactionPassword: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [scripData, userData, orders] = await Promise.all([
                api.getScrips(),
                api.getClients({ role: 'TRADER' }),
                api.getTrades({ status: 'OPEN', is_pending: 1 })
            ]);
            const finalScrips = scripData.length > 0 ? scripData : [
                { id: 'd1', symbol: 'CRUDEOIL' },
                { id: 'd2', symbol: 'GOLD' },
                { id: 'd3', symbol: 'SILVER' },
                { id: 'd4', symbol: 'NIFTY' },
                { id: 'd5', symbol: 'BANKNIFTY' }
            ];
            setScrips(finalScrips);
            setUsers(userData);
            setPendingOrders(orders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (text, type = 'success') => {
        setToast({ show: true, text, type });
        setTimeout(() => setToast({ show: false, text: '', type: '' }), 3000);
    };

    const handleCreateClick = () => setView('create');

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Simple Validation
        if (!formData.script || !formData.lots || !formData.price || !formData.orderType || !formData.transactionPassword) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                symbol: formData.script,
                userId: formData.userId || null, // Optional for admins
                qty: parseInt(formData.lots),
                price: parseFloat(formData.price),
                type: formData.orderType, // BUY or SELL
                order_type: 'LIMIT',
                is_pending: true,
                transactionPassword: formData.transactionPassword
            };

            await api.placeOrder(payload);
            
            showToast('Limit order created successfully!', 'success');
            setView('list');
            setFormData({
                script: '',
                userId: '',
                lots: '',
                price: '',
                orderType: '',
                transactionPassword: ''
            });
            fetchData(); // Refresh list
        } catch (err) {
            showToast(err.message || 'Failed to place order', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelOrder = (orderId) => {
        setDeleteModal({ show: true, orderId });
    };

    const confirmDelete = async () => {
        const orderId = deleteModal.orderId;
        setSubmitting(true);
        try {
            await api.deleteTrade(orderId);
            showToast('Order cancelled successfully', 'success');
            setDeleteModal({ show: false, orderId: null });
            fetchData();
        } catch (err) {
            showToast(err.message || 'Failed to cancel order', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (view === 'create') {
        return (
            <div className="flex flex-col h-full bg-[#1a2035] p-6 text-[#a0aec0] overflow-y-auto custom-scrollbar">
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #1a2035; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #4CAF50; border-radius: 4px; }
                `}</style>

                {/* Toast Notification */}
                {toast.show && (
                    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded shadow-2xl transition-all border ${
                        toast.type === 'success' ? 'bg-[#1b2a21] border-green-500/30 text-green-400' : 'bg-[#2a1b1b] border-red-500/30 text-red-400'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-[14px] font-medium tracking-wide">{toast.text}</p>
                    </div>
                )}

                <div className="max-w-6xl w-full mx-auto mt-4">
                    <div className="bg-[#202940] rounded shadow-2xl relative border border-white/5 mt-8">
                        {/* Floating Header Ribbon */}
                        <div
                            className="absolute -top-6 left-5 px-6 py-4 rounded shadow-xl z-10"
                            style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
                        >
                            <h2 className="text-white text-[16px] font-normal uppercase leading-none tracking-tight">Create Limit Order</h2>
                        </div>

                        <form onSubmit={handleSave} className="px-6 py-12 pt-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 px-2 lg:px-4">
                                {/* Script */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Script</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white border border-slate-200 py-2.5 px-4 text-black font-extrabold outline-none rounded shadow-sm appearance-none focus:ring-2 focus:ring-[#4caf50]/20 transition-all text-sm uppercase tracking-wider cursor-pointer"
                                            value={formData.script}
                                            onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled className="bg-white text-black font-bold">Select Scrip</option>
                                            {scrips.map(s => (
                                                <option key={s.id} value={s.symbol} className="bg-white text-black font-bold">{s.symbol}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* User ID */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">User ID</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white border border-slate-200 py-2.5 px-4 text-black font-extrabold outline-none rounded shadow-sm appearance-none focus:ring-2 focus:ring-[#4caf50]/20 transition-all text-sm uppercase tracking-wider cursor-pointer"
                                            value={formData.userId}
                                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                        >
                                            <option value="" className="bg-white text-black font-bold">Select User (Self)</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id} className="bg-white text-black font-bold">{u.username} - {u.full_name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Lots / Units */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Lots / Units</label>
                                    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <input
                                            type="number"
                                            className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px]"
                                            value={formData.lots}
                                            onChange={(e) => setFormData({ ...formData, lots: e.target.value })}
                                            placeholder="Enter lots"
                                            autoComplete="off"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Price</label>
                                    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px]"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="Enter price"
                                            autoComplete="off"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Order Type */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Order Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white border border-slate-200 py-2.5 px-4 text-black font-extrabold outline-none rounded shadow-sm appearance-none focus:ring-2 focus:ring-[#4caf50]/20 transition-all text-sm uppercase tracking-wider cursor-pointer"
                                            value={formData.orderType}
                                            onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled className="bg-white text-black font-bold">Select Order Type</option>
                                            <option value="BUY" className="bg-white text-black font-bold">BUY LIMIT</option>
                                            <option value="SELL" className="bg-white text-black font-bold">SELL LIMIT</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Transaction Password */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Transaction Password</label>
                                    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <input
                                            type="password"
                                            className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px]"
                                            value={formData.transactionPassword}
                                            onChange={(e) => setFormData({ ...formData, transactionPassword: e.target.value })}
                                            placeholder="******"
                                            autoComplete="off"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-12 px-2 lg:px-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="text-white font-bold py-2.5 px-10 rounded transition-all uppercase text-[13px] tracking-wider shadow-lg active:scale-95 flex items-center gap-2"
                                    style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="bg-[#344675] hover:bg-[#263148] text-white font-bold py-2.5 px-10 rounded transition-all uppercase text-[13px] tracking-wider shadow-lg active:scale-95"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#1a2035] p-4 space-y-8 text-[#a0aec0] overflow-y-auto">
            <div className="flex justify-between items-center">
                <button
                    onClick={handleCreateClick}
                    className="bg-[#4CAF50] hover:bg-green-600 text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-green-900/10"
                >
                    CREATE PENDING ORDERS
                </button>
            </div>

            <div className="bg-[#151c2c] p-6 rounded border border-[#2d3748] shadow-sm">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-[#4caf50]" />
                    </div>
                ) : pendingOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs uppercase text-slate-500 border-b border-white/5">
                                    <th className="pb-3 px-2">Symbol</th>
                                    <th className="pb-3 px-2">Type</th>
                                    <th className="pb-3 px-2">Qty</th>
                                    <th className="pb-3 px-2">Price</th>
                                    <th className="pb-3 px-2">User</th>
                                    <th className="pb-3 px-2">Time</th>
                                    <th className="pb-3 px-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] text-slate-300">
                                {pendingOrders.map(order => (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-2 font-medium">{order.symbol}</td>
                                        <td className={`py-3 px-2 ${order.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{order.type} LIMIT</td>
                                        <td className="py-3 px-2">{order.qty}</td>
                                        <td className="py-3 px-2">{order.entry_price}</td>
                                        <td className="py-3 px-2">{order.username}</td>
                                        <td className="py-3 px-2">{new Date(order.entry_time).toLocaleString()}</td>
                                        <td className="py-3 px-2">
                                            <button 
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-all active:scale-90"
                                                title="Cancel Order"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm font-medium">No Pending Orders</p>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1e253a] border border-white/10 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-white/5">
                            <h3 className="text-white font-bold text-lg">Confirm Cancellation</h3>
                            <button 
                                onClick={() => setDeleteModal({ show: false, orderId: null })}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 text-center">
                            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-slate-300 text-base mb-2">Are you sure you want to cancel this pending order?</p>
                            <p className="text-slate-500 text-sm">This action cannot be undone.</p>
                        </div>
                        
                        <div className="flex p-4 gap-3 bg-black/20">
                            <button 
                                onClick={() => setDeleteModal({ show: false, orderId: null })}
                                className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
                            >
                                NO, KEEP IT
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={submitting}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'YES, CANCEL'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingOrdersPage;
