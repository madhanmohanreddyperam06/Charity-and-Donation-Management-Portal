const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'charity_donation_portal',
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log('Connected to database');

        // Add missing columns to donations table
        try {
            await connection.execute(`
                ALTER TABLE donations 
                ADD COLUMN ngo_name VARCHAR(255) AFTER ngo_id,
                ADD COLUMN ngo_email VARCHAR(255) AFTER ngo_name,
                ADD COLUMN contact_info VARCHAR(255) AFTER ngo_email
            `);
            console.log('Successfully added missing columns to donations table');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns already exist, skipping...');
            } else {
                console.log('Error adding columns:', err.message);
            }
        }

        // Check updated table structure
        const [columns] = await connection.execute('DESCRIBE donations');
        console.log('Updated donations table structure:');
        columns.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));

        await connection.end();
    } catch (error) {
        console.error('Database error:', error);
    }
}

updateDatabase();
