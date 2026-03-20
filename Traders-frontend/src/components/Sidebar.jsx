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
    { id: 'voice-modulation', label: 'Voice Modulation', icon: 'fa-microphone' },
    { id: 'expiry-rules', label: 'Expiry Rules', icon: 'fa-calendar-xmark' },
    { id: 'change-password', label: 'Change Login Password', icon: 'fa-user' },
    { id: 'change-transaction-password', label: 'Change Transaction Pwd', icon: 'fa-gear' },
];

const Sidebar = ({ onLogout, currentView, isOpen, onClose }) => {
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
        // Use prefix matching for hierarchical routes
        if (currentView.startsWith('trading-clients')) return 'trading-clients';
        if (currentView.startsWith('brokers')) return 'brokers';
        if (currentView.startsWith('admins')) return 'admins';
        if (currentView.startsWith('trades')) return 'trades';
        if (currentView.startsWith('funds')) return 'funds';
        
        // Legacy/Direct mappings
        if (currentView === 'live-m2m-detail' || currentView === 'client-active-positions') return 'live-m2m';
        
        return currentView;
    })();

    return (
        <aside className={`
            h-full text-white transition-all duration-300 ease-in-out flex-shrink-0 z-50
            fixed inset-y-0 left-0 w-[260px]
            md:relative md:translate-x-0 md:top-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            shadow-2xl safe-top
        `} style={{ backgroundColor: 'var(--sidebar-color, #1a2035)' }}>
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
                            Seg: {(user?.segment || 'NIFTY50').replace('_', ' ')}
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
                                    ${activeView === item.id
                                        ? 'text-white shadow-lg'
                                        : 'text-[#bcc0cf] hover:bg-white/10 hover:text-white'}
                                `}
                                style={activeView === item.id ? {
                                    background: 'linear-gradient(60deg, var(--navbar-color, #288c6c), var(--primary-color, #4ea752))',
                                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)',
                                    fontWeight: '500',
                                } : {}}
                            >
                                <div className={`w-7 flex justify-center mr-2.5 transition-colors ${activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
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
