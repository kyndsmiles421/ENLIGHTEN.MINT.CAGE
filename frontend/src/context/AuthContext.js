import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AuthProvider({ children }) {
  // GUEST MODE: Auto-login as guest if no token
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('zen_user');
    if (savedUser) return JSON.parse(savedUser);
    // Default guest user
    return {
      id: 'guest',
      name: 'Cosmic Traveler',
      email: 'guest@enlightenment.cafe',
      tier: 'free'
    };
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('zen_token') || 'guest_token';
  });
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('zen_token');
    localStorage.removeItem('zen_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Skip API call for guest token - just use default guest user
    if (token === 'guest_token') {
      setLoading(false);
      return;
    }
    if (token) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setUser(res.data);
          localStorage.setItem('zen_user', JSON.stringify(res.data));
        })
        .catch(() => {
          // On auth failure, fall back to guest mode instead of logging out
          setUser({
            id: 'guest',
            name: 'Cosmic Traveler',
            email: 'guest@enlightenment.cafe',
            tier: 'free'
          });
          setToken('guest_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem('zen_token', res.data.token);
    localStorage.setItem('zen_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, password });
    localStorage.setItem('zen_token', res.data.token);
    localStorage.setItem('zen_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // GATEKEEPER: Memoize authHeaders to prevent object recreation on every render
  // This is THE ROOT CAUSE of the "Maximum update depth exceeded" cascade
  const authHeaders = useMemo(() => 
    token ? { Authorization: `Bearer ${token}` } : {},
    [token]
  );

  // GATEKEEPER: Memoize the entire context value
  const value = useMemo(() => ({
    user, token, loading, login, register, logout, authHeaders
  }), [user, token, loading, login, register, logout, authHeaders]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
