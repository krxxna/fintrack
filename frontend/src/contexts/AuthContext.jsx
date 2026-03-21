import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('ft_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // ── Save/clear token & user in localStorage
  const persist = (token, userData) => {
    localStorage.setItem('ft_token', token);
    localStorage.setItem('ft_user', JSON.stringify(userData));
    setUser(userData);
  };
  const clear = () => {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    setUser(null);
  };

  // ── Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('ft_token');
    if (!token) return;
    authAPI.me()
      .then(res => setUser(res.data.user))
      .catch(() => clear());
  }, []);

  // ── Login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      persist(res.data.token, res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Signup
  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.signup({ name, email, password });
      persist(res.data.token, res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Demo login (no real API call)
  const demoLogin = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const demoUser = { id: 'demo', name: 'Alex Morgan', email: 'alex@fintrack.app', currency: 'USD' };
    localStorage.setItem('ft_token', 'demo-token');
    localStorage.setItem('ft_user',  JSON.stringify(demoUser));
    setUser(demoUser);
    setLoading(false);
    return demoUser;
  }, []);

  // ── Logout
  const logout = useCallback(() => clear(), []);

  // ── Update profile
  const updateProfile = useCallback(async (data) => {
    const res = await authAPI.update(data);
    const updated = res.data.user;
    localStorage.setItem('ft_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  const isDemo = user?.id === 'demo';

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, demoLogin, logout, updateProfile, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
}
