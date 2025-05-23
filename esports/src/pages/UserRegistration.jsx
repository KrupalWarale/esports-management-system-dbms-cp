import React, { useState } from 'react'
import api from '../api'
import '../css/LoginPage.css'
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    // Validate form inputs
    const { email, password, confirmPassword, name } = formData;
    
    if (!email || !password || !confirmPassword || !name) {
      return toast.error("Please fill in all fields");
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email address");
    }
    
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    try {
      // Register the user
      const response = await api.post("/register_user", {
        email,
        password,
        name,
        role: 'user' // Regular user role
      });
      
      if (response.data && response.data.success) {
        toast.success("Registration successful! Please log in.", {
          autoClose: 2000,
          onClose: () => navigate('/user_login')
        });
      } else {
        toast.error(response.data?.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Error during registration. Please try again.");
    }
  };
  
  return (
    <div className='login-main-container'>
      <div className='login-form-container'>
        <h1>User Registration</h1>
        <form className='login-form'>
          <input
            className='login-form-insides'
            name='name'
            placeholder='Full Name'
            type='text'
            value={formData.name}
            onChange={handleChange}
          />
          <input
            className='login-form-insides'
            name='email'
            placeholder='Email Address'
            type='email'
            value={formData.email}
            onChange={handleChange}
          />
          <input
            className='login-form-insides'
            type='password'
            placeholder='Password'
            name='password'
            value={formData.password}
            onChange={handleChange}
          />
          <input
            className='login-form-insides'
            type='password'
            placeholder='Confirm Password'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button type='button' className='login-form-button' onClick={handleSubmit}>Register</button>
          
          <div className="form-footer">
            Already have an account? <Link to="/user_login" className="form-link">Login</Link>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default UserRegistration; 