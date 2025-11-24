const pool = require('./config/database');

async function check() {
    try {
        const [rows] = await pool.execute('SHOW COLUMNS FROM tbAvaliacao');
        console.log('Columns in tbAvaliacao:');
        rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

check();
