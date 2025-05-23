import React, { useEffect, useState } from 'react'
import api from '../api'
import '../css/TeamRegistration.css'
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const TeamRegistration = () => {
    const [players, setPlayers] = useState([]);
    const [teamData, setTeamData] = useState({
        name: '',
        player1: '',
        player2: '',
        player3: '',
        social: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load available players on component mount
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setIsLoading(true);
                const response = await api.get("/unassigned_players");
                setPlayers(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching players:", error);
                toast.error("Failed to load available players");
                setIsLoading(false);
            }
        };
        
        fetchPlayers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTeamData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!teamData.name || !teamData.player1 || !teamData.player2 || !teamData.player3 || !teamData.social) {
            toast.error("Please fill in all fields");
            return;
        }
        
        // Validate social ID format
        const pattern = /^@[a-zA-Z0-9_.-]+$/;
        if (!pattern.test(teamData.social)) {
            toast.error("Invalid Social ID. Start your ID with @");
            return;
        }
        
        // Ensure all players are different
        if (teamData.player1 === teamData.player2 || teamData.player1 === teamData.player3 || teamData.player2 === teamData.player3) {
            toast.error("Please select different players for each position");
            return;
        }
        
        try {
            const payload = {
                name: teamData.name,
                p1: teamData.player1,
                p2: teamData.player2,
                p3: teamData.player3,
                social: teamData.social
            };
            
            await toast.promise(
                api.post("/add_team_data", payload),
                {
                    pending: "Registering team...",
                    success: "Team registered successfully!",
                    error: "Failed to register team."
                }
            );
            
            // Reset form after successful submission
            setTeamData({
                name: '',
                player1: '',
                player2: '',
                player3: '',
                social: ''
            });
            
        } catch (error) {
            console.error("Error registering team:", error);
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-form-wrapper">
                <h1>Team Registration</h1>
                <p className="form-description">
                    Register your team with pre-registered players.
                </p>
                
                {isLoading ? (
                    <div className="loading-message">Loading available players...</div>
                ) : players.length === 0 ? (
                    <div className="no-players-message">
                        <p>No available players found.</p>
                        <p>All players are already assigned to teams or you need to register players first.</p>
                    </div>
                ) : (
                    <form className="registration-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Team Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={teamData.name}
                                onChange={handleInputChange}
                                placeholder="Enter team name"
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="player1">Player 1</label>
                            <select
                                id="player1"
                                name="player1"
                                value={teamData.player1}
                                onChange={handleInputChange}
                                className="form-select"
                                required
                            >
                                <option value="" disabled>Select Player 1</option>
                                {players.map(player => (
                                    <option key={`p1-${player.pid}`} value={player.pid}>
                                        {player.pname} ({player.origin})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="player2">Player 2</label>
                            <select
                                id="player2"
                                name="player2"
                                value={teamData.player2}
                                onChange={handleInputChange}
                                className="form-select"
                                required
                            >
                                <option value="" disabled>Select Player 2</option>
                                {players.map(player => (
                                    <option key={`p2-${player.pid}`} value={player.pid}>
                                        {player.pname} ({player.origin})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="player3">Player 3</label>
                            <select
                                id="player3"
                                name="player3"
                                value={teamData.player3}
                                onChange={handleInputChange}
                                className="form-select"
                                required
                            >
                                <option value="" disabled>Select Player 3</option>
                                {players.map(player => (
                                    <option key={`p3-${player.pid}`} value={player.pid}>
                                        {player.pname} ({player.origin})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="social">Social Media ID</label>
                            <input
                                type="text"
                                id="social"
                                name="social"
                                value={teamData.social}
                                onChange={handleInputChange}
                                placeholder="@teamhandle"
                                className="form-input"
                                required
                            />
                            <small>Start with @ (e.g., @teamname)</small>
                        </div>
                        
                        <button type="submit" className="register-button">
                            Register Team
                        </button>
                    </form>
                )}
            </div>
            
        </div>
    );
};

export default TeamRegistration; 