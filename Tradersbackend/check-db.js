const db = require('./src/config/db');

async function checkSchema() {
  try {
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('Total Users:', users[0].count);

    const [traders] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "TRADER"');
    console.log('Total Traders:', traders[0].count);

    const [trades] = await db.query('SELECT COUNT(*) as count FROM trades');
    console.log('Total Trades:', trades[0].count);

    if (traders[0].count > 0) {
        const [sampleTrader] = await db.query('SELECT * FROM users WHERE role = "TRADER" LIMIT 1');
        console.log('Sample Trader:', sampleTrader[0]);
    }

    process.exit(0);
  } catch (err) {
    console.error('Schema check failed:', err.message);
    process.exit(1);
  }
}

checkSchema();
