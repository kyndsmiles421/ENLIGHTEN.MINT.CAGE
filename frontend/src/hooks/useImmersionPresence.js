/**
 * useImmersionPresence.js — V68.6 Presence Economy
 *
 * React hook: mount on any 3D/meditation scene. Tracks sustained presence
 * (tab visible + page focused) and fires `/api/presence/tick` every 60s.
 * Backend grants +5 Dust + 2 Sparks per tick and logs a Trade Ledger entry.
 *
 * Usage:
 *   import { useImmersionPresence } from '../hooks/useImmersionPresence';
 *   useImmersionPresence('celestial_dome'); // that's it.
 *
 * Respects Thin-Client philosophy — no UI, no new deps, pure hook.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TICK_MS = 60000; // 60 seconds
const ACTIVATE_DEBOUNCE_MS = 5000; // V68.7: prevent rapid-fire ghost nodes

// Module-level debounce map: last activation timestamp per path
const _lastActivate = new Map();

export function useImmersionPresence(sceneId, options = {}) {
  const { silent = false } = options;
  const location = useLocation();
  const timerRef = useRef(null);
  const activeRef = useRef(true); // true when tab visible + focused

  // V68.6 Scout Activation: fire /main-brain/activate on mount only
  // (pull-based intentionality — entering a scene IS the signal)
  useEffect(() => {
    if (!sceneId) return;
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    // V68.7 Debounce: skip if we activated this path within the last 5s
    const key = location.pathname;
    const last = _lastActivate.get(key) || 0;
    const now = Date.now();
    if (now - last < ACTIVATE_DEBOUNCE_MS) return;
    _lastActivate.set(key, now);
    axios.post(
      `${API}/main-brain/activate`,
      { path: location.pathname },
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(() => {});
  }, [sceneId, location.pathname]);

  useEffect(() => {
    if (!sceneId) return;
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;

    const onVisibility = () => { activeRef.current = !document.hidden; };
    const onBlur = () => { activeRef.current = false; };
    const onFocus = () => { activeRef.current = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    const tick = async () => {
      // V68.8 Belt-and-suspenders: true presence requires BOTH focus AND visibility
      // (prevents parked-tab farming even when visibility API misreports)
      if (!activeRef.current) return;
      try { if (typeof document.hasFocus === 'function' && !document.hasFocus()) return; } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      try {
        const res = await axios.post(
          `${API}/presence/tick`,
          { scene_id: sceneId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.granted && !silent) {
          toast(`+${res.data.dust_awarded} Dust · +${res.data.sparks_awarded} Sparks`, {
            description: `${res.data.scene_label} · ${res.data.total_minutes_here}m immersed`,
            duration: 2500,
          });
          // Refresh global wallet so Hub pills update
          try { window.SovereignUniverse?.refreshGlobalUI?.(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
          // Fire cross-domain signal
          try { window.SovereignUniverse?.checkQuestLogic?.(`scene:immersion:${sceneId}`, sceneId); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
        }
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    };

    timerRef.current = setInterval(tick, TICK_MS);
    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [sceneId, silent]);
}
