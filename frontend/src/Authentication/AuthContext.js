import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure we have all required fields
      if (parsed && parsed.id && parsed.role) {
        return parsed;
      }
    }
    return null;
  });

  const login = (userData) => {
    // Ensure we have all required fields
    if (!userData || !userData.id || !userData.role) {
      console.error('Invalid user data received:', userData);
      return;
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}