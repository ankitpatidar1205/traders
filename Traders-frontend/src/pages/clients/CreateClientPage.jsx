import React, { useState, useEffect, useRef } from 'react';
import { X, Save, ArrowLeft, Info, Check, Lock, Key, Settings, User, ChevronDown, FileUp, ShieldCheck, FileText } from 'lucide-react';
import * as api from '../../services/api';

const ScripField = ({ label, value, onChange, hint, name }) => (
    <div className="mb-4">
        <label htmlFor={name} className="text-sm uppercase font-bold tracking-wider" style={{ color: '#bcc0cf' }}>{label}</label>
        <input
            id={name}
            type="text"
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-slate-700 py-1 text-white focus:outline-none focus:border-[#4caf50] transition-colors text-sm"
            placeholder="0"
            style={{ color: 'white' }}
        />
        {hint && <p className="text-[12px] mt-1" style={{ color: '#bcc0cf' }}>{hint}</p>}
    </div>
);

const FieldLegend = ({ title }) => (
    <legend className="text-lg font-bold mb-4 border-none pt-4 bg-[#1a2035]/50 px-2 rounded tracking-wider" style={{ color: '#bcc0cf' }}>
        {title}:
    </legend>
);

const InputField = ({ label, name, value, onChange, type = "text", placeholder, hint }) => (
    <div className="mb-4 group px-2">
        <label htmlFor={name} className="block text-sm mb-1 font-light" style={{ color: '#bcc0cf' }}>
            {label}
        </label>
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent border-b border-slate-700 py-1 text-white focus:outline-none focus:border-[#4caf50] transition-colors text-sm"
        />
        {hint && <p id={`${name}-hint`} className="text-sm mt-2 font-light leading-snug" style={{ color: '#bcc0cf' }}>{hint}</p>}
    </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
    <label htmlFor={name} className="flex items-center gap-3 cursor-pointer group mb-6 px-2">
        <div className="relative flex items-center justify-center">
            <input
                id={name}
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="appearance-none w-5 h-5 border border-slate-600 rounded-sm checked:bg-[#4caf50] checked:border-[#4caf50] transition-all cursor-pointer"
            />
            {checked && <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none" />}
        </div>
        <span className="text-sm group-hover:text-white transition-colors" style={{ color: '#bcc0cf' }}>{label}</span>
    </label>
);

const SelectField = ({ label, name, options, value, onChange, hint }) => (
    <div className="mb-8 group px-2">
        <label htmlFor={name} className="block text-sm mb-1 font-light" style={{ color: '#bcc0cf' }}>
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
                    <option key={opt.value} value={opt.value} className="bg-white text-black font-bold">{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#4caf50] transition-colors">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
        {hint && <p className="text-[12px] mt-2 font-light leading-snug" style={{ color: '#8b8f9a' }}>{hint}</p>}
    </div>
);

const CreateClientPage = ({ client, onClose, onSave, onLogout, onNavigate }) => {
    const [formData, setFormData] = useState({
        // 1. Personal Details
        fullName: client?.fullName || '',
        mobile: '',
        username: client?.username || '',
        password: '',
        initialFunds: '0',
        city: '',

        // 2. Config
        isDemoAccount: client?.demoAccount === 'Yes' || false,
        allowFreshEntry: false,
        allowOrdersBetweenHL: true,
        tradeEquityUnits: false,
        accountStatus: 'Active',
        autoCloseTrades: false,
        autoClosePercentage: '90',
        notifyPercentage: '70',
        minTimeToBookProfit: '120',
        scalpingStopLoss: 'Disabled',

        // 3. MCX Futures
        mcxTrading: true,
        mcxMinLot: '1',
        mcxMaxLot: '100',
        mcxMaxLotScrip: '1000',
        mcxMaxSizeAll: '5000',
        mcxBrokerageType: 'per_crore',
        mcxBrokerage: '800',
        mcxExposureType: 'per_turnover',
        mcxIntradayMargin: '500',
        mcxHoldingMargin: '100',
        mcxLotMargins: {
            BULLDEX: { INTRADAY: '0', HOLDING: '0' },
            GOLD: { INTRADAY: '0', HOLDING: '0' },
            SILVER: { INTRADAY: '0', HOLDING: '0' },
            CRUDEOIL: { INTRADAY: '0', HOLDING: '0' },
            'CRUDEOIL MINI': { INTRADAY: '0', HOLDING: '0' },
            COPPER: { INTRADAY: '0', HOLDING: '0' },
            NICKEL: { INTRADAY: '0', HOLDING: '0' },
            ZINC: { INTRADAY: '0', HOLDING: '0' },
            ZINCMINI: { INTRADAY: '0', HOLDING: '0' },
            LEAD: { INTRADAY: '0', HOLDING: '0' },
            LEADMINI: { INTRADAY: '0', HOLDING: '0' },
            ALUMINIUM: { INTRADAY: '0', HOLDING: '0' },
            ALUMINI: { INTRADAY: '0', HOLDING: '0' },
            NATURALGAS: { INTRADAY: '0', HOLDING: '0' },
            'NATURALGAS MINI': { INTRADAY: '0', HOLDING: '0' },
            MENTHAOIL: { INTRADAY: '0', HOLDING: '0' },
            COTTON: { INTRADAY: '0', HOLDING: '0' },
            GOLDM: { INTRADAY: '0', HOLDING: '0' },
            SILVERM: { INTRADAY: '0', HOLDING: '0' },
            'SILVER MIC': { INTRADAY: '0', HOLDING: '0' }
        },
        mcxLotBrokerage: {
            GOLDM: '0', SILVERM: '0', BULLDEX: '0', GOLD: '0', SILVER: '0', CRUDEOIL: '0',
            COPPER: '0', NICKEL: '0', ZINC: '0', LEAD: '0', NATURALGAS: '0', 'NATURALGAS MINI': '0',
            ALUMINIUM: '0', MENTHAOIL: '0', COTTON: '0', 'SILVER MIC': '0', ZINCMINI: '0',
            ALUMINI: '0', LEADMINI: '0', 'CRUDEOIL MINI': '0'
        },
        bidGaps: {
            GOLDM: '1', SILVERM: '1', BULLDEX: '1', GOLD: '1', SILVER: '1',
            CRUDEOIL: '1', COPPER: '1', NICKEL: '1', ZINC: '1', LEAD: '1',
            NATURALGAS: '1', 'NATURALGAS MINI': '1', ALUMINIUM: '1', MENTHAOIL: '1',
            COTTON: '1', 'SILVER MIC': '1', ZINCMINI: '1', ALUMINI: '1',
            LEADMINI: '1', 'CRUDEOIL MINI': '1'
        },

        // 4. Equity Futures
        equityTrading: true,
        equityBrokerage: '800',
        equityMinLot: '1',
        equityMaxLot: '100',
        equityMinIndexLot: '1',
        equityMaxIndexLot: '100',
        equityMaxScrip: '500',
        equityMaxIndexScrip: '500',
        equityMaxSizeAll: '2000',
        equityMaxSizeAllIndex: '2000',
        equityIntradayMargin: '500',
        equityHoldingMargin: '100',
        equityOrdersAway: '5',

        // 5. Options Config
        indexOptionsTrading: true,
        equityOptionsTrading: true,
        mcxOptionsTrading: false,
        optionsIndexBrokerageType: 'per_lot',
        optionsIndexBrokerage: '20',
        optionsEquityBrokerageType: 'per_lot',
        optionsEquityBrokerage: '20',
        optionsMcxBrokerageType: 'per_lot',
        optionsMcxBrokerage: '20',
        optionsMinBidPrice: '1',
        optionsIndexShortSelling: 'No',
        optionsEquityShortSelling: 'No',
        optionsMcxShortSelling: 'No',
        optionsEquityMinLot: '0',
        optionsEquityMaxLot: '50',
        optionsIndexMinLot: '0',
        optionsIndexMaxLot: '20',
        optionsMcxMinLot: '0',
        optionsMcxMaxLot: '50',
        optionsEquityMaxScrip: '200',
        optionsIndexMaxScrip: '200',
        optionsMcxMaxScrip: '200',
        optionsMaxEquitySizeAll: '200',
        optionsMaxIndexSizeAll: '200',
        optionsMaxMcxSizeAll: '200',
        optionsIndexIntraday: '5',
        optionsIndexHolding: '2',
        optionsEquityIntraday: '5',
        optionsEquityHolding: '2',
        optionsMcxIntraday: '5',
        optionsMcxHolding: '2',
        optionsOrdersAway: '10',


        // 6. Expiry Rules
        autoSquareOff: 'No',

        expirySquareOffTime: '11:30',
        allowExpiringScrip: 'No',
        daysBeforeExpiry: '0',
        mcxOptionsAwayPoints: {
            MCXBULLDEX: '0', GOLD: '0', SILVER: '0', CRUDEOIL: '0', COPPER: '0',
            NICKEL: '0', ZINC: '0', LEAD: '0', NATURALGAS: '0', MENTHAOIL: '0',
            COTTON: '0', GOLDM: '0', SILVERM: '0', 'SILVER MIC': '0'
        },

        // 7. Other
        notes: '',
        broker: client?.broker || '',
        transactionPassword: '',

        // 8. Kyc / Documents
        documents: {
            panCard: null,
            aadhaarFront: null,
            aadhaarBack: null,
            bankStatement: null,
            additionalDoc: null
        },
        kycStatus: 'Pending'
    });

    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [brokers, setBrokers] = useState([]);
    const profileRef = useRef(null);

    // Fetch brokers for dropdown
    useEffect(() => {
        const fetchBrokers = async () => {
            try {
                const data = await api.getClients({ role: 'BROKER' });
                setBrokers(data || []);
            } catch (err) {
                console.error('Failed to fetch brokers:', err);
            }
        };
        fetchBrokers();
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

    const isKycValid = () => {
        return (
            formData.documents.panCard &&
            formData.documents.aadhaarFront &&
            formData.documents.aadhaarBack &&
            formData.documents.bankStatement
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveError('');
        try {
            // Step 1: Create user with basic fields
            const result = await api.createClient({
                fullName: formData.fullName,
                username: formData.username,
                password: formData.password,
                mobile: formData.mobile,
                city: formData.city,
                creditLimit: formData.initialFunds || 0,
                role: 'TRADER'
            });
            const userId = result.id;

            // Step 2: Update user profile with extra fields
            await api.updateUser(userId, {
                isDemo: formData.isDemoAccount,
                status: formData.accountStatus || 'Active',
                exposureMultiplier: 1
            });

            // Step 3: Save client settings + ALL config as JSON (MCX, Equity, Options, Expiry, etc.)
            const configToSave = { ...formData };
            // Remove files from config (they go to documents endpoint)
            delete configToSave.documents;
            delete configToSave.password;

            await api.updateClientSettings(userId, {
                allowFreshEntry: formData.allowFreshEntry,
                allowOrdersBetweenHL: formData.allowOrdersBetweenHL,
                tradeEquityUnits: formData.tradeEquityUnits,
                autoClosePct: formData.autoClosePercentage,
                notifyPct: formData.notifyPercentage,
                minProfitTime: formData.minTimeToBookProfit,
                scalpingSlEnabled: formData.scalpingStopLoss,
                config: configToSave
            });

            // Step 4: Set transaction password if provided
            if (formData.transactionPassword) {
                await api.updateUserPasswords(userId, {
                    transactionPassword: formData.transactionPassword
                });
            }

            // Step 5: Upload KYC documents if any files selected
            const docs = formData.documents;
            if (docs.panCard || docs.aadhaarFront || docs.aadhaarBack || docs.bankStatement) {
                const docFormData = new FormData();
                if (docs.panCard)      docFormData.append('panScreenshot', docs.panCard);
                if (docs.aadhaarFront) docFormData.append('aadharFront', docs.aadhaarFront);
                if (docs.aadhaarBack)  docFormData.append('aadharBack', docs.aadhaarBack);
                if (docs.bankStatement) docFormData.append('bankProof', docs.bankStatement);
                docFormData.append('kycStatus', 'PENDING');
                await api.updateDocuments(userId, docFormData);
            }

            // Step 6: Assign broker if selected
            // Broker info is stored in config_json already

            onSave(formData);
        } catch (err) {
            setSaveError(err.message || 'Failed to create client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-50 flex flex-col overflow-hidden">
            {/* Top Bar - Green as per screenshot */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-4 shadow-md shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-white hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
                    >
                        <i className="fa-solid fa-arrow-left text-[18px]"></i>
                        <span className="text-[14px] font-bold uppercase tracking-tight">Back</span>
                    </button>
                </div>
                <div className="flex items-center gap-4 text-white">
                    <button className="hover:bg-black/10 p-1 rounded-full transition-colors">
                        <Settings className="w-5 h-5 mx-1" />
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
                {/* Sidebar Placeholder (matches screenshot) */}
                <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-2 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-widest pb-4 mb-2 border-b border-white/5">Dashboard</div>
                    {[
                        { icon: 'fa-table-columns', label: 'DashBoard' },
                        { icon: 'fa-chart-line', label: 'Market Watch' },
                        { icon: 'fa-bell', label: 'Notifications' },
                        { icon: 'fa-list-ul', label: 'Action Ledger' },
                        { icon: 'fa-briefcase', label: 'Active Positions' },
                        { icon: 'fa-box-archive', label: 'Closed Positions' },
                        { icon: 'fa-user-tie', label: 'Trading Clients' },
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
                            className={`text-slate-400 text-sm flex items-center justify-between py-2 px-3 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.label === 'Trading Clients' ? 'bg-[#4caf50] text-white' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 flex items-center justify-center opacity-70">
                                    <span className={`fa-solid ${item.icon} text-xs`}></span>
                                </div>
                                <span className="truncate">{item.label}</span>
                            </div>
                            {item.label === 'Market Watch' && <span className="text-[10px] opacity-60" style={{ color: '#bcc0cf' }}>{new Date().toLocaleTimeString()}</span>}
                        </div>
                    ))}
                    <div className="mt-auto px-4 py-4 mt-2 border-t border-white/10 bg-black/20 rounded-md">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Local Node IP</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[9px] font-black text-green-500 uppercase">Secure</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-network-wired text-slate-500 text-[10px]"></i>
                            <span className="text-[13px] font-mono font-black text-[#01B4EA] tracking-tighter">152.58.28.60</span>
                        </div>
                    </div>
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
                                    Create Trading Client:
                                </h2>
                            </div>
                            {/* The 3D fold decorator */}
                            <div className="w-4 h-4 bg-[#388e3c] -mt-2 ml-2 rounded-sm rotate-45 relative z-0"></div>
                        </div>

                        {/* Main Card */}
                        <div className="bg-[#202940] rounded shadow-2xl p-8 pt-16 border border-white/5">
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-12">

                                    {/* PERSONAL DETAILS */}
                                    <fieldset className="border-none p-0 m-0">
                                        <h3 className="text-[20px] font-normal mb-8 px-2" style={{ color: '#bcc0cf' }}>Personal Details:</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                                            <InputField
                                                label="Name"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder=""
                                                hint="Insert Real name of the trader. Will be visible in trading App"
                                            />
                                            <InputField
                                                label="Mobile"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                placeholder=""
                                                hint="Optional"
                                            />
                                            <InputField
                                                label="Username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder=""
                                                hint="username for loggin-in with, is not case sensitive. must be unique for every trader. should not contain symbols."
                                            />
                                            <InputField
                                                label="Password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                type="text"
                                                placeholder=""
                                                hint="password for loggin-in with, is case sensitive. Leave Blank if you want password remain unchanged."
                                            />
                                            <InputField
                                                label="City"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder=""
                                                hint="Optional"
                                            />
                                            <InputField
                                                label="Min. Time to book profit (No. of Seconds)"
                                                name="minTimeToBookProfit"
                                                value={formData.minTimeToBookProfit}
                                                onChange={handleChange}
                                                placeholder="120"
                                                hint="Example: 120, will hold the trade for 2 minutes before closing a trade in profit"
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
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* CONFIG */}
                                    <fieldset className="border-none p-0 m-0">
                                        <FieldLegend title="Config" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                            <div className="space-y-2">
                                                <CheckboxField label="demo account?" name="isDemoAccount" checked={formData.isDemoAccount} onChange={handleChange} />
                                                <CheckboxField label="Allow Fresh Entry Order above high & below low?" name="allowFreshEntry" checked={formData.allowFreshEntry} onChange={handleChange} />
                                                <CheckboxField label="Allow Orders between High - Low?" name="allowOrdersBetweenHL" checked={formData.allowOrdersBetweenHL} onChange={handleChange} />
                                                <CheckboxField label="Trade equity as units instead of lots." name="tradeEquityUnits" checked={formData.tradeEquityUnits} onChange={handleChange} />
                                                <CheckboxField label="Account Status" name="accountStatus" checked={formData.accountStatus === 'Active'} onChange={(e) => setFormData(prev => ({ ...prev, accountStatus: e.target.checked ? 'Active' : 'Inactive' }))} />
                                                <CheckboxField label="Auto Close Trades if condition met" name="autoCloseTrades" checked={formData.autoCloseTrades} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-0">
                                                <InputField label="auto-Close all active trades when the losses reach % of Ledger-balance" name="autoClosePercentage" value={formData.autoClosePercentage} onChange={handleChange} placeholder="90" hint="Example: 95, will close when losses reach 95% of ledger balance" />
                                                <InputField label="Notify client when the losses reach % of Ledger-balance" name="notifyPercentage" value={formData.notifyPercentage} onChange={handleChange} placeholder="70" hint="Example: 70, will send notification to customer every 5-minutes until losses cross 70% of ledger balance" />
                                                <InputField label="Min. Time to book profit (No. of Seconds)" name="minTimeToBookProfit" value={formData.minTimeToBookProfit} onChange={handleChange} placeholder="120" hint="Example: 120, will hold the trade for 2 minutes before closing a trade in profit" />
                                            </div>
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* MCX FUTURES */}
                                    <fieldset className="border-none p-0 m-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <FieldLegend title="MCX Futures" />
                                            <div className="flex items-center gap-4 bg-[#1a2035] px-6 py-3 rounded-lg border border-white/5 h-12">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Status</span>
                                                <CheckboxField label="" name="mcxTrading" checked={formData.mcxTrading} onChange={handleChange} />
                                                <span className={`text-xs font-black uppercase tracking-widest ${formData.mcxTrading ? 'text-[#4caf50]' : 'text-slate-600'}`}>{formData.mcxTrading ? 'ENABLED' : 'DISABLED'}</span>
                                            </div>
                                        </div>

                                        {formData.mcxTrading && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 animate-in fade-in slide-in-from-top-2 duration-500">
                                                <InputField label="Minimum lot size required per single trade of MCX" name="mcxMinLot" value={formData.mcxMinLot} onChange={handleChange} placeholder="0" />
                                                <InputField label="Maximum lot size allowed per single trade of MCX" name="mcxMaxLot" value={formData.mcxMaxLot} onChange={handleChange} placeholder="20" />
                                                <InputField label="Maximum lot size allowed per script of MCX to be actively open at a time" name="mcxMaxLotScrip" value={formData.mcxMaxLotScrip} onChange={handleChange} placeholder="50" />
                                                <InputField label="Max Size All Commodity" name="mcxMaxSizeAll" value={formData.mcxMaxSizeAll} onChange={handleChange} placeholder="100" />

                                                <SelectField
                                                    label="Mcx Brokerage Type"
                                                    name="mcxBrokerageType"
                                                    value={formData.mcxBrokerageType}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: 'per_crore', label: 'Per Crore Basis' },
                                                        { value: 'per_lot', label: 'Per Lot Basis' }
                                                    ]}
                                                />
                                                {formData.mcxBrokerageType === 'per_crore' && (
                                                    <InputField label="MCX brokerage" name="mcxBrokerage" value={formData.mcxBrokerage} onChange={handleChange} placeholder="800" />
                                                )}

                                                <SelectField
                                                    label="Exposure Mcx Type"
                                                    name="mcxExposureType"
                                                    value={formData.mcxExposureType}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: 'per_turnover', label: 'Per Turnover Basis' },
                                                        { value: 'per_lot', label: 'Per Lot Basis' }
                                                    ]}
                                                />

                                                {formData.mcxExposureType === 'per_turnover' && (
                                                    <>
                                                        <InputField label="Intraday Exposure/Margin MCX" name="mcxIntradayMargin" value={formData.mcxIntradayMargin} onChange={handleChange} placeholder="500" hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade devided by Exposure is required margin. eg. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade." />
                                                        <InputField label="Holding Exposure/Margin MCX" name="mcxHoldingMargin" value={formData.mcxHoldingMargin} onChange={handleChange} placeholder="100" hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade devided by Exposure is required margin. eg. if gold having lotsize of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient." />
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* MCX Lot Wise Exposure */}
                                        {formData.mcxExposureType === 'per_lot' && (
                                            <div className="mt-8">
                                                <h4 className="text-sm font-normal mb-8 px-2 border-l-2 border-[#4caf50]" style={{ color: '#bcc0cf' }}>MCX Exposure Lot wise:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                                                    {Object.keys(formData.mcxLotMargins).map((scrip) => (
                                                        <div key={scrip} className="mb-6 grid grid-cols-2 gap-4 items-end">
                                                            <ScripField
                                                                label={`${scrip} Intraday`}
                                                                name={`mcx-intraday-${scrip}`}
                                                                value={formData.mcxLotMargins[scrip].INTRADAY}
                                                                onChange={(e) => handleNestedChange('mcxLotMargins', scrip, e.target.value, 'INTRADAY')}
                                                            />
                                                            <ScripField
                                                                label={`${scrip} Holding`}
                                                                name={`mcx-holding-${scrip}`}
                                                                value={formData.mcxLotMargins[scrip].HOLDING}
                                                                onChange={(e) => handleNestedChange('mcxLotMargins', scrip, e.target.value, 'HOLDING')}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* MCX Lot Wise Brokerage */}
                                        {formData.mcxBrokerageType === 'per_lot' && (
                                            <div className="mt-8">
                                                <h4 className="text-slate-300 text-sm font-normal mb-8 px-2 border-l-2 border-[#4caf50]">MCX Lot Wise Brokerage:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                                                    {Object.keys(formData.mcxLotBrokerage).map((scrip) => (
                                                        <ScripField
                                                            key={scrip}
                                                            label={`${scrip}:`}
                                                            name={`mcx-brokerage-${scrip}`}
                                                            value={formData.mcxLotBrokerage[scrip]}
                                                            onChange={(e) => handleNestedChange('mcxLotBrokerage', scrip, e.target.value)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bid Gaps */}
                                        <div className="mt-8">
                                            <h4 className="text-sm font-normal mb-8 px-2 border-l-2 border-[#4caf50]" style={{ color: '#bcc0cf' }}>Orders to be away by points in each scrip MCX:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                                                {Object.keys(formData.bidGaps).map((commodity) => (
                                                    <ScripField
                                                        key={commodity}
                                                        label={`${commodity.replace('MCX', '')}:`}
                                                        name={`bidgap-${commodity}`}
                                                        value={formData.bidGaps[commodity]}
                                                        onChange={(e) => handleNestedChange('bidGaps', commodity, e.target.value)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* EQUITY FUTURES */}
                                    <fieldset className="border-none p-0 m-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <FieldLegend title="Equity Futures" />
                                            <div className="flex items-center gap-4 bg-[#1a2035] px-6 py-3 rounded-lg border border-white/5 h-12">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Status</span>
                                                <CheckboxField label="" name="equityTrading" checked={formData.equityTrading} onChange={handleChange} />
                                                <span className={`text-xs font-black uppercase tracking-widest ${formData.equityTrading ? 'text-[#4caf50]' : 'text-slate-600'}`}>{formData.equityTrading ? 'ENABLED' : 'DISABLED'}</span>
                                            </div>
                                        </div>

                                        {formData.equityTrading && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 animate-in fade-in slide-in-from-top-2 duration-500">
                                                <InputField label="Equity Brokerage Per Crore" name="equityBrokerage" value={formData.equityBrokerage} onChange={handleChange} placeholder="800" />
                                                <InputField label="Minimum lot size required per single trade of Equity" name="equityMinLot" value={formData.equityMinLot} onChange={handleChange} placeholder="0" />
                                                <InputField label="Maximum lot size allowed per single trade of Equity" name="equityMaxLot" value={formData.equityMaxLot} onChange={handleChange} placeholder="50" />
                                                <InputField label="Minimum lot size required per single trade of Equity INDEX" name="equityMinIndexLot" value={formData.equityMinIndexLot} onChange={handleChange} placeholder="0" />
                                                <InputField label="Maximum lot size allowed per single trade of Equity INDEX" name="equityMaxIndexLot" value={formData.equityMaxIndexLot} onChange={handleChange} placeholder="20" />
                                                <InputField label="Maximum lot size allowed per script of Equity to be actively open at a time" name="equityMaxScrip" value={formData.equityMaxScrip} onChange={handleChange} placeholder="100" />
                                                <InputField label="Maximum lot size allowed per script of Equity INDEX to be actively open at a time" name="equityMaxIndexScrip" value={formData.equityMaxIndexScrip} onChange={handleChange} placeholder="100" />
                                                <InputField label="Max Size All Equity" name="equityMaxSizeAll" value={formData.equityMaxSizeAll} onChange={handleChange} placeholder="100" />
                                                <InputField label="Max Size All Index" name="equityMaxSizeAllIndex" value={formData.equityMaxSizeAllIndex} onChange={handleChange} placeholder="100" />
                                                <InputField label="Intraday Exposure/Margin Equity" name="equityIntradayMargin" value={formData.equityIntradayMargin} onChange={handleChange} placeholder="500" hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade devided by Exposure is required margin. eg. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade." />
                                                <InputField label="Holding Exposure/Margin Equity" name="equityHoldingMargin" value={formData.equityHoldingMargin} onChange={handleChange} placeholder="100" hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient." />
                                                <InputField label="Orders to be away by % from current price Equity" name="equityOrdersAway" value={formData.equityOrdersAway} onChange={handleChange} placeholder="5" />
                                            </div>
                                        )}
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* OPTIONS CONFIG */}
                                    <fieldset className="border-none p-0 m-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <FieldLegend title="Options Config" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-2">
                                            <div className="flex items-center gap-4 bg-[#1a2035] px-6 py-3 rounded-lg border border-white/5 h-12">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Index Status</span>
                                                <CheckboxField label="" name="indexOptionsTrading" checked={formData.indexOptionsTrading} onChange={handleChange} />
                                                <span className={`text-xs font-black uppercase tracking-widest ${formData.indexOptionsTrading ? 'text-[#4caf50]' : 'text-slate-600'}`}>{formData.indexOptionsTrading ? 'ENABLED' : 'DISABLED'}</span>
                                            </div>
                                            <div className="flex items-center gap-4 bg-[#1a2035] px-6 py-3 rounded-lg border border-white/5 h-12">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Equity Status</span>
                                                <CheckboxField label="" name="equityOptionsTrading" checked={formData.equityOptionsTrading} onChange={handleChange} />
                                                <span className={`text-xs font-black uppercase tracking-widest ${formData.equityOptionsTrading ? 'text-[#4caf50]' : 'text-slate-600'}`}>{formData.equityOptionsTrading ? 'ENABLED' : 'DISABLED'}</span>
                                            </div>
                                            <div className="flex items-center gap-4 bg-[#1a2035] px-6 py-3 rounded-lg border border-white/5 h-12">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">MCX Status</span>
                                                <CheckboxField label="" name="mcxOptionsTrading" checked={formData.mcxOptionsTrading} onChange={handleChange} />
                                                <span className={`text-xs font-black uppercase tracking-widest ${formData.mcxOptionsTrading ? 'text-[#4caf50]' : 'text-slate-600'}`}>{formData.mcxOptionsTrading ? 'ENABLED' : 'DISABLED'}</span>
                                            </div>
                                        </div>

                                        {(formData.indexOptionsTrading || formData.equityOptionsTrading || formData.mcxOptionsTrading) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                                {/* Column 1 */}
                                                <div className="space-y-0">
                                                    {formData.indexOptionsTrading && (
                                                        <>
                                                            <SelectField
                                                                label="Options Index Brokerage Type"
                                                                name="optionsIndexBrokerageType"
                                                                value={formData.optionsIndexBrokerageType}
                                                                onChange={handleChange}
                                                                options={[
                                                                    { value: 'per_lot', label: 'Per Lot Basis' },
                                                                    { value: 'per_crore', label: 'Per Crore Basis' }
                                                                ]}
                                                            />
                                                            <InputField label="Options Index brokerage" name="optionsIndexBrokerage" value={formData.optionsIndexBrokerage} onChange={handleChange} placeholder="20" />
                                                            <SelectField
                                                                label="Options Index Short Selling Allowed"
                                                                name="optionsIndexShortSelling"
                                                                value={formData.optionsIndexShortSelling}
                                                                onChange={handleChange}
                                                                options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]}
                                                            />
                                                            <InputField label="Maximum lot size per single trade of INDEX Options" name="optionsIndexMaxLot" value={formData.optionsIndexMaxLot} onChange={handleChange} placeholder="20" />
                                                            <InputField label="Min lot size per single trade of INDEX Options" name="optionsIndexMinLot" value={formData.optionsIndexMinLot} onChange={handleChange} placeholder="0" />
                                                            <InputField label="Intraday Exposure Options Index" name="optionsIndexIntraday" value={formData.optionsIndexIntraday} onChange={handleChange} placeholder="5" />
                                                            <InputField label="Holding Exposure Options Index" name="optionsIndexHolding" value={formData.optionsIndexHolding} onChange={handleChange} placeholder="2" />
                                                        </>
                                                    )}

                                                    {formData.equityOptionsTrading && (
                                                        <>
                                                            <SelectField
                                                                label="Options Equity Brokerage Type"
                                                                name="optionsEquityBrokerageType"
                                                                value={formData.optionsEquityBrokerageType}
                                                                onChange={handleChange}
                                                                options={[
                                                                    { value: 'per_lot', label: 'Per Lot Basis' },
                                                                    { value: 'per_crore', label: 'Per Crore Basis' }
                                                                ]}
                                                            />
                                                            <InputField label="Options Equity brokerage" name="optionsEquityBrokerage" value={formData.optionsEquityBrokerage} onChange={handleChange} placeholder="20" />
                                                            <SelectField
                                                                label="Options Equity Short Selling Allowed"
                                                                name="optionsEquityShortSelling"
                                                                value={formData.optionsEquityShortSelling}
                                                                onChange={handleChange}
                                                                hint="(Sell First and Buy later)"
                                                                options={[
                                                                    { value: 'No', label: 'No' },
                                                                    { value: 'Yes', label: 'Yes' }
                                                                ]}
                                                            />
                                                            <InputField label="Max lot size per single trade of Equity Options" name="optionsEquityMaxLot" value={formData.optionsEquityMaxLot} onChange={handleChange} placeholder="50" />
                                                            <InputField label="Min lot size per single trade of Equity Options" name="optionsEquityMinLot" value={formData.optionsEquityMinLot} onChange={handleChange} placeholder="0" />
                                                            <InputField label="Intraday Exposure Options Equity" name="optionsEquityIntraday" value={formData.optionsEquityIntraday} onChange={handleChange} placeholder="5" />
                                                            <InputField label="Holding Exposure Options Equity" name="optionsEquityHolding" value={formData.optionsEquityHolding} onChange={handleChange} placeholder="2" />
                                                        </>
                                                    )}
                                                </div>

                                                {/* Column 2 */}
                                                <div className="space-y-0">
                                                    {formData.mcxOptionsTrading && (
                                                        <>
                                                            <SelectField
                                                                label="Options MCX Brokerage Type"
                                                                name="optionsMcxBrokerageType"
                                                                value={formData.optionsMcxBrokerageType}
                                                                onChange={handleChange}
                                                                options={[
                                                                    { value: 'per_lot', label: 'Per Lot Basis' },
                                                                    { value: 'per_crore', label: 'Per Crore Basis' }
                                                                ]}
                                                            />
                                                            <InputField label="Options MCX brokerage" name="optionsMcxBrokerage" value={formData.optionsMcxBrokerage} onChange={handleChange} placeholder="20" />
                                                            <SelectField
                                                                label="MCX Options Short Selling Allowed"
                                                                name="optionsMcxShortSelling"
                                                                value={formData.optionsMcxShortSelling}
                                                                onChange={handleChange}
                                                                options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]}
                                                            />
                                                            <InputField label="Max lot size per single trade of MCX Options" name="optionsMcxMaxLot" value={formData.optionsMcxMaxLot} onChange={handleChange} placeholder="50" />
                                                            <InputField label="Min lot size per single trade of MCX Options" name="optionsMcxMinLot" value={formData.optionsMcxMinLot} onChange={handleChange} placeholder="0" />
                                                            <InputField label="Intraday Exposure Options MCX" name="optionsMcxIntraday" value={formData.optionsMcxIntraday} onChange={handleChange} placeholder="5" />
                                                            <InputField label="Holding Exposure Options MCX" name="optionsMcxHolding" value={formData.optionsMcxHolding} onChange={handleChange} placeholder="2" />
                                                        </>
                                                    )}
                                                    <InputField label="Options Min. Bid Price" name="optionsMinBidPrice" value={formData.optionsMinBidPrice} onChange={handleChange} placeholder="1" />
                                                    <InputField label="Orders to be away from current price" name="optionsOrdersAway" value={formData.optionsOrdersAway} onChange={handleChange} placeholder="10" />
                                                    <InputField label="Max Size All Equity Options" name="optionsMaxEquitySizeAll" value={formData.optionsMaxEquitySizeAll} onChange={handleChange} placeholder="200" />
                                                    <InputField label="Max Size All Index Options" name="optionsMaxIndexSizeAll" value={formData.optionsMaxIndexSizeAll} onChange={handleChange} placeholder="200" />
                                                    <InputField label="Max Size All MCX Options" name="optionsMaxMcxSizeAll" value={formData.optionsMaxMcxSizeAll} onChange={handleChange} placeholder="200" />
                                                    <InputField label="Maximum lot size allowed per scrip of Equity Options to be actively open at a time" name="optionsEquityMaxScrip" value={formData.optionsEquityMaxScrip} onChange={handleChange} placeholder="200" />
                                                    <InputField label="Maximum lot size allowed per scrip of Equity INDEX Options to be actively open at a time" name="optionsIndexMaxScrip" value={formData.optionsIndexMaxScrip} onChange={handleChange} placeholder="200" />
                                                    <InputField label="Maximum lot size allowed per scrip of MCX Options to be actively open at a time" name="optionsMcxMaxScrip" value={formData.optionsMcxMaxScrip} onChange={handleChange} placeholder="200" />
                                                </div>
                                            </div>
                                        )}
                                    </fieldset>


                                    <hr className="border-white/5" />

                                    {/* KYC / DOCUMENT VERIFICATION */}
                                    <fieldset className="border-none p-0 m-0">
                                        <div className="flex items-center gap-3 mb-8 px-2">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                                <ShieldCheck className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <div className="flex-1 flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-[20px] font-black text-white uppercase tracking-tight">Kyc / Document Verification <span className="text-red-500 text-sm ml-2">* Mandatory</span></h3>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Official Identity & Compliance Documents</p>
                                                </div>
                                                <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-1 rounded-full">
                                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">STATUS: {formData.kycStatus}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
                                            {[
                                                { key: 'panCard', label: 'PAN Card', id: 'doc-pan' },
                                                { key: 'aadhaarFront', label: 'Aadhaar Front', id: 'doc-aadhaar-f' },
                                                { key: 'aadhaarBack', label: 'Aadhaar Back', id: 'doc-aadhaar-b' },
                                                { key: 'bankStatement', label: 'Bank Proof / Cheque', id: 'doc-bank' }
                                            ].map(doc => {
                                                const file = formData.documents[doc.key];
                                                const hasFile = file instanceof File;
                                                const isPdf = hasFile && file.type === 'application/pdf';
                                                return (
                                                    <div key={doc.key} className="space-y-3">
                                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{doc.label}</label>
                                                        <div className="relative group cursor-pointer">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                id={doc.id}
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => handleNestedChange('documents', doc.key, e.target.files[0])}
                                                            />
                                                            <label htmlFor={doc.id} className="flex flex-col items-center justify-center h-48 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-black/60 transition-all group overflow-hidden cursor-pointer">
                                                                {hasFile ? (
                                                                    <div className="w-full h-full relative flex flex-col items-center justify-center gap-2">
                                                                        {isPdf ? (
                                                                            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-red-900/20 rounded-2xl">
                                                                                <FileText className="w-16 h-16 text-red-400 opacity-50" />
                                                                            </div>
                                                                        ) : file.type?.startsWith('image/') ? (
                                                                            <img src={URL.createObjectURL(file)} alt={doc.label} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-70" />
                                                                        ) : null}
                                                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                                                            <div className="w-10 h-10 rounded-full bg-green-500/30 backdrop-blur flex items-center justify-center">
                                                                                <Check className="w-5 h-5 text-green-400" />
                                                                            </div>
                                                                            <span className="text-[9px] font-black text-green-300 bg-black/60 px-2 py-1 rounded max-w-[120px] truncate">{file.name}</span>
                                                                            <span className="text-[8px] text-slate-400">Click to change</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <FileUp className="w-10 h-10 text-slate-600 group-hover:text-green-500 transition-colors mb-4" />
                                                                        <span className="text-[11px] font-black text-slate-500 group-hover:text-green-500 uppercase tracking-[0.2em]">Select Document</span>
                                                                    </>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-12 space-y-8 bg-black/20 p-8 rounded-2xl border border-white/5">
                                            {/* Row 1: Notes & Broker */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                                <div className="group">
                                                    <label className="block text-sm mb-1 font-light" style={{ color: '#bcc0cf' }}>Notes</label>
                                                    <input
                                                        type="text"
                                                        name="notes"
                                                        value={formData.notes}
                                                        onChange={handleChange}
                                                        className="w-full bg-transparent border-b border-white/10 py-1 text-white focus:outline-none focus:border-[#4caf50] transition-colors text-sm"
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label className="block text-sm mb-1 font-light" style={{ color: '#bcc0cf' }}>Broker</label>
                                                    <select
                                                        name="broker"
                                                        value={formData.broker}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-slate-200 py-2.5 px-3 text-black font-bold outline-none rounded-sm text-sm"
                                                    >
                                                        <option value="">Select Broker</option>
                                                        {brokers.map(b => (
                                                            <option key={b.id} value={`${b.id} : ${b.username}`}>
                                                                {b.id} : {b.username} ({b.full_name || b.fullName || ''})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 2: Transaction Password */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 items-end">
                                                <div className="group">
                                                    <label className="block text-sm mb-1 font-light" style={{ color: '#bcc0cf' }}>Transaction Password</label>
                                                    <input
                                                        type="password"
                                                        name="transactionPassword"
                                                        value={formData.transactionPassword}
                                                        onChange={handleChange}
                                                        className="w-full bg-transparent border-b border-white/10 py-1 text-white focus:outline-none focus:border-[#4caf50] transition-colors text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Save Button */}
                                            <div className="pt-4 flex items-center gap-4 flex-wrap">
                                                {saveError && (
                                                    <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 rounded px-4 py-2 text-sm mb-2">
                                                        {saveError}
                                                    </div>
                                                )}
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className={`px-10 py-2.5 text-white rounded font-bold text-sm uppercase transition-all shadow-md active:scale-95 ${loading ? 'bg-slate-600 cursor-not-allowed opacity-60' : 'bg-[#5cb85c] hover:bg-[#43a047]'}`}
                                                >
                                                    {loading ? 'SAVING...' : 'SAVE CLIENT'}
                                                </button>
                                                {!isKycValid() && (
                                                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-500/5 px-4 py-2 rounded border border-red-500/10">
                                                        <Info className="w-3.5 h-3.5" />
                                                        PAN, Aadhaar & Bank Proof Required
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default CreateClientPage;
