import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const ClassContext = createContext({
  activeClass: null,
  classData: null,
  xp: 0,
  level: 1,
  loading: false,
  selectClass: () => {},
  addXP: () => {},
  isBoosted: () => false,
});

export const CLASS_COLORS = {
  shaman: '#C084FC',
  nomad: '#2DD4BF',
  architect: '#FBBF24',
  merchant: '#F59E0B',
};

export function ClassProvider({ children }) {
  const { token, authHeaders } = useAuth();
  const [activeClass, setActiveClass] = useState(null);
  const [classData, setClassData] = useState(null);
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setActiveClass(null); setClassData(null); return; }
    fetch(`${API}/api/classes/mine`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        setActiveClass(d.class_id);
        setClassData(d.class_data);
        setXP(d.xp || 0);
        setLevel(d.level || 1);
      })
      .catch(() => {});
  }, [token, authHeaders]);

  const selectClass = useCallback(async (classId) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/classes/select`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId }),
      });
      const data = await res.json();
      setActiveClass(data.class_id);
      setClassData(data.class_data);
    } catch {}
    setLoading(false);
  }, [token, authHeaders]);

  const addXP = useCallback(async (amount) => {
    if (!token || !activeClass) return;
    try {
      const res = await fetch(`${API}/api/classes/xp`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      setXP(data.xp);
      setLevel(data.level);
    } catch {}
  }, [token, authHeaders, activeClass]);

  // Check if an affinity is boosted by the active class
  const isBoosted = useCallback((affinity) => {
    if (!classData?.boosted_affinities) return false;
    return classData.boosted_affinities.includes(affinity);
  }, [classData]);

  const contextValue = useMemo(() => ({
    activeClass, classData, xp, level, loading, selectClass, addXP, isBoosted
  }), [activeClass, classData, xp, level, loading, selectClass, addXP, isBoosted]);

  return (
    <ClassContext.Provider value={contextValue}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClass() {
  return useContext(ClassContext);
}
