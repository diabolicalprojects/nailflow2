const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const pool = require('../db/pool');
const router = express.Router();

// Memory storage — files go directly to CDN
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 10 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

const CDN_UPLOAD_URL = 'https://api.diabolicalservices.tech/api/images/upload';
const CDN_API_KEY_REFERENCES = process.env.CDN_API_KEY_REFERENCES || 'dmm_XKnnaMPrgRWaRHQ21deaQ3Krz2B6iBW';
const CDN_API_KEY = process.env.CDN_API_KEY || 'dmm_7tpONlAMTNtIMLjpr4gMSNqw9LGbgX6X';

/**
 * POST /api/reference-images/upload
 * Original endpoint — requires a paid booking_id (for client reference images)
 */
router.post('/upload', upload.array('images', 10), async (req, res) => {
    const { booking_id } = req.body;

    if (!booking_id) {
        return res.status(400).json({ error: 'booking_id is required' });
    }

    // Allow admin uploads for service thumbnails, staff photos, etc.
    const isAdminUpload = ['service-thumbnail', 'staff-profile', 'business-logo'].includes(booking_id);

    if (!isAdminUpload) {
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
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images provided' });
    }

    // Select CDN key based on purpose
    const apiKey = isAdminUpload ? CDN_API_KEY : CDN_API_KEY_REFERENCES;

    const uploadedImages = [];
    const errors = [];

    console.log(`Starting CDN upload for ${req.files.length} images. Admin mode: ${isAdminUpload}`);

    for (const file of req.files) {
        try {
            const form = new FormData();
            form.append('images', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });

            console.log(`Uploading file ${file.originalname} to CDN...`);
            const cdnResponse = await axios.post(CDN_UPLOAD_URL, form, {
                headers: {
                    ...form.getHeaders(),
                    'x-api-key': apiKey,
                },
                timeout: 30000,
            });

            const cdnData = cdnResponse.data;
            console.log('CDN Response received:', JSON.stringify(cdnData));

            // Extract URL from various possible response formats
            let imageUrl = null;
            if (cdnData.urls && cdnData.urls[0]) {
                imageUrl = cdnData.urls[0];
            } else if (Array.isArray(cdnData.uploaded) && cdnData.uploaded[0]?.url) {
                imageUrl = cdnData.uploaded[0].url;
            } else if (cdnData.url) {
                imageUrl = cdnData.url;
            } else if (cdnData.data?.url) {
                imageUrl = cdnData.data.url;
            } else if (cdnData.uploaded?.[0]?.url) {
                imageUrl = cdnData.uploaded[0].url;
            }

            if (imageUrl) {
                console.log(`Success! Image URL: ${imageUrl}`);

                // Ensure the URL is absolute and use HTTPS
                if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

                // Append API key for display authorization as per CDN guide
                const separator = imageUrl.includes('?') ? '&' : '?';
                const finalUrl = `${imageUrl}${separator}api_key=${apiKey}`;

                // If it's a reference image, store in DB
                if (!isAdminUpload) {
                    const dbResult = await pool.query(
                        `INSERT INTO reference_images (booking_id, image_url, cdn_filename, expires_at)
                         VALUES ($1, $2, $3, NOW() + INTERVAL '14 days')
                         RETURNING id, image_url, uploaded_at, expires_at`,
                        [booking_id, finalUrl, file.originalname]
                    );
                    uploadedImages.push(dbResult.rows[0]);
                } else {
                    // Admin uploads: return object with URL including API Key
                    uploadedImages.push({ image_url: finalUrl, url: finalUrl });
                }
            } else {
                console.warn('CDN upload succeeded but no URL was found in response:', cdnData);
                errors.push({ file: file.originalname, error: 'No URL returned from CDN' });
            }
        } catch (fileErr) {
            const errorMsg = fileErr.response?.data?.message || fileErr.response?.data?.error || fileErr.message;
            console.error('CDN upload error for file:', file.originalname, errorMsg);
            if (fileErr.response) {
                console.error('CDN Error Details:', JSON.stringify(fileErr.response.data));
            }
            errors.push({ file: file.originalname, error: errorMsg });
        }
    }

    const success = uploadedImages.length > 0;
    res.json({
        success,
        uploaded: uploadedImages,
        urls: uploadedImages.map(img => img.image_url || img.url),
        errors,
        message: success ? `${uploadedImages.length} image(s) uploaded successfully.` : 'Failed to upload images.',
    });
});

/**
 * GET /api/reference-images/:booking_id
 * Returns reference images for a specific booking
 */
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
