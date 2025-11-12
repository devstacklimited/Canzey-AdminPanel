import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    console.log('UserProvider: Loading user from localStorage...');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('UserProvider: User loaded successfully:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('UserProvider: No token or user data found');
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Merge profile_data into user object for easier access
    if (userData.profile_data) {
      try {
        const profileData = typeof userData.profile_data === 'string' 
          ? JSON.parse(userData.profile_data) 
          : userData.profile_data;
        userData = { ...userData, ...profileData };
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to sign-in page
    window.location.href = '/signin';
  };

  const updateUser = (userData) => {
    // Merge JSON fields into user object for easier access
    if (userData.profile_data) {
      try {
        const profileData = typeof userData.profile_data === 'string' 
          ? JSON.parse(userData.profile_data) 
          : userData.profile_data;
        userData = { ...userData, ...profileData };
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }
    
    if (userData.social_links) {
      try {
        const socialLinks = typeof userData.social_links === 'string' 
          ? JSON.parse(userData.social_links) 
          : userData.social_links;
        userData = { ...userData, social_links: socialLinks };
      } catch (error) {
        console.error('Error parsing social links:', error);
      }
    }
    
    if (userData.preferences) {
      try {
        const preferences = typeof userData.preferences === 'string' 
          ? JSON.parse(userData.preferences) 
          : userData.preferences;
        userData = { ...userData, preferences: preferences };
      } catch (error) {
        console.error('Error parsing preferences:', error);
      }
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
