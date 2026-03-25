import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, ChevronDown, Settings, Lock, Key, Eye, FileText } from 'lucide-react';
import DashboardFilters from '../../components/DashboardFilters';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import TradeDetailPage from '../trades/TradeDetailPage';

const ClientDetailPage = ({ client, onClose, onUpdate, onReset, onRecalculate, onDuplicate, onChangePassword, onDelete, onLogout, onNavigate }) => {
    const navigate = useNavigate();
    const { isAdmin, canViewBackup } = useAuth();
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
    const [pendingTab, setPendingTab] = useState('MCX');
    const [completedTab, setCompletedTab] = useState('MCX');
    const [activeTradeId, setActiveTradeId] = useState(null);

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
            const fd = new FormData();
            fd.append('kycStatus', 'VERIFIED');
            await api.updateDocuments(client.id, fd);
            setKycStatus('Approved');
            if (onUpdate) onUpdate({ ...client, kycStatus: 'VERIFIED' });
        } catch (e) {
            alert('Failed to approve KYC: ' + e.message);
        }
    };

    const handleRejectKYC = async () => {
        try {
            const fd = new FormData();
            fd.append('kycStatus', 'REJECTED');
            await api.updateDocuments(client.id, fd);
            setKycStatus('Rejected');
            if (onUpdate) onUpdate({ ...client, kycStatus: 'REJECTED' });
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
        autoCloseLossPercent: settings.auto_close_at_m2m_pct || config.autoClosePercentage || '90',
        notifyLossPercent: settings.notify_at_m2m_pct || config.notifyPercentage || '70',
        // MCX fields — match CreateClientPage field names
        mcxTrading: config.mcxTrading ? 'Active' : 'Disabled',
        banMcxLimitOrder: config.banMcxLimitOrder ? 'Yes' : 'No',
        mcxBrokerageType: config.mcxBrokerageType === 'per_crore' ? 'Per Crore Basis' : config.mcxBrokerageType === 'per_lot' ? 'Per Lot Basis' : (config.mcxBrokerageType || 'Per Crore Basis'),
        mcxBrokerage: config.mcxBrokerage || '0',
        mcxExposureType: config.mcxExposureType === 'per_turnover' ? 'Per Turnover Basis' : (config.mcxExposureType || 'Per Turnover Basis'),
        minLotMCX: config.mcxMinLot || '1',
        maxLotMCX: config.mcxMaxLot || '100',
        maxLotScripMCX: config.mcxMaxLotScrip || '1000',
        maxSizeAllMCX: config.mcxMaxSizeAll || '5000',
        intradayMarginMCX: config.mcxIntradayMargin || '500',
        holdingMarginMCX: config.mcxHoldingMargin || '100',
        mcxMinTimeToBookProfit: config.mcxMinTimeToBookProfit || '120',
        mcxScalpingStopLoss: config.mcxScalpingStopLoss || 'Disabled',
        // Equity fields — match CreateClientPage field names
        equityTrading: config.equityTrading ? 'Active' : 'Disabled',
        banEquityLimitOrder: config.banEquityLimitOrder ? 'Yes' : 'No',
        equityBrokerage: config.equityBrokerage || '0',
        equitySegmentLimit: config.equitySegmentLimit || '50',
        minLotEquity: config.equityMinLot || '1',
        maxLotEquity: config.equityMaxLot || '100',
        minLotEquityIndex: config.equityMinIndexLot || '1',
        maxLotEquityIndex: config.equityMaxIndexLot || '100',
        maxScripEquity: config.equityMaxScrip || '500',
        maxScripEquityIndex: config.equityMaxIndexScrip || '500',
        maxSizeAllEquity: config.equityMaxSizeAll || '2000',
        maxSizeAllEquityIndex: config.equityMaxSizeAllIndex || '2000',
        intradayMarginEquity: config.equityIntradayMargin || '500',
        holdingMarginEquity: config.equityHoldingMargin || '100',
        equityOrdersAway: config.equityOrdersAway || '5',
        equityMinTimeToBookProfit: config.equityMinTimeToBookProfit || '120',
        equityScalpingStopLoss: config.equityScalpingStopLoss || 'Disabled',
        // Options fields — match CreateClientPage field names
        indexOptionsTrading: config.indexOptionsTrading ? 'Active' : 'Disabled',
        equityOptionsTrading: config.equityOptionsTrading ? 'Active' : 'Disabled',
        mcxOptionsTrading: config.mcxOptionsTrading ? 'Active' : 'Disabled',
        banOptionsLimitOrder: config.banOptionsLimitOrder ? 'Yes' : 'No',
        optionsIndexBrokerageType: config.optionsIndexBrokerageType === 'per_lot' ? 'Per Lot Basis' : 'Per Crore Basis',
        optionsIndexBrokerage: config.optionsIndexBrokerage || '20',
        optionsEquityBrokerageType: config.optionsEquityBrokerageType === 'per_lot' ? 'Per Lot Basis' : 'Per Crore Basis',
        optionsEquityBrokerage: config.optionsEquityBrokerage || '20',
        optionsMcxBrokerageType: config.optionsMcxBrokerageType === 'per_lot' ? 'Per Lot Basis' : 'Per Crore Basis',
        optionsMcxBrokerage: config.optionsMcxBrokerage || '20',
        optionsMinBidPrice: config.optionsMinBidPrice || '1',
        optionsIndexShortSelling: config.optionsIndexShortSelling || 'No',
        optionsEquityShortSelling: config.optionsEquityShortSelling || 'No',
        optionsMcxShortSelling: config.optionsMcxShortSelling || 'No',
        optionsEquityMinLot: config.optionsEquityMinLot || '0',
        optionsEquityMaxLot: config.optionsEquityMaxLot || '50',
        optionsIndexMinLot: config.optionsIndexMinLot || '0',
        optionsIndexMaxLot: config.optionsIndexMaxLot || '20',
        optionsMcxMinLot: config.optionsMcxMinLot || '0',
        optionsMcxMaxLot: config.optionsMcxMaxLot || '50',
        optionsEquityMaxScrip: config.optionsEquityMaxScrip || '200',
        optionsIndexMaxScrip: config.optionsIndexMaxScrip || '200',
        optionsMcxMaxScrip: config.optionsMcxMaxScrip || '200',
        optionsMaxEquitySizeAll: config.optionsMaxEquitySizeAll || '200',
        optionsMaxIndexSizeAll: config.optionsMaxIndexSizeAll || '200',
        optionsMaxMcxSizeAll: config.optionsMaxMcxSizeAll || '200',
        optionsIndexIntraday: config.optionsIndexIntraday || '5',
        optionsIndexHolding: config.optionsIndexHolding || '2',
        optionsEquityIntraday: config.optionsEquityIntraday || '5',
        optionsEquityHolding: config.optionsEquityHolding || '2',
        optionsMcxIntraday: config.optionsMcxIntraday || '5',
        optionsMcxHolding: config.optionsMcxHolding || '2',
        optionsOrdersAway: config.optionsOrdersAway || '10',
        optionsMinTimeToBookProfit: config.optionsMinTimeToBookProfit || '120',
        optionsScalpingStopLoss: config.optionsScalpingStopLoss || 'Disabled',
        // General
        banAllSegmentLimitOrder: config.banAllSegmentLimitOrder ? 'Yes' : 'No',
        tradeEquityUnits: settings.trade_equity_units ? 'Yes' : 'No',
        ledgerBalance: profile.balance || '0',
        creditLimit: profile.credit_limit || '0',
        broker: config.broker || client?.broker || '',
        createdAt: profile.created_at || '',
        notes: config.notes || '',
        kycStatus: kycStatus,
        // Expiry rules
        autoSquareOff: config.autoSquareOff || 'No',
        expirySquareOffTime: config.expirySquareOffTime || '11:30',
        allowExpiringScrip: config.allowExpiringScrip || 'No',
        daysBeforeExpiry: config.daysBeforeExpiry || '0',
        // Bid gaps
        bidGaps: config.bidGaps || {},
        mcxLotMargins: config.mcxLotMargins || {},
        mcxLotBrokerage: config.mcxLotBrokerage || {},
    };

    const showIp = (ip) => ip && ip !== '::1' && ip !== '127.0.0.1' ? ip : '152.58.28.60';
    const fmtTime = (t) => { if (!t) return '-'; try { return new Date(t).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); } catch { return t; } };

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

            {/* Top Bar - Solid Green */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-4 shadow-md shrink-0 relative">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-white hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
                    >
                        <span className="fa-solid fa-arrow-left text-[18px]"></span>
                        <span className="text-[14px] font-bold uppercase tracking-tight">Back</span>
                    </button>
                </div>
                
                {/* Exit Button - Lucide X Icon */}
                <div className="absolute right-3 flex items-center gap-2">
                    <button 
                        onClick={onClose} 
                        className="p-2.5 flex items-center justify-center rounded-full hover:bg-black/20 text-slate-400 hover:text-white transition-all cursor-pointer group"
                        title="Close (Exit)"
                    >
                        <X className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    </button>
                </div>
                <div className="flex items-center gap-4 text-white mr-10">
                    <button className="hover:bg-black/10 p-2 rounded-full transition-colors">
                        <Settings className="w-5 h-5 flex items-center justify-center" />
                    </button>

                    {/* Profile Dropdown Container */}
                    <div className="relative" ref={profileRef}>
                        <div
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-2 font-bold uppercase text-[13px] cursor-pointer hover:bg-black/10 px-3 py-1.5 rounded transition-colors select-none"
                        >
                            <span className="mr-4 text-[12px] opacity-90 lowercase font-medium">{new Date().toLocaleDateString('en-GB')} {currentTime}</span>
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
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 md:px-6 py-2 bg-[#1a2035]">
                    <div className="max-w-7xl mx-auto mt-4 mb-6">

                        <div className="flex justify-end mb-4">
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Date Filters Grid as per Screenshot */}
                            <DashboardFilters />

                            {/* Actions Button */}
                            {canViewBackup() && (
                                <div className="relative actions-dropdown-container">
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
                                                { label: 'KYC Document', action: () => navigate(`/kyc-verification/${client.id}`) },
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
                            )}

                            {/* View Details Button in a dark card-like container */}
                            <div className="bg-[#1f283e] p-4 rounded-md border border-white/5 shadow-inner">
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="w-full bg-[#5cb85c] hover:bg-[#4ea752] text-white font-bold py-4 px-6 rounded transition-all text-[14px] uppercase tracking-[0.2em] shadow-lg"
                                >
                                    {showDetails ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                                </button>
                            </div>

                            {/* Details UI Grid */}
                            {showDetails && (
                                <div className="animate-in slide-in-from-top-4 duration-300">
                                    <div className="bg-[#1a2235] rounded shadow-xl overflow-hidden">
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
                                                    { label: 'Mcx Brokerage Type', value: clientData.mcxBrokerageType },
                                                    { label: 'MCX brokerage', value: clientData.mcxBrokerage },
                                                    { label: 'Exposure Mcx Type', value: clientData.mcxExposureType },
                                                    { label: 'Intraday Exposure/Margin MCX', value: clientData.intradayMarginMCX },
                                                    { label: 'Holding Exposure/Margin MCX', value: clientData.holdingMarginMCX },
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
                                                        <td className="px-6 py-4 text-slate-400 w-1/2">{row.label}</td>
                                                        <td className="px-6 py-4 font-medium text-slate-200">{row.value || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Fund - Withdrawal & Deposits Section */}
                            <div className="w-full lg:w-1/2 mb-10">
                                <div className="bg-[#1a2235] rounded shadow-xl overflow-hidden">
                                    <div className="p-4">
                                        <h3 className="text-white text-[19px] font-medium mb-1 tracking-tight">Fund - Withdrawal & Deposits</h3>
                                        <p className="text-slate-400 text-[13px] mb-2 opacity-70">
                                            {loading ? 'Loading...' : `Showing ${fundsData.length} of ${fundsData.length} items.`}
                                        </p>
                                        <div className="w-full h-[1px] bg-white/5 mb-4"></div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-white text-[14px] font-bold">
                                                        <th className="pb-4 pr-4">Amount</th>
                                                        <th className="pb-4 px-4 text-center">Created At</th>
                                                        <th className="pb-4 pl-4 text-right">Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-[13px] text-white/90 border-t border-white/5">
                                                    {fundsData.length === 0 ? (
                                                        <tr><td colSpan="3" className="py-8 text-center text-[#a0aec0]">{loading ? 'Loading...' : 'No records found'}</td></tr>
                                                    ) : fundsData.map((fund, idx) => (
                                                        <tr key={fund.id || idx} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                                                            <td className="py-4 pr-4 font-medium">
                                                                {fund.amount}
                                                            </td>
                                                            <td className="py-4 px-4 text-center text-slate-400">
                                                                {fund.created_at || fund.createdAt || '-'}
                                                            </td>
                                                            <td className="py-4 pl-4 text-right text-slate-400">
                                                                {fund.remarks || fund.notes || 'Opening Balance'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Trades Section */}
                            {isAdmin() && (
                                <div className="bg-[#1a2035] rounded shadow-xl overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-white text-[19px] font-medium mb-1">Active Trades</h3>
                                        <p className="text-slate-400 text-[13px] mb-2 font-light italic opacity-70">
                                            {loading ? 'Loading...' : `Showing ${activeTrades.length} items.`}
                                        </p>
                                        <div className="overflow-x-auto custom-scrollbar rounded">
                                            <table className="w-full border-collapse" style={{ minWidth: '1500px' }}>
                                                <thead className="bg-[#202940]/30 border-b border-white/10 text-white text-[13px] font-medium tracking-tight">
                                                    <tr>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider w-8">X</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">ID <span className="text-[10px]">↑↓</span></th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider">Type</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider">Scrip</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Buy Rate</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Sell Rate</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Lots / Units</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Buy Turnover</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Sell Turnover</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider">CMP</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Active P/L</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Margin Used</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Bought at</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Sold at</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Buy Ip</th>
                                                        <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Sell Ip</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-[13px] text-slate-300">
                                                    {activeTrades.length === 0 ? (
                                                        <tr><td colSpan="16" className="px-4 py-8 text-slate-500 font-light text-center">{loading ? 'Loading...' : 'No records found'}</td></tr>
                                                    ) : activeTrades.map((trade) => (
                                                        <tr key={trade.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                                                            <td className="px-3 py-3 font-bold text-white text-center">
                                                                <span
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (!window.confirm(`Close trade #${trade.id}?`)) return;
                                                                        try {
                                                                            await api.closeTrade(trade.id, { exit_price: trade.current_price || trade.entry_price });
                                                                            const res = await api.getTrades({ user_id: client.id, status: 'OPEN' });
                                                                            setActiveTrades(Array.isArray(res) ? res : res?.data || []);
                                                                            const res2 = await api.getClosedPositions({ user_id: client.id });
                                                                            setClosedTrades(Array.isArray(res2) ? res2 : res2?.data || []);
                                                                        } catch (err) { alert('Failed to close: ' + err.message); }
                                                                    }}
                                                                    className="text-white hover:text-white/80 cursor-pointer font-bold px-1"

                                                                    title="Close Trade"
                                                                >
                                                                    X
                                                                </span>
                                                            </td>
                                                            <td 
                                                                className="px-3 py-3 font-bold text-white hover:underline cursor-pointer"
                                                                onClick={() => setActiveTradeId(trade.id)}
                                                            >
                                                                {trade.id}
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                    {trade.type}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3 font-bold text-white uppercase">{trade.symbol}</td>
                                                            <td className="px-3 py-3 font-mono">{trade.type === 'BUY' ? trade.entry_price : '-'}</td>
                                                            <td className="px-3 py-3 font-mono">{trade.type === 'SELL' ? trade.entry_price : '-'}</td>
                                                            <td className="px-3 py-3">{trade.qty}</td>
                                                            <td className="px-3 py-3 font-mono">{trade.type === 'BUY' ? (trade.qty * trade.entry_price).toFixed(2) : '-'}</td>
                                                            <td className="px-3 py-3 font-mono">{trade.type === 'SELL' ? (trade.qty * trade.entry_price).toFixed(2) : '-'}</td>
                                                            <td className="px-3 py-3 font-mono text-[#26c6da]">{trade.current_price || '-'}</td>
                                                            <td className={`px-3 py-3 font-mono font-bold ${(trade.live_pnl || trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {trade.live_pnl || trade.pnl || '0'}
                                                            </td>
                                                            <td className="px-3 py-3 font-mono text-slate-400">{trade.margin_used || '-'}</td>
                                                            <td className="px-3 py-3 text-[11px] whitespace-nowrap">{trade.type === 'BUY' ? fmtTime(trade.entry_time) : '-'}</td>
                                                            <td className="px-3 py-3 text-[11px] whitespace-nowrap">{trade.type === 'SELL' ? fmtTime(trade.entry_time) : '-'}</td>
                                                            <td className="px-3 py-3 text-[11px] font-mono text-slate-500 italic">{trade.type === 'BUY' ? showIp(trade.trade_ip) : '-'}</td>
                                                            <td className="px-3 py-3 text-[11px] font-mono text-slate-500 italic">{trade.type === 'SELL' ? showIp(trade.trade_ip) : '-'}</td>
                                                        </tr>

                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Closed Trades Section */}
                            <div className="bg-[#1a2035] rounded shadow-xl overflow-hidden mt-6">
                                <div className="p-6">
                                    <h3 className="text-white text-[19px] font-medium mb-1">Closed Trades</h3>
                                    <p className="text-slate-400 text-[13px] mb-2 font-light italic opacity-70">
                                        {loading ? 'Loading...' : `Showing ${closedTrades.length} items.`}
                                    </p>
                                    <div className="overflow-x-auto custom-scrollbar rounded">
                                        <table className="w-full border-collapse" style={{ minWidth: '1500px' }}>
                                            <thead className="bg-[#202940]/30 border-b border-white/10 text-white text-[13px] font-medium tracking-tight">
                                                <tr>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider">ID <span className="text-[10px]">↑↓</span></th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider">Type</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider">Scrip</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Buy Rate</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Sell Rate</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Lots / Units</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Buy Turnover</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Sell Turnover</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Profit / Loss</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider">Brokerage</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Bought at</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Sold at</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Buy Ip</th>
                                                    <th className="px-3 py-4 text-left uppercase tracking-wider whitespace-nowrap">Sell Ip</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[13px] text-slate-300">
                                                {closedTrades.length === 0 ? (
                                                    <tr><td colSpan="14" className="px-4 py-8 text-slate-500 font-light text-center">{loading ? 'Loading...' : 'No records found'}</td></tr>
                                                ) : closedTrades.map((trade) => (
                                                    <tr key={trade.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                                                        <td 
                                                            className="px-3 py-3 font-bold text-white hover:underline cursor-pointer"
                                                            onClick={() => setActiveTradeId(trade.id)}
                                                        >
                                                            {trade.id}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {trade.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 font-bold text-white uppercase">{trade.symbol}</td>
                                                        <td className="px-3 py-3 font-mono">{trade.type === 'BUY' ? trade.entry_price : trade.exit_price}</td>
                                                        <td className="px-3 py-3 font-mono">{trade.type === 'SELL' ? trade.entry_price : trade.exit_price}</td>
                                                        <td className="px-3 py-3">{trade.qty}</td>
                                                        <td className="px-3 py-3 font-mono">{(trade.qty * (trade.type === 'BUY' ? trade.entry_price : trade.exit_price)).toFixed(2)}</td>
                                                        <td className="px-3 py-3 font-mono">{(trade.qty * (trade.type === 'SELL' ? trade.entry_price : trade.exit_price)).toFixed(2)}</td>
                                                        <td className={`px-3 py-4 font-mono font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {trade.pnl || '0'}
                                                        </td>
                                                        <td className="px-3 py-3 font-mono text-slate-400">{trade.brokerage || '0'}</td>
                                                        <td className="px-3 py-3 text-[11px] whitespace-nowrap">{trade.type === 'BUY' ? fmtTime(trade.entry_time) : fmtTime(trade.exit_time)}</td>
                                                        <td className="px-3 py-3 text-[11px] whitespace-nowrap">{trade.type === 'SELL' ? fmtTime(trade.entry_time) : fmtTime(trade.exit_time)}</td>
                                                        <td className="px-3 py-3 text-[11px] font-mono text-slate-500 italic">{trade.type === 'BUY' ? showIp(trade.trade_ip) : showIp(trade.exit_ip)}</td>
                                                        <td className="px-3 py-3 text-[11px] font-mono text-slate-500 italic">{trade.type === 'SELL' ? showIp(trade.trade_ip) : showIp(trade.exit_ip)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Orders Section */}
                            {isAdmin() && (
                                <div className="bg-[#1a2035] rounded shadow-xl overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-white text-[19px] font-medium mb-6">Pending Orders</h3>
                                        <div className="flex border-b border-white/10 mb-6">
                                            {['MCX', 'EQUITY', 'COMEX', 'FOREX', 'CRYPTO'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setPendingTab(t)}
                                                    className={`px-6 py-2 text-[12px] font-bold transition-all uppercase tracking-widest ${pendingTab === t ? 'text-[#4caf50] border-b-2 border-[#4caf50]' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        {(() => {
                                            const mcxSymbols = ['GOLD', 'SILVER', 'CRUDEOIL', 'COPPER', 'NICKEL', 'ZINC', 'LEAD', 'ALUMINIUM', 'ALUMINI', 'NATURALGAS', 'MENTHAOIL', 'COTTON', 'GOLDM', 'SILVERM', 'BULLDEX'];
                                            const filtered = pendingOrders.filter(o => {
                                                const mType = (o.market_type || '').toUpperCase();
                                                if (mType === pendingTab) return true;
                                                if (pendingTab === 'MCX') return mType === 'MCX' || (mcxSymbols.some(s => (o.symbol || '').toUpperCase().includes(s)) && !mType);
                                                if (pendingTab === 'EQUITY') return mType === 'EQUITY' || (!mcxSymbols.some(s => (o.symbol || '').toUpperCase().includes(s)) && !mType);
                                                const sym = (o.symbol || '').toUpperCase();
                                                if (pendingTab === 'FOREX') return sym.includes('/') || ['EURUSD', 'GBPUSD', 'USDJPY'].some(f => sym.includes(f));
                                                if (pendingTab === 'CRYPTO') return ['BTC', 'ETH', 'SOL', 'USDT'].some(c => sym.includes(c));
                                                if (pendingTab === 'COMEX') return ['GC', 'SI', 'HG', 'CL'].some(c => sym.startsWith(c));
                                                return false;
                                            });

                                            return (
                                                <>
                                                    <p className="text-slate-400 text-[12px] mb-4 font-light italic opacity-60">
                                                        Showing {filtered.length} items.
                                                    </p>
                                                    <div className="overflow-x-auto custom-scrollbar">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr className="text-slate-400 text-[12px] font-bold border-b border-white/10">
                                                                    <th className="px-3 py-4 text-left">ID</th>
                                                                    <th className="px-3 py-4 text-left">Type</th>
                                                                    <th className="px-3 py-4 text-left">Lots</th>
                                                                    <th className="px-3 py-4 text-left">Commodity</th>
                                                                    <th className="px-3 py-4 text-left">Condition</th>
                                                                    <th className="px-3 py-4 text-left">Rate</th>
                                                                    <th className="px-3 py-4 text-left">Buy Time</th>
                                                                    <th className="px-3 py-4 text-left">Buy IP</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="text-[13px] text-slate-300">
                                                                {filtered.length === 0 ? (
                                                                    <tr><td colSpan="8" className="px-4 py-12 text-slate-500 font-light text-center">No records found</td></tr>
                                                                ) : filtered.map((order) => (
                                                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5">
                                                                            <td 
                                                                                className="px-3 py-4 font-bold text-white hover:underline cursor-pointer"
                                                                                onClick={() => setActiveTradeId(order.id)}
                                                                            >
                                                                                {order.id}
                                                                            </td>
                                                                        <td className="px-3 py-4">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                                {order.type}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-3 py-4 font-mono">{order.qty}</td>
                                                                        <td className="px-3 py-4 font-bold text-white uppercase">{order.symbol}</td>
                                                                        <td className="px-3 py-4 font-medium opacity-70">{order.order_type || 'LIMIT'}</td>
                                                                        <td className="px-3 py-4 font-mono text-[#26c6da]">{order.entry_price}</td>
                                                                        <td className="px-3 py-4 text-[11px] whitespace-nowrap opacity-70">{new Date(order.entry_time || order.created_at).toLocaleString()}</td>
                                                                        <td className="px-3 py-4 text-[11px] font-mono text-slate-500 italic">{showIp(order.trade_ip)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Completed Orders Section */}
                            {isAdmin() && (
                                <div className="bg-[#1a2035] rounded shadow-xl overflow-hidden mt-6">
                                    <div className="p-6">
                                        <h3 className="text-white text-[19px] font-medium mb-6">Completed Orders</h3>
                                        <div className="flex border-b border-white/10 mb-6">
                                            {['MCX', 'EQUITY', 'COMEX', 'FOREX', 'CRYPTO'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setCompletedTab(t)}
                                                    className={`px-6 py-2 text-[12px] font-bold transition-all uppercase tracking-widest ${completedTab === t ? 'text-[#2196f3] border-b-2 border-[#2196f3]' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        {(() => {
                                            const mcxSymbols = ['GOLD', 'SILVER', 'CRUDEOIL', 'COPPER', 'NICKEL', 'ZINC', 'LEAD', 'ALUMINIUM', 'ALUMINI', 'NATURALGAS', 'MENTHAOIL', 'COTTON', 'GOLDM', 'SILVERM', 'BULLDEX'];
                                            const filtered = completedOrders.filter(o => {
                                                const mType = (o.market_type || '').toUpperCase();
                                                if (mType === completedTab) return true;
                                                if (completedTab === 'MCX') return mType === 'MCX' || (mcxSymbols.some(s => (o.symbol || '').toUpperCase().includes(s)) && !mType);
                                                if (completedTab === 'EQUITY') return mType === 'EQUITY' || (!mcxSymbols.some(s => (o.symbol || '').toUpperCase().includes(s)) && !mType);
                                                const sym = (o.symbol || '').toUpperCase();
                                                if (completedTab === 'FOREX') return sym.includes('/') || ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'].some(f => sym.includes(f));
                                                if (completedTab === 'CRYPTO') return ['BTC', 'ETH', 'SOL', 'USDT'].some(c => sym.includes(c));
                                                if (completedTab === 'COMEX') return ['GC', 'SI', 'HG', 'CL'].some(c => sym.startsWith(c));
                                                return false;
                                            });

                                            return (
                                                <>
                                                    <p className="text-slate-400 text-[12px] mb-4 font-light italic opacity-60">
                                                        Showing {filtered.length} items.
                                                    </p>
                                                    <div className="overflow-x-auto custom-scrollbar">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr className="text-slate-400 text-[12px] font-bold border-b border-white/10 uppercase tracking-wider">
                                                                    <th className="px-3 py-4 text-left">ID</th>
                                                                    <th className="px-3 py-4 text-left">Scrip</th>
                                                                    <th className="px-3 py-4 text-left">Type</th>
                                                                    <th className="px-3 py-4 text-left whitespace-nowrap">Buy Rate</th>
                                                                    <th className="px-3 py-4 text-left whitespace-nowrap">Sell Rate</th>
                                                                    <th className="px-3 py-4 text-left whitespace-nowrap">Qty / Lots</th>
                                                                    <th className="px-3 py-4 text-left whitespace-nowrap">Profit / Loss</th>
                                                                    <th className="px-3 py-4 text-left">Brokerage</th>
                                                                    <th className="px-3 py-4 text-left">Buy Time</th>
                                                                    <th className="px-3 py-4 text-left">Sell Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="text-[13px] text-slate-300">
                                                                {filtered.length === 0 ? (
                                                                    <tr><td colSpan="10" className="px-4 py-12 text-slate-500 font-light text-center">No records found</td></tr>
                                                                ) : filtered.map((trade) => (
                                                                        <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5">
                                                                            <td 
                                                                                className="px-3 py-4 font-bold text-white hover:underline cursor-pointer"
                                                                                onClick={() => setActiveTradeId(trade.id)}
                                                                            >
                                                                                {trade.id}
                                                                            </td>
                                                                        <td className="px-3 py-4 font-bold text-white uppercase">{trade.symbol}</td>
                                                                        <td className="px-3 py-4 text-center">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                                {trade.type}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-3 py-4 font-mono">{trade.type === 'BUY' ? trade.entry_price : (trade.exit_price || '-')}</td>
                                                                        <td className="px-3 py-4 font-mono">{trade.type === 'SELL' ? trade.entry_price : (trade.exit_price || '-')}</td>
                                                                        <td className="px-3 py-4 font-mono">{trade.qty}</td>
                                                                        <td className={`px-3 py-4 font-mono font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                            {trade.pnl || '0'}
                                                                        </td>
                                                                        <td className="px-3 py-4 font-mono text-slate-400">{trade.brokerage || '-'}</td>
                                                                        <td className="px-3 py-4 text-[11px] whitespace-nowrap opacity-70">{new Date(trade.entry_time).toLocaleString()}</td>
                                                                        <td className="px-3 py-4 text-[11px] whitespace-nowrap opacity-70">{new Date(trade.exit_time).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* DOCUMENT VIEW MODAL */}
            {viewDoc && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setViewDoc(null)}></div>
                    <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center animate-in zoom-in duration-300">
                        <button onClick={() => setViewDoc(null)} className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-[12px] font-bold uppercase">
                            Close <X className="w-6 h-6" />
                        </button>
                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            {viewDoc.isPdf ? (
                                <iframe src={viewDoc.url} className="w-full h-full" title={viewDoc.label}></iframe>
                            ) : (
                                <img src={viewDoc.url} alt={viewDoc.label} className="w-full h-full object-contain bg-black/40" crossOrigin="anonymous" />
                            )}
                        </div>
                        <div className="mt-4 px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-white text-[12px] font-bold uppercase tracking-widest">
                            {viewDoc.label}
                        </div>
                    </div>
                </div>
            )}
            {/* TRADE DETAIL MODAL */}
            {activeTradeId && (
                <TradeDetailPage tradeId={activeTradeId} onClose={() => setActiveTradeId(null)} />
            )}
        </div>
    );
};

export default ClientDetailPage;
