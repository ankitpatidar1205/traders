import { useState, useMemo } from 'react';
import { Menu, X, Search } from 'lucide-react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import NotificationPopup from './common/NotificationPopup';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import logo from '../assets/shrishreenathjitraders.in.png';

const Layout = ({ children, onLogout, onNavigate, currentView }) => {
    const { user, logoPath, theme, isSuperAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');

    // Admins see their uploaded logo; SuperAdmin always sees the bundled default logo
    const resolvedLogo = (user?.role === 'ADMIN' && logoPath)
        ? (logoPath.startsWith('http') ? logoPath : `${api.UPLOADS_BASE_URL}${logoPath}`)
        : logo;


    // Navbar gradient uses theme CSS variables
    const navbarStyle = useMemo(() => ({
        background: `linear-gradient(60deg, ${theme?.navbarColor || '#288c6c'}, ${theme?.primaryColor || '#4ea752'})`,
    }), [theme?.navbarColor, theme?.primaryColor]);

    const handleMobileSearch = (e) => {
        e.preventDefault();
        if (mobileSearchQuery.trim()) {
            window.dispatchEvent(new CustomEvent('mobile-search', { detail: { query: mobileSearchQuery } }));
            setShowMobileSearch(false);
            setMobileSearchQuery('');
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden w-full fixed inset-0" style={{ backgroundColor: 'var(--bg-color, #1a2035)', color: 'var(--text-color, #ffffff)' }}>
            {/* Popup Notification - Disabled for SUPERADMIN */}
            {user && !isSuperAdmin() && <NotificationPopup user={user} />}

            {/* TopBar Area */}
            <header className="w-full z-40 flex-shrink-0 shadow-lg relative">
                {/* Desktop TopBar — hidden on mobile */}
                <div className="hidden md:block">
                    <TopBar
                        currentViewLabel={currentView}
                        onLogout={onLogout}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Mobile Header */}
                <div
                    className="flex items-center justify-between md:hidden px-4 h-16 text-white relative z-50 safe-top"
                    style={navbarStyle}
                >
                    <div
                        className="flex items-center h-full py-2 overflow-hidden cursor-pointer flex-shrink-0"
                        onClick={() => onNavigate('dashboard')}
                    >
                        <img
                            src={resolvedLogo}
                            alt="Logo"
                            className="h-10 w-auto max-w-[140px] object-contain mix-blend-multiply transition-transform active:scale-95"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowMobileSearch(v => !v)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5 text-white" />
                        </button>

                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                            aria-label="Menu"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {showMobileSearch && (
                    <form
                        onSubmit={handleMobileSearch}
                        className="md:hidden flex items-center gap-2 px-4 py-3 z-50 relative border-t border-white/10 animate-in slide-in-from-top duration-300"
                        style={navbarStyle}
                    >
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                            <input
                                autoFocus
                                type="text"
                                value={mobileSearchQuery}
                                onChange={e => setMobileSearchQuery(e.target.value)}
                                placeholder="Search everything..."
                                className="w-full bg-white/20 border border-white/30 rounded-full pl-10 pr-4 py-2 text-white text-sm placeholder-white/70 focus:outline-none focus:bg-white/30 transition-all shadow-inner"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowMobileSearch(false)}
                            className="p-2 text-white/80 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </form>
                )}
            </header>

            <div className="flex flex-1 overflow-hidden relative w-full">
                {/* PERSISTENT SIDEBAR */}
                <Sidebar
                    onLogout={onLogout}
                    onNavigate={onNavigate}
                    currentView={currentView}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Backdrop for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* DYNAMIC CONTENT AREA */}
                <main
                    id="content-area"
                    className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col p-4 sm:p-6 lg:p-8 safe-bottom relative z-0 scroll-smooth"
                    style={{ backgroundColor: 'var(--bg-color, #1a2035)' }}
                >
                    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 fill-mode-both">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
