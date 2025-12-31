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
pickup_date_time: '2024-01-20T14:00:00Z',
    status;
'Pending',
    priority;
'high',
    description;
'School supplies for underprivileged children',
    ngo_name;
'Helping Hands NGO',
    ngo_email;
'ngo@example.com',
    contact_info;
'555-0123',
    created_at;
new Date().toISOString();
{
    id: 3,
        ngo_id;
    3,
        donation_type;
    'medical',
        quantity_or_amount;
    25,
        location;
    'Chicago',
        pickup_date_time;
    '2024-01-18T09:00:00Z',
        status;
    'Confirmed',
        priority;
    'urgent',
        description;
    'Medical supplies for rural clinic',
        ngo_name;
    'Medical Aid NGO',
        ngo_email;
    'medical@example.com',
        contact_info;
    '555-0456',
        created_at;
    new Date().toISOString();
}
;
// Get all donations (with filtering)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { donation_type, location, date_from, date_to, status, ngo_id } = req.query;
        // Start with all donations
        let filteredDonations = [...donations];
        // Apply filters
        if (donation_type) {
            filteredDonations = filteredDonations.filter(d => d.donation_type === donation_type);
        }
        if (location) {
            filteredDonations = filteredDonations.filter(d => d.location.toLowerCase().includes(location.toString().toLowerCase()));
        }
        if (date_from) {
            filteredDonations = filteredDonations.filter(d => new Date(d.pickup_date_time) >= new Date(date_from));
        }
        if (date_to) {
            filteredDonations = filteredDonations.filter(d => new Date(d.pickup_date_time) <= new Date(date_to));
        }
        if (status) {
            filteredDonations = filteredDonations.filter(d => d.status === status);
        }
        if (ngo_id) {
            filteredDonations = filteredDonations.filter(d => d.ngo_id === parseInt(ngo_id));
        }
        // Sort by created_at descending
        filteredDonations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        res.json(filteredDonations);
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
        const donation = donations.find(d => d.id === parseInt(id));
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json(donation);
    }
    catch (error) {
        console.error('Get donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create new donation (NGO only)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
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
        if (pickupDate <= new Date()) {
            return res.status(400).json({
                error: 'Pickup date must be in the future'
            });
        }
        // Create new donation with unique ID
        const newDonation = {
            id: Math.max(...donations.map(d => d.id), 0) + 1,
            ngo_id,
            donation_type,
            quantity_or_amount,
            location,
            pickup_date_time,
            status: 'Pending',
            priority,
            description,
            images,
            ngo_name: ngo_name || 'NGO Name',
            ngo_email: ngo_email || 'ngo@example.com',
            contact_info: contact_info || '555-0123',
            created_at: new Date().toISOString()
        };
        // Save to in-memory storage
        donations.push(newDonation);
        console.log('New donation created:', newDonation);
        console.log('Total donations in storage:', donations.length);
        res.status(201).json(newDonation);
    }
    catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update donation (NGO only)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Mock update
        res.json({
            message: 'Donation updated successfully',
            donation: { id: parseInt(id), ...updates }
        });
    }
    catch (error) {
        console.error('Update donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Cancel donation (NGO only)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Mock cancellation
        res.json({
            message: 'Donation cancelled successfully',
            donation: { id: parseInt(id), status: 'Cancelled' }
        });
    }
    catch (error) {
        console.error('Cancel donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
