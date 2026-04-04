import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

/**
 * MeshNetworkContext — Decentralized Navigation & State Architecture
 * 
 * Philosophy: No single point of failure. Each module is an autonomous "edge node"
 * that can communicate directly with related modules via "pulses" (P2P handshakes).
 * 
 * Key Concepts:
 * - Constellation: The map of all nodes and their relationships
 * - Pulse: A direct message from one node to another
 * - Glow Portal: Contextual navigation suggestion based on current activity
 * - Edge State: Local-first state that syncs opportunistically
 */

const MeshNetworkContext = createContext(null);

// ─── Module Constellation Definition ───
// Each node has: id, label, color, category, connections (related nodes), icon
export const CONSTELLATION_NODES = {
  // Practice Cluster
  breathing: { 
    id: 'breathing', label: 'Breathwork', color: '#2DD4BF', category: 'practice',
    path: '/breathing', connections: ['meditation', 'journal', 'mood', 'yoga'],
    glowTriggers: ['session_complete', 'stress_detected'],
  },
  meditation: { 
    id: 'meditation', label: 'Meditation', color: '#D8B4FE', category: 'practice',
    path: '/meditation', connections: ['breathing', 'journal', 'soundscapes', 'frequencies'],
    glowTriggers: ['session_complete', 'morning_routine'],
  },
  yoga: { 
    id: 'yoga', label: 'Yoga', color: '#FB923C', category: 'practice',
    path: '/yoga', connections: ['breathing', 'exercises', 'mudras'],
    glowTriggers: ['session_complete', 'morning_routine'],
  },
  exercises: { 
    id: 'exercises', label: 'Qigong', color: '#FB923C', category: 'practice',
    path: '/exercises', connections: ['yoga', 'breathing', 'mudras'],
    glowTriggers: ['session_complete'],
  },
  mudras: { 
    id: 'mudras', label: 'Mudras', color: '#FDA4AF', category: 'practice',
    path: '/mudras', connections: ['meditation', 'yoga', 'mantras'],
    glowTriggers: ['practice_suggested'],
  },
  mantras: { 
    id: 'mantras', label: 'Mantras', color: '#FB923C', category: 'practice',
    path: '/mantras', connections: ['meditation', 'mudras', 'affirmations'],
    glowTriggers: ['morning_routine', 'meditation_end'],
  },
  affirmations: { 
    id: 'affirmations', label: 'Affirmations', color: '#93C5FD', category: 'practice',
    path: '/affirmations', connections: ['mantras', 'journal', 'mood'],
    glowTriggers: ['morning_routine', 'mood_low'],
  },

  // Divination Cluster
  oracle: { 
    id: 'oracle', label: 'Oracle', color: '#E879F9', category: 'divination',
    path: '/oracle', connections: ['star-chart', 'journal', 'numerology', 'dreams'],
    glowTriggers: ['question_asked', 'daily_draw'],
  },
  'star-chart': { 
    id: 'star-chart', label: 'Star Chart', color: '#E879F9', category: 'divination',
    path: '/star-chart', connections: ['oracle', 'forecasts', 'cosmic-profile', 'numerology'],
    glowTriggers: ['celestial_event', 'birth_time_entered'],
  },
  numerology: { 
    id: 'numerology', label: 'Numerology', color: '#E879F9', category: 'divination',
    path: '/numerology', connections: ['oracle', 'star-chart', 'cosmic-profile'],
    glowTriggers: ['profile_incomplete'],
  },
  dreams: { 
    id: 'dreams', label: 'Dreams', color: '#E879F9', category: 'divination',
    path: '/dreams', connections: ['oracle', 'journal', 'sleep'],
    glowTriggers: ['morning_routine', 'dream_logged'],
  },
  forecasts: { 
    id: 'forecasts', label: 'Forecasts', color: '#E879F9', category: 'divination',
    path: '/forecasts', connections: ['star-chart', 'cosmic-calendar', 'oracle'],
    glowTriggers: ['week_start', 'transit_detected'],
  },
  'cosmic-profile': { 
    id: 'cosmic-profile', label: 'Cosmic Profile', color: '#E879F9', category: 'divination',
    path: '/cosmic-profile', connections: ['star-chart', 'numerology'],
    glowTriggers: ['profile_incomplete'],
  },

  // Sanctuary Cluster
  journal: { 
    id: 'journal', label: 'Journal', color: '#86EFAC', category: 'sanctuary',
    path: '/journal', connections: ['mood', 'dreams', 'meditation', 'oracle', 'breathing'],
    glowTriggers: ['session_complete', 'insight_generated', 'dream_fresh'],
  },
  mood: { 
    id: 'mood', label: 'Mood', color: '#F87171', category: 'sanctuary',
    path: '/mood', connections: ['journal', 'breathing', 'affirmations', 'soundscapes'],
    glowTriggers: ['check_in_due', 'session_complete'],
  },
  soundscapes: { 
    id: 'soundscapes', label: 'Soundscapes', color: '#3B82F6', category: 'sanctuary',
    path: '/soundscapes', connections: ['meditation', 'frequencies', 'zen-garden'],
    glowTriggers: ['focus_mode', 'sleep_time'],
  },
  frequencies: { 
    id: 'frequencies', label: 'Frequencies', color: '#8B5CF6', category: 'sanctuary',
    path: '/frequencies', connections: ['soundscapes', 'meditation', 'light-therapy'],
    glowTriggers: ['healing_requested', 'focus_mode'],
  },
  'zen-garden': { 
    id: 'zen-garden', label: 'Zen Garden', color: '#22C55E', category: 'sanctuary',
    path: '/zen-garden', connections: ['soundscapes', 'meditation'],
    glowTriggers: ['stress_detected', 'break_needed'],
  },
  'light-therapy': { 
    id: 'light-therapy', label: 'Light Therapy', color: '#A855F7', category: 'sanctuary',
    path: '/light-therapy', connections: ['frequencies', 'mood'],
    glowTriggers: ['seasonal_adjustment', 'energy_low'],
  },

  // Explore Cluster
  coach: { 
    id: 'coach', label: 'Sage AI', color: '#38BDF8', category: 'explore',
    path: '/coach', connections: ['oracle', 'journal', 'sovereigns'],
    glowTriggers: ['question_asked', 'guidance_needed'],
  },
  sovereigns: { 
    id: 'sovereigns', label: 'Sovereign Council', color: '#C084FC', category: 'explore',
    path: '/sovereigns', connections: ['coach', 'oracle', 'challenges'],
    glowTriggers: ['council_available', 'session_booked'],
  },
  challenges: { 
    id: 'challenges', label: 'Challenges', color: '#FB923C', category: 'explore',
    path: '/challenges', connections: ['journal', 'community', 'streak'],
    glowTriggers: ['challenge_active', 'new_challenge'],
  },
  community: { 
    id: 'community', label: 'Community', color: '#FDA4AF', category: 'explore',
    path: '/community', connections: ['challenges', 'blessings'],
    glowTriggers: ['new_message', 'event_starting'],
  },
  blessings: { 
    id: 'blessings', label: 'Blessings', color: '#2DD4BF', category: 'explore',
    path: '/blessings', connections: ['community', 'journal'],
    glowTriggers: ['blessing_received', 'gratitude_practice'],
  },

  // Today Cluster
  'daily-briefing': { 
    id: 'daily-briefing', label: 'Daily Briefing', color: '#FCD34D', category: 'today',
    path: '/daily-briefing', connections: ['daily-ritual', 'cosmic-calendar', 'forecasts'],
    glowTriggers: ['morning_routine', 'day_start'],
  },
  'daily-ritual': { 
    id: 'daily-ritual', label: 'My Ritual', color: '#FCD34D', category: 'today',
    path: '/daily-ritual', connections: ['daily-briefing', 'meditation', 'breathing'],
    glowTriggers: ['ritual_time', 'morning_routine'],
  },
  'cosmic-calendar': { 
    id: 'cosmic-calendar', label: 'Calendar', color: '#FCD34D', category: 'today',
    path: '/cosmic-calendar', connections: ['daily-briefing', 'forecasts', 'star-chart'],
    glowTriggers: ['event_upcoming', 'moon_phase'],
  },
};

