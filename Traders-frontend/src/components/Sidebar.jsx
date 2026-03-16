import React from 'react';
import { Link } from 'react-router-dom';
import { ROLE_MENU_ACCESS } from '../context/AuthContext';

const ALL_MENU_ITEMS = [
    { id: 'live-m2m', label: 'Dashboard', icon: 'fa-table-columns' },
    // { id: 'kite-dashboard', label: 'Kite Dashboard', icon: 'fa-chart-line text-green-400' },
    { id: 'market-watch', label: 'Market Watch', icon: 'fa-arrow-trend-up' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
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
    { id: 'change-password', label: 'Change Login Password', icon: 'fa-user' },
    { id: 'change-transaction-password', label: 'Change Transaction Pwd', icon: 'fa-gear' },
    { id: 'withdrawal-requests', label: 'Withdrawal Requests', icon: 'fa-gear' },
    { id: 'deposit-requests', label: 'Deposit Requests', icon: 'fa-gear' },
    { id: 'negative-balance', label: 'Negative Balance Txns', icon: 'fa-bell' },
    // { id: 'learning', label: 'Learning Center', icon: 'fa-book-open' },
    { id: 'support', label: 'Raise Ticket', icon: 'fa-ticket' },
    { id: 'voice-modulation', label: 'Voice Modulation', icon: 'fa-microphone' },
];

const Sidebar = ({ onLogout, onNavigate, currentView, isOpen, onClose, userRole = 'admin', segment = 'NIFTY50' }) => {
    const allowedIds = ROLE_MENU_ACCESS[userRole] || ROLE_MENU_ACCESS['admin'];

    // Segment logic: Filter or Add context-specific items
    let menuItems = ALL_MENU_ITEMS.filter(item => allowedIds.includes(item.id));

    // If client, we can filter or reorder based on segment
    if (userRole === 'client') {
        // Just as an example, maybe some views are segment-restricted
        // For now, let's keep it simple but show segment in the UI
    }

    const roleBadge = {
        superadmin: { label: 'SUPER ADMIN', color: '#f59e0b' },
        admin: { label: 'ADMIN', color: '#4caf50' },
        broker: { label: 'BROKER', color: '#3b82f6' },
        client: { label: 'CLIENT', color: '#8b5cf6' },
    };
    const badge = roleBadge[userRole] || roleBadge['admin'];

    return (
        <aside className={`
      h-full bg-[#1a2035] text-white transition-all duration-300 ease-in-out flex-shrink-0 z-50
      fixed inset-y-0 left-0 w-[260px]
      md:relative md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      shadow-2xl
    `}>
            <div className="flex flex-col h-full border-r border-white/5 overflow-hidden">

                {/* Role Badge */}
                <div className="px-4 py-3 border-b border-white/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded tracking-widest"
                            style={{ background: badge.color + '22', color: badge.color, border: `1px solid ${badge.color}44` }}
                        >
                            {badge.label}
                        </span>
                        <span className="text-slate-500 text-[11px]">{menuItems.length} modules</span>
                    </div>
                    {/* Segment Indicator */}
                    <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1">
                        <i className="fa-solid fa-layer-group text-[10px] text-green-400"></i>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            Seg: {segment.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-2 overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="px-3 space-y-0.5">
                        {menuItems.map((item) => (
                            <Link
                                key={item.id}
                                to={`/${item.id}`}
                                onClick={() => {
                                    if (window.innerWidth < 768) onClose();
                                }}
                                className={`
                  w-full flex items-center px-3 py-2.5 rounded-md transition-all duration-200 group
                  ${currentView === item.id
                                        ? 'text-white shadow-lg'
                                        : 'text-[#bcc0cf] hover:bg-white/10 hover:text-white'}
                `}
                                style={currentView === item.id ? {
                                    background: 'linear-gradient(60deg, #288c6c, #4ea752)',
                                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)',
                                    fontWeight: '500'
                                } : {}}
                            >
                                <div className={`w-7 flex justify-center mr-2.5 transition-colors ${currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                    <i className={`fa-solid ${item.icon} text-[14px]`}></i>
                                </div>
                                <span className="text-[12px] font-normal truncate uppercase tracking-wide">{item.label}</span>
                            </Link>
                        ))}


                        {/* Logout */}
                        <div className="px-0 py-3 border-t border-white/10">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center px-3 py-2.5 text-[#bcc0cf] hover:bg-red-500/10 hover:text-red-400 rounded-md transition-all duration-200"
                            >
                                <div className="w-7 flex justify-center mr-2.5 text-slate-400">
                                    <i className="fa-solid fa-sign-out-alt text-[14px]"></i>
                                </div>
                                <span className="text-[12px] font-medium uppercase tracking-wide">Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
