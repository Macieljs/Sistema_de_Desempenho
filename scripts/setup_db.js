const pool = require('./config/database');

async function recreateAll() {
    try {
        console.log('Dropping tables...');
        await pool.execute('DROP TABLE IF EXISTS tbavaliacaocompetencia');
        await pool.execute('DROP TABLE IF EXISTS tbAvaliacao');
        await pool.execute('DROP TABLE IF EXISTS tbAvaliacacao');

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

        console.log('Creating tbavaliacaocompetencia...');
        await pool.execute(`
            CREATE TABLE tbavaliacaocompetencia (
              avaliacao_competencia_id int NOT NULL AUTO_INCREMENT,
              avaliacao_id int NOT NULL,
              competencia_id int NOT NULL,
              nota decimal(5,2) NOT NULL,
              observacao text COLLATE utf8mb4_unicode_ci,
              PRIMARY KEY (avaliacao_competencia_id),
              KEY avaliacao_id (avaliacao_id),
              KEY competencia_id (competencia_id),
              CONSTRAINT tbavaliacaocompetencia_ibfk_1 FOREIGN KEY (avaliacao_id) REFERENCES tbAvaliacao (avaliacao_id) ON DELETE CASCADE,
              CONSTRAINT tbavaliacaocompetencia_ibfk_2 FOREIGN KEY (competencia_id) REFERENCES tbcompetencia (competencia_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('✅ All tables recreated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

recreateAll();
