// pages/LoginPage.js
import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from '../api/axios';

const LoginPage = () => {
  const { user, handleLoginCallback } = useAuth();
  const navigate = useNavigate();

  // Success callback for Google login
  const handleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;

      // Send token to backend for verification and user creation
      const res = await axios.post('/auth/google', { token: credential });

      // Backend returns app token and user data
      const { token: appToken, user: userData } = res.data;

      // Save app token and update user context
      localStorage.setItem('token', appToken);
      handleLoginCallback(appToken);

      // Optionally, you can set user data in context if handleLoginCallback supports it
      // For now, user context will be updated on token set

    } catch (error) {
      console.error('Backend Google auth error:', error);
    }
  };

  // Error callback for Google login
  const handleError = () => {
    console.error('Google Login Failed');
  };

  // Navigate to dashboard when user is set
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Mini CRM Platform
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Sign in to access your customer data and campaigns
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin 
              onSuccess={handleSuccess} 
              onError={handleError} 
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
