const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = 'https://api.kite.trade';
const API_KEY = process.env.KITE_API_KEY;
const API_SECRET = process.env.KITE_API_SECRET;
const SESSION_FILE = path.join(__dirname, '../data/kite_session.json');

class KiteService {
    constructor() {
        this.accessToken = null;
        this.initializationPromise = null;
        this.lastFailedToken = null;
        
        // Ensure data directory exists
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Try to load existing session
        this.loadSession();
    }

    loadSession() {
        try {
            if (fs.existsSync(SESSION_FILE)) {
                const content = fs.readFileSync(SESSION_FILE, 'utf8');
                if (content && content !== '{}') {
                    const data = JSON.parse(content);
                    if (data.access_token) {
                        this.accessToken = data.access_token;
                        this.lastFailedToken = null; // Clear failure flag if we found a token
                        console.log('📂 Existing Kite session loaded from file.');
                    }
                }
            }
        } catch (err) {
            console.error('Error loading Kite session:', err);
        }
    }

    saveSession(data) {
        try {
            fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
            console.log('💾 Kite session saved to file.');
        } catch (err) {
            console.error('Error saving Kite session:', err);
        }
    }

    async getHeaders() {
        if (!this.accessToken) {
            this.loadSession(); // Try reloading if manually edited
        }

        if (!this.accessToken) {
            if (this.initializationPromise) {
                console.log('⏳ Authentication in progress, waiting...');
                await this.initializationPromise;
                return this.createHeaders();
            }

            const requestToken = process.env.KITE_REQUEST_TOKEN;
            
            if (!requestToken) {
                throw new Error('Missing KITE_REQUEST_TOKEN in .env');
            }

            if (requestToken === this.lastFailedToken) {
                throw new Error(`The provided Request Token ${requestToken.substring(0, 5)}... has already failed/expired. Please get a NEW one.`);
            }

            console.log('🔄 Access token missing. Attempting authentication with KITE_REQUEST_TOKEN...');
            this.initializationPromise = (async () => {
                try {
                    const session = await this.generateSession(requestToken);
                    this.accessToken = session.access_token;
                    this.saveSession(session);
                } catch (err) {
                    this.lastFailedToken = requestToken;
                    this.initializationPromise = null;
                    throw err;
                }
            })();
            
            await this.initializationPromise;
        }
        return this.createHeaders();
    }

    createHeaders() {
        if (!this.accessToken) throw new Error('Authentication required');
        return {
            'X-Kite-Version': '3',
            'Authorization': `token ${API_KEY}:${this.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    async generateSession(requestToken) {
        try {
            const params = new URLSearchParams();
            params.append('api_key', API_KEY);
            params.append('request_token', requestToken);
            params.append('checksum', this.generateChecksum(requestToken));

            const response = await fetch(`${BASE_URL}/session/token`, {
                method: 'POST',
                headers: {
                    'X-Kite-Version': '3',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            const data = await response.json();
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Authentication failed');
            }
        } catch (error) {
            console.error('Kite Session Error:', error.message);
            throw error;
        }
    }

    generateChecksum(requestToken) {
        const hash = crypto.createHash('sha256');
        hash.update(API_KEY + requestToken + API_SECRET);
        return hash.digest('hex');
    }

    async getProfile() {
        return this.makeRequest('/user/profile');
    }

    async getMargins() {
        return this.makeRequest('/user/margins');
    }

    async getHoldings() {
        return this.makeRequest('/portfolio/holdings');
    }

    async getPositions() {
        return this.makeRequest('/portfolio/positions');
    }

    async getOrders() {
        return this.makeRequest('/orders');
    }

    async getTrades() {
        return this.makeRequest('/trades');
    }

    async getQuote(instruments) {
        const query = Array.isArray(instruments) ? instruments.join(',') : instruments;
        return this.makeRequest(`/quote?i=${query}`);
    }

    async getLTP(instruments) {
        const query = Array.isArray(instruments) ? instruments.join(',') : instruments;
        return this.makeRequest(`/quote/ltp?i=${query}`);
    }

    async getInstruments() {
        return this.makeRequest('/instruments');
    }

    async getHistoricalData(instrumentToken, interval, from, to) {
        return this.makeRequest(`/instruments/historical/${instrumentToken}/${interval}?from=${from}&to=${to}`);
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });

            if (response.status === 403) {
                // Token expired during request, clear session
                this.accessToken = null;
                if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
                throw new Error('Kite Session Expired. Please provide a new Request Token.');
            }

            const data = await response.json();
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Kite API request failed');
            }
        } catch (error) {
            console.error(`Kite API Error [${endpoint}]:`, error.message);
            throw error;
        }
    }
}

module.exports = new KiteService();
