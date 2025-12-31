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
// Get all contributions for a donor
router.get('/donor/:donorId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { donorId } = req.params;
        const contributions = await db.query('SELECT c.*, d.donation_type, d.location, d.ngo_name FROM contributions c ' +
            'LEFT JOIN donations d ON c.donation_id = d.id ' +
            'WHERE c.donor_id = ? ORDER BY c.created_at DESC', [parseInt(donorId)]);
        res.json(contributions);
    }
    catch (error) {
        console.error('Get donor contributions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all contributions for a donation
router.get('/donation/:donationId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { donationId } = req.params;
        const contributions = await db.query('SELECT c.*, u.name as donor_name, u.email as donor_email FROM contributions c ' +
            'LEFT JOIN users u ON c.donor_id = u.id ' +
            'WHERE c.donation_id = ? ORDER BY c.created_at DESC', [parseInt(donationId)]);
        res.json(contributions);
    }
    catch (error) {
        console.error('Get donation contributions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create new contribution
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { donation_id, donor_id, contribution_amount, notes } = req.body;
        // Validation
        if (!donation_id || !donor_id || !contribution_amount) {
            return res.status(400).json({
                error: 'Missing required fields: donation_id, donor_id, contribution_amount'
            });
        }
        if (contribution_amount <= 0) {
            return res.status(400).json({
                error: 'Contribution amount must be greater than 0'
            });
        }
        // Check if donation exists and is not cancelled
        const donation = await db.query('SELECT * FROM donations WHERE id = ?', [parseInt(donation_id)]);
        if (donation.length === 0) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        if (donation[0].status === 'Cancelled') {
            return res.status(400).json({ error: 'Cannot contribute to cancelled donation' });
        }
        // Insert new contribution
        const query = `
            INSERT INTO contributions (
                donation_id, donor_id, contribution_amount, notes, status
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            donation_id,
            donor_id,
            contribution_amount,
            notes || '',
            'Pending'
        ];
        const result = await db.insert(query, params);
        // Get the created contribution with donation details
        const newContribution = await db.query('SELECT c.*, d.donation_type, d.location, d.ngo_name FROM contributions c ' +
            'LEFT JOIN donations d ON c.donation_id = d.id ' +
            'WHERE c.id = ?', [result.insertId]);
        console.log('New contribution created:', newContribution[0]);
        res.status(201).json(newContribution[0]);
    }
    catch (error) {
        console.error('Create contribution error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update contribution status
router.put('/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be one of: Pending, Confirmed, Completed'
            });
        }
        // Update contribution status
        await db.update('UPDATE contributions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, parseInt(id)]);
        // Get updated contribution
        const updatedContribution = await db.query('SELECT c.*, d.donation_type, d.location, d.ngo_name FROM contributions c ' +
            'LEFT JOIN donations d ON c.donation_id = d.id ' +
            'WHERE c.id = ?', [parseInt(id)]);
        if (updatedContribution.length === 0) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        res.json(updatedContribution[0]);
    }
    catch (error) {
        console.error('Update contribution status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
