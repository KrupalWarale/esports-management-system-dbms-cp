const express = require("express");
var mysql = require("mysql2");
const fs = require('fs');
const cors = require("cors");
const app = express();
const bodyParser = require('body-parser');
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['https://dbms-miniproject-ten.vercel.app', 'https://690c-2405-201-d00f-608c-4e4b-9e5b-b74a-27ab.ngrok-free.app/', 'http://localhost:3000'] }));
app.use(bodyParser.json({ limit: '500mb' }));

// Parse application/x-www-form-urlencoded requests
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
const connection = require('./database.js');
const { error } = require("console");

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
//fetches list of players in a team
app.post("/fetch_team_details", (req, res) => {
    const data = req.body.id;
    const sql = `SELECT p.pname, pt.nickname, CASE WHEN p.pid = t.captain_id THEN 'Captain' ELSE 'Player' END AS captain_status, p.photo AS photo FROM player p JOIN player_team pt ON p.pid = pt.pid JOIN team t ON pt.tid = t.tid WHERE t.tname = '${data}' ORDER BY (CASE WHEN p.pid = t.captain_id THEN 0 ELSE 1 END);    `;
    connection.query(sql, function (err, results) {
        if (err) throw err;
        res.send(results);
    })
})

//fetches list of games
app.get("/game_details", (req, res) => {
    const sql = "SELECT gname, publisher, DATE_FORMAT(release_date, '%Y-%m-%d') as release_date, photo, description FROM game;";
    connection.query(sql, function (err, results) {
        if (err) throw err;
        res.send(results);
    })
})

//fetches all details of a particular player
app.post("/fetch_player_details", (req, res) => {
    const data = req.body.id;
    const sql = `SELECT p.pname, DATE_FORMAT(p.dob, '%Y-%m-%d') AS dob, p.origin, p.sex, pt.nickname, t.tname, p.photo, p.description FROM player p JOIN player_team pt ON p.pid = pt.pid JOIN team t ON pt.tid = t.tid WHERE p.pname = '${data}';    `;
    connection.query(sql, function (err, results) {
        if (err) throw err;
        res.send(results);
    })
})

