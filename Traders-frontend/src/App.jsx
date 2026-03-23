import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AccountsPage from './pages/accounts/AccountsPage';
import BrokerAccountsPage from './pages/accounts/BrokerAccountsPage';
import BannedLimitOrdersPage from './pages/banned/BannedLimitOrdersPage';
import BankDetailsPage from './pages/bank/BankDetailsPage';
import TradesPage from './pages/trades/TradesPage';
import TickersPage from './pages/tickers/TickersPage';
import LiveM2MPage from './pages/dashboard/LiveM2MPage';
import KiteDashboard from './pages/dashboard/KiteDashboard';
import LiveM2MDetailPage from './pages/dashboard/LiveM2MDetailPage';
import ClientActivePositionsPage from './pages/dashboard/ClientActivePositionsPage';
import BrokerM2MPage from './pages/dashboard/BrokerM2MPage';
import ActivePositionsPage from './pages/positions/ActivePositionsPage';
import TraderFundsPage from './pages/funds/TraderFundsPage';
import ActiveTradesPage from './pages/trades/ActiveTradesPage';
import ClosedTradesPage from './pages/trades/ClosedTradesPage';
import MarketWatchPage from './pages/market/MarketWatchPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import UserNotificationsPage from './pages/notifications/UserNotificationsPage';
import ClosedPositionsPage from './pages/positions/ClosedPositionsPage';
import TradingClientsPage from './pages/clients/TradingClientsPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import NewClientBankDetailsPage from './pages/bank/NewClientBankDetailsPage';
import ChangePasswordPage from './pages/settings/ChangePasswordPage';
import ChangeTransactionPasswordPage from './pages/settings/ChangeTransactionPasswordPage';
import GroupTradesPage from './pages/trades/GroupTradesPage';
import DeletedTradesPage from './pages/trades/DeletedTradesPage';
import DepositRequestsPage from './pages/requests/DepositRequestsPage';
import WithdrawalRequestsPage from './pages/requests/WithdrawalRequestsPage';
import NegativeBalanceTxnsPage from './pages/transactions/NegativeBalanceTxnsPage';
import PendingOrdersPage from './pages/orders/PendingOrdersPage';
import ScripDataPage from './pages/data/ScripDataPage';
import UsersPage from './pages/users/UsersPage';
import CreateFundForm from './components/CreateFundForm';
import AddBrokerForm from './components/AddBrokerForm';
import CreateTradeForm from './components/CreateTradeForm';
import SimpleAddUserForm from './components/SimpleAddUserForm';
import SimpleTraderForm from './components/SimpleTraderForm';
import CreateClientPage from './pages/clients/CreateClientPage';
import GlobalUpdationPage from './pages/settings/GlobalUpdationPage';
import ThemeSettingsPage from './pages/settings/ThemeSettingsPage';
import AccessDenied from './components/common/AccessDenied';
import LearningPage from './pages/learning/LearningPage';
import SignalAdminPage from './pages/trades/SignalAdminPage';
import SignalsPage from './pages/trades/SignalsPage';
import RaiseTicketPage from './pages/support/RaiseTicketPage';
import VoiceModulationPage from './pages/voice/VoiceModulationPage';
import AIAssistantPage from './pages/ai/AIAssistantPage';
import ClientDetailsForm from './components/ClientDetailsForm';
import Toast from './components/common/Toast';
import EditBrokerPage from './pages/brokers/EditBrokerPage';
import ViewBrokerPage from './pages/brokers/ViewBrokerPage';
import EditAdminPage from './pages/users/EditAdminPage';
import GlobalSettingsPage from './pages/settings/GlobalSettingsPage';
import ActionLedgerPage from './pages/logs/ActionLedgerPage';
import IpLoginsPage from './pages/logs/IpLoginsPage';
import TradeIpTrackingPage from './pages/logs/TradeIpTrackingPage';
import ExpiryRulesPage from './pages/settings/ExpiryRulesPage';
import KycUploadPage from './pages/clients/KycUploadPage';

