import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const TreasuryContext = createContext({
  balance: 0,
  dust: 0,
  gems: 0,
  loading: false,
  refreshBalance: () => {},
  purchaseConstellation: () => {},
  refreshHubWallet: () => {},
  earnDust: () => {},
  transmute: () => {},
});

export function TreasuryProvider({ children }) {
  const { token, authHeaders } = useAuth();
  // V68.29 Hydration-Race Fix: guest_token is a sentinel, not a real auth
  const hasAuth = !!(token && token !== 'guest_token');
  const [balance, setBalance] = useState(0);
  const [dust, setDust] = useState(0);
  const [gems, setGems] = useState(0);
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!hasAuth) return;
    try {
      const res = await fetch(`${API}/api/treasury/balance`, { headers: authHeaders });
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch {}
  }, [hasAuth, authHeaders]);

  const refreshHubWallet = useCallback(async () => {
    if (!hasAuth) return;
    try {
      const res = await fetch(`${API}/api/bank/wallet`, { headers: authHeaders });
      const data = await res.json();
      setDust(data.dust || 0);
      setGems(data.gems || 0);
      setHubData(data);
    } catch {}
  }, [token, authHeaders]);

  useEffect(() => {
    refreshBalance();
    refreshHubWallet();
  }, [refreshBalance, refreshHubWallet]);

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

  const earnDust = useCallback(async (action) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/bank/earn`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setDust(data.dust_balance || 0);
        setGems(data.gems_balance || 0);
        return data;
      }
    } catch {}
  }, [token, authHeaders]);

  const transmute = useCallback(async (dustAmount) => {
    if (!token) return null;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/broker/transmute`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dust_amount: dustAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setDust(data.dust_balance || 0);
        setGems(data.gems_balance || 0);
        return data;
      }
      return { error: data.detail || 'Transmutation failed' };
    } catch {
      return { error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  const contextValue = useMemo(() => ({
    balance, dust, gems, hubData, loading,
    refreshBalance, purchaseConstellation,
    refreshHubWallet, earnDust, transmute,
  }), [balance, dust, gems, hubData, loading, refreshBalance, purchaseConstellation, refreshHubWallet, earnDust, transmute]);

  return (
    <TreasuryContext.Provider value={contextValue}>
      {children}
    </TreasuryContext.Provider>
  );
}

export function useTreasury() {
  return useContext(TreasuryContext);
}