//fetches list of all teams and captains
app.get("/team_details", (req, res) => {
    // Use an alternate query that doesn't depend on captain_status
    const query = `
        SELECT t.tid, t.tname, t.social_id, t.photo, 
               COALESCE(p.pname, 'Not Assigned') as captain_name
        FROM team t
        LEFT JOIN player p ON t.captain_id = p.pid
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching team details:", err);
            return res.json([]);
        }
        
        return res.json(results);
    });
})
// Fetches all teams in a particular game
app.post("/fetch_game_teams", (req, res) => {
    const data = req.body.id;

    const sql = `SELECT t.tname AS Team_Name, COALESCE(p.pname, 'Not Assigned') AS Captain_Name, t.photo AS Team_Photo 
               FROM team t 
               LEFT JOIN player p ON t.captain_id = p.pid 
               JOIN game_team g ON t.tid = g.tid 
               WHERE g.gname = ?;`;

    connection.query(sql, [data], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error fetching data');
            return;
        }

        // Convert photo column from binary to Base64
        const resultsWithBase64 = results.map(row => {
            if (row.Team_Photo) {
                row.Team_Photo = Buffer.from(row.Team_Photo).toString('base64');
            }
            return row;
        });
        res.send(resultsWithBase64);
    });
});

const multer = require('multer');
const upload = multer(); // Initialize multer

app.post("/add_player_data", upload.single('photo'), (req, res) => {
    const desc = req.body.desc;
    const dob = req.body.dob;
    const sex = req.body.sex;
    const pname = req.body.name;
    const origin = req.body.origin;
    const photo = req.file.buffer; // Handle photo as a buffer

    const sql = `INSERT INTO player (pname, dob, description, origin, sex, photo) VALUES (?, ?, ?, ?, ?, ?);`;
    connection.query(sql, [pname, dob, desc, origin, sex, photo], function (err, response) {
        if (err) {
            // Handle SQL errors, including duplicates
            if (err.code === 'ER_SIGNAL_EXCEPTION') {
                res.status(400).send({ message: err.sqlMessage });
            } else {
                res.status(500).send({ message: "Error inserting data" });
            }
        } else {
            res.status(200).send({ message: "Added the player to the Roster!" });
        }
    });
});


//adds team details
app.post("/add_team_data",  upload.single('photo'), (req, res) => {
    // Extract data from the request
    const { name, social, p1, p2, p3 } = req.body;
    const photo = req.file.buffer; // Access the uploaded image buffer

    // Insert team data into the database
    const sql1 = `INSERT INTO team (tname, social_id, photo) VALUES (?, ?, ?)`;
    connection.query(sql1, [name, social, photo], (err, result) => {
        if (err) {
            res.status(500).json({ message: "Error occurred while adding team data" });
        } else {
            // Insert player-team relations into the database
            const tid = result.insertId; // Get the ID of the inserted team
            const sql2 = `INSERT INTO player_team (tid, pid) VALUES ?`;
            const values = [[tid, p1], [tid, p2], [tid, p3]];
            connection.query(sql2, [values], (err) => {
                if (err) {
                    res.status(500).json({ message: "Error occurred while adding player data to team" });
                } else {
                    res.status(200).json({ message: "Team and player data added successfully" });
                }
            });
        }
    });
});


app.get("/unassigned_players", (req, res) => {
    const sql = `SELECT * FROM player WHERE pid NOT IN (SELECT pid FROM player_team);    `;
    connection.query(sql, function (err, response) {
        if (err) throw err;
        else res.send(response);
    })
})

//Uses a stored procedure GetTeamsWithNoCaptain which runs the sql query SELECT * FROM team where captain_is is NULL;
app.get("/get_blank_team", (req, res) => {
    // Modified query to get all teams, regardless of captain status
    const sql = `SELECT * FROM team`;
    connection.query(sql, function (err, response) {
        if (err) throw err;
        else res.send([response]); // Keep the same response format
    })
})

//returns players of a given team iff the team doesnt have a captain
app.post("/given_team_players", (req, res) => {
    const tname = req.body.id
    const sql = `SELECT p.* FROM player p JOIN player_team pt ON p.pid = pt.pid JOIN team t ON pt.tid = t.tid WHERE t.tname = ?`
    connection.query(sql, [tname], function (err, response) {
        if (err) throw err;
        else res.send(response);
    })
})
app.post("/add_captain_and_create_merch", (req, res) => {
    // Data from the request
    const { team, captain, sponsor, nick1, nick2, nick3, p1, p2, p3 } = req.body.team;
    // Remove merchandise-related data
    // const { m1, m2, m3, p1: mp1, p2: mp2, p3: mp3, q1, q2, q3, tid: tname } = req.body.merch;

    // SQL Queries
    const sqlAddCaptain = `UPDATE team SET captain_id = ${captain} WHERE tname = '${team}';`;
    const sqlUpdateNick1 = `UPDATE player_team SET nickname = ? WHERE pid = ?`;

    connection.beginTransaction(err => {
        if (err) {
            return res.status(500).send({ error: "Transaction error", details: err });
        }

        // Execute the add_captain logic
        connection.query(sqlAddCaptain, (err, response) => {
            if (err) {
                return connection.rollback(() => {
                    res.status(500).send({ error: "Error in add_captain", details: err });
                });
            }

            connection.query(sqlUpdateNick1, [nick1, p1], (err, response) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).send({ error: "Error in updating nickname 1", details: err });
                    });
                }

                connection.query(sqlUpdateNick1, [nick2, p2], (err, response) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).send({ error: "Error in updating nickname 2", details: err });
                        });
                    }

                    connection.query(sqlUpdateNick1, [nick3, p3], (err, response) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).send({ error: "Error in updating nickname 3", details: err });
                            });
                        }

                        // If everything succeeded, commit the transaction
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).send({ error: "Transaction commit error", details: err });
                                });
                            }
                            res.send({ message: "Success" });
                        });
                    });
                });
            });
        });
    });
});

const bcrypt = require('bcrypt');
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the email and hashed password into the database
        const sql = `INSERT INTO LOGIN (email, pwd) VALUES (?, ?)`;
        connection.query(sql, [email, hashedPassword], function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: "Error storing password" });
            }
            res.send({ message: "Password stored successfully" });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
});
// During login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Email and password are required" 
        });
    }
    
    try {
        // Check if the user exists in the USER_ACCOUNTS table with role = 'admin'
        const sql = "SELECT * FROM USER_ACCOUNTS WHERE email = ? AND role = 'admin'";
        
        connection.query(sql, [email], async function(err, results) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Database error" 
                });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid credentials" 
                });
            }
            
            const admin = results[0];
            
            // Compare the entered password with the stored hashed password
            const passwordMatch = await bcrypt.compare(password, admin.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid credentials" 
                });
            }
            
            // Create a token
            const token = Buffer.from(`${admin.id}:${admin.email}:${Date.now()}`).toString('base64');
            
            // Return admin data
            res.json({
                success: true,
                message: "Login successful",
                data: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name
                },
                token: token
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
});


app.post("/games_not_played_by_team",(req,res)=>{
    const team = req.body.id;
    if (!team) {
        return res.send({payload:[],message:"Error"});
    }
    const sql = `SELECT DISTINCT gname FROM game WHERE gname NOT IN (SELECT gname FROM game_team WHERE tid = (SELECT tid FROM team WHERE tname = ?));`
    connection.query(sql,[team],function(err,response){
        if (err) throw err;
        else{
            res.send({payload:response,message:"Success"})
        }
    })
})

app.post("/add_team_to_game",(req,res)=>{
    const team = req.body.team;
    const game = req.body.game;
    const sql = `INSERT INTO game_team (tid, gname) SELECT team.tid, ? FROM team WHERE team.tname = ?;`
    connection.query(sql,[game,team],function(err,response){
        if (err) throw err;
        else{
            return res.send({message:"Success"})
        }
    })
})




// //temporarily used for testing
// app.post("/update_game_photo", (req, res) => {
//     const { gname, photoBase64 } = req.body;

//     // Convert base64 string to binary buffer
//     const photoBuffer = Buffer.from(photoBase64, 'base64');

//     const sql = `UPDATE player SET photo = ? WHERE pid = ?`;
//     connection.query(sql, [photoBuffer, gname], (err, results) => {
//         if (err) {
//             console.error("Error updating photo: ", err);
//             res.status(500).send("Database error.");
//             return;
//         }
//         res.send("Photo updated successfully.");
//     });
// });







//establishes connections
app.listen(8080, () => {
    console.log("port connected")
})

// User registration endpoint
app.post("/register_user", async (req, res) => {
    try {
        const { email, password, name, role = 'user' } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, password, and name are required" 
            });
        }

        // Check if user already exists
        const checkQuery = "SELECT * FROM USER_ACCOUNTS WHERE email = ?";
        connection.query(checkQuery, [email], async function(err, result) {
            if (err) {
                console.error("Error checking user:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error checking user" 
                });
            }

            if (result.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "User with this email already exists" 
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user
            const insertQuery = "INSERT INTO USER_ACCOUNTS (email, password, name, role) VALUES (?, ?, ?, ?)";
            connection.query(insertQuery, [email, hashedPassword, name, role], function(err, result) {
                if (err) {
                    console.error("Error creating user:", err);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error creating user" 
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "User registered successfully"
                });
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during registration" 
        });
    }
});

// User login endpoint
app.post('/user_login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }
        
        // Check if user exists
        const query = "SELECT * FROM USER_ACCOUNTS WHERE email = ?";
        connection.query(query, [email], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Database error" 
                });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }

            const user = results[0];

            // Compare passwords
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid credentials" 
                });
            }

            // Create simple token (in a real app, use JWT)
            const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

            // Return user data and token
            res.json({
                success: true,
                message: "Login successful",
                id: user.id,
                email: user.email,
                name: user.name,
                token: token
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
});

// Team creation endpoint for user-registered teams
app.post('/team_create', (req, res) => {
  const { tname, social_id, games = [] } = req.body;

  if (!tname || !social_id) {
    return res.json({ success: false, message: "Team name and social ID are required" });
  }

  // Check if team name already exists
  const checkQuery = "SELECT * FROM team WHERE tname = ?";
  connection.query(checkQuery, [tname], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking team:", checkErr);
      return res.json({ success: false, message: "Database error" });
    }

    if (checkResults.length > 0) {
      return res.json({ success: false, message: "Team name already exists" });
    }

    // Start transaction
    connection.beginTransaction((transErr) => {
      if (transErr) {
        console.error("Transaction error:", transErr);
        return res.json({ success: false, message: "Database transaction error" });
      }
      
      // Create new team
      const insertQuery = "INSERT INTO team (tname, social_id) VALUES (?, ?)";
      connection.query(insertQuery, [tname, social_id], (insertErr, insertResults) => {
        if (insertErr) {
          return connection.rollback(() => {
            console.error("Error creating team:", insertErr);
            return res.json({ success: false, message: "Failed to create team" });
          });
        }
        
        const teamId = insertResults.insertId;
        
        // If no games were selected, commit the transaction and return
        if (!games.length) {
          return connection.commit((commitErr) => {
            if (commitErr) {
              return connection.rollback(() => {
                console.error("Commit error:", commitErr);
                return res.json({ success: false, message: "Database commit error" });
              });
            }
            
            return res.json({ 
              success: true, 
              message: "Team created successfully",
              teamId: teamId 
            });
          });
        }
        
        // Add the team to each selected game
        let completedGameInserts = 0;
        const gameInsertQuery = "INSERT INTO game_team (tid, gname) VALUES (?, ?)";
        
        games.forEach(game => {
          connection.query(gameInsertQuery, [teamId, game], (gameErr) => {
            if (gameErr) {
              return connection.rollback(() => {
                console.error("Error adding team to game:", gameErr);
                return res.json({ success: false, message: "Failed to add team to game" });
              });
            }
            
            completedGameInserts++;
            
            // If all game inserts are complete, commit the transaction
            if (completedGameInserts === games.length) {
              connection.commit((commitErr) => {
                if (commitErr) {
                  return connection.rollback(() => {
                    console.error("Commit error:", commitErr);
                    return res.json({ success: false, message: "Database commit error" });
                  });
                }
                
                return res.json({ 
                  success: true, 
                  message: "Team created successfully and added to selected games",
                  teamId: teamId 
                });
              });
            }
          });
        });
      });
    });
  });
});

// Player creation endpoint for user-registered players
app.post("/player_create", async (req, res) => {
    try {
        const { pname, nickname, team_name, captain_status } = req.body;

        // Validate input
        if (!pname || !nickname || !team_name) {
            return res.status(400).json({
                success: false,
                message: "Player name, nickname, and team name are required"
            });
        }

        // Begin transaction
        connection.beginTransaction(async function(err) {
            if (err) {
                console.error("Transaction error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database transaction error"
                });
            }

            try {
                // First, insert the player
                const insertPlayerSql = "INSERT INTO player (pname) VALUES (?)";
                connection.query(insertPlayerSql, [pname], function(err, playerResult) {
                    if (err) {
                        return connection.rollback(function() {
                            console.error("Error creating player:", err);
                            res.status(500).json({
                                success: false,
                                message: "Error creating player"
                            });
                        });
                    }

                    const playerId = playerResult.insertId;

                    // Get the team ID
                    const getTeamIdSql = "SELECT tid FROM team WHERE tname = ?";
                    connection.query(getTeamIdSql, [team_name], function(err, teamResult) {
                        if (err || teamResult.length === 0) {
                            return connection.rollback(function() {
                                console.error("Error finding team:", err);
                                res.status(404).json({
                                    success: false,
                                    message: "Team not found"
                                });
                            });
                        }

                        const teamId = teamResult[0].tid;

                        // Add player to team with nickname
                        const addToTeamSql = "INSERT INTO player_team (pid, tid, nickname) VALUES (?, ?, ?)";
                        connection.query(addToTeamSql, [playerId, teamId, nickname], function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    console.error("Error adding player to team:", err);
                                    res.status(500).json({
                                        success: false,
                                        message: "Error adding player to team"
                                    });
                                });
                            }

                            // If this is the captain, update the team's captain_id
                            if (captain_status === 'Captain') {
                                const setCaptainSql = "UPDATE team SET captain_id = ? WHERE tid = ?";
                                connection.query(setCaptainSql, [playerId, teamId], function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            console.error("Error setting team captain:", err);
                                            res.status(500).json({
                                                success: false,
                                                message: "Error setting team captain"
                                            });
                                        });
                                    }

                                    // Commit the transaction
                                    connection.commit(function(err) {
                                        if (err) {
                                            return connection.rollback(function() {
                                                console.error("Commit error:", err);
                                                res.status(500).json({
                                                    success: false,
                                                    message: "Database commit error"
                                                });
                                            });
                                        }

                                        res.status(201).json({
                                            success: true,
                                            message: "Player added to team successfully as captain"
                                        });
                                    });
                                });
                            } else {
                                // Commit the transaction for regular player
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            console.error("Commit error:", err);
                                            res.status(500).json({
                                                success: false,
                                                message: "Database commit error"
                                            });
                                        });
                                    }

                                    res.status(201).json({
                                        success: true,
                                        message: "Player added to team successfully"
                                    });
                                });
                            }
                        });
                    });
                });
            } catch (error) {
                connection.rollback(function() {
                    console.error("Error in player creation transaction:", error);
                    res.status(500).json({
                        success: false,
                        message: "Server error during player creation"
                    });
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during player creation"
        });
    }
});

// Endpoint to fetch teams registered by a specific user
app.post('/user_teams', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.json([]);
    }
    
    // First get the user ID from USER_ACCOUNTS
    const getUserQuery = "SELECT id FROM USER_ACCOUNTS WHERE email = ?";
    
    connection.query(getUserQuery, [email], (userErr, userResults) => {
        if (userErr) {
            console.error("Error fetching user:", userErr);
            return res.json([]);
        }
        
        if (userResults.length === 0) {
            return res.json([]);
        }
        
        const userId = userResults[0].id;
        
        // Now fetch teams registered by this user from the team table
        const getTeamsQuery = `
            SELECT t.* 
            FROM team t
            JOIN USER_TEAM_MAP utm ON t.tid = utm.team_id
            WHERE utm.user_id = ?
        `;
        
        connection.query(getTeamsQuery, [userId], (teamErr, teamResults) => {
            if (teamErr) {
                console.error("Error fetching teams:", teamErr);
                return res.json([]);
            }
            
            // Return all teams found or empty array
            return res.json(teamResults || []);
        });
    });
});

// Add endpoint to map users to teams (for when a user creates a team)
app.post('/map_user_team', (req, res) => {
    const { userId, teamId } = req.body;
    
    if (!userId || !teamId) {
        return res.json({ success: false, message: "User ID and Team ID are required" });
    }
    
    const mapQuery = "INSERT INTO USER_TEAM_MAP (user_id, team_id) VALUES (?, ?)";
    
    connection.query(mapQuery, [userId, teamId], (err, results) => {
        if (err) {
            console.error("Error mapping user to team:", err);
            return res.json({ success: false, message: "Database error" });
        }
        
        return res.json({ success: true, message: "User mapped to team successfully" });
    });
});

// Create USER_TEAM_MAP table if it doesn't exist
const createUserTeamMapTable = `
  CREATE TABLE IF NOT EXISTS USER_TEAM_MAP (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    team_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY user_team_unique (user_id, team_id)
  )
`;

connection.query(createUserTeamMapTable, (err, results) => {
  if (err) {
    console.error("Error creating USER_TEAM_MAP table:", err);
  } else {
    console.log("USER_TEAM_MAP table ready");
  }
});

// Add game endpoint
app.post('/add_game', (req, res) => {
  const { gname, platform, type } = req.body;

  if (!gname || !platform || !type) {
    return res.json({ success: false, message: "All fields are required" });
  }

  // Check if game already exists
  const checkQuery = "SELECT * FROM GAMES WHERE gname = ?";
  connection.query(checkQuery, [gname], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking game:", checkErr);
      return res.json({ success: false, message: "Database error" });
    }

    if (checkResults.length > 0) {
      return res.json({ success: false, message: "Game already exists" });
    }

    // Create new game
    const insertQuery = "INSERT INTO GAMES (gname, platform, type) VALUES (?, ?, ?)";
    connection.query(insertQuery, [gname, platform, type], (insertErr, insertResults) => {
      if (insertErr) {
        console.error("Error creating game:", insertErr);
        return res.json({ success: false, message: "Failed to create game" });
      }

      return res.json({ 
        success: true, 
        message: "Game added successfully",
        gameId: insertResults.insertId 
      });
    });
  });
});

// Admin endpoint to get all teams with creator information
app.get('/admin_team_details', (req, res) => {
  // Join query to get teams with their creator's email and captain name
  const query = `
    SELECT t.*, ua.email as creator_email, 
           COALESCE(p.pname, 'Not Assigned') as captain_name
    FROM team t
    LEFT JOIN USER_TEAM_MAP utm ON t.tid = utm.team_id
    LEFT JOIN USER_ACCOUNTS ua ON utm.user_id = ua.id
    LEFT JOIN player p ON t.captain_id = p.pid
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching admin team details:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    res.json(results);
  });
});

