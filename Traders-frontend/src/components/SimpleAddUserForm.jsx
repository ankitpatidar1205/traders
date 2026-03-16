import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Shield, Phone } from 'lucide-react';
import * as api from '../services/api';

const SimpleAddUserForm = ({ role, onBack, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        mobile: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await api.createClient({ ...formData, role: role.toUpperCase() });
            if (onSave) onSave(result);
        } catch (err) {
            setError(err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1b2236] font-sans flex flex-col items-center px-4 py-10">
            <div className="w-full max-w-2xl bg-[#202940] rounded shadow-2xl border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between" style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}>
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-white hover:bg-black/10 p-2 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-white text-xl font-bold uppercase tracking-[2px]">Add {role}:</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-[#1f283e]" autoComplete="off">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-slate-300 text-[11px] font-bold uppercase tracking-[1px] px-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded px-10 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#4caf50]/20 focus:border-[#4caf50] transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <label className="text-slate-300 text-[11px] font-bold uppercase tracking-[1px] px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded px-10 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#4caf50]/20 focus:border-[#4caf50] transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-slate-300 text-[11px] font-bold uppercase tracking-[1px] px-1">Username</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded px-10 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#4caf50]/20 focus:border-[#4caf50] transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="Create username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-slate-300 text-[11px] font-bold uppercase tracking-[1px] px-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    className="w-full bg-white border border-slate-200 rounded px-10 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#4caf50]/20 focus:border-[#4caf50] transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-2">
                            <label className="text-slate-300 text-[11px] font-bold uppercase tracking-[1px] px-1">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded px-10 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#4caf50]/20 focus:border-[#4caf50] transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="10-digit mobile"
                                    maxLength={10}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white py-3.5 rounded font-bold uppercase tracking-[2px] shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
                            style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                        >
                            {loading ? 'CREATING...' : `CREATE ${role.toUpperCase()}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SimpleAddUserForm;
