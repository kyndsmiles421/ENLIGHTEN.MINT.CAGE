import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Map app routes to energy gate realm names
const ROUTE_TO_REALM = {
  '/starseed': 'starseed_journey',
  '/starseed-adventure': 'starseed_journey',
  '/starseed-realm': 'starseed_journey',
  '/starseed-worlds': 'starseed_journey',
  '/refinement-lab': 'refinement_lab',
  '/cosmic-mixer': 'cosmic_mixer',
  '/soundscapes': 'cosmic_mixer',
  '/dream-realms': 'dream_realms',
  '/trade-circle': 'trade_circle',
  '/planetary-depths': 'dream_realms',
  '/quantum-field': 'starseed_journey',
};

// Gate-specific narrative messages
const GATE_NARRATIVES = {
  gate_earth: {
    title: 'The Earth Gate trembles...',
    message: 'You have gathered enough power to pass through the Gate of Earth. 396 Hz calls to you.',
    color: '#D97706',
  },
  gate_water: {
    title: 'The Waters stir...',
    message: 'The Gate of Flow senses your presence. Your offerings and trades have opened the way.',
    color: '#F472B6',
  },
  gate_fire: {
    title: 'Flames dance at the threshold...',
    message: 'The Gate of Transmutation awaits. 528 Hz — the Love frequency beckons your mastery.',
    color: '#94A3B8',
  },
  gate_air: {
    title: 'Whispers from beyond the veil...',
    message: 'The Gate of the Unseen recognizes your intuition. The threads of consciousness are visible to you now.',
    color: '#8B5CF6',
  },
  gate_ether: {
    title: 'The cosmos holds its breath...',
    message: 'The Gate of Pure Source awaits its final traveler. You are ready to become the source itself.',
    color: '#FBBF24',
  },
};

const CACHE_KEY = 'cosmic_gate_status';
const CHECK_INTERVAL = 60000; // 60 seconds

export function useGateNotifications() {
  const { authHeaders, user } = useAuth();
  const location = useLocation();
  const lastCheckRef = useRef(0);
  const hasInitRef = useRef(false);

  // Record travel when visiting mapped routes
  useEffect(() => {
    if (!user || !authHeaders?.Authorization) return;

    const realm = ROUTE_TO_REALM[location.pathname];
    if (!realm) return;

    axios.post(`${API}/energy-gates/travel`, { realm }, { headers: authHeaders }).catch(() => {});
  }, [location.pathname, user, authHeaders]);

  // Check gate readiness
  const checkGates = useCallback(async () => {
    if (!user || !authHeaders?.Authorization) return;

    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL && hasInitRef.current) return;
    lastCheckRef.current = now;

    try {
      const res = await axios.get(`${API}/energy-gates/status`, { headers: authHeaders });
      const gates = res.data.gates || [];

      // Get cached state
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const cachedCanUnlock = cached.canUnlock || {};

      // Find newly unlockable gates
      const newlyReady = {};
      gates.forEach(g => {
        newlyReady[g.id] = g.can_unlock;
      });

      // Only notify after first init (skip initial load)
      if (hasInitRef.current) {
        gates.forEach(g => {
          if (g.can_unlock && !cachedCanUnlock[g.id] && !g.unlocked) {
            const narrative = GATE_NARRATIVES[g.id];
            if (narrative) {
              toast(narrative.title, {
                description: narrative.message,
                duration: 8000,
                style: {
                  background: 'rgba(10, 10, 18, 0.95)',
                  border: `1px solid ${narrative.color}40`,
                  color: '#F8FAFC',
                  boxShadow: `0 0 30px ${narrative.color}20, 0 8px 32px rgba(0,0,0,0.5)`,
                },
                action: {
                  label: 'Open Gates',
                  onClick: () => {
                    window.location.href = '/trade-circle';
                  },
                },
              });
            }
          }
        });
      }

      // Cache current state
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        canUnlock: newlyReady,
        timestamp: now,
      }));

      hasInitRef.current = true;
    } catch {
      // Silent fail — non-critical feature
    }
  }, [user, authHeaders]);

  // Check on route changes
  useEffect(() => {
    checkGates();
  }, [location.pathname, checkGates]);

  // Periodic check
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkGates, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [user, checkGates]);
}
