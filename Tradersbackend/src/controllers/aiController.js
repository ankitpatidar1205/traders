const db = require('../config/db');

const processVoiceCommand = async (req, res) => {
    const { command } = req.body;
    // Mocking AI Shell responses
    try {
        let response = "I didn't quite catch that. Try commands like 'Active trades' or 'My balance'.";
        
        if (command.toLowerCase().includes('balance')) {
            const [rows] = await db.execute('SELECT balance FROM users WHERE id = ?', [req.user.id]);
            response = `Your current balance is ${rows[0].balance}`;
        } else if (command.toLowerCase().includes('trades')) {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM trades WHERE user_id = ? AND status = "OPEN"', [req.user.id]);
            response = `You have ${rows[0].count} active trades.`;
        }

        res.json({ text: response });
    } catch (err) {
        res.status(500).send('AI Engine Error');
    }
};

module.exports = { processVoiceCommand };
