const pool = require('./config/database');

async function recreate() {
    try {
        console.log('Dropping tbAvaliacao...');
        await pool.execute('DROP TABLE IF EXISTS tbAvaliacao');
        await pool.execute('DROP TABLE IF EXISTS tbAvaliacacao'); // Drop typo table if exists

        console.log('Creating tbAvaliacao...');
        await pool.execute(`
            CREATE TABLE tbAvaliacao (
                avaliacao_id INT(10) AUTO_INCREMENT PRIMARY KEY,
                data DATE NOT NULL,
                observacao VARCHAR(255),
                funcionario_id INT(11) NOT NULL,
                avaliacao_status_id INT(10) NOT NULL,
                atualizado_por INT(10) NOT NULL,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (funcionario_id) REFERENCES tbPessoas(pessoa_id) ON DELETE CASCADE,
                FOREIGN KEY (avaliacao_status_id) REFERENCES dominio_tbAvaliacaoStatus(avaliacao_status_id),
                FOREIGN KEY (atualizado_por) REFERENCES tbUsuarios(usuario_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ tbAvaliacao created.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

recreate();
