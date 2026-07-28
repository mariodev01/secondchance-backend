// models/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB || 'secondChance';

let dbInstance = null; // cache: aquí guardamos la conexión ya establecida

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    const client = new MongoClient(url);

    await client.connect(); // <-- la línea que exige la Tarea 4

    dbInstance = client.db(dbName);
    console.log(`Connected to MongoDB database: ${dbName}`);

    return dbInstance;
}

module.exports = connectToDatabase;