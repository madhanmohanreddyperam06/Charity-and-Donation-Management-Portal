import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';
import authRoutes from './routes/auth';
import donationRoutes from './routes/donations';
import contributionRoutes from './routes/contributions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db: any;

async function connectDatabase() {
    try {
        db = await createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'charity_portal',
            port: parseInt(process.env.DB_PORT || '3306')
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/contributions', contributionRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Charity & Donation Management Portal API' });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
    await connectDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer().catch(console.error);

export default app;
