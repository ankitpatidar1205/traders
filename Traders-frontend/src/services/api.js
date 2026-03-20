/**
 * Centralized API Service
 *
 * Uses Axios with automatic JWT token handling via interceptors
 * NO manual Authorization headers needed - token is attached automatically!
 */

import api from '../utils/api';

// ─── CONFIG ──────────────────────────────────────────
const SERVER_IP = 'localhost';
const PORT = '5000';
export const BASE_URL = import.meta.env.VITE_API_URL || `http://${SERVER_IP}:${PORT}/api`;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `http://${SERVER_IP}:${PORT}`;

// ─── AUTH ────────────────────────────────────────────
export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

// ─── PASSWORD ────────────────────────────────────────
export const resetPassword = async (userId) => {
    const response = await api.post(`/users/${userId}/reset-password`);
    return response.data;
};

export const changePassword = async (newPassword) => {
    const response = await api.post('/auth/change-password', { newPassword });
    return response.data;
};

export const changeTransactionPassword = async (newPassword, currentPassword) => {
    const response = await api.post('/auth/change-transaction-password', {
        newPassword,
        currentPassword
    });
    return response.data;
};

export const verifyTransactionPassword = async (password) => {
    const response = await api.post('/auth/verify-transaction-password', { password });
    return response.data;
};

// ─── CLIENTS ─────────────────────────────────────────
export const getClients = async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
};

export const getClientById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const createClient = async (data) => {
    const response = await api.post('/auth/create-user', data);
    return response.data;
};

// ─── BROKERS ─────────────────────────────────────────
export const getBrokerList = async () => {
    const response = await api.get('/brokers');
    return response.data;
};

export const createBroker = async (data) => {
    const response = await api.post('/brokers', data);
    return response.data;
};

// ─── POSITIONS ───────────────────────────────────────
export const getActivePositions = async (filters = {}) => {
    const response = await api.get('/trades/active', { params: filters });
    return response.data;
};

export const getClosedPositions = async (filters = {}) => {
    const response = await api.get('/trades/closed', {
        params: { status: 'CLOSED', ...filters }
    });
    return response.data;
};

// ─── TRADES ──────────────────────────────────────────
export const getTrades = async (filters = {}) => {
    const response = await api.get('/trades', { params: filters });
    return response.data;
};

export const createTrade = async (data) => {
    const response = await api.post('/trades', data);
    return response.data;
};

export const placeOrder = async (data) => {
    const response = await api.post('/trades/place', data);
    return response.data;
};

export const closeTrade = async (id, data = {}) => {
    const response = await api.put(`/trades/${id}/close`, data);
    return response.data;
};

export const deleteTrade = async (id) => {
    const response = await api.delete(`/trades/${id}`);
    return response.data;
};

// ─── FUNDS ───────────────────────────────────────────
export const getTraderFunds = async (filters = {}) => {
    const response = await api.get('/funds', { params: filters });
    return response.data;
};

export const createFund = async (data) => {
    const response = await api.post('/funds', data);
    return response.data;
};

// ─── MARGIN ──────────────────────────────────────────
export const getNetHoldingMargin = async (clientId) => {
    const response = await api.get(`/portfolio/${clientId}/margin`);
    return response.data;
};

// ─── REQUESTS ────────────────────────────────────────
export const getRequests = async (params = {}) => {
    const response = await api.get('/requests', { params });
    return response.data;
};

export const updateRequestStatus = async (requestId, status, remark) => {
    const response = await api.put(`/requests/${requestId}`, { status, remark });
    return response.data;
};

export const getDepositRequests = async () => {
    const response = await api.get('/requests/deposits');
    return response.data;
};

export const getWithdrawalRequests = async () => {
    const response = await api.get('/requests/withdrawals');
    return response.data;
};

export const approveRequest = async (requestId, type) => {
    const response = await api.post(`/requests/${requestId}/approve`, { type });
    return response.data;
};

export const rejectRequest = async (requestId, type) => {
    const response = await api.post(`/requests/${requestId}/reject`, { type });
    return response.data;
};

// ─── IP / SECURITY ───────────────────────────────────
export const getIpLogins = async (params = {}) => {
    const response = await api.get('/security/ip-tracking', { params });
    return response.data;
};

export const deleteIpLogin = async (id) => {
    const response = await api.delete(`/security/ip-tracking/${id}`);
    return response.data;
};

export const getTradeIpTracking = async () => {
    const response = await api.get('/security/trade-ip');
    return response.data;
};

// ─── GLOBAL (SUPERADMIN ONLY) ────────────────────────
export const getGlobalSettings = async () => {
    const response = await api.get('/admin/global-settings');
    return response.data;
};

