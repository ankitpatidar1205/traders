const db = require('./src/config/db');

async function check() {
    const [rows] = await db.execute('SELECT username, role, status FROM users');
    console.log('USERS:', JSON.stringify(rows, null, 2));
    process.exit();
}

check();
