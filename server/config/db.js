const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('timesheet-portal');
}

module.exports = connectDB;
