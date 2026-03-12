import React, { useState } from 'react';
import { X, Save, ArrowLeft, User, Mail, Lock, Shield } from 'lucide-react';

const SimpleAddUserForm = ({ role, onBack, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        mobile: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, role: role.toUpperCase() });
    };

    return (
        <div className="min-h-screen bg-[#1b2236] font-sans flex flex-col items-center px-4 py-10">
            <div className="w-full max-w-2xl bg-[#202940] rounded shadow-2xl border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="bg-[#4caf50] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-white hover:bg-black/10 p-2 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-white text-xl font-bold uppercase tracking-wider">Add {role}:</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest px-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#1a2035] border border-white/10 rounded px-10 py-3 text-white focus:outline-none focus:border-[#4caf50] transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#1a2035] border border-white/10 rounded px-10 py-3 text-white focus:outline-none focus:border-[#4caf50] transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest px-1">Username</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#1a2035] border border-white/10 rounded px-10 py-3 text-white focus:outline-none focus:border-[#4caf50] transition-all"
                                    placeholder="Create username"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest px-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#1a2035] border border-white/10 rounded px-10 py-3 text-white focus:outline-none focus:border-[#4caf50] transition-all"
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full bg-[#4caf50] hover:bg-[#43a047] text-white py-3 rounded font-bold uppercase tracking-[2px] shadow-lg transition-all active:scale-[0.98]"
                        >
                            CREATE {role}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SimpleAddUserForm;
