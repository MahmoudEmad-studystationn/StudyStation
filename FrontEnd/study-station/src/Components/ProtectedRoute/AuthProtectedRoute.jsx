import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AuthProtectedRoute({ children }) {
    const context = useContext(AuthContext);
    if (!context) return null;

    const { isLoggedIn, loading } = context;

    if (loading) return null; 

    return !isLoggedIn ? children : <Navigate to="/home" />;
}