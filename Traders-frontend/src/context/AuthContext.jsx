import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Role definitions - who can see what
export const ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    ADMIN: 'ADMIN',
    BROKER: 'BROKER',
    TRADER: 'TRADER',
};

// Menu items allowed per role
export const ROLE_MENU_ACCESS = {
    SUPERADMIN: [
        'live-m2m', 'kite-dashboard', 'market-watch', 'notifications', 'action-ledger',
        'active-positions', 'closed-positions', 'trading-clients', 'trades',
        'group-trades', 'closed-trades', 'deleted-trades', 'pending-orders',
        'funds', 'brokers', 'tickers', 'banned', 'bank',
        'new-client-bank', 'accounts', 'broker-accounts', 'ip-logins',
        'trade-ip-tracking', 'global-updation', 'change-password',
        'change-transaction-password', 'withdrawal-requests',
        'deposit-requests', 'negative-balance', 'admins',
        'learning', 'support', 'voice-modulation', 'signal-admin', 'signals'
    ],
    ADMIN: [
        'live-m2m', 'kite-dashboard', 'market-watch', 'notifications', 'active-positions',
        'closed-positions', 'trading-clients', 'brokers', 'trades',
        'group-trades', 'closed-trades', 'deleted-trades', 'pending-orders',
        'funds', 'tickers', 'banned', 'new-client-bank',
        'accounts', 'broker-accounts', 'change-password', 'change-transaction-password',
        'withdrawal-requests', 'deposit-requests', 'negative-balance',
        'learning', 'support', 'voice-modulation', 'signal-admin', 'signals'
    ],
    BROKER: [
        'live-m2m', 'active-positions', 'closed-positions', 'trades',
        'trading-clients', 'funds', 'notifications', 'pending-orders',
        'change-password', 'change-transaction-password',
        'learning', 'support', 'voice-modulation', 'signals'
    ],
    TRADER: [
        'live-m2m', 'market-watch', 'notifications', 'active-positions',
        'closed-positions', 'trades', 'closed-trades', 'pending-orders',
        'funds', 'change-password', 'change-transaction-password',
        'learning', 'support', 'voice-modulation', 'signals'
    ],
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('traders_user');
            const valid = localStorage.getItem('traders_session_valid');
            if (saved && valid === 'true') return JSON.parse(saved);
        } catch (_) { }
        return null;
    });

    const [currentSegment, setCurrentSegment] = useState(() => {
        const saved = localStorage.getItem('traders_segment');
        return saved || 'NIFTY50';
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('traders_user', JSON.stringify(user));
            localStorage.setItem('traders_session_valid', 'true');
            if (!localStorage.getItem('traders_segment')) {
                setCurrentSegment(user.segment || 'NIFTY50');
            }
        } else {
            localStorage.removeItem('traders_user');
            localStorage.removeItem('traders_session_valid');
            localStorage.removeItem('traders_segment');
        }
    }, [user]);

    useEffect(() => {
        if (currentSegment) {
            localStorage.setItem('traders_segment', currentSegment);
        }
    }, [currentSegment]);

    const login = (username, role = ROLES.ADMIN, extraData = {}) => {
        const segment = extraData.segment || 'NIFTY50';
        const userData = {
            name: username,
            role,
            segment,
            email: extraData.email || '',
            mobile: extraData.mobile || '',
            userId: extraData.userId || Math.floor(Math.random() * 1000000).toString(),
            ...extraData
        };
        setUser(userData);
        setCurrentSegment(segment);
    };

    const logout = () => {
        setUser(null);
        setCurrentSegment('NIFTY50');
        localStorage.removeItem('traders_user');
        localStorage.removeItem('traders_view');
        localStorage.removeItem('traders_session_valid');
        localStorage.removeItem('traders_segment');
        localStorage.removeItem('traders_token');
    };

    const switchSegment = (newSegment) => {
        setCurrentSegment(newSegment);
    };

    const canAccess = (menuId) => {
        if (!user) return false;
        const allowed = ROLE_MENU_ACCESS[user.role] || [];
        return allowed.includes(menuId);
    };

    const isSuperAdmin = () => user?.role === ROLES.SUPERADMIN;
    const isAdmin = () => [ROLES.SUPERADMIN, ROLES.ADMIN].includes(user?.role);
    const isBroker = () => user?.role === ROLES.BROKER;
    const isClient = () => user?.role === ROLES.TRADER;

    return (
        <AuthContext.Provider value={{
            user, currentSegment, login, logout, switchSegment,
            canAccess, isSuperAdmin, isAdmin, isBroker, isClient
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

export default AuthContext;
