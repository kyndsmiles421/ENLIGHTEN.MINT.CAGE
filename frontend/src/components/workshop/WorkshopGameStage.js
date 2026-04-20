/**
 * WorkshopGameStage.js — V68.22 Context-Aware Action Gameplay
 *
 * Replaces the old static SVG "CenterBlock" that every workshop shared.
 * Now the tappable object in the center is a proper action mini-game:
 *
 *   1. Your holographic avatar (left) wields the selected tool.
 *   2. Tap / click the target → tool swings down, impact shake, cracks grow.
 *   3. After N hits the target SHATTERS — fragments fly outward, crystals
 *      spawn and animate up to the Sparks counter.
 *   4. Each hit: +8 Sparks (RANK XP, never currency, per CREDIT_SYSTEM.md).
 *      Each shatter: +30 Sparks bonus + a new target spawns.
 *
 * One component, infinite modules — the visual shape & palette reflect
 * whichever workshop is loaded (geology rock, carpentry log, electrical
 * panel, etc.) via the `moduleId` prop + the material's color.
 *
 * Dependencies: already installed. Uses framer-motion (bundle-safe, no
 * new R3F import) and the SAME Lucide icons the rest of the workshop uses.
 *
 * Props:
 *   material       — active material object (has .name .color)
 *   tool           — active tool object (has .name .color .icon_symbol)
 *   moduleId       — workshop module id, e.g. "geology"
 *   accentColor    — fallback palette colour
 *   avatarB64      — optional base64 portrait for the avatar slot
 *   onSwing        — fires on every tap (for actions counter / Sparks API)
 *   onShatter      — fires when target HP reaches 0 (for bonus Sparks + quest)
 */
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Module → target shape/label map ───────────────────────────────────
// A workshop can opt into a specific shape theme; otherwise the default
// rock-break theme is used (works for every "break material" workshop).
const MODULE_THEMES = {
  geology:      { shape: 'rock', label: 'ROCK',  verb: 'SHATTER' },
  masonry:      { shape: 'rock', label: 'STONE', verb: 'DRESS' },
  carpentry:    { shape: 'log',  label: 'LOG',   verb: 'CHISEL' },
  landscaping:  { shape: 'log',  label: 'STUMP', verb: 'CLEAR' },
  electrical:   { shape: 'box',  label: 'PANEL', verb: 'WIRE' },
  plumbing:     { shape: 'pipe', label: 'PIPE',  verb: 'FIT' },
};
const DEFAULT_THEME = { shape: 'rock', label: 'TARGET', verb: 'STRIKE' };

// ── Tiny deterministic shatter fragments (6 pieces) ───────────────────
const FRAGMENT_DIRS = [
  { dx: -60, dy: -80, r: -140 },
  { dx:  60, dy: -70, r:  130 },
  { dx: -90, dy:   0, r:  -90 },
  { dx:  90, dy:  10, r:   90 },
  { dx: -30, dy:  80, r:  -45 },
  { dx:  30, dy:  90, r:   60 },
];

