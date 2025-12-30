import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import protect from '../middleware/auth.js';


const router = express.Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
}

// helper: создаём токен по id пользователя
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}

//Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
        [name, email, hashedPassword]
    );
    const token = generateToken(newUser.rows[0].id);
    res.cookie('token', token, cookieOptions);
    return res.status(201).json({ user: newUser.rows[0] });
})

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' })
    }

    const userData = user.rows[0];

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(userData.id);
    res.cookie('token', token, cookieOptions);

    res.json({
        user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'user'
        },
    });
})


// Me
router.get('/me', protect, async (req, res) => {
    res.json(req.user)
    // return indo of the logged in user from protect middleware
})

// Logout
router.post('/logout', async (req, res) => {
    res.cookie('token', '', { ...cookieOptions, maxAge: 1 });
    res.json({ message: 'Logged out successfully' });
});

export default router;