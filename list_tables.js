const pool = require('./config/database');

async function listTables() {
    try {
        const [rows] = await pool.execute('SHOW TABLES');
        console.log('Tables in database:');
        rows.forEach(r => console.log(`- ${Object.values(r)[0]}`));
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listTables();
