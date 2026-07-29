// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

const COLLECTION = 'secondChanceItems';

// GET /api/secondchance/search
// Query params soportados (todos opcionales, se combinan con AND):
//   ?category=Furniture
//   ?condition=Used
//   ?name=lamp          (busca coincidencia parcial en el nombre)
//   ?age_max=30          (artículos con age_days <= 30)
router.get('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(COLLECTION);

        const { category, condition, name, age_max } = req.query;

        const filter = {};

        if (category) {
            filter.category = category; // filtro por categoría, requisito de la Tarea 6
        }

        if (condition) {
            filter.condition = condition;
        }

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        if (age_max) {
            filter.age_days = { $lte: Number(age_max) };
        }

        const results = await collection.find(filter).toArray();

        res.json(results);
    } catch (err) {
        next(err);
    }
});

module.exports = router;