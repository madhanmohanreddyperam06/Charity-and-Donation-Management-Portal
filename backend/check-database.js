const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'charity_donation_portal',
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log('Connected to database');

        // Check if tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables in database:', tables);

        // Check donations table structure
        try {
            const [columns] = await connection.execute('DESCRIBE donations');
            console.log('Donations table structure:', columns);
        } catch (err) {
            console.log('Donations table does not exist:', err.message);
        }

        await connection.end();
    } catch (error) {
        console.error('Database error:', error);
    }
}

checkDatabase();
