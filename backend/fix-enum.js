const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixEnum() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'charity_donation_portal',
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log('Connected to database');

        // Update donation_type enum to include all expected values
        await connection.execute(`
            ALTER TABLE donations 
            MODIFY COLUMN donation_type ENUM('food', 'funds', 'clothes', 'education', 'medical', 'shelter', 'toys', 'books', 'electronics', 'other') NOT NULL
        `);
        
        console.log('Successfully updated donation_type enum');

        // Check updated enum values
        const [result] = await connection.execute(`
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'charity_donation_portal' 
            AND TABLE_NAME = 'donations' 
            AND COLUMN_NAME = 'donation_type'
        `);
        
        console.log('Updated donation type enum values:', result[0].COLUMN_TYPE);

        await connection.end();
    } catch (error) {
        console.error('Database error:', error);
    }
}

fixEnum();
