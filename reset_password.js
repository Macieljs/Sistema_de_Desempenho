const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        const senha = '123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(senha, salt);

        console.log('Resetting password for admin@admin.com...');
        const [result] = await pool.execute(
            'UPDATE tbUsuarios SET senha = ? WHERE login = ?',
            [hash, 'admin@admin.com']
        );

        if (result.affectedRows > 0) {
            console.log('✅ Password reset successfully to "123"');
        } else {
            console.log('❌ User admin@admin.com not found!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

reset();
