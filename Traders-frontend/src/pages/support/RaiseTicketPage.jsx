import React, { useState } from 'react';
import { Ticket, Send, History, CheckCircle, Clock, AlertCircle, FileUp, Phone, MessageSquare, Headphones, ShieldCheck, Mail, ArrowRight, User, ShieldAlert } from 'lucide-react';

const RaiseTicketPage = ({ user }) => {
    const [view, setView] = useState('new'); // 'new' or 'history'
    const [formData, setFormData] = useState({
        name: user?.name || '',
        mobile: user?.mobile || '',
        issueType: 'Technical',
        description: '',
        screenshot: null
    });
    const [submitting, setSubmitting] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [errors, setErrors] = useState({});

    const [tickets, setTickets] = useState([
        { id: 'TKT-10294', type: 'Margin Error', status: 'Resolved', date: '2026-02-24', message: 'Funds not updating on dashboard after deposit' },
        { id: 'TKT-10295', type: 'Technical', status: 'In Progress', date: '2026-02-25', message: 'Withdrawal delayed more than 24 hours' },
        { id: 'TKT-10296', type: 'Trade Limit', status: 'Open', date: '2026-02-26', message: 'Please increase my trade limit to 50 lots' },
    ]);

    const validate = () => {
        let errs = {};
        if (!formData.name.trim()) errs.name = 'Full Name is required';
        if (!formData.mobile.trim()) errs.mobile = 'Mobile is required';
        if (formData.mobile.trim() && !/^\d{10}$/.test(formData.mobile)) errs.mobile = 'Valid 10-digit number required';
        if (!formData.description.trim()) errs.description = 'Problem description is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        setSubmitting(true);
        setTimeout(() => {
            const newTicket = {
                id: 'TKT-' + Math.floor(10000 + Math.random() * 90000),
                type: formData.issueType,
                status: 'Open',
                date: new Date().toISOString().split('T')[0],
                message: formData.description
            };
            setTickets([newTicket, ...tickets]);
            setSubmitting(false);
            setShowOTP(false);
            setView('history');
            setFormData({ ...formData, description: '', screenshot: null });
        }, 1500);
    };

    const statusColors = {
        'Open': 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
        'In Progress': 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
        'Resolved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
    };

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in duration-700">

            {/* ─── Hero / Header Section ─── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/20 shadow-lg">
                            <Headphones className="w-5 h-5 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Support Center</h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
                        Experiencing an issue? Our engineering and support team is here to help.
                        Usually, tickets are resolved within <span className="text-green-400 font-bold">2-4 business hours</span>.
                    </p>
                </div>

                {/* Segmented Control / Tabs */}
                <div className="bg-[#1a2235] p-1.5 rounded-xl border border-white/5 flex gap-1 shadow-2xl">
                    <button
                        onClick={() => setView('new')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'new'
                            ? 'bg-green-600 text-white shadow-xl shadow-green-900/40'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Ticket size={14} className={view === 'new' ? 'animate-pulse' : ''} />
                        New Ticket
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'history'
                            ? 'bg-green-600 text-white shadow-xl shadow-green-900/40'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <History size={14} />
                        History
                        {tickets.length > 0 && (
                            <span className="ml-1 w-5 h-5 bg-black/30 rounded-full flex items-center justify-center text-[9px]">
                                {tickets.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">

                {/* ─── Main Content ─── */}
                <div className="xl:col-span-2">
                    {view === 'new' ? (
                        <div className="bg-[#1f283e]/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-left-4 duration-500">
                            {/* Inner Header */}
                            <div className="px-10 py-6 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Incident Report Form</h3>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Step 1: Provide Details of your concern</p>
                            </div>

                            {/* Ticket Submission Form */}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!validate()) return;
                                setShowOTP(true);
                            }} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Contact Name */}
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-green-400">Your Identity</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-green-500" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full bg-black/40 border ${errors.name ? 'border-red-500/50' : 'border-white/10 group-focus-within:border-green-500/50'} rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none transition-all shadow-inner`}
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        {errors.name && <p className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-tight">{errors.name}</p>}
                                    </div>

                                    {/* Mobile Input */}
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-green-400">Direct Contact</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-green-500 transition-colors" />
                                            <input
                                                type="tel"
                                                value={formData.mobile}
                                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                                className={`w-full bg-black/40 border ${errors.mobile ? 'border-red-500/50' : 'border-white/10 group-focus-within:border-green-500/50'} rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none transition-all shadow-inner`}
                                                placeholder="Mobile Number"
                                            />
                                        </div>
                                        {errors.mobile && <p className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-tight">{errors.mobile}</p>}
                                    </div>
                                </div>

                                {/* Issue Type Selector */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Context / Category</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {['Technical', 'Margin Error', 'Trade Limit', 'Withdrawal', 'Security', 'Other'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, issueType: cat })}
                                                className={`px-4 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-tight transition-all text-center ${formData.issueType === cat
                                                    ? 'bg-green-500/20 border-green-500/40 text-green-400 shadow-lg shadow-green-900/10'
                                                    : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/20'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-green-400">Statement of Concern</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={5}
                                        className={`w-full bg-black/40 border ${errors.description ? 'border-red-500/50' : 'border-white/10 group-focus-within:border-green-500/50'} rounded-2xl px-5 py-4 text-sm text-white focus:outline-none transition-all shadow-inner resize-none`}
                                        placeholder="Explain the situation briefly..."
                                    ></textarea>
                                    {errors.description && <p className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-tight">{errors.description}</p>}
                                </div>

                                {/* File Attachment */}
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-green-400">Evidence (Image)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="file-capture"
                                            className="hidden"
                                            onChange={e => setFormData({ ...formData, screenshot: e.target.files[0] })}
                                        />
                                        <label
                                            htmlFor="file-capture"
                                            className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-green-500/50 rounded-2xl bg-black/20 hover:bg-black/40 cursor-pointer transition-all gap-3 group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 transition-all">
                                                <FileUp className="w-5 h-5 text-slate-500 group-hover:text-green-400" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest">
                                                {formData.screenshot ? formData.screenshot.name : 'Attach Screenshot or Snippet'}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between gap-6 border-t border-white/5">
                                    <p className="hidden md:block text-[9px] text-slate-600 font-black uppercase tracking-widest max-w-[200px]">
                                        By submitting, you agree to our fair usage support policy.
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, description: '', screenshot: null })}
                                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl bg-green-600 hover:bg-green-500 text-white shadow-green-900/30 active:scale-95"
                                        >
                                            <Send className="w-4 h-4" />
                                            Dispatch Ticket
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* OTP Modal Overaly */}
                            {showOTP && (
                                <div className="absolute inset-0 z-50 bg-[#1a2035]/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                                        <ShieldAlert size={32} className="text-green-400 animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 text-center">Verify Identity</h3>
                                    <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest text-center mb-8">Enter the 4-digit code sent to your linked mobile.</p>

                                    <div className="flex gap-4 mb-8">
                                        {[1, 2, 3, 4].map(i => (
                                            <input
                                                key={i}
                                                type="text"
                                                maxLength={1}
                                                className="w-14 h-16 bg-black/40 border border-white/10 rounded-xl text-center text-2xl font-black text-white focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                                autoFocus={i === 1}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-4 w-full max-w-xs">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${submitting
                                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/30 active:scale-95'
                                                }`}
                                        >
                                            {submitting ? 'Verifying...' : 'Confirm & Send'}
                                        </button>
                                        <button
                                            onClick={() => setShowOTP(false)}
                                            className="w-full py-4 bg-white/5 text-slate-400 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <p className="mt-8 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">RESEND OTP IN 0:54</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Ticket History View */
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                            {tickets.length === 0 ? (
                                <div className="bg-[#1f283e]/50 backdrop-blur-xl rounded-3xl border border-white/10 py-24 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <MessageSquare size={32} className="text-slate-700" />
                                    </div>
                                    <h4 className="text-white font-black uppercase tracking-widest">Void Ledger</h4>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight mt-2">No active or past support engagements recorded.</p>
                                </div>
                            ) : (
                                tickets.map((ticket, idx) => (
                                    <div
                                        key={ticket.id}
                                        className="bg-[#1f283e]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-[#1f283e] hover:-translate-y-1 transition-all shadow-xl group cursor-default"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center border border-white/5 group-hover:border-green-500/30 transition-all shadow-inner">
                                                    <Ticket className="w-6 h-6 text-green-500/40" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                            {ticket.id}
                                                        </span>
                                                        <span className="text-xs font-black text-white uppercase tracking-widest">{ticket.type}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-300 line-clamp-1 max-w-sm">{ticket.message}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-10">
                                                <div className="hidden lg:flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logged On</span>
                                                    <span className="text-xs font-bold text-slate-200">{ticket.date}</span>
                                                </div>

                                                <div className={`px-5 py-2 rounded-full text-[10px] font-black border flex items-center gap-2.5 transition-all shadow-inner ${statusColors[ticket.status]}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-400' : ticket.status === 'In Progress' ? 'bg-amber-400' : 'bg-blue-400'} animate-pulse`} />
                                                    {ticket.status.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Sidebar Help ─── */}
                <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700 delay-200">

                    {/* Support Channels Card */}
                    <div className="bg-gradient-to-br from-green-600/20 to-transparent p-px rounded-3xl border border-white/5 overflow-hidden">
                        <div className="bg-[#1f283e] p-8 rounded-[23px] relative h-full">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Direct Assist Channels</h4>

                            <div className="space-y-5">
                                <a
                                    href={`https://wa.me/919876543210?text=Hello Support, I am ${formData.name}. I need assistance with ${formData.issueType}.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 group p-1"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/10 group-hover:bg-green-500 group-hover:text-white transition-all shadow-sm">
                                        <MessageSquare size={18} className="text-green-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-white uppercase tracking-widest">WhatsApp Chat</p>
                                        <p className="text-[10px] text-slate-500 font-bold">Responds in 5 mins</p>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-700 group-hover:text-green-500 transition-all -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                                </a>

                                <a
                                    href={`mailto:support@traders.com?subject=Support Request: ${formData.issueType}&body=Hello Support Team,%0A%0AI am ${formData.name} (Mob: ${formData.mobile}).%0A%0AI am facing an issue regarding ${formData.issueType}.%0A%0ADescription: ${formData.description || '[Please describe here]'}`}
                                    className="flex items-center gap-4 group p-1"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                                        <Mail size={18} className="text-blue-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-white uppercase tracking-widest">Official Email</p>
                                        <p className="text-[10px] text-slate-500 font-bold">support@traders.com</p>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-700 group-hover:text-blue-500 transition-all -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                                </a>

                                <div className="flex items-center gap-4 group p-1">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10 shadow-sm">
                                        <Phone size={18} className="text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-white uppercase tracking-widest">Emergency Call</p>
                                        <p className="text-[10px] text-slate-500 font-bold">Premium Clients Only</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Banner */}
                    <div className="bg-[#1f283e]/40 p-6 rounded-2xl border border-white/5 flex items-start gap-4">
                        <ShieldCheck className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                            <h5 className="text-[11px] font-black text-white uppercase tracking-widest">Data Privacy Locked</h5>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                                All attachments and descriptions are encrypted. Only authorized support engineers have decryption keys.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RaiseTicketPage;
