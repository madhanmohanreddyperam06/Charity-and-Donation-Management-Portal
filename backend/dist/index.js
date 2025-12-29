"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const promise_1 = require("mysql2/promise");
const auth_1 = __importDefault(require("./routes/auth"));
const donations_1 = __importDefault(require("./routes/donations"));
const contributions_1 = __importDefault(require("./routes/contributions"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Database connection
let db;
async function connectDatabase() {
    try {
        db = await (0, promise_1.createConnection)({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'charity_portal',
            port: parseInt(process.env.DB_PORT || '3306')
        });
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/donations', donations_1.default);
app.use('/api/contributions', contributions_1.default);
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
exports.default = app;
