import express from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

// Get all donations (with filtering)
router.get('/', async (req, res) => {
    try {
        const { donation_type, location, date_from, date_to, status } = req.query;
        
        // Build query conditions
        let whereClause = 'WHERE d.status != "Cancelled"';
        const params: any[] = [];

        if (donation_type) {
            whereClause += ' AND d.donation_type = ?';
            params.push(donation_type);
        }

        if (location) {
            whereClause += ' AND d.location LIKE ?';
            params.push(`%${location}%`);
        }

        if (date_from) {
            whereClause += ' AND d.pickup_date_time >= ?';
            params.push(date_from);
        }

        if (date_to) {
            whereClause += ' AND d.pickup_date_time <= ?';
            params.push(date_to);
        }

        if (status) {
            whereClause += ' AND d.status = ?';
            params.push(status);
        }

        const query = `
            SELECT d.*, u.name as ngo_name, u.email as ngo_email 
            FROM donations d 
            LEFT JOIN users u ON d.ngo_id = u.id 
            ${whereClause} 
            ORDER BY d.created_at DESC
        `;

        // Mock response for now
        const mockDonations = [
            {
                id: 1,
                ngo_id: 2,
                donation_type: 'food',
                quantity_or_amount: 100,
                location: 'New York',
                pickup_date_time: '2024-01-15T10:00:00Z',
                status: 'Pending',
                priority: 'medium',
                description: 'Food items for homeless shelter',
                ngo_name: 'Helping Hands NGO',
                created_at: new Date().toISOString()
            }
        ];

        res.json(mockDonations);

    } catch (error: any) {
        console.error('Get donations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT d.*, u.name as ngo_name, u.email as ngo_email, u.contact_info 
            FROM donations d 
            LEFT JOIN users u ON d.ngo_id = u.id 
            WHERE d.id = ?
        `;

        // Mock response
        const mockDonation = {
            id: parseInt(id),
            ngo_id: 2,
            donation_type: 'food',
            quantity_or_amount: 100,
            location: 'New York',
            pickup_date_time: '2024-01-15T10:00:00Z',
            status: 'Pending',
            priority: 'medium',
            description: 'Food items for homeless shelter',
            ngo_name: 'Helping Hands NGO',
            ngo_email: 'ngo@example.com',
            contact_info: '555-0123',
            created_at: new Date().toISOString()
        };

        res.json(mockDonation);

    } catch (error: any) {
        console.error('Get donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new donation (NGO only)
router.post('/', async (req, res) => {
    try {
        const { 
            ngo_id, 
            donation_type, 
            quantity_or_amount, 
            location, 
            pickup_date_time, 
            priority = 'medium',
            description,
            images 
        } = req.body;

        // Validation
        if (!ngo_id || !donation_type || !quantity_or_amount || !location || !pickup_date_time) {
            return res.status(400).json({ 
                error: 'Missing required fields: ngo_id, donation_type, quantity_or_amount, location, pickup_date_time' 
            });
        }

        if (!['food', 'funds', 'clothes', 'other'].includes(donation_type)) {
            return res.status(400).json({ 
                error: 'Invalid donation type. Must be: food, funds, clothes, or other' 
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

        // Mock creation
        const newDonation = {
            id: Date.now(),
            ngo_id,
            donation_type,
            quantity_or_amount,
            location,
            pickup_date_time,
            status: 'Pending',
            priority,
            description,
            images,
            created_at: new Date().toISOString()
        };

        res.status(201).json({
            message: 'Donation created successfully',
            donation: newDonation
        });

    } catch (error: any) {
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

    } catch (error: any) {
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

    } catch (error: any) {
        console.error('Cancel donation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
