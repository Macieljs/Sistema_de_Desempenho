const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_desempenho',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão
pool.getConnection()
    .then(connection => {
        console.log('✅ Conectado ao MySQL');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
    });

module.exports = pool;

