// src/context/AuthContext.js
// Global authentication state - wraps the entire app
// Any component can call useAuth() to get user info or login/logout

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('cosmica_token'));
  const [loading, setLoading] = useState(true);

  // On first load, try to fetch the user profile using stored token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cosmica_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          setToken(storedToken);
        } catch {
          // Token expired or invalid — clear it
          localStorage.removeItem('cosmica_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Called after successful login or signup
  const login = (accessToken, userData) => {
    localStorage.setItem('cosmica_token', accessToken);
    setToken(accessToken);
    setUser(userData);
  };

  // Called on logout
  const logout = () => {
    localStorage.removeItem('cosmica_token');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, logout, loading, isLoggedIn: !!token };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component: const { user, login, logout } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
