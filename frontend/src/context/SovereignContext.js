import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SovereignContext = createContext(null);
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━ Pub/Sub Event Bus with Priority Channels ━━━
class EventBus {
  constructor() { this.listeners = {}; }
  subscribe(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
    return () => { this.listeners[event] = this.listeners[event].filter(fn => fn !== cb); };
  }
  publish(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
    (this.listeners['*'] || []).forEach(cb => cb({ event, data }));
  }
}

const eventBus = new EventBus();

// ━━━ Priority Levels — The Nexus Path ━━━
// Priority 1 (critical)  : Master Orchestrator, UI thread responses — zero latency
// Priority 2 (experience): Audio/Binaural processing, AI generation — high fidelity
// Priority 3 (background): Asset export (PDF/WAV), GPS, project saves — throttled
const PRIORITY = { critical: 0, experience: 1, background: 2 };
const PRIORITY_LABELS = { 0: 'Nexus Path', 1: 'Sensory Stream', 2: 'Background Orbit' };
const CONCURRENCY_LIMITS = { 0: 3, 1: 2, 2: 1 };
const FRAME_BUDGET_MS = 12; // stay under 16ms frame budget

export function SovereignProvider({ children }) {
  const { authHeaders, token, authLoading, user } = useAuth();
  const [tier, setTier] = useState('standard');
  const [tierName, setTierName] = useState('Standard');
  const [codename, setCodename] = useState('The Seed');
  const [capabilities, setCapabilities] = useState({});
  const [activeUnits, setActiveUnits] = useState([]);
  const [aiBrain, setAiBrain] = useState('Single-Node Logic');
  const [experience, setExperience] = useState({});
  const [perks, setPerks] = useState([]);
  const [credits, setCredits] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Mastery multipliers — fed into physics engine
  const [masteryTier, setMasteryTier] = useState(0);
  const [gravityMultiplier, setGravityMultiplier] = useState(1.0);
  const [bloomMultiplier, setBloomMultiplier] = useState(1.0);

  // Priority Queue state
  const queueRef = useRef([]);           // sorted task array
  const activeCountRef = useRef({ 0: 0, 1: 0, 2: 0 }); // concurrency per priority
  const npuBurstRef = useRef(false);     // backpressure flag
  const queueStatsRef = useRef({ enqueued: 0, completed: 0, errors: 0 });

  const refresh = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const res = await axios.get(`${API}/sovereign/status`, { headers: authHeaders });
      const d = res.data;
      setTier(d.tier);
      setTierName(d.tier_name);
      setCodename(d.codename);
      setCapabilities(d.effective_capabilities || {});
      setActiveUnits(d.active_units || []);
      setAiBrain(d.ai_brain);
      setExperience(d.experience || {});
      setPerks(d.perks || []);
      eventBus.publish('tier_updated', { tier: d.tier, capabilities: d.effective_capabilities });
    } catch {}
    // Fetch mastery multipliers (non-blocking)
    try {
      const mRes = await axios.get(`${API}/sovereign-mastery/status`, { headers: authHeaders });
      const m = mRes.data;
      setMasteryTier(m.current_tier || 0);
      setGravityMultiplier(m.gravity_multiplier || 1.0);
      setBloomMultiplier(m.bloom_multiplier || 1.0);
      eventBus.publish('mastery_updated', {
        tier: m.current_tier, gravity: m.gravity_multiplier, bloom: m.bloom_multiplier,
      });
    } catch {}
    setLoaded(true);
  }, [authHeaders, authLoading, token]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const unsub1 = eventBus.subscribe('purchase_complete', () => refresh());
    const unsub2 = eventBus.subscribe('subscription_upgraded', () => refresh());
    return () => { unsub1(); unsub2(); };
  }, [refresh]);

  const hasCapability = useCallback((key) => {
    return capabilities[key] === true || (typeof capabilities[key] === 'number' && capabilities[key] > 0);
  }, [capabilities]);

  const isTierAtLeast = useCallback((requiredTier) => {
    const order = ['standard', 'apprentice', 'artisan', 'sovereign'];
    return order.indexOf(tier) >= order.indexOf(requiredTier);
  }, [tier]);

  // Command Mode — context-aware Master Orchestrator (Priority 1)
  const executeCommand = useCallback(async (command, context = 'general', pageData = {}) => {
    if (!hasCapability('thinking_feed')) {
      return { error: 'Command Mode requires Glass Box access' };
    }
    try {
      const res = await axios.post(`${API}/sovereign/command`, {
        command, context, page_data: pageData,
      }, { headers: authHeaders });
      eventBus.publish('command_executed', { context, command, result: res.data });
      return res.data;
    } catch (e) {
      return { error: e.response?.data?.detail || 'Command failed' };
    }
  }, [authHeaders, hasCapability]);

  // ━━━ Priority Queue with Backpressure ━━━
  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) return;

    // During NPU burst, only process critical tasks
    const allowedPriority = npuBurstRef.current ? 0 : 2;

    for (let p = 0; p <= allowedPriority; p++) {
      const limit = CONCURRENCY_LIMITS[p];
      const active = activeCountRef.current[p];
      if (active >= limit) continue;

      const idx = queueRef.current.findIndex(t => t.priority === p);
      if (idx === -1) continue;

      const task = queueRef.current.splice(idx, 1)[0];
      activeCountRef.current[p]++;

      const run = async () => {
        try {
          if (task.execute) await task.execute();
          queueStatsRef.current.completed++;
          eventBus.publish('task_complete', {
            id: task.id, priority: task.priority, label: task.label,
            channel: PRIORITY_LABELS[task.priority],
          });
        } catch (e) {
          queueStatsRef.current.errors++;
          eventBus.publish('task_error', { id: task.id, error: e.message, label: task.label });
        } finally {
          activeCountRef.current[task.priority]--;
          // Schedule next processing in idle time
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => processQueue(), { timeout: 100 });
          } else {
            setTimeout(processQueue, 50);
          }
        }
      };

      // Critical tasks run immediately, others yield to frame budget
      if (p === 0) {
        run();
      } else {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback((deadline) => {
            if (deadline.timeRemaining() > FRAME_BUDGET_MS) run();
            else setTimeout(run, 16); // yield one frame
          }, { timeout: p === 1 ? 200 : 1000 });
        } else {
          setTimeout(run, p === 1 ? 16 : 100);
        }
      }
    }
  }, []);

  const enqueue = useCallback((task, priority = 'background') => {
    const p = PRIORITY[priority] ?? 2;
    const entry = {
      ...task,
      priority: p,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      enqueued_at: Date.now(),
    };
    queueRef.current.push(entry);
    queueRef.current.sort((a, b) => a.priority - b.priority || a.enqueued_at - b.enqueued_at);
    queueStatsRef.current.enqueued++;
    eventBus.publish('task_enqueued', {
      id: entry.id, priority: p, label: task.label,
      channel: PRIORITY_LABELS[p],
      queue_depth: queueRef.current.length,
    });
    processQueue();
    return entry.id;
  }, [processQueue]);

  // NPU Burst mode — throttle background tasks during intensive processing
  const setNpuBurst = useCallback((active) => {
    npuBurstRef.current = active;
    eventBus.publish('npu_burst', { active, timestamp: Date.now() });
    if (!active) processQueue(); // resume background tasks
  }, [processQueue]);

  const getQueueStats = useCallback(() => ({
    ...queueStatsRef.current,
    pending: queueRef.current.length,
    active: Object.values(activeCountRef.current).reduce((a, b) => a + b, 0),
    npu_burst: npuBurstRef.current,
  }), []);

  // Publish event to backend (Priority 3 — background)
  const publishEvent = useCallback(async (eventType, payload = {}) => {
    eventBus.publish(eventType, payload);
    try {
      await axios.post(`${API}/sovereign/events/publish`, {
        event_type: eventType, payload, source_tier: tier,
      }, { headers: authHeaders });
    } catch {}
  }, [authHeaders, tier]);

  // GATEKEEPER: Memoize context value
  const value = useMemo(() => ({
    tier, tierName, codename, capabilities, activeUnits,
    aiBrain, experience, perks, credits, loaded,
    hasCapability, isTierAtLeast, refresh,
    executeCommand, enqueue, setNpuBurst, getQueueStats,
    publishEvent, eventBus,
    masteryTier, gravityMultiplier, bloomMultiplier,
  }), [
    tier, tierName, codename, capabilities, activeUnits,
    aiBrain, experience, perks, credits, loaded,
    hasCapability, isTierAtLeast, refresh,
    executeCommand, enqueue, setNpuBurst, getQueueStats,
    publishEvent, masteryTier, gravityMultiplier, bloomMultiplier,
  ]);

  return (
    <SovereignContext.Provider value={value}>
      {children}
    </SovereignContext.Provider>
  );
}

export function useSovereign() {
  const ctx = useContext(SovereignContext);
  if (!ctx) throw new Error('useSovereign must be inside SovereignProvider');
  return ctx;
}

export { eventBus };
