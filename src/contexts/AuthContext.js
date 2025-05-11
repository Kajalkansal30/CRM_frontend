// import React, { createContext, useState, useEffect } from 'react';

// // Create the AuthContext
// export const AuthContext = createContext();

// // AuthProvider component to provide auth state to the rest of the app
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);  // Stores the authenticated user
//   const [loading, setLoading] = useState(true);  // To track loading state
//   const [error, setError] = useState(null);  // To track any errors during auth

//   // handleLoginCallback: Handle user login
//   const handleLoginCallback = async (token) => {
//     console.log('Token received from login:', token); 
//     localStorage.setItem('token', token);
//     await loadUser(token);
//   };

//   // Logout functionality
//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//     setLoading(false);
//   };

//   // Load user info from backend
//   const loadUser = async (token) => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/auth/user', {
//         headers: {
//         'Authorization': `Bearer ${token}`, // Use the token in the Authorization header
//       },
//       });
//       if (!response.ok) {
//         throw new Error('Failed to load user');
//       }
//       const userData = await response.json();
//       setUser(userData);
//       setError(null);
//     } catch (error) {
//       console.error('Error loading user:', error);
//       logout();
//       setError('Authentication error. Please login again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load token from localStorage and set user on initial load
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       loadUser(token);
//     } else {
//       setLoading(false);  // Stop loading if no token
//     }
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, error, handleLoginCallback, logout }}>
//       {loading ? <div>Loading...</div> : children}  {/* Display loading if true */}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component to provide auth state to the rest of the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Stores the authenticated user
  const [loading, setLoading] = useState(true);  // To track loading state
  const [error, setError] = useState(null);  // To track any errors during auth

  // handleLoginCallback: Handle user login
  const handleLoginCallback = async (token) => {
    console.log('Token received from login:', token); 
    localStorage.setItem('token', token);
    await loadUser(token);
  };

  // Logout functionality
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  };

  // Decode JWT token to handle expiration (if applicable)
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Treat invalid token as expired
    }
  };

  // Load user info from backend
  const loadUser = async (token) => {
    try {
      if (isTokenExpired(token)) {
        throw new Error('Token expired');
      }

      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Use the token in the Authorization header
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load user');
      }
      const userData = await response.json();
      setUser(userData);
      setError(null);
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
      setError('Authentication error. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  // Load token from localStorage and set user on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);  // Stop loading if no token
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, handleLoginCallback, logout }}>
      {loading ? <div>Loading...</div> : children}  {/* Display loading if true */}
    </AuthContext.Provider>
  );
};
