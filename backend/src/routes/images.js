const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const pool = require('../db/pool');
const router = express.Router();

// Use memory storage - files go directly to CDN
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // 10MB per file, max 10 files
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

const CDN_UPLOAD_URL = 'https://api.diabolicalservices.tech/api/images/upload';
const CDN_API_KEY = process.env.CDN_API_KEY_REFERENCES || 'dmm_XKnnaMPrgRWaRHQ21deaQ3Krz2B6iBW';

// POST /api/reference-images/upload
router.post('/upload', upload.array('images', 10), async (req, res) => {
    const { booking_id } = req.body;

    if (!booking_id) {
        return res.status(400).json({ error: 'booking_id is required' });
    }

    // CRITICAL: Only allow upload after payment confirmation
    const booking = await pool.query(
        'SELECT payment_status, status FROM bookings WHERE id = $1',
        [booking_id]
    );

    if (booking.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.rows[0].payment_status !== 'paid') {
        return res.status(403).json({
            error: 'Reference images can only be uploaded after payment confirmation'
        });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images provided' });
    }

    const uploadedImages = [];
    const errors = [];

    for (const file of req.files) {
        try {
            const form = new FormData();
            form.append('images', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });

            const cdnResponse = await axios.post(CDN_UPLOAD_URL, form, {
                headers: {
                    ...form.getHeaders(),
                    'x-api-key': CDN_API_KEY,
                },
                timeout: 30000,
            });

            const cdnData = cdnResponse.data;
            const imageUrl = Array.isArray(cdnData.uploaded)
                ? cdnData.uploaded[0]?.url
                : cdnData.url;

            if (imageUrl) {
                // Store in database with 14-day expiration
                const dbResult = await pool.query(
                    `INSERT INTO reference_images (booking_id, image_url, cdn_filename, expires_at)
           VALUES ($1, $2, $3, NOW() + INTERVAL '14 days')
           RETURNING id, image_url, uploaded_at, expires_at`,
                    [booking_id, imageUrl, file.originalname]
                );
                uploadedImages.push(dbResult.rows[0]);
            }
        } catch (fileErr) {
            console.error('CDN upload error for file:', file.originalname, fileErr.message);
            errors.push({ file: file.originalname, error: fileErr.message });
        }
    }

    res.json({
        success: true,
        uploaded: uploadedImages,
        errors,
        message: `${uploadedImages.length} image(s) uploaded successfully. They will be automatically deleted after 14 days.`,
    });
});

// GET /api/reference-images/:booking_id
router.get('/:booking_id', async (req, res) => {
    try {
        const { booking_id } = req.params;
        const result = await pool.query(
            'SELECT id, image_url, uploaded_at, expires_at FROM reference_images WHERE booking_id = $1 ORDER BY uploaded_at DESC',
            [booking_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch reference images' });
    }
});

module.exports = router;
