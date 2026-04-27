/**
 * ChamberProp.js — V68.24 Interactive chamber hotspot
 *
 * A tap-activated glowing hotspot that sits ON TOP of the chamber
 * backdrop. When tapped, it triggers a gameplay callback. Used to
 * surface real interactive mini-games inside any holographic room
 * (meditation cushion, mason's chisel, wooden beam, mixing bowl,
 * lab pendulum, etc.).
 *
 * Props:
 *   x, y        — percentage position on the chamber (0-100)
 *   size        — hotspot diameter in px (default 72)
 *   label       — short verb shown on hover/focus, e.g. "BREATHE"
 *   icon        — single lucide icon (React component) or text glyph
 *   color       — accent colour of the prop glow
 *   onActivate  — called when the prop is tapped/clicked
 *   testid      — data-testid for QA
 *   disabled    — hide / ignore taps while a mini-game is active
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensory } from '../context/SensoryContext';

export default function ChamberProp({
  x, y,
  size = 72,
  label = '',
  icon = null,
  color = '#00ffcc',
  onActivate,
  testid = 'chamber-prop',
  disabled = false,
}) {
  const [pressFlashKey, setPressFlashKey] = useState(0);
  const [pressPulseKey, setPressPulseKey] = useState(0);
  const sensory = useSensory() || {};
  const reduceFlashing = !!(sensory.prefs && sensory.prefs.reduceFlashing);
  const reduceMotion   = !!(sensory.prefs && sensory.prefs.reduceMotion);

  const handleActivate = () => {
    if (disabled || !onActivate) return;
    // 100ms FEEDBACK RULE — user always knows the press registered.
    // Two variants so we never trigger a photosensitive episode:
    //   • Default   → quick white flash ring (standard confirmation cue)
    //   • reduceFlashing → soft non-luminous scale-pulse only (no flash,
    //                      no luminance spike, WCAG 2.3.1 safe)
    if (reduceFlashing) {
      setPressPulseKey((k) => k + 1);
    } else {
      setPressFlashKey((k) => k + 1);
    }
    // Haptic is independent of visual prefs — short, non-intrusive.
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    } catch { /* ignore */ }
    onActivate();
  };

  if (disabled) return null;
  const isStringGlyph = typeof icon === 'string';
  const IconComp = !isStringGlyph && icon ? icon : null;

  // V57.8 — STATE ADJUSTMENT, not new layer.
  // The chamber prop is meant to live inside its HOST CHAMBER ZONE
  // (the holographic-chamber container), not the viewport. Previously
  // this used `position: fixed` portaled to document.body, which on
  // mobile placed the prop at viewport-relative percentages and caused
  // it to land directly on top of the page's filter chips — eating
  // taps. The fix: render the prop INLINE inside the page flow with
  // `position: absolute` relative to its NEAREST `position: relative`
  // ancestor (the chamber container). When no relative ancestor exists,
  // the prop simply doesn't paint over content. No portal. No new layer.
  const node = (
    <motion.button
      type="button"
      onClick={handleActivate}
      data-testid={testid}
      className="chamber-prop-portal"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      style={{
        // V57.8 — `absolute` not `fixed`, no portal. The prop now flows
        // inside its HOST chamber zone (the closest position:relative
        // ancestor: HolographicChamber's outer div). It can never paint
        // outside the chamber, so it can never overlap unrelated page
        // content. The y-percentage maps to the chamber height, not the
        // viewport height.
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        background: `radial-gradient(circle at center, ${color}33 0%, ${color}11 50%, transparent 80%)`,
        boxShadow: `0 0 36px ${color}66, inset 0 0 16px ${color}55`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 6,
        backdropFilter: 'blur(2px)',
        padding: 0,
      }}
    >
      {/* 100ms press-confirm — epilepsy-safe by default.
          • Standard users: quick white luminance ring (0.35s easeOut).
          • reduceFlashing users: non-flashing scale-pulse only — no
            luminance spike, no strobe, WCAG 2.3.1 compliant.
          Keyed re-mount so repeat taps always re-trigger. */}
      <AnimatePresence>
        {pressFlashKey > 0 && !reduceFlashing && (
          <motion.span
            key={`flash-${pressFlashKey}`}
            initial={{ scale: 1, opacity: 0.9, borderWidth: 3 }}
            animate={{ scale: 1.9, opacity: 0, borderWidth: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: -6, borderRadius: '50%',
              borderStyle: 'solid', borderColor: '#fff',
              pointerEvents: 'none',
              boxShadow: `0 0 24px ${color}`,
            }}
          />
        )}
        {pressPulseKey > 0 && reduceFlashing && (
          <motion.span
            key={`pulse-${pressPulseKey}`}
            initial={{ scale: 1, opacity: reduceMotion ? 0 : 0.45 }}
            animate={{ scale: reduceMotion ? 1 : 1.22, opacity: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
              pointerEvents: 'none',
              border: `1px solid ${color}66`,
            }}
          />
        )}
      </AnimatePresence>
      {/* Outer pulse ring (never stops so the prop reads as "alive") */}
      <motion.span
        animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `2px solid ${color}`,
          pointerEvents: 'none',
        }}
      />
      {/* Second delayed ring for staggered pulse */}
      <motion.span
        animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
        style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `2px solid ${color}`,
          pointerEvents: 'none',
        }}
      />
      {/* Icon / glyph */}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, lineHeight: 1 }}>
        {IconComp ? <IconComp size={size * 0.42} /> : (isStringGlyph ? icon : null)}
      </span>
      {/* Label — always visible under the prop */}
      {label && (
        <span style={{
          position: 'absolute',
          top: size + 6,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          letterSpacing: 2,
          fontFamily: 'monospace',
          color,
          whiteSpace: 'nowrap',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}>
          {label}
        </span>
      )}
    </motion.button>
  );
  // V57.8 — No portal. The prop renders inline so it inherits its
  // host chamber's stacking context. CSS `position: absolute` resolves
  // against the nearest `position: relative` ancestor, which is the
  // HolographicChamber container. The prop can never escape its host.
  return node;
}
