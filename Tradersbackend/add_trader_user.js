const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function addTraderUser() {
    try {
        console.log('🔄 Checking if trader user exists...');

        // Check if user already exists
        const [existing] = await db.execute('SELECT * FROM users WHERE username = ?', ['trader']);

        if (existing.length > 0) {
            console.log('⚠️  User "trader" already exists. Updating password...');
            const hashedPassword = await bcrypt.hash('trader123', 10);
            await db.execute('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'trader']);
            console.log('✅ Password updated for "trader" user');
        } else {
            console.log('📝 Creating new trader user...');

            // Hash the password
            const hashedPassword = await bcrypt.hash('trader123', 10);

            // Insert user
            const [result] = await db.execute(
                'INSERT INTO users (username, password, full_name, email, mobile, role, status, balance, credit_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                ['trader', hashedPassword, 'Test Trader', 'trader@example.com', '9999999999', 'TRADER', 'Active', 100000, 50000]
            );

            const userId = result.insertId;
            console.log(`✅ User "trader" created with ID: ${userId}`);

            // Create KYC document record (set to VERIFIED so user can login)
            try {
                await db.execute(
                    'INSERT INTO user_documents (user_id, kyc_status) VALUES (?, ?)',
                    [userId, 'VERIFIED']
                );
                console.log('✅ KYC status set to VERIFIED');
            } catch (e) {
                console.log('⚠️  Could not set KYC status:', e.message);
            }

            // Create client settings
            try {
                await db.execute('INSERT INTO client_settings (user_id) VALUES (?)', [userId]);
                console.log('✅ Client settings created');
            } catch (e) {
                console.log('⚠️  Could not create client settings:', e.message);
            }
        }

        console.log('\n✅ Setup complete!');
        console.log('📱 Use these credentials to login:');
        console.log('   Username: trader');
        console.log('   Password: trader123');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

addTraderUser();
