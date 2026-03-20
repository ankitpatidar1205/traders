import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALL_MENU_ITEMS = [
    { id: 'live-m2m', label: 'Dashboard', icon: 'fa-table-columns' },
    { id: 'kite-dashboard', label: 'Kite Dashboard', icon: 'fa-chart-line' },
    { id: 'voice-modulation', label: 'Voice Modulation', icon: 'fa-microphone' },
    { id: 'market-watch', label: 'Market Watch', icon: 'fa-arrow-trend-up' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
    { id: 'user-notifications', label: 'Sent Message', icon: 'fa-paper-plane' },
    { id: 'action-ledger', label: 'Action Ledger', icon: 'fa-podcast' },
    { id: 'active-positions', label: 'Active Positions', icon: 'fa-certificate' },
    { id: 'closed-positions', label: 'Closed Positions', icon: 'fa-certificate' },
    { id: 'trading-clients', label: 'Trading Clients', icon: 'fa-regular fa-face-flushed' },
    { id: 'trades', label: 'Trades', icon: 'fa-tag' },
    { id: 'group-trades', label: 'Group Trades', icon: 'fa-tag' },
    { id: 'closed-trades', label: 'Closed Trades', icon: 'fa-tag' },
    { id: 'deleted-trades', label: 'Deleted Trades', icon: 'fa-tag' },
    { id: 'pending-orders', label: 'Pending Orders', icon: 'fa-swatchbook' },
    { id: 'funds', label: 'Trader Funds', icon: 'fa-circle-dollar-to-slot' },
    { id: 'brokers', label: 'Brokers', icon: 'fa-user-group' },
    { id: 'admins', label: 'Admins', icon: 'fa-user-shield' },
    { id: 'tickers', label: 'Tickers', icon: 'fa-calculator' },
    { id: 'banned', label: 'Banned Limit Orders', icon: 'fa-ban' },
    { id: 'bank', label: 'Bank Details', icon: 'fa-building-columns' },
    { id: 'new-client-bank', label: 'Bank Details For New', icon: 'fa-building-columns' },
    { id: 'accounts', label: 'Accounts', icon: 'fa-calculator' },
    { id: 'broker-accounts', label: 'Broker Accounts', icon: 'fa-calculator' },
    { id: 'ip-logins', label: 'IP Logins', icon: 'fa-shield-halved' },
    { id: 'trade-ip-tracking', label: 'Trade IP Tracking', icon: 'fa-location-dot' },
    { id: 'global-updation', label: 'Global Updation', icon: 'fa-earth-americas' },
    { id: 'withdrawal-requests', label: 'Withdrawal Requests', icon: 'fa-gear' },
    { id: 'deposit-requests', label: 'Deposit Requests', icon: 'fa-gear' },
    { id: 'negative-balance', label: 'Negative Balance Txns', icon: 'fa-bell' },
    { id: 'support', label: 'Raise Ticket', icon: 'fa-ticket' },
    { id: 'expiry-rules', label: 'Expiry Rules', icon: 'fa-calendar-xmark' },
    { id: 'change-password', label: 'Change Login Password', icon: 'fa-user' },
    { id: 'change-transaction-password', label: 'Change Transaction Pwd', icon: 'fa-gear' },
];

const Sidebar = React.memo(({ onLogout, currentView, isOpen, onClose }) => {
    const { user, canAccess } = useAuth();
    const userRole = user?.role || 'ADMIN';

    const menuItems = ALL_MENU_ITEMS.filter(item => canAccess(item.id));

    const roleBadge = {
        SUPERADMIN: { label: 'SUPER ADMIN', color: '#f59e0b' },
        ADMIN:      { label: 'ADMIN',       color: '#4caf50' },
        BROKER:     { label: 'BROKER',      color: '#3b82f6' },
        TRADER:     { label: 'CLIENT',      color: '#8b5cf6' },
    };
    const badge = roleBadge[userRole] || roleBadge['ADMIN'];

    const activeView = (() => {
        if (!currentView) return '';
        if (currentView.startsWith('trading-clients')) return 'trading-clients';
        if (currentView.startsWith('brokers')) return 'brokers';
        if (currentView.startsWith('admins')) return 'admins';
        if (currentView.startsWith('trades')) return 'trades';
        if (currentView.startsWith('funds')) return 'funds';
        if (currentView === 'live-m2m-detail' || currentView === 'client-active-positions') return 'live-m2m';
        return currentView;
    })();

    return (
        <aside 
            className={`
                fixed inset-y-0 left-0 z-50 w-[260px] text-white 
                transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                flex-shrink-0 border-r border-white/5 shadow-2xl
            `} 
            style={{ backgroundColor: 'var(--sidebar-color, #1a2035)' }}
        >
            <div className="flex flex-col h-full overflow-hidden">
                {/* Role Badge */}
                <div className="px-4 py-4 border-b border-white/10 flex flex-col gap-2 bg-black/10">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase border"
                            style={{ background: badge.color + '22', color: badge.color, borderColor: badge.color + '44' }}
                        >
                            {badge.label}
                        </span>
                        <span className="text-slate-500 text-[11px] font-medium">{menuItems.length} modules</span>
                    </div>
                    {/* Segment Indicator */}
                    <div className="flex items-center gap-2 bg-white/5 rounded px-2.5 py-1.5 border border-white/5">
                        <i className="fa-solid fa-layer-group text-[10px] text-green-400"></i>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">
                            Seg: {(user?.segment || 'NIFTY50').replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="px-3 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = activeView === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    to={`/${item.id}`}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={`
                                        w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group relative
                                        ${isActive
                                            ? 'text-white shadow-lg'
                                            : 'text-[#bcc0cf] hover:bg-white/5 hover:text-white'}
                                    `}
                                    style={isActive ? {
                                        background: 'linear-gradient(60deg, var(--navbar-color, #288c6c), var(--primary-color, #4ea752))',
                                        boxShadow: '0 4px 15px -3px rgba(0,0,0,0.3)',
                                    } : {}}
                                >
                                    <div className={`w-8 flex justify-center mr-2 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                        <i className={`fa-solid ${item.icon} text-[15px]`}></i>
                                    </div>
                                    <span className={`text-[12px] uppercase tracking-wider truncate transition-all ${isActive ? 'font-bold' : 'font-normal'}`}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/10 bg-black/5">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center px-4 py-2.5 text-[#bcc0cf] hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200 group"
                    >
                        <div className="w-8 flex justify-center mr-2 text-slate-400 group-hover:text-red-400 transition-colors">
                            <i className="fa-solid fa-sign-out-alt text-[15px]"></i>
                        </div>
                        <span className="text-[12px] font-bold uppercase tracking-wider">Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
