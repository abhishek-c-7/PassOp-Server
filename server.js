const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb'); 
const bodyparser = require('body-parser');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(bodyparser.json());
app.use(cors({
    origin: ["https://pass-op-client.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Connect to MongoDB
const url = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

let db;

async function connectDB() {
    try {
        const client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1); // stop server if DB fails
    }
}

// Routes
app.get('/', async (req, res) => {
    try {
        const collection = db.collection('passwords');
        const findResult = await collection.find({}).toArray();
        res.json(findResult);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/', async (req, res) => { 
    try {
        const collection = db.collection('passwords');
        const result = await collection.insertOne(req.body);
        res.send({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/', async (req, res) => { 
    try {
        const collection = db.collection('passwords');
        const result = await collection.deleteOne(req.body);
        res.send({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server only after DB connection
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(🚀 Server running on port ${PORT}));
});
