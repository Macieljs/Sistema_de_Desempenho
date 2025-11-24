const pool = require('./config/database');

async function fix() {
    try {
        console.log('Creating dominio_tbAvaliacaoStatus...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS dominio_tbAvaliacaoStatus (
                avaliacao_status_id INT(10) AUTO_INCREMENT PRIMARY KEY,
                descricao VARCHAR(200) NOT NULL UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Table created.');

        console.log('Inserting default values...');
        const values = ['Pendente', 'Em Andamento', 'Concluída'];
        for (const v of values) {
            await pool.execute(
                'INSERT IGNORE INTO dominio_tbAvaliacaoStatus (descricao) VALUES (?)',
                [v]
            );
        }
        console.log('✅ Values inserted.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fix();
