# Esports Management System

A full-stack web application for managing esports tournaments, teams, and games.

## Project Structure
```
├── BackEnd/           # Node.js backend server
│   ├── main.js       # Main server file
│   ├── database.js   # Database configuration
│   └── setup-db.js   # Database setup script
└── esports/          # React frontend application
    ├── src/          # Source code
    ├── public/       # Static files
    └── package.json  # Frontend dependencies
```

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm (Node Package Manager)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   cd esports
   npm install
   ```

3. Set up the database:
   - Create a MySQL database
   - Update the `.env` file with your database credentials:
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=esports_db
     DB_USER=your_username
     DB_PASS=your_password
     ```
   - Run the database setup script:
     ```bash
     cd BackEnd
     node setup-db.js
     ```

4. Start the application:
   ```bash
   cd esports
   npm run dev
   ```
   This will start both the frontend (port 3000) and backend servers.

## Test Data

### Admin User
```
Username: admin@esports.com
Password: admin123
```

### Sample Teams
1. Team Alpha
   - Game: League of Legends
   - Members: 5
   - Region: North America

2. Team Beta
   - Game: Counter-Strike
   - Members: 5
   - Region: Europe

3. Team Gamma
   - Game: Dota 2
   - Members: 5
   - Region: Asia

### Sample Games
1. League of Legends
   - Publisher: Riot Games
   - Type: MOBA

2. Counter-Strike
   - Publisher: Valve
   - Type: FPS

3. Dota 2
   - Publisher: Valve
   - Type: MOBA

### Sample Tournaments
1. Summer Championship 2024
   - Game: League of Legends
   - Prize Pool: $50,000
   - Start Date: 2024-06-01
   - End Date: 2024-06-15

2. Winter Masters 2024
   - Game: Counter-Strike
   - Prize Pool: $100,000
   - Start Date: 2024-12-01
   - End Date: 2024-12-20

## Features
- User Authentication (Admin/User roles)
- Team Management
- Game Management
- Tournament Management
- Player Registration
- Match Scheduling
- Results Tracking

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/logout

### Teams
- GET /api/teams
- POST /api/teams
- GET /api/teams/:id
- PUT /api/teams/:id
- DELETE /api/teams/:id

### Games
- GET /api/games
- POST /api/games
- GET /api/games/:id
- PUT /api/games/:id
- DELETE /api/games/:id

### Tournaments
- GET /api/tournaments
- POST /api/tournaments
- GET /api/tournaments/:id
- PUT /api/tournaments/:id
- DELETE /api/tournaments/:id

## Technologies Used
- Frontend:
  - React.js
  - React Bootstrap
  - Axios
  - React Router
  - React Toastify

- Backend:
  - Node.js
  - Express.js
  - MySQL
  - JWT Authentication
  - Multer (File Upload)

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the ISC License. 