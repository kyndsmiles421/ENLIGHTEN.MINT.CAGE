import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CosmicStateContext = createContext(null);
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function CosmicStateProvider({ children }) {
  const { authHeaders, token } = useAuth();
  const [cosmicState, setCosmicState] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastFetch = useRef(0);

  const fetchCosmicState = useCallback(async (force = false) => {
    if (!token) return null;
    const now = Date.now();
    // Cache for 60s unless forced
    if (!force && cosmicState && now - lastFetch.current < 60000) return cosmicState;

    setLoading(true);
    try {
      const res = await axios.get(`${API}/cosmic-state`, { headers: authHeaders });
      setCosmicState(res.data);
      lastFetch.current = now;
      return res.data;
    } catch {
      return cosmicState;
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders, cosmicState]);

  return (
    <CosmicStateContext.Provider value={{ cosmicState, loading, fetchCosmicState }}>
      {children}
    </CosmicStateContext.Provider>
  );
}

export function useCosmicState() {
  const ctx = useContext(CosmicStateContext);
  if (!ctx) return { cosmicState: null, loading: false, fetchCosmicState: async () => null };
  return ctx;
}
