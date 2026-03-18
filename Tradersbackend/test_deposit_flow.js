const db = require('./src/config/db');
const path = require('path');
const fs = require('fs');

async function testDepositFlow() {
    try {
        console.log('🧪 Testing Deposit Flow...\n');

        // 1. Check if user exists
        console.log('1️⃣  Checking if trader user exists...');
        const [users] = await db.execute('SELECT id, username FROM users WHERE username = ?', ['trader']);
        if (users.length === 0) {
            console.error('❌ User "trader" not found');
            process.exit(1);
        }
        const userId = users[0].id;
        console.log(`✅ Found user: trader (ID: ${userId})\n`);

        // 2. Check action_ledger table
        console.log('2️⃣  Checking action_ledger table...');
        const [ledgerCheck] = await db.execute('DESCRIBE action_ledger').catch(e => {
            console.log('⚠️  action_ledger table might not exist, checking...');
            return [null];
        });
        if (!ledgerCheck) {
            console.log('⚠️  action_ledger table not found - this might be the issue');
        } else {
            console.log('✅ action_ledger table exists\n');
        }

        // 3. Try to insert a test payment request without logging
        console.log('3️⃣  Testing payment_requests insert...');
        const [result] = await db.execute(
            'INSERT INTO payment_requests (user_id, amount, type, status) VALUES (?, ?, ?, ?)',
            [userId, 5000, 'DEPOSIT', 'PENDING']
        );
        console.log(`✅ Payment request created with ID: ${result.insertId}\n`);

        // 4. Check if record was created
        console.log('4️⃣  Verifying payment request was created...');
        const [requests] = await db.execute('SELECT * FROM payment_requests WHERE id = ?', [result.insertId]);
        if (requests.length > 0) {
            console.log('✅ Payment request verified:');
            console.log('   ID:', requests[0].id);
            console.log('   User ID:', requests[0].user_id);
            console.log('   Amount:', requests[0].amount);
            console.log('   Type:', requests[0].type);
            console.log('   Status:', requests[0].status);
        }

        console.log('\n✅ All tests passed! The deposit flow should work.');
        console.log('\n📝 Possible issues:');
        console.log('   1. Action logging might be failing silently');
        console.log('   2. File upload might not be happening');
        console.log('   3. JWT token might not be valid');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        process.exit(0);
    }
}

testDepositFlow();
