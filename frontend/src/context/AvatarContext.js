import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const AvatarContext = createContext({
  avatarB64: null,
  avatarStyle: null,
  refreshAvatar: () => {},
  worldProgress: {},
  visitRoom: () => {},
  totalRoomsVisited: 0,
  worldCompletionPct: 0,
});

// All spatial routes that count toward world completion
const ALL_SPATIAL_ROUTES = [
  '/breathing', '/meditation', '/yoga', '/mudras', '/mantras',
  '/light-therapy', '/affirmations', '/daily-ritual', '/mood',
  '/oracle', '/akashic-records', '/star-chart', '/numerology',
  '/dreams', '/mayan', '/cosmic-calendar', '/cardology',
  '/animal-totems', '/zen-garden', '/soundscapes', '/music-lounge',
  '/frequencies', '/journal', '/wisdom-journal', '/green-journal',
  '/nourishment', '/aromatherapy', '/herbology', '/elixirs',
  '/acupressure', '/reiki', '/meal-planning', '/wellness-reports',
  '/encyclopedia', '/reading-list', '/creation-stories', '/teachings',
  '/community', '/blessings', '/sacred-texts', '/coach', '/crystals',
  '/daily-briefing', '/forecasts', '/sovereign-circle', '/sovereigns',
  '/economy', '/academy', '/cosmic-profile', '/games', '/starseed',
  '/exercises', '/hooponopono', '/tantra', '/yantra', '/botany',
  '/rituals', '/challenges', '/friends', '/analytics',
];

export function AvatarProvider({ children }) {
  const { user, authHeaders } = useAuth();
  const [avatarB64, setAvatarB64] = useState(null);
  const [avatarStyle, setAvatarStyle] = useState(null);
  const [worldProgress, setWorldProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('emcafe_world_progress');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const refreshAvatar = useCallback(async () => {
    if (!user) { setAvatarB64(null); return; }
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/ai-visuals/my-avatar`,
        { headers: authHeaders }
      );
      if (res.data.status === 'active' && res.data.image_b64) {
        setAvatarB64(res.data.image_b64);
        setAvatarStyle(res.data.style || null);
      } else {
        setAvatarB64(null);
      }
    } catch {
      setAvatarB64(null);
    }
  }, [user, authHeaders]);

  // Visit a room — track exploration
  const visitRoom = useCallback((route) => {
    setWorldProgress(prev => {
      if (prev[route]) return prev;
      const next = { ...prev, [route]: Date.now() };
      try { localStorage.setItem('emcafe_world_progress', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => { refreshAvatar(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalRoomsVisited = Object.keys(worldProgress).length;
  const worldCompletionPct = Math.round((totalRoomsVisited / ALL_SPATIAL_ROUTES.length) * 100);

  const value = useMemo(() => ({
    avatarB64, avatarStyle, refreshAvatar,
    worldProgress, visitRoom, totalRoomsVisited, worldCompletionPct,
  }), [avatarB64, avatarStyle, refreshAvatar, worldProgress, visitRoom, totalRoomsVisited, worldCompletionPct]);

  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() { return useContext(AvatarContext); }
