const db = require('../config/db');

const getAllScrips = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM scrip_data');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateScrip = async (req, res) => {
    const { symbol, lot_size, margin_req, status } = req.body;
    try {
        await db.execute(
            'UPDATE scrip_data SET lot_size = ?, margin_req = ?, status = ? WHERE symbol = ?',
            [lot_size, margin_req, status, symbol]
        );
        res.json({ message: 'Scrip updated' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const getTickers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM tickers WHERE is_active = 1');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateTicker = async (req, res) => {
    const { text, speed, is_active } = req.body;
    try {
        await db.execute(
            'UPDATE tickers SET text = ?, speed = ?, is_active = ? WHERE id = ?',
            [text, speed, is_active, req.params.id]
        );
        res.json({ message: 'Ticker updated' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getAllScrips, updateScrip, getTickers, updateTicker };
