// routes/secondChanceItemsRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');
const connectToDatabase = require('../models/db');

// --- Configuración de multer: dónde y cómo se guardan las imágenes subidas ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

const COLLECTION = 'secondChanceItems';

// GET /api/secondchance/items -> lista todos los artículos
router.get('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);
        const items = await collection.find({}).toArray();
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// GET /api/secondchance/items/:id -> un artículo por su _id de MongoDB
router.get('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid item id' });
        }

        const item = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(item);
    } catch (err) {
        next(err);
    }
});

// POST /api/secondchance/items -> crea un artículo, con imagen opcional
router.post('/', upload.single('image'), async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);

        const newItem = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            condition: req.body.condition,
            age_days: Number(req.body.age_days) || 0,
            date_added: Math.floor(Date.now() / 1000),
            image: req.file ? req.file.filename : null,
        };

        const result = await collection.insertOne(newItem);

        res.status(201).json({ _id: result.insertedId, ...newItem });
    } catch (err) {
        next(err);
    }
});

// PUT /api/secondchance/items/:id -> actualiza un artículo existente
router.put('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid item id' });
        }

        const updateFields = { ...req.body, updated_at: new Date() };

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/secondchance/items/:id -> elimina un artículo
router.delete('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid item id' });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;