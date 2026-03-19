import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, User, Lock, Key, Settings } from 'lucide-react';
import * as api from '../../services/api';

const InputField = ({ label, name, value, onChange, type = "text", placeholder, hint }) => (
    <div className="mb-8 group">
        <label htmlFor={name} className="block text-xs mb-3 font-medium uppercase tracking-wider" style={{ color: '#8b8f9a' }}>
            {label}
        </label>
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent border-b border-slate-700 pb-2 text-white focus:outline-none focus:border-[#4caf50] transition-colors text-sm font-bold"
        />
        {hint && <p className="text-[11px] mt-2 font-light leading-snug" style={{ color: '#8b8f9a' }}>{hint}</p>}
    </div>
);

const SelectField = ({ label, name, options, value, onChange, hint }) => (
    <div className="mb-8 group">
        <label htmlFor={name} className="block text-xs mb-3 font-medium uppercase tracking-wider" style={{ color: '#8b8f9a' }}>
            {label}
        </label>
        <div className="relative">
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent border-b border-slate-700 pb-2 text-white focus:outline-none focus:border-[#4caf50] transition-colors text-sm font-bold appearance-none cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a2035] text-white">{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
        {hint && <p className="text-[11px] mt-2 font-light leading-snug" style={{ color: '#8b8f9a' }}>{hint}</p>}
    </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
    <label htmlFor={name} className="flex items-center gap-3 cursor-pointer group mb-10 mt-4">
        <div className="relative flex items-center justify-center">
            <input
                id={name}
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="appearance-none w-4 h-4 border border-slate-500 rounded-sm checked:bg-[#4caf50] checked:border-[#4caf50] transition-all cursor-pointer"
            />
            {checked && <Check className="w-3 h-3 text-white absolute pointer-events-none" />}
        </div>
        <span className="text-sm font-medium tracking-wide" style={{ color: '#bcc0cf' }}>{label}</span>
    </label>
);

const CopyTradingClientForm = ({ client, onClose, onSave, onLogout }) => {
    const [formData, setFormData] = useState({
        fullName: client?.full_name || client?.fullName || '',
        mobile: client?.mobile || '',
        username: '',
        password: '',
        city: client?.city || '',
        minTimeToBookProfit: client?.minTimeToBookProfit || '120',
        scalpingStopLoss: client?.scalpingStopLoss || 'Disabled',
        isDemoAccount: client?.isDemo || client?.is_demo || client?.demoAccount === 'Yes' || false,
        transactionPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Step 1: Create client
            const result = await api.createClient({
                fullName: formData.fullName,
                username: formData.username,
                password: formData.password,
                mobile: formData.mobile,
                city: formData.city,
                creditLimit: client?.ledger_balance || client?.creditLimit || 0,
                role: 'TRADER'
            });

            const userId = result.id;

            // Step 2: Update with extra fields from both form and original client
            // In a real scenario, we'd want to copy ALL settings from the original client
            // but for this UI task, we focus on the form fields.
            
            await api.updateUser(userId, {
                isDemo: formData.isDemoAccount,
                status: 'Active'
            });

            await api.updateClientSettings(userId, {
                minProfitTime: formData.minTimeToBookProfit,
                scalpingSlEnabled: formData.scalpingStopLoss,
                // Inherit other settings from original client if available
                ...(client?.settings || {})
            });

            if (formData.transactionPassword) {
                await api.updateUserPasswords(userId, {
                    transactionPassword: formData.transactionPassword
                });
            }

            onSave(formData);
        } catch (err) {
            setError(err.message || 'Failed to copy client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0b111e] z-[60] flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header / Top Bar */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="flex items-center gap-2 text-white hover:bg-black/10 px-3 py-1.5 rounded transition-colors group">
                        <i className="fa-solid fa-arrow-left text-[18px] group-hover:-translate-x-1 transition-transform"></i>
                        <span className="text-[14px] font-bold uppercase tracking-tight">Back</span>
                    </button>
                </div>
                <div className="flex items-center gap-4 text-white">
                    <Settings className="w-5 h-5 opacity-80 cursor-pointer hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 font-bold uppercase text-[12px] cursor-pointer hover:bg-black/10 px-3 py-1.5 rounded transition-colors select-none">
                        <User className="w-4 h-4 text-white/80" />
                        DEMO PANNEL
                        <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Matching TradingClientsPage sidebar vibe) */}
                <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-2 shrink-0 overflow-y-auto">
                    {[
                        { icon: 'fa-table-columns', label: 'DashBoard' },
                        { icon: 'fa-chart-line', label: 'Market Watch' },
                        { icon: 'fa-bell', label: 'Notifications' },
                        { icon: 'fa-list-ul', label: 'Action Ledger' },
                        { icon: 'fa-briefcase', label: 'Active Positions' },
                        { icon: 'fa-box-archive', label: 'Closed Positions' },
                        { icon: 'fa-user-tie', label: 'Trading Clients', active: true },
                        { icon: 'fa-arrow-right-arrow-left', label: 'Trades' },
                        { icon: 'fa-users-rectangle', label: 'Group Trades' },
                        { icon: 'fa-clock-rotate-left', label: 'Closed Trades' },
                        { icon: 'fa-wallet', label: 'Trader Funds' },
                        { icon: 'fa-users', label: 'Users' }
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={`text-slate-400 text-xs flex items-center gap-3 py-2.5 px-3 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.active ? 'bg-[#4caf50] text-white font-bold shadow-lg' : ''}`}
                        >
                            <div className="w-5 h-5 flex items-center justify-center opacity-70">
                                <span className={`fa-solid ${item.icon}`}></span>
                            </div>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#0b111e] custom-scrollbar">
                    <div className="max-w-5xl mx-auto">
                        
                        {/* Title Ribbon */}
                        <div className="inline-block relative mb-12">
                            <div className="bg-[#46a049] px-4 py-3 rounded-t-sm shadow-xl">
                                <h1 className="text-white text-[15px] font-medium tracking-wide">Create Trading Client:</h1>
                            </div>
                            <div className="absolute left-0 -bottom-2 w-3 h-3 bg-[#2e7d32] rounded-bl-full shadow-lg"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4">
                            <h2 className="text-[22px] font-normal mb-10 text-[#bcc0cf] tracking-wide">Personal Details:</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                                {/* Left Column */}
                                <div>
                                    <InputField
                                        label="Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        hint="Insert Real name of the trader. Will be visible in trading App"
                                    />
                                    <InputField
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        hint="username for loggin-in with, is not case sensitive. must be unique for every trader. should not contain symbols."
                                    />
                                    <InputField
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        hint="Optional"
                                    />
                                    <SelectField
                                        label="Scalping Stop Loss"
                                        name="scalpingStopLoss"
                                        value={formData.scalpingStopLoss}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'Disabled', label: 'Disabled' },
                                            { value: 'Enabled', label: 'Enabled' }
                                        ]}
                                        hint="If Disabled, Stop Loss or Booking Loss can be done after Min. time of profit booking."
                                    />
                                    <CheckboxField
                                        label="demo account?"
                                        name="isDemoAccount"
                                        checked={formData.isDemoAccount}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Right Column */}
                                <div>
                                    <InputField
                                        label="Mobile"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        hint="Optional"
                                    />
                                    <InputField
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        hint="password for loggin-in with, is case sensitive. Leave Blank if you want password remain unchanged."
                                    />
                                    <InputField
                                        label="Min. Time to book profit (No. of Seconds)"
                                        name="minTimeToBookProfit"
                                        value={formData.minTimeToBookProfit}
                                        onChange={handleChange}
                                        hint="Example: 120, will hold the trade for 2 minutes before closing a trade in profit"
                                    />
                                    <InputField
                                        label="Transaction Password"
                                        name="transactionPassword"
                                        type="password"
                                        value={formData.transactionPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm mb-6 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-8 bg-[#4caf50] hover:bg-[#43a047] text-white px-8 py-3 rounded text-[13px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? 'SAVING...' : 'SAVE'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CopyTradingClientForm;
