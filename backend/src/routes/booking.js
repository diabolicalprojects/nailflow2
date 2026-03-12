const express = require('express');
const pool = require('../db/pool');
const axios = require('axios');
const router = express.Router();

// GET /api/booking/availability - Check available slots
router.get('/availability', async (req, res) => {
    try {
        const { date, staff_id } = req.query;
        if (!date || !staff_id) {
            return res.status(400).json({ error: 'date and staff_id are required' });
        }

        // Get booked times for given date and staff
        const booked = await pool.query(
            `SELECT start_time, s.duration_minutes
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.staff_id = $1 AND b.booking_date = $2 AND b.status != 'cancelled'`,
            [staff_id, date]
        );

        // Business hours: 9am - 7pm
        const allSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
            '18:00', '18:30'
        ];

        const bookedTimes = booked.rows.map(r => r.start_time.slice(0, 5));
        const available = allSlots.filter(slot => !bookedTimes.includes(slot));

        res.json({ date, staff_id, available_slots: available });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check availability' });
    }
});

// POST /api/booking/create - Create a new booking
router.post('/create', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            service_id, staff_id, booking_date, start_time,
            client_name, client_phone, client_email, notes
        } = req.body;

        // Validate minimum days in advance (Disabled for Demo)
        // const settings = await pool.query('SELECT booking_min_days FROM system_settings LIMIT 1');
        // const minDays = settings.rows[0]?.booking_min_days || 7;
        // 
        // const bookingDate = new Date(booking_date);
        // const today = new Date();
        // today.setHours(0, 0, 0, 0);
        // const daysDiff = Math.floor((bookingDate - today) / (1000 * 60 * 60 * 24));
        // 
        // if (daysDiff < minDays) {
        //     return res.status(400).json({
        //         error: `Bookings must be at least ${minDays} days in advance`
        //     });
        // }

        // Get service details for deposit calculation
        const serviceResult = await pool.query(
            'SELECT price, deposit_percentage FROM services WHERE id = $1',
            [service_id]
        );
        if (serviceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        const { price, deposit_percentage } = serviceResult.rows[0];
        const depositAmount = (price * deposit_percentage / 100).toFixed(2);

        await client.query('BEGIN');

        // Upsert client
        let clientId;
        const existingClient = await client.query(
            'SELECT id FROM clients WHERE phone = $1', [client_phone]
        );
        if (existingClient.rows.length > 0) {
            clientId = existingClient.rows[0].id;
        } else {
            const newClient = await client.query(
                'INSERT INTO clients (name, phone, email) VALUES ($1, $2, $3) RETURNING id',
                [client_name, client_phone, client_email]
            );
            clientId = newClient.rows[0].id;
        }

        // Get business id
        const business = await client.query('SELECT id FROM businesses LIMIT 1');
        const businessId = business.rows[0].id;

        // Create booking
        const bookingResult = await client.query(
            `INSERT INTO bookings 
        (business_id, client_id, staff_id, service_id, booking_date, start_time, deposit_amount, status, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'pending', $8)
       RETURNING id`,
            [businessId, clientId, staff_id, service_id, booking_date, start_time, depositAmount, notes]
        );

        await client.query('COMMIT');

        res.status(201).json({
            booking_id: bookingResult.rows[0].id,
            deposit_amount: parseFloat(depositAmount),
            message: 'Booking created. Please complete payment to confirm.',
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create booking', details: err.message });
    } finally {
        client.release();
    }
});

// GET /api/booking/:id - Get booking details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT b.*, 
        c.name as client_name, c.phone as client_phone, c.email as client_email,
        s.name as staff_name, s.booking_slug,
        sv.name as service_name, sv.price, sv.duration_minutes,
        json_agg(ri.image_url) FILTER (WHERE ri.id IS NOT NULL) as reference_images
       FROM bookings b
       JOIN clients c ON b.client_id = c.id
       LEFT JOIN staff s ON b.staff_id = s.id
       JOIN services sv ON b.service_id = sv.id
       LEFT JOIN reference_images ri ON ri.booking_id = b.id
       WHERE b.id = $1
       GROUP BY b.id, c.name, c.phone, c.email, s.name, s.booking_slug, sv.name, sv.price, sv.duration_minutes`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

module.exports = router;
