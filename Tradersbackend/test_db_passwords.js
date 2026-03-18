const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'traders_db'
        });

        const users = [
            { username: 'superadmin', pass: 'superadmin123' },
            { username: 'admin', pass: 'admin123' },
            { username: 'broker', pass: 'broker123' },
            { username: 'trader', pass: 'trader123' } // assuming trader123
        ];
        
        for (let u of users) {
             const hash = await bcrypt.hash(u.pass, 10);
             await conn.execute('UPDATE users SET password = ? WHERE username = ?', [hash, u.username]);
             console.log(`Updated ${u.username} with ${u.pass}`);
        }
        
        // Also just for safety, if user tries to login with 123456, we can't do much unless we create dual logic,
        // but let's stick to the original expected passwords!
        
        await conn.end();
    } catch (e) {
        console.error(e);
    }
}
run();