// Endpoint to fetch team details (players in a team)
app.post('/fetch_team_details', (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json([]);
  }
  
  const query = `
    SELECT p.*, pt.nickname,
           CASE WHEN p.pid = t.captain_id THEN 'Captain' ELSE 'Player' END AS captain_status
    FROM player p
    JOIN player_team pt ON p.pid = pt.pid
    JOIN team t ON t.tid = pt.tid
    WHERE t.tname = ?
  `;
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching team details:", err);
      return res.json([]);
    }
    
    return res.json(results);
  });
});

// Endpoint to fetch player details
app.post('/fetch_player_details', (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json([]);
  }
  
  const query = `
    SELECT p.*, pt.nickname, t.tname
    FROM player p
    JOIN player_team pt ON p.pid = pt.pid
    JOIN team t ON t.tid = pt.tid
    WHERE p.pname = ?
  `;
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching player details:", err);
      return res.json([]);
    }
    
    return res.json(results);
  });
});

// Get all available games for team registration
app.get('/available_games', (req, res) => {
  // Add error handling wrapper
  try {
    // Removed 'type' from the query, using only valid columns
    const query = "SELECT gname, publisher as platform FROM game ORDER BY gname";
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching games:", err);
        return res.json([]);  // Return empty array instead of error object
      }
      
      // Ensure we always return an array
      return res.json(Array.isArray(results) ? results : []);
    });
  } catch (error) {
    console.error("Unexpected error in available_games endpoint:", error);
    return res.json([]);  // Return empty array in case of any errors
  }
});

