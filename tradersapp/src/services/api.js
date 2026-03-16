import { BASE_URL } from '../constants/Config';

let userSession = {
    token: null,
    user: null
};

export const setSession = (token, user) => {
    userSession.token = token;
    userSession.user = user;
};

export const getSessionUser = () => userSession.user;
export const hasSession = () => !!userSession.token;

export const clearSession = () => {
    userSession.token = null;
    userSession.user = null;
};

const getHeaders = async () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': userSession.token ? `Bearer ${userSession.token}` : '',
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Something went wrong.');
    }
    return response.json();
};

export const login = async (username, password, extraInfo = {}) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, ...extraInfo }),
    });
    const data = await handleResponse(res);
    
    setSession(data.token, data.user);
    return data;
};
export const getTrades = async (status) => {
    const res = await fetch(`${BASE_URL}/trades?status=${status || ''}`, {
        headers: await getHeaders(),
    });
    return handleResponse(res);
};

export const placeOrder = async (orderData) => {
    const res = await fetch(`${BASE_URL}/trades`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(orderData),
    });
    return handleResponse(res);
};

export const closeTrade = async (tradeId, exitPrice) => {
    const res = await fetch(`${BASE_URL}/trades/${tradeId}/close`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ exitPrice }),
    });
    return handleResponse(res);
};

export const getBalance = async () => {
    const res = await fetch(`${BASE_URL}/portfolio/balance`, {
        headers: await getHeaders(),
    });
    return handleResponse(res);
};

export const getIndices = async () => {
    const res = await fetch(`${BASE_URL}/dashboard/indices`, {
        headers: await getHeaders(),
    });
    return handleResponse(res);
};

export const getWatchlist = async () => {
    const res = await fetch(`${BASE_URL}/dashboard/watchlist`, {
        headers: await getHeaders(),
    });
    return handleResponse(res);
};

export const createWithdrawal = async (data) => {
    const res = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({
            amount: data.amount,
            type: 'WITHDRAW',
            bankName: data.bankName,
            accountHolder: data.accountHolder,
            accountNumber: data.accountNumber,
            ifscCode: data.ifsc,
            upiId: data.upiId,
            paymentMethod: data.method
        }),
    });
    return handleResponse(res);
};

export const getWithdrawals = async () => {
    const res = await fetch(`${BASE_URL}/requests?type=WITHDRAW`, {
        headers: await getHeaders(),
    });
    return handleResponse(res);
};

export const changePassword = async (currentPassword, newPassword) => {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
};

export const createDeposit = async (amount, screenshotUri) => {
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('type', 'DEPOSIT');

    if (screenshotUri) {
        const filename = screenshotUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('screenshot', {
            uri: screenshotUri,
            name: filename,
            type
        });
    }

    const headers = await getHeaders();
    delete headers['Content-Type'];

    const res = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });
    return handleResponse(res);
};
