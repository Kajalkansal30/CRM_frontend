import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

const MinimalGoogleLoginTest = () => {
  const handleSuccess = (credentialResponse) => {
    console.log('Google login success:', credentialResponse);
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ margin: '50px' }}>
        <h2>Minimal Google Login Test</h2>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
    </GoogleOAuthProvider>
  );
};

export default MinimalGoogleLoginTest;
