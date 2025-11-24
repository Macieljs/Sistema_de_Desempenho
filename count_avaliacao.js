const pool = require('./config/database');

async function count() {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM tbAvaliacao');
        console.log('Total rows:', rows[0].total);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

count();
