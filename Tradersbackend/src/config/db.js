const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tradersdb',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
  });

module.exports = pool;
