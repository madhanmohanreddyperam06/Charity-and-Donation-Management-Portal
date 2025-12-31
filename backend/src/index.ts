import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './config/database';
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
const db = Database.getInstance();

async function startServer() {
    try {
        // Connect to database
        await db.connect();
        console.log('Database connected successfully');
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
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
startServer().catch(console.error);

export default app;
