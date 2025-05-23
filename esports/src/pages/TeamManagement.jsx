import React, { useEffect, useState } from 'react'
import api from '../api'
import '../css/TeamManagement.css'
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { Link } from 'react-router-dom';

const TeamManagement = () => {
    const [teams, setTeams] = useState([]);
    const [teamPlayers, setTeamPlayers] = useState({});
    const [games, setGames] = useState([]);
    const [stats, setStats] = useState({
        totalTeams: 0,
        totalPlayers: 0,
        totalGames: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // New state for game form
    const [newGame, setNewGame] = useState({
        gname: '',
        platform: '',
        type: ''
    });
    const [addingGame, setAddingGame] = useState(false);

    // Load all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch teams with more detailed information including user association
                let teamsData = [];
                try {
                    const teamsResponse = await api.get("/admin_team_details");
                    teamsData = teamsResponse.data;
                    setTeams(teamsData);
                } catch (teamsError) {
                    console.error("Error fetching teams:", teamsError);
                    // Fallback to regular team_details endpoint if admin endpoint fails
                    try {
                        const fallbackResponse = await api.get("/team_details");
                        teamsData = fallbackResponse.data;
                        setTeams(fallbackResponse.data);
                    } catch (fallbackError) {
                        console.error("Error fetching teams fallback:", fallbackError);
                        toast.error("Failed to load teams data");
                    }
                }
                
                // Fetch games
                try {
                    const gamesResponse = await api.get("/game_details");
                    setGames(gamesResponse.data);
                    
                    // Update stats
                    setStats({
                        totalTeams: teamsData.length,
                        totalPlayers: 0, // Will be calculated below
                        totalGames: gamesResponse.data.length
                    });
                } catch (error) {
                    console.error("Error fetching games:", error);
                    // Continue even if games fetch fails
                    setStats({
                        totalTeams: teamsData.length,
                        totalPlayers: 0,
                        totalGames: 0
                    });
                }
                
                // Calculate total players across all teams
                let playerCount = 0;
                for (const team of teamsData) {
                    try {
                        const teamName = team.tname;
                        if (!teamName) continue;
                        
                        const playersResponse = await api.post("/fetch_team_details", {
                            id: teamName
                        });
                        
                        // Cache the player data
                        setTeamPlayers(prev => ({
                            ...prev,
                            [teamName]: playersResponse.data
                        }));
                        
                        playerCount += playersResponse.data.length;
                    } catch (error) {
                        console.error(`Error fetching players for team:`, error);
                    }
                }
                
                // Update the stats with player count
                setStats(prev => ({
                    ...prev,
                    totalPlayers: playerCount
                }));
                
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load admin dashboard data");
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Load players for a specific team when selected
    const loadTeamPlayers = async (teamName) => {
        if (teamPlayers[teamName]) {
            // If already loaded, just set as selected
            setSelectedTeam(teamName);
            return;
        }

        try {
            const response = await api.post("/fetch_team_details", {
                id: teamName
            });
            
            setTeamPlayers(prev => ({
                ...prev,
                [teamName]: response.data
            }));
            
            setSelectedTeam(teamName);
        } catch (error) {
            console.error("Error fetching team players:", error);
            toast.error(`Failed to load players for team ${teamName}`);
        }
    };

    const handleGameSubmit = async (e) => {
        e.preventDefault();
        
        if (!newGame.gname || !newGame.platform || !newGame.type) {
            toast.error('All fields are required');
            return;
        }
        
        try {
            setAddingGame(true);
            
            const response = await api.post('/add_game', {
                gname: newGame.gname,
                platform: newGame.platform,
                type: newGame.type
            });
            
            if (response.data.success) {
                toast.success('Game added successfully!');
                
                // Add the new game to the state
                setGames([...games, newGame]);
                
                // Update stats
                setStats({
                    ...stats,
                    totalGames: stats.totalGames + 1
                });
                
                // Reset form
                setNewGame({
                    gname: '',
                    platform: '',
                    type: ''
                });
            } else {
                toast.error(response.data.message || 'Failed to add game');
            }
        } catch (error) {
            console.error('Error adding game:', error);
            toast.error('Error adding game. Please try again.');
        } finally {
            setAddingGame(false);
        }
    };
    
    const handleGameInputChange = (e) => {
        const { name, value } = e.target;
        setNewGame({
            ...newGame,
            [name]: value
        });
    };

    const renderDashboard = () => (
        <div className="dashboard-section">
            <div className="stats-cards">
                <div className="stat-card">
                    <h3>Total Teams</h3>
                    <p className="stat-number">{stats.totalTeams}</p>
                    <Link to="/register_team" className="stat-action">Register New Team</Link>
                </div>
                <div className="stat-card">
                    <h3>Total Players</h3>
                    <p className="stat-number">{stats.totalPlayers}</p>
                    <Link to="/register_player" className="stat-action">Register New Player</Link>
                </div>
                <div className="stat-card">
                    <h3>Active Games</h3>
                    <p className="stat-number">{stats.totalGames}</p>
                    <Link to="/add_game" className="stat-action">Enroll Teams</Link>
                </div>
            </div>
            
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/register_player" className="action-button">
                        <span className="action-icon">👤</span>
                        Register Player
                    </Link>
                    <Link to="/register_team" className="action-button">
                        <span className="action-icon">👥</span>
                        Register Team
                    </Link>
                    <Link to="/add_game" className="action-button">
                        <span className="action-icon">🎮</span>
                        Enroll in Game
                    </Link>
                </div>
            </div>
            
            <div className="recent-activity">
                <h2>Recent Teams</h2>
                <div className="recent-teams">
                    {teams.slice(0, 3).map(team => (
                        <div key={team.tname} className="recent-team-card">
                            <h3>{team.tname}</h3>
                            <p>Captain: {team.captain_name || 'Not assigned'}</p>
                            <button 
                                className="view-details-btn"
                                onClick={() => {
                                    setSelectedTeam(team.tname);
                                    loadTeamPlayers(team.tname);
                                    setActiveTab('teams');
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderTeams = () => (
        <div className="teams-section">
            <div className="teams-list">
                <h2>All Registered Teams</h2>
                {teams.length === 0 ? (
                    <div className="no-teams">No teams found. There might be an issue with database connectivity.</div>
                ) : (
                    <div className="teams-grid">
                        {teams.map((team, index) => (
                            <div 
                                key={index}
                                className={`team-card ${selectedTeam === team.tname ? 'selected' : ''}`}
                                onClick={() => team.tname && loadTeamPlayers(team.tname)}
                            >
                                <h3>{team.tname || 'Unnamed Team'}</h3>
                                <p>Captain: {team.captain_name || 'Not assigned'}</p>
                                {team.social_id && <p>Social ID: {team.social_id}</p>}
                                {team.creator_email && <p className="team-creator">Created by: {team.creator_email}</p>}
                                {team.sname && <p>Sponsor: {team.sname}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedTeam && teamPlayers[selectedTeam] && (
                <div className="team-details">
                    <h2>{selectedTeam} Players</h2>
                    <div className="players-grid">
                        {teamPlayers[selectedTeam].map((player, playerIndex) => (
                            <div key={playerIndex} className="player-card">
                                <h3>{player.pname}</h3>
                                <p>Nickname: {player.nickname}</p>
                                <p>Role: {player.captain_status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderGames = () => (
        <div className="games-section">
            <h2>Active Games</h2>
            
            <div className="add-game-form">
                <h3>Add New Game</h3>
                <form onSubmit={handleGameSubmit}>
                    <div className="form-group">
                        <label>Game Name</label>
                        <input 
                            type="text" 
                            name="gname" 
                            value={newGame.gname} 
                            onChange={handleGameInputChange} 
                            placeholder="Enter game name"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Platform</label>
                        <input 
                            type="text" 
                            name="platform" 
                            value={newGame.platform} 
                            onChange={handleGameInputChange} 
                            placeholder="e.g. PC, PlayStation, Xbox"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Game Type</label>
                        <input 
                            type="text" 
                            name="type" 
                            value={newGame.type} 
                            onChange={handleGameInputChange} 
                            placeholder="e.g. FPS, MOBA, Battle Royale"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={addingGame}
                    >
                        {addingGame ? 'Adding...' : 'Add Game'}
                    </button>
                </form>
            </div>
            
            <div className="games-grid">
                {games.length === 0 ? (
                    <p className="no-games">No active games found.</p>
                ) : (
                    games.map(game => (
                        <div key={game.gname} className="game-card">
                            <h3>{game.gname}</h3>
                            <p>Platform: {game.platform}</p>
                            <p>Type: {game.type}</p>
                            <Link to={`/add_game?game=${game.gname}`} className="enroll-button">
                                Enroll Teams
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="management-container">
            <div className="management-header">
                <h1>Admin Dashboard</h1>
                <p className="management-description">
                    Manage your esports teams, players, and game assignments
                </p>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>
                <button 
                    className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teams')}
                >
                    Teams
                </button>
                <button 
                    className={`tab-button ${activeTab === 'games' ? 'active' : ''}`}
                    onClick={() => setActiveTab('games')}
                >
                    Games
                </button>
            </div>

            {isLoading ? (
                <div className="loading-spinner">Loading data...</div>
            ) : (
                <div className="admin-content">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'teams' && renderTeams()}
                    {activeTab === 'games' && renderGames()}
                </div>
            )}

            
        </div>
    );
};

export default TeamManagement; 