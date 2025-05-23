require('dotenv').config({path: '../.env'});
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// First create a connection without database to create the database if it doesn't exist
const initialConnection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root@123'
});

initialConnection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL to create database');
    
    // Create database if it doesn't exist
    initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'esports'}`, (err) => {
        if (err) {
            console.error('Error creating database:', err);
            process.exit(1);
        }
        console.log('Database created or already exists');
        
        // Close initial connection
        initialConnection.end();
        
        // Connect to the database
        setupDatabase();
    });
});

function setupDatabase() {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        database: process.env.DB_NAME || 'esports',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root@123'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database:', err);
            process.exit(1);
        }
        console.log('Connected to database to create tables');
        
        // Create tables
        const createLoginTable = `
            CREATE TABLE IF NOT EXISTS LOGIN (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                pwd VARCHAR(255) NOT NULL
            )
        `;
        
        const createPlayerTable = `
            CREATE TABLE IF NOT EXISTS player (
                pid INT AUTO_INCREMENT PRIMARY KEY,
                pname VARCHAR(255) UNIQUE NOT NULL,
                dob DATE,
                description TEXT,
                origin VARCHAR(255),
                sex CHAR(1),
                photo LONGBLOB
            )
        `;
        
        const createTeamTable = `
            CREATE TABLE IF NOT EXISTS team (
                tid INT AUTO_INCREMENT PRIMARY KEY,
                tname VARCHAR(255) UNIQUE NOT NULL,
                captain_id INT,
                social_id VARCHAR(255),
                photo LONGBLOB,
                FOREIGN KEY (captain_id) REFERENCES player(pid)
            )
        `;
        
        const createPlayerTeamTable = `
            CREATE TABLE IF NOT EXISTS player_team (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pid INT,
                tid INT,
                nickname VARCHAR(255),
                FOREIGN KEY (pid) REFERENCES player(pid),
                FOREIGN KEY (tid) REFERENCES team(tid)
            )
        `;
        
        const createSponsorTable = `
            CREATE TABLE IF NOT EXISTS sponsor (
                sid INT AUTO_INCREMENT PRIMARY KEY,
                sname VARCHAR(255),
                money DECIMAL(10, 2),
                tid INT,
                FOREIGN KEY (tid) REFERENCES team(tid)
            )
        `;
        
        const createGameTable = `
            CREATE TABLE IF NOT EXISTS game (
                gname VARCHAR(255) PRIMARY KEY,
                publisher VARCHAR(255),
                release_date DATE,
                description TEXT,
                photo LONGBLOB
            )
        `;
        
        const createGameTeamTable = `
            CREATE TABLE IF NOT EXISTS game_team (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tid INT,
                gname VARCHAR(255),
                FOREIGN KEY (tid) REFERENCES team(tid),
                FOREIGN KEY (gname) REFERENCES game(gname)
            )
        `;
        
        const createMerchandiseTable = `
            CREATE TABLE IF NOT EXISTS merchandise (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product VARCHAR(255),
                price DECIMAL(10, 2),
                quantity INT,
                tid INT,
                FOREIGN KEY (tid) REFERENCES team(tid)
            )
        `;
        
        // Create stored procedure
        const createProcedure = `
            DROP PROCEDURE IF EXISTS GetTeamsWithNoCaptain;
            DELIMITER //
            CREATE PROCEDURE GetTeamsWithNoCaptain()
            BEGIN
                SELECT * FROM team WHERE captain_id IS NULL;
            END //
            DELIMITER ;
        `;
        
        // Execute queries in sequence
        connection.query(createLoginTable, (err) => {
            if (err) {
                console.error('Error creating LOGIN table:', err);
                return;
            }
            console.log('LOGIN table created or already exists');
            
            connection.query(createPlayerTable, (err) => {
                if (err) {
                    console.error('Error creating player table:', err);
                    return;
                }
                console.log('player table created or already exists');
                
                connection.query(createTeamTable, (err) => {
                    if (err) {
                        console.error('Error creating team table:', err);
                        return;
                    }
                    console.log('team table created or already exists');
                    
                    connection.query(createPlayerTeamTable, (err) => {
                        if (err) {
                            console.error('Error creating player_team table:', err);
                            return;
                        }
                        console.log('player_team table created or already exists');
                        
                        connection.query(createSponsorTable, (err) => {
                            if (err) {
                                console.error('Error creating sponsor table:', err);
                                return;
                            }
                            console.log('sponsor table created or already exists');
                            
                            connection.query(createGameTable, (err) => {
                                if (err) {
                                    console.error('Error creating game table:', err);
                                    return;
                                }
                                console.log('game table created or already exists');
                                
                                connection.query(createGameTeamTable, (err) => {
                                    if (err) {
                                        console.error('Error creating game_team table:', err);
                                        return;
                                    }
                                    console.log('game_team table created or already exists');
                                    
                                    connection.query(createMerchandiseTable, (err) => {
                                        if (err) {
                                            console.error('Error creating merchandise table:', err);
                                            return;
                                        }
                                        console.log('merchandise table created or already exists');
                                        
                                        // This procedure creation might fail in MySQL using Node.js due to DELIMITER issues
                                        // So we'll create a simplified version
                                        connection.query('DROP PROCEDURE IF EXISTS GetTeamsWithNoCaptain', (err) => {
                                            if (err) {
                                                console.error('Error dropping procedure:', err);
                                                return;
                                            }
                                            
                                            const simpleProcedure = `
                                                CREATE PROCEDURE GetTeamsWithNoCaptain()
                                                BEGIN
                                                    SELECT * FROM team WHERE captain_id IS NULL;
                                                END
                                            `;
                                            
                                            connection.query(simpleProcedure, (err) => {
                                                if (err) {
                                                    console.error('Error creating procedure:', err);
                                                    return;
                                                }
                                                console.log('Procedure created or already exists');
                                                
                                                // Create admin user with password hash
                                                const hashedPassword = bcrypt.hashSync('admin123', 10);
                                                connection.query('SELECT * FROM LOGIN WHERE email = ?', ['admin@esports.com'], (err, results) => {
                                                    if (err) {
                                                        console.error('Error checking if admin exists:', err);
                                                        return;
                                                    }
                                                    
                                                    if (results.length === 0) {
                                                        connection.query('INSERT INTO LOGIN (email, pwd) VALUES (?, ?)', ['admin@esports.com', hashedPassword], (err) => {
                                                            if (err) {
                                                                console.error('Error creating admin user:', err);
                                                                return;
                                                            }
                                                            console.log('Admin user created');
                                                            console.log('Database setup complete. You can now start the server.');
                                                            
                                                            // Close connection
                                                            connection.end();
                                                        });
                                                    } else {
                                                        console.log('Admin user already exists');
                                                        console.log('Database setup complete. You can now start the server.');
                                                        
                                                        // Close connection
                                                        connection.end();
                                                    }
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
} 