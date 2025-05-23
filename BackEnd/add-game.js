require('dotenv').config({path: '../.env'});
const connection = require('./database.js');

// Add a sample game to the database
const addGame = () => {
    const games = [
        {
            gname: 'Counter-Strike 2',
            publisher: 'Valve',
            release_date: '2023-09-27',
            description: 'Counter-Strike 2 is a 2023 first-person shooter game developed and published by Valve. It is the sequel to Counter-Strike: Global Offensive.'
        },
        {
            gname: 'Valorant',
            publisher: 'Riot Games',
            release_date: '2020-06-02',
            description: 'Valorant is a free-to-play first-person tactical hero shooter developed and published by Riot Games.'
        },
        {
            gname: 'League of Legends',
            publisher: 'Riot Games',
            release_date: '2009-10-27',
            description: 'League of Legends is a 2009 multiplayer online battle arena video game developed and published by Riot Games.'
        }
    ];

    // Insert games
    games.forEach(game => {
        connection.query(
            'INSERT IGNORE INTO game (gname, publisher, release_date, description) VALUES (?, ?, ?, ?)',
            [game.gname, game.publisher, game.release_date, game.description],
            (err, result) => {
                if (err) {
                    console.error(`Error adding game ${game.gname}:`, err);
                } else {
                    console.log(`Game ${game.gname} added or already exists`);
                }
            }
        );
    });

    // Wait for all queries to complete
    setTimeout(() => {
        connection.end();
        console.log('Database connection closed');
    }, 1000);
};

addGame(); 