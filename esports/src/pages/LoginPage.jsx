import api from '../api';
import React, { useEffect, useState } from 'react'
import '../css/LoginPage.css'
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    const auth = localStorage.getItem("LoginData");
    if (auth) {
      navigate('/admin');
    }
  }, [navigate]);
  
  async function handleSubmit() {
    if (!email || !password) {
      return toast.error('Enter all details please');
    }
    
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
      return toast.error("Invalid email format");
    }
    
    try {
      const response = await api.post("/login", {
        email, password
      });
      
      if (!response.data.data) {
        return toast.error("Credentials don't match!");
      }
      
      localStorage.setItem("LoginData", response.data.data.email);
      
      // Dispatch a custom event to notify other components of login status change
      window.dispatchEvent(new Event('loginStatusChange'));
      
      toast.success("Login successful!", { 
        autoClose: 1500,
        onClose: () => {
          // Navigate to admin dashboard after toast closes
          navigate('/admin');
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Connection error. Is the backend server running?");
    }
  }
  
  return (
    <div className='login-main-container'>
      <div className='login-form-container'>
        <h1>Admin Login</h1>
        <form className='login-form'>
          <input
            className='login-form-insides'
            name='email'
            placeholder='Email Address'
            type='email'
            onChange={(e) => { setEmail(e.target.value) }}
          />
          <input
            className='login-form-insides'
            type='password'
            placeholder='Password'
            name='password'
            onChange={(e) => { setPassword(e.target.value) }}
          />
          <button type='button' className='login-form-button' onClick={handleSubmit}>Login</button>
          
          <div className="form-footer">
            New user? <Link to="/user_register" className="form-link">Register here</Link>
          </div>
          
          <div className="form-footer">
            Already registered? <Link to="/user_login" className="form-link">User Login</Link>
          </div>
        </form>
        
      </div>
    </div>
  )
}

export default LoginPage