export const getActionLedger = async (params = {}) => {
    const response = await api.get('/system/audit-log', { params });
    return response.data;
};

export const getScrips = async () => {
    const response = await api.get('/system/scrips');
    return response.data;
};

export const getTickers = async () => {
    const response = await api.get('/system/tickers');
    return response.data;
};

export const createTicker = async (data) => {
    const response = await api.post('/system/tickers', data);
    return response.data;
};

export const deleteTicker = async (id) => {
    const response = await api.delete(`/system/tickers/${id}`);
    return response.data;
};

// ─── BANNED LIMIT ORDERS ────────────────────────────
export const getBannedOrders = async () => {
    const response = await api.get('/system/banned-orders');
    return response.data;
};

export const createBannedOrder = async (data) => {
    const response = await api.post('/system/banned-orders', data);
    return response.data;
};

export const deleteBannedOrders = async (ids) => {
    const response = await api.post('/system/banned-orders/delete-multiple', { ids });
    return response.data;
};

export const updateGlobalSettings = async (data) => {
    const response = await api.put('/admin/global-settings', data);
    return response.data;
};

// ─── USER PROFILE UPDATE ─────────────────────────────
export const updateUser = async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

// ─── CLIENT SETTINGS ─────────────────────────────────
export const getClientSettings = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const updateClientSettings = async (id, data) => {
    const response = await api.put(`/users/${id}/settings`, data);
    return response.data;
};

// ─── BROKER SHARES ───────────────────────────────────
export const getBrokerShares = async (id) => {
    const response = await api.get(`/users/${id}/broker-shares`);
    return response.data;
};

export const getBrokerClients = async (id) => {
    const response = await api.get(`/users/${id}/broker-clients`);
    return response.data;
};

export const updateBrokerShares = async (id, data) => {
    const response = await api.put(`/users/${id}/broker-shares`, data);
    return response.data;
};

// ─── DOCUMENTS ───────────────────────────────────────
export const getDocuments = async (id) => {
    const response = await api.get(`/users/${id}/documents`);
    return response.data;
};

