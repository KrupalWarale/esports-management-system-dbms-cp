require('dotenv').config({path: '../.env'});
const connection = require('./database.js');

// Add a sample player and team to the database
const addTeam = async () => {
    try {
        // First, add a sample player
        console.log('Adding sample players...');
        
        // We'll add three players
        const players = [
            {
                pname: 'JohnDoe',
                dob: '1995-05-15',
                description: 'Professional FPS player with exceptional aim',
                origin: 'United States',
                sex: 'M'
            },
            {
                pname: 'JaneSmith',
                dob: '1997-07-20',
                description: 'Strategic player known for in-game leadership',
                origin: 'Canada',
                sex: 'F'
            },
            {
                pname: 'AlexWong',
                dob: '1998-03-10',
                description: 'Versatile player skilled in multiple roles',
                origin: 'Singapore',
                sex: 'M'
            }
        ];
        
        for (const player of players) {
            // Check if player already exists
            connection.query(
                'SELECT pid FROM player WHERE pname = ?',
                [player.pname],
                (err, results) => {
                    if (err) {
                        console.error(`Error checking player ${player.pname}:`, err);
                        return;
                    }
                    
                    if (results.length === 0) {
                        // Insert player if not exists
                        connection.query(
                            'INSERT INTO player (pname, dob, description, origin, sex) VALUES (?, ?, ?, ?, ?)',
                            [player.pname, player.dob, player.description, player.origin, player.sex],
                            (err, result) => {
                                if (err) {
                                    console.error(`Error adding player ${player.pname}:`, err);
                                } else {
                                    console.log(`Player ${player.pname} added with ID ${result.insertId}`);
                                }
                            }
                        );
                    } else {
                        console.log(`Player ${player.pname} already exists with ID ${results[0].pid}`);
                    }
                }
            );
        }
        
        // Wait a bit for players to be added
        setTimeout(() => {
            console.log('Adding sample team...');
            
            // Add a team
            connection.query(
                'INSERT IGNORE INTO team (tname, social_id) VALUES (?, ?)',
                ['Ghost Squad', '@ghostsquad'],
                (err, result) => {
                    if (err) {
                        console.error('Error adding team:', err);
                        return;
                    }
                    
                    const teamId = result.insertId;
                    console.log(`Team 'Ghost Squad' added or already exists`);
                    
                    // If team already exists, get its ID
                    if (!teamId) {
                        connection.query(
                            'SELECT tid FROM team WHERE tname = ?',
                            ['Ghost Squad'],
                            (err, results) => {
                                if (err) {
                                    console.error('Error getting team ID:', err);
                                    return;
                                }
                                
                                if (results.length > 0) {
                                    // Now get player IDs and add them to the team
                                    addPlayersToTeam(results[0].tid);
                                }
                            }
                        );
                    } else {
                        // Add players to team using the new team ID
                        addPlayersToTeam(teamId);
                    }
                }
            );
        }, 1000);
    } catch (error) {
        console.error('Error:', error);
    }
};

function addPlayersToTeam(teamId) {
    console.log(`Adding players to team with ID ${teamId}...`);
    
    // Get player IDs
    connection.query(
        'SELECT pid, pname FROM player WHERE pname IN (?, ?, ?)',
        ['JohnDoe', 'JaneSmith', 'AlexWong'],
        (err, players) => {
            if (err) {
                console.error('Error getting player IDs:', err);
                return;
            }
            
            if (players.length === 0) {
                console.error('No matching players found');
                return;
            }
            
            // Add player-team relationships
            for (const player of players) {
                // Check if relationship already exists
                connection.query(
                    'SELECT id FROM player_team WHERE pid = ? AND tid = ?',
                    [player.pid, teamId],
                    (err, results) => {
                        if (err) {
                            console.error(`Error checking player-team relationship for ${player.pname}:`, err);
                            return;
                        }
                        
                        if (results.length === 0) {
                            connection.query(
                                'INSERT INTO player_team (pid, tid, nickname) VALUES (?, ?, ?)',
                                [player.pid, teamId, player.pname + 'GS'],
                                (err, result) => {
                                    if (err) {
                                        console.error(`Error adding player ${player.pname} to team:`, err);
                                    } else {
                                        console.log(`Player ${player.pname} added to team Ghost Squad`);
                                    }
                                }
                            );
                        } else {
                            console.log(`Player ${player.pname} is already in team Ghost Squad`);
                        }
                    }
                );
            }
            
            // Set the first player as the captain
            setTimeout(() => {
                connection.query(
                    'UPDATE team SET captain_id = (SELECT pid FROM player WHERE pname = ?) WHERE tid = ?',
                    ['JohnDoe', teamId],
                    (err, result) => {
                        if (err) {
                            console.error('Error setting captain:', err);
                        } else {
                            console.log('JohnDoe set as captain');
                        }
                        
                        // Close connection after all operations
                        setTimeout(() => {
                            connection.end();
                            console.log('Database connection closed');
                        }, 500);
                    }
                );
            }, 1000);
        }
    );
}

addTeam(); 