// Get comprehensive team details, players, and games in one call
app.post('/team_complete_details', (req, res) => {
  const { teamName } = req.body;
  
  if (!teamName) {
    return res.json({ success: false, message: "Team name is required" });
  }
  
  // First get the team basic details
  const teamQuery = `
    SELECT t.tid, t.tname, t.social_id, t.photo
    FROM team t
    WHERE t.tname = ?
  `;
  
  connection.query(teamQuery, [teamName], (err, teamResults) => {
    if (err) {
      console.error("Error fetching team details:", err);
      return res.json({ success: false, message: "Failed to fetch team details" });
    }
    
    if (!teamResults || teamResults.length === 0) {
      return res.json({ success: false, message: "Team not found" });
    }
    
    const team = teamResults[0];
    const teamId = team.tid;
    
    // Get the players for this team
    const playersQuery = `
      SELECT p.pid, p.pname, pt.nickname, 
             CASE WHEN p.pid = t.captain_id THEN 'Captain' ELSE 'Player' END as role, 
             p.photo
      FROM player p
      JOIN player_team pt ON p.pid = pt.pid
      JOIN team t ON pt.tid = t.tid
      WHERE t.tid = ?
    `;
    
    connection.query(playersQuery, [teamId], (playerErr, players) => {
      if (playerErr) {
        console.error("Error fetching team players:", playerErr);
        return res.json({ 
          success: true, 
          team: team,
          players: [],
          games: []
        });
      }
      
      // Find the captain
      const captain = players.find(player => player.role === 'Captain');
      if (captain) {
        team.captain_name = captain.pname;
      } else {
        team.captain_name = "Not Assigned";
      }
      
      // Get the games for this team
      const gamesQuery = `
        SELECT g.gname, g.publisher as platform
        FROM game g
        JOIN game_team gt ON g.gname = gt.gname
        WHERE gt.tid = ?
      `;
      
      connection.query(gamesQuery, [teamId], (gameErr, games) => {
        if (gameErr) {
          console.error("Error fetching team games:", gameErr);
          return res.json({ 
            success: true, 
            team: team,
            players: players || [],
            games: []
          });
        }
        
        return res.json({
          success: true,
          team: team,
          players: players || [],
          games: games || []
        });
      });
    });
  });
});