export const updateDocuments = async (id, formData) => {
    // Handle FormData (file uploads)
    const response = await api.put(`/users/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// ─── USER SEGMENTS ───────────────────────────────────
export const getUserSegments = async (id) => {
    const response = await api.get(`/users/${id}/segments`);
    return response.data;
};

export const updateUserSegments = async (id, segments) => {
    const response = await api.put(`/users/${id}/segments`, { segments });
    return response.data;
};

// ─── PASSWORDS (update via admin) ────────────────────
export const updateUserPasswords = async (id, data) => {
    const response = await api.put(`/users/${id}/passwords`, data);
    return response.data;
};

export const updateUserStatus = async (userId, status) => {
    const response = await api.put(`/users/${userId}/status`, { status });
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

// ─── DASHBOARD / MARKET ─────────────────────────────
export const getIndices = async () => {
    const response = await api.get('/dashboard/indices');
    return response.data;
};

export const getWatchlist = async () => {
    const response = await api.get('/dashboard/watchlist');
    return response.data;
};

export const getLiveM2M = async () => {
    const response = await api.get('/dashboard/live-m2m');
    return response.data;
};

export const getBrokerM2M = async () => {
    const response = await api.get('/dashboard/broker-m2m');
    return response.data;
};

export const getHierarchyAccounts = async (params = {}) => {
    const response = await api.get('/accounts/hierarchy', { params });
    return response.data;
};

export const getGroupTrades = async (filters = {}) => {
    const response = await api.get('/trades/group', { params: filters });
    return response.data;
};

export const getTradeAudit = async () => {
    const response = await api.get('/security/trade-audit');
    return response.data;
};

export const globalBatchUpdate = async (data) => {
    const response = await api.post('/system/global-update', data);
    return response.data;
};

export const getNegativeBalances = async () => {
    const response = await api.get('/accounts/negative-alerts');
    return response.data;
};

// ─── BANK DETAILS ─────────────────────────────────────
export const getBanks = async () => {
    const response = await api.get('/bank');
    return response.data;
};

export const createBank = async (data) => {
    const response = await api.post('/bank', data);
    return response.data;
};

export const updateBank = async (id, data) => {
    const response = await api.put(`/bank/${id}`, data);
    return response.data;
};

export const deleteBank = async (id) => {
    const response = await api.delete(`/bank/${id}`);
    return response.data;
};

export const toggleBankStatus = async (id) => {
    const response = await api.patch(`/bank/${id}/toggle-status`);
    return response.data;
};

// ─── NEW CLIENT BANK (Payment Details for Deposits) ──
export const getNewClientBank = async () => {
    const response = await api.get('/new-client-bank');
    return response.data;
};

export const updateNewClientBank = async (data) => {
    const response = await api.put('/new-client-bank', data);
    return response.data;
};

// ─── ADMIN PANEL: PERMISSIONS, THEME, LOGO ───────────
export const getInitData = async () => {
    const response = await api.get('/admin/init');
    return response.data;
};

export const getAdminMenuPermissions = async (userId) => {
    const response = await api.get(`/admin/menu-permissions/${userId}`);
    return response.data;
};

export const saveAdminMenuPermissions = async (userId, menuPermissions) => {
    const response = await api.post(`/admin/menu-permissions/${userId}`, {
        menuPermissions
    });
    return response.data;
};

export const getThemeSettings = async () => {
    const response = await api.get('/admin/theme');
    return response.data;
};

export const saveThemeSettings = async (theme) => {
    const response = await api.post('/admin/theme', { theme });
    return response.data;
};

export const getLogoPath = async () => {
    const response = await api.get('/admin/logo');
    return response.data;
};

export const uploadLogo = async (formData) => {
    const response = await api.post('/admin/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const saveAdminPanelSettings = async (userId, theme, logoFile, profileImageFile, bgImageFile) => {
    const fd = new FormData();
    fd.append('theme', JSON.stringify(theme));
    if (logoFile) fd.append('logo', logoFile);
    if (profileImageFile) fd.append('profileImage', profileImageFile);
    if (bgImageFile) fd.append('bgImage', bgImageFile);

    const response = await api.post(`/admin/panel-settings/${userId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getAdminPanelSettings = async (userId) => {
    const response = await api.get(`/admin/panel-settings/${userId}`);
    return response.data;
};

// ─── NOTIFICATIONS ────────────────────────────────────
export const getNotifications = async (source) => {
    const params = source ? { source } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
};

export const createNotification = async (data) => {
    const response = await api.post('/notifications', data);
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
};

export const getNotificationUsersByRole = async (role) => {
    const response = await api.get(`/notifications/users/${role}`);
    return response.data;
};

// ─── KITE API ─────────────────────────────────────────
export const getKiteLoginURL = async () => {
    const response = await api.get('/kite/login');
    return response.data;
};

export const getKiteStatus = async () => {
    const response = await api.get('/kite/status');
    return response.data;
};

export const disconnectKite = async () => {
    const response = await api.post('/kite/disconnect');
    return response.data;
};

export const getKiteProfile = async () => {
    const response = await api.get('/kite/profile');
    return response.data;
};

export const getKiteMargins = async () => {
    const response = await api.get('/kite/margins');
    return response.data;
};

export const getKiteHoldings = async () => {
    const response = await api.get('/kite/holdings');
    return response.data;
};

export const getKitePositions = async () => {
    const response = await api.get('/kite/positions');
    return response.data;
};

export const getKiteOrders = async () => {
    const response = await api.get('/kite/orders');
    return response.data;
};

export const getKiteTrades = async () => {
    const response = await api.get('/kite/trades');
    return response.data;
};

export const getKiteQuote = async (instruments) => {
    const response = await api.get('/kite/quote', {
        params: { i: instruments }
    });
    return response.data;
};

export const getKiteLTP = async (instruments) => {
    const response = await api.get('/kite/quote/ltp', {
        params: { i: instruments }
    });
    return response.data;
};

export const getKiteInstruments = async () => {
    const response = await api.get('/kite/instruments');
    return response.data;
};

export const getKiteTickerStatus = async () => {
    const response = await api.get('/kite/ticker/status');
    return response.data;
};

export const getKiteTickerPrices = async () => {
    const response = await api.get('/kite/ticker/prices');
    return response.data;
};

export const subscribeKiteTicker = async (tokens, instrumentMap) => {
    const response = await api.post('/kite/ticker/subscribe', {
        tokens,
        instrumentMap
    });
    return response.data;
};

export const reconnectKiteTicker = async () => {
    const response = await api.post('/kite/ticker/reconnect');
    return response.data;
};

// ─── AI / VOICE COMMANDS ──────────────────────────────
export const parseVoiceCommand = async (text) => {
    const response = await api.post('/ai/ai-parse', { text });
    return response.data;
};

export const executeCommand = async (commandData) => {
    const response = await api.post('/ai/execute-command', commandData);
    return response.data;
};

export const submitVoiceRecording = async (audioBlob, meta = {}) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording_${Date.now()}.webm`);
    formData.append('meta', JSON.stringify(meta));

    const response = await api.post('/voice/record', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
