/**
 * SovereignUniverseContext.js — V68.4 Phase D: "The Sovereign Guide"
 *
 * THE UNIFYING KERNEL (window.SovereignUniverse)
 * ─────────────────────────────────────────────────────────────────
 * One global observer that binds all 27 workshops, the Observatory,
 * Dream Realms, and the Spark Wallet into a single organism.
 *
 * What it does:
 *  • Holds a single source of truth for: sparkData, activeQuest, quests, cards
 *  • Exposes `checkQuestLogic(signal, location)` for any module to call
 *    when the user identifies a material, dives to a depth, or activates a zone
 *  • Auto-advances quest steps by POSTing to /api/quests/auto_detect
 *  • Re-hydrates Spark Wallet globally via `refreshGlobalUI()`
 *  • Keeps a legacy vanilla `window.SovereignUniverse` reference for any
 *    plain JS/HTML dialog that wants to fire signals without React imports.
 *  • Broadcasts a `sovereign:update` CustomEvent so non-React listeners react.
 *
 * Respects the Metabolic Seal: no eager imports, no heavy deps.
 * Respects the Flatland Rule: zero UI, pure state.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SovereignUniverseContext = createContext(null);

export function SovereignUniverseProvider({ children }) {
  const { user } = useAuth();
  const [sparkData, setSparkData] = useState(null);
  const [quests, setQuests] = useState([]);
  const [activeQuest, setActiveQuest] = useState(null);
  const [lastSignal, setLastSignal] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const getToken = () => {
    const t = localStorage.getItem('zen_token');
    return (t && t !== 'guest_token') ? t : null;
  };

  // ─── Core: Refresh global UI (wallet + quests) ───
  const refreshGlobalUI = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const [w, q] = await Promise.all([
        axios.get(`${API}/sparks/wallet`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        axios.get(`${API}/quests/available`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      ]);
      if (!mountedRef.current) return;
      if (w?.data) setSparkData(w.data);
      if (q?.data?.quests) {
        setQuests(q.data.quests);
        // Active quest = first incomplete quest with at least one step started,
        // else first incomplete quest overall
        const started = q.data.quests.find(qu => !qu.completed && qu.steps.some(s => s.done));
        const first = q.data.quests.find(qu => !qu.completed);
        setActiveQuest(started || first || null);
      }
      // Broadcast to any vanilla listeners
      window.dispatchEvent(new CustomEvent('sovereign:update', {
        detail: { sparks: w?.data?.sparks, quests: q?.data?.quests },
      }));
    } catch {}
  }, []);

  // ─── Auto-detect quest advancement ───
  // Any module calls this when something meaningful happens.
  // signal example: "geology:material:quartz", "observatory:decode"
  const checkQuestLogic = useCallback(async (signal, location = null, extra = {}) => {
    if (!signal) return null;
    setLastSignal({ signal, location, at: Date.now() });
    const token = getToken();
    if (!token) return null;
    try {
      const { data } = await axios.post(
        `${API}/quests/auto_detect`,
        { signal, location, extra },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.advanced?.length) {
        // Queue a cinematic-lite toast for each advancement
        const toasts = data.advanced.map(a => ({
          id: `${a.quest_id}-${a.step_id}-${Date.now()}`,
          quest_id: a.quest_id,
          quest_name: a.quest_name,
          step_id: a.step_id,
          step_action: a.step_action,
          color: a.color,
          quest_complete: a.quest_complete,
          reward_sparks: a.reward_sparks || 0,
          reward_card: a.reward_card || null,
        }));
        setToastQueue(prev => [...prev, ...toasts]);
        // Refresh to sync sparks / new cards
        refreshGlobalUI();
      }
      return data;
    } catch {
      return null;
    }
  }, [refreshGlobalUI]);

  const awardSpark = useCallback(async (action, context = null) => {
    const token = getToken();
    if (!token) return null;
    try {
      const { data } = await axios.post(
        `${API}/sparks/earn`,
        { action, context },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.earned > 0) refreshGlobalUI();
      return data;
    } catch { return null; }
  }, [refreshGlobalUI]);

  const dismissToast = useCallback((id) => {
    setToastQueue(prev => prev.filter(t => t.id !== id));
  }, []);

  const hasCard = useCallback((cardId) => {
    if (!sparkData?.cards_earned) return false;
    return sparkData.cards_earned.some(c => c.id === cardId);
  }, [sparkData]);

  // ─── Initial load + reload on auth change ───
  useEffect(() => {
    if (user) refreshGlobalUI();
  }, [user, refreshGlobalUI]);

  // ─── Expose a vanilla JS bridge on window ───
  useEffect(() => {
    window.SovereignUniverse = {
      version: '68.4',
      get sparks() { return sparkData?.sparks ?? 0; },
      get cards() { return sparkData?.cards_earned ?? []; },
      get activeQuest() { return activeQuest; },
      get quests() { return quests; },
      checkQuestLogic,
      refreshGlobalUI,
      awardSpark,
      hasCard,
    };
    return () => {
      try { delete window.SovereignUniverse; } catch { window.SovereignUniverse = undefined; }
    };
  }, [sparkData, activeQuest, quests, checkQuestLogic, refreshGlobalUI, awardSpark, hasCard]);

  const value = {
    sparkData,
    quests,
    activeQuest,
    lastSignal,
    toastQueue,
    checkQuestLogic,
    refreshGlobalUI,
    awardSpark,
    hasCard,
    dismissToast,
  };

  return (
    <SovereignUniverseContext.Provider value={value}>
      {children}
    </SovereignUniverseContext.Provider>
  );
}

export function useSovereignUniverse() {
  const ctx = useContext(SovereignUniverseContext);
  if (!ctx) {
    // Return a no-op shape so isolated components never crash
    return {
      sparkData: null, quests: [], activeQuest: null, lastSignal: null, toastQueue: [],
      checkQuestLogic: async () => null,
      refreshGlobalUI: async () => {},
      awardSpark: async () => null,
      hasCard: () => false,
      dismissToast: () => {},
    };
  }
  return ctx;
}
