import React, { useEffect, useState } from 'react'
import api from '../api'
import '../css/LoginPage.css'
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    const auth = localStorage.getItem("UserLoginData");
    if (auth) {
      navigate('/team_info');
    }
  }, [navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/user_login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('UserLoginData', JSON.stringify({
          email: response.data.email,
          name: response.data.name,
          token: response.data.token,
          id: response.data.id
        }));
        
        toast.success('Login successful!');
        
        // Dispatch custom event to notify Navbar of login
        window.dispatchEvent(new CustomEvent('userLoginStatusChanged', { 
          detail: { isLoggedIn: true } 
        }));
        
        // Redirect to team_info instead of user_dashboard
        setTimeout(() => {
          navigate('/team_info');
        }, 1000);
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Error logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className='login-main-container'>
      <div className='login-form-container'>
        <h1>User Login</h1>
        <form className='login-form'>
          <input
            className='login-form-insides'
            name='email'
            placeholder='Email Address'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className='login-form-insides'
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type='button' 
            className='login-form-button' 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="form-footer">
            Don't have an account? <Link to="/user_register" className="form-link">Register</Link>
          </div>
          
          <div className="form-footer admin-link">
            <Link to="/login" className="form-link">Admin Login</Link>
          </div>
        </form>
        
      </div>
    </div>
  )
}

export default UserLogin; 