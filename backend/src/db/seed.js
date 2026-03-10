require('dotenv').config();
const pool = require('./pool');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Salt and hashes
    const salt = await bcrypt.genSalt(10);
    const superPass = await bcrypt.hash('superadmin2024', salt);
    const lidiaPass = await bcrypt.hash('lidia2024', salt);

    // Insert business
    const businessResult = await client.query(`
            INSERT INTO businesses (name, logo_url, brand_color_primary, brand_color_secondary, system_mode)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            RETURNING id
        `, ['NailFlow Studio Premium', null, '#E6A4B4', '#F3D7CA', 'live']);

    let businessId;
    if (businessResult.rows.length > 0) {
      businessId = businessResult.rows[0].id;
    } else {
      const existing = await client.query('SELECT id FROM businesses LIMIT 1');
      businessId = existing.rows[0].id;
    }

    // Insert Superadmin
    await client.query(`
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
        `, ['Super Admin', 'admin@nailflow.com', superPass, 'superadmin']);

    // Insert Lidia as owner
    await client.query(`
            INSERT INTO users (name, email, password_hash, role, business_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, business_id = EXCLUDED.business_id
        `, ['Lidia Martínez', 'lidia@nailflow.com', lidiaPass, 'owner', businessId]);

    // Insert staff (Lidia, María, Ana)
    await client.query(`
            INSERT INTO staff (business_id, name, role, phone, booking_slug, profile_image, is_active)
            VALUES 
                ($1, 'Lidia Martínez', 'director', '+521234567890', 'lidia-owner', null, true),
                ($1, 'María García', 'staff', '+521098765432', 'maria', null, true),
                ($1, 'Ana Martínez', 'staff', '+521122334455', 'ana-nailart', null, true)
            ON CONFLICT (booking_slug) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
        `, [businessId]);

    // Insert services
    await client.query(`
            INSERT INTO services (business_id, name, description, price, duration_minutes, deposit_percentage, is_active)
            VALUES 
                ($1, 'PolyGel Full Set — Premium', 'Técnica exclusiva de Lidia (Experta). Acabado ultra natural con polímeros de alta densidad.', 75.00, 150, 50, true),
                ($1, 'Uñas Esculpidas XL', 'Extensiones de acrílico extra largas con diseño artístico a elección.', 65.00, 180, 40, true),
                ($1, 'Nail Art 3D Premium', 'Decoración avanzada con relieve y cristales Swarovski.', 30.00, 60, 100, true),
                ($1, 'Manicura Rusa Profunda', 'Limpieza profunda de cutícula y preparación de uña para esmaltado perfecto.', 40.00, 90, 50, true),
                ($1, 'Esmaltado Semipermanente', 'Limpieza y esmaltado de alta duración con brillo intenso.', 32.00, 60, 30, true),
                ($1, 'Baño de Acrílico', 'Fortalecimiento de uña natural con capa protectora de acrílico.', 35.00, 75, 50, true),
                ($1, 'Retiro Terapéutico', 'Remoción segura sin daño a la uña natural con agentes nutritivos.', 18.00, 45, 0, true)
            ON CONFLICT DO NOTHING
        `, [businessId]);

    // System Settings
    await client.query(`
            INSERT INTO system_settings (business_id, booking_min_days, payment_test_mode)
            VALUES ($1, 1, true)
            ON CONFLICT (business_id) DO UPDATE SET booking_min_days = EXCLUDED.booking_min_days
        `, [businessId]);

    await client.query('COMMIT');
    console.log('✅ Seed completed with Lidia and Premium Services');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
