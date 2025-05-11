import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Authenticated user state
  const [loading, setLoading] = useState(true);  // App loading state
  const [error, setError] = useState(null);  // Error state for authentication-related errors

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);  // Stop loading if no token is found
    }
  }, []);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      return payload.exp * 1000 < Date.now(); // Check expiration
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Treat invalid token as expired
    }
  };

  const loadUser = async (token) => {
    if (isTokenExpired(token)) {
      console.error('Token expired');
      logout();
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
      };
      const res = await axios.get('/auth/user', config);
      setUser(res.data);
      setError(null); // Clear previous errors
    } catch (err) {
      console.error('User loading failed:', err);
      logout();
      setError('Authentication error. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginCallback = (token) => {
    console.log('Login callback received token:', token);
    localStorage.setItem('token', token);
    loadUser(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null); // Clear any authentication-related errors
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, handleLoginCallback, logout }}
    >
      {loading ? <div>Loading...</div> : children}  {/* Show a loading indicator if still loading */}
    </AuthContext.Provider>
  );
};
