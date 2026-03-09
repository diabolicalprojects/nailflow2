require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const pool = require('./db/pool');

const servicesRouter = require('./routes/services');
const staffRouter = require('./routes/staff');
const bookingRouter = require('./routes/booking');
const paymentRouter = require('./routes/payment');
const imagesRouter = require('./routes/images');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'NailFlow API' });
});

// API Routes
app.use('/api/services', servicesRouter);
app.use('/api/staff', staffRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/reference-images', imagesRouter);
app.use('/api/dashboard', dashboardRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Cron: auto-delete reference images after 14 days
cron.schedule('0 2 * * *', async () => {
    console.log('Running reference image cleanup...');
    try {
        const result = await pool.query(
            'DELETE FROM reference_images WHERE expires_at < NOW() RETURNING id'
        );
        console.log(`Deleted ${result.rowCount} expired reference images`);
    } catch (err) {
        console.error('Cleanup error:', err.message);
    }
});

app.listen(PORT, () => {
    console.log(`🌸 NailFlow API running on port ${PORT}`);
});

module.exports = app;
