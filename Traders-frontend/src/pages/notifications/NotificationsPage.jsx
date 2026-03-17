import React, { useState } from 'react';
import { Bell, Send, Trash2, X, CheckCheck } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import { createNotification, deleteNotification } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TYPE_BADGE = {
    alert:   'bg-red-500/20 text-red-400 border border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    info:    'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
};

const PAGE_SIZE = 15;

const NotificationsPage = () => {
    const { user } = useAuth();
    const { notifications, unreadCount, markAllRead, refetch } = useNotifications();

    const [page, setPage]         = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [sending, setSending]    = useState(false);
    const [form, setForm] = useState({
        title: '', message: '', type: 'info', target_role: 'ALL',
    });

    const canSend = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';

    const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
    const paginated  = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSend = async () => {
        if (!form.title.trim() || !form.message.trim()) return;
        try {
            setSending(true);
            await createNotification(form);
            setShowModal(false);
            setForm({ title: '', message: '', type: 'info', target_role: 'ALL' });
            refetch();
        } catch (err) {
            alert(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification?')) return;
        try {
            await deleteNotification(id);
            refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-5 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {canSend && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-[11px] font-bold py-2.5 px-5 rounded shadow uppercase tracking-wider transition-all active:scale-95"
                        >
                            <Send className="w-3.5 h-3.5" /> Send Notification
                        </button>
                    )}
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-slate-300 text-[11px] font-bold py-2.5 px-4 rounded uppercase tracking-wider transition-all"
                        >
                            <CheckCheck className="w-3.5 h-3.5 text-green-400" /> Mark All Read
                        </button>
                    )}
                </div>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {unreadCount} unread
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="bg-[#1f283e]/40 rounded-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="text-white text-base font-bold">
                                <th className="px-6 py-4 border-b border-white/5 w-[5%]"></th>
                                <th className="px-4 py-4 border-b border-white/5 w-[10%]">Type</th>
                                <th className="px-4 py-4 border-b border-white/5 w-[18%]">Title</th>
                                <th className="px-4 py-4 border-b border-white/5">Message</th>
                                <th className="px-4 py-4 border-b border-white/5 w-[10%]">Target</th>
                                <th className="px-4 py-4 border-b border-white/5 w-[14%] text-right pr-8">Delivered At</th>
                                {canSend && <th className="px-4 py-4 border-b border-white/5 w-[5%]"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={canSend ? 7 : 6} className="px-6 py-16 text-center text-slate-500">
                                        <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        No notifications yet
                                    </td>
                                </tr>
                            )}
                            {paginated.map((n) => {
                                const isUnread = !n.is_read;
                                return (
                                    <tr key={n.id} className={`transition-colors align-top ${isUnread ? 'bg-white/3' : 'hover:bg-white/3'}`}>
                                        <td className="px-6 py-4">
                                            {isUnread && <span className="block w-2 h-2 rounded-full bg-green-400 mt-1" />}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${TYPE_BADGE[n.type] || TYPE_BADGE.info}`}>
                                                {n.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-[13px] font-bold text-slate-200 uppercase leading-tight">
                                            {n.title}
                                        </td>
                                        <td className="px-4 py-4 text-[13px] text-slate-400 leading-relaxed">
                                            {n.message}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                                {n.target_role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-[11px] text-slate-400 text-right pr-8 whitespace-nowrap">
                                            {n.created_at ? (
                                                <>
                                                    <div>{new Date(n.created_at).toLocaleDateString()}</div>
                                                    <div className="mt-0.5">{new Date(n.created_at).toLocaleTimeString()}</div>
                                                </>
                                            ) : '—'}
                                        </td>
                                        {canSend && (
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => handleDelete(n.id)}
                                                    className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center gap-2 py-4 select-none">
                    <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="text-[#8890a5] text-lg font-bold cursor-pointer hover:text-white disabled:opacity-30 transition-colors"
                    >&lt;&lt;</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                    <span className="text-[#8890a5] font-bold px-1">...</span>
                                )}
                                <button
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all
                                        ${p === page ? 'bg-white/90 text-[#1a2035] shadow-md' : 'bg-white/10 text-[#8890a5] hover:bg-white/20 hover:text-white'}`}
                                >{p}</button>
                            </React.Fragment>
                        ))
                    }
                    <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="text-[#8890a5] text-lg font-bold cursor-pointer hover:text-white disabled:opacity-30 transition-colors"
                    >&gt;&gt;</button>
                </div>
            )}

            {/* Send Notification Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1f283e] border border-white/10 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-white/3">
                            <div className="flex items-center gap-2">
                                <Send className="w-4 h-4 text-green-400" />
                                <span className="text-white text-[14px] font-bold">Send Notification</span>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Notification title…"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Message</label>
                                <textarea
                                    rows={3}
                                    value={form.message}
                                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    placeholder="Notification message…"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 resize-none"
                                />
                            </div>

                            {/* Type + Target row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                        className="w-full bg-[#1a2035] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-green-500/50"
                                    >
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="alert">Alert</option>
                                        <option value="success">Success</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Send To</label>
                                    <select
                                        value={form.target_role}
                                        onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))}
                                        className="w-full bg-[#1a2035] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-green-500/50"
                                    >
                                        <option value="ALL">All Users</option>
                                        {user?.role === 'SUPERADMIN' && <option value="SUPERADMIN">SuperAdmin</option>}
                                        <option value="ADMIN">Admin</option>
                                        <option value="BROKER">Broker</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/8 bg-white/2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-[12px] font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending || !form.title.trim() || !form.message.trim()}
                                className="flex items-center gap-2 px-5 py-2 text-[12px] font-bold bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg transition-all active:scale-95"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {sending ? 'Sending…' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
