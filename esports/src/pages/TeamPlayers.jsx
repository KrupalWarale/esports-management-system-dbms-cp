import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Buffer } from 'buffer'
import '../css/TeamPlayers.css'
import api from '../api'
import { toast } from 'react-toastify'

const TeamPlayers = () => {
    const [teamName, setTeamName] = useState("")
    const [teamDetails, setTeamDetails] = useState(null)
    const [players, setPlayers] = useState([])
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    
    useEffect(() => {
        const selectedTeam = localStorage.getItem("SelectedTeam")
        if (!selectedTeam) {
            toast.error("No team selected")
            navigate('/team_info')
            return
        }
        setTeamName(selectedTeam)
    }, [navigate])
    
    useEffect(() => {
        if (!teamName) return
        
        const fetchTeamData = async () => {
            setLoading(true)
            
            try {
                // Fetch comprehensive team details
                const response = await api.post("/team_complete_details", {
                    teamName: teamName
                })
                
                if (response.data && response.data.success) {
                    setTeamDetails(response.data.team)
                    setPlayers(response.data.players || [])
                    setGames(response.data.games || [])
                } else {
                    console.error("Invalid team data format:", response.data)
                    toast.warning("Could not load team details")
                }
                
                setLoading(false)
            } catch (error) {
                console.error("Error fetching team data:", error)
                toast.error("Failed to load team details")
                setLoading(false)
            }
        }
        
        fetchTeamData()
    }, [teamName])
    
    const navigateToPlayerDetail = (player) => {
        localStorage.setItem("SelectedPlayer", player.pname)
        navigate("/player")
    }
    
    if (loading) {
        return <div className="loading-container">Loading team details...</div>
    }

    return (
        <div className="team-players-container">
            <div className="team-header">
                <h1 className="team-name">{teamName}</h1>
                
                {teamDetails && teamDetails.social_id && (
                    <div className="team-social">
                        <p>Contact: {teamDetails.social_id}</p>
                    </div>
                )}
                
                {games.length > 0 && (
                    <div className="team-games">
                        <h3>Team participates in:</h3>
                        <div className="games-list">
                            {games.map((game, index) => (
                                <div key={index} className="game-tag">
                                    <span className="game-name">{game.gname}</span>
                                    <span className="game-platform">{game.platform}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="team-content">
                <div className="team-section">
                    <h2 className="section-title">Player Roster</h2>
                    
                    {players.length > 0 ? (
                        <ul className="player-card-list">
                            {players.map((player, index) => (
                                <li key={index} className="player-card">
                                    {player.role === "Captain" && <div className="captain-badge">Captain</div>}
                                    <Link onClick={() => navigateToPlayerDetail(player)} className="player-link">
                                        <div className="player-roll-animation">
                                            <div className="filler0image">
                                                {player.photo != null ? (
                                                    <img 
                                                        src={`data:image/png;base64,${Buffer.from(player.photo.data).toString('base64')}`} 
                                                        alt={player.pname} 
                                                        className="player-image" 
                                                    />
                                                ) : (
                                                    <img 
                                                        src="https://static.vecteezy.com/system/resources/thumbnails/010/884/730/small_2x/owl-head-mascot-team-logo-png.png" 
                                                        alt="default player" 
                                                        className="player-image" 
                                                    />
                                                )}
                                            </div>
                                            <div className="player-text">
                                                <h3 className="player-text-header">{player.nickname || player.pname}</h3>
                                                {player.nickname && <p className="player-text-inside">Name: {player.pname}</p>}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-players-message">
                            <p>No players found for this team</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="back-button-container">
                <button className="back-button" onClick={() => navigate('/team_info')}>
                    Back to Teams
                </button>
            </div>
        </div>
    )
}

export default TeamPlayers
