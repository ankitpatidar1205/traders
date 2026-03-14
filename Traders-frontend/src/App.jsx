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
import ActionLedgerPage from './pages/logs/ActionLedgerPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
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
import IpLoginsPage from './pages/logs/IpLoginsPage';
import TradeIpTrackingPage from './pages/logs/TradeIpTrackingPage';
import GlobalUpdationPage from './pages/settings/GlobalUpdationPage';
import AccessDenied from './components/common/AccessDenied';
import LearningPage from './pages/learning/LearningPage';
import SignalAdminPage from './pages/trades/SignalAdminPage';
import SignalsPage from './pages/trades/SignalsPage';
import RaiseTicketPage from './pages/support/RaiseTicketPage';
import VoiceModulationPage from './pages/voice/VoiceModulationPage';
import ClientDetailsForm from './components/ClientDetailsForm';
import Toast from './components/common/Toast';

import { useAuth } from './context/AuthContext';
import * as api from './services/api';

function App() {
    const { user, login: authLogin, logout: authLogout, canAccess } = useAuth();
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
            localStorage.setItem('traders_token', response.token);
            
            // Proceed with AuthContext login
            authLogin(response.user.username, response.user.role, {
                userId: response.user.id,
                fullName: response.user.fullName
            });

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
        setView('live-m2m');
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

    const handleAddClient = () => {
        // Forms make API calls directly; this handles post-save navigation
        fetchInitialData();
        setView('users');
        setToast({ message: 'Created successfully!', type: 'success' });
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
        setView('create-fund-deposit');
    };

    const handleWithdraw = (client) => {
        setSelectedClient(client);
        setView('create-fund-withdraw');
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

                <Route path="/client-active-positions" element={<ClientActivePositionsPage
                    client={selectedClient}
                    onBack={() => setView('live-m2m-detail')}
                    onNavigateToAccount={(client) => {
                        setSelectedClient(client);
                        setView('client-details');
                    }}
                />} />

                <Route path="/edit" element={<ClientDetailsForm onBack={() => setView('users')} />} />
                <Route path="/accounts" element={<ProtectedRoute viewId="accounts"><AccountsPage /></ProtectedRoute>} />
                <Route path="/banned" element={<ProtectedRoute viewId="banned"><BannedLimitOrdersPage /></ProtectedRoute>} />
                <Route path="/bank" element={<ProtectedRoute viewId="bank"><BankDetailsPage /></ProtectedRoute>} />
                <Route path="/trades" element={<TradesPage trades={trades} onCreateClick={() => setView('create-trade')} />} />
                <Route path="/tickers" element={<ProtectedRoute viewId="tickers"><TickersPage /></ProtectedRoute>} />
                <Route path="/broker-m2m" element={<BrokerM2MPage />} />
                <Route path="/active-positions" element={<ActivePositionsPage onNavigate={setView} />} />
                <Route path="/funds" element={<TraderFundsPage onNavigate={setView} />} />
                <Route path="/create-fund" element={<CreateFundForm onBack={() => setView('funds')} onSave={(data) => { console.log('Fund Saved:', data); setView('funds'); }} />} />
                <Route path="/active-trades" element={<ActiveTradesPage />} />
                <Route path="/closed-trades" element={<ClosedTradesPage />} />
                <Route path="/market-watch" element={<MarketWatchPage />} />
                <Route path="/action-ledger" element={<ProtectedRoute viewId="action-ledger"><ActionLedgerPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/closed-positions" element={<ClosedPositionsPage />} />
                
                <Route path="/users" element={<TradingClientsPage
                    onLogout={handleLogout}
                    onNavigate={setView}
                    onDepositClick={handleDeposit}
                    onWithdrawClick={handleWithdraw}
                />} />

                <Route path="/create-client" element={<SimpleTraderForm onBack={() => setView('users')} onSave={handleAddClient} />} />
                <Route path="/create-admin" element={<SimpleAddUserForm role="Admin" onBack={() => setView('users')} onSave={handleAddClient} />} />
                <Route path="/create-broker" element={<AddBrokerForm onBack={() => setView('users')} onSave={handleAddClient} />} />
                <Route path="/broker-accounts" element={<ProtectedRoute viewId="broker-accounts"><BrokerAccountsPage /></ProtectedRoute>} />
                
                <Route path="/create-fund-deposit" element={<CreateFundForm onBack={() => setView('users')} onSave={(data) => { console.log('Deposit Saved:', data); setView('users'); }} mode="deposit" initialUser={selectedClient} />} />
                <Route path="/create-fund-withdraw" element={<CreateFundForm onBack={() => setView('users')} onSave={(data) => { console.log('Withdraw Saved:', data); setView('users'); }} mode="withdraw" initialUser={selectedClient} />} />
                
                <Route path="/client-details" element={<ClientDetailPage
                    client={selectedClient}
                    onClose={() => setView('users')}
                    onNavigate={setView}
                    onLogout={handleLogout}
                />} />

                <Route path="/admins" element={<ProtectedRoute viewId="admins"><UsersPage onNavigate={setView} roleFilter="ADMIN" /></ProtectedRoute>} />
                <Route path="/trading-clients" element={<ProtectedRoute viewId="trading-clients"><UsersPage onNavigate={setView} roleFilter="BROKER" /></ProtectedRoute>} />
                <Route path="/new-client-bank" element={<ProtectedRoute viewId="new-client-bank"><NewClientBankDetailsPage /></ProtectedRoute>} />
                <Route path="/create-trade" element={<CreateTradeForm onSave={handleAddTrade} onBack={() => setView('trades')} onLogout={handleLogout} onNavigate={setView} />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/change-transaction-password" element={<ChangeTransactionPasswordPage />} />
                
                <Route path="/deleted-trades" element={<ProtectedRoute viewId="deleted-trades"><DeletedTradesPage /></ProtectedRoute>} />
                <Route path="/withdrawal-requests" element={<ProtectedRoute viewId="withdrawal-requests"><WithdrawalRequestsPage /></ProtectedRoute>} />
                <Route path="/deposit-requests" element={<ProtectedRoute viewId="deposit-requests"><DepositRequestsPage /></ProtectedRoute>} />
                <Route path="/negative-balance" element={<ProtectedRoute viewId="negative-balance"><NegativeBalanceTxnsPage /></ProtectedRoute>} />
                
                <Route path="/pending-orders" element={<PendingOrdersPage />} />
                <Route path="/scrip-data" element={<ScripDataPage />} />
                <Route path="/group-trades" element={<ProtectedRoute viewId="group-trades"><GroupTradesPage /></ProtectedRoute>} />
                <Route path="/ip-logins" element={<ProtectedRoute viewId="ip-logins"><IpLoginsPage /></ProtectedRoute>} />
                <Route path="/trade-ip-tracking" element={<ProtectedRoute viewId="trade-ip-tracking"><TradeIpTrackingPage /></ProtectedRoute>} />
                <Route path="/global-updation" element={<ProtectedRoute viewId="global-updation"><GlobalUpdationPage /></ProtectedRoute>} />
                
                <Route path="/learning" element={<LearningPage segment={user?.segment} />} />
                <Route path="/support" element={<RaiseTicketPage user={user} />} />
                <Route path="/voice-modulation" element={<VoiceModulationPage />} />
                <Route path="/signal-admin" element={<SignalAdminPage />} />
                <Route path="/signals" element={<SignalsPage />} />

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
