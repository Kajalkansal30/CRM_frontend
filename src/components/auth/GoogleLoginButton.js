// import React, { useContext } from 'react';
// import { GoogleLogin } from '@react-oauth/google';
// import axios from '../../api/axios';
// import { AuthContext } from '../../contexts/AuthContext';

// const GoogleLoginButton = () => {
//   const { handleLoginCallback } = useContext(AuthContext);

//   console.log('Rendering GoogleLoginButton');

//   const handleSuccess = async (credentialResponse) => {
//     console.log('Google login success:', credentialResponse);
//     try {
//       const response = await axios.post('/auth/google', {
//         token: credentialResponse.credential,
//       });

//       console.log('Backend response:', response.data);

//       const { token } = response.data;

//       handleLoginCallback(token);
//     } catch (error) {
//       console.error('Google login failed:', error);
//     }
//   };

//   const handleError = () => {
//     console.error('Google login failed');
//   };

//   return (
//     <GoogleLogin
//       onSuccess={handleSuccess}
//       onError={handleError}
//     />
//   );
// };

// export default GoogleLoginButton;


import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const GoogleLoginButton = () => {
  const { handleLoginCallback } = useContext(AuthContext);

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('No credential found in Google response');
      return;
    }

    try {
      const response = await axios.post('/auth/google', {
        token: credentialResponse.credential,
      });

      const { token } = response.data;
      if (token) {
        handleLoginCallback(token);
      } else {
        console.error('Token not returned from backend');
      }
    } catch (error) {
      console.error('Error during backend login:', error.response?.data || error.message);
    }
  };

  const handleError = () => {
    console.error('Google login error');
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap
    />
  );
};

export default GoogleLoginButton;
