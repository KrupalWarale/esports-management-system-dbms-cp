# Esports Management System

A full-stack web application for managing esport

https://github.com/user-attachments/assets/4f12a69b-54c4-4734-93ba-bfe306342968

s tournaments, teams, and games.


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


## Features
- User Authentication (Admin/User roles)
- Team Management
- Game Management
- Tournament Management
- Player Registration
- Match Scheduling
- Results Tracking

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
