// // // contexts/AuthContext.js
// // import React, { createContext, useState, useEffect } from 'react';
// // import axios from '../api/axios'; // Updated import to use configured axios instance

// // export const AuthContext = createContext();

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       loadUser();
// //     } else {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const loadUser = async () => {
// //     try {
// //       const token = localStorage.getItem('token');
// //       if (!token) {
// //         setLoading(false);
// //         return;
// //       }

// //       const config = {
// //         headers: {
// //           'x-auth-token': token
// //         }
// //       };

// //       const res = await axios.get('/auth/user', config);
// //       setUser(res.data);
// //       setError(null);
// //     } catch (err) {
// //       localStorage.removeItem('token');
// //       setError('Authentication error. Please login again.');
// //       setUser(null);
// //     }
// //     setLoading(false);
// //   };

// //   const handleLoginCallback = (token) => {
// //     console.log('handleLoginCallback called with token:', token);
// //     localStorage.setItem('token', token);
// //     loadUser();
// //   };

// //   const logout = () => {
// //     localStorage.removeItem('token');
// //     setUser(null);
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, loading, error, handleLoginCallback, logout }}>
// //       {loading ? <div>Loading...</div> : children}
// //     </AuthContext.Provider>
// //   );
// // };

// // contexts/AuthContext.js
// import React, { createContext, useState, useEffect } from 'react';
// import axios from '../api/axios';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       loadUser(token);
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const loadUser = async (token) => {
//     try {
//       const config = {
//         headers: {
//           'x-auth-token': token,
//         },
//       };
//       const res = await axios.get('/auth/user', config);
//       setUser(res.data);
//       setError(null);
//     } catch (err) {
//       console.error('User loading failed:', err);
//       logout();
//       setError('Authentication error. Please login again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLoginCallback = (token) => {
//     console.log('Login callback received token:', token);
//     localStorage.setItem('token', token);
//     loadUser(token);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, error, handleLoginCallback, logout }}
//     >
//       {loading ? <div>Loading...</div> : children}
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
    localStorage.setItem('token', token);
    await loadUser(token);
  };

  // Logout functionality
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  };

  // Load user info from backend
  const loadUser = async (token) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/user', {
        headers: {
          'x-auth-token': token,
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
