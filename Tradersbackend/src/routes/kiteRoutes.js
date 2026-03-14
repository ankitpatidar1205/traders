const express = require('express');
const kiteService = require('../utils/kiteService');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/token', asyncHandler(async (req, res) => {
    const { requestToken } = req.body;
    if (!requestToken) return res.status(400).json({ error: 'Request token required' });
    
    const result = await kiteService.generateSession(requestToken);
    res.json(result);
}));

router.get('/profile', asyncHandler(async (req, res) => {
    const data = await kiteService.getProfile();
    res.json(data);
}));

router.get('/margins', asyncHandler(async (req, res) => {
    const data = await kiteService.getMargins();
    res.json(data);
}));

router.get('/holdings', asyncHandler(async (req, res) => {
    const data = await kiteService.getHoldings();
    res.json(data);
}));

router.get('/positions', asyncHandler(async (req, res) => {
    const data = await kiteService.getPositions();
    res.json(data);
}));

router.get('/orders', asyncHandler(async (req, res) => {
    const data = await kiteService.getOrders();
    res.json(data);
}));

router.get('/trades', asyncHandler(async (req, res) => {
    const data = await kiteService.getTrades();
    res.json(data);
}));

router.get('/quote', asyncHandler(async (req, res) => {
    const { i } = req.query;
    if (!i) return res.status(400).json({ error: 'Instrument Required' });
    const data = await kiteService.getQuote(i);
    res.json(data);
}));

router.get('/quote/ltp', asyncHandler(async (req, res) => {
    const { i } = req.query;
    if (!i) return res.status(400).json({ error: 'Instrument Required' });
    const data = await kiteService.getLTP(i);
    res.json(data);
}));

router.get('/instruments', asyncHandler(async (req, res) => {
    const data = await kiteService.getInstruments();
    res.json(data);
}));

router.get('/instruments/historical/:instrumentToken/:interval', asyncHandler(async (req, res) => {
    const { instrumentToken, interval } = req.params;
    const { from, to } = req.query;
    const data = await kiteService.getHistoricalData(instrumentToken, interval, from, to);
    res.json(data);
}));

module.exports = router;
