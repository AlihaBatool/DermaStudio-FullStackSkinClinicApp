// src/utils/auth.js
// Simple auth utilities using localStorage

export const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
  };
  
  export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  };
  
  export const isLoggedIn = () => {
    return localStorage.getItem('isLoggedIn') === 'true';
  };
  
  export const getUser = () => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  };
  
  export const updateUser = (userData) => {
    const currentUser = getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };