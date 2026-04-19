/**
 * SovereignStageHUD.js — V68.13 Universal Stage Overlay
 *
 * A compact floating HUD that follows the user through every 3D stage
 * (Fractal Engine, Cosmic Sanctuary, Celestial Dome, RPG).
 *
 * Shows:
 *   ── Sparks (Merit / Rank)
 *   ── Dust (Economy / Balance)
 *   ── Active Mission (one-liner)
 *   ── Live accrual pulse (cyan ring on `sovereign:immersion-tick` custom event)
 *
 * Inline, pointer-events-auto on the pill, 0.88 opacity so the 3D stage
 * remains the star. Respects the Flatland rule — no modals, inline overlay.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Coins, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SovereignStageHUD({ anchor = 'top-right', compact = false }) {
  const { user } = useAuth();
  const [sparks, setSparks] = useState(null);
  const [dust, setDust] = useState(null);
  const [mission, setMission] = useState(null);
  const [pulse, setPulse] = useState(false);

  const pos = (() => {
    switch (anchor) {
      case 'top-left':     return { top: 70, left: 20 };
      case 'top-right':    return { top: 70, right: 20 };
      case 'bottom-left':  return { bottom: 170, left: 20 };
      case 'bottom-right': return { bottom: 170, right: 20 };
      default:             return { top: 70, right: 20 };
    }
  })();

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    const h = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [s, w, q] = await Promise.allSettled([
          axios.get(`${API}/sparks/wallet`, { headers: h }),
          axios.get(`${API}/treasury/balance`, { headers: h }),
          axios.get(`${API}/quests/available`, { headers: h }),
        ]);
        if (s.status === 'fulfilled') setSparks(s.value.data?.sparks ?? null);
        if (w.status === 'fulfilled') setDust(w.value.data?.balance ?? w.value.data?.user_dust_balance ?? null);
        if (q.status === 'fulfilled') {
          const quests = q.value.data?.quests || [];
          const active = quests.find(x => !x.completed && (x.progress ?? 0) > 0) || quests.find(x => !x.completed);
          setMission(active || null);
        }
      } catch { /* silent */ }
    };
    fetchAll();
    const t = setInterval(fetchAll, 30000);
    return () => clearInterval(t);
  }, [user]);

  // Pulse on successful immersion accrual — piggyback on a custom DOM event.
  useEffect(() => {
    const onPulse = () => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 900);
    };
    window.addEventListener('sovereign:immersion-tick', onPulse);
    return () => window.removeEventListener('sovereign:immersion-tick', onPulse);
  }, []);

  if (!user) return null;

  const missionText = mission?.name || mission?.desc || mission?.hint || null;

  return (
    <div
      data-testid="sovereign-stage-hud"
      style={{
        position: 'fixed',
        ...pos,
        zIndex: 40,
        pointerEvents: 'auto',
        opacity: 0.88,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: compact ? 180 : 240,
        fontFamily: 'monospace',
      }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        {sparks != null && (
          <div
            data-testid="stage-hud-sparks"
            title={`Merit · ${sparks} Sparks`}
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: 999,
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              letterSpacing: '1px',
              color: '#D4AF37',
              position: 'relative',
            }}
          >
            <Award size={12} />
            <span style={{ fontWeight: 700 }}>{Number(sparks).toLocaleString()}</span>
            {pulse && (
              <span
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: 999,
                  border: '1px solid rgba(0,255,204,0.9)',
                  animation: 'stageHudPulse 0.9s ease-out forwards',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        )}
        {dust != null && (
          <div
            data-testid="stage-hud-dust"
            title={`Economy · ${dust} Dust`}
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(251,146,60,0.35)',
              borderRadius: 999,
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              letterSpacing: '1px',
              color: '#FB923C',
            }}
          >
            <Coins size={12} />
            <span style={{ fontWeight: 700 }}>{Number(dust).toLocaleString()}</span>
          </div>
        )}
      </div>

      {missionText && !compact && (
        <div
          data-testid="stage-hud-mission"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(192,132,252,0.25)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 10,
            lineHeight: 1.4,
            color: 'rgba(192,132,252,0.85)',
            letterSpacing: '0.5px',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <Compass size={11} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{missionText}</span>
        </div>
      )}

      <style>{`
        @keyframes stageHudPulse {
          0%   { transform: scale(1);   opacity: 0.9; }
          100% { transform: scale(1.9); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}
