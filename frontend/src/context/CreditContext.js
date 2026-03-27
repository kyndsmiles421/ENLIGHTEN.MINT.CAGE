import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CreditContext = createContext(null);
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function CreditProvider({ children }) {
  const { user } = useAuth();
  const [creditInfo, setCreditInfo] = useState(null);

  const fetchCredits = useCallback(async () => {
    if (!user) { setCreditInfo(null); return; }
    const token = localStorage.getItem('zen_token');
    if (!token) return;
    try {
      const res = await fetch(`${API}/subscriptions/my-plan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCreditInfo(data);
      }
    } catch {}
  }, [user]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const useCredits = useCallback(async (action) => {
    const token = localStorage.getItem('zen_token');
    if (!token) return { allowed: false, reason: 'not_authenticated' };

    // Unlimited tiers or admin always pass
    if (creditInfo?.is_admin || (creditInfo?.credits_per_month === -1 && creditInfo?.subscription_active)) {
      try {
        const res = await fetch(`${API}/subscriptions/use-credits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action }),
        });
        const data = await res.json();
        fetchCredits();
        return { allowed: true, ...data };
      } catch {
        return { allowed: true };
      }
    }

    try {
      const res = await fetch(`${API}/subscriptions/use-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      if (res.status === 402) {
        const data = await res.json();
        fetchCredits();
        return { allowed: false, reason: 'insufficient', ...data.detail };
      }
      const data = await res.json();
      fetchCredits();
      return { allowed: true, ...data };
    } catch {
      return { allowed: false, reason: 'error' };
    }
  }, [creditInfo, fetchCredits]);

  return (
    <CreditContext.Provider value={{ creditInfo, fetchCredits, useCredits }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCreditsContext() {
  const ctx = useContext(CreditContext);
  if (!ctx) throw new Error('useCreditsContext must be inside CreditProvider');
  return ctx;
}
