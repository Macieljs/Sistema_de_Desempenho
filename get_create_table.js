const fs = require('fs');
const pool = require('./config/database');

async function getCreate() {
    try {
        const [rows] = await pool.execute('SHOW CREATE TABLE tbavaliacaocompetencia');
        fs.writeFileSync('schema_dump.txt', rows[0]['Create Table']);
        console.log('✅ Schema dumped to schema_dump.txt');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

getCreate();
