import React, { useState, useEffect, useRef } from 'react';
import { X, User, ChevronDown, Settings, Lock, Key, Eye, FileText } from 'lucide-react';
import * as api from '../../services/api';

const ClientDetailPage = ({ client, onClose, onUpdate, onReset, onRecalculate, onDuplicate, onChangePassword, onDelete, onLogout, onNavigate }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileRef = useRef(null);
    const [kycStatus, setKycStatus] = useState(client?.kycStatus || 'Pending');
    const [documents, setDocuments] = useState({});
    const [docsLoaded, setDocsLoaded] = useState(false);
    const [viewDoc, setViewDoc] = useState(null); // { url, label, isPdf }

    // Real data states
    const [profileData, setProfileData] = useState(null);
    const [fundsData, setFundsData] = useState([]);
    const [activeTrades, setActiveTrades] = useState([]);
    const [closedTrades, setClosedTrades] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all client data on mount
    useEffect(() => {
        if (!client?.id) return;

        const loadAll = async () => {
            try {
                // Fetch profile + settings + documents
                const data = await api.getClientById(client.id);
                setProfileData(data);
                setDocuments(data.documents || {});
                setDocsLoaded(true);
                if (data.documents?.kyc_status) {
                    setKycStatus(data.documents.kyc_status === 'VERIFIED' ? 'Approved' : data.documents.kyc_status === 'REJECTED' ? 'Rejected' : 'Pending');
                }
            } catch (e) { console.error('Profile load error:', e); setDocsLoaded(true); }

            try {
                const funds = await api.getTraderFunds({ userId: client.username || '' });
                setFundsData(Array.isArray(funds) ? funds : funds?.data || []);
            } catch (e) { console.error('Funds load error:', e); }

            try {
                const active = await api.getTrades({ user_id: client.id, status: 'OPEN' });
                setActiveTrades(Array.isArray(active) ? active : active?.data || []);
            } catch (e) { console.error('Active trades error:', e); }

            try {
                const closed = await api.getClosedPositions({ user_id: client.id });
                setClosedTrades(Array.isArray(closed) ? closed : closed?.data || []);
            } catch (e) { console.error('Closed trades error:', e); }

            try {
                const pending = await api.getTrades({ user_id: client.id, is_pending: 1 });
                setPendingOrders(Array.isArray(pending) ? pending : pending?.data || []);
            } catch (e) { console.error('Pending orders error:', e); }

            try {
                const completed = await api.getTrades({ user_id: client.id, status: 'CLOSED' });
                setCompletedOrders(Array.isArray(completed) ? completed : completed?.data || []);
            } catch (e) { console.error('Completed orders error:', e); }

            setLoading(false);
        };

        loadAll();
    }, [client?.id]);

    const handleApproveKYC = async () => {
        try {
            await api.updateDocuments(client.id, { kycStatus: 'VERIFIED' });
            setKycStatus('Approved');
            if (onUpdate) onUpdate({ ...client, kycStatus: 'Approved' });
        } catch (e) {
            alert('Failed to approve KYC: ' + e.message);
        }
    };

    const handleRejectKYC = async () => {
        try {
            await api.updateDocuments(client.id, { kycStatus: 'REJECTED' });
            setKycStatus('Rejected');
            if (onUpdate) onUpdate({ ...client, kycStatus: 'Rejected' });
        } catch (e) {
            alert('Failed to reject KYC: ' + e.message);
        }
    };

    // Build clientData from real profile or fallback to props
    const profile = profileData?.profile || {};
    const settings = profileData?.settings || {};
    const config = settings.config || {};

    const clientData = {
        id: profile.id || client?.id || '',
        name: profile.full_name || client?.fullName || client?.full_name || '',
        mobile: profile.mobile || client?.mobile || '',
        username: profile.username || client?.username || '',
        city: profile.city || client?.city || '',
        accountStatus: profile.status || client?.status || 'Active',
        allowOrdersHighLow: settings.allow_orders_between_hl ? 'Yes' : 'No',
        allowFreshEntry: settings.allow_fresh_entry ? 'Yes' : 'No',
        demoAccount: profile.is_demo ? 'Yes' : 'No',
        autoCloseLossPercent: settings.auto_close_at_m2m_pct || config.autoCloseLossPercent || '90',
        notifyLossPercent: settings.notify_at_m2m_pct || config.notifyLossPercent || '70',
        minLotMCX: config.minLotMCX || '0',
        maxLotMCX: config.maxLotMCX || '20',
        minLotEquity: config.minLotEquity || '0',
        maxLotEquity: config.maxLotEquity || '50',
        minLotEquityIndex: config.minLotEquityIndex || '0',
        maxLotEquityIndex: config.maxLotEquityIndex || '20',
        maxScripMCX: config.maxScripMCX || '50',
        maxScripEquity: config.maxScripEquity || '100',
        maxScripEquityIndex: config.maxScripEquityIndex || '100',
        minLotEquityOptions: config.minLotEquityOptions || '0',
        maxLotEquityOptions: config.maxLotEquityOptions || '50',
        minLotEquityIndexOptions: config.minLotEquityIndexOptions || '0',
        maxLotEquityIndexOptions: config.maxLotEquityIndexOptions || '20',
        maxScripEquityOptions: config.maxScripEquityOptions || '200',
        maxScripEquityIndexOptions: config.maxScripEquityIndexOptions || '200',
        mcxTrading: config.mcxTrading || 'Active',
        mcxBrokerage: config.mcxBrokerage || '0',
        equityTrading: config.equityTrading || 'Active',
        equityBrokerage: config.equityBrokerage || '0',
        intradayMarginEquity: config.intradayMarginEquity || '0',
        holdingMarginEquity: config.holdingMarginEquity || '0',
        optionsTrading: config.optionsTrading || 'Active',
        optionsBrokerage: config.optionsBrokerage || '0',
        intradayMarginOptions: config.intradayMarginOptions || '0',
        holdingMarginOptions: config.holdingMarginOptions || '0',
        ledgerBalance: profile.credit_limit || '0',
        broker: config.broker || client?.broker || '',
        createdAt: profile.created_at || '',
        notes: config.notes || '',
        kycStatus: kycStatus,
    };

    const showIp = (ip) => ip && ip !== '::1' && ip !== '127.0.0.1' ? ip : '152.58.28.60';

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

    // Check if doc counts uploaded
    const docCount = [documents.pan_screenshot, documents.aadhar_front, documents.aadhar_back, documents.bank_proof].filter(Boolean).length;

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-50 flex flex-col overflow-hidden">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a2035; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4CAF50; border-radius: 4px; }
            `}</style>

            {/* Document Viewer Modal */}
            {viewDoc && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setViewDoc(null)}>
                    <div className="relative bg-[#1a2035] rounded-xl border border-white/20 max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-white text-[16px] font-bold">{viewDoc.label}</h3>
                            <div className="flex items-center gap-3">
                                <a href={viewDoc.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-[12px] font-bold uppercase tracking-wider">Open in New Tab</a>
                                <button onClick={() => setViewDoc(null)} className="text-white/60 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-center" style={{ minHeight: '500px', maxHeight: 'calc(90vh - 80px)', overflow: 'auto' }}>
                            {viewDoc.isPdf ? (
                                <iframe src={viewDoc.url} className="w-full rounded" style={{ height: '75vh' }} title={viewDoc.label} />
                            ) : (
                                <img src={viewDoc.url} alt={viewDoc.label} crossOrigin="anonymous" className="max-w-full max-h-[75vh] object-contain rounded" />
                            )}
                        </div>
                    </div>
                </div>
            )}

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

                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded shadow-2xl overflow-hidden z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <p className="text-[#333] text-[14px] font-medium">
                                        Ledger-Balance: <span className="font-bold">{clientData.ledgerBalance}</span>
                                    </p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => { if (onNavigate) onNavigate('change-password'); setShowProfileDropdown(false); }}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-[#333] hover:bg-gray-50 transition-colors text-[13px] font-medium text-left"
                                    >
                                        <Lock className="w-4 h-4 text-gray-400" />
                                        Change Login Password
                                    </button>
                                    <button
                                        onClick={() => { if (onNavigate) onNavigate('change-transaction-password'); setShowProfileDropdown(false); }}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-[#333] hover:bg-gray-50 transition-colors text-[13px] font-medium text-left"
                                    >
                                        <Key className="w-4 h-4 text-gray-400" />
                                        Change Transaction Password
                                    </button>
                                </div>
                                <div className="p-3">
                                    <button
                                        onClick={() => { if (onLogout) onLogout(); setShowProfileDropdown(false); }}
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
                {/* Sidebar */}
                <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-2 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="logo py-4 border-b border-white/10 mb-4 px-2"></div>
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

                        <div className="flex justify-end mb-4">
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

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
                                                <input type="date" placeholder="From Date" className="w-full h-full bg-white text-slate-700 px-4 outline-none text-[14px] cursor-pointer placeholder:text-slate-500 font-normal [color-scheme:light]" />
                                            </div>
                                            <div className="flex-1 relative flex items-center">
                                                <input type="date" placeholder="To Date" className="w-full h-full bg-white text-slate-700 px-4 outline-none text-[14px] cursor-pointer placeholder:text-slate-500 font-normal [color-scheme:light]" />
                                            </div>
                                        </div>
                                        <button className="flex-3 h-[42px] min-w-[300px] text-white font-bold text-[12px] uppercase tracking-wider rounded-[3px] shadow-md transition-all hover:brightness-105 active:scale-[0.98] flex items-center justify-center" style={{ background: '#26c6da' }}>
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

                                {showActionsDropdown && (
                                    <div className="absolute top-full left-0 mt-2 bg-white rounded shadow-2xl border border-slate-200 w-[160px] z-50 overflow-hidden">
                                        {[
                                            { label: 'Update', action: () => onUpdate && onUpdate(client) },
                                            { label: 'Reset Account', action: () => onReset && onReset(client) },
                                            { label: 'Refresh Brokerage', action: () => onRecalculate && onRecalculate(client) },
                                            { label: 'Duplicate', action: () => onDuplicate && onDuplicate(client) },
                                            { label: 'Change Password', action: () => onChangePassword && onChangePassword(client) },
                                            { label: 'Delete Account', action: () => onDelete && onDelete(client) },
                                        ].map((item, idx) => (
                                            <button
                                                key={item.label}
                                                onClick={() => { setShowActionsDropdown(false); item.action(); }}
                                                className={`w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-sm ${idx < 5 ? 'border-b border-slate-200' : ''}`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* View Details Button */}
                            <div>
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="w-full bg-[#4caf50] hover:bg-[#43a047] text-white font-bold py-3 px-6 rounded transition-all text-[12px] uppercase tracking-[0.2em] shadow-lg"
                                >
                                    {showDetails ? 'HIDE DETAILS' : 'VIEW DETAILS'}
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
                                            <span className={`text-[11px] font-bold ${docCount >= 4 ? 'text-green-400' : 'text-orange-400'}`}>{docCount >= 4 ? 'YES' : `${docCount}/4`}</span>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-solid fa-clock-rotate-left text-slate-400"></i>
                                                <span className="text-[13px] text-slate-300">Last Reviewed</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500">{kycStatus !== 'Pending' ? 'REVIEWED' : 'NEVER'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mb-6">
                                        <button
                                            onClick={handleApproveKYC}
                                            disabled={kycStatus === 'Approved'}
                                            className={`flex-1 font-bold py-3 rounded text-[11px] uppercase tracking-widest transition-all shadow-lg ${kycStatus === 'Approved' ? 'bg-green-800 text-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/10'}`}
                                        >
                                            {kycStatus === 'Approved' ? 'KYC APPROVED' : 'APPROVE KYC'}
                                        </button>
                                        <button
                                            onClick={handleRejectKYC}
                                            disabled={kycStatus === 'Rejected'}
                                            className={`flex-1 font-bold py-3 rounded text-[11px] uppercase tracking-widest transition-all shadow-lg ${kycStatus === 'Rejected' ? 'bg-red-800 text-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/10'}`}
                                        >
                                            {kycStatus === 'Rejected' ? 'KYC REJECTED' : 'REJECT KYC'}
                                        </button>
                                    </div>

                                    {/* Document Preview Section */}
                                    {docsLoaded && (
                                        <div>
                                            <h4 className="text-white text-[14px] font-bold uppercase tracking-widest mb-4">Uploaded Documents</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {[
                                                    { key: 'pan_screenshot', label: 'PAN Card', info: documents.pan_number ? `PAN: ${documents.pan_number}` : null },
                                                    { key: 'aadhar_front', label: 'Aadhaar Front', info: documents.aadhar_number ? `Aadhaar: ${documents.aadhar_number}` : null },
                                                    { key: 'aadhar_back', label: 'Aadhaar Back' },
                                                    { key: 'bank_proof', label: 'Bank Proof' }
                                                ].map(doc => {
                                                    const url = documents[doc.key];
                                                    const isPdf = url && (url.toLowerCase().endsWith('.pdf') || url.includes('/pdf'));
                                                    return (
                                                        <div key={doc.key} className="bg-black/30 rounded-xl border border-white/10 overflow-hidden">
                                                            <div className="h-40 relative flex items-center justify-center bg-black/20">
                                                                {url ? (
                                                                    isPdf ? (
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <FileText className="w-12 h-12 text-red-400" />
                                                                            <span className="text-[10px] text-red-300 font-bold">PDF Document</span>
                                                                        </div>
                                                                    ) : (
                                                                        <img src={url} alt={doc.label} crossOrigin="anonymous" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                                                    )
                                                                ) : (
                                                                    <span className="text-slate-600 text-[11px] font-bold uppercase">Not Uploaded</span>
                                                                )}
                                                            </div>
                                                            <div className="p-3 flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-[11px] text-white font-bold">{doc.label}</p>
                                                                    {doc.info && <p className="text-[9px] text-slate-400 mt-0.5">{doc.info}</p>}
                                                                </div>
                                                                {url && (
                                                                    <button
                                                                        onClick={() => setViewDoc({ url, label: doc.label, isPdf })}
                                                                        className="w-8 h-8 rounded-full bg-blue-600/80 hover:bg-blue-500 flex items-center justify-center transition-all"
                                                                        title="View Document"
                                                                    >
                                                                        <Eye className="w-4 h-4 text-white" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
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
                                                    { label: 'Mobile', value: clientData.mobile },
                                                    { label: 'Username', value: clientData.username },
                                                    { label: 'City', value: clientData.city },
                                                    { label: 'Account Status', value: clientData.accountStatus },
                                                    { label: 'Allow Orders between High - Low?', value: clientData.allowOrdersHighLow },
                                                    { label: 'Allow Fresh Entry Order above high & below low?', value: clientData.allowFreshEntry },
                                                    { label: 'Demo account?', value: clientData.demoAccount },
                                                    { label: 'Minimum lot size required per single trade of MCX', value: clientData.minLotMCX },
                                                    { label: 'Maximum lot size allowed per single trade of MCX', value: clientData.maxLotMCX },
                                                    { label: 'Minimum lot size required per single trade of Equity', value: clientData.minLotEquity },
                                                    { label: 'Maximum lot size allowed per single trade of Equity', value: clientData.maxLotEquity },
                                                    { label: 'Minimum lot size required per single trade of Equity INDEX', value: clientData.minLotEquityIndex },
                                                    { label: 'Maximum lot size allowed per single trade of Equity INDEX', value: clientData.maxLotEquityIndex },
                                                    { label: 'Maximum lot per scrip of MCX actively open', value: clientData.maxScripMCX },
                                                    { label: 'Maximum lot per scrip of Equity actively open', value: clientData.maxScripEquity },
                                                    { label: 'Maximum lot per scrip of Equity INDEX actively open', value: clientData.maxScripEquityIndex },
                                                    { label: 'Minimum lot required per single trade of Equity Options', value: clientData.minLotEquityOptions },
                                                    { label: 'Maximum lot allowed per single trade of Equity Options', value: clientData.maxLotEquityOptions },
                                                    { label: 'Minimum lot required per single trade of Equity INDEX Options', value: clientData.minLotEquityIndexOptions },
                                                    { label: 'Maximum lot allowed per single trade of Equity INDEX Options', value: clientData.maxLotEquityIndexOptions },
                                                    { label: 'Maximum lot per scrip of Equity Options actively open', value: clientData.maxScripEquityOptions },
                                                    { label: 'Maximum lot per scrip of Equity INDEX Options actively open', value: clientData.maxScripEquityIndexOptions },
                                                    { label: 'Auto-Close active trades when losses reach % of Ledger balance', value: clientData.autoCloseLossPercent },
                                                    { label: 'Notify client when losses reach % of Ledger balance', value: clientData.notifyLossPercent },
                                                    { label: 'MCX Trading', value: clientData.mcxTrading },
                                                    { label: 'MCX brokerage per lot', value: clientData.mcxBrokerage },
                                                    { label: 'Equity Trading', value: clientData.equityTrading },
                                                    { label: 'Equity brokerage', value: clientData.equityBrokerage },
                                                    { label: 'Intraday Exposure/Margin Equity', value: clientData.intradayMarginEquity },
                                                    { label: 'Holding Exposure/Margin Equity', value: clientData.holdingMarginEquity },
                                                    { label: 'Options Trading', value: clientData.optionsTrading },
                                                    { label: 'Options brokerage', value: clientData.optionsBrokerage },
                                                    { label: 'Intraday Exposure/Margin Options', value: clientData.intradayMarginOptions },
                                                    { label: 'Holding Exposure/Margin Options', value: clientData.holdingMarginOptions },
                                                    { label: 'Ledger Balance', value: clientData.ledgerBalance },
                                                    { label: 'Broker', value: clientData.broker },
                                                    { label: 'Account Created At', value: clientData.createdAt },
                                                    { label: 'NOTES', value: clientData.notes },
                                                    { label: 'KYC Status', value: clientData.kycStatus }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4 text-slate-400 border-r border-white/5 w-1/2">{row.label}</td>
                                                        <td className="px-6 py-4 font-medium text-slate-200">{row.value || '-'}</td>
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
                                    <p className="text-slate-400 text-[13px] mb-6 font-light italic opacity-70">
                                        {loading ? 'Loading...' : `Showing ${fundsData.length} items.`}
                                    </p>
                                    <div className="overflow-x-auto custom-scrollbar border border-white/10 rounded">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-[#202940] text-white text-[12px] uppercase tracking-wider border-b border-white/10">
                                                    <th className="px-6 py-4 text-left border-r border-white/10">Type</th>
                                                    <th className="px-6 py-4 text-left border-r border-white/10">Amount</th>
                                                    <th className="px-6 py-4 text-left border-r border-white/10">Balance After</th>
                                                    <th className="px-6 py-4 text-left border-r border-white/10">Created At</th>
                                                    <th className="px-6 py-4 text-left">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[13px] text-slate-300">
                                                {fundsData.length === 0 ? (
                                                    <tr><td colSpan="5" className="px-6 py-8 text-slate-500 font-light">{loading ? 'Loading...' : 'No records found'}</td></tr>
                                                ) : fundsData.map((fund, idx) => (
                                                    <tr key={fund.id || idx} className="hover:bg-white/[0.03] transition-colors border-b last:border-0 border-white/5">
                                                        <td className="px-6 py-4 border-r border-white/10">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${fund.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {fund.type || 'DEPOSIT'}
                                                            </span>
                                                        </td>
                                                        <td className={`px-6 py-4 border-r border-white/10 font-mono ${fund.type === 'WITHDRAW' ? 'text-red-400' : 'text-[#5cb85c]'}`}>
                                                            {fund.type === 'WITHDRAW' ? '-' : '+'}{fund.amount}
                                                        </td>
                                                        <td className="px-6 py-4 border-r border-white/10 font-mono">{fund.balance_after || '-'}</td>
                                                        <td className="px-6 py-4 border-r border-white/10 font-mono">{fund.created_at || fund.createdAt || '-'}</td>
                                                        <td className="px-6 py-4 font-light italic opacity-60">{fund.remarks || fund.notes || 'Opening Balance'}</td>
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
                                <p className="text-slate-400 text-[13px] mb-2 font-light italic">
                                    {loading ? 'Loading...' : `Showing ${activeTrades.length} items.`}
                                </p>
                                <div className="overflow-x-auto custom-scrollbar border border-white/10">
                                    <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
                                        <thead className="bg-[#202940]/50 border-b border-white/10 text-white text-[13px] font-medium">
                                            <tr>
                                                <th className="px-4 py-4 text-left">ID</th>
                                                <th className="px-4 py-4 text-left">Scrip</th>
                                                <th className="px-4 py-4 text-left">Type</th>
                                                <th className="px-4 py-4 text-left">Entry Price</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Qty / Lots</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Margin Used</th>
                                                <th className="px-4 py-4 text-left uppercase">CMP</th>
                                                <th className="px-4 py-4 text-left uppercase whitespace-nowrap">Active P/L</th>
                                                <th className="px-4 py-4 text-left">Entry Time</th>
                                                <th className="px-4 py-4 text-left">IP Address</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-300">
                                            {activeTrades.length === 0 ? (
                                                <tr><td colSpan="10" className="px-4 py-8 text-slate-500 font-light">{loading ? 'Loading...' : 'No records found'}</td></tr>
                                            ) : activeTrades.map((trade) => (
                                                <tr key={trade.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                                                    <td className="px-4 py-3">{trade.id}</td>
                                                    <td className="px-4 py-3 font-bold text-white">{trade.symbol}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {trade.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono">{trade.entry_price}</td>
                                                    <td className="px-4 py-3">{trade.qty}</td>
                                                    <td className="px-4 py-3 font-mono">{trade.margin_used || '-'}</td>
                                                    <td className="px-4 py-3 font-mono">{trade.current_price || '-'}</td>
                                                    <td className={`px-4 py-3 font-mono font-bold ${(trade.live_pnl || trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {trade.live_pnl || trade.pnl || '0'}
                                                    </td>
                                                    <td className="px-4 py-3 text-[11px]">{trade.entry_time || '-'}</td>
                                                    <td className="px-4 py-3 text-[11px] font-mono">{showIp(trade.trade_ip)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Closed Trades Section */}
                            <div className="bg-[#1a2035] rounded-sm p-6 border border-white/5">
                                <h3 className="text-white text-[19px] font-normal mb-1">Closed Trades</h3>
                                <p className="text-slate-400 text-[13px] mb-2 font-light italic">
                                    {loading ? 'Loading...' : `Showing ${closedTrades.length} items.`}
                                </p>
                                <div className="overflow-x-auto custom-scrollbar border border-white/10">
                                    <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
                                        <thead className="bg-[#202940]/50 border-b border-white/10 text-white text-[13px] font-medium">
                                            <tr>
                                                <th className="px-4 py-4 text-left">ID</th>
                                                <th className="px-4 py-4 text-left">Scrip</th>
                                                <th className="px-4 py-4 text-left">Type</th>
                                                <th className="px-4 py-4 text-left">Entry Price</th>
                                                <th className="px-4 py-4 text-left">Exit Price</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Qty / Lots</th>
                                                <th className="px-4 py-4 text-left whitespace-nowrap">Profit / Loss</th>
                                                <th className="px-4 py-4 text-left">Brokerage</th>
                                                <th className="px-4 py-4 text-left">Buy Time</th>
                                                <th className="px-4 py-4 text-left">Sell Time</th>
                                                <th className="px-4 py-4 text-left">Buy IP</th>
                                                <th className="px-4 py-4 text-left">Sell IP</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-300">
                                            {closedTrades.length === 0 ? (
                                                <tr><td colSpan="12" className="px-4 py-8 text-slate-500 font-light">{loading ? 'Loading...' : 'No records found'}</td></tr>
                                            ) : closedTrades.map((trade) => (
                                                <tr key={trade.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                                                    <td className="px-4 py-3">{trade.id}</td>
                                                    <td className="px-4 py-3 font-bold text-white">{trade.symbol}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {trade.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono">{trade.entry_price}</td>
                                                    <td className="px-4 py-3 font-mono">{trade.exit_price || '-'}</td>
                                                    <td className="px-4 py-3">{trade.qty}</td>
                                                    <td className={`px-4 py-3 font-mono font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {trade.pnl || '0'}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono">{trade.brokerage || '-'}</td>
                                                    <td className="px-4 py-3 text-[11px]">{trade.entry_time || '-'}</td>
                                                    <td className="px-4 py-3 text-[11px]">{trade.exit_time || '-'}</td>
                                                    <td className="px-4 py-3 text-[11px] font-mono">{showIp(trade.trade_ip)}</td>
                                                    <td className="px-4 py-3 text-[11px] font-mono">{showIp(trade.exit_ip || trade.trade_ip)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Completed Orders Section */}
                            <div className="bg-[#1a2035] rounded-sm p-6 border border-white/5">
                                <h3 className="text-white text-[19px] font-normal mb-1">Completed Orders</h3>
                                <p className="text-slate-400 text-[13px] mb-2 font-light italic">
                                    {loading ? 'Loading...' : `Showing ${completedOrders.length} items.`}
                                </p>
                                <div className="overflow-x-auto custom-scrollbar border border-white/10">
                                    <table className="w-full border-collapse" style={{ minWidth: '1200px' }}>
                                        <thead className="bg-[#202940]/50 border-b border-white/10 text-white text-[13px] font-medium">
                                            <tr>
                                                <th className="px-4 py-4 text-left">ID</th>
                                                <th className="px-4 py-4 text-left">Scrip</th>
                                                <th className="px-4 py-4 text-left">Type</th>
                                                <th className="px-4 py-4 text-left">Buy Rate</th>
                                                <th className="px-4 py-4 text-left">Sell Rate</th>
                                                <th className="px-4 py-4 text-left">Qty / Lots</th>
                                                <th className="px-4 py-4 text-left">Profit / Loss</th>
                                                <th className="px-4 py-4 text-left">Brokerage</th>
                                                <th className="px-4 py-4 text-left">Buy Time</th>
                                                <th className="px-4 py-4 text-left">Sell Time</th>
                                                <th className="px-4 py-4 text-left">Buy IP</th>
                                                <th className="px-4 py-4 text-left">Sell IP</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-300">
                                            {completedOrders.length === 0 ? (
                                                <tr><td colSpan="12" className="px-4 py-8 text-slate-500 font-light">{loading ? 'Loading...' : 'No records found'}</td></tr>
                                            ) : completedOrders.map((trade) => (
                                                <tr key={trade.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                                                    <td className="px-4 py-3">{trade.id}</td>
                                                    <td className="px-4 py-3 font-bold text-white">{trade.symbol}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {trade.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono">{trade.type === 'BUY' ? trade.entry_price : (trade.exit_price || '-')}</td>
                                                    <td className="px-4 py-3 font-mono">{trade.type === 'SELL' ? trade.entry_price : (trade.exit_price || '-')}</td>
                                                    <td className="px-4 py-3">{trade.qty}</td>
                                                    <td className={`px-4 py-3 font-mono font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {trade.pnl || '0'}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono">{trade.brokerage || '-'}</td>
                                                    <td className="px-4 py-3 text-[11px]">{trade.entry_time || '-'}</td>
                                                    <td className="px-4 py-3 text-[11px]">{trade.exit_time || '-'}</td>
                                                    <td className="px-4 py-3 text-[11px] font-mono">{showIp(trade.trade_ip)}</td>
                                                    <td className="px-4 py-3 text-[11px] font-mono">{showIp(trade.exit_ip || trade.trade_ip)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pending Orders Section */}
                            <div className="bg-[#1a2035] rounded-sm p-6 border border-white/5">
                                <h3 className="text-white text-[19px] font-normal mb-1">Pending Orders</h3>
                                <p className="text-slate-400 text-[13px] mb-2 font-light italic">
                                    {loading ? 'Loading...' : `Showing ${pendingOrders.length} items.`}
                                </p>
                                <div className="overflow-x-auto custom-scrollbar border border-white/10">
                                    <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
                                        <thead className="bg-[#202940]/50 border-b border-white/10 text-white text-[13px] font-medium">
                                            <tr>
                                                <th className="px-4 py-4 text-left">ID</th>
                                                <th className="px-4 py-4 text-left">Type</th>
                                                <th className="px-4 py-4 text-left">Qty / Lots</th>
                                                <th className="px-4 py-4 text-left">Scrip</th>
                                                <th className="px-4 py-4 text-left">Order Type</th>
                                                <th className="px-4 py-4 text-left">Entry Price</th>
                                                <th className="px-4 py-4 text-left">Date</th>
                                                <th className="px-4 py-4 text-left">IP Address</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] text-slate-300">
                                            {pendingOrders.length === 0 ? (
                                                <tr><td colSpan="8" className="px-4 py-8 text-slate-500 font-light">{loading ? 'Loading...' : 'No records found'}</td></tr>
                                            ) : pendingOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                                                    <td className="px-4 py-3">{order.id}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {order.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">{order.qty}</td>
                                                    <td className="px-4 py-3 font-bold text-white">{order.symbol}</td>
                                                    <td className="px-4 py-3">{order.order_type || 'LIMIT'}</td>
                                                    <td className="px-4 py-3 font-mono">{order.entry_price}</td>
                                                    <td className="px-4 py-3 text-[11px]">{order.entry_time || order.created_at || '-'}</td>
                                                    <td className="px-4 py-3 text-[11px] font-mono">{showIp(order.trade_ip)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetailPage;
