import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('UserLoginData');
        if (userData) {
          const userObject = JSON.parse(userData);
          
          // Check if user data exists
          if (userObject && userObject.email && userObject.token) {
            setIsAuth(true);
            setLoading(false);
            return;
          }
        }
        
        // If we reach here, user is not authenticated
        setIsAuth(false);
        setLoading(false);
        toast.error('You must be logged in to access this page');
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuth(false);
        setLoading(false);
        toast.error('Authentication error. Please login again.');
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuth ? <Outlet /> : <Navigate to="/user_login" />;
};

export default UserAuth; 