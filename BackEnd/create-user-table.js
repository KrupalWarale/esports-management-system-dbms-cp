require('dotenv').config({path: '../.env'});
const connection = require('./database.js');

// Create USER_ACCOUNTS table
const createUserAccountsTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS USER_ACCOUNTS (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error creating USER_ACCOUNTS table:', err);
            return;
        }
        console.log('USER_ACCOUNTS table created or already exists');
        
        // Check if any admin users exist, if not, create a default one
        connection.query('SELECT * FROM USER_ACCOUNTS WHERE role = "admin"', (err, results) => {
            if (err) {
                console.error('Error checking for admin users:', err);
                return connection.end();
            }
            
            if (results.length === 0) {
                // Create default admin user
                const bcrypt = require('bcrypt');
                const adminPassword = 'admin123';
                
                bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error('Error hashing password:', err);
                        return connection.end();
                    }
                    
                    const adminUser = {
                        email: 'admin@esports.com',
                        password: hashedPassword,
                        name: 'Admin',
                        role: 'admin'
                    };
                    
                    connection.query('INSERT INTO USER_ACCOUNTS SET ?', adminUser, (err, result) => {
                        if (err) {
                            console.error('Error creating admin user:', err);
                        } else {
                            console.log('Default admin user created successfully');
                        }
                        connection.end();
                    });
                });
            } else {
                console.log('Admin user(s) already exist');
                connection.end();
            }
        });
    });
};

createUserAccountsTable(); 