// ─── Category Colors ───
export const CATEGORY_COLORS = {
  practice: '#2DD4BF',
  divination: '#E879F9',
  sanctuary: '#86EFAC',
  explore: '#38BDF8',
  today: '#FCD34D',
};

// ─── Pulse Types ───
export const PULSE_TYPES = {
  SESSION_COMPLETE: 'session_complete',
  INSIGHT_GENERATED: 'insight_generated',
  MOOD_CHANGED: 'mood_changed',
  QUESTION_ASKED: 'question_asked',
  NAVIGATE_SUGGEST: 'navigate_suggest',
  STATE_SYNC: 'state_sync',
  HANDSHAKE: 'handshake',
};

export function MeshNetworkProvider({ children }) {
  // Current location in the constellation
  const [currentNode, setCurrentNode] = useState(null);
  
  // Active glow portals (contextual navigation suggestions)
  const [glowPortals, setGlowPortals] = useState([]);
  
  // Pulse message queue (P2P communication between modules)
  const [pulseQueue, setPulseQueue] = useState([]);
  
  // Edge state cache (local-first state per module)
  const [edgeStates, setEdgeStates] = useState({});
  
  // Navigation history for mesh traversal
  const [meshHistory, setMeshHistory] = useState([]);
  
  // Universal command overlay visibility
  const [commandOverlayOpen, setCommandOverlayOpen] = useState(false);
  
  // Pulse listeners (modules subscribe to receive pulses)
  const pulseListenersRef = useRef({});

  // ─── Register current node based on route ───
  const registerNode = useCallback((nodeId) => {
    if (CONSTELLATION_NODES[nodeId]) {
      setCurrentNode(nodeId);
      setMeshHistory(prev => {
        const newHistory = [...prev, nodeId].slice(-20); // Keep last 20
        return newHistory;
      });
    }
  }, []);

  // ─── Send a pulse to connected nodes ───
  const sendPulse = useCallback((type, payload, targetNodes = null) => {
    const node = CONSTELLATION_NODES[currentNode];
    if (!node) return;
    
    const targets = targetNodes || node.connections;
    const pulse = {
      id: `pulse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: currentNode,
      type,
      payload,
      timestamp: Date.now(),
      targets,
    };
    
    setPulseQueue(prev => [...prev, pulse]);
    
    // Notify listeners
    targets.forEach(targetId => {
      const listeners = pulseListenersRef.current[targetId] || [];
      listeners.forEach(listener => listener(pulse));
    });
    
    return pulse.id;
  }, [currentNode]);

  // ─── Subscribe to pulses for a specific node ───
  const subscribeToPulses = useCallback((nodeId, callback) => {
    if (!pulseListenersRef.current[nodeId]) {
      pulseListenersRef.current[nodeId] = [];
    }
    pulseListenersRef.current[nodeId].push(callback);
    
    // Return unsubscribe function
    return () => {
      pulseListenersRef.current[nodeId] = 
        pulseListenersRef.current[nodeId].filter(cb => cb !== callback);
    };
  }, []);

  // ─── Trigger a glow portal ───
  const triggerGlow = useCallback((trigger, sourceNode = currentNode) => {
    const node = CONSTELLATION_NODES[sourceNode];
    if (!node) return;
    
    // Find connected nodes that respond to this trigger
    const glowTargets = node.connections
      .map(connId => CONSTELLATION_NODES[connId])
      .filter(conn => conn?.glowTriggers?.includes(trigger))
      .slice(0, 3); // Max 3 glow portals at once
    
    if (glowTargets.length > 0) {
      setGlowPortals(glowTargets.map(target => ({
        id: target.id,
        label: target.label,
        color: target.color,
        path: target.path,
        trigger,
        timestamp: Date.now(),
      })));
      
      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setGlowPortals(prev => prev.filter(p => Date.now() - p.timestamp < 8000));
      }, 8000);
    }
  }, [currentNode]);

  // ─── Dismiss a glow portal ───
  const dismissGlow = useCallback((portalId) => {
    setGlowPortals(prev => prev.filter(p => p.id !== portalId));
  }, []);

  // ─── Get connected nodes for current position ───
  const getConnections = useCallback(() => {
    const node = CONSTELLATION_NODES[currentNode];
    if (!node) return [];
    return node.connections.map(id => CONSTELLATION_NODES[id]).filter(Boolean);
  }, [currentNode]);

  // ─── Get all nodes in a category ───
  const getCluster = useCallback((category) => {
    return Object.values(CONSTELLATION_NODES).filter(n => n.category === category);
  }, []);

  // ─── Store edge state (local-first) ───
  const setEdgeState = useCallback((nodeId, state) => {
    setEdgeStates(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], ...state, _lastUpdated: Date.now() },
    }));
    
    // Persist to IndexedDB for offline support
    try {
      const stored = JSON.parse(localStorage.getItem('mesh_edge_states') || '{}');
      stored[nodeId] = { ...stored[nodeId], ...state, _lastUpdated: Date.now() };
      localStorage.setItem('mesh_edge_states', JSON.stringify(stored));
    } catch (e) {
      console.warn('Edge state persistence failed:', e);
    }
  }, []);

  // ─── Get edge state ───
  const getEdgeState = useCallback((nodeId) => {
    return edgeStates[nodeId] || {};
  }, [edgeStates]);

  // ─── Load persisted edge states on mount ───
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mesh_edge_states') || '{}');
      setEdgeStates(stored);
    } catch (e) {
      console.warn('Failed to load edge states:', e);
    }
  }, []);

  // ─── Keyboard shortcut for command overlay ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K for command overlay
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOverlayOpen(prev => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && commandOverlayOpen) {
        setCommandOverlayOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandOverlayOpen]);

  const value = {
    // State
    currentNode,
    glowPortals,
    pulseQueue,
    edgeStates,
    meshHistory,
    commandOverlayOpen,
    
    // Actions
    registerNode,
    sendPulse,
    subscribeToPulses,
    triggerGlow,
    dismissGlow,
    getConnections,
    getCluster,
    setEdgeState,
    getEdgeState,
    setCommandOverlayOpen,
    
    // Constants
    CONSTELLATION_NODES,
    CATEGORY_COLORS,
    PULSE_TYPES,
  };

  return (
    <MeshNetworkContext.Provider value={value}>
      {children}
    </MeshNetworkContext.Provider>
  );
}

export function useMeshNetwork() {
  const ctx = useContext(MeshNetworkContext);
  if (!ctx) {
    throw new Error('useMeshNetwork must be used within MeshNetworkProvider');
  }
  return ctx;
}

export default MeshNetworkContext;
