import express from 'express';

const router = express.Router();

// Get all contributions for a donor
router.get('/donor/:donorId', async (req, res) => {
    try {
        const { donorId } = req.params;

        // Mock response
        const mockContributions = [
            {
                id: 1,
                donation_id: 1,
                donor_id: parseInt(donorId),
                contribution_amount: 50,
                notes: 'Happy to help!',
                status: 'Confirmed',
                created_at: new Date().toISOString(),
                donation: {
                    id: 1,
                    donation_type: 'food',
                    location: 'New York',
                    ngo_name: 'Helping Hands NGO'
                }
            }
        ];

        res.json(mockContributions);

    } catch (error: any) {
        console.error('Get donor contributions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all contributions for a donation
router.get('/donation/:donationId', async (req, res) => {
    try {
        const { donationId } = req.params;

        // Mock response
        const mockContributions = [
            {
                id: 1,
                donation_id: parseInt(donationId),
                donor_id: 3,
                contribution_amount: 50,
                notes: 'Happy to help!',
                status: 'Confirmed',
                created_at: new Date().toISOString(),
                donor: {
                    id: 3,
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            }
        ];

        res.json(mockContributions);

    } catch (error: any) {
        console.error('Get donation contributions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new contribution
router.post('/', async (req, res) => {
    try {
        const { 
            donation_id, 
            donor_id, 
            contribution_amount, 
            notes,
            scheduled_pickup_date_time,
            pickup_address 
        } = req.body;

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

        // Mock creation
        const newContribution = {
            id: Date.now(),
            donation_id,
            donor_id,
            contribution_amount,
            notes,
            status: 'Pending',
            created_at: new Date().toISOString()
        };

        // Create pickup if scheduled
        let pickup = null;
        if (scheduled_pickup_date_time && pickup_address) {
            pickup = {
                id: Date.now() + 1,
                contribution_id: newContribution.id,
                scheduled_date_time: scheduled_pickup_date_time,
                status: 'Scheduled',
                pickup_address,
                created_at: new Date().toISOString()
            };
        }

        res.status(201).json({
            message: 'Contribution created successfully',
            contribution: newContribution,
            pickup
        });

    } catch (error: any) {
        console.error('Create contribution error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update contribution status (NGO only)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be: Pending, Confirmed, or Completed' 
            });
        }

        // Mock update
        res.json({
            message: 'Contribution status updated successfully',
            contribution: { id: parseInt(id), status }
        });

    } catch (error: any) {
        console.error('Update contribution status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
