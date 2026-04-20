/**
 * HolographicChamber.js — V68.23 Transformation Wrapper
 *
 * Wrap ANY activity page in this component to transform it into an
 * immersive holographic chamber. The user feels like they've been
 * transported into a real room — a meditation hall, a mason's workshop,
 * a carpentry shop, a culinary kitchen, an academy lecture hall, a
 * physics lab — not a flat rectangular UI with shapes on it.
 *
 * Usage:
 *   <HolographicChamber chamberId="meditation" title="The Still Chamber">
 *     <YourExistingActivityContent />
 *   </HolographicChamber>
 *
 * What it does:
 *   1. Fetches (and caches) a cinematic AI-generated backdrop from
 *      POST /api/ai-visuals/chamber { chamber_id } — shared across users
 *      so it's one image per chamber forever, not regenerated per user.
 *   2. Plays a cinematic transformation animation on mount:
 *      black → shimmer sweep → scene materializes → content fades in.
 *   3. Shows the user's own AI-hologram avatar in a corner, flickering
 *      like a real hologram projection (not a cone with a photo).
 *   4. Wraps children in a translucent glass HUD pane so the activity's
 *      native UI (controls, inputs, results) sits inside the chamber.
 *
 * Props:
 *   chamberId   — one of the backend-recognized keys (meditation, masonry,
 *                 carpentry, culinary, academy, physics, geology, default)
 *   title       — displayed in the chamber header
 *   subtitle    — secondary line under the title
 *   children    — your existing activity content (renders inside the HUD)
 *   fullBleed   — if true, children render flush with the scene (e.g. for
 *                 3D canvases); default false puts them in the glass pane
 *   onReady     — optional callback fired after scene finishes materializing
 */
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import HolographicCanvas from './HolographicCanvas';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HolographicChamber({
  chamberId,
  title,
  subtitle = '',
  children,
  fullBleed = false,
  presenceCanvas = false,
  presenceColor = '#D8B4FE',
  presenceCue = 'breathe',
  presencePlaying = true,
  onReady,
}) {
  const navigate = useNavigate();
  const [backdrop, setBackdrop] = useState(null);
  const [avatarB64, setAvatarB64] = useState(null);
  const [materialized, setMaterialized] = useState(false);
  const readyCalledRef = useRef(false);

  // Fetch chamber backdrop + user's own hologram portrait
  useEffect(() => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') {
      setBackdrop(null);
      return;
    }
    const h = { Authorization: `Bearer ${token}` };
    let alive = true;
    (async () => {
      const [bRes, aRes] = await Promise.allSettled([
        axios.post(`${API}/ai-visuals/chamber`, { chamber_id: chamberId }, { headers: h }),
        axios.get(`${API}/ai-visuals/my-avatar`, { headers: h }),
      ]);
      if (!alive) return;
      if (bRes.status === 'fulfilled' && bRes.value.data?.image_b64) {
        setBackdrop(bRes.value.data.image_b64);
      }
      if (aRes.status === 'fulfilled' && aRes.value.data?.status === 'active' && aRes.value.data?.image_b64) {
        setAvatarB64(aRes.value.data.image_b64);
      }
    })();
    return () => { alive = false; };
  }, [chamberId]);

  // Trigger materialization after the scene image has loaded
  useEffect(() => {
    if (!backdrop) return;
    const t = setTimeout(() => {
      setMaterialized(true);
      if (!readyCalledRef.current) {
        readyCalledRef.current = true;
        onReady?.();
      }
    }, 900);
    return () => clearTimeout(t);
  }, [backdrop, onReady]);

  const backdropSrc = backdrop
    ? (backdrop.startsWith('data:') ? backdrop : `data:image/png;base64,${backdrop}`)
    : null;
  const avatarSrc = avatarB64
    ? (avatarB64.startsWith('data:') ? avatarB64 : `data:image/png;base64,${avatarB64}`)
    : null;

  return (
    <div
      data-testid={`holographic-chamber-${chamberId}`}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#000',
        overflow: 'hidden',
        color: '#fff',
      }}
    >
      {/* Backdrop scene */}
      <AnimatePresence>
        {backdropSrc && (
          <motion.div
            key={`backdrop-${chamberId}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 0,
              backgroundImage: `url(${backdropSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'saturate(1.05) contrast(1.05)',
            }}
          />
        )}
      </AnimatePresence>
      {/* Vignette + colour veil for readability */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Shimmer sweep — the "transformation" cue */}
      <AnimatePresence>
        {!materialized && backdropSrc && (
          <motion.div
            key="shimmer"
            initial={{ opacity: 0.0, x: '-120%' }}
            animate={{ opacity: [0.0, 0.45, 0.0], x: '120%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 4, pointerEvents: 'none',
              background: 'linear-gradient(120deg, transparent 20%, rgba(0,255,204,0.45) 50%, transparent 80%)',
              mixBlendMode: 'screen',
            }}
          />
        )}
      </AnimatePresence>

      {/* Subtle horizontal scanlines (holographic feel) */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, rgba(0,255,204,0.03) 0px, rgba(0,255,204,0.03) 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* Presence canvas — breathing particle avatar body in the room.
          Uses the same HolographicCanvas that Light Therapy and Guided
          Experience use, so visual language stays consistent. Render only
          when the chamber explicitly opts in (e.g. meditation). Uses
          mix-blend-mode: screen so the canvas's dark background falls
          away and only the luminous particle avatar composites on the
          scene. */}
      {presenceCanvas && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
            opacity: materialized ? 0.85 : 0,
            transition: 'opacity 900ms ease-out',
            mixBlendMode: 'screen',
          }}
        >
          <PresenceCanvasWrapper color={presenceColor} cue={presenceCue} playing={presencePlaying} />
        </div>
      )}
      {/* Top chrome bar — back + chamber title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: materialized ? 1 : 0, y: materialized ? 0 : -10 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 6,
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          data-testid={`chamber-${chamberId}-back`}
          style={{
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,255,204,0.35)', color: '#00ffcc',
            padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontFamily: 'monospace', letterSpacing: '1.5px',
          }}
        >
          <ArrowLeft size={13} /> EXIT
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} style={{ color: '#C084FC' }} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, letterSpacing: 1.5, fontWeight: 300 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 9, letterSpacing: '2px', color: 'rgba(192,132,252,0.8)', fontFamily: 'monospace', marginTop: 2 }}>
                {subtitle.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* User hologram — bottom-left corner, scanline flicker */}
      {avatarSrc && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: materialized ? 0.95 : 0, x: materialized ? 0 : -20 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          data-testid={`chamber-${chamberId}-hologram`}
          style={{
            position: 'fixed', left: 14, bottom: 84, zIndex: 5,
            width: 120, height: 170,
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(0,255,204,0.5)',
            boxShadow: '0 0 30px rgba(0,255,204,0.35)',
            background: 'linear-gradient(180deg, rgba(0,255,204,0.15) 0%, transparent 100%)',
          }}
        >
          <img
            src={avatarSrc}
            alt="you"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              mixBlendMode: 'screen', opacity: 0.92,
            }}
          />
          <motion.div
            animate={{ opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(180deg, transparent 45%, rgba(0,255,204,0.5) 50%, transparent 55%)',
              backgroundSize: '100% 8px',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 4, left: 0, right: 0,
            textAlign: 'center', fontSize: 8, letterSpacing: '2px',
            color: 'rgba(0,255,204,0.9)', fontFamily: 'monospace',
          }}>
            SOVEREIGN
          </div>
        </motion.div>
      )}

      {/* Activity content slot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: materialized ? 1 : 0, y: materialized ? 0 : 20 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        style={{
          position: 'relative', zIndex: 3,
          paddingTop: fullBleed ? 0 : 72,
          minHeight: '100vh',
        }}
      >
        {fullBleed ? (
          children
        ) : (
          <div
            style={{
              maxWidth: 820, margin: '0 auto', padding: '12px 16px 200px',
            }}
          >
            <div
              style={{
                background: 'rgba(10,10,20,0.55)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(192,132,252,0.2)',
                borderRadius: 18,
                padding: '18px 18px',
                boxShadow: '0 12px 50px rgba(0,0,0,0.5)',
              }}
              data-testid={`chamber-${chamberId}-hud`}
            >
              {children}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Presence canvas wrapper — sizes HolographicCanvas to viewport ──
function PresenceCanvasWrapper({ color, cue, playing }) {
  const wrapRef = useRef(null);
  const [dim, setDim] = useState({ w: 800, h: 600 });
  useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      setDim({ w: Math.max(320, Math.floor(r.width)), h: Math.max(320, Math.floor(r.height)) });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: dim.w, height: dim.h }}>
          <HolographicCanvas color={color} cue={cue} playing={playing} intensity={5} />
        </div>
      </div>
    </div>
  );
}
