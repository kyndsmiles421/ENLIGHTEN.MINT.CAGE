/**
 * ResonanceField.js — V57.6 Sovereign Atmospheric Engine
 *
 * The visual coupling between the 7 pillar frequency sliders
 * (PRA / DIV / SAN / BOD / WIS / SAG / COS) and the entire app's
 * atmospheric background.
 *
 * When the user drags PRA up, the field bleeds Practice violet at
 * varying intensity. When COS is high, a starfield density increases.
 * This is the "tune the engine to alter the field" coupling — the
 * sliders are no longer purely audio controls, they paint the world.
 *
 * Implementation notes
 * ────────────────────
 * - Renders behind ALL content (z-index: 0, body bg sits behind it).
 *   The app content stage uses z-index: 1 + so it always sits above.
 * - pointer-events: none so this is NOT a Flatland violation. There
 *   is no interaction surface — it's pure paint.
 * - GPU-accelerated CSS gradients + transform; no Canvas, no R3F
 *   (those will land in v1.1 as the proper Base Plane scene).
 * - Listens via a window event 'sovereign:pillar-levels' that the
 *   UnifiedCreatorConsole dispatches on every level change.
 */
import React, { useEffect, useState } from 'react';

const PILLAR_COLORS = {
  practice:   { rgb: [216, 180, 254] }, // PRA · violet
  divination: { rgb: [232, 121, 249] }, // DIV · fuchsia
  sanctuary:  { rgb: [45, 212, 191] },  // SAN · teal
  body:       { rgb: [251, 146, 60] },  // BOD · orange
  wisdom:     { rgb: [251, 191, 36] },  // WIS · amber
  sage:       { rgb: [56, 189, 248] },  // SAG · sky
  cosmos:     { rgb: [167, 139, 250] }, // COS · indigo
};

const PILLAR_KEYS = ['practice', 'divination', 'sanctuary', 'body', 'wisdom', 'sage', 'cosmos'];

export default function ResonanceField() {
  // Levels normalized 0..1 per pillar
  const [levels, setLevels] = useState(PILLAR_KEYS.map(() => 0.4));
  // V57.7 — audio-reactive pulse driven by MixerContext analyser RAF loop.
  // Bass kicks pulse the brightness, mid drives saturation, treble drives
  // starfield twinkle speed.
  const [pulse, setPulse] = useState({ bass: 0, mid: 0, treble: 0, peak: 0 });

  useEffect(() => {
    const onLevels = (e) => {
      const arr = e?.detail?.pillarLevels;
      if (!Array.isArray(arr) || arr.length !== 7) return;
      setLevels(arr.map((v) => Math.max(0, Math.min(1, v / 100))));
    };
    const onPulse = (e) => {
      const d = e?.detail;
      if (d) setPulse(d);
    };
    window.addEventListener('sovereign:pillar-levels', onLevels);
    window.addEventListener('sovereign:pulse', onPulse);
    return () => {
      window.removeEventListener('sovereign:pillar-levels', onLevels);
      window.removeEventListener('sovereign:pulse', onPulse);
    };
  }, []);

  // Build 7 radial gradients positioned around the viewport, intensity ∝ level.
  // Positions chosen so each pillar occupies its own visual quadrant.
  const positions = [
    { key: 'practice',   pos: '15% 22%' },
    { key: 'divination', pos: '85% 18%' },
    { key: 'sanctuary',  pos: '50% 50%' },
    { key: 'body',       pos: '20% 78%' },
    { key: 'wisdom',     pos: '80% 80%' },
    { key: 'sage',       pos: '50% 12%' },
    { key: 'cosmos',     pos: '50% 90%' },
  ];

  const gradients = positions.map((p, i) => {
    const lvl = levels[i];
    const [r, g, b] = PILLAR_COLORS[p.key].rgb;
    // V57.6.1 — push intensity higher so the resonance is unmistakably
    // visible. Peak alpha now ~0.42 inner, ~0.18 mid. Field breathes.
    const innerAlpha = 0.06 + lvl * 0.36;
    const midAlpha = innerAlpha * 0.45;
    return `radial-gradient(circle at ${p.pos}, rgba(${r},${g},${b},${innerAlpha}) 0%, rgba(${r},${g},${b},${midAlpha}) 22%, transparent 48%)`;
  });

  // Cosmos drives an additional starfield density via box-shadow stars
  const cosmosLevel = levels[6];
  const starCount = Math.round(20 + cosmosLevel * 80);
  const stars = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const o = 0.18 + Math.random() * 0.55;
      out.push(`${x.toFixed(2)}% ${y.toFixed(2)}% rgba(255,255,255,${o.toFixed(2)})`);
    }
    return out;
  }, [starCount]);

  // Body pulse — overall life-force (BOD)
  const bodPulse = 0.85 + levels[3] * 0.25;

  return (
    <div
      aria-hidden="true"
      data-testid="resonance-field"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',     // CRITICAL: pure paint, no click target
        // Composited gradients
        background: gradients.join(', '),
        // V57.7 — audio-reactive brightness + saturation. Bass kicks
        // brighten the field, mid frequencies saturate the color.
        // Falls back gracefully when nothing is playing (pulse=0).
        filter: `brightness(${(0.95 + pulse.bass * 0.5).toFixed(3)}) saturate(${(0.95 + pulse.mid * 0.55).toFixed(3)})`,
        // Vital-pulse via animation timeline (slow heartbeat)
        animation: `resonance-breath ${5 / bodPulse}s ease-in-out infinite alternate`,
        transition: 'filter 0.06s linear, background 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Starfield — density driven by COS pillar */}
      <div
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
        }}
      >
        {stars.map((s, i) => {
          const [x, y, color] = s.split(' ');
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: x, top: y,
                width: 1.5, height: 1.5,
                borderRadius: '50%',
                background: color.replace(/^rgba/, 'rgba'),
                boxShadow: `0 0 4px ${color}`,
                opacity: 0.6 + cosmosLevel * 0.4,
                animation: `resonance-twinkle ${2 + (i % 5)}s ease-in-out ${i * 0.07}s infinite alternate`,
              }}
            />
          );
        })}
      </div>

      {/* Inline keyframes — scoped here so we don't pollute global CSS */}
      <style>{`
        @keyframes resonance-breath {
          0%   { filter: brightness(0.95) saturate(0.95); transform: scale(1); }
          100% { filter: brightness(1.08) saturate(1.10); transform: scale(1.005); }
        }
        @keyframes resonance-twinkle {
          0%   { opacity: 0.2; transform: scale(0.85); }
          100% { opacity: 0.95; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
