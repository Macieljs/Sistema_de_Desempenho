require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function fixSchema() {
    let connection;
    try {
        console.log('Conectando ao banco de dados...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado!');

        console.log('Corrigindo tabela tbPessoas...');

        // Fix atualizado_em
        try {
            await connection.query(`
                ALTER TABLE tbPessoas 
                MODIFY COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('Coluna atualizado_em corrigida com sucesso!');
        } catch (err) {
            console.error('Erro ao corrigir atualizado_em:', err.message);
        }

        // Fix criado_em (just in case)
        try {
            await connection.query(`
                ALTER TABLE tbPessoas 
                MODIFY COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `);
            console.log('Coluna criado_em corrigida com sucesso!');
        } catch (err) {
            console.error('Erro ao corrigir criado_em:', err.message);
        }

        // Fix tbUsuarios atualizado_em
        try {
            await connection.query(`
                ALTER TABLE tbUsuarios 
                MODIFY COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('Coluna atualizado_em de tbUsuarios corrigida com sucesso!');
        } catch (err) {
            console.error('Erro ao corrigir atualizado_em de tbUsuarios:', err.message);
        }

        // Fix tbUsuarios criado_em
        try {
            await connection.query(`
                ALTER TABLE tbUsuarios 
                MODIFY COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `);
            console.log('Coluna criado_em de tbUsuarios corrigida com sucesso!');
        } catch (err) {
            console.error('Erro ao corrigir criado_em de tbUsuarios:', err.message);
        }

    } catch (error) {
        console.error('Erro fatal:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixSchema();
