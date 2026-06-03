import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);   // { id, name, email, role }
  const [token, setToken]   = useState(() => localStorage.getItem('crm_token'));
  const [loading, setLoading] = useState(true);

  // On mount — verify stored token
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.me()
      .then(u => setUser(u))
      .catch(() => { localStorage.removeItem('crm_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, []);  // eslint-disable-line

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('crm_token', data.access_token);
    setToken(data.access_token);
    setUser({ name: data.name, email: data.email, role: data.role });
    return data.role;  // so caller can redirect based on role
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.register({ name, email, password });
    localStorage.setItem('crm_token', data.access_token);
    setToken(data.access_token);
    setUser({ name: data.name, email: data.email, role: data.role });
    return data.role;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
