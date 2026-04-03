import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const TreasuryContext = createContext({
  balance: 0,
  loading: false,
  refreshBalance: () => {},
  purchaseConstellation: () => {},
});

export function TreasuryProvider({ children }) {
  const { token, authHeaders } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/treasury/balance`, { headers: authHeaders });
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch {}
  }, [token, authHeaders]);

  useEffect(() => { refreshBalance(); }, [refreshBalance]);

  const purchaseConstellation = useCallback(async (constellationId) => {
    if (!token) return null;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/treasury/purchase`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ constellation_id: constellationId }),
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.new_balance);
        return data;
      }
      return { error: data.detail || 'Purchase failed' };
    } catch {
      return { error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  return (
    <TreasuryContext.Provider value={{ balance, loading, refreshBalance, purchaseConstellation }}>
      {children}
    </TreasuryContext.Provider>
  );
}

export function useTreasury() {
  return useContext(TreasuryContext);
}
