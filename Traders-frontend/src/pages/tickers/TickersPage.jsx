import React, { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle, AlertCircle, Loader2, Trash2, X } from 'lucide-react';
import * as api from '../../services/api';

const TickersPage = () => {
    const [view, setView] = useState('list'); // 'list' or 'add'
    const [tickers, setTickers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', text: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, tickerId: null });

    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        startHour: '00',
        startMin: '00',
        endDate: new Date().toISOString().split('T')[0],
        endHour: '23',
        endMin: '59',
        message: '',
        transactionPassword: ''
    });

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    useEffect(() => {
        fetchTickers();
    }, []);

    const fetchTickers = async () => {
        setLoading(true);
        try {
            const data = await api.getTickers();
            setTickers(data);
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

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.message) {
            showToast('Message is required', 'error');
            return;
        }

        if (!formData.transactionPassword) {
            showToast('Transaction password is required', 'error');
            return;
        }

        const startTime = `${formData.startDate} ${formData.startHour}:${formData.startMin}:00`;
        const endTime = `${formData.endDate} ${formData.endHour}:${formData.endMin}:00`;

        setSubmitting(true);
        try {
            await api.verifyTransactionPassword(formData.transactionPassword);
            await api.createTicker({
                text: formData.message,
                start_time: startTime,
                end_time: endTime
            });
            showToast('Ticker added successfully!', 'success');
            setView('list');
            setFormData({
                startDate: new Date().toISOString().split('T')[0],
                startHour: '00',
                startMin: '00',
                endDate: new Date().toISOString().split('T')[0],
                endHour: '23',
                endMin: '59',
                message: '',
                transactionPassword: ''
            });
            fetchTickers();
        } catch (err) {
            showToast(err.message || 'Failed to add ticker', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ show: true, tickerId: id });
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await api.deleteTicker(deleteModal.tickerId);
            showToast('Ticker deleted successfully', 'success');
            setDeleteModal({ show: false, tickerId: null });
            fetchTickers();
        } catch (err) {
            showToast(err.message || 'Failed to delete ticker', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (view === 'add') {
        return (
            <div className="flex flex-col h-full bg-[#1a2035] text-[#a0aec0] overflow-y-auto custom-scrollbar p-6">
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #1a2035; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #4CAF50; border-radius: 4px; }
                `}</style>

                {/* Toast Notification */}
                {toast.show && (
                    <div className={`fixed top-6 right-6 z-[110] flex items-center gap-3 px-6 py-4 rounded shadow-2xl transition-all border ${
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
                            <h2 className="text-white text-[16px] font-normal uppercase leading-none tracking-tight">Add Ticker</h2>
                        </div>

                        <form onSubmit={handleSave} className="px-6 py-12 pt-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 px-2 lg:px-4">
                                {/* Start Date & Time */}
                                <div className="space-y-2">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Start Date</label>
                                    <div className="flex gap-1 items-end">
                                        <div className="flex-1 border-b border-white/10 focus-within:border-[#4caf50] transition-colors">
                                            <input
                                                type="date"
                                                className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px] scheme-dark"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative border-b border-white/10 focus-within:border-[#4caf50] transition-colors w-24">
                                            <select
                                                className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                                value={formData.startHour}
                                                onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                                            >
                                                {hours.map(h => <option key={h} value={h} className="bg-[#202940]">{h}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>
                                        <div className="relative border-b border-white/10 focus-within:border-[#4caf50] transition-colors w-24">
                                            <select
                                                className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                                value={formData.startMin}
                                                onChange={(e) => setFormData({ ...formData, startMin: e.target.value })}
                                            >
                                                {minutes.map(m => <option key={m} value={m} className="bg-[#202940]">{m}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* End Date & Time */}
                                <div className="space-y-2">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">End Date</label>
                                    <div className="flex gap-1 items-end">
                                        <div className="flex-1 border-b border-white/10 focus-within:border-[#4caf50] transition-colors">
                                            <input
                                                type="date"
                                                className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px] scheme-dark"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative border-b border-white/10 focus-within:border-[#4caf50] transition-colors w-24">
                                            <select
                                                className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                                value={formData.endHour}
                                                onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                                            >
                                                {hours.map(h => <option key={h} value={h} className="bg-[#202940]">{h}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>
                                        <div className="relative border-b border-white/10 focus-within:border-[#4caf50] transition-colors w-24">
                                            <select
                                                className="w-full bg-transparent text-white py-2 focus:outline-none appearance-none font-normal text-[15px]"
                                                value={formData.endMin}
                                                onChange={(e) => setFormData({ ...formData, endMin: e.target.value })}
                                            >
                                                {minutes.map(m => <option key={m} value={m} className="bg-[#202940]">{m}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-2 group">
                                    <label className="block text-[#bcc0cf] text-[12px] font-bold uppercase tracking-tight">Message</label>
                                    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors">
                                        <textarea
                                            className="w-full bg-transparent text-white py-2 focus:outline-none font-normal text-[15px] min-h-[40px] appearance-none"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Enter message"
                                            autoComplete="off"
                                        />
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
        <div className="flex flex-col h-full text-[#a0aec0] p-4 space-y-6">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[110] flex items-center gap-3 px-6 py-4 rounded shadow-2xl transition-all border ${
                    toast.type === 'success' ? 'bg-[#1b2a21] border-green-500/30 text-green-400' : 'bg-[#2a1b1b] border-red-500/30 text-red-400'
                }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-[14px] font-medium tracking-wide">{toast.text}</p>
                </div>
            )}

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Showing <span className="text-white font-bold">{tickers.length}</span> of items.</span>
            </div>

            <div className="">
                <button
                    onClick={() => setView('add')}
                    className="bg-[#c026d3] hover:bg-[#a21caf] text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-900/10"
                >
                    ADD TICKER
                </button>
            </div>

            {/* Tickers Table */}
            <div className="bg-[#151c2c] rounded border border-[#2d3748] shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c026d3]" />
                    </div>
                ) : tickers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs uppercase text-slate-500 border-b border-white/5">
                                    <th className="px-6 py-4 w-20">ID</th>
                                    <th className="px-6 py-4">Message</th>
                                    <th className="px-6 py-4 w-48">Start Time</th>
                                    <th className="px-6 py-4 w-48">End Time</th>
                                    <th className="px-6 py-4 w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] text-slate-300">
                                {tickers.map(ticker => (
                                    <tr key={ticker.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium">{ticker.id}</td>
                                        <td className="px-6 py-4">{ticker.text}</td>
                                        <td className="px-6 py-4">{ticker.start_time ? new Date(ticker.start_time).toLocaleString() : 'N/A'}</td>
                                        <td className="px-6 py-4">{ticker.end_time ? new Date(ticker.end_time).toLocaleString() : 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleDeleteClick(ticker.id)}
                                                className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-all active:scale-90"
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
                    <div className="p-12 text-center text-slate-500 italic">
                        No tickers found. Click "ADD TICKER" to create one.
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1e253a] border border-white/10 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                        <div className="flex justify-between items-center p-4 border-b border-white/5">
                            <h3 className="text-white font-bold text-lg">Remove Ticker</h3>
                            <button 
                                onClick={() => setDeleteModal({ show: false, tickerId: null })}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-slate-300 text-base mb-2">Are you sure you want to delete this ticker?</p>
                        </div>
                        <div className="flex p-4 gap-3 bg-black/20">
                            <button 
                                onClick={() => setDeleteModal({ show: false, tickerId: null })}
                                className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
                            >
                                CANCEL
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={submitting}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'DELETE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TickersPage;
