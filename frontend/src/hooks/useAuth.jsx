import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('campusiq_token');
      if (token) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('campusiq_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authService.login(username, password);
    localStorage.setItem('campusiq_token', res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('campusiq_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
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