export default function WorkshopGameStage({
  material,
  tool,
  moduleId,
  accentColor = '#FB923C',
  avatarB64 = null,
  onSwing,
  onShatter,
}) {
  const theme = MODULE_THEMES[moduleId] || DEFAULT_THEME;
  const matColor = material?.color || accentColor;
  const matName  = material?.name || theme.label;

  const MAX_HP = 5;
  const [hp, setHp]             = useState(MAX_HP);
  const [swingT, setSwingT]     = useState(0);  // timestamp of last swing (drives animations)
  const [shattering, setShattering] = useState(false);
  const [crystalsFlying, setCrystalsFlying] = useState([]); // [{id, x, y}]
  const [earnedXP, setEarnedXP] = useState(0);
  const idRef = useRef(0);

  // Reset when material changes (switching materials mid-game = fresh target).
  useEffect(() => {
    setHp(MAX_HP);
    setShattering(false);
  }, [material?.id]);

  const handleStrike = useCallback(() => {
    if (shattering) return;
    if (!tool) {
      // No tool chosen yet — nudge the user; still fires the swing for feedback.
      setSwingT(Date.now());
      return;
    }
    const now = Date.now();
    setSwingT(now);
    const nextHP = Math.max(0, hp - 1);
    setHp(nextHP);
    setEarnedXP((x) => x + 8);
    onSwing?.();
    // Spawn a small ascending crystal (Sparks XP proxy) from the impact point.
    const id = ++idRef.current;
    setCrystalsFlying((arr) => [...arr, { id, x: 50 + Math.random() * 40 - 20, delay: 0 }]);
    window.setTimeout(() => {
      setCrystalsFlying((arr) => arr.filter((c) => c.id !== id));
    }, 950);
    if (nextHP === 0) {
      setShattering(true);
      setEarnedXP((x) => x + 30);
      onShatter?.();
      // After the shatter animation, respawn a new target.
      window.setTimeout(() => {
        setShattering(false);
        setHp(MAX_HP);
      }, 1100);
    }
  }, [hp, tool, shattering, onSwing, onShatter]);

  const hpPct = Math.round((hp / MAX_HP) * 100);

  return (
    <div className="relative w-full" data-testid="workshop-game-stage" style={{ minHeight: 260 }}>
      {/* Sparks XP counter — top-center of the stage */}
      <AnimatePresence>
        {earnedXP > 0 && (
          <motion.div
            key="xp-counter"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.4)',
              borderRadius: 999, padding: '4px 10px',
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '1.5px',
              color: '#00ffcc', zIndex: 4, pointerEvents: 'none',
            }}
            data-testid="workshop-xp-counter"
          >
            +{earnedXP} SPARKS · RANK XP
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 pt-7">
        {/* Player hologram (left slot) */}
        <PlayerAvatar avatarB64={avatarB64} accentColor={accentColor} swinging={!!swingT} />

        {/* Central target */}
        <div className="relative flex flex-col items-center" style={{ width: 200 }}>
          {/* HP bar above target */}
          <div className="w-40 h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              animate={{ width: `${hpPct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              style={{ height: '100%', background: matColor, boxShadow: `0 0 10px ${matColor}60` }}
              data-testid="workshop-target-hp"
            />
          </div>
          <div className="text-[8px] tracking-[2px] mb-1" style={{ color: matColor, fontFamily: 'monospace' }}>
            {theme.verb} {matName.toUpperCase()} — {hp}/{MAX_HP}
          </div>

          <TargetShape
            theme={theme}
            color={matColor}
            hp={hp}
            maxHp={MAX_HP}
            swingT={swingT}
            shattering={shattering}
            onStrike={handleStrike}
          />

          {/* Tool swing sprite (floats above target + animates down on every strike) */}
          {tool && (
            <ToolSwing tool={tool} swingT={swingT} />
          )}

          {/* Ascending crystals (Sparks XP feedback) */}
          <AnimatePresence>
            {crystalsFlying.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: c.x - 50, y: 0, scale: 0.7 }}
                animate={{ opacity: [0, 1, 1, 0], y: -120, scale: [0.7, 1, 1, 0.6] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{
                  position: 'absolute', left: '50%', top: '50%', width: 14, height: 14,
                  borderRadius: '50%', background: '#00ffcc',
                  boxShadow: '0 0 12px #00ffcc',
                  pointerEvents: 'none', zIndex: 5,
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Hint pill (right slot) */}
        <div className="hidden sm:flex flex-col items-center gap-2 text-[9px] tracking-wider"
          style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', width: 80 }}>
          <span>TAP TO</span>
          <span style={{ color: accentColor, fontWeight: 700 }}>{theme.verb}</span>
          <span>{tool ? tool.name : 'PICK A TOOL'}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function PlayerAvatar({ avatarB64, accentColor, swinging }) {
  return (
    <motion.div
      animate={swinging ? { x: [-2, 2, 0], rotate: [0, -3, 0] } : {}}
      transition={{ duration: 0.25 }}
      style={{ width: 82, height: 114, position: 'relative', flexShrink: 0 }}
      data-testid="workshop-player-avatar"
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 10,
          background: `linear-gradient(180deg, ${accentColor}22 0%, transparent 100%)`,
          border: `1px solid ${accentColor}55`,
          overflow: 'hidden',
          boxShadow: `0 0 24px ${accentColor}33`,
        }}
      >
        {avatarB64 ? (
          <img
            src={avatarB64.startsWith('data:') ? avatarB64 : `data:image/png;base64,${avatarB64}`}
            alt="Sovereign"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, mixBlendMode: 'screen' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor, fontSize: 10, letterSpacing: '2px', fontFamily: 'monospace',
          }}>YOU</div>
        )}
      </div>
      {/* Hologram scanline flicker */}
      <motion.div
        animate={{ opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{
          position: 'absolute', inset: 0, borderRadius: 10, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 40%, rgba(0,255,204,0.4) 50%, transparent 60%)',
          backgroundSize: '100% 6px',
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function ToolSwing({ tool, swingT }) {
  return (
    <motion.div
      key={swingT || 'idle'}
      animate={swingT ? { rotate: [-40, 25, 0], y: [-28, 4, 0] } : { rotate: -20, y: -14 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        width: 40, height: 40, borderRadius: 8,
        background: `${tool.color}26`,
        border: `1px solid ${tool.color}77`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 700, color: tool.color,
        pointerEvents: 'none', zIndex: 3,
        boxShadow: `0 0 16px ${tool.color}50`,
      }}
      data-testid="workshop-tool-swing"
    >
      {tool.icon_symbol || '⚒'}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function TargetShape({ theme, color, hp, maxHp, swingT, shattering, onStrike }) {
  const crackLevel = maxHp - hp; // 0..maxHp
  // Precomputed crack paths — reveal one more with each hit.
  const cracks = useMemo(() => [
    'M 100 40 L 95 90 L 105 140',
    'M 60 70 L 110 110 L 150 150',
    'M 150 70 L 100 120 L 70 160',
    'M 70 100 L 120 120',
    'M 80 150 L 140 130',
  ], []);

  return (
    <motion.button
      type="button"
      onClick={onStrike}
      data-testid="workshop-target"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      animate={shattering
        ? { opacity: 0, scale: 1.25, rotate: 15, transition: { duration: 0.5 } }
        : swingT
          ? { x: [0, -6, 6, 0], rotate: [0, -1.5, 1.5, 0], transition: { duration: 0.3 } }
          : {}}
      style={{
        position: 'relative', width: 180, height: 180,
        background: 'transparent', border: 'none', padding: 0,
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <svg viewBox="0 0 200 200" width="180" height="180" style={{ display: 'block' }}>
        {/* Ground shadow */}
        <ellipse cx="100" cy="180" rx="60" ry="8" fill="rgba(0,0,0,0.35)" />
        {/* Main body — shape varies per theme */}
        {theme.shape === 'rock' && (
          <>
            <polygon points="100,35 160,75 155,150 95,165 45,130 50,75" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
            <polygon points="100,35 160,75 100,100 50,75" fill={color} opacity="0.85" />
            <polygon points="50,75 100,100 95,165 45,130" fill={color} opacity="0.68" />
            <polygon points="160,75 100,100 95,165 155,150" fill={color} opacity="0.55" />
          </>
        )}
        {theme.shape === 'log' && (
          <>
            <rect x="40" y="70" width="120" height="70" rx="10" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
            <ellipse cx="40" cy="105" rx="10" ry="35" fill={color} opacity="0.7" />
            <ellipse cx="40" cy="105" rx="5" ry="25" fill={color} opacity="0.4" />
            <ellipse cx="40" cy="105" rx="2" ry="15" fill={color} opacity="0.25" />
          </>
        )}
        {theme.shape === 'box' && (
          <>
            <polygon points="45,70 155,70 175,90 175,150 45,150 25,130" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="2" opacity="0.85" />
            <rect x="60" y="95" width="15" height="15" fill="#111" opacity="0.6" />
            <rect x="85" y="95" width="15" height="15" fill="#111" opacity="0.6" />
            <rect x="110" y="95" width="15" height="15" fill="#111" opacity="0.6" />
          </>
        )}
        {theme.shape === 'pipe' && (
          <>
            <rect x="30" y="85" width="140" height="30" rx="15" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
            <circle cx="30" cy="100" r="15" fill={color} opacity="0.4" />
            <circle cx="170" cy="100" r="15" fill={color} opacity="0.4" />
          </>
        )}
        {/* Cracks — one extra reveals per hit */}
        <g style={{ pointerEvents: 'none' }}>
          {cracks.slice(0, crackLevel).map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </g>
      </svg>

      {/* Impact flash on swing */}
      <AnimatePresence>
        {swingT && (
          <motion.div
            key={swingT}
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 80, height: 80, borderRadius: '50%',
              background: 'radial-gradient(circle, #fff 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Shatter fragments */}
      <AnimatePresence>
        {shattering && FRAGMENT_DIRS.map((f, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: f.dx, y: f.dy, opacity: 0, rotate: f.r, scale: 0.6 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: '45%', left: '50%',
              width: 22, height: 22, background: color, borderRadius: 3,
              boxShadow: `0 0 8px ${color}`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
