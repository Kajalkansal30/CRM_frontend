// import { useContext } from 'react';
// import { AuthContext } from '../contexts/AuthContext';

// const useAuth = () => {
//   const { user, loading, error, handleLoginCallback, logout } = useContext(AuthContext);
//   return { user, loading, error, handleLoginCallback, logout };
// };

// export default useAuth;

// hooks/useAuth.js
// hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const useAuth = () => {
  const { user, loading, error, handleLoginCallback, logout } = useContext(AuthContext);
  return { user, loading, error, handleLoginCallback, logout };
};

export default useAuth;

