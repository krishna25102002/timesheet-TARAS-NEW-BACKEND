const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('MongoDB URI:', uri); // Log the URI to check for any issues

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('timesheetportal');
    } catch (error) {
        console.error('Failed to connect to the database', error);
        process.exit(1);
    }
}

module.exports = connectDB;
