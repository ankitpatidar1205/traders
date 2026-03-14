const db = require('./src/config/db');
const fs = require('fs');

async function checkSchema() {
    try {
        const [ipLogins] = await db.execute('DESCRIBE ip_logins');
        let result = { ip_logins: ipLogins };
        
        try {
            const [ipLogs] = await db.execute('DESCRIBE ip_logs');
            result.ip_logs = ipLogs;
        } catch (e) {
            result.ip_logs = 'table does not exist';
        }
        
        fs.writeFileSync('schema_dump.json', JSON.stringify(result, null, 2));
        console.log('Schema dumped to schema_dump.json');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkSchema();
