const pool = require('./config/database');

async function check() {
    try {
        console.log('Tentando conectar ao banco...');
        const connection = await pool.getConnection();
        console.log('✅ Conexão bem sucedida!');

        const [rows] = await connection.execute('SELECT * FROM tbUsuarios');
        console.log('Usuários encontrados:', rows.length);
        rows.forEach(u => {
            console.log(`User Found: [${u.login}] (ID: ${u.usuario_id})`);
        });

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

check();
