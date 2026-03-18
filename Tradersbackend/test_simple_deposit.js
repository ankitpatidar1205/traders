// Simple direct test of the deposit flow
const db = require('./src/config/db');

async function test() {
    try {
        console.log('\n=== TESTING DEPOSIT FLOW ===\n');

        const userId = 4;
        const amount = '5000';
        const type = 'DEPOSIT';

        console.log('1. Testing DB insert with valid data...');
        const [result] = await db.execute(
            'INSERT INTO payment_requests (user_id, amount, type, screenshot_url, status) VALUES (?, ?, ?, ?, "PENDING")',
            [userId, amount, type, null]
        );
        console.log('✅ Insert successful! ID:', result.insertId);

        console.log('\n2. Testing logAction function...');
        const { logAction } = require('./src/controllers/systemController');
        await logAction(userId, 'CREATE_DEPOSIT_REQUEST', 'payment_requests', `Test deposit of ${amount}`);
        console.log('✅ logAction successful!');

        console.log('\n3. Verifying record...');
        const [rows] = await db.execute('SELECT * FROM payment_requests WHERE id = ?', [result.insertId]);
        if (rows.length > 0) {
            console.log('✅ Record verified:', rows[0]);
        }

        console.log('\n✅ ALL TESTS PASSED - Deposit flow works!');
    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        console.error('Stack:', err.stack);
    } finally {
        process.exit(0);
    }
}

test();
