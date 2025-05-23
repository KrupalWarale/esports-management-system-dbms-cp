import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './pages/Navbar'
import TeamInfo from './pages/TeamInfo'
import TeamPlayers from './pages/TeamPlayers'
import SpecPlayerInfo from './pages/SpecPlayerInfo'
import Games from './pages/Games'
import GameTeam from './pages/GameTeam'
import Merch from './pages/Merch'
import Homepage from './pages/Homepage'
import BackGroundImage from './pages/BackGroundImage'
import LoginPage from './pages/LoginPage'
import UserValidation from './UserValidation'
import AddToGame from './pages/AddToGame'
import { ToastContainer } from 'react-toastify'
import './App.css'
import 'react-toastify/dist/ReactToastify.css'

// Import our new components
import PlayerRegistration from './pages/PlayerRegistration'
import TeamRegistration from './pages/TeamRegistration'
import TeamManagement from './pages/TeamManagement'
import UserRegistration from './pages/UserRegistration'
import UserLogin from './pages/UserLogin'
import UserTeamRegistration from './pages/UserTeamRegistration'

// User validation for user routes
import UserAuth from './UserAuth'

const App = () => {
  return (
    <>
      <BrowserRouter>
        <NavBar />
        <BackGroundImage />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/team_info" element={<TeamInfo />} />
          <Route path="/team_players" element={<TeamPlayers />} />
          <Route path="/player" element={<SpecPlayerInfo />} />
          <Route path="/games" element={<Games />} />
          <Route path="/game_team" element={<GameTeam />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user_register" element={<UserRegistration />} />
          <Route path="/user_login" element={<UserLogin />} />
          
          {/* Protected Admin Routes */}
          <Route element={<UserValidation />} >
            <Route path="/admin" element={<TeamManagement />} />
            <Route path="/register_player" element={<PlayerRegistration />} />
            <Route path="/register_team" element={<TeamRegistration />} />
            <Route path="/add_game" element={<AddToGame />} />
          </Route>

          {/* Protected User Routes */}
          <Route element={<UserAuth />} >
            <Route path="/user-register-team" element={<UserTeamRegistration />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  )
}

export default App