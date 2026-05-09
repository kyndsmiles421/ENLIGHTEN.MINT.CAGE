/**
 * useEngineLoad.js — Cognitive Voltmeter (V68.58 + V68.65)
 *
 * Listens to `sovereign:context-update` and `sovereign:state-shift`
 * events on the global bus and computes a live "engine load" value
 * via a sliding 30-second exponential moving average.
 *
 *   load     ∈ [0..1]   recent activity intensity (velocity)
 *   state    'cold' | 'flow' | 'overheating'
 *   depth    ∈ [0..1]   V68.65 — fraction of the unified Inlay the
 *                       user has illuminated. Polled from
 *                       /api/entity/surface-area every 30s and
 *                       refreshed on every entity discovery event.
 *   viewed   integer    raw count of nodes illuminated
 *   total    integer    total nodes in the Inlay
 *   nextCells [{id,name,...}]  thinnest unexplored cells (for nudges)
 *
 * Thresholds:
 *   cold        load < 0.15
 *   flow        0.15..0.70
 *   overheating load > 0.70
 *
 * Lightweight enough to mount in any panel without measurable cost.
 */
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DECAY_HALF_LIFE_MS = 12_000;
const COLD_LIMIT = 0.15;
const OVERHEAT_LIMIT = 0.70;
const TICK_HZ = 4;
const SURFACE_REFRESH_MS = 30_000;

function classify(load) {
  if (load < COLD_LIMIT) return 'cold';
  if (load > OVERHEAT_LIMIT) return 'overheating';
  return 'flow';
}

export function useEngineLoad() {
  const [load, setLoad] = useState(0);
  const [state, setState] = useState('cold');
  // V68.65 — Density / depth state (Entity Surface Area).
  const [depth, setDepth] = useState(0);
  const [viewed, setViewed] = useState(0);
  const [total, setTotal] = useState(0);
  const [nextCells, setNextCells] = useState([]);

  const loadRef = useRef(0);
  const lastTickRef = useRef(performance.now());

  // V68.65 — surface-area fetcher. Pulls once on mount, refreshes
  // on a slow timer, and refreshes immediately whenever the user
  // discovers a new entity (the /entity/{id} call surfaces a
  // `discovery.is_first_view` flag the InteractiveModule re-fires
  // as `sovereign:entity-discovery`).
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const token = localStorage.getItem('zen_token');
        const headers = token && token !== 'guest_token'
          ? { Authorization: `Bearer ${token}` } : {};
        const r = await axios.get(`${API}/entity/surface-area`, { headers, timeout: 8000 });
        if (cancelled) return;
        const d = r.data || {};
        setTotal(d.total || 0);
        setViewed(d.viewed || 0);
        setDepth(typeof d.ratio === 'number' ? d.ratio : 0);
        setNextCells(d.unexplored_sample || []);
        try { window.__sovereignDepth = { ratio: d.ratio || 0, viewed: d.viewed || 0, total: d.total || 0 }; } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      } catch { /* noop — keeps last value */ }
    };
    refresh();
    const iv = setInterval(refresh, SURFACE_REFRESH_MS);
    const onDiscovery = () => refresh();
    window.addEventListener('sovereign:entity-discovery', onDiscovery);
    return () => {
      cancelled = true;
      clearInterval(iv);
      window.removeEventListener('sovereign:entity-discovery', onDiscovery);
    };
  }, []);

  useEffect(() => {
    const onContext = (e) => {
      const k = e?.detail?.key;
      const weight = k === 'sceneFrame' ? 0.10 : 0.18;
      loadRef.current = Math.min(1, loadRef.current + weight);
    };
    const onShift = () => {
      loadRef.current = Math.min(1, loadRef.current + 0.06);
    };
    window.addEventListener('sovereign:context-update', onContext);
    window.addEventListener('sovereign:state-shift', onShift);

    let raf;
    const tickIntervalMs = 1000 / TICK_HZ;
    let lastUiPush = 0;
    const decayDecayPerMs = Math.log(2) / DECAY_HALF_LIFE_MS;

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const dt = t - lastTickRef.current;
      lastTickRef.current = t;
      loadRef.current *= Math.exp(-decayDecayPerMs * dt);

      if (t - lastUiPush >= tickIntervalMs) {
        lastUiPush = t;
        const v = Math.max(0, Math.min(1, loadRef.current));
        const st = classify(v);
        setLoad(v);
        setState(st);
        try { window.__sovereignGauge = { load: v, state: st, t: Date.now() }; } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('sovereign:context-update', onContext);
      window.removeEventListener('sovereign:state-shift', onShift);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { load, state, depth, viewed, total, nextCells, COLD_LIMIT, OVERHEAT_LIMIT };
}
