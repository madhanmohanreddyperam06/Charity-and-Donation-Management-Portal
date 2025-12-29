"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, contact_info } = req.body;
        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                error: 'Missing required fields: name, email, password, role'
            });
        }
        if (!['Donor', 'NGO', 'Admin'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid role. Must be: Donor, NGO, or Admin'
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Insert user (this would use the database connection)
        // For now, return success response
        res.status(201).json({
            message: 'User registered successfully',
            user: { name, email, role, contact_info }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing required fields: email, password'
            });
        }
        // Find user in database (placeholder)
        // For now, return mock response
        const user = {
            id: 1,
            name: 'Test User',
            email: email,
            role: 'Donor'
        };
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
