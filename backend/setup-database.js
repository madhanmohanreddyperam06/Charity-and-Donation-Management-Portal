const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupDatabase() {
  try {
    // Connect to MySQL without database name
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Madhan@41310'
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.execute('CREATE DATABASE IF NOT EXISTS charity_donation_portal');
    console.log('Database created or already exists');

    // Use the database
    await connection.query('USE charity_donation_portal');

    // Read and execute SQL file
    const sql = fs.readFileSync('./src/database.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('Database tables created successfully');
    await connection.end();
    console.log('Database setup completed');
  } catch (error) {
    console.error('Database setup error:', error);
  }
}

setupDatabase();
