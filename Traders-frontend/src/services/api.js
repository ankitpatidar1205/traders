/**
 * Centralized API Service
 * All API calls go through this file
 */

// Local development
const SERVER_IP = 'localhost';
const PORT = '5000';
export const BASE_URL = import.meta.env.VITE_API_URL || `http://${SERVER_IP}:${PORT}/api`;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `http://${SERVER_IP}:${PORT}`;

// Production backend on Railway (uncomment below & comment above to use live)
// const PRODUCTION_URL = 'https://trader-production-e063.up.railway.app';
// export const BASE_URL = import.meta.env.VITE_API_URL || `${PRODUCTION_URL}/api`;
// export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || PRODUCTION_URL;

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('traders_token') || ''}`,
});

const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
    }
    if (response.status === 403) {
        throw new Error('Access Denied. You do not have permission.');
    }
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Something went wrong.');
    }
    return response.json();
};

// ─── AUTH ────────────────────────────────────────────
export const login = async (username, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
};

// ─── PASSWORD ────────────────────────────────────────
export const resetPassword = async (userId) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
    });
    return handleResponse(res);
};

export const changePassword = async (newPassword) => {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword }),
    });
    return handleResponse(res);
};

export const changeTransactionPassword = async (newPassword, currentPassword) => {
    const res = await fetch(`${BASE_URL}/auth/change-transaction-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword, currentPassword }),
    });
    return handleResponse(res);
};

