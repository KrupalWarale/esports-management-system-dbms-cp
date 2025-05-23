import React, { useState } from 'react'
import api from '../api'
import '../css/TeamRegistration.css' // Reuse the same styling
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const PlayerRegistration = () => {
    const [playerData, setPlayerData] = useState({
        name: '',
        dob: '',
        sex: '',
        origin: '',
        desc: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPlayerData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!playerData.name || !playerData.dob || !playerData.sex || !playerData.origin || !playerData.desc) {
            toast.error("Please fill in all fields");
            return;
        }
        
        try {
            const payload = {
                name: playerData.name,
                dob: playerData.dob,
                sex: playerData.sex,
                origin: playerData.origin,
                desc: playerData.desc
            };
            
            await toast.promise(
                api.post("/add_player_data", payload),
                {
                    pending: "Registering player...",
                    success: "Player registered successfully!",
                    error: "Failed to register player."
                }
            );
            
            // Reset form after successful submission
            setPlayerData({
                name: '',
                dob: '',
                sex: '',
                origin: '',
                desc: ''
            });
            
        } catch (error) {
            console.error("Error registering player:", error);
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-form-wrapper">
                <h1>Player Registration</h1>
                <p className="form-description">
                    Register a player to be eligible for team selection.
                </p>
                
                <form className="registration-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Player Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={playerData.name}
                            onChange={handleInputChange}
                            placeholder="Enter player's full name"
                            className="form-input"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="dob">Date of Birth</label>
                        <input
                            type="date"
                            id="dob"
                            name="dob"
                            value={playerData.dob}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="sex">Gender</label>
                        <select
                            id="sex"
                            name="sex"
                            value={playerData.sex}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                        >
                            <option value="" disabled>Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="origin">Country of Origin</label>
                        <input
                            type="text"
                            id="origin"
                            name="origin"
                            value={playerData.origin}
                            onChange={handleInputChange}
                            placeholder="Enter country"
                            className="form-input"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="desc">Player Description</label>
                        <textarea
                            id="desc"
                            name="desc"
                            value={playerData.desc}
                            onChange={handleInputChange}
                            placeholder="Briefly describe player skills and experience"
                            className="form-input"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    
                    <button type="submit" className="register-button">
                        Register Player
                    </button>
                </form>
            </div>
            
        </div>
    );
};

export default PlayerRegistration; 