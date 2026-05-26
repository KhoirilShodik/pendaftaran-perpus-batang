const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

async function main() {
  const pool = mysql.createPool({
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT || '3306'),
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASS,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    ssl: env.DB_HOST !== '127.0.0.1' && env.DB_HOST !== 'localhost' ? {
       rejectUnauthorized: false
     } : undefined
  });

  try {
    const [rows] = await pool.execute('DESCRIBE registrations');
    console.log('COLUMNS:');
    rows.forEach(row => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
  } catch (err) {
    console.error('Error describing table:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
