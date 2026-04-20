/**
 * RippleBurst.js — V68.25 Visible action feedback for chamber props
 *
 * A short-lived concentric ripple + "+N SPARKS" flyaway tag that plays
 * at a given screen position when a chamber prop does something real.
 * Used so tapping the bell / mandala / any prop has VISIBLE consequence
 * inside the chamber, not just a silent toast.
 *
 * Props:
 *   x, y     — percent screen coords (matches ChamberProp placement)
 *   color    — theme color of the ripple
 *   xpLabel  — optional XP tag, e.g. "+2 SPARKS"
 *   onDone   — called when the burst finishes (for auto-cleanup)
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensory } from '../context/SensoryContext';

export default function RippleBurst({ x, y, color = '#FCD34D', xpLabel = '', onDone }) {
  const sensory = useSensory() || {};
  const reduceFlashing = !!(sensory.prefs && sensory.prefs.reduceFlashing);
  const reduceMotion   = !!(sensory.prefs && sensory.prefs.reduceMotion);
  useEffect(() => {
    const t = window.setTimeout(() => onDone?.(), 1800);
    return () => window.clearTimeout(t);
  }, [onDone]);
  // Epilepsy-safe variants:
  //   • reduceFlashing → single slow ring, no boxShadow glow spikes, no
  //                      staggered repeats.
  //   • reduceMotion   → no scale animation at all, just a brief opacity
  //                      fade on the label.
  const ringCount = reduceFlashing ? 1 : 3;
  const ringStarts = reduceFlashing ? [0] : [0, 0.25, 0.5];
  const endScale   = reduceMotion ? 1 : 260 / 40;
  return (
    <AnimatePresence>
      <motion.div
        key="ripple-wrap"
        style={{
          position: 'fixed',
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 7,
        }}
      >
        {ringStarts.slice(0, ringCount).map((delay, i) => (
          <motion.div
            key={`r-${i}`}
            initial={{ width: 40, height: 40, opacity: reduceFlashing ? 0.3 : 0.7, borderWidth: 2 }}
            animate={reduceMotion
              ? { opacity: 0 }
              : { width: 260, height: 260, opacity: 0, borderWidth: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceFlashing ? 2.2 : 1.6, delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              borderStyle: 'solid',
              borderColor: color,
              borderRadius: '50%',
              background: 'transparent',
              // boxShadow produces a luminance spike → skip for flash-sensitive users
              boxShadow: reduceFlashing ? 'none' : `0 0 18px ${color}66`,
            }}
          />
        ))}
        {xpLabel && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.9 }}
            animate={reduceMotion
              ? { opacity: [0, 1, 1, 0], y: 0, scale: 1 }
              : reduceFlashing
                ? { opacity: [0, 0.9, 0.9, 0], y: -40, scale: 1 }
                : { opacity: [0, 1, 1, 0], y: -60, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'monospace', fontSize: 11, letterSpacing: 2,
              color,
              textShadow: reduceFlashing
                ? '0 2px 4px rgba(0,0,0,0.9)'
                : `0 0 8px ${color}, 0 2px 4px rgba(0,0,0,0.9)`,
              whiteSpace: 'nowrap',
              fontWeight: 700,
            }}
            data-testid="ripple-xp-tag"
          >
            {xpLabel}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
