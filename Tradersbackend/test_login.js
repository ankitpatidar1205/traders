const fetch = require('node-fetch');

async function testLogin() {
    try {
        const response = await fetch('http://https://trader-production-e063.up.railway.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'superadmin', password: 'admin123' })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testLogin();