export const verifyTransactionPassword = async (password) => {
    const res = await fetch(`${BASE_URL}/auth/verify-transaction-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ password }),
    });
    return handleResponse(res);
};

// ─── CLIENTS ─────────────────────────────────────────
export const getClients = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/users?${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getClientById = async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const createClient = async (data) => {
    const res = await fetch(`${BASE_URL}/auth/create-user`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── BROKERS ─────────────────────────────────────────
export const getBrokerList = async () => {
    const res = await fetch(`${BASE_URL}/brokers`, { headers: getHeaders() });
    return handleResponse(res);
};

export const createBroker = async (data) => {
    const res = await fetch(`${BASE_URL}/brokers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── POSITIONS ───────────────────────────────────────
export const getActivePositions = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/trades/active?${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getClosedPositions = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/trades/closed?status=CLOSED&${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── TRADES ──────────────────────────────────────────
export const getTrades = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/trades?${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const createTrade = async (data) => {
    const res = await fetch(`${BASE_URL}/trades`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const placeOrder = async (data) => {
    const res = await fetch(`${BASE_URL}/trades/place`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const deleteTrade = async (id) => {
    const res = await fetch(`${BASE_URL}/trades/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(res);
};

// ─── FUNDS ───────────────────────────────────────────
export const getTraderFunds = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/funds?${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const createFund = async (data) => {
    const res = await fetch(`${BASE_URL}/funds`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── MARGIN ──────────────────────────────────────────
export const getNetHoldingMargin = async (clientId) => {
    const res = await fetch(`${BASE_URL}/portfolio/${clientId}/margin`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── REQUESTS ────────────────────────────────────────
export const getRequests = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/requests?${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const updateRequestStatus = async (requestId, status, remark) => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}`, {
        method: 'PUT', // Changed from POST to PUT based on typical REST practices for updates
        headers: getHeaders(),
        body: JSON.stringify({ status, remark }),
    });
    return handleResponse(res);
};

export const getDepositRequests = async () => {
    const res = await fetch(`${BASE_URL}/requests/deposits`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getWithdrawalRequests = async () => {
    const res = await fetch(`${BASE_URL}/requests/withdrawals`, { headers: getHeaders() });
    return handleResponse(res);
};

export const approveRequest = async (requestId, type) => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/approve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type }),
    });
    return handleResponse(res);
};

export const rejectRequest = async (requestId, type) => {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/reject`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type }),
    });
    return handleResponse(res);
};

// ─── IP / SECURITY ───────────────────────────────────
export const getIpLogins = async () => {
    const res = await fetch(`${BASE_URL}/security/ip-tracking`, { headers: getHeaders() });
    return handleResponse(res);
};

export const deleteIpLogin = async (id) => {
    const res = await fetch(`${BASE_URL}/security/ip-tracking/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(res);
};
// Security API logic updated

export const getTradeIpTracking = async () => {
    const res = await fetch(`${BASE_URL}/security/trade-ip`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── GLOBAL (SUPERADMIN ONLY) ────────────────────────
export const getGlobalSettings = async () => {
    const res = await fetch(`${BASE_URL}/admin/global-settings`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getActionLedger = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/system/audit-log?${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getScrips = async () => {
    const res = await fetch(`${BASE_URL}/system/scrips`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getTickers = async () => {
    const res = await fetch(`${BASE_URL}/system/tickers`, { headers: getHeaders() });
    return handleResponse(res);
};

export const createTicker = async (data) => {
    const res = await fetch(`${BASE_URL}/system/tickers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const deleteTicker = async (id) => {
    const res = await fetch(`${BASE_URL}/system/tickers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(res);
};

// ─── BANNED LIMIT ORDERS ────────────────────────────
export const getBannedOrders = async () => {
    const res = await fetch(`${BASE_URL}/system/banned-orders`, { headers: getHeaders() });
    return handleResponse(res);
};

export const createBannedOrder = async (data) => {
    const res = await fetch(`${BASE_URL}/system/banned-orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const deleteBannedOrders = async (ids) => {
    const res = await fetch(`${BASE_URL}/system/banned-orders/delete-multiple`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids }),
    });
    return handleResponse(res);
};

export const updateGlobalSettings = async (data) => {
    const res = await fetch(`${BASE_URL}/admin/global-settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── USER PROFILE UPDATE ─────────────────────────────
export const updateUser = async (id, data) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── CLIENT SETTINGS ─────────────────────────────────
export const updateClientSettings = async (id, data) => {
    const res = await fetch(`${BASE_URL}/users/${id}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── BROKER SHARES ───────────────────────────────────
export const getBrokerShares = async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}/broker-shares`, { headers: getHeaders() });
    return handleResponse(res);
};

export const updateBrokerShares = async (id, data) => {
    const res = await fetch(`${BASE_URL}/users/${id}/broker-shares`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── DOCUMENTS ───────────────────────────────────────
export const getDocuments = async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}/documents`, { headers: getHeaders() });
    return handleResponse(res);
};

export const updateDocuments = async (id, formData) => {
    // formData is FormData (for file upload) or plain object (text only)
    const isFormData = formData instanceof FormData;
    const res = await fetch(`${BASE_URL}/users/${id}/documents`, {
        method: 'PUT',
        headers: isFormData
            ? { 'Authorization': `Bearer ${localStorage.getItem('traders_token') || ''}` }
            : getHeaders(),
        body: isFormData ? formData : JSON.stringify(formData),
    });
    return handleResponse(res);
};

// ─── USER SEGMENTS ───────────────────────────────────
export const getUserSegments = async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}/segments`, { headers: getHeaders() });
    return handleResponse(res);
};

export const updateUserSegments = async (id, segments) => {
    const res = await fetch(`${BASE_URL}/users/${id}/segments`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ segments }),
    });
    return handleResponse(res);
};

// ─── PASSWORDS (update via admin) ────────────────────
export const updateUserPasswords = async (id, data) => {
    const res = await fetch(`${BASE_URL}/users/${id}/passwords`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const updateUserStatus = async (userId, status) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(res);
};

export const deleteUser = async (userId) => {
    const res = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(res);
};

// ─── DASHBOARD / MARKET ─────────────────────────────
export const getIndices = async () => {
    const res = await fetch(`${BASE_URL}/dashboard/indices`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getWatchlist = async () => {
    const res = await fetch(`${BASE_URL}/dashboard/watchlist`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getLiveM2M = async () => {
    const res = await fetch(`${BASE_URL}/dashboard/live-m2m`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getBrokerM2M = async () => {
    const res = await fetch(`${BASE_URL}/dashboard/broker-m2m`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getHierarchyAccounts = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/accounts/hierarchy?${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getGroupTrades = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/trades/group?${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getTradeAudit = async () => {
    const res = await fetch(`${BASE_URL}/security/trade-audit`, { headers: getHeaders() });
    return handleResponse(res);
};

export const globalBatchUpdate = async (data) => {
    const res = await fetch(`${BASE_URL}/system/global-update`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const getNegativeBalances = async () => {
    const res = await fetch(`${BASE_URL}/accounts/negative-alerts`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── BANK DETAILS ─────────────────────────────────────
export const getBanks = async () => {
    const res = await fetch(`${BASE_URL}/bank`, { headers: getHeaders() });
    return handleResponse(res);
};

export const createBank = async (data) => {
    const res = await fetch(`${BASE_URL}/bank`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const updateBank = async (id, data) => {
    const res = await fetch(`${BASE_URL}/bank/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const deleteBank = async (id) => {
    const res = await fetch(`${BASE_URL}/bank/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(res);
};

export const toggleBankStatus = async (id) => {
    const res = await fetch(`${BASE_URL}/bank/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getHeaders(),
    });
    return handleResponse(res);
};

// ─── NEW CLIENT BANK (Payment Details for Deposits) ──
export const getNewClientBank = async () => {
    const res = await fetch(`${BASE_URL}/new-client-bank`, { headers: getHeaders() });
    return handleResponse(res);
};

export const updateNewClientBank = async (data) => {
    const res = await fetch(`${BASE_URL}/new-client-bank`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};
