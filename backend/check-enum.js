const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkEnums() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'charity_donation_portal',
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log('Connected to database');

        // Check donation_type enum values
        const [result] = await connection.execute(`
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'charity_donation_portal' 
            AND TABLE_NAME = 'donations' 
            AND COLUMN_NAME = 'donation_type'
        `);
        
        console.log('Donation type enum values:', result[0].COLUMN_TYPE);

        await connection.end();
    } catch (error) {
        console.error('Database error:', error);
    }
}

checkEnums();
