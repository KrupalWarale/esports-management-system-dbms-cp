import React from 'react'
import { Outlet, Navigate } from "react-router-dom";

/**
 * UserValidation component
 * 
 * This component serves as a route guard to protect admin-only routes.
 * It checks if the user is logged in by looking for a LoginData item in localStorage.
 * If the user is logged in, it allows access to the child routes.
 * If not, it redirects to the login page.
 */
const UserValidation = () => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("LoginData");
    
    // Redirect to login if not authenticated, otherwise render child routes
    return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

export default UserValidation