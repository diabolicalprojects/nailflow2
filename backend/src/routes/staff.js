const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// GET /api/staff/:slug - Get staff member by booking slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(
            `SELECT id, name, role, phone, profile_image, booking_slug
       FROM staff
       WHERE booking_slug = $1 AND is_active = true AND role != 'director'`,
            [slug]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch staff member' });
    }
});

// GET /api/staff - List all bookable staff (non-director)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, role, profile_image, booking_slug
       FROM staff
       WHERE is_active = true AND role != 'director'
       ORDER BY name ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

module.exports = router;
