import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLoginCallback } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      handleLoginCallback(token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [location, navigate, handleLoginCallback]);

  return (
    <div>
      <h2>Authenticating...</h2>
    </div>
  );
};

export default AuthCallbackPage;
