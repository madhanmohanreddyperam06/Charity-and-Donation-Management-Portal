"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// In-memory storage for contributions (in production, this would be a database)
let contributions = [];
// Get all contributions for a donor
router.get('/donor/:donorId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { donorId } = req.params;
        // Filter contributions by donor ID
        const donorContributions = contributions.filter(c => c.donor_id === parseInt(donorId));
        res.json(donorContributions);
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
        // Filter contributions by donation ID
        const donationContributions = contributions.filter(c => c.donation_id === parseInt(donationId));
        res.json(donationContributions);
    }
    catch (error) {
        console.error('Get donation contributions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create new contribution
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { donation_id, donor_id, contribution_amount, notes, scheduled_pickup_date_time, pickup_address } = req.body;
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
        // Create new contribution with unique ID
        const newContribution = {
            id: Math.max(...contributions.map(c => c.id), 0) + 1,
            donation_id,
            donor_id,
            contribution_amount,
            notes,
            status: 'Pending',
            scheduled_pickup_date_time,
            pickup_address,
            created_at: new Date().toISOString()
        };
        // Save to in-memory storage
        contributions.push(newContribution);
        console.log('New contribution created:', newContribution);
        console.log('Total contributions in storage:', contributions.length);
        // Create pickup if scheduled
        let pickup = null;
        if (scheduled_pickup_date_time && pickup_address) {
            pickup = {
                id: newContribution.id + 1000, // Different ID range for pickups
                contribution_id: newContribution.id,
                scheduled_date_time: scheduled_pickup_date_time,
                status: 'Scheduled',
                pickup_address,
                created_at: new Date().toISOString()
            };
        }
        res.status(201).json({
            contribution: newContribution,
            pickup
        });
    }
    catch (error) {
        console.error('Create contribution error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update contribution status (NGO only)
router.put('/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be: Pending, Confirmed, or Completed'
            });
        }
        // Find and update contribution in storage
        const contributionIndex = contributions.findIndex(c => c.id === parseInt(id));
        if (contributionIndex === -1) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        contributions[contributionIndex].status = status;
        console.log('Contribution status updated:', contributions[contributionIndex]);
        res.json({
            message: 'Contribution status updated successfully',
            contribution: contributions[contributionIndex]
        });
    }
    catch (error) {
        console.error('Update contribution status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
