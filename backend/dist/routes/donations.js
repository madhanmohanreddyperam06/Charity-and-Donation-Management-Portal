"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = express_1.default.Router();
const db = database_1.Database.getInstance();
// Get all donations (with filtering)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { donation_type, location, date_from, date_to, status, ngo_id } = req.query;
        let query = 'SELECT * FROM donations WHERE 1=1';
        const params = [];
        // Apply filters
        if (donation_type) {
            query += ' AND donation_type = ?';
            params.push(donation_type);
        }
        if (location) {
            query += ' AND location LIKE ?';
            params.push(`%${location}%`);
        }
        if (date_from) {
            query += ' AND pickup_date_time >= ?';
            params.push(date_from);
        }
        if (date_to) {
            query += ' AND pickup_date_time <= ?';
            params.push(date_to);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (ngo_id) {
            query += ' AND ngo_id = ?';
            params.push(parseInt(ngo_id));
        }
        // Sort by created_at descending
        query += ' ORDER BY created_at DESC';
        const donations = await db.query(query, params);
        res.json(donations);
    }
    catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get donation by ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const donations = await db.query('SELECT * FROM donations WHERE id = ?', [parseInt(id)]);
        if (donations.length === 0) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json(donations[0]);
    }
    catch (error) {
        console.error('Get donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create new donation (NGO only)
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('NGO'), async (req, res) => {
    console.log('=== DONATION CREATION ROUTE HIT ===');
    try {
        console.log('Donation creation request received');
        console.log('Request body:', req.body);
        console.log('User from token:', req.user);
        const { ngo_id, donation_type, quantity_or_amount, location, pickup_date_time, priority = 'medium', description, images, ngo_name, ngo_email, contact_info } = req.body;
        // Validation
        if (!ngo_id || !donation_type || !quantity_or_amount || !location || !pickup_date_time) {
            return res.status(400).json({
                error: 'Missing required fields: ngo_id, donation_type, quantity_or_amount, location, pickup_date_time'
            });
        }
        if (!['food', 'funds', 'clothes', 'education', 'medical', 'shelter', 'toys', 'books', 'electronics', 'other'].includes(donation_type)) {
            return res.status(400).json({
                error: 'Invalid donation type. Must be one of: food, funds, clothes, education, medical, shelter, toys, books, electronics, other'
            });
        }
        if (quantity_or_amount <= 0) {
            return res.status(400).json({
                error: 'Quantity or amount must be greater than 0'
            });
        }
        const pickupDate = new Date(pickup_date_time);
        const currentDate = new Date();
        // Add 1 day buffer to ensure pickup date is in the future
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        console.log('Pickup date:', pickupDate);
        console.log('Current date:', currentDate);
        console.log('Tomorrow (minimum):', tomorrow);
        console.log('Pickup date >= Tomorrow:', pickupDate >= tomorrow);
        if (pickupDate < tomorrow) {
            return res.status(400).json({
                error: 'Pickup date must be at least 24 hours in the future',
                debug: {
                    pickup_date: pickupDate,
                    current_date: currentDate,
                    minimum_date: tomorrow,
                    comparison: pickupDate < tomorrow
                }
            });
        }
        // Insert new donation
        const query = `
            INSERT INTO donations (
                ngo_id, donation_type, quantity_or_amount, location, pickup_date_time,
                status, priority, description, images, ngo_name, ngo_email, contact_info
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            ngo_id,
            donation_type,
            quantity_or_amount,
            location,
            pickup_date_time,
            'Pending',
            priority || 'medium',
            description || null,
            images || null,
            ngo_name || null,
            ngo_email || null,
            contact_info || null
        ];
        console.log('Insert query:', query);
        console.log('Insert params:', params);
        console.log('Params length:', params.length);
        const result = await db.insert(query, params);
        // Get the created donation
        const newDonation = await db.query('SELECT * FROM donations WHERE id = ?', [result.insertId]);
        console.log('New donation created:', newDonation[0]);
        res.status(201).json(newDonation[0]);
    }
    catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update donation (NGO only)
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('NGO'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove id from updates if present
        delete updates.id;
        delete updates.created_at;
        // Build dynamic update query
        const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const updateValues = Object.values(updates);
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        const query = `UPDATE donations SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        updateValues.push(parseInt(id));
        await db.update(query, updateValues);
        // Get updated donation
        const updatedDonation = await db.query('SELECT * FROM donations WHERE id = ?', [parseInt(id)]);
        if (updatedDonation.length === 0) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json(updatedDonation[0]);
    }
    catch (error) {
        console.error('Update donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Cancel donation (NGO only)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('NGO'), async (req, res) => {
    try {
        const { id } = req.params;
        // Update status to cancelled
        await db.update('UPDATE donations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['Cancelled', parseInt(id)]);
        // Get updated donation
        const cancelledDonation = await db.query('SELECT * FROM donations WHERE id = ?', [parseInt(id)]);
        if (cancelledDonation.length === 0) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json(cancelledDonation[0]);
    }
    catch (error) {
        console.error('Cancel donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
