const express = require('express');
const pool = require('../db/pool');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'nailflow_secret_key_2024';

// Simple auth middleware (token-based)
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        if (!process.env.DASHBOARD_SECRET) return next();
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // Fallback for the static dashboard secret for backward compatibility
        if (token === process.env.DASHBOARD_SECRET) return next();
        return res.status(401).json({ error: 'Invalid token' });
    }
};

router.use(authMiddleware);

// GET /api/dashboard/bookings
router.get('/bookings', async (req, res) => {
    try {
        const { status, date_from, date_to } = req.query;
        let query = `
      SELECT b.*, 
        c.name as client_name, c.phone as client_phone,
        s.name as staff_name,
        sv.name as service_name, sv.price,
        json_agg(ri.image_url) FILTER (WHERE ri.id IS NOT NULL) as reference_images
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      LEFT JOIN staff s ON b.staff_id = s.id
      JOIN services sv ON b.service_id = sv.id
      LEFT JOIN reference_images ri ON ri.booking_id = b.id
    `;
        const params = [];
        const conditions = [];

        if (status) {
            params.push(status);
            conditions.push(`b.status = $${params.length}`);
        }
        if (date_from) {
            params.push(date_from);
            conditions.push(`b.booking_date >= $${params.length}`);
        }
        if (date_to) {
            params.push(date_to);
            conditions.push(`b.booking_date <= $${params.length}`);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' GROUP BY b.id, c.name, c.phone, s.name, sv.name, sv.price ORDER BY b.booking_date DESC, b.start_time ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// GET /api/dashboard/services
router.get('/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY price ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// POST /api/dashboard/services/create
router.post('/services/create', async (req, res) => {
    try {
        const { name, description, price, duration_minutes, deposit_percentage, image_url } = req.body;
        const business = await pool.query('SELECT id FROM businesses LIMIT 1');
        const result = await pool.query(
            `INSERT INTO services (business_id, name, description, price, duration_minutes, deposit_percentage, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [business.rows[0].id, name, description, price, duration_minutes || 60, deposit_percentage || 30, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// PUT /api/dashboard/services/update
router.put('/services/update', async (req, res) => {
    try {
        const { id, name, description, price, duration_minutes, deposit_percentage, is_active, image_url } = req.body;
        const result = await pool.query(
            `UPDATE services SET name=$1, description=$2, price=$3, duration_minutes=$4, deposit_percentage=$5, is_active=$6, image_url=$7
       WHERE id=$8 RETURNING *`,
            [name, description, price, duration_minutes, deposit_percentage, is_active, image_url, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// DELETE /api/dashboard/services/delete
router.delete('/services/delete', async (req, res) => {
    try {
        const { id } = req.body;
        await pool.query('UPDATE services SET is_active = false WHERE id = $1', [id]);
        res.json({ message: 'Service deactivated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

// GET /api/dashboard/staff
router.get('/staff', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM staff ORDER BY role, name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// POST /api/dashboard/staff/create
router.post('/staff/create', async (req, res) => {
    try {
        const { name, role, phone, booking_slug, profile_image, specialty } = req.body;
        const business = await pool.query('SELECT id FROM businesses LIMIT 1');
        const slug = role === 'director' ? null : booking_slug;
        const result = await pool.query(
            `INSERT INTO staff (business_id, name, role, phone, booking_slug, profile_image, specialty)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [business.rows[0].id, name, role || 'staff', phone, slug, profile_image, specialty]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create staff member', details: err.message });
    }
});

// PUT /api/dashboard/staff/update
router.put('/staff/update', async (req, res) => {
    try {
        const { id, name, role, phone, booking_slug, is_active, profile_image, specialty } = req.body;
        const slug = role === 'director' ? null : booking_slug;
        const result = await pool.query(
            `UPDATE staff SET name=$1, role=$2, phone=$3, booking_slug=$4, is_active=$5, profile_image=$6, specialty=$7
       WHERE id=$8 RETURNING *`,
            [name, role, phone, slug, is_active, profile_image, specialty, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update staff member' });
    }
});

// DELETE /api/dashboard/staff/delete
router.delete('/staff/delete', async (req, res) => {
    try {
        const { id } = req.body;
        await pool.query('UPDATE staff SET is_active = false WHERE id = $1', [id]);
        res.json({ message: 'Staff member deactivated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete staff member' });
    }
});

// GET /api/dashboard/settings
router.get('/settings', async (req, res) => {
    try {
        const business = await pool.query('SELECT * FROM businesses LIMIT 1');
        const settings = await pool.query('SELECT * FROM system_settings LIMIT 1');
        res.json({
            business: business.rows[0],
            settings: settings.rows[0],
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT /api/dashboard/settings/update
router.put('/settings/update', async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, logo_url, brand_color_primary, brand_color_secondary, booking_min_days, n8n_webhook_url } = req.body;
        await client.query('BEGIN');

        const business = await client.query('SELECT id FROM businesses LIMIT 1');
        const businessId = business.rows[0].id;

        await client.query(
            'UPDATE businesses SET name=$1, logo_url=$2, brand_color_primary=$3, brand_color_secondary=$4 WHERE id=$5',
            [name, logo_url, brand_color_primary, brand_color_secondary, businessId]
        );

        await client.query(
            `INSERT INTO system_settings (business_id, booking_min_days, n8n_webhook_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (business_id) DO UPDATE SET booking_min_days=$2, n8n_webhook_url=$3`,
            [businessId, booking_min_days || 7, n8n_webhook_url]
        );

        await client.query('COMMIT');
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Failed to update settings' });
    } finally {
        client.release();
    }
});

// GET /api/dashboard/payments
router.get('/payments', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, b.booking_date, b.start_time, c.name as client_name, sv.name as service_name
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN clients c ON b.client_id = c.id
       JOIN services sv ON b.service_id = sv.id
       ORDER BY p.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const [bookingsCount, paidCount, totalRevenue, clientsCount] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM bookings WHERE status != 'cancelled'"),
            pool.query("SELECT COUNT(*) FROM bookings WHERE payment_status = 'paid'"),
            pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'paid'"),
            pool.query('SELECT COUNT(*) FROM clients'),
        ]);
        res.json({
            total_bookings: parseInt(bookingsCount.rows[0].count),
            paid_bookings: parseInt(paidCount.rows[0].count),
            total_revenue: parseFloat(totalRevenue.rows[0].total),
            total_clients: parseInt(clientsCount.rows[0].count),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