import { useAuth, ROLES } from './context/AuthContext';
import * as api from './services/api';

function App() {
    const { user, login: authLogin, logout: authLogout, canAccess, applyInitData } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // View state is now derived from URL
    const view = location.pathname.substring(1) || 'live-m2m';

    const [selectedClient, setSelectedClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const setView = (v) => {
        navigate(`/${v}`);
    };

    const handleLogin = async (username, password) => {
        try {
            const response = await api.login(username, password);

            // Store token for API headers
            localStorage.setItem('token', response.token);

            // Proceed with AuthContext login
            authLogin(response.user.username, response.user.role, {
                ...response.user,
                userId: response.user.id,
                fullName: response.user.fullName,
            });

            // Load menu permissions, theme, and logo for this user
            try {
                const initData = await api.getInitData();
                applyInitData(initData);
            } catch (initErr) {
                console.warn('Init data load failed (non-critical):', initErr.message);
            }

            // Role-based navigation
            if (response.user.role === ROLES.TRADER) {
                navigate('/market-watch');
            } else {
                navigate('/live-m2m');
            }
        } catch (err) {
            console.error('Login error:', err);
            setToast({ message: err.message || 'Login failed', type: 'error' });
        }
    };

    const handleLogout = () => {
        authLogout();
        navigate('/');
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [clientsData, tradesData] = await Promise.all([
                api.getClients(),
                api.getTrades()
            ]);
            setClients(clientsData || []);
            setTrades(tradesData || []);
        } catch (err) {
            console.error('Initial fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleActionSuccess = (message, redirectTo = 'trading-clients') => {
        fetchInitialData();
        if (redirectTo) setView(redirectTo);
        setToast({ message, type: 'success' });
    };

    const handleAddClient = (redirectTo = 'trading-clients') => {
        handleActionSuccess('Created successfully!', redirectTo);
    };

    const handleAddTrade = async (newTradeData) => {
        try {
            await api.createTrade(newTradeData);
            fetchInitialData();
            setView('trades');
            setToast({ message: 'Trade placed successfully!', type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to place trade: ' + err.message, type: 'error' });
        }
    };

    const handleDeposit = (client) => {
        setSelectedClient(client);
        setView('trading-clients/deposit');
    };

    const handleWithdraw = (client) => {
        setSelectedClient(client);
        setView('trading-clients/withdraw');
    };

    const ProtectedRoute = ({ children, viewId }) => {
        if (viewId && !canAccess(viewId)) {
            return <AccessDenied onGoBack={() => navigate('/live-m2m')} />;
        }
        return children;
    };

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <Layout
            onLogout={handleLogout}
            onNavigate={setView}
            currentView={view}
            user={user}
            userRole={user?.role || 'ADMIN'}
            userName={user?.name || ''}
        >
            <Routes>
                {/* Default Route */}
                <Route path="/" element={<Navigate to="/live-m2m" replace />} />

                {/* Main Views */}
                <Route path="/live-m2m" element={<LiveM2MPage user={user} onNavigate={(v, client) => {
                    if (client) setSelectedClient(client);
                    setView(v);
                }} />} />

                <Route path="/kite-dashboard" element={<KiteDashboard />} />
                
                <Route path="/live-m2m-detail" element={<LiveM2MDetailPage
                    selectedClient={selectedClient}
                    onBack={() => setView('live-m2m')}
                    onClientClick={(client) => {
                        setSelectedClient(client);
                        setView('client-active-positions');
                    }}
                />} />

                <Route path="/accounts" element={<ProtectedRoute viewId="accounts"><AccountsPage /></ProtectedRoute>} />
                <Route path="/banned" element={<ProtectedRoute viewId="banned"><BannedLimitOrdersPage /></ProtectedRoute>} />
                <Route path="/bank" element={<ProtectedRoute viewId="bank"><BankDetailsPage /></ProtectedRoute>} />
                <Route path="/trades" element={<ProtectedRoute viewId="trades"><TradesPage trades={trades} onCreateClick={() => setView('trades/create')} /></ProtectedRoute>} />
                <Route path="/trades/create" element={<CreateTradeForm onSave={handleAddTrade} onBack={() => setView('trades')} onLogout={handleLogout} onNavigate={setView} />} />
                
                <Route path="/tickers" element={<ProtectedRoute viewId="tickers"><TickersPage /></ProtectedRoute>} />
                <Route path="/broker-m2m" element={<ProtectedRoute viewId="broker-m2m"><BrokerM2MPage /></ProtectedRoute>} />
                <Route path="/active-positions" element={<ProtectedRoute viewId="active-positions"><ActivePositionsPage onNavigate={setView} /></ProtectedRoute>} />
                <Route path="/funds" element={<TraderFundsPage onNavigate={setView} />} />
                <Route path="/funds/create" element={<CreateFundForm onBack={() => setView('funds')} onSave={(data) => handleActionSuccess('Fund entry created successfully', 'funds')} />} />
                
                <Route path="/active-trades" element={<ProtectedRoute viewId="active-trades"><ActiveTradesPage /></ProtectedRoute>} />
                <Route path="/closed-trades" element={<ProtectedRoute viewId="closed-trades"><ClosedTradesPage /></ProtectedRoute>} />
                <Route path="/market-watch" element={<ProtectedRoute viewId="market-watch"><MarketWatchPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/user-notifications" element={<UserNotificationsPage />} />
                <Route path="/closed-positions" element={<ProtectedRoute viewId="closed-positions"><ClosedPositionsPage /></ProtectedRoute>} />
                
                <Route path="/trading-clients" element={<ProtectedRoute viewId="trading-clients"><TradingClientsPage
                    onLogout={handleLogout}
                    onNavigate={setView}
                    onDepositClick={handleDeposit}
                    onWithdrawClick={handleWithdraw}
                /></ProtectedRoute>} />

                <Route path="/trading-clients/create" element={<CreateClientPage onClose={() => setView('trading-clients')} onSave={() => handleActionSuccess('Client created successfully', 'trading-clients')} onLogout={handleLogout} onNavigate={setView} />} />
                <Route path="/trading-clients/details" element={<ClientDetailPage
                    client={selectedClient}
                    onClose={() => setView('trading-clients')}
                    onNavigate={setView}
                    onLogout={handleLogout}
                />} />
                <Route path="/trading-clients/edit" element={<ClientDetailsForm
                    initialData={selectedClient}
                    onSave={() => handleActionSuccess(`${selectedClient?.role || 'User'} updated successfully`, 
                        selectedClient?.role === 'ADMIN' ? 'admins' : 
                        selectedClient?.role === 'BROKER' ? 'brokers' : 'trading-clients')}
                    onBack={() => {
                        const role = selectedClient?.role;
                        if (role === 'ADMIN') setView('admins');
                        else if (role === 'BROKER') setView('brokers');
                        else setView('trading-clients');
                    }}
                />} />
                <Route path="/trading-clients/deposit" element={<CreateFundForm onBack={() => setView('trading-clients')} onSave={(data) => handleActionSuccess('Deposit successful', 'trading-clients')} mode="deposit" initialUser={selectedClient} />} />
                <Route path="/trading-clients/withdraw" element={<CreateFundForm onBack={() => setView('trading-clients')} onSave={(data) => handleActionSuccess('Withdrawal successful', 'trading-clients')} mode="withdraw" initialUser={selectedClient} />} />
                <Route path="/trading-clients/kyc/:id" element={<KycUploadPage />} />

                <Route path="/admins" element={<ProtectedRoute viewId="admins"><UsersPage onNavigate={(v, row) => { if (row) setSelectedClient(row); setView(v); }} roleFilter="ADMIN" /></ProtectedRoute>} />
                <Route path="/admins/create" element={<SimpleAddUserForm role="Admin" onBack={() => setView('admins')} onSave={() => handleActionSuccess('Admin created successfully', 'admins')} />} />
                <Route path="/admins/edit/:id" element={<EditAdminPage />} />

                <Route path="/brokers" element={<ProtectedRoute viewId="brokers"><UsersPage onNavigate={(v, row) => { if (row) setSelectedClient(row); setView(v); }} roleFilter="BROKER" /></ProtectedRoute>} />
                <Route path="/brokers/create" element={<AddBrokerForm onBack={() => setView('brokers')} onSave={() => handleActionSuccess('Broker created successfully', 'brokers')} />} />
                <Route path="/brokers/edit/:id" element={<EditBrokerPage onSave={() => handleActionSuccess('Broker updated successfully', 'brokers')} onBack={() => setView('brokers')} />} />
                <Route path="/brokers/view/:id" element={<ViewBrokerPage onBack={() => setView('brokers')} />} />
                
                <Route path="/broker-accounts" element={<ProtectedRoute viewId="broker-accounts"><BrokerAccountsPage /></ProtectedRoute>} />

                {/* Redirect old /users to /trading-clients */}
                <Route path="/users" element={<Navigate to="/trading-clients" replace />} />
                <Route path="/new-client-bank" element={<ProtectedRoute viewId="new-client-bank"><NewClientBankDetailsPage /></ProtectedRoute>} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/change-transaction-password" element={<ChangeTransactionPasswordPage />} />
                
                <Route path="/deleted-trades" element={<ProtectedRoute viewId="deleted-trades"><DeletedTradesPage /></ProtectedRoute>} />
                <Route path="/withdrawal-requests" element={<ProtectedRoute viewId="withdrawal-requests"><WithdrawalRequestsPage /></ProtectedRoute>} />
                <Route path="/deposit-requests" element={<ProtectedRoute viewId="deposit-requests"><DepositRequestsPage /></ProtectedRoute>} />
                <Route path="/negative-balance" element={<ProtectedRoute viewId="negative-balance"><NegativeBalanceTxnsPage /></ProtectedRoute>} />
                
                <Route path="/pending-orders" element={<ProtectedRoute viewId="pending-orders"><PendingOrdersPage /></ProtectedRoute>} />
                <Route path="/scrip-data" element={<ProtectedRoute viewId="scrip-data"><ScripDataPage /></ProtectedRoute>} />
                <Route path="/group-trades" element={<ProtectedRoute viewId="group-trades"><GroupTradesPage /></ProtectedRoute>} />
                <Route path="/global-updation" element={<ProtectedRoute viewId="global-updation"><GlobalUpdationPage /></ProtectedRoute>} />
                <Route path="/theme-settings" element={<ProtectedRoute viewId="theme-settings"><ThemeSettingsPage /></ProtectedRoute>} />
                <Route path="/global-settings" element={<ProtectedRoute viewId="global-settings"><GlobalSettingsPage onBack={() => setView('live-m2m')} /></ProtectedRoute>} />
                
                <Route path="/action-ledger" element={<ProtectedRoute viewId="action-ledger"><ActionLedgerPage /></ProtectedRoute>} />
                <Route path="/ip-logins" element={<ProtectedRoute viewId="ip-logins"><IpLoginsPage /></ProtectedRoute>} />
                <Route path="/trade-ip-tracking" element={<ProtectedRoute viewId="trade-ip-tracking"><TradeIpTrackingPage /></ProtectedRoute>} />
                
                <Route path="/learning" element={<LearningPage segment={user?.segment} />} />
                <Route path="/support" element={<RaiseTicketPage user={user} />} />
                <Route path="/voice-modulation" element={<VoiceModulationPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/signal-admin" element={<SignalAdminPage />} />
                <Route path="/signals" element={<SignalsPage />} />
                <Route path="/expiry-rules" element={<ProtectedRoute viewId="expiry-rules"><ExpiryRulesPage /></ProtectedRoute>} />
                <Route path="/kyc-verification/:id" element={<KycUploadPage />} />


                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/live-m2m" replace />} />
            </Routes>
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'success' })} 
            />
        </Layout>
    );
}

export default App;
