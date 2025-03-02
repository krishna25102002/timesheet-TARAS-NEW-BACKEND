const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

// MongoDB connection
async function connectMongoDB() {
    await mongoose.connect('YOUR_MONGODB_CONNECTION_URI', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
}

// MySQL connection
async function connectMySQL() {
    const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'password', database: 'employees' });
    console.log('Connected to MySQL');
    return connection;
}

module.exports = { connectMongoDB, connectMySQL };
