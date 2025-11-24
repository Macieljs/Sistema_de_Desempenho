const pool = require('./config/database');

async function checkSchema() {
    try {
        console.log('--- tbPessoas Columns ---');
        const [columns] = await pool.execute('SHOW COLUMNS FROM tbPessoas');
        console.table(columns);

        console.log('\n--- tbPessoaTipo Data ---');
        const [tipos] = await pool.execute('SELECT * FROM tbPessoaTipo');
        console.table(tipos);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
