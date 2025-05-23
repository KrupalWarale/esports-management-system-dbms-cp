-- Create the esports database if it doesn't exist
CREATE DATABASE IF NOT EXISTS esports;
USE esports;

-- Create LOGIN table if it doesn't exist
CREATE TABLE IF NOT EXISTS LOGIN (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL
);

-- Create other tables if they don't exist
CREATE TABLE IF NOT EXISTS player (
    pid INT AUTO_INCREMENT PRIMARY KEY,
    pname VARCHAR(255) UNIQUE NOT NULL,
    dob DATE,
    description TEXT,
    origin VARCHAR(255),
    sex CHAR(1),
    photo LONGBLOB
);

CREATE TABLE IF NOT EXISTS team (
    tid INT AUTO_INCREMENT PRIMARY KEY,
    tname VARCHAR(255) UNIQUE NOT NULL,
    captain_id INT,
    social_id VARCHAR(255),
    photo LONGBLOB,
    FOREIGN KEY (captain_id) REFERENCES player(pid)
);

CREATE TABLE IF NOT EXISTS player_team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pid INT,
    tid INT,
    nickname VARCHAR(255),
    FOREIGN KEY (pid) REFERENCES player(pid),
    FOREIGN KEY (tid) REFERENCES team(tid)
);

CREATE TABLE IF NOT EXISTS sponsor (
    sid INT AUTO_INCREMENT PRIMARY KEY,
    sname VARCHAR(255),
    money DECIMAL(10, 2),
    tid INT,
    FOREIGN KEY (tid) REFERENCES team(tid)
);

CREATE TABLE IF NOT EXISTS game (
    gname VARCHAR(255) PRIMARY KEY,
    publisher VARCHAR(255),
    release_date DATE,
    description TEXT,
    photo LONGBLOB
);

CREATE TABLE IF NOT EXISTS game_team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tid INT,
    gname VARCHAR(255),
    FOREIGN KEY (tid) REFERENCES team(tid),
    FOREIGN KEY (gname) REFERENCES game(gname)
);

CREATE TABLE IF NOT EXISTS merchandise (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product VARCHAR(255),
    price DECIMAL(10, 2),
    quantity INT,
    tid INT,
    FOREIGN KEY (tid) REFERENCES team(tid)
);

-- Create stored procedure for getting teams with no captain
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetTeamsWithNoCaptain()
BEGIN
    SELECT * FROM team WHERE captain_id IS NULL;
END //
DELIMITER ;

-- Insert default admin user with password 'admin123'
-- The password will be hashed when registering through the application
-- This is just for initial setup
INSERT IGNORE INTO LOGIN (email, pwd) VALUES ('admin@esports.com', '$2b$10$1TtZMxlmmyXHnDSMdYXBdOqpzPL5rKibBt5ZQnW6PRNOdTbKlPQT.'); 