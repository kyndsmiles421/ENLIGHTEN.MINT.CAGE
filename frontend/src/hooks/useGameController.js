import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Distortion rules — mapped from Nexus harmony score
// These match the 5-Rule Visual Distortion System from Dream Realms
function computeDistortions(harmonyScore) {
  const h = harmonyScore ?? 50;
  return {
    blur: Math.max(0, (100 - h) / 25),           // 0-4px blur, worst at 0 harmony
    tintOpacity: Math.max(0, (100 - h) / 200),    // 0-0.5 tint overlay
    glitchIntensity: h < 30 ? (30 - h) / 30 : 0,  // only below 30 harmony
    grainOpacity: Math.max(0.01, (100 - h) / 500), // subtle grain
    pulseSpeed: 3 + (100 - h) / 20,                // faster pulse at low harmony
    saturation: 0.7 + (h / 200),                    // 0.7-1.2 saturation
  };
}

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(0);

  // Fetch both Nexus state and Game Core stats
  const fetchState = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 5000) return; // debounce 5s
    lastFetchRef.current = now;

    try {
      const [nexusRes, coreRes] = await Promise.all([
        axios.get(`${API}/nexus/state`, { headers }),
        axios.get(`${API}/game-core/stats`, { headers }),
      ]);
      setNexusState(nexusRes.data);
      setCoreStats(coreRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load game state');
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchState(true); }, [fetchState]);

  // Computed distortions from harmony score
  const distortions = useMemo(
    () => computeDistortions(nexusState?.harmony_score),
    [nexusState?.harmony_score]
  );

  // CSS variables for element-aware theming
  const elementCSS = useMemo(() => buildElementCSS(nexusState), [nexusState]);

  // Dominant element (for biome selection)
  const dominantElement = useMemo(() => {
    if (!nexusState?.elements) return 'earth';
    let max = 0, dom = 'earth';
    for (const [eid, el] of Object.entries(nexusState.elements)) {
      const pct = el.percentage ?? 20;
      if (pct > max) { max = pct; dom = eid; }
    }
    return dom;
  }, [nexusState]);

  // Deficient element (what needs feeding)
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
    try {
      const res = await axios.post(`${API}/game-core/commit-reward`, {
        module_id: moduleId,
        ...rewardData,
      }, { headers });

      // Refresh state after reward commit
      await fetchState(true);
      return res.data;
    } catch (err) {
      throw err;
    }
  }, [headers, moduleId, fetchState]);

  // Container style that applies harmony-driven distortions
  const containerStyle = useMemo(() => ({
    ...elementCSS,
    filter: distortions.blur > 0.5 ? `blur(${distortions.blur * 0.3}px) saturate(${distortions.saturation})` : `saturate(${distortions.saturation})`,
    transition: 'filter 2s ease',
  }), [elementCSS, distortions]);

  return {
    // State
    nexusState,
    coreStats,
    loading,
    error,
    // Computed
    distortions,
    elementCSS,
    dominantElement,
    deficientElement,
    harmonyScore: nexusState?.harmony_score ?? 50,
    // Style
    containerStyle,
    // Actions
    commitReward,
    refreshState: () => fetchState(true),
  };
}
