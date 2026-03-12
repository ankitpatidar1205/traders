import React, { useState, useEffect, useRef } from 'react';
import { X, User, ChevronDown, Settings, Lock, Key } from 'lucide-react';

const ClientDetailPage = ({ client, onClose, onUpdate, onReset, onRecalculate, onDuplicate, onChangePassword, onDelete, onLogout, onNavigate }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileRef = useRef(null);
    const [kycStatus, setKycStatus] = useState(client?.kycStatus || 'Pending');

    const handleApproveKYC = () => {
        setKycStatus('Approved');
        if (onUpdate) onUpdate({ ...client, kycStatus: 'Approved' });
    };

    const handleRejectKYC = () => {
        setKycStatus('Rejected');
        if (onUpdate) onUpdate({ ...client, kycStatus: 'Rejected' });
    };

    const clientData = {
        id: client?.id || '3705377',
        name: client?.fullName || 'Demo ji',
        mobile: client?.mobile || '',
        username: client?.username || 'Demo0174',
        city: client?.city || '',
        accountStatus: 'Active',
        allowOrdersHighLow: 'Yes',
        allowFreshEntry: 'Yes',
        demoAccount: 'Yes',
        autoCloseLosses: 'Yes',
        autoCloseInsufficient: 'Yes',
        minLotMCX: '0',
        maxLotMCX: '20',
        minLotEquity: '0',
        maxLotEquity: '50',
        minLotEquityIndex: '0',
        maxLotEquityIndex: '20',
        maxScripMCX: '50',
        maxScripEquity: '100',
        maxScripEquityIndex: '100',
        minLotEquityOptions: '0',
        maxLotEquityOptions: '50',
        minLotEquityIndexOptions: '0',
        maxLotEquityIndexOptions: '20',
        maxScripEquityOptions: '200',
        maxScripEquityIndexOptions: '200',
        autoCloseLossPercent: '90',
        notifyLossPercent: '70',
        mcxTrading: 'Active',
        mcxBrokerage: '800.0000',
        equityTrading: 'Active',
        equityBrokerage: '800.0000',
        intradayMarginEquity: '500',
        holdingMarginEquity: '100',
        optionsTrading: 'Active',
        optionsBrokerage: '20.0000',
        intradayMarginOptions: '5',
        holdingMarginOptions: '2.000000',
        ledgerBalance: '500000000.0000',
        broker: '3761 : ',
        createdAt: '2026-02-10 00:44:10',
        kycStatus: client?.kycStatus || 'Pending',
        notes: '',
        totalPL: '0',
        totalBrokerage: '0',
        netPL: '0'
    };

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showActionsDropdown && !event.target.closest('.actions-dropdown-container')) {
                setShowActionsDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActionsDropdown, showProfileDropdown]);

    const fundsData = [
        {
            amount: '500000000',
            createdAt: '2026-02-10 00:44:41',
            notes: ''
        }
    ];

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-50 flex flex-col overflow-hidden">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a2035; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4CAF50; border-radius: 4px; }
            `}</style>

            {/* Top Bar - Solid Green */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-4 shadow-md shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-white hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
                    >
                        <span className="fa-solid fa-arrow-left text-[18px]"></span>
                        <span className="text-[14px] font-bold uppercase tracking-tight">Back</span>
                    </button>
                </div>
                <div className="flex items-center gap-4 text-white">
                    <button className="hover:bg-black/10 p-2 rounded-full transition-colors">
                        <Settings className="w-5 h-5 flex items-center justify-center" />
                    </button>

                    {/* Profile Dropdown Container */}
                    <div className="relative" ref={profileRef}>
                        <div
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-2 font-bold uppercase text-[13px] cursor-pointer hover:bg-black/10 px-3 py-1.5 rounded transition-colors select-none"
                        >
                            <User className="text-white text-xs scale-125 mr-1" />
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
                {/* Sidebar Placeholder (matches CreateClientPage) */}
                <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-2 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="logo py-4 border-b border-white/10 mb-4 px-2">
                        {/* Empty space for logo or just the line as per screenshot */}
                    </div>
                    {[
                        { id: 'live-m2m', icon: 'fa-table-columns', label: 'DashBoard' },
                        { id: 'market-watch', icon: 'fa-chart-line', label: 'Market Watch' },
                        { id: 'notifications', icon: 'fa-bell', label: 'Notifications' },
                        { id: 'action-ledger', icon: 'fa-podcast', label: 'Action Ledger' },
                        { id: 'active-positions', icon: 'fa-certificate', label: 'Active Positions' },
                        { id: 'closed-positions', icon: 'fa-history', label: 'Closed Positions' },
                        { id: 'users', icon: 'fa-user-circle', label: 'Trading Clients' },
                        { id: 'trades', icon: 'fa-tag', label: 'Trades' },
                        { id: 'group-trades', icon: 'fa-tag', label: 'Group Trades' },
                        { id: 'closed-trades', icon: 'fa-tag', label: 'Closed Trades' },
                        { id: 'deleted-trades', icon: 'fa-trash-can', label: 'Deleted Trades' },
                        { id: 'pending-orders', icon: 'fa-clock', label: 'Pending Orders' },
                        { id: 'funds', icon: 'fa-wallet', label: 'Trader Funds' },
                        { id: 'trading-clients', icon: 'fa-users', label: 'Users' },
                        { id: 'tickers', icon: 'fa-calculator', label: 'Tickers' },
                        { id: 'banned', icon: 'fa-shield-halved', label: 'Banned Limit Orders' },
                        { id: 'bank', icon: 'fa-building', label: 'Bank Details' },
                        { id: 'new-client-bank', icon: 'fa-building-columns', label: 'Bank Details for new clients' },
                        { id: 'accounts', icon: 'fa-file-invoice', label: 'Accounts' },
                        { id: 'create-broker', icon: 'fa-file-lines', label: 'Broker Accounts' },
                        { id: 'change-password', icon: 'fa-lock', label: 'Change Login Password' },
                        { id: 'change-transaction-password', icon: 'fa-key', label: 'Change Transaction Password' },
                        { id: 'withdrawal-requests', icon: 'fa-arrow-up-from-bracket', label: 'Withdrawal Requests' },
                        { id: 'deposit-requests', icon: 'fa-arrow-down-to-bracket', label: 'Deposit Requests' },
                        { id: 'negative-balance', icon: 'fa-triangle-exclamation', label: 'Negative Balance Txns' },
                    ].map((item) => (
                        <div
                            key={item.label}
                            onClick={item.label === 'Trading Clients' ? undefined : onClose}
                            className={`text-slate-300 text-[12px] flex items-center gap-3 py-2.5 px-4 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.label === 'Trading Clients' ? 'bg-[#4caf50] text-white shadow-lg font-bold' : ''}`}
                        >
                            <div className="w-5 h-5 flex items-center justify-center opacity-80 text-sm">
                                <span className={`fa-solid ${item.icon}`}></span>
                            </div>
                            <span className="truncate tracking-wide">{item.label}</span>
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

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2 bg-[#1a2035]">
                    <div className="max-w-7xl mx-auto mt-4 mb-6">

                        {/* Close Button Only as per screenshot logic */}
                        <div className="flex justify-end mb-4">
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Main Content Card */}
                        {/* Main Content Sections */}
                        <div className="space-y-6">
                            {/* Export Section */}
                            <div className="space-y-3 max-w-5xl">
                                {[
                                    { label: 'EXPORT TRADES' },
                                    { label: 'DOWNLOAD TRADES PDF' },
                                    { label: 'EXPORT FUNDS' }
                                ].map((item) => (
                                    <div key={item.label} className="flex gap-4 items-center">
                                        <div className="flex bg-white border border-slate-300 rounded-sm overflow-hidden h-[42px] w-[440px] shadow-sm">
                                            <div className="flex-1 border-r border-slate-300 relative flex items-center">
                                                <input
                                                    type="date"
                                                    placeholder="From Date"
                                                    className="w-full h-full bg-white text-slate-700 px-4 outline-none text-[14px] cursor-pointer placeholder:text-slate-500 font-normal [color-scheme:light]"
                                                />
                                            </div>
                                            <div className="flex-1 relative flex items-center">
                                                <input
                                                    type="date"
                                                    placeholder="To Date"
                                                    className="w-full h-full bg-white text-slate-700 px-4 outline-none text-[14px] cursor-pointer placeholder:text-slate-500 font-normal [color-scheme:light]"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className="flex-3 h-[42px] min-w-[300px] text-white font-bold text-[12px] uppercase tracking-wider rounded-[3px] shadow-md transition-all hover:brightness-105 active:scale-[0.98] flex items-center justify-center"
                                            style={{ background: '#26c6da' }}
                                        >
                                            {item.label}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Actions Button */}
                            <div className="relative inline-block actions-dropdown-container">
                                <button
                                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                                    className="bg-[#9c27b0] hover:bg-[#8e24aa] text-white font-bold py-2.5 px-8 rounded transition-all text-[11px] uppercase tracking-widest shadow-lg flex items-center gap-3"
                                >
                                    ACTIONS <span className="text-[10px] opacity-70">▼</span>
                                </button>

                                {/* Dropdown Menu */}
                                {showActionsDropdown && (
                                    <div className="absolute top-full left-0 mt-2 bg-white rounded shadow-2xl border border-slate-200 w-[160px] z-50 overflow-hidden">
                                        <button
                                            onClick={() => {
                                                setShowActionsDropdown(false);
                                                if (onUpdate) onUpdate(client);
                                            }}
                                            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-sm border-b border-slate-200"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowActionsDropdown(false);
                                                if (onReset) onReset(client);
                                            }}
                                            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-sm border-b border-slate-200"
                                        >
                                            Reset Account
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowActionsDropdown(false);
                                                if (onRecalculate) onRecalculate(client);
                                            }}
                                            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-sm border-b border-slate-200"
                                        >
                                            Refresh Brokerage
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onDuplicate) onDuplicate(client);
                                                setShowActionsDropdown(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-sm border-b border-slate-200"
                                        >
                                            Duplicate
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onChangePassword) onChangePassword(client);
                                                setShowActionsDropdown(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-sm border-b border-slate-200"
                                        >
                                            Change Password
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onDelete) onDelete(client);
                                                setShowActionsDropdown(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-sm"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* View Details Button */}
                            <div>
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="w-full bg-[#4caf50] hover:bg-[#43a047] text-white font-bold py-3 px-6 rounded transition-all text-[12px] uppercase tracking-[0.2em] shadow-lg"
                                >
                                    VIEW DETAILS
                                </button>
                            </div>

                            {/* KYC Verification Section */}
                            <div className="bg-[#1a2035] rounded shadow-xl border border-white/10 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-white text-[19px] font-medium flex items-center gap-2">
                                                <i className="fa-solid fa-shield-check text-orange-400"></i> KYC Verification Management
                                            </h3>
                                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60">Review and Update Client Documents</p>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${kycStatus === 'Approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                            kycStatus === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                            }`}>
                                            STATUS: {kycStatus}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-white/5 rounded border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-file-invoice text-slate-400"></i>
                                                <span className="text-[13px] text-slate-300">Mandatory Documents uploaded?</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-green-400">YES</span>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-clock-rotate-left text-slate-400"></i>
                                                <span className="text-[13px] text-slate-300">Last Reviewed</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500">NEVER</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleApproveKYC}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-green-900/10"
                                        >
                                            APPROVE KYC
                                        </button>
                                        <button
                                            onClick={handleRejectKYC}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-red-900/10"
                                        >
                                            REJECT KYC
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Details UI Grid */}
                            {showDetails && (
                                <div className="animate-in slide-in-from-top-4 duration-300">
                                    <div className="border border-white/10 rounded overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <tbody className="text-[13px]">
                                                {[
                                                    { label: 'ID', value: clientData.id },
                                                    { label: 'Name', value: clientData.name },
                                                    { label: 'Mobile', value: clientData.mobile || '' },
                                                    { label: 'Username', value: clientData.username },
                                                    { label: 'City', value: clientData.city || '' },
                                                    { label: 'Account Status', value: clientData.accountStatus },
                                                    { label: 'Allow Orders between High - Low?', value: 'Yes' },
                                                    { label: 'Allow Fresh Entry Order above high & below low?', value: 'Yes' },
                                                    { label: 'demo account?', value: 'Yes' },
                                                    { label: 'Auto-Close trades if losses cross beyond the configured limit', value: 'Yes' },
                                                    { label: 'Auto close trade if insufficient fund to take leverage', value: 'Yes' },
                                                    { label: 'Minimum lot size required per single trade of MCX', value: '0' },
                                                    { label: 'Maximum lot size allowed per single trade of MCX', value: '20' },
                                                    { label: 'Minimum lot size required per single trade of Equity', value: '0' },
                                                    { label: 'Maximum lot size allowed per single trade of Equity', value: '50' },
                                                    { label: 'Minimum lot size required per single trade of Equity INDEX', value: '0' },
                                                    { label: 'Maximum lot size allowed per single trade of Equity INDEX', value: '20' },
                                                    { label: 'Maximum lot size allowed per single scrip of MCX to be actively open at a time', value: '50' },
                                                    { label: 'Maximum lot size allowed per scrip of Equity to be actively open at a time', value: '100' },
                                                    { label: 'Maximum lot size allowed per scrip of Equity INDEX to be actively open at a time', value: '100' },
                                                    { label: 'Minimum lot size required per single trade of Equity Options', value: '0' },
                                                    { label: 'Maximum lot size allowed per single trade of Equity Options', value: '50' },
                                                    { label: 'Minimum lot size required per single trade of Equity INDEX Options', value: '0' },
                                                    { label: 'Maximum lot size allowed per single trade of Equity INDEX Options', value: '20' },
                                                    { label: 'Maximum lot size allowed per scrip of Equity Options to be actively open at a time', value: '200' },
                                                    { label: 'Maximum lot size allowed per scrip of Equity INDEX Options to be actively open at a time', value: '200' },
                                                    { label: 'Auto-Close off active trades when the losses reach % of Ledger balance', value: '90' },
                                                    { label: 'Notify client when the losses reach % of Ledger balance', value: '70' },
                                                    { label: 'MCX Trading', value: 'Active' },
                                                    { label: 'MCX brokerage per lot', value: '800.0000' },
                                                    { label: 'Equity Trading', value: 'Active' },
                                                    { label: 'Equity brokerage', value: '800.0000' },
                                                    { label: 'Intraday Exposure/Margin Equity', value: '500' },
                                                    { label: 'Holding Exposure/Margin Equity', value: '100' },
                                                    { label: 'Options Trading', value: 'Active' },
                                                    { label: 'Options brokerage', value: '20.0000' },
                                                    { label: 'Intraday Exposure/Margin Options', value: '5' },
                                                    { label: 'Holding Exposure/Margin Options', value: '2.000000' },
                                                    { label: 'Ledger Balance', value: '500000000.0000' },
                                                    { label: 'Broker', value: '3868 : ' },
                                                    { label: 'Account Created At', value: '2026-02-16 09:44:10' },
                                                    { label: 'NOTES', value: '' },
                                                    { label: 'Total Profit / Loss', value: '0' },
                                                    { label: 'Total Brokerage', value: '0' },
                                                    { label: 'Net Profit / LOSS', value: '0' },
                                                    { label: 'KYC Status', value: kycStatus }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4 text-slate-400 border-r border-white/5 w-1/2">{row.label}</td>
                                                        <td className={`px-6 py-4 font-medium ${idx >= 42 ? 'text-white' : 'text-slate-200'}`}>
                                                            {row.value}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Fund - Withdrawal & Deposits Section */}
                            <div className="bg-[#1a2035] rounded shadow-xl border border-white/10 overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-white text-[19px] font-medium mb-1">Fund - Withdrawal & Deposits</h3>
                                    <p className="text-slate-400 text-[13px] mb-6 font-light italic opacity-70">Showing 1 of 1 items.</p>
                                    <div className="overflow-x-auto custom-scrollbar border border-white/10 rounded">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-[#202940] text-white text-[12px] uppercase tracking-wider border-b border-white/10">
                                                    <th className="px-6 py-4 text-left border-r border-white/10 w-1/4 underline-offset-[10px] decoration-white/10">Amount</th>
                                                    <th className="px-6 py-4 text-left border-r border-white/10 w-1/3 underline-offset-[10px] decoration-white/10">Created At</th>
                                                    <th className="px-6 py-4 text-left underline-offset-[10px] decoration-white/10">Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[13px] text-slate-300">
                                                {fundsData.map((fund, idx) => (
                                                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors border-b last:border-0 border-white/5">
                                                        <td className="px-6 py-4 border-r border-white/10 font-mono text-[#5cb85c]">{fund.amount}</td>
                                                        <td className="px-6 py-4 border-r border-white/10 font-mono">{fund.createdAt}</td>
                                                        <td className="px-6 py-4 font-light italic opacity-60">Opening Balance</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Active Trades Section */}
                            <div className="bg-[#1a2035] rounded-sm p-6 border border-white/5">
                                <h3 className="text-white text-[19px] font-normal mb-1">Active Trades</h3>
                                <p className="text-slate-400 text-[13px] mb-2 font-light italic">Showing 0 of items.</p>
                                <div className="overflow-x-auto custom-scrollbar border border-white/10">
                                    <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
                                        <thead className="bg-[#202940]/50 border-b border-white/10 text-white text-[13px] font-medium">
                                            <tr>
                                                <th className="px-4 py-4 text-left">X</th>
                                                <th className="px-4 py-4 text-left">ID ↑↑</th>
                                                <th className="px-4 py-4 text-left">Scrip</th>
                                                <th className="px-4 py-4 text-left">Buy Rate</th>
                                                <th className="px-4 py-4 text-left">Sell Rate</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Lots / Units</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Buy Turnover</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Sell Turnover</th>
                                                <th className="px-4 py-4 text-left uppercase">CMP</th>
                                                <th className="px-4 py-4 text-left uppercase whitespace-nowrap">Active P/L</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-300">
                                            <tr>
                                                <td colSpan="10" className="px-4 py-8 text-slate-500 font-light">No records found</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Closed Trades Section */}
                            <div className="bg-[#1a2035] rounded-sm p-6 border border-white/5">
                                <h3 className="text-white text-[19px] font-normal mb-1">Closed Trades</h3>
                                <p className="text-slate-400 text-[13px] mb-2 font-light italic">Showing 0 of items.</p>
                                <div className="overflow-x-auto custom-scrollbar border border-white/10">
                                    <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
                                        <thead className="bg-[#202940]/50 border-b border-white/10 text-white text-[13px] font-medium">
                                            <tr>
                                                <th className="px-4 py-4 text-left">ID ↑↑</th>
                                                <th className="px-4 py-4 text-left">Scrip</th>
                                                <th className="px-4 py-4 text-left">Buy Rate</th>
                                                <th className="px-4 py-4 text-left">Sell Rate</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Lots / Units</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Buy Turnover</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Sell Turnover</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Profit / Loss</th>
                                                <th className="px-4 py-4 text-left">Brokerage</th>
                                                <th className="px-4 py-4 text-left">Bought at</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-300">
                                            <tr>
                                                <td colSpan="10" className="px-4 py-8 text-slate-500 font-light">No records found</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* MCX Pending Orders Section */}
                            <div className="bg-[#1a2035] rounded-sm p-6 border border-white/5">
                                <h3 className="text-white text-[19px] font-normal mb-1">MCX Pending Orders</h3>
                                <p className="text-slate-400 text-[13px] mb-2 font-light italic">Showing 0 of items.</p>
                                <div className="overflow-x-auto custom-scrollbar border border-white/10">
                                    <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
                                        <thead className="bg-[#202940]/50 border-b border-white/10 text-white text-[13px] font-medium">
                                            <tr>
                                                <th className="px-4 py-4 text-left">ID</th>
                                                <th className="px-4 py-4 text-left">Trade</th>
                                                <th className="px-4 py-4 text-left">Lots</th>
                                                <th className="px-4 py-4 text-left">Commodity</th>
                                                <th className="px-4 py-4 text-left">Condition</th>
                                                <th className="px-4 py-4 text-left">Rate</th>
                                                <th className="px-4 py-4 text-left">Date</th>
                                                <th className="px-4 py-4 text-left">Ip Address</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-300">
                                            <tr>
                                                <td colSpan="8" className="px-4 py-8 text-slate-500 font-light">No records found</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Equity Pending Orders Section */}
                            <div className="bg-[#1a2035] rounded-sm p-6 border border-white/5">
                                <h3 className="text-white text-[19px] font-normal mb-1">Equity Pending Orders</h3>
                                <p className="text-slate-400 text-[13px] mb-2 font-light italic">Showing 0 of items.</p>
                                <div className="overflow-x-auto custom-scrollbar border border-white/10">
                                    <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
                                        <thead className="bg-[#202940]/50 border-b border-white/10 text-white text-[13px] font-medium">
                                            <tr>
                                                <th className="px-4 py-4 text-left">ID</th>
                                                <th className="px-4 py-4 text-left">Trade</th>
                                                <th className="px-4 py-4 text-left">Lots</th>
                                                <th className="px-4 py-4 text-left">Commodity</th>
                                                <th className="px-4 py-4 text-left">Condition</th>
                                                <th className="px-4 py-4 text-left">Rate</th>
                                                <th className="px-4 py-4 text-left">Date</th>
                                                <th className="px-4 py-4 text-left">Ip Address</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-300">
                                            <tr>
                                                <td colSpan="8" className="px-4 py-8 text-slate-500 font-light">No records found</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ClientDetailPage;

