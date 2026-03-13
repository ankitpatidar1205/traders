const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/KiaanProject/traders/Tradersbackend/.env' });

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await connection.execute('DESCRIBE tickers');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}

checkSchema().catch(err => {
    console.error(err);
    process.exit(1);
});
