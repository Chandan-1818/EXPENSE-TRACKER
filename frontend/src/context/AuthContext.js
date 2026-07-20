import React, { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple auth checks
    if (hasCheckedAuth.current) {
      return;
    }
    
    hasCheckedAuth.current = true;
    
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.data);
    hasCheckedAuth.current = false; // Allow re-auth check after login
    return res.data.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Silent fail - logout anyway
    }
    setUser(null);
    hasCheckedAuth.current = false;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    setUser(res.data.data);
    hasCheckedAuth.current = false; // Allow re-auth check after register
    return res.data.data;
  }, []);

  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    loading
  }), [user, login, logout, register, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
