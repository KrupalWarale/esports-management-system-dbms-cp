require('dotenv').config({path: '../.env'});
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'esports',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root@123'
});

async function createAdminUser() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Check if admin user already exists
        connection.query('SELECT * FROM LOGIN WHERE email = ?', ['admin@esports.com'], async (err, results) => {
            if (err) {
                console.error('Error checking admin user:', err);
                process.exit(1);
            }
            
            if (results.length === 0) {
                // Insert admin user
                connection.query(
                    'INSERT INTO LOGIN (email, pwd) VALUES (?, ?)',
                    ['admin@esports.com', hashedPassword],
                    (err) => {
                        if (err) {
                            console.error('Error creating admin user:', err);
                            process.exit(1);
                        }
                        console.log('Admin user created successfully!');
                        process.exit(0);
                    }
                );
            } else {
                console.log('Admin user already exists!');
                process.exit(0);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdminUser(); 