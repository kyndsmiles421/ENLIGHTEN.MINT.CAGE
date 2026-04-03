import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const MODALITY_ICONS = {
  architect: 'castle',
  chef: 'flame',
  researcher: 'microscope',
  voyager: 'waves',
};

const ModalityContext = createContext({
  modality: 'architect',
  modalityData: null,
  loading: false,
  switchModality: () => {},
});

export function ModalityProvider({ children }) {
  const { token, authHeaders } = useAuth();
  const [modality, setModality] = useState('architect');
  const [modalityData, setModalityData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/academy/modality`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        setModality(d.modality || 'architect');
        setModalityData(d.modality_data || null);
      })
      .catch(() => {});
  }, [token, authHeaders]);

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

  return (
    <ModalityContext.Provider value={{ modality, modalityData, loading, switchModality, MODALITY_ICONS }}>
      {children}
    </ModalityContext.Provider>
  );
}

export function useModality() {
  return useContext(ModalityContext);
}
