const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/KiaanProject/traders/Tradersbackend/.env' });

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [userSchema] = await connection.execute('DESCRIBE users');
    console.log('--- users Table ---');
    console.log(JSON.stringify(userSchema, null, 2));

    try {
        const [settingsSchema] = await connection.execute('DESCRIBE client_settings');
        console.log('\n--- client_settings Table ---');
        console.log(JSON.stringify(settingsSchema, null, 2));
    } catch (e) {
        console.log('\nclient_settings table does not exist.');
    }

    await connection.end();
}

checkSchema().catch(err => {
    console.error(err);
    process.exit(1);
});
