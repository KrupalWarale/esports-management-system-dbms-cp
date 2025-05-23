import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Buffer } from 'buffer'
import '../css/SpecPlayerInfo.css'
import api from '../api'
import { toast } from 'react-toastify'

const SpecPlayerInfo = () => {
    const [playerName, setPlayerName] = useState("")
    const [player, setPlayer] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const selectedPlayer = localStorage.getItem("SelectedPlayer")
        if (!selectedPlayer) {
            toast.error("No player selected")
            navigate('/team_info')
            return
        }
        setPlayerName(selectedPlayer)
    }, [navigate])

    useEffect(() => {
        if (!playerName) return
        
        const fetchPlayerData = async () => {
            setLoading(true)
            
            try {
                const response = await api.post("/fetch_player_details", {
                    id: playerName
                })
                
                if (response.data && Array.isArray(response.data)) {
                    setPlayer(response.data)
                } else {
                    console.error("Invalid player data format:", response.data)
                    toast.warning("Could not load player details")
                }
                
                setLoading(false)
            } catch (error) {
                console.error("Error fetching player data:", error)
                toast.error("Failed to load player details")
                setLoading(false)
            }
        }
        
        fetchPlayerData()
    }, [playerName])
    
    const handleBackToTeam = () => {
        const teamName = player.length > 0 ? player[0].tname : null
        if (teamName) {
            localStorage.setItem("SelectedTeam", teamName)
            navigate('/team_players')
        } else {
            navigate('/team_info')
        }
    }
    
    if (loading) {
        return <div className="loading-container">Loading player details...</div>
    }

    return (
        <div className='spec-player-box'>
            <div className='spec-player-container'>
                {player.length > 0 ? (
                    player.map((prod, index) => (
                        <React.Fragment key={index}>
                            <div className='spec-player-image-container'>
                                {prod.photo != null ? (
                                    <img 
                                        src={`data:image/png;base64,${Buffer.from(prod.photo.data).toString('base64')}`} 
                                        alt={prod.pname} 
                                        className='spec-player-image' 
                                    />
                                ) : (
                                    <img 
                                        src='https://static.vecteezy.com/system/resources/thumbnails/010/884/730/small_2x/owl-head-mascot-team-logo-png.png' 
                                        alt='default player' 
                                        className='spec-player-image' 
                                    />
                                )}
                            </div>
                            <div className='player-desc'>
                                <h1 className='spec-player-name'>{prod.pname}</h1>
                                <div>Date of Birth: {prod.dob || 'Not specified'}</div>
                                <div>Country of Origin: {prod.origin || 'Not specified'}</div>
                                <div>Sex: {prod.sex || 'Not specified'}</div>
                                <div>Nickname: {prod.nickname || 'Not specified'}</div>
                                <div>Team Name: {prod.tname || 'Not specified'}</div>
                                <div>Description: {prod.description || 'No description available'}</div>
                            </div>
                        </React.Fragment>
                    ))
                ) : (
                    <div className="no-player-data">
                        <p>No details found for this player</p>
                    </div>
                )}
            </div>
            
            <div className="back-button-container">
                <button className="back-to-team-button" onClick={handleBackToTeam}>
                    Back to Team
                </button>
            </div>
        </div>
    )
}

export default SpecPlayerInfo
