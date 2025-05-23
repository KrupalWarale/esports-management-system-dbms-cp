import React, { useEffect, useState } from 'react'
import api from '../api'
import '../css/UserDashboard.css'
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Load user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("UserLoginData");
    if (!storedUserData) {
      navigate('/user_login');
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
      
      // Fetch data from the server
      fetchUserTeams(parsedData.email);
      fetchGames();
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate('/user_login');
    }
  }, [navigate]);
  
  const fetchUserTeams = async (userEmail) => {
    try {
      // For now, we'll fetch all teams and filter them based on user actions later
      // In a real app, we would have an API endpoint to fetch user-specific teams
      const response = await api.get("/team_details");
      // Just showing a limited set of teams for now
      setUserTeams(response.data.slice(0, 2));
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    }
  };
  
  const fetchGames = async () => {
    try {
      const response = await api.get("/game_details");
      setGames(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games");
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-indicator">Loading dashboard data...</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <p className="welcome-message">
          Welcome {userData?.name || 'User'}! Explore teams and games below.
        </p>
        <div className="user-actions">
          <button className="register-team-btn" onClick={() => navigate('/user-register-team')}>
            Register Your Team
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Your Teams</h2>
          <div className="team-cards">
            {userTeams.length > 0 ? (
              userTeams.map(team => (
                <div key={team.tname} className="team-card">
                  <h3>{team.tname}</h3>
                  <p>Captain: {team.captain_name || 'Not assigned'}</p>
                  {team.sname && <p>Sponsor: {team.sname}</p>}
                  <button 
                    className="view-details-button"
                    onClick={() => navigate(`/team_players?name=${team.tname}`)}
                  >
                    View Team
                  </button>
                </div>
              ))
            ) : (
              <div className="no-teams-card">
                <p className="no-data-message">You haven't registered any teams yet.</p>
                <Link to="/user-register-team" className="register-now-btn">
                  Register a Team Now
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>Popular Games</h2>
          <div className="game-cards">
            {games.length > 0 ? (
              games.map(game => (
                <div key={game.gname} className="game-card">
                  <h3>{game.gname}</h3>
                  <p>Publisher: {game.publisher}</p>
                  <p>Released: {new Date(game.release_date).toLocaleDateString()}</p>
                  <button 
                    className="view-details-button"
                    onClick={() => navigate(`/game_team?name=${game.gname}`)}
                  >
                    View Teams
                  </button>
                </div>
              ))
            ) : (
              <p className="no-data-message">No games available at the moment.</p>
            )}
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default UserDashboard; 