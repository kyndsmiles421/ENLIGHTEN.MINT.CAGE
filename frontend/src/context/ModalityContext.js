import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const ModalityContext = createContext({
  modality: 'architect',
  modalityData: null,
  intensity: 'guided',
  intensityData: null,
  autoAdvance: true,
  learningToggle: false,
  loading: false,
  switchModality: () => {},
  switchIntensity: () => {},
  setAutoAdvance: () => {},
  setLearningToggle: () => {},
  autoScaleCheck: null,
  dismissAutoScale: () => {},
});

export function ModalityProvider({ children }) {
  const { token, authHeaders } = useAuth();
  // V68.29 Hydration-Race Fix: treat 'guest_token' as unauthenticated so we
  // never fire auth-required fetches without a real Bearer token.
  const hasAuth = !!(token && token !== 'guest_token');
  const [modality, setModality] = useState('architect');
  const [modalityData, setModalityData] = useState(null);
  const [intensity, setIntensity] = useState('guided');
  const [intensityData, setIntensityData] = useState(null);
  const [autoAdvance, setAutoAdvanceState] = useState(true);
  const [learningToggle, setLearningToggleState] = useState(false);
  const [autoScaleCheck, setAutoScaleCheck] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch modality on mount
  useEffect(() => {
    if (!hasAuth) return;
    fetch(`${API}/api/academy/modality`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        setModality(d.modality || 'architect');
        setModalityData(d.modality_data || null);
      })
      .catch(() => {});
  }, [token, authHeaders]);

  // Fetch intensity on mount
  useEffect(() => {
    if (!hasAuth) return;
    fetch(`${API}/api/academy/intensity`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        setIntensity(d.intensity || 'guided');
        setIntensityData(d.intensity_data || null);
        setAutoAdvanceState(d.auto_advance !== false);
        setLearningToggleState(d.learning_toggle || false);
      })
      .catch(() => {});
  }, [token, authHeaders]);

  // Check auto-scale periodically (every 60s)
  useEffect(() => {
    if (!hasAuth || !autoAdvance) return;
    const check = () => {
      fetch(`${API}/api/academy/auto-scale`, { headers: authHeaders })
        .then(r => r.json())
        .then(d => {
          if (d.should_advance) setAutoScaleCheck(d);
        })
        .catch(() => {});
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [token, authHeaders, autoAdvance, intensity]);

  const switchModality = useCallback(async (newModality) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/academy/modality`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ modality: newModality }),
      });
      const data = await res.json();
      setModality(data.modality);
      setModalityData(data.modality_data);
    } catch {}
    setLoading(false);
  }, [token, authHeaders]);

  const switchIntensity = useCallback(async (newIntensity) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/academy/intensity`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity: newIntensity }),
      });
      const data = await res.json();
      setIntensity(data.intensity);
      setIntensityData(data.intensity_data);
    } catch {}
    setLoading(false);
  }, [token, authHeaders]);

  const setAutoAdvance = useCallback(async (val) => {
    if (!token) return;
    setAutoAdvanceState(val);
    try {
      await fetch(`${API}/api/academy/intensity`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity, auto_advance: val }),
      });
    } catch {}
  }, [token, authHeaders, intensity]);

  const dismissAutoScale = useCallback(() => {
    setAutoScaleCheck(null);
  }, []);

  const setLearningToggle = useCallback(async (val) => {
    if (!token) return;
    setLearningToggleState(val);
    try {
      await fetch(`${API}/api/academy/intensity`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity, learning_toggle: val }),
      });
    } catch {}
  }, [token, authHeaders, intensity]);

  const contextValue = useMemo(() => ({
    modality, modalityData, intensity, intensityData, autoAdvance,
    learningToggle, loading, switchModality, switchIntensity, setAutoAdvance,
    setLearningToggle, autoScaleCheck, dismissAutoScale,
  }), [
    modality, modalityData, intensity, intensityData, autoAdvance,
    learningToggle, loading, switchModality, switchIntensity, setAutoAdvance,
    setLearningToggle, autoScaleCheck, dismissAutoScale
  ]);

  return (
    <ModalityContext.Provider value={contextValue}>
      {children}
    </ModalityContext.Provider>
  );
}

export function useModality() {
  return useContext(ModalityContext);
}
