const pool = require('./config/database');

async function check() {
    try {
        const [rows] = await pool.execute('SHOW COLUMNS FROM tbUsuarios');
        console.log('Columns in tbUsuarios:');
        rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

check();
