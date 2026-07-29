// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const connectToDatabase = require('../models/db');

const COLLECTION = 'users';
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);

        const { email, firstName, lastName, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            email,
            firstName,
            lastName,
            password: hashedPassword,
            createdAt: new Date(),
        };

        const result = await collection.insertOne(newUser);

        const token = jwt.sign({ userId: result.insertedId, email }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({
            token,
            user: { id: result.insertedId, email, firstName, lastName },
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);

        const { email, password } = req.body;

        const user = await collection.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            token,
            user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/auth/update
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = decoded;
        next();
    });
}

router.put('/update', verifyToken, async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);

        const { firstName, lastName } = req.body;

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(req.user.userId) },
            { $set: { firstName, lastName, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: result._id,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;