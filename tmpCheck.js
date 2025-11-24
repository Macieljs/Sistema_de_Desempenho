const pool = require('./config/database');
(async () => {
  try {
    const [rows] = await pool.execute('SELECT nome FROM tbUsuarios LIMIT 1');
    console.log('OK rows', rows);
  } catch (err) {
    console.error('Query error', err);
  } finally {
    process.exit(0);
  }
})();
