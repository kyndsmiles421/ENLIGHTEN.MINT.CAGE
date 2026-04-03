import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SovereignContext = createContext(null);
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━ Pub/Sub Event Bus ━━━
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

// ━━━ Priority Queue ━━━
const PRIORITY_LEVELS = { critical: 0, experience: 1, background: 2 };

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
  const priorityQueueRef = useRef([]);
  const processingRef = useRef(false);

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
    setLoaded(true);
  }, [authHeaders, authLoading, token]);

  useEffect(() => { refresh(); }, [refresh]);

  // Listen for tier-changing events
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

  // Command Mode — context-aware Master Orchestrator
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

  // Priority Queue Processing
  const enqueue = useCallback((task, priority = 'background') => {
    priorityQueueRef.current.push({ ...task, priority: PRIORITY_LEVELS[priority] || 2, id: Date.now() });
    priorityQueueRef.current.sort((a, b) => a.priority - b.priority);
    processQueue();
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current || priorityQueueRef.current.length === 0) return;
    processingRef.current = true;
    const task = priorityQueueRef.current.shift();
    try {
      if (task.execute) await task.execute();
      eventBus.publish('task_complete', { id: task.id, priority: task.priority });
    } catch (e) {
      eventBus.publish('task_error', { id: task.id, error: e.message });
    }
    processingRef.current = false;
    if (priorityQueueRef.current.length > 0) setTimeout(processQueue, 50);
  }, []);

  // Publish event to backend
  const publishEvent = useCallback(async (eventType, payload = {}) => {
    eventBus.publish(eventType, payload);
    try {
      await axios.post(`${API}/sovereign/events/publish`, {
        event_type: eventType, payload, source_tier: tier,
      }, { headers: authHeaders });
    } catch {}
  }, [authHeaders, tier]);

  const value = {
    tier, tierName, codename, capabilities, activeUnits,
    aiBrain, experience, perks, credits, loaded,
    hasCapability, isTierAtLeast, refresh,
    executeCommand, enqueue, publishEvent, eventBus,
  };

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
