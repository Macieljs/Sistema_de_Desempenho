const pool = require('./config/database');

async function check() {
    try {
        const tables = ['tbPessoas', 'tbAvaliacoes', 'tbAvaliacaoStatus'];

        for (const table of tables) {
            console.log(`\n--- ${table} ---`);
            const [rows] = await pool.execute(`SHOW COLUMNS FROM ${table}`);
            rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

check();
