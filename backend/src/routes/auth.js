const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const SECRET = process.env.JWT_SECRET || 'nailflow_secret_key_2024';

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({
            id: user.id,
            role: user.role,
            business_id: user.business_id,
            name: user.name
        }, SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, business_id: user.business_id } });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Create Owner (Superadmin only)
router.post('/register-owner', async (req, res) => {
    const { name, email, password, business_id } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET);

        if (decoded.role !== 'superadmin') {
            return res.status(403).json({ error: 'Solo el superusuario puede crear dueños' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, business_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email',
            [name, email, hash, 'owner', business_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'El email ya existe' });
        res.status(500).json({ error: 'Error al registrar dueño' });
    }
});

module.exports = router;
