import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Lightweight activity tracker hook.
 * Drop into any component to auto-track page visits.
 * Also exposes `trackAction` for explicit interaction tracking.
 */
export function useActivityTracker() {
  const { token } = useAuth();
  const location = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    if (!token) return;
    const page = location.pathname;
    if (page === lastTracked.current || page === '/auth') return;
    lastTracked.current = page;

    // Fire-and-forget — no await, no error handling needed
    axios.post(`${API}/activity/track`, {
      page,
      action: 'visit',
      label: document.title || page.replace(/\//g, ' ').trim(),
    }, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [location.pathname, token]);

  const trackAction = (page, action, label) => {
    if (!token) return;
    axios.post(`${API}/activity/track`, { page, action, label }, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  return { trackAction };
}
