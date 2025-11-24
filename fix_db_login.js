const pool = require('./config/database');

async function fix() {
    try {
        console.log('Updating admin user...');
        const [result] = await pool.execute(
            'UPDATE tbUsuarios SET login = ? WHERE usuario_id = 1',
            ['admin@admin.com']
        );
        console.log('Rows affected:', result.affectedRows);
        console.log('✅ Admin login updated to admin@admin.com');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fix();
