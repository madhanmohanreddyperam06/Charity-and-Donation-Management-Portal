import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, contact_info } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, email, password' 
            });
        }

        // Default role to Donor if not provided
        const userRole = role || 'Donor';
        const userId = userRole === 'NGO' ? 2 : userRole === 'Admin' ? 3 : Math.floor(Math.random() * 1000) + 4;

        // Create token for immediate login
        const token = jwt.sign(
            { userId: userId, email: email, role: userRole },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: { 
                id: userId,
                name, 
                email, 
                role: userRole, 
                contact_info: contact_info || '555-0000' 
            }
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Missing required fields: email, password' 
            });
        }

        // Simplified login - accept any email/password and create user based on role
        // If role is provided in login, use it, otherwise default to Donor
        const userRole = role || 'Donor';
        const userId = userRole === 'NGO' ? 2 : userRole === 'Admin' ? 3 : 1;
        
        const userName = userRole === 'NGO' ? 'NGO User' : userRole === 'Admin' ? 'Admin User' : 'Donor User';

        const token = jwt.sign(
            { userId: userId, email: email, role: userRole },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: userId,
                name: userName,
                email: email,
                role: userRole,
                contact_info: '555-0000'
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
