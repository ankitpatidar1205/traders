import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import NotificationPopup from './common/NotificationPopup';
import ScrollingTicker from './common/ScrollingTicker';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/shrishreenathjitraders.in.png';

const Layout = ({ children, onLogout, onNavigate, currentView }) => {
    const { user, currentSegment } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userRole = user?.role || 'admin';
    const userName = user?.name || '';

    // Precise ticker messages from screenshot
    const tickerMessages = [
        { text: 'BANK NIFTY: 47,890.15 (+0.12%)', type: 'success' },
        { text: 'NEW MARGIN RULES ACTIVE FROM MONDAY', type: 'success' },
        { text: 'ALERT: MARKET VOLATILITY EXPECTED DURING US CPI DATA', type: 'success' },
        { text: 'NIFTY 50: 22,456.20 (-0.45%)', type: 'danger' }
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#1a2035]">
            {/* Popup Notification */}
            {user && <NotificationPopup user={user} />}

            {/* TopBar Area */}
            <header className="w-full z-40">
                {/* Desktop TopBar */}
                <div className="hidden md:block">
                    <TopBar
                        currentViewLabel={currentView}
                        onLogout={onLogout}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Mobile Header - Updated to match TopBar style */}
                <div className="flex items-center justify-between md:hidden px-6 h-16 text-white shadow-lg relative z-50 transition-all duration-300"
                    style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}>

                    {/* Tiny Logo for Mobile */}
                    <div className="flex items-center h-full py-3 overflow-hidden cursor-pointer"
                        onClick={() => onNavigate('dashboard')}>
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-full w-auto object-contain mix-blend-multiply"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar
                    onLogout={onLogout}
                    onNavigate={(view) => {
                        onNavigate(view);
                        setIsSidebarOpen(false);
                    }}
                    currentView={currentView}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    userRole={userRole}
                    segment={user?.segment || 'NIFTY50'}
                />

                {/* Backdrop for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col bg-[#1a2035] p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
