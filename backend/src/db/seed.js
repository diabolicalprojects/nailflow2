require('dotenv').config();
const pool = require('./pool');

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert demo business
        const businessResult = await client.query(`
      INSERT INTO businesses (name, logo_url, brand_color_primary, brand_color_secondary, system_mode)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, ['NailFlow Studio', null, '#F9A8D4', '#FBCFE8', 'live']);

        let businessId;
        if (businessResult.rows.length > 0) {
            businessId = businessResult.rows[0].id;
        } else {
            const existing = await client.query('SELECT id FROM businesses LIMIT 1');
            businessId = existing.rows[0].id;
        }

        // Insert staff
        await client.query(`
      INSERT INTO staff (business_id, name, role, phone, booking_slug, is_active)
      VALUES 
        ($1, 'María García', 'director', '+1234567890', NULL, true),
        ($1, 'Lidia Martínez', 'staff', '+0987654321', 'lidia', true),
        ($1, 'Ana López', 'staff', '+1122334455', 'ana', true)
      ON CONFLICT (booking_slug) DO NOTHING
    `, [businessId]);

        // Insert services
        await client.query(`
      INSERT INTO services (business_id, name, description, price, duration_minutes, deposit_percentage, is_active)
      VALUES 
        ($1, 'Uñas Acrílicas', 'Set completo de uñas acrílicas con diseño personalizado', 45.00, 90, 30, true),
        ($1, 'Gel Nail Art', 'Uñas en gel con arte decorativo exclusivo', 35.00, 75, 30, true),
        ($1, 'Nail Extensions', 'Extensiones naturales de alta duración', 55.00, 120, 40, true),
        ($1, 'Mantenimiento', 'Relleno y mantenimiento de uñas existentes', 25.00, 60, 20, true),
        ($1, 'Diseño Premium', 'Diseño 3D y nail art de alta complejidad', 65.00, 150, 50, true)
      ON CONFLICT DO NOTHING
    `, [businessId]);

        // Insert system settings
        await client.query(`
      INSERT INTO system_settings (business_id, booking_min_days, reference_image_retention_days, payment_test_mode)
      VALUES ($1, 7, 14, true)
      ON CONFLICT (business_id) DO UPDATE SET updated_at = NOW()
    `, [businessId]).catch(() => {
            // Settings already exist, skip
        });

        await client.query('COMMIT');
        console.log('✅ Seed completed successfully');
        console.log('Business ID:', businessId);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seed error:', err.message);
        throw err;
    } finally {
        client.release();
        pool.end();
    }
}

seed();
