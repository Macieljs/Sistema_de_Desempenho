const pool = require('./config/database');

async function createTestUser() {
    try {
        console.log('Creating test user...');
        // Hash for '123'
        const senhaHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

        await pool.execute(
            `INSERT INTO tbUsuarios (nome, login, senha, tipo, atualizado_por) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE senha = ?`,
            ['Usuário Teste', 'teste@teste.com', senhaHash, 'comum', 1, senhaHash]
        );

        console.log('✅ Test user created: teste@teste.com / 123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTestUser();
