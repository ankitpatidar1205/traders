const mysql = require('mysql2/promise');

async function testConnection(config) {
    const start = Date.now();
    try {
        const conn = await mysql.createConnection({
            ...config,
            connectTimeout: 2000
        });
        await conn.execute('SELECT 1');
        await conn.end();
        return { success: true, time: Date.now() - start };
    } catch (err) {
        return { success: false, error: err.message, code: err.code, errno: err.errno };
    }
}

async function run() {
    console.log('🔍 Starting DB Diagnostics...\n');

    const combinations = [
        { host: 'localhost', port: 3306, user: 'root', password: '', label: 'Default (no password, localhost)' },
        { host: '127.0.0.1', port: 3306, user: 'root', password: '', label: 'TCP Loopback (no password, 127.0.0.1)' },
        { socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock', user: 'root', password: '', label: 'XAMPP Socket Path (Default)' },
        { socketPath: '/tmp/mysql.sock', user: 'root', password: '', label: 'Alternative Socket Path (/tmp)' },
        { host: '127.0.0.1', port: 3307, user: 'root', password: '', label: 'XAMPP Alternate Port (3307)' },
    ];

    for (const combo of combinations) {
        console.log(`Testing: ${combo.label}...`);
        const result = await testConnection({ 
            host: combo.host, 
            port: combo.port, 
            user: combo.user, 
            password: combo.password 
        });

        if (result.success) {
            console.log(`✅ SUCCESS! Worked in ${result.time}ms\n`);
            console.log('--- SUGGESTED .env VALUES ---');
            console.log(`DB_HOST=${combo.host}`);
            console.log(`DB_PORT=${combo.port}`);
            console.log(`DB_USER=${combo.user}`);
            console.log(`DB_PASSWORD=${combo.password}`);
            console.log('----------------------------\n');
            process.exit(0);
        } else {
            console.log(`❌ FAILED: ${result.error} (Code: ${result.code})\n`);
        }
    }

    console.log('🛑 All combinations failed. Please check if MySQL is running in XAMPP and if the user/password are correct in phpMyAdmin.');
}

run();
