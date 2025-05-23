const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    database: process.env.DB_NAME || 'esports',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root@123',
    // Use the following option to avoid the "Unknown column p.nickname" error
    typeCast: function (field, next) {
        return next();
    }
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL as id:', connection.threadId);
});

module.exports = connection;
