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
      if (!activeRef.current) return;
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
          try { window.SovereignUniverse?.refreshGlobalUI?.(); } catch {}
          // Fire cross-domain signal
          try { window.SovereignUniverse?.checkQuestLogic?.(`scene:immersion:${sceneId}`, sceneId); } catch {}
        }
      } catch {}
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
