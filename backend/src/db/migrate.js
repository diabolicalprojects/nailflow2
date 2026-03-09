require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function migrate() {
    const client = await pool.connect();
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await client.query(sql);
        console.log('✅ Database migration completed successfully');
    } catch (err) {
        console.error('❌ Migration error:', err);
        throw err;
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
