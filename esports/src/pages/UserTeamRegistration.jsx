import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/UserTeamRegistration.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserTeamRegistration = () => {
  const [teamName, setTeamName] = useState('');
  const [socialId, setSocialId] = useState('');
  const [players, setPlayers] = useState([{ name: '', nickname: '', captainStatus: 'Player' }]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const storedUserData = localStorage.getItem("UserLoginData");
    if (!storedUserData) {
      navigate('/user_login');
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate('/user_login');
    }
  }, [navigate]);

  // Fetch available games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get('/available_games');
        if (response.data && Array.isArray(response.data)) {
          setAvailableGames(response.data);
        } else {
          console.error('Invalid game data format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        toast.error('Failed to load available games');
      } finally {
        setGamesLoading(false);
      }
    };

    fetchGames();
  }, []);

  const addPlayer = () => {
    if (players.length >= 5) {
      toast.warning("Maximum 5 players allowed per team");
      return;
    }
    setPlayers([...players, { name: '', nickname: '', captainStatus: 'Player' }]);
  };

  const removePlayer = (index) => {
    if (players.length <= 1) {
      toast.warning("Team must have at least one player");
      return;
    }
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    
    // If this is the captain, update other players to be regular players
    if (field === 'captainStatus' && value === 'Captain') {
      newPlayers.forEach((player, i) => {
        if (i !== index) {
          player.captainStatus = 'Player';
        }
      });
    }
    
    setPlayers(newPlayers);
  };

  const handleGameSelection = (game) => {
    setSelectedGames(prevGames => {
      if (prevGames.includes(game)) {
        return prevGames.filter(g => g !== game);
      } else {
        return [...prevGames, game];
      }
    });
  };

  const validateForm = () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return false;
    }
    
    if (!socialId.trim()) {
      toast.error("Social ID is required");
      return false;
    }
    
    // Check if at least one player is captain
    const hasCaptain = players.some(player => player.captainStatus === 'Captain');
    if (!hasCaptain) {
      toast.error("One player must be designated as Captain");
      return false;
    }
    
    // Validate all players have names and nicknames
    for (let i = 0; i < players.length; i++) {
      if (!players[i].name.trim() || !players[i].nickname.trim()) {
        toast.error(`All player details must be filled for Player ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First, register the team with selected games
      const teamResponse = await api.post("/team_create", {
        tname: teamName,
        social_id: socialId,
        games: selectedGames
      });
      
      if (!teamResponse.data.success) {
        toast.error(teamResponse.data.message || "Failed to register team");
        setLoading(false);
        return;
      }
      
      // Get the teamId
      const teamId = teamResponse.data.teamId;
      
      // Map user to team
      if (teamId && userData && userData.id) {
        try {
          await api.post("/map_user_team", {
            userId: userData.id,
            teamId: teamId
          });
        } catch (error) {
          console.error("Error mapping user to team:", error);
          toast.warning("Team created but you may not see it in your teams list");
        }
      }
      
      // Register players sequentially
      for (const player of players) {
        try {
          await api.post("/player_create", {
            pname: player.name,
            nickname: player.nickname,
            team_name: teamName,
            captain_status: player.captainStatus
          });
        } catch (error) {
          console.error(`Error adding player ${player.name}:`, error);
        }
      }
      
      // Show success message
      toast.success("Team registered successfully!");
      
      // Redirect to team_info after a delay
      setTimeout(() => {
        navigate('/team_info');
      }, 2000);
    } catch (error) {
      console.error("Team registration error:", error);
      toast.error("Error registering team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-team-registration-container">
      <div className="user-team-registration-header">
        <h1>Register Your Team</h1>
        <p>Create your esports team and add players</p>
      </div>
      
      <form className="user-team-registration-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Team Information</h2>
          <div className="form-group">
            <label>Team Name</label>
            <input 
              type="text" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Social ID (Discord/Telegram)</label>
            <input 
              type="text" 
              value={socialId} 
              onChange={(e) => setSocialId(e.target.value)}
              placeholder="Enter team social contact"
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Games</h2>
          <p className="info-text">Select the games your team will participate in.</p>
          
          {gamesLoading ? (
            <div className="loading-games">Loading available games...</div>
          ) : availableGames.length > 0 ? (
            <div className="games-selection">
              {availableGames.map((game, index) => (
                <div key={index} className="game-checkbox">
                  <input
                    type="checkbox"
                    id={`game-${index}`}
                    checked={selectedGames.includes(game.gname)}
                    onChange={() => handleGameSelection(game.gname)}
                  />
                  <label htmlFor={`game-${index}`}>
                    {game.gname} <span className="game-platform">({game.platform})</span>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-games-message">No games available for selection. Please contact an administrator.</div>
          )}
        </div>
        
        <div className="form-section">
          <h2>Players</h2>
          <p className="info-text">Add between 1-5 players for your team. One must be designated as Captain.</p>
          
          {players.map((player, index) => (
            <div key={index} className="player-form">
              <h3>Player {index + 1}</h3>
              <div className="player-fields">
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    value={player.name} 
                    onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                    placeholder="Enter player name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Nickname</label>
                  <input 
                    type="text" 
                    value={player.nickname} 
                    onChange={(e) => handlePlayerChange(index, 'nickname', e.target.value)}
                    placeholder="Enter player nickname"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={player.captainStatus} 
                    onChange={(e) => handlePlayerChange(index, 'captainStatus', e.target.value)}
                  >
                    <option value="Player">Player</option>
                    <option value="Captain">Captain</option>
                  </select>
                </div>
              </div>
              
              {players.length > 1 && (
                <button 
                  type="button" 
                  className="remove-player-btn"
                  onClick={() => removePlayer(index)}
                >
                  Remove Player
                </button>
              )}
            </div>
          ))}
          
          {players.length < 5 && (
            <button 
              type="button" 
              className="add-player-btn"
              onClick={addPlayer}
            >
              Add Player
            </button>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/team_info')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserTeamRegistration; 