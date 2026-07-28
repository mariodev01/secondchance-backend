require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const natural = require('natural'); // Tarea 8: importación del paquete natural

const tokenizer = new natural.WordTokenizer();

function generateKeywords(item) {
    const text = `${item.name} ${item.description}`.toLowerCase();
    const tokens = tokenizer.tokenize(text);
    return [...new Set(tokens)];
}

async function importData() {
    const uri = process.env.MONGO_URL;
    const dbName = process.env.MONGO_DB || 'secondChance';

    if (!uri) {
        console.error('ERROR: MONGO_URL no está definido en tu archivo .env');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        const db = client.db(dbName);
        const collection = db.collection('secondChanceItems');

        await collection.deleteMany({});

        const rawData = fs.readFileSync(
            path.join(__dirname, 'secondChanceItems.json')
        );
        const { docs } = JSON.parse(rawData);

        const docsWithKeywords = docs.map((item) => ({
            ...item,
            keywords: generateKeywords(item),
        }));

        const result = await collection.insertMany(docsWithKeywords);

        console.log('inserted_items:');
        console.log(`Number of documents inserted: ${result.insertedCount}`);
        console.log(Object.values(result.insertedIds));
    } catch (err) {
        console.error('Error importing data:', err);
    } finally {
        await client.close();
    }
}

importData();