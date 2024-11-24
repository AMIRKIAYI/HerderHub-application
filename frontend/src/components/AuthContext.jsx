import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleLogout, handleLoginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};

// Validate props with PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
