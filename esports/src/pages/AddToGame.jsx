import React, { useEffect, useState } from 'react'
import api from '../api'
// import axios from 'axios'
import '../css/AddToGame.css'
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const AddToGame = () => {
    const [teams, setTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState('')
    const [availableGames, setAvailableGames] = useState([])
    const [selectedGame, setSelectedGame] = useState('')
    
    // Load teams on component mount
    useEffect(() => {
        const getTeams = async () => {
            try {
                const response = await api.get("/team_details");
                setTeams(response.data);
            } catch (error) {
                console.error("Error fetching teams:", error);
                toast.error("Failed to load teams");
            }
        }
        getTeams();
    }, []);
    
    // Load available games when a team is selected
    useEffect(() => {
        const getAvailableGames = async () => {
            if (!selectedTeam) return;
            
            try {
                const response = await api.post("/games_not_played_by_team", {
                    id: selectedTeam
                });
                setAvailableGames(response.data.payload || []);
            } catch (error) {
                console.error("Error fetching available games:", error);
                toast.error("Failed to load available games");
                setAvailableGames([]);
            }
        }
        getAvailableGames();
    }, [selectedTeam]);
    
    const handleTeamChange = (e) => {
        setSelectedTeam(e.target.value);
        // Reset selected game when team changes
        setSelectedGame('');
    }
    
    const handleGameChange = (e) => {
        setSelectedGame(e.target.value);
    }
    
    const handleEnrollTeam = async () => {
        if (!selectedTeam || !selectedGame) {
            return toast.error("Please select both a team and a game");
        }
        
        try {
            await toast.promise(
                api.post("/add_team_to_game", {
                    team: selectedTeam,
                    game: selectedGame
                }),
                {
                    pending: "Enrolling team in game...",
                    success: "Team successfully enrolled in game!",
                    error: "Failed to enroll team in game."
                }
            );
            
            // Reset form after successful enrollment
            setSelectedGame('');
            
            // Re-fetch available games for the selected team
            const response = await api.post("/games_not_played_by_team", {
                id: selectedTeam
            });
            setAvailableGames(response.data.payload || []);
            
        } catch (error) {
            console.error("Error enrolling team in game:", error);
        }
    }

    return (
        <>
            <div className="select-game-container">
                <form className='select-game-form'>
                    <h1>Enroll Team in Game</h1>
                    <p className="form-description">
                        Select a team and enroll it in an available game.
                    </p>
                    
                    <select 
                        className='select-game-form-inside' 
                        value={selectedTeam} 
                        onChange={handleTeamChange}
                    >
                        <option value='' disabled>Select Team</option>
                        {teams.map(team => (
                            <option key={team.tname} value={team.tname}>
                                {team.tname}
                            </option>
                        ))}
                    </select>
                    
                    <select
                        className='select-game-form-inside'
                        value={selectedGame}
                        onChange={handleGameChange}
                        disabled={!availableGames.length}
                    >
                        <option value='' disabled>
                            {!selectedTeam 
                                ? 'Select a team first' 
                                : !availableGames.length 
                                    ? 'No available games for this team' 
                                    : 'Select Game'}
                        </option>
                        {availableGames.map(game => (
                            <option key={game.gname} value={game.gname}>
                                {game.gname}
                            </option>
                        ))}
                    </select>
                    
                    <button 
                        type='button' 
                        className='team-submit' 
                        onClick={handleEnrollTeam}
                        disabled={!selectedTeam || !selectedGame}
                    >
                        Enroll Team
                    </button>
                </form>
            </div>
            
        </>
    )
}

export default AddToGame