// Create admin user endpoint
app.post('/create_admin', async (req, res) => {
  try {
    // Default admin credentials or use provided ones
    const { 
      email = 'admin@esports.com', 
      password = 'admin123', 
      name = 'Administrator' 
    } = req.body;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin already exists
    const checkQuery = "SELECT * FROM USER_ACCOUNTS WHERE role = 'admin'";
    connection.query(checkQuery, (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking for admin:", checkErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      
      if (checkResults.length > 0) {
        return res.json({ 
          success: false, 
          message: "Admin user already exists",
          adminCount: checkResults.length
        });
      }
      
      // Create the admin user
      const insertQuery = "INSERT INTO USER_ACCOUNTS (email, password, name, role) VALUES (?, ?, ?, 'admin')";
      
      connection.query(insertQuery, [email, hashedPassword, name], (insertErr, insertResults) => {
        if (insertErr) {
          console.error("Error creating admin user:", insertErr);
          return res.status(500).json({ success: false, message: "Failed to create admin user" });
        }
        
        return res.json({ 
          success: true, 
          message: "Admin user created successfully",
          credentials: {
            email: email,
            password: password // Only sending this back since it's the initial setup
          }
        });
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error creating admin user" });
  }
});

// Check and create database tables
app.post('/initialize_database', (req, res) => {
  try {
    // Create USER_ACCOUNTS table if it doesn't exist
    const createUserAccountsTable = `
      CREATE TABLE IF NOT EXISTS USER_ACCOUNTS (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    // Create team table if it doesn't exist
    const createTeamTable = `
      CREATE TABLE IF NOT EXISTS team (
        tid INT AUTO_INCREMENT PRIMARY KEY,
        tname VARCHAR(255) NOT NULL UNIQUE,
        social_id VARCHAR(255),
        captain_id INT,
        photo LONGBLOB
      )
    `;
    
    // Create player table if it doesn't exist
    const createPlayerTable = `
      CREATE TABLE IF NOT EXISTS player (
        pid INT AUTO_INCREMENT PRIMARY KEY,
        pname VARCHAR(255) NOT NULL,
        dob DATE,
        origin VARCHAR(255),
        sex VARCHAR(10),
        description TEXT,
        photo LONGBLOB
      )
    `;
    
    // Create player_team table if it doesn't exist
    const createPlayerTeamTable = `
      CREATE TABLE IF NOT EXISTS player_team (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pid INT NOT NULL,
        tid INT NOT NULL,
        nickname VARCHAR(255),
        FOREIGN KEY (pid) REFERENCES player(pid),
        FOREIGN KEY (tid) REFERENCES team(tid),
        UNIQUE KEY player_team_unique (pid, tid)
      )
    `;
    
    // Create game table if it doesn't exist
    const createGameTable = `
      CREATE TABLE IF NOT EXISTS game (
        gname VARCHAR(255) PRIMARY KEY,
        publisher VARCHAR(255),
        release_date DATE NULL,
        description TEXT NULL,
        photo LONGBLOB NULL
      )
    `;
    
    // Create game_team table if it doesn't exist
    const createGameTeamTable = `
      CREATE TABLE IF NOT EXISTS game_team (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tid INT NOT NULL,
        gname VARCHAR(255) NOT NULL,
        FOREIGN KEY (tid) REFERENCES team(tid),
        FOREIGN KEY (gname) REFERENCES game(gname),
        UNIQUE KEY game_team_unique (tid, gname)
      )
    `;
    
    // Create USER_TEAM_MAP table if it doesn't exist
    const createUserTeamMapTable = `
      CREATE TABLE IF NOT EXISTS USER_TEAM_MAP (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        team_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_team_unique (user_id, team_id)
      )
    `;
    
    // Execute all table creation queries sequentially
    connection.query(createUserAccountsTable, (err1) => {
      if (err1) {
        console.error("Error creating USER_ACCOUNTS table:", err1);
        return res.status(500).json({ success: false, message: "Error creating USER_ACCOUNTS table" });
      }
      
      connection.query(createTeamTable, (err2) => {
        if (err2) {
          console.error("Error creating team table:", err2);
          return res.status(500).json({ success: false, message: "Error creating team table" });
        }
        
        connection.query(createPlayerTable, (err3) => {
          if (err3) {
            console.error("Error creating player table:", err3);
            return res.status(500).json({ success: false, message: "Error creating player table" });
          }
          
          connection.query(createPlayerTeamTable, (err4) => {
            if (err4) {
              console.error("Error creating player_team table:", err4);
              return res.status(500).json({ success: false, message: "Error creating player_team table" });
            }
            
            connection.query(createGameTable, (err5) => {
              if (err5) {
                console.error("Error creating game table:", err5);
                return res.status(500).json({ success: false, message: "Error creating game table" });
              }
              
              connection.query(createGameTeamTable, (err6) => {
                if (err6) {
                  console.error("Error creating game_team table:", err6);
                  return res.status(500).json({ success: false, message: "Error creating game_team table" });
                }
                
                connection.query(createUserTeamMapTable, (err7) => {
                  if (err7) {
                    console.error("Error creating USER_TEAM_MAP table:", err7);
                    return res.status(500).json({ success: false, message: "Error creating USER_TEAM_MAP table" });
                  }
                  
                  // All tables created successfully
                  return res.json({ 
                    success: true, 
                    message: "Database initialized successfully", 
                    tables: [
                      "USER_ACCOUNTS",
                      "team",
                      "player",
                      "player_team",
                      "game",
                      "game_team",
                      "USER_TEAM_MAP"
                    ]
                  });
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error initializing database" });
  }
});

// Admin login endpoint
app.post('/admin_login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }
    
    // Check if admin exists
    const query = "SELECT * FROM USER_ACCOUNTS WHERE email = ? AND role = 'admin'";
    connection.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error" 
        });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: "Admin not found" 
        });
      }

      const admin = results[0];

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Create simple token
      const token = Buffer.from(`${admin.id}:${admin.email}:${Date.now()}`).toString('base64');

      // Return admin data and token
      res.json({
        success: true,
        message: "Login successful",
        id: admin.id,
        email: admin.email,
        name: admin.name,
        token: token
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
});

// Insert default games into the database
app.post('/insert_default_games', (req, res) => {
  try {
    // List of default games with their details
    const defaultGames = [
      { gname: 'Counter-Strike 2', publisher: 'Valve', type: 'FPS' },
      { gname: 'Valorant', publisher: 'Riot Games', type: 'FPS' },
      { gname: 'Dota 2', publisher: 'Valve', type: 'MOBA' },
      { gname: 'League of Legends', publisher: 'Riot Games', type: 'MOBA' },
      { gname: 'Rocket League', publisher: 'Psyonix', type: 'Sports' },
      { gname: 'Overwatch 2', publisher: 'Blizzard', type: 'FPS' },
      { gname: 'Apex Legends', publisher: 'EA', type: 'Battle Royale' },
      { gname: 'Fortnite', publisher: 'Epic Games', type: 'Battle Royale' },
      { gname: 'FIFA 24', publisher: 'EA Sports', type: 'Sports' },
      { gname: 'Rainbow Six Siege', publisher: 'Ubisoft', type: 'FPS' }
    ];
    
    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error("Transaction error:", err);
        return res.status(500).json({ success: false, message: "Database transaction error" });
      }
      
      let insertedGames = 0;
      let failedGames = 0;
      let successGames = [];
      
      // Insert each game
      defaultGames.forEach((game) => {
        const { gname, publisher, type } = game;
        const insertQuery = "INSERT INTO game (gname, publisher, type) VALUES (?, ?, ?)";
        
        connection.query(insertQuery, [gname, publisher, type], (insertErr) => {
          insertedGames++;
          
          if (insertErr) {
            console.error(`Error inserting game ${gname}:`, insertErr);
            failedGames++;
          } else {
            successGames.push(gname);
          }
          
          // If all games have been processed, commit or rollback the transaction
          if (insertedGames === defaultGames.length) {
            if (failedGames === defaultGames.length) {
              return connection.rollback(() => {
                res.status(500).json({ 
                  success: false, 
                  message: "Failed to insert any games" 
                });
              });
            }
            
            connection.commit((commitErr) => {
              if (commitErr) {
                return connection.rollback(() => {
                  console.error("Commit error:", commitErr);
                  res.status(500).json({ 
                    success: false, 
                    message: "Database commit error" 
                  });
                });
              }
              
              res.json({
                success: true,
                message: `Successfully inserted ${successGames.length} games`,
                inserted: successGames,
                failed: defaultGames.length - successGames.length
              });
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error inserting default games" 
    });
  }
});

// Insert games directly without complex transaction logic
app.post('/simple_insert_games', (req, res) => {
  try {
    // List of default games with their details
    const defaultGames = [
      { gname: 'Counter-Strike 2', publisher: 'Valve' },
      { gname: 'Valorant', publisher: 'Riot Games' },
      { gname: 'Dota 2', publisher: 'Valve' },
      { gname: 'League of Legends', publisher: 'Riot Games' },
      { gname: 'Rocket League', publisher: 'Psyonix' },
      { gname: 'Overwatch 2', publisher: 'Blizzard' },
      { gname: 'Apex Legends', publisher: 'EA' },
      { gname: 'Fortnite', publisher: 'Epic Games' },
      { gname: 'FIFA 24', publisher: 'EA Sports' },
      { gname: 'Rainbow Six Siege', publisher: 'Ubisoft' }
    ];
    
    let insertCount = 0;
    let errorCount = 0;
    
    // Insert directly with individual queries
    defaultGames.forEach(game => {
      // Removed 'type' from the query, only inserting valid columns
      const query = "INSERT INTO game (gname, publisher) VALUES (?, ?)";
      
      connection.query(query, [game.gname, game.publisher], (err) => {
        if (err) {
          console.error(`Error inserting game ${game.gname}:`, err);
          errorCount++;
        } else {
          insertCount++;
        }
        
        // Check if all queries have been processed
        if (insertCount + errorCount === defaultGames.length) {
          res.json({
            success: insertCount > 0,
            message: `Inserted ${insertCount} games successfully, failed to insert ${errorCount} games.`
          });
        }
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error inserting games"
    });
  }
});

// Single game insert for testing
app.post('/test_insert_game', (req, res) => {
  try {
    // Insert a test game with valid columns
    const game = { 
      gname: 'Test Game', 
      publisher: 'Test Publisher'
    };
    
    // Removed 'type' from query
    const query = "INSERT INTO game (gname, publisher) VALUES (?, ?)";
    
    connection.query(query, [game.gname, game.publisher], (err, result) => {
      if (err) {
        console.error("Error inserting test game:", err);
        return res.json({ 
          success: false, 
          message: "Failed to insert test game",
          error: err.message 
        });
      }
      
      return res.json({
        success: true,
        message: "Test game inserted successfully",
        insertId: result.insertId
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.json({
      success: false,
      message: "Server error inserting test game",
      error: error.message
    });
  }
});

// Get games for a specific team
app.post('/team_games', (req, res) => {
  const { teamName } = req.body;
  
  if (!teamName) {
    return res.json({ success: false, message: "Team name is required" });
  }

  const query = `
    SELECT g.gname, g.publisher as platform 
    FROM game g
    JOIN game_team gt ON g.gname = gt.gname
    JOIN team t ON gt.tid = t.tid
    WHERE t.tname = ?
  `;
  
  connection.query(query, [teamName], (err, results) => {
    if (err) {
      console.error("Error fetching games:", err);
      return res.json({ success: false, message: "Failed to fetch team games" });
    }
    
    return res.json({
      success: true,
      games: results || []
    });
  });
});

// Get players for a specific team
app.post('/team_players', (req, res) => {
  const { teamName } = req.body;
  
  if (!teamName) {
    return res.json({ success: false, message: "Team name is required" });
  }
  
  const query = `
    SELECT p.pid, p.pname, pt.nickname, 
           CASE WHEN p.pid = t.captain_id THEN 'Captain' ELSE 'Player' END AS captain_status
    FROM player p
    JOIN player_team pt ON p.pid = pt.pid
    JOIN team t ON pt.tid = t.tid
    WHERE t.tname = ?
  `;
  
  connection.query(query, [teamName], (err, results) => {
    if (err) {
      console.error("Error fetching team players:", err);
      return res.json({ success: false, message: "Failed to fetch team players" });
    }
    
    // Find the captain
    const captain = results.find(player => player.captain_status === 'Captain');
    
    return res.json({
      success: true,
      players: results || [],
      captain: captain ? captain.pname : null
    });
  });
});

// Endpoint to assign a captain to a team
app.post('/assign_team_captain', (req, res) => {
  const { teamId, playerId } = req.body;
  
  if (!teamId || !playerId) {
    return res.json({ 
      success: false, 
      message: "Team ID and Player ID are required" 
    });
  }
  
  // Update the team's captain_id field
  const query = "UPDATE team SET captain_id = ? WHERE tid = ?";
  
  connection.query(query, [playerId, teamId], (err, result) => {
    if (err) {
      console.error("Error assigning team captain:", err);
      return res.json({ 
        success: false, 
        message: "Failed to assign captain" 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.json({ 
        success: false, 
        message: "Team not found" 
      });
    }
    
    return res.json({ 
      success: true, 
      message: "Captain assigned successfully" 
    });
  });
});

// Get all players in a team for captain assignment
app.post('/team_players_for_captain', (req, res) => {
  const { teamId } = req.body;
  
  if (!teamId) {
    return res.json({ 
      success: false, 
      message: "Team ID is required" 
    });
  }
  
  const query = `
    SELECT p.pid, p.pname, pt.nickname,
           CASE WHEN p.pid = t.captain_id THEN true ELSE false END AS is_captain
    FROM player p
    JOIN player_team pt ON p.pid = pt.pid
    JOIN team t ON pt.tid = t.tid
    WHERE t.tid = ?
  `;
  
  connection.query(query, [teamId], (err, results) => {
    if (err) {
      console.error("Error fetching team players for captain assignment:", err);
      return res.json({ 
        success: false, 
        message: "Failed to fetch team players" 
      });
    }
    
    return res.json({
      success: true,
      players: results || []
    });
  });
});