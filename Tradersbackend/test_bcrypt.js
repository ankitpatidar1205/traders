const bcrypt = require('bcryptjs');

async function test() {
    const pass = 'admin123';
    const hash = await bcrypt.hash(pass, 10);
    console.log('Pass:', pass);
    console.log('Hash:', hash);
    const match = await bcrypt.compare(pass, hash);
    console.log('Match?', match);
    
    // Test direct comparison with another hash
    const hash2 = await bcrypt.hash(pass, 10);
    const match2 = await bcrypt.compare(pass, hash2);
    console.log('Match 2?', match2);
}

test();
