/**
 * JourneyContext.js — V68.6 Sovereign Journey tracker
 *
 * Listens to route changes app-wide. Maintains the last 5 UNIQUE paths
 * the user has visited (excluding the Hub itself, auth, and brief stops).
 * Persists to localStorage so the trail survives refreshes.
 */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const JourneyContext = createContext(null);

const STORAGE_KEY = 'sovereign_journey_trail';
const MAX_TRAIL = 5;

// Paths we don't want cluttering the trail
const SKIP_PATHS = new Set([
  '/', '/auth', '/login', '/signup', '/landing',
  '/sovereign-hub', // the Hub is where the trail lives, don't echo it
]);
// Prefixes to skip
const SKIP_PREFIXES = ['/admin', '/legal', '/support'];

function shouldSkip(path) {
  if (SKIP_PATHS.has(path)) return true;
  for (const p of SKIP_PREFIXES) if (path.startsWith(p)) return true;
  return false;
}

function loadTrail() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-MAX_TRAIL) : [];
  } catch { return []; }
}

function saveTrail(trail) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trail)); } catch {}
}

export function SovereignJourneyProvider({ children }) {
  const location = useLocation();
  const [trail, setTrail] = useState(() => loadTrail());
  const lastPathRef = useRef(null);
  const enteredAtRef = useRef(Date.now());

  const recordStay = useCallback((path) => {
    // When user LEAVES a path, update minute counter of that trail entry
    const minutes = Math.round((Date.now() - enteredAtRef.current) / 60000);
    if (minutes > 0 && path) {
      setTrail(prev => {
        const next = prev.map(e => e.path === path ? { ...e, minutes: (e.minutes || 0) + minutes } : e);
        saveTrail(next);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    const path = location.pathname;
    // Close out the previous entry's stay duration
    if (lastPathRef.current && lastPathRef.current !== path) {
      recordStay(lastPathRef.current);
    }
    if (shouldSkip(path)) {
      lastPathRef.current = path;
      enteredAtRef.current = Date.now();
      return;
    }
    // Add new entry — dedupe consecutive repeats and push to back
    setTrail(prev => {
      const filtered = prev.filter(e => e.path !== path);
      const next = [...filtered, { path, enteredAt: Date.now(), minutes: 0 }].slice(-MAX_TRAIL);
      saveTrail(next);
      return next;
    });
    lastPathRef.current = path;
    enteredAtRef.current = Date.now();
  }, [location.pathname, recordStay]);

  const clearTrail = useCallback(() => {
    saveTrail([]);
    setTrail([]);
  }, []);

  return (
    <JourneyContext.Provider value={{ trail, clearTrail }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useSovereignJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) return { trail: [], clearTrail: () => {} };
  return ctx;
}
