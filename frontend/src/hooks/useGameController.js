import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Build CSS variable overrides from Nexus element state
function buildElementCSS(nexusData) {
  if (!nexusData?.elements) return {};
  const vars = {};
  for (const [eid, el] of Object.entries(nexusData.elements)) {
    const pct = el.percentage ?? 20;
    const intensity = Math.min(1, pct / 30);
    vars[`--game-el-${eid}`] = el.color || '#888';
    vars[`--game-el-${eid}-intensity`] = intensity.toFixed(2);
    vars[`--game-el-${eid}-glow`] = `${el.color || '#888'}${Math.round(intensity * 40).toString(16).padStart(2, '0')}`;
  }
  vars['--game-harmony'] = (nexusData.harmony_score ?? 50) / 100;
  return vars;
}

export default function useGameController(moduleId) {
  const { authHeaders } = useAuth();
  const headers = authHeaders;
  const [nexusState, setNexusState] = useState(null);
  const [coreStats, setCoreStats] = useState(null);
  const [scenarioState, setScenarioState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(0);

  // Fetch Nexus state, Game Core stats, and Scenario state (The Brain)
  const fetchState = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 5000) return;
    lastFetchRef.current = now;

    try {
      const [nexusRes, coreRes, scenarioRes] = await Promise.all([
        axios.get(`${API}/nexus/state`, { headers }),
        axios.get(`${API}/game-core/stats`, { headers }),
        axios.get(`${API}/dream-realms/scenario-state`, { headers }).catch(() => ({ data: null })),
      ]);
      setNexusState(nexusRes.data);
      setCoreStats(coreRes.data);
      setScenarioState(scenarioRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load game state');
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchState(true); }, [fetchState]);

  // CSS variables for element-aware theming
  const elementCSS = useMemo(() => buildElementCSS(nexusState), [nexusState]);

  // Dominant element (highest percentage)
  const dominantElement = useMemo(() => {
    if (!nexusState?.elements) return 'earth';
    let max = 0, dom = 'earth';
    for (const [eid, el] of Object.entries(nexusState.elements)) {
      const pct = el.percentage ?? 20;
      if (pct > max) { max = pct; dom = eid; }
    }
    return dom;
  }, [nexusState]);

  // Dominant element percentage
  const dominantPercentage = useMemo(() => {
    if (!nexusState?.elements) return 20;
    let max = 0;
    for (const [, el] of Object.entries(nexusState.elements)) {
      const pct = el.percentage ?? 20;
      if (pct > max) max = pct;
    }
    return max;
  }, [nexusState]);

  // Deficient element (lowest percentage)
  const deficientElement = useMemo(() => {
    if (!nexusState?.elements) return null;
    let min = 100, def = null;
    for (const [eid, el] of Object.entries(nexusState.elements)) {
      const pct = el.percentage ?? 20;
      if (pct < min) { min = pct; def = eid; }
    }
    return def;
  }, [nexusState]);

  // The Soul-to-Game Bridge: commit a game reward to the Core
  const commitReward = useCallback(async (rewardData) => {
    const res = await axios.post(`${API}/game-core/commit-reward`, {
      module_id: moduleId,
      ...rewardData,
    }, { headers });
    await fetchState(true);
    return res.data;
  }, [headers, moduleId, fetchState]);

  const EL_COLORS = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };

  return {
    // State
    nexusState,
    coreStats,
    loading,
    error,
    // Computed from Nexus
    dominantElement,
    dominantPercentage,
    deficientElement,
    harmonyScore: nexusState?.harmony_score ?? 50,
    harmonyCycle: nexusState?.harmony_cycle || 'neutral',
    decayActivity: nexusState?.decay_activity || null,
    elements: nexusState?.elements || {},
    elementCSS,
    // Layer system
    activeLayer: coreStats?.layer?.active_layer || 'terrestrial',
    layerData: coreStats?.layer?.layer || null,
    unlockedLayers: coreStats?.layer?.unlocked_layers || ['terrestrial'],
    allLayers: coreStats?.layer?.all_layers || [],
    // Scenario state (The Brain)
    scenarioState,
    visualDirectives: scenarioState?.visual_directives || null,
    difficulty: scenarioState?.difficulty || null,
    loopActive: scenarioState?.loop_active || false,
    biomeContext: scenarioState?.biome_context || null,
    // Element color helper
    getElementColor: (el) => EL_COLORS[el] || '#A855F7',
    // Actions
    commitReward,
    refreshState: () => fetchState(true),
  };
}
