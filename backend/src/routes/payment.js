const express = require('express');
const pool = require('../db/pool');
const axios = require('axios');
const router = express.Router();

// POST /api/payment/process - Process payment for a booking
router.post('/process', async (req, res) => {
    const client = await pool.connect();
    try {
        const { booking_id, payment_method, card_data } = req.body;

        if (!booking_id || !payment_method) {
            return res.status(400).json({ error: 'booking_id and payment_method are required' });
        }

        // Get booking
        const bookingResult = await pool.query(
            'SELECT * FROM bookings WHERE id = $1',
            [booking_id]
        );
        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const booking = bookingResult.rows[0];

        if (booking.payment_status === 'paid') {
            return res.status(400).json({ error: 'Booking already paid' });
        }

        await client.query('BEGIN');

        let paymentSuccess = false;
        let transactionId = null;
        let gatewayResponse = {};

        // Payment processing logic
        if (payment_method === 'test') {
            // Test payment - always succeeds
            paymentSuccess = true;
            transactionId = `TEST-${Date.now()}`;
            gatewayResponse = { method: 'test', status: 'approved' };

        } else if (payment_method === 'mercadopago') {
            // MercadoPago integration
            try {
                const settings = await pool.query('SELECT mercadopago_api_key FROM system_settings LIMIT 1');
                const mpKey = settings.rows[0]?.mercadopago_api_key || process.env.MERCADOPAGO_API_KEY;

                const mpResponse = await axios.post(
                    'https://api.mercadopago.com/v1/payments',
                    {
                        transaction_amount: parseFloat(booking.deposit_amount),
                        token: card_data?.token,
                        description: `NailFlow Deposit - Booking ${booking_id}`,
                        installments: 1,
                        payment_method_id: card_data?.payment_method_id || 'visa',
                        payer: { email: card_data?.email || 'client@nailflow.com' },
                    },
                    { headers: { Authorization: `Bearer ${mpKey}` } }
                );

                if (mpResponse.data.status === 'approved') {
                    paymentSuccess = true;
                    transactionId = String(mpResponse.data.id);
                    gatewayResponse = mpResponse.data;
                }
            } catch (mpErr) {
                console.error('MercadoPago error:', mpErr.message);
                paymentSuccess = false;
                gatewayResponse = { error: mpErr.message };
            }

        } else if (payment_method === 'credit_card' || payment_method === 'apple_pay') {
            // Simulated card payment for demo
            paymentSuccess = true;
            transactionId = `CARD-${Date.now()}`;
            gatewayResponse = { method: payment_method, status: 'approved', simulated: true };
        }

        // Record payment
        await client.query(
            `INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, gateway_response)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                booking_id,
                booking.deposit_amount,
                payment_method,
                paymentSuccess ? 'paid' : 'failed',
                transactionId,
                JSON.stringify(gatewayResponse)
            ]
        );

        if (paymentSuccess) {
            // Confirm booking
            await client.query(
                `UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = $1`,
                [booking_id]
            );

            // Trigger n8n webhook for notifications
            triggerN8nWebhook(booking_id).catch(console.error);
        } else {
            await client.query(
                `UPDATE bookings SET payment_status = 'failed' WHERE id = $1`,
                [booking_id]
            );
        }

        await client.query('COMMIT');

        if (paymentSuccess) {
            res.json({
                success: true,
                message: 'Payment successful! Your booking is confirmed.',
                transaction_id: transactionId,
                booking_id,
            });
        } else {
            res.status(402).json({
                success: false,
                message: 'Payment failed. Please try again.',
                booking_id,
            });
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Payment processing failed', details: err.message });
    } finally {
        client.release();
    }
});

async function triggerN8nWebhook(bookingId) {
    try {
        const settings = await pool.query('SELECT n8n_webhook_url FROM system_settings LIMIT 1');
        const webhookUrl = settings.rows[0]?.n8n_webhook_url || process.env.N8N_WEBHOOK_URL;
        if (!webhookUrl) return;

        const booking = await pool.query(
            `SELECT b.*, c.name as client_name, c.phone as client_phone, 
              s.name as staff_name, sv.name as service_name
       FROM bookings b
       JOIN clients c ON b.client_id = c.id
       LEFT JOIN staff s ON b.staff_id = s.id
       JOIN services sv ON b.service_id = sv.id
       WHERE b.id = $1`,
            [bookingId]
        );

        await axios.post(webhookUrl, {
            event: 'booking_confirmed',
            booking: booking.rows[0],
        });
    } catch (err) {
        console.error('n8n webhook error:', err.message);
    }
}

module.exports = router;
