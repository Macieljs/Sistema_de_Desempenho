const pool = require('./config/database');

async function migrate() {
    try {
        console.log('Checking for tipo column...');
        const [columns] = await pool.execute("SHOW COLUMNS FROM tbUsuarios LIKE 'tipo'");

        if (columns.length === 0) {
            console.log('⚠️ Column tipo missing. Adding it...');
            await pool.execute("ALTER TABLE tbUsuarios ADD COLUMN tipo ENUM('admin', 'comum') DEFAULT 'comum' AFTER senha");
            console.log('✅ Column tipo added.');

            // Update admin user
            console.log('Updating admin user type...');
            await pool.execute("UPDATE tbUsuarios SET tipo = 'admin' WHERE usuario_id = 1");
            console.log('✅ Admin user updated.');
        } else {
            console.log('✅ Column tipo already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

migrate();
