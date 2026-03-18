import React, { useState, useEffect, useRef } from 'react';
import {
    Settings, User, ChevronDown, Lock, Key, LogOut, Bell, X,
    CheckCheck, Globe, Database, RotateCcw, ShieldCheck,
    Palette, Moon, Sun, Monitor, TrendingUp, Users,
    FileText, Activity, Sliders, Info, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useRiskManagement from '../hooks/useRiskManagement';
import useNotifications from '../hooks/useNotifications';
import defaultLogo from '../assets/shrishreenathjitraders.in.png';

function timeAgo(dateStr) {
    const then = new Date(dateStr.replace(' ', 'T'));
    const diffMs = Date.now() - then.getTime();
    const m = Math.floor(diffMs / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return `${Math.floor(d / 30)}mo ago`;
}

const TYPE_STYLE = {
    alert: { dot: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    warning: { dot: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    info: { dot: '#4ade80', bg: 'rgba(74,222,128,0.07)' },
};

// ─── Settings menu items ─────────────────────────────────────────────────────
const SETTINGS_SECTIONS = [
    {
        label: 'Account',
        items: [
            { id: 'change-password', icon: Lock, label: 'Change Login Password', desc: 'Update your login credentials' },
            { id: 'change-transaction-password', icon: Key, label: 'Change Transaction Password', desc: 'Secure your transaction PIN' },
        ],
    },
    {
        label: 'Trading',
        items: [
            { id: 'global-updation', icon: Sliders, label: 'Global Updation', desc: 'Batch update all trading accounts' },
            { id: 'market-watch', icon: TrendingUp, label: 'Market Watch', desc: 'Live market price feed settings' },
            { id: 'tickers', icon: Activity, label: 'Ticker Settings', desc: 'Manage scripts & ticker feed' },
        ],
    },
    {
        label: 'Data & Logs',
        items: [
            { id: 'action-ledger', icon: FileText, label: 'Action Ledger', desc: 'Audit trail of all admin actions' },
            { id: 'ip-logins', icon: Globe, label: 'IP Login Monitor', desc: 'Track login locations by IP' },
            { id: 'scrip-data', icon: Database, label: 'Scrip Data', desc: 'Manage exchange script data' },
        ],
    },
    {
        label: 'Users',
        items: [
            { id: 'trading-clients', icon: Users, label: 'Trading Clients', desc: 'Manage all client accounts' },
            { id: 'broker-accounts', icon: ShieldCheck, label: 'Broker Accounts', desc: 'Manage broker-level accounts' },
        ],
    },
    {
        label: 'Communication',
        items: [
            { id: 'whatsapp-alert', icon: ShieldCheck, label: 'WhatsApp API', desc: 'Trade & Margin alerts (Real-time)', type: 'toggle' },
            { id: 'email-alert', icon: Globe, label: 'Email (SMTP)', desc: 'Account & Ticket notifications', type: 'toggle' },
        ],
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
const TopBar = ({ currentViewLabel, onLogout, onNavigate }) => {
    const { user, currentSegment, switchSegment, logoPath, profileImagePath, theme } = useAuth();
    const userName = user?.name || '';
    const userRole = user?.role || 'admin';

    // Admins see their uploaded logo; SuperAdmin always sees the default bundled logo
    const resolvedLogo = (userRole === 'ADMIN' && logoPath)
        ? (logoPath.startsWith('http') ? logoPath : `http://https://trader-production-e063.up.railway.app${logoPath}`)
        : defaultLogo;

    // Profile image for right side
    const resolvedProfileImage = (userRole === 'ADMIN' && profileImagePath)
        ? (profileImagePath.startsWith('http') ? profileImagePath : `http://https://trader-production-e063.up.railway.app${profileImagePath}`)
        : null;

    const onSwitchSegment = (seg) => {
        switchSegment(seg);
    };

    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

    const { m2m, margin, riskState } = useRiskManagement(124500, 250000);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settingsSearch, setSettingsSearch] = useState('');

    const [communicationSettings, setCommunicationSettings] = useState({
        whatsapp: true,
        email: true
    });

    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const settingsRef = useRef(null);

    // Close all panels on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
            if (settingsRef.current && !settingsRef.current.contains(e.target)) { setShowSettings(false); setSettingsSearch(''); }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const PREVIEW_LIMIT = 6;
    const notifPreview = notifications.slice(0, PREVIEW_LIMIT);

    const handleMarkAllRead = () => markAllRead();
    const handleDismissNotif = (id, e) => {
        e.stopPropagation();
        markRead(id);
    };

    const handleViewAllNotifs = () => { setShowNotifPanel(false); onNavigate?.('notifications'); };

    const handleBellClick = () => { setShowNotifPanel(p => !p); setShowDropdown(false); setShowSettings(false); };

    const handleSettingsClick = () => { setShowSettings(p => !p); setShowDropdown(false); setShowNotifPanel(false); setSettingsSearch(''); };

    const handleSettingsNav = (id) => { setShowSettings(false); setSettingsSearch(''); onNavigate?.(id); };

    // Filter by search query
    const filteredSections = settingsSearch.trim()
        ? SETTINGS_SECTIONS.map(sec => ({
            ...sec,
            items: sec.items.filter(item =>
                item.label.toLowerCase().includes(settingsSearch.toLowerCase()) ||
                item.desc.toLowerCase().includes(settingsSearch.toLowerCase())
            ),
        })).filter(sec => sec.items.length > 0)
        : SETTINGS_SECTIONS;

    const riskColors = {
        SAFE: { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', label: 'SAFE' },
        WARNING: { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: 'WARNING' },
        DANGER: { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'DANGER' }
    };

    const currentRisk = riskColors[riskState];

    return (
        <nav
            className="flex w-full items-center justify-between px-8 h-16 text-white shadow-[0_4px_20px_0_rgba(0,0,0,0.14)] relative z-40 transition-all duration-300"
            style={{ background: `linear-gradient(60deg, ${theme?.navbarColor || '#288c6c'}, ${theme?.primaryColor || '#4ea752'})` }}
        >
            {/* ── Logo ── */}
            <div className="flex items-center gap-6 h-full">
                <div
                    className="flex items-center cursor-pointer h-full py-2"
                    onClick={() => onNavigate?.('dashboard')}
                >
                    <img
                        src={resolvedLogo}
                        alt="Logo"
                        className="h-11 w-auto object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300"
                    />
                </div>



                {/* ── Risk & M2M Stats (Master Prompt) ── */}
                <div className="hidden lg:flex items-center gap-4 bg-black/20 rounded-lg px-4 py-2 border border-white/10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">Live M2M</span>
                        <span className={`text-[13px] font-black leading-none mt-1 ${m2m >= 0 ? 'text-white' : 'text-red-400'}`}>
                            ₹{m2m.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">Margin</span>
                        <span className="text-[13px] font-black text-white leading-none mt-1">
                            ₹{margin.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${currentRisk.bg} ${currentRisk.border} animate-pulse`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${currentRisk.text.replace('text', 'bg')}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${currentRisk.text}`}>
                            {currentRisk.label}
                        </span>
                    </div>
                    {riskState === 'DANGER' && (
                        <div className="ml-2 px-3 py-1 bg-red-600 rounded text-[10px] font-bold text-white uppercase animate-bounce shadow-lg">
                            Auto Square Off Triggered
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-2">

                {/* ─── Settings Button ─── */}
                <div className="relative" ref={settingsRef}>
                    <button
                        id="topbar-settings-btn"
                        onClick={handleSettingsClick}
                        title="Settings"
                        className={`relative p-2 rounded-full transition-all duration-200 ${showSettings ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'
                            }`}
                    >
                        <Settings className={`w-5 h-5 transition-transform duration-500 ${showSettings ? 'rotate-90' : ''}`} />
                    </button>

                    {/* ── Settings Panel ── */}
                    {showSettings && (
                        <div
                            className="absolute right-0 mt-3 w-[380px] rounded-xl shadow-2xl z-50 overflow-hidden border border-white/10"
                            style={{
                                background: 'linear-gradient(180deg, #1e2a45 0%, #1a2035 100%)',
                                animation: 'topbarSlideDown 0.22s cubic-bezier(0.16,1,0.3,1) both',
                            }}
                        >
                            {/* Panel Header */}
                            <div
                                className="flex items-center justify-between px-4 py-3 border-b border-white/8"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-green-400" />
                                    <span className="text-white text-[13px] font-bold tracking-wide">Settings</span>
                                </div>
                                <button
                                    onClick={() => { setShowSettings(false); setSettingsSearch(''); }}
                                    className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="px-3 py-2.5 border-b border-white/5">
                                <div className="relative">
                                    <Settings className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search settings…"
                                        value={settingsSearch}
                                        onChange={e => setSettingsSearch(e.target.value)}
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[12px] text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-all"
                                    />
                                    {settingsSearch && (
                                        <button
                                            onClick={() => setSettingsSearch('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Settings Sections */}
                            <div className="max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                                {filteredSections.length === 0 ? (
                                    <div className="flex flex-col items-center py-10 gap-2 text-slate-500">
                                        <Info className="w-8 h-8" />
                                        <p className="text-[12px]">No results for "{settingsSearch}"</p>
                                    </div>
                                ) : (
                                    filteredSections.map((section) => (
                                        <div key={section.label}>
                                            {/* Section header */}
                                            <div className="px-4 pt-3 pb-1">
                                                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                    {section.label}
                                                </span>
                                            </div>
                                            {/* Items */}
                                            {section.items.map((item) => (
                                                <div key={item.id} className="group relative">
                                                    {item.type === 'toggle' ? (
                                                        <div className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all group">
                                                            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 transition-all border border-white/5 ${((item.id === 'whatsapp-alert' && communicationSettings.whatsapp) || (item.id === 'email-alert' && communicationSettings.email)) ? 'bg-green-500/15 border-green-500/20' : ''}`}>
                                                                <item.icon className={`w-4 h-4 transition-colors ${((item.id === 'whatsapp-alert' && communicationSettings.whatsapp) || (item.id === 'email-alert' && communicationSettings.email)) ? 'text-green-400' : 'text-slate-400'}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[12px] font-semibold text-slate-200 leading-tight">{item.label}</p>
                                                                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                                                            </div>
                                                            <div
                                                                onClick={() => setCommunicationSettings(prev => ({
                                                                    ...prev,
                                                                    [item.id === 'whatsapp-alert' ? 'whatsapp' : 'email']: !prev[item.id === 'whatsapp-alert' ? 'whatsapp' : 'email']
                                                                }))}
                                                                className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors duration-200 ${((item.id === 'whatsapp-alert' && communicationSettings.whatsapp) || (item.id === 'email-alert' && communicationSettings.email)) ? 'bg-green-500' : 'bg-slate-700'}`}
                                                            >
                                                                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${((item.id === 'whatsapp-alert' && communicationSettings.whatsapp) || (item.id === 'email-alert' && communicationSettings.email)) ? 'translate-x-4' : ''}`} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSettingsNav(item.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-all group text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-green-500/15 flex items-center justify-center flex-shrink-0 transition-all border border-white/5 group-hover:border-green-500/20">
                                                                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-green-400 transition-colors" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[12px] font-semibold text-slate-200 group-hover:text-white transition-colors leading-tight">
                                                                    {item.label}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors leading-tight mt-0.5 truncate">
                                                                    {item.desc}
                                                                </p>
                                                            </div>
                                                            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )}

                                {/* Quick actions footer */}
                                <div className="px-4 pt-2 pb-3 mt-1 border-t border-white/5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">Quick Actions</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => { handleSettingsNav('global-updation'); }}
                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/20 rounded-lg transition-all text-left group"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 text-slate-500 group-hover:text-green-400 transition-colors" />
                                            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-white">Emergency Revert</span>
                                        </button>
                                        <button
                                            onClick={() => { handleSettingsNav('action-ledger'); }}
                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/20 rounded-lg transition-all text-left group"
                                        >
                                            <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-green-400 transition-colors" />
                                            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-white">Audit Logs</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Bell Button ─── */}
                <div className="relative" ref={notifRef}>
                    <button
                        id="topbar-bell-btn"
                        onClick={handleBellClick}
                        title="Notifications"
                        className={`relative p-2 rounded-full transition-all duration-200 ${showNotifPanel ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'
                            }`}
                    >
                        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-[wiggle_1.5s_ease_infinite]' : ''}`} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none px-1 shadow-lg ring-2 ring-[#3a9e60] select-none pointer-events-none">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* ── Notifications Panel ── */}
                    {showNotifPanel && (
                        <div
                            className="absolute right-0 mt-3 w-[360px] rounded-xl shadow-2xl z-50 overflow-hidden border border-white/10"
                            style={{
                                background: 'linear-gradient(180deg, #1e2a45 0%, #1a2035 100%)',
                                animation: 'topbarSlideDown 0.22s cubic-bezier(0.16,1,0.3,1) both',
                            }}
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-green-400" />
                                    <span className="text-white text-[13px] font-bold">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-[10px] font-semibold text-green-400 hover:text-green-300 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all">
                                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[340px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                                {notifPreview.length === 0 && (
                                    <div className="flex flex-col items-center py-10 gap-2 text-slate-500">
                                        <Bell className="w-8 h-8 opacity-30" />
                                        <p className="text-[12px]">No notifications</p>
                                    </div>
                                )}
                                {notifPreview.map((notif) => {
                                    const isUnread = !notif.is_read;
                                    const style = TYPE_STYLE[notif.type] || TYPE_STYLE.info;
                                    return (
                                        <div
                                            key={notif.id}
                                            className="group relative flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-all hover:bg-white/4"
                                            style={{ background: isUnread ? style.bg : 'transparent' }}
                                            onClick={() => markRead(notif.id)}
                                        >
                                            <div className="flex-shrink-0 pt-1">
                                                <span className="block w-2 h-2 rounded-full mt-0.5" style={{ background: isUnread ? style.dot : 'rgba(255,255,255,0.15)' }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-[12px] font-bold uppercase tracking-wide leading-tight truncate ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0 mt-0.5">{timeAgo(notif.created_at || notif.createdAt)}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-2">{notif.message}</p>
                                            </div>
                                            <button
                                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all"
                                                onClick={(e) => handleDismissNotif(notif.id, e)}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={handleViewAllNotifs} className="w-full py-3 text-[11px] font-bold uppercase tracking-widest text-green-400 hover:text-green-300 hover:bg-white/5 transition-all border-t border-white/8 flex items-center justify-center gap-2">
                                View All Notifications <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ─── Profile Dropdown ─── */}
                <div className="relative ml-1" ref={dropdownRef}>
                    <div
                        onClick={() => { setShowDropdown(p => !p); setShowNotifPanel(false); setShowSettings(false); }}
                        className="flex items-center gap-3 text-white cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-sm overflow-hidden">
                            {resolvedProfileImage
                                ? <img src={resolvedProfileImage} alt="profile" className="w-full h-full object-cover" />
                                : <User className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold uppercase tracking-widest leading-none">{userName || 'DEMO PANEL'}</span>
                            <span className="text-[10px] opacity-80 font-medium tracking-tighter mt-1">{userRole?.toUpperCase() || 'TRADER'} ACCESS</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                    </div>

                    {showDropdown && (
                        <div
                            className="absolute right-0 mt-3 w-64 bg-[#1f283e] border border-white/10 rounded-lg shadow-2xl z-50 py-2 overflow-hidden"
                            style={{ animation: 'topbarSlideDown 0.2s cubic-bezier(0.16,1,0.3,1) both' }}
                        >
                            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                <p className="text-white text-sm font-semibold">{userName || 'DEMO PANEL'}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-green-400 text-[10px] font-bold tracking-widest">{userRole?.toUpperCase() || 'ADMIN'}</p>
                                    <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></div>
                                        <span className="text-[10px] font-mono font-bold text-blue-400">152.58.28.60</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { onNavigate?.('change-password'); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                <Lock className="w-4 h-4 text-slate-400" /> Change Login Password
                            </button>
                            <button onClick={() => { onNavigate?.('change-transaction-password'); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                <Key className="w-4 h-4 text-slate-400" /> Change Transaction Password
                            </button>
                            <div className="border-t border-white/10 mt-1">
                                <button onClick={() => { onLogout?.(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                                    <LogOut className="w-4 h-4" /> Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── CSS keyframes ── */}
            <style>{`
                @keyframes topbarSlideDown {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                @keyframes wiggle {
                    0%,100% { transform: rotate(0deg);  }
                    15%     { transform: rotate(10deg); }
                    30%     { transform: rotate(-9deg); }
                    45%     { transform: rotate(7deg);  }
                    60%     { transform: rotate(-5deg); }
                    75%     { transform: rotate(3deg);  }
                }
            `}</style>
        </nav>
    );
};

export default TopBar;
