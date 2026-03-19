import { useState } from 'react';
import { Menu, X, Search, Bell } from 'lucide-react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import NotificationPopup from './common/NotificationPopup';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/shrishreenathjitraders.in.png';

const Layout = ({ children, onLogout, onNavigate, currentView }) => {
    const { user, logoPath, theme } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');

    // Admins see their uploaded logo; SuperAdmin always sees the bundled default logo
    const resolvedLogo = (user?.role === 'ADMIN' && logoPath)
        ? (logoPath.startsWith('http') ? logoPath : `http://https://trader-production-e063.up.railway.app${logoPath}`)
        : logo;

    // Navbar gradient uses theme CSS variables
    const navbarStyle = {
        background: `linear-gradient(60deg, ${theme?.navbarColor || '#288c6c'}, ${theme?.primaryColor || '#4ea752'})`,
    };

    const handleMobileSearch = (e) => {
        e.preventDefault();
        if (mobileSearchQuery.trim()) {
            // Trigger search via custom event so TopBar's useSearch can pick it up
            window.dispatchEvent(new CustomEvent('mobile-search', { detail: { query: mobileSearchQuery } }));
            setShowMobileSearch(false);
            setMobileSearchQuery('');
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-color, #1a2035)', color: 'var(--text-color, #ffffff)' }}>
            {/* Popup Notification - Disabled for SUPERADMIN */}
            {user && user.role !== 'SUPERADMIN' && <NotificationPopup user={user} />}

            {/* TopBar Area */}
            <header className="w-full z-40 flex-shrink-0">
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
                    className="flex items-center justify-between md:hidden px-3 h-14 text-white shadow-lg relative z-50 safe-top"
                    style={navbarStyle}
                >
                    {/* Logo */}
                    <div
                        className="flex items-center h-full py-2 overflow-hidden cursor-pointer flex-shrink-0"
                        onClick={() => onNavigate('dashboard')}
                    >
                        <img
                            src={resolvedLogo}
                            alt="Logo"
                            className="h-full w-auto max-w-[120px] object-contain mix-blend-multiply"
                        />
                    </div>

                    {/* Right side icons */}
                    <div className="flex items-center gap-1">
                        {/* Search icon */}
                        <button
                            onClick={() => setShowMobileSearch(v => !v)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Hamburger */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                            aria-label="Menu"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar — slides down when open */}
                {showMobileSearch && (
                    <form
                        onSubmit={handleMobileSearch}
                        className="md:hidden flex items-center gap-2 px-3 py-2 z-50 relative"
                        style={navbarStyle}
                    >
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                            <input
                                autoFocus
                                type="text"
                                value={mobileSearchQuery}
                                onChange={e => setMobileSearchQuery(e.target.value)}
                                placeholder="Search anything..."
                                className="w-full bg-white/15 border border-white/20 rounded-full pl-9 pr-4 py-2 text-white text-sm placeholder-white/60 focus:outline-none focus:bg-white/25 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
                        >
                            Go
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowMobileSearch(false)}
                            className="p-1 text-white/70"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </form>
                )}
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
                />

                {/* Backdrop for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main content — tighter padding on mobile */}
                <main
                    className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col p-3 sm:p-4 md:p-6 safe-bottom"
                    style={{ backgroundColor: 'var(--bg-color, #1a2035)' }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
