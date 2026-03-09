const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// GET /api/services - List all active services for the business
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, description, price, duration_minutes, deposit_percentage, image_url
       FROM services 
       WHERE is_active = true
       ORDER BY price ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

module.exports = router;
