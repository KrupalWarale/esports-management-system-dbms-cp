import React, { useEffect, useState } from 'react'
import '../css/TeamInfo.css'
import { Link, useNavigate } from 'react-router-dom';
import { Buffer } from 'buffer';
import api from '../api';
import { toast } from 'react-toastify';

function App() {
    const [data1, setData1] = useState([]);
    const [userTeams, setUserTeams] = useState([]);
    const [userAuth, setUserAuth] = useState(null);
    const [adminAuth, setAdminAuth] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        // Check for admin login
        const adminData = localStorage.getItem("LoginData");
        if (adminData) {
            setAdminAuth(adminData);
            // Admin is logged in, fetch all teams
            fetchAllTeams();
        } else {
            setAdminAuth(null);
        }
        
        // Check for user login
        const userData = localStorage.getItem("UserLoginData");
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                setUserAuth(parsedData);
                
                // Fetch user's teams
                fetchUserTeams(parsedData.email);
                
                // Only fetch all teams if admin is logged in, not for regular users
                if (adminData) {
                    fetchAllTeams();
                } else {
                    // For non-admin users, set loading to false after fetching their teams
                    setLoading(false);
                }
            } catch (e) {
                console.error("Error parsing user data", e);
                setUserAuth(null);
                if (!adminAuth) {
                    setLoading(false);
                }
            }
        } else {
            setUserAuth(null);
            if (!adminAuth) {
                setLoading(false);
            }
        }
    }, []);
    
    const fetchAllTeams = () => {
        // Fetch all team data - using local API instead of external endpoint
        api.get("/team_details")
            .then(response => {
                setData1(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
                toast.error("Failed to load teams");
            });
    };
    
    const fetchUserTeams = async (userEmail) => {
        try {
            // Use the user's email to fetch their teams
            const response = await api.post("/user_teams", { email: userEmail });
            
            if (response.data && response.data.length > 0) {
                setUserTeams(response.data);
            }
            
            // If only user auth (not admin), set loading to false after fetching user teams
            if (!adminAuth) {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching user teams:", error);
            if (!adminAuth) {
                setLoading(false);
            }
        }
    };
    
    function upload(x) {
        localStorage.setItem("SelectedTeam", x.tname);
        window.location.href = '/team_players'
    }
    
    const handleLogin = () => {
        navigate('/user_login');
    };

    return (
        <div className="team-info-container">
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (!userAuth && !adminAuth) ? (
                <div className="login-prompt">
                    <div className="login-prompt-content">
                        <h2>Team Information</h2>
                        <p>Please log in to view teams and register your own team.</p>
                        <button className="login-prompt-button" onClick={handleLogin}>
                            Login Now
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Display user's teams if they have any */}
                    {userAuth && userTeams.length > 0 && (
                        <div className="my-teams-section">
                            <h2 className="team-section-title">My Teams</h2>
                            <ul className="team-card-list">
                                {userTeams.map((cardData, index) => (
                                    <li key={index} className="team-card my-team-card">
                                        <Link onClick={() => upload(cardData)} className='link-card'>
                                            <div className='team-roll-animation'>
                                                {
                                                    cardData.photo != null ?
                                                        <img src={`data:image/png;base64,${Buffer.from(cardData.photo.data).toString('base64')}`} alt={cardData.tname} className='team_image' />
                                                        :
                                                        <img src='https://static.vecteezy.com/system/resources/thumbnails/010/884/730/small_2x/owl-head-mascot-team-logo-png.png' alt='idkl' className='team_image' />
                                                }
                                                <div className='team-text'>
                                                    <h1 className='team-text-header'>{cardData.tname}</h1>
                                                    <p className='team-text-inside'>Captain: {cardData.captain_name}</p>
                                                    <p className='team-text-inside'>Instagram: {cardData.social_id}</p>
                                                    <div className="owner-badge">Your Team</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Display message if user has no teams */}
                    {userAuth && userTeams.length === 0 && !adminAuth && (
                        <div className="no-teams-message">
                            <h2>You haven't registered any teams yet</h2>
                            <p>Get started by registering your first team!</p>
                            <button 
                                className="register-team-button" 
                                onClick={() => navigate('/user-register-team')}
                            >
                                Register Your Team
                            </button>
                        </div>
                    )}

                    {/* Only show all teams for admin */}
                    {adminAuth && (
                        <>
                            <h2 className="team-section-title">Teams</h2>
                            <ul className="team-card-list">
                                {data1.map((cardData, index) => (
                                    <li key={index} className="team-card">
                                        <Link onClick={() => upload(cardData)} className='link-card'>
                                            <div className='team-roll-animation'>
                                                {
                                                    cardData.photo != null ?
                                                        <img src={`data:image/png;base64,${Buffer.from(cardData.photo.data).toString('base64')}`} alt={cardData.tname} className='team_image' />
                                                        :
                                                        <img src='https://static.vecteezy.com/system/resources/thumbnails/010/884/730/small_2x/owl-head-mascot-team-logo-png.png' alt='idkl' className='team_image' />
                                                }
                                                <div className='team-text'>
                                                    <h1 className='team-text-header'>{cardData.tname}</h1>
                                                    <p className='team-text-inside'>Captain: {cardData.captain_name}</p>
                                                    <p className='team-text-inside'>Instagram: {cardData.social_id}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default App
