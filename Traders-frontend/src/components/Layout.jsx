import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import NotificationPopup from './common/NotificationPopup';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/shrishreenathjitraders.in.png';

const Layout = ({ children, onLogout, onNavigate, currentView }) => {
    const { user, logoPath, theme } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Admins see their uploaded logo; SuperAdmin always sees the bundled default logo
    const resolvedLogo = (user?.role === 'ADMIN' && logoPath)
        ? (logoPath.startsWith('http') ? logoPath : `http://localhost:5000${logoPath}`)
        : logo;

    // Navbar gradient uses theme CSS variables
    const navbarStyle = {
        background: `linear-gradient(60deg, ${theme?.navbarColor || '#288c6c'}, ${theme?.primaryColor || '#4ea752'})`,
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-color, #1a2035)', color: 'var(--text-color, #ffffff)' }}>
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

                {/* Mobile Header */}
                <div
                    className="flex items-center justify-between md:hidden px-6 h-16 text-white shadow-lg relative z-50 transition-all duration-300"
                    style={navbarStyle}
                >
                    <div className="flex items-center h-full py-3 overflow-hidden cursor-pointer"
                        onClick={() => onNavigate('dashboard')}>
                        <img
                            src={resolvedLogo}
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
                />

                {/* Backdrop for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col p-6" style={{ backgroundColor: 'var(--bg-color, #1a2035)' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
