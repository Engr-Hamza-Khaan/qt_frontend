import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.auth.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const userData = await api.auth.login(email, password);
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
