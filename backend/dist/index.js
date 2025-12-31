"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
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
const db = database_1.Database.getInstance();
async function startServer() {
    try {
        // Connect to database
        await db.connect();
        console.log('Database connected successfully');
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
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
startServer().catch(console.error);
exports.default = app;
