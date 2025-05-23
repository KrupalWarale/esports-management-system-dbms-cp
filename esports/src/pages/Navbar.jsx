import '../css/Navbar.css'
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import back from './back.svg'
import SnowFall from '../SnowFall';
import adduser from './add-user.svg'
import addGame from '../resoures/xbox.png'
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function NavBar() {
    const snowpos=[];
    for (let i = 0; i < 60; i++) {
        const snowpo=Math.floor(Math.random()*100)
        snowpos.push(snowpo)
    }
    const navigate = useNavigate();
    const location = useLocation();
    const [adminAuth, setAdminAuth] = useState(null);
    const [userAuth, setUserAuth] = useState(null);
    
    // Function to check authentication status
    const checkAuthStatus = () => {
        // Check for admin login
        const adminData = localStorage.getItem("LoginData");
        setAdminAuth(adminData);
        
        // Check for user login
        const userData = localStorage.getItem("UserLoginData");
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                setUserAuth(parsedData);
            } catch (e) {
                console.error("Error parsing user data", e);
                setUserAuth(null);
            }
        } else {
            setUserAuth(null);
        }
    };
    
    // Check auth status when component mounts, location changes, or storage changes
    useEffect(() => {
        checkAuthStatus();
        
        // Listen for storage events (for when other tabs/windows change localStorage)
        const handleStorageChange = () => {
            checkAuthStatus();
        };
        
        // Listen for custom login status change event
        const handleLoginStatusChange = () => {
            checkAuthStatus();
        };
        
        // Listen for user login status changed event
        const handleUserLoginStatusChanged = () => {
            checkAuthStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('loginStatusChange', handleLoginStatusChange);
        window.addEventListener('userLoginStatusChanged', handleUserLoginStatusChanged);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('loginStatusChange', handleLoginStatusChange);
            window.removeEventListener('userLoginStatusChanged', handleUserLoginStatusChanged);
        };
    }, [location.pathname]); // Re-run when route changes
    
    const handleAdminLogout = () => {
        localStorage.removeItem("LoginData");
        setAdminAuth(null);
        toast.success("Admin logged out successfully");
        
        // Force navigation to refresh the component
        navigate('/', { replace: true });
    }
    
    const handleUserLogout = () => {
        localStorage.removeItem("UserLoginData");
        setUserAuth(null);
        toast.success("Logged out successfully");
        
        // Force navigation to refresh the component
        navigate('/', { replace: true });
    }
    
    const handleAdminLogin = () => {
        navigate('/login');
    }
    
    const handleUserLogin = () => {
        navigate('/user_login');
    }
    
    return (
        <>
            <SnowFall snowposition={snowpos}/>
            <nav className="navbar">
                <Link to="/" className='links'>
                    <div className="navbar-logo">
                        <span className="navbar-text">Ghost Esports</span>
                    </div>
                </Link>
                <ul className="navbar-links">
                    {/* Public navigation links */}
                    <li className="navbar-links-1">
                        <Link to="/games" className="nav-link">
                            Games
                        </Link>
                    </li>
                    <li className="navbar-links-1">
                        <Link to="/team_info" className="nav-link">
                            Teams
                        </Link>
                    </li>
                    
                    {/* Admin authenticated links */}
                    {adminAuth ? (
                        <>
                            <li className="navbar-links-1">
                                <Link to="/admin" className="nav-link">
                                    Admin Panel
                                </Link>
                            </li>
                            <li className="navbar-links-1">
                                <Link to="/register_player" className="nav-link">
                                    Register Player
                                </Link>
                            </li>
                            <li className="navbar-links-1">
                                <Link to="/register_team" className="nav-link">
                                    Register Team
                                </Link>
                            </li>
                            <li className="navbar-links-1 game">
                                <Link to="/add_game">
                                    <img src={addGame} alt='Enroll in Game' className='game'/>
                                </Link>
                            </li>
                            <li className="navbar-links-1">
                                <button className='logout-button' onClick={handleAdminLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : userAuth ? (
                        <>
                            <li className="navbar-links-1">
                                <Link to="/user-register-team" className="nav-link register-team-link">
                                    Register Team
                                </Link>
                            </li>
                            <li className="navbar-links-1">
                                <button className='logout-button' onClick={handleUserLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="navbar-links-1">
                                <button className='login-button' onClick={handleUserLogin}>
                                    Login
                                </button>
                            </li>
                            <li className="navbar-links-1">
                                <Link to="/user_register" className="nav-button">
                                    Register
                                </Link>
                            </li>
                            <li className="navbar-links-1">
                                <button className='admin-button' onClick={handleAdminLogin}>
                                    Admin
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </>
    )
}
export default NavBar