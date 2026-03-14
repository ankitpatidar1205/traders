import React, { useState, useEffect, useRef } from 'react';
import { X, Save, ArrowLeft, Info, Check, ChevronDown, Settings, User, Lock, Key, FileUp, ShieldCheck } from 'lucide-react';
import * as api from '../../services/api';

const InputField = ({ label, name, value, onChange, type = "text", placeholder, hint, className = "" }) => (
    <div className={`mb-10 group px-2 ${className}`}>
        <label htmlFor={name} className="block text-[15px] mb-2 font-normal leading-tight text-[#bcc0cf]">
            {label}
        </label>
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent border-b border-white/20 py-1.5 text-white focus:outline-none focus:border-white/40 transition-colors text-[17px] font-normal"
        />
        {hint && <p className="text-[13px] mt-2 font-normal leading-snug text-[#888c9b]">{hint}</p>}
    </div>
);

const SelectField = ({ label, name, value, onChange, options, hint, className = "" }) => (
    <div className={`mb-10 group px-2 ${className}`}>
        <label htmlFor={name} className="block text-[14px] mb-1 font-normal leading-tight text-[#bcc0cf]">
            {label}
        </label>
        <div className="relative">
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-white border border-slate-200 py-2.5 px-4 text-black font-extrabold outline-none rounded shadow-sm appearance-none focus:ring-2 focus:ring-[#4caf50]/20 transition-all text-sm uppercase tracking-wider cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-white text-black font-bold">
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#4caf50] transition-colors">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
        {hint && <p className="text-[12px] mt-2 font-normal leading-snug text-[#888c9b]">{hint}</p>}
    </div>
);

const CheckboxField = ({ label, name, checked, onChange, className = "" }) => (
    <label htmlFor={name} className={`flex items-center gap-4 cursor-pointer group mb-10 px-2 ${className}`}>
        <div className="relative flex items-center justify-center">
            <input
                id={name}
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="appearance-none w-[19px] h-[19px] border border-white/30 rounded-[3px] checked:bg-[#3b82f6] checked:border-[#3b82f6] transition-all cursor-pointer"
            />
            {checked && <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none stroke-[3]" />}
        </div>
        <span className="text-[15px] group-hover:text-white transition-colors text-[#bcc0cf] font-normal">{label}</span>
    </label>
);

const SectionHeader = ({ title }) => (
    <h3 className="text-[26px] font-normal mb-10 px-2 text-white">{title}</h3>
);

const ScripField = ({ label, value, onChange, name, className = "" }) => (
    <div className={`mb-8 ${className}`}>
        <label className="text-[12px] uppercase font-bold tracking-tight block mb-2 text-[#bcc0cf]">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-white/10 py-1.5 text-white focus:outline-none focus:border-white/30 transition-colors text-[16px] font-normal"
        />
    </div>
);

const UpdateClientPage = ({ client, onClose, onSave, onLogout, onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [formData, setFormData] = useState({
        // 1. Personal Details
        fullName: client?.fullName || 'Demo ji',
        mobile: client?.mobile || '',
        username: client?.username || 'Demo0174',
        password: '',
        city: client?.city || '',

        // 2. Config
        isDemoAccount: client?.demoAccount === 'Yes' || true,
        allowFreshEntry: client?.allowFreshEntry || false,
        allowOrdersBetweenHL: client?.allowOrdersBetweenHL !== undefined ? client.allowOrdersBetweenHL : true,
        tradeEquityUnits: client?.tradeEquityUnits || false,
        accountStatus: client?.status !== 'Inactive' ? true : false,
        autoCloseTrades: client?.autoCloseTrades || false,
        autoClosePercentage: client?.autoClosePercentage || '90',
        notifyPercentage: client?.notifyPercentage || '70',
        minTimeToBookProfit: client?.minTimeToBookProfit || '120',
        scalpingStopLoss: client?.scalpingStopLoss || 'Disabled',

        // 3. MCX Futures
        mcxTrading: client?.mcxTrading !== undefined ? client.mcxTrading : true,
        mcxMinLot: client?.mcxMinLot || '0',
        mcxMaxLot: client?.mcxMaxLot || '20',
        mcxMaxLotScrip: client?.mcxMaxLotScrip || '50',
        mcxMaxSizeAll: client?.mcxMaxSizeAll || '100',
        mcxBrokerageType: client?.mcxBrokerageType || 'per_lot',
        mcxBrokerage: client?.mcxBrokerage || '800.0000',
        mcxExposureType: client?.mcxExposureType || 'per_lot',
        mcxIntradayMargin: client?.mcxIntradayMargin || '500',
        mcxHoldingMargin: client?.mcxHoldingMargin || '100',
        mcxLotMargins: client?.mcxLotMargins || {
            BULLDEX: { INTRADAY: '10000', HOLDING: '10000' },
            GOLD: { INTRADAY: '10000', HOLDING: '10000' },
            SILVER: { INTRADAY: '15000', HOLDING: '40000' },
            CRUDEOIL: { INTRADAY: '10000', HOLDING: '10000' },
            'CRUDEOIL MINI': { INTRADAY: '10000', HOLDING: '10000' },
            COPPER: { INTRADAY: '10000', HOLDING: '10000' },
            NICKEL: { INTRADAY: '10000', HOLDING: '10000' },
            ZINC: { INTRADAY: '10000', HOLDING: '10000' },
            ZINCMINI: { INTRADAY: '1000', HOLDING: '1000' },
            LEAD: { INTRADAY: '1000', HOLDING: '1000' },
            LEADMINI: { INTRADAY: '1000', HOLDING: '1000' },
            ALUMINIUM: { INTRADAY: '1000', HOLDING: '1000' },
            ALUMINI: { INTRADAY: '1000', HOLDING: '1000' },
            NATURALGAS: { INTRADAY: '1000', HOLDING: '1000' },
            'NATURALGAS MINI': { INTRADAY: '1000', HOLDING: '1000' },
            MENTHAOIL: { INTRADAY: '1000', HOLDING: '1000' },
            COTTON: { INTRADAY: '1000', HOLDING: '1000' },
            GOLDM: { INTRADAY: '1000', HOLDING: '1000' },
            SILVERM: { INTRADAY: '1000', HOLDING: '1000' },
            'SILVER MIC': { INTRADAY: '1000', HOLDING: '1000' }
        },
        mcxLotBrokerage: client?.mcxLotBrokerage || {
            GOLDM: '100.0000', SILVERM: '100.0000', BULLDEX: '500.0000', GOLD: '200.0000', SILVER: '150.0000',
            CRUDEOIL: '100.0000', COPPER: '100.0000', NICKEL: '100.0000', ZINC: '100.0000', LEAD: '100.0000',
            NATURALGAS: '100.0000', 'NATURALGAS MINI': '100.0000', ALUMINIUM: '100.0000', MENTHAOIL: '100.0000',
            COTTON: '100.0000', 'SILVER MIC': '100.0000', ZINCMINI: '100.0000', ALUMINI: '100.0000',
            LEADMINI: '100.0000', 'CRUDEOIL MINI': '110.0000'
        },
        bidGaps: client?.bidGaps || {
            GOLDM: '0.0000', SILVERM: '0.0000', BULLDEX: '0.0000', GOLD: '0.0000', SILVER: '0.0000',
            CRUDEOIL: '0.0000', COPPER: '0.0000', NICKEL: '0.0000', ZINC: '0.0000', LEAD: '0.0000',
            NATURALGAS: '0.0000', 'NATURALGAS MINI': '0.0000', ALUMINIUM: '0.0000', MENTHAOIL: '0.0000',
            COTTON: '0.0000', 'SILVER MIC': '0.0000', ZINCMINI: '0.0000', ALUMINI: '0.0000',
            LEADMINI: '0.0000', 'CRUDEOIL MINI': '0.0000'
        },

        // 4. Equity Futures
        equityTrading: client?.equityTrading !== undefined ? client.equityTrading : true,
        equityBrokerage: client?.equityBrokerage || '800.0000',
        equityMinQty: client?.equityMinQty || '0',
        equityMaxQty: client?.equityMaxQty || '50',
        equityMinIndexQty: client?.equityMinIndexQty || '0',
        equityMaxIndexQty: client?.equityMaxIndexQty || '20',
        equityMaxScrip: client?.equityMaxScrip || '100',
        equityMaxIndexScrip: client?.equityMaxIndexScrip || '100',
        equityMaxSizeAll: client?.equityMaxSizeAll || '100',
        equityMaxSizeAllIndex: client?.equityMaxSizeAllIndex || '100',
        equityIntradayMargin: client?.equityIntradayMargin || '500',
        equityHoldingMargin: client?.equityHoldingMargin || '100',
        equityOrdersAway: client?.equityOrdersAway || '0.00',

        // 5. Options Config
        indexOptionsTrading: client?.indexOptionsTrading !== undefined ? client.indexOptionsTrading : true,
        equityOptionsTrading: client?.equityOptionsTrading !== undefined ? client.equityOptionsTrading : true,
        mcxOptionsTrading: client?.mcxOptionsTrading || false,
        optionsIndexBrokerageType: client?.optionsIndexBrokerageType || 'per_lot',
        optionsIndexBrokerage: client?.optionsIndexBrokerage || '20.0000',
        optionsEquityBrokerageType: client?.optionsEquityBrokerageType || 'per_lot',
        optionsEquityBrokerage: client?.optionsEquityBrokerage || '20.0000',
        optionsMcxBrokerageType: client?.optionsMcxBrokerageType || 'per_lot',
        optionsMcxBrokerage: client?.optionsMcxBrokerage || '20.0000',
        optionsMinBidPrice: client?.optionsMinBidPrice || '1.0000',
        optionsIndexShortSelling: client?.optionsIndexShortSelling || 'No',
        optionsEquityShortSelling: client?.optionsEquityShortSelling || 'No',
        optionsMcxShortSelling: client?.optionsMcxShortSelling || 'No',
        optionsEquityMinLot: client?.optionsEquityMinLot || '0',
        optionsEquityMaxLot: client?.optionsEquityMaxLot || '50',
        optionsIndexMinLot: client?.optionsIndexMinLot || '0',
        optionsIndexMaxLot: client?.optionsIndexMaxLot || '20',
        optionsMcxMinLot: client?.optionsMcxMinLot || '0',
        optionsMcxMaxLot: client?.optionsMcxMaxLot || '50',
        optionsEquityMaxScrip: client?.optionsEquityMaxScrip || '200',
        optionsIndexMaxScrip: client?.optionsIndexMaxScrip || '200',
        optionsMcxMaxScrip: client?.optionsMcxMaxScrip || '200',
        optionsMaxEquitySizeAll: client?.optionsMaxEquitySizeAll || '200',
        optionsMaxIndexSizeAll: client?.optionsMaxIndexSizeAll || '200',
        optionsMaxMcxSizeAll: client?.optionsMaxMcxSizeAll || '200',
        optionsIndexIntraday: client?.optionsIndexIntraday || '5',
        optionsIndexHolding: client?.optionsIndexHolding || '2.000000',
        optionsEquityIntraday: client?.optionsEquityIntraday || '5',
        optionsEquityHolding: client?.optionsEquityHolding || '2',
        optionsMcxIntraday: client?.optionsMcxIntraday || '5',
        optionsMcxHolding: client?.optionsMcxHolding || '2',
        optionsOrdersAway: client?.optionsOrdersAway || '0.00',

        // 7. Other
        notes: client?.notes || '',
        broker: client?.broker || '3761 : demo001',
        transactionPassword: '',

        // 8. Kyc / Documents
        documents: client?.documents || {
            panCard: null,
            aadhaarFront: null,
            aadhaarBack: null,
            bankStatement: null,
            addressProof: null
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNestedChange = (parent, field, value, subField = null) => {
        setFormData(prev => {
            const newParent = { ...prev[parent] };
            if (subField) {
                newParent[field] = { ...newParent[field], [subField]: value };
            } else {
                newParent[field] = value;
            }
            return { ...prev, [parent]: newParent };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!client?.id) return;
        setLoading(true);
        setSaveError('');
        try {
            const userId = client.id;

            // Step 1: Update user profile
            await api.updateUser(userId, {
                fullName: formData.fullName,
                mobile: formData.mobile,
                city: formData.city
            });

            // Step 2: Update client settings + full config as JSON
            await api.updateClientSettings(userId, {
                allowFreshEntry: formData.allowFreshEntry,
                allowOrdersBetweenHL: formData.allowOrdersBetweenHL,
                tradeEquityUnits: formData.tradeEquityUnits,
                autoClosePct: formData.autoClosePercentage,
                notifyPct: formData.notifyPercentage,
                minProfitTime: formData.minTimeToBookProfit,
                scalpingSlEnabled: formData.scalpingStopLoss,
                config: formData
            });

            onSave(formData);
        } catch (err) {
            setSaveError(err.message || 'Failed to update client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-50 flex flex-col overflow-hidden text-slate-300">
            {/* Top Bar - Green as per screenshot */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-4 shadow-md shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-white hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-[14px] font-bold uppercase tracking-tight">Back</span>
                    </button>
                </div>
                <div className="flex items-center gap-4 text-white">
                    <button className="hover:bg-black/10 p-1 rounded-full transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* Profile Dropdown Container */}
                    <div className="relative" ref={profileRef}>
                        <div
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-2 font-bold uppercase text-[12px] cursor-pointer hover:bg-black/10 px-3 py-1.5 rounded transition-colors tracking-tight select-none"
                        >
                            <User className="w-4 h-4 text-white/80" />
                            DEMO PANNEL
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown Menu */}
                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded shadow-2xl overflow-hidden z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 origin-top-right">
                                {/* Ledger Balance Section */}
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <p className="text-[#333] text-[14px] font-medium">
                                        Ledger-Balance: <span className="font-bold">0</span>
                                    </p>
                                </div>

                                {/* Action Items */}
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            if (onNavigate) onNavigate('change-password');
                                            setShowProfileDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-[#333] hover:bg-gray-50 transition-colors text-[13px] font-medium text-left"
                                    >
                                        <Lock className="w-4 h-4 text-gray-400" />
                                        Change Login Password
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onNavigate) onNavigate('change-transaction-password');
                                            setShowProfileDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-[#333] hover:bg-gray-50 transition-colors text-[13px] font-medium text-left"
                                    >
                                        <Key className="w-4 h-4 text-gray-400" />
                                        Change Transaction Password
                                    </button>
                                </div>

                                {/* Logout Button */}
                                <div className="p-3">
                                    <button
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                            setShowProfileDropdown(false);
                                        }}
                                        className="w-full bg-[#f44336] hover:bg-[#d32f2f] text-white py-2.5 rounded text-[13px] font-bold uppercase transition-all shadow-md"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Placeholder */}
                <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-1.5 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="text-slate-400 text-[11px] font-bold uppercase tracking-widest pb-4 mb-2 border-b border-white/5 px-2">Dashboard</div>
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
                        { icon: 'fa-trash-can', label: 'Deleted Trades' },
                        { icon: 'fa-hourglass-half', label: 'Pending Orders' },
                        { icon: 'fa-wallet', label: 'Trader Funds' },
                        { icon: 'fa-users', label: 'Users' },
                        { icon: 'fa-arrow-up-right-dots', label: 'Tickers' },
                        { icon: 'fa-ban', label: 'Banned Limit Orders' },
                        { icon: 'fa-building-columns', label: 'Bank Details' },
                        { icon: 'fa-address-card', label: 'Accounts' },
                        { icon: 'fa-network-wired', label: 'Broker Accounts' },
                        { icon: 'fa-key', label: 'Change Login Password' },
                        { icon: 'fa-shield-halved', label: 'Change Transaction Password' },
                        { icon: 'fa-money-bill-transfer', label: 'Withdrawal Requests' },
                        { icon: 'fa-file-invoice-dollar', label: 'Deposit Requests' },
                        { icon: 'fa-right-from-bracket', label: 'Log Out' }
                    ].map((item) => (
                        <div
                            key={item.label}
                            onClick={onClose}
                            className={`text-slate-400 text-[13px] flex items-center justify-between py-2.5 px-3 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.active ? 'bg-[#4caf50] text-white shadow-lg' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`fa-solid ${item.icon} text-xs`}></span>
                                <span className="truncate">{item.label}</span>
                            </div>
                            {item.label === 'Market Watch' && <span className="text-[10px] opacity-60" style={{ color: '#bcc0cf' }}>{currentTime}</span>}
                        </div>
                    ))}
                </div>

                {/* Form Wrapper */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2 bg-[#1a2035]">
                    <div className="max-w-6xl mx-auto mt-4 mb-6">
                        {/* Floating Card Header (3D Ribbon Style) */}
                        <div className="relative z-20 -mb-8 ml-4 flex flex-col items-start">
                            <div
                                className="px-6 py-4 rounded-md shadow-xl relative z-10"
                                style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
                            >
                                <h2 className="text-white text-base font-normal leading-none tracking-tight">
                                    Update Trading Client:
                                </h2>
                            </div>
                            {/* The 3D fold decorator */}
                            <div className="w-4 h-4 bg-[#388e3c] -mt-2 ml-2 rounded-sm rotate-45 relative z-0"></div>
                        </div>

                        {/* Main Card */}
                        <div className="bg-[#202940] rounded shadow-2xl p-10 pt-16 border border-white/5">
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-12">
                                    {/* PERSONAL DETAILS */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="Personal Details:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                            <InputField label="Name" name="fullName" value={formData.fullName} onChange={handleChange} hint="Insert Real name of the trader. Will be visible in trading App" />
                                            <InputField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} hint="Optional" />
                                            <InputField label="Username" name="username" value={formData.username} onChange={handleChange} hint="username for loggin-in with, is not case sensitive. must be unique for every trader. should not contain symbols." />
                                            <InputField label="Password" name="password" value={formData.password} onChange={handleChange} type="text" hint="password for loggin-in with, is case sensitive. Leave Blank if you want password remain unchanged." />
                                            <InputField label="City" name="city" value={formData.city} onChange={handleChange} hint="Optional" />
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* CONFIG */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="Config:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                            <CheckboxField label="demo account?" name="isDemoAccount" checked={formData.isDemoAccount} onChange={handleChange} />
                                            <CheckboxField label="Allow Fresh Entry Order above high & below low?" name="allowFreshEntry" checked={formData.allowFreshEntry} onChange={handleChange} />
                                            <CheckboxField label="Allow Orders between High - Low?" name="allowOrdersBetweenHL" checked={formData.allowOrdersBetweenHL} onChange={handleChange} />
                                            <CheckboxField label="Trade equity as units instead of lots." name="tradeEquityUnits" checked={formData.tradeEquityUnits} onChange={handleChange} />
                                            <CheckboxField label="Account Status" name="accountStatus" checked={formData.accountStatus} onChange={handleChange} />
                                            <CheckboxField label="Auto Close Trades if condition met" name="autoCloseTrades" checked={formData.autoCloseTrades} onChange={handleChange} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mt-4">
                                            <InputField label="auto-Close all active trades when the losses reach % of Ledger-balance" name="autoClosePercentage" value={formData.autoClosePercentage} onChange={handleChange} hint="Example: 95, will close when losses reach 95% of ledger balance" />
                                            <InputField label="Notify client when the losses reach % of Ledger-balance" name="notifyPercentage" value={formData.notifyPercentage} onChange={handleChange} hint="Example: 70, will send notification to customer every 5-minutes until losses cross 70% of ledger balance" />
                                            <InputField label="Min. Time to book profit (No. of Seconds)" name="minTimeToBookProfit" value={formData.minTimeToBookProfit} onChange={handleChange} hint="Example: 120, will hold the trade for 2 minutes before closing a trade in profit" />
                                            <SelectField label="Scalping Stop Loss" name="scalpingStopLoss" value={formData.scalpingStopLoss} onChange={handleChange} options={[{ value: 'Disabled', label: 'Disabled' }, { value: 'Enabled', label: 'Enabled' }]} hint="If Disabled, Stop Loss or Booking Loss can be done after Min. time of profit booking." />
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* MCX FUTURES */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="MCX Futures:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                            <CheckboxField label="MCX Trading" name="mcxTrading" checked={formData.mcxTrading} onChange={handleChange} />
                                            <InputField label="Minimum lot size required per single trade of MCX" name="mcxMinLot" value={formData.mcxMinLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of MCX" name="mcxMaxLot" value={formData.mcxMaxLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per script of MCX to be actively open at a time" name="mcxMaxLotScrip" value={formData.mcxMaxLotScrip} onChange={handleChange} />
                                            <InputField label="Max Size All Commodity" name="mcxMaxSizeAll" value={formData.mcxMaxSizeAll} onChange={handleChange} />
                                            <SelectField label="Mcx Brokerage Type" name="mcxBrokerageType" value={formData.mcxBrokerageType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_crore', label: 'Per Crore Basis' }]} />
                                            <InputField label="MCX brokerage" name="mcxBrokerage" value={formData.mcxBrokerage} onChange={handleChange} />
                                            <SelectField label="Exposure Mcx Type" name="mcxExposureType" value={formData.mcxExposureType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_turnover', label: 'Per Turnover Basis' }]} />
                                            {formData.mcxExposureType === 'per_turnover' && (
                                                <>
                                                    <InputField label="Intraday Exposure/Margin MCX" name="mcxIntradayMargin" value={formData.mcxIntradayMargin} onChange={handleChange} hint="Exposure auto calculates the margin money required..." />
                                                    <InputField label="Holding Exposure/Margin MCX" name="mcxHoldingMargin" value={formData.mcxHoldingMargin} onChange={handleChange} hint="Holding Exposure auto calculates the margin money required..." />
                                                </>
                                            )}
                                        </div>

                                        {/* MCX Lot Wise Exposure */}
                                        {formData.mcxExposureType === 'per_lot' && (
                                            <div className="mt-8">
                                                <h4 className="text-[17px] font-normal mb-10 px-4 border-l-2 border-[#4caf50] text-[#bcc0cf]" >MCX Exposure Lot wise:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                                                    {[
                                                        'BULLDEX', 'GOLD', 'SILVER', 'CRUDEOIL', 'CRUDEOIL MINI', 'COPPER', 'NICKEL', 'ZINC',
                                                        'ZINCMINI', 'LEAD', 'LEADMINI', 'ALUMINIUM', 'ALUMINI', 'NATURALGAS', 'NATURALGAS MINI',
                                                        'MENTHAOIL', 'COTTON', 'GOLDM', 'SILVERM', 'SILVER MIC'
                                                    ].map(scrip => (
                                                        <React.Fragment key={scrip}>
                                                            <ScripField label={`${scrip} INTRADAY`} value={formData.mcxLotMargins[scrip]?.INTRADAY || '0'} onChange={(e) => handleNestedChange('mcxLotMargins', scrip, e.target.value, 'INTRADAY')} />
                                                            <ScripField label={`${scrip} HOLDING`} value={formData.mcxLotMargins[scrip]?.HOLDING || '0'} onChange={(e) => handleNestedChange('mcxLotMargins', scrip, e.target.value, 'HOLDING')} />
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* MCX Lot Wise Brokerage */}
                                        {formData.mcxBrokerageType === 'per_lot' && (
                                            <div className="mt-12 px-2">
                                                <h4 className="text-[17px] font-normal mb-10 border-l-2 border-[#4caf50] pl-4 text-[#bcc0cf]">MCX Lot Wise Brokerage:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                                                    {[
                                                        'GOLDM', 'SILVERM', 'BULLDEX', 'GOLD', 'SILVER', 'CRUDEOIL', 'COPPER', 'NICKEL', 'ZINC', 'LEAD',
                                                        'NATURALGAS', 'NATURALGAS MINI', 'ALUMINIUM', 'MENTHAOIL', 'COTTON', 'SILVERMIC', 'ZINCMINI', 'ALUMINI',
                                                        'LEADMINI', 'CRUDEOIL MINI'
                                                    ].map(scrip => (
                                                        <ScripField key={scrip} label={`${scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip}:`} value={formData.mcxLotBrokerage[scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip] || '0.0000'} onChange={(e) => handleNestedChange('mcxLotBrokerage', scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip, e.target.value)} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bid Gaps */}
                                        <div className="mt-12 px-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                                <div className="px-1 md:col-span-2">
                                                    <h4 className="text-[17px] font-normal mb-10 border-l-2 border-[#4caf50] pl-4 text-[#bcc0cf]">Orders to be away by points in each scrip MCX:</h4>
                                                </div>
                                                {[
                                                    'GOLDM', 'SILVERM', 'BULLDEX', 'GOLD', 'SILVER', 'CRUDEOIL', 'COPPER', 'NICKEL', 'ZINC', 'LEAD',
                                                    'NATURALGAS', 'NATURALGAS MINI', 'ALUMINIUM', 'MENTHAOIL', 'COTTON', 'SILVERMIC', 'ZINCMINI', 'ALUMINI',
                                                    'LEADMINI', 'CRUDEOIL MINI'
                                                ].map(scrip => (
                                                    <ScripField key={scrip} label={`${scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip}:`} value={formData.bidGaps[scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip] || '0.0000'} onChange={(e) => handleNestedChange('bidGaps', scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip, e.target.value)} />
                                                ))}
                                            </div>
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* EQUITY FUTURES */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="Equity Futures:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                            <CheckboxField label="Equity Trading" name="equityTrading" checked={formData.equityTrading} onChange={handleChange} />
                                            <InputField label="Equity brokerage Per Crore" name="equityBrokerage" value={formData.equityBrokerage} onChange={handleChange} />
                                            <InputField label="Minimum quantity size required per single trade of Equity" name="equityMinQty" value={formData.equityMinQty} onChange={handleChange} />
                                            <InputField label="Maximum quantity size allowed per single trade of Equity" name="equityMaxQty" value={formData.equityMaxQty} onChange={handleChange} />
                                            <InputField label="Minimum quantity size required per single trade of Equity INDEX" name="equityMinIndexQty" value={formData.equityMinIndexQty} onChange={handleChange} />
                                            <InputField label="Maximum quantity size allowed per single trade of Equity INDEX" name="equityMaxIndexQty" value={formData.equityMaxIndexQty} onChange={handleChange} />
                                            <InputField label="Maximum quantity size allowed per script of Equity to be actively open at a time" name="equityMaxScrip" value={formData.equityMaxScrip} onChange={handleChange} />
                                            <InputField label="Maximum quantity size allowed per script of Equity INDEX to be actively open at a time" name="equityMaxIndexScrip" value={formData.equityMaxIndexScrip} onChange={handleChange} />
                                            <InputField label="Max Size All Equity" name="equityMaxSizeAll" value={formData.equityMaxSizeAll} onChange={handleChange} />
                                            <InputField label="Max Size All Index" name="equityMaxSizeAllIndex" value={formData.equityMaxSizeAllIndex} onChange={handleChange} />
                                            <InputField label="Intraday Exposure/Margin Equity" name="equityIntradayMargin" value={formData.equityIntradayMargin} onChange={handleChange} hint="Exposure auto calculates the margin money required..." />
                                            <InputField label="Holding Exposure/Margin Equity" name="equityHoldingMargin" value={formData.equityHoldingMargin} onChange={handleChange} hint="Holding Exposure auto calculates the margin money required..." />
                                            <InputField label="Orders to be away by % from current price Equity" name="equityOrdersAway" value={formData.equityOrdersAway} onChange={handleChange} />
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* OPTIONS CONFIG */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="Options Config:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2 mb-8 items-start">
                                            <div className="space-y-0">
                                                <CheckboxField label="Index Options Trading" name="indexOptionsTrading" checked={formData.indexOptionsTrading} onChange={handleChange} />
                                                <CheckboxField label="Equity Options Trading" name="equityOptionsTrading" checked={formData.equityOptionsTrading} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-0">
                                                <CheckboxField label="MCX Options Trading" name="mcxOptionsTrading" checked={formData.mcxOptionsTrading} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                            <SelectField label="Options Index Brokerage Type" name="optionsIndexBrokerageType" value={formData.optionsIndexBrokerageType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_crore', label: 'Per Crore Basis' }]} />
                                            <InputField label="Options Index brokerage" name="optionsIndexBrokerage" value={formData.optionsIndexBrokerage} onChange={handleChange} />

                                            <SelectField label="Options Equity Brokerage Type" name="optionsEquityBrokerageType" value={formData.optionsEquityBrokerageType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_crore', label: 'Per Crore Basis' }]} />
                                            <InputField label="Options Equity brokerage" name="optionsEquityBrokerage" value={formData.optionsEquityBrokerage} onChange={handleChange} />

                                            <SelectField label="Options MCX Brokerage Type" name="optionsMcxBrokerageType" value={formData.optionsMcxBrokerageType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_crore', label: 'Per Crore Basis' }]} />
                                            <InputField label="Options MCX brokerage" name="optionsMcxBrokerage" value={formData.optionsMcxBrokerage} onChange={handleChange} />

                                            <InputField label="Options Min. Bid Price" name="optionsMinBidPrice" value={formData.optionsMinBidPrice} onChange={handleChange} />
                                            <div className="hidden md:block"></div>

                                            <SelectField label="Options Index Short Selling Allowed (Sell First and Buy later)" name="optionsIndexShortSelling" value={formData.optionsIndexShortSelling} onChange={handleChange} options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} />
                                            <SelectField label="Options Equity Short Selling Allowed (Sell First and Buy later)" name="optionsEquityShortSelling" value={formData.optionsEquityShortSelling} onChange={handleChange} options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} />
                                            <SelectField label="MCX Options Short Selling Allowed (Sell First and Buy later)" name="optionsMcxShortSelling" value={formData.optionsMcxShortSelling} onChange={handleChange} options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} />
                                            <div className="hidden md:block"></div>

                                            <InputField label="Minimum lot size required per single trade of Equity Options" name="optionsEquityMinLot" value={formData.optionsEquityMinLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of Equity Options" name="optionsEquityMaxLot" value={formData.optionsEquityMaxLot} onChange={handleChange} />

                                            <InputField label="Minimum lot size required per single trade of Equity INDEX Options" name="optionsIndexMinLot" value={formData.optionsIndexMinLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of Equity INDEX Options" name="optionsIndexMaxLot" value={formData.optionsIndexMaxLot} onChange={handleChange} />

                                            <InputField label="Minimum lot size required per single trade of MCX Options" name="optionsMcxMinLot" value={formData.optionsMcxMinLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of MCX Options" name="optionsMcxMaxLot" value={formData.optionsMcxMaxLot} onChange={handleChange} />

                                            <InputField label="Maximum lot size allowed per scrip of Equity Options to be actively open at a time" name="optionsEquityMaxScrip" value={formData.optionsEquityMaxScrip} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per scrip of Equity INDEX Options to be actively open at a time" name="optionsIndexMaxScrip" value={formData.optionsIndexMaxScrip} onChange={handleChange} />

                                            <InputField label="Maximum lot size allowed per scrip of MCX Options to be actively open at a time" name="optionsMcxMaxScrip" value={formData.optionsMcxMaxScrip} onChange={handleChange} />
                                            <div className="hidden md:block"></div>

                                            <InputField label="Max Size All Equity Options" name="optionsMaxEquitySizeAll" value={formData.optionsMaxEquitySizeAll} onChange={handleChange} />
                                            <InputField label="Max Size All Index Options" name="optionsMaxIndexSizeAll" value={formData.optionsMaxIndexSizeAll} onChange={handleChange} />
                                            <InputField label="Max Size All MCX Options" name="optionsMaxMcxSizeAll" value={formData.optionsMaxMcxSizeAll} onChange={handleChange} />
                                            <div className="hidden md:block"></div>

                                            <InputField
                                                label="Intraday Exposure/Margin Options Index"
                                                name="optionsIndexIntraday"
                                                value={formData.optionsIndexIntraday}
                                                onChange={handleChange}
                                                hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade divided by Exposure is required margin. e.g. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade."
                                            />
                                            <InputField
                                                label="Holding Exposure/Margin Options Index"
                                                name="optionsIndexHolding"
                                                value={formData.optionsIndexHolding}
                                                onChange={handleChange}
                                                hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient."
                                            />

                                            <InputField
                                                label="Intraday Exposure/Margin Options Equity"
                                                name="optionsEquityIntraday"
                                                value={formData.optionsEquityIntraday}
                                                onChange={handleChange}
                                                hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade divided by Exposure is required margin. e.g. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade."
                                            />
                                            <InputField
                                                label="Holding Exposure/Margin Options Equity"
                                                name="optionsEquityHolding"
                                                value={formData.optionsEquityHolding}
                                                onChange={handleChange}
                                                hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient."
                                            />

                                            <InputField
                                                label="Intraday Exposure/Margin Options MCX"
                                                name="optionsMcxIntraday"
                                                value={formData.optionsMcxIntraday}
                                                onChange={handleChange}
                                                hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade divided by Exposure is required margin. e.g. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade."
                                            />
                                            <InputField
                                                label="Holding Exposure/Margin Options MCX"
                                                name="optionsMcxHolding"
                                                value={formData.optionsMcxHolding}
                                                onChange={handleChange}
                                                hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient."
                                            />

                                            <InputField label="Orders to be away by % from current price in Options" name="optionsOrdersAway" value={formData.optionsOrdersAway} onChange={handleChange} />
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* KYC / DOCUMENT VERIFICATION */}
                                    <fieldset className="border-none p-0 m-0">
                                        <div className="flex items-center gap-3 mb-8 px-2">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                                <ShieldCheck className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-[20px] font-black text-white uppercase tracking-tight">Kyc / Document Verification</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Official Identity & Compliance Documents</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                                            {/* PAN Card */}
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Card Image</label>
                                                <div className="relative group cursor-pointer">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        id="doc-pan"
                                                        onChange={(e) => handleNestedChange('documents', 'panCard', e.target.files[0])}
                                                    />
                                                    <label htmlFor="doc-pan" className="flex flex-col items-center justify-center h-48 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-black/60 transition-all group overflow-hidden cursor-pointer">
                                                        {formData.documents.panCard ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                    <Check className="w-6 h-6 text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-green-400 font-black uppercase tracking-widest px-4 text-center">{formData.documents.panCard.name}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all">
                                                                    <FileUp className="w-6 h-6 text-slate-600 group-hover:text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Upload PAN Card</span>
                                                                <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase underline">Click to Browse</p>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Aadhaar Front */}
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar Card (Front)</label>
                                                <div className="relative group cursor-pointer">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        id="doc-aadhaar-f"
                                                        onChange={(e) => handleNestedChange('documents', 'aadhaarFront', e.target.files[0])}
                                                    />
                                                    <label htmlFor="doc-aadhaar-f" className="flex flex-col items-center justify-center h-48 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-black/60 transition-all group overflow-hidden cursor-pointer">
                                                        {formData.documents.aadhaarFront ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                    <Check className="w-6 h-6 text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-green-400 font-black uppercase tracking-widest px-4 text-center">{formData.documents.aadhaarFront.name}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all">
                                                                    <FileUp className="w-6 h-6 text-slate-600 group-hover:text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Aadhaar (Front Side)</span>
                                                                <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase underline">Click to Browse</p>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Aadhaar Back */}
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar Card (Back)</label>
                                                <div className="relative group cursor-pointer">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        id="doc-aadhaar-b"
                                                        onChange={(e) => handleNestedChange('documents', 'aadhaarBack', e.target.files[0])}
                                                    />
                                                    <label htmlFor="doc-aadhaar-b" className="flex flex-col items-center justify-center h-48 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-black/60 transition-all group overflow-hidden cursor-pointer">
                                                        {formData.documents.aadhaarBack ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                    <Check className="w-6 h-6 text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-green-400 font-black uppercase tracking-widest px-4 text-center">{formData.documents.aadhaarBack.name}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all">
                                                                    <FileUp className="w-6 h-6 text-slate-600 group-hover:text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Aadhaar (Back Side)</span>
                                                                <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase underline">Click to Browse</p>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Bank Statement */}
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Proof (Statement/Cheque)</label>
                                                <div className="relative group cursor-pointer">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        id="doc-bank"
                                                        onChange={(e) => handleNestedChange('documents', 'bankStatement', e.target.files[0])}
                                                    />
                                                    <label htmlFor="doc-bank" className="flex flex-col items-center justify-center h-48 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-black/60 transition-all group overflow-hidden cursor-pointer">
                                                        {formData.documents.bankStatement ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                    <Check className="w-6 h-6 text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-green-400 font-black uppercase tracking-widest px-4 text-center">{formData.documents.bankStatement.name}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all">
                                                                    <FileUp className="w-6 h-6 text-slate-600 group-hover:text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Bank Proof / Cheque</span>
                                                                <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase underline">Click to Browse</p>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Address Proof */}
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Proof</label>
                                                <div className="relative group cursor-pointer">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        id="doc-address"
                                                        onChange={(e) => handleNestedChange('documents', 'addressProof', e.target.files[0])}
                                                    />
                                                    <label htmlFor="doc-address" className="flex flex-col items-center justify-center h-48 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-black/60 transition-all group overflow-hidden cursor-pointer">
                                                        {formData.documents.addressProof ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                    <Check className="w-6 h-6 text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-green-400 font-black uppercase tracking-widest px-4 text-center">{formData.documents.addressProof.name}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all">
                                                                    <FileUp className="w-6 h-6 text-slate-600 group-hover:text-green-400" />
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Utility Bill / Rent</span>
                                                                <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase underline">Click to Browse</p>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* OTHER SECTION */}
                                    <fieldset className="border-none p-0 m-0 pb-10">
                                        <SectionHeader title="Other:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                                            <InputField label="Notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="" />
                                            <SelectField label="Broker" name="broker" value={formData.broker} onChange={handleChange} options={[{ value: '3761 : demo001', label: '3761 : demo001' }]} />
                                            <InputField label="Transaction Password" name="transactionPassword" value={formData.transactionPassword} onChange={handleChange} type="password" />
                                        </div>

                                        {/* Save Button */}
                                        <div className="pt-4 px-2">
                                            {saveError && (
                                                <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded px-4 py-2 text-sm">
                                                    {saveError}
                                                </div>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-12 py-3 text-white rounded font-bold text-sm uppercase transition-all shadow-md active:scale-95 hover:bg-[#43a047] disabled:opacity-60"
                                                style={{ background: '#5cb85c' }}
                                            >
                                                {loading ? 'UPDATING...' : 'UPDATE CLIENT'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="ml-4 px-12 py-3 text-white rounded font-bold text-sm uppercase transition-all shadow-md active:scale-95 bg-slate-600 hover:bg-slate-700"
                                            >
                                                CANCEL
                                            </button>
                                        </div>
                                    </fieldset>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default UpdateClientPage;
