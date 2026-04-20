/**
 * ChamberMiniGame.js — V68.25 System-Wide Gamification Engine
 *
 * One component, three real mechanics. Each pillar of the app opens this
 * overlay with its own theme config and gets a bespoke-feeling interactive
 * mini-game without bloating the core bundle.
 *
 * Modes:
 *   "break"   — Static targets (geodes / dough mounds / timber beams).
 *               Requires N taps each to break open / knead / drive home.
 *               Used by Geology (break open geodes), Culinary (knead
 *               dough), Carpentry (drive pegs into frame).
 *   "collect" — Floating targets drift across the chamber; tap each one
 *               before it leaves the stage. Used by Herbology (pluck
 *               floating herbs), Academy (catch knowledge scrolls),
 *               Aromatherapy (catch floating essences).
 *   "rhythm"  — A marker sweeps across a bar; tap when aligned with the
 *               PHI target zone. Used by Physics (Metatron's Pendulum),
 *               Aromatherapy alternative (essence balance).
 *
 * Every tap credits +1 Spark XP via POST /api/sparks/immersion, a
 * completion bonus credits another chunk, and the game always closes
 * cleanly. Sparks are earned-only — never spent (see CREDIT_SYSTEM.md).
 *
 * Props:
 *   open            — render the overlay
 *   onClose         — close callback
 *   mode            — "break" | "collect" | "rhythm"
 *   color           — accent color
 *   title           — headline, e.g. "BREAK THE GEODE"
 *   verb            — action label on targets, e.g. "STRIKE"
 *   icon            — lucide icon rendered on each target
 *   targetCount     — how many targets to clear (default 5)
 *   hitsPerTarget   — taps needed per target in "break" mode (default 3)
 *   zone            — string passed to /sparks/immersion (e.g. 'geology_break')
 *   completionMsg   — message shown on finish (e.g. "CRYSTAL REVEALED")
 *   completionXP    — XP awarded at completion (default 10)
 *   onComplete      — optional callback fired on completion
 *   background      — optional background accent (theme flavor)
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useSensory } from '../../context/SensoryContext';
import { useSovereignUniverse } from '../../context/SovereignUniverseContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MICRO_SPARKS = 1;       // seconds credited per action tap
const COMPLETION_SECS = 12;   // seconds credited at macro completion

function creditSparks(zone, seconds) {
  const token = localStorage.getItem('zen_token');
  if (!token || token === 'guest_token') return;
  axios
    .post(
      `${API}/sparks/immersion`,
      { seconds, zone },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .catch(() => {});
  try {
    window.dispatchEvent(new CustomEvent('sovereign:immersion-tick'));
  } catch { /* noop */ }
}

function haptic() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // V68.28 Resonance Haptics: vibration duration is tuned to the
      // active trade-resonance frequency. 1 cycle of the dominant Hz,
      // capped between 8ms (≥125Hz) and 40ms (≤25Hz). If no mixer tone
      // is active, falls back to 10ms default.
      const hz = typeof window !== 'undefined' ? window.__sovereignHz : null;
      if (hz && hz > 0) {
        const ms = Math.max(8, Math.min(40, Math.round(1000 / hz)));
        navigator.vibrate(ms);
      } else {
        navigator.vibrate(10);
      }
    }
  } catch { /* ignore */ }
}

export default function ChamberMiniGame({
  open,
  onClose,
  mode = 'collect',
  color = '#00ffcc',
  title = 'BEGIN',
  verb = 'TAP',
  icon: Icon = Sparkles,
  targetCount = 5,
  hitsPerTarget = 3,
  zone = 'chamber_game',
  completionMsg = 'COMPLETE',
  completionXP = 10,
  onComplete,
  background = null,
  // V68.25 — Progressive / adaptive plumbing. The game machine reads a
  // per-zone "level" from localStorage ("emcafe_gamelvl_<zone>"), bumps
  // targetCount / hitsPerTarget upward each completion, and fires a
  // signal into the SovereignUniverse brain so quests can advance and
  // cards/badges can unlock automatically.
  brainSignal = null,     // override; default auto-generated from zone/mode
  progressive = true,      // scale difficulty by completion count
  maxLevel = 9,            // cap scaling
}) {
  const sensory = useSensory() || {};
  const brain = useSovereignUniverse();
  const reduceFlashing = !!(sensory.prefs && sensory.prefs.reduceFlashing);
  const reduceMotion   = !!(sensory.prefs && sensory.prefs.reduceMotion);

  // Read the adaptive level for this zone (0 = first run).
  const levelKey = `emcafe_gamelvl_${zone}`;
  const readLevel = () => {
    try {
      const v = parseInt(localStorage.getItem(levelKey) || '0', 10);
      return Number.isFinite(v) ? Math.max(0, Math.min(maxLevel, v)) : 0;
    } catch { return 0; }
  };
  const [level, setLevel] = useState(readLevel);
  const scaledTargetCount = progressive ? Math.min(targetCount + level, targetCount + maxLevel) : targetCount;
  const scaledHits        = progressive ? Math.min(hitsPerTarget + Math.floor(level / 2), hitsPerTarget + 5) : hitsPerTarget;
  const scaledCompletionXP = progressive ? completionXP + level * 2 : completionXP;

  const [xp, setXp] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [done, setDone] = useState(false);
  const [flashAt, setFlashAt] = useState(null); // {x,y,key}

  const fireBrain = useCallback((kind, meta = {}) => {
    try {
      const sig = brainSignal || `${zone}:${mode}:${kind}`;
      brain?.checkQuestLogic?.(sig, zone, { level, ...meta });
    } catch { /* brain unavailable — safe no-op */ }
  }, [brain, brainSignal, zone, mode, level]);

  const onHit = useCallback(() => {
    setXp((v) => v + MICRO_SPARKS);
    creditSparks(zone, 2);
    haptic();
    fireBrain('hit');
  }, [zone, fireBrain]);

  const onTargetCleared = useCallback(() => {
    setCleared((c) => {
      const next = c + 1;
      if (next >= scaledTargetCount) {
        // Completion bonus
        setXp((v) => v + scaledCompletionXP);
        creditSparks(zone, COMPLETION_SECS);
        setDone(true);
        // Bump adaptive level + signal brain — this is what unlocks
        // the next tier of content / quest steps / cards for the user.
        if (progressive) {
          try {
            const nextLvl = Math.min(maxLevel, level + 1);
            localStorage.setItem(levelKey, String(nextLvl));
          } catch { /* ignore */ }
        }
        fireBrain('complete', { cleared: next, xp_awarded: scaledCompletionXP });
        try { onComplete?.({ level, cleared: next, xp: scaledCompletionXP }); } catch { /* noop */ }
      }
      return next;
    });
  }, [scaledTargetCount, zone, scaledCompletionXP, onComplete, progressive, level, levelKey, maxLevel, fireBrain]);

  // Reset on every open — also re-read the adaptive level so repeated
  // sessions immediately reflect the progression.
  useEffect(() => {
    if (open) {
      setXp(0); setCleared(0); setDone(false); setFlashAt(null);
      setLevel(readLevel());
      // Announce entry to the brain so quests that require "visit X" fire.
      try {
        brain?.checkQuestLogic?.(brainSignal || `${zone}:${mode}:enter`, zone);
      } catch { /* noop */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // V68.26 — Cosmic Mixer integration. When the user toggles a mixer
  // nodule (freq / sound / drone / mantra), every OPEN chamber game
  // receives a "mixer-tick" — it counts as a micro-assist: credits 1
  // Spark, flashes the stage, and signals the brain. This gives the
  // mixer nodules a real FUNCTION inside each gamified module instead
  // of being decorative.
  useEffect(() => {
    if (!open) return;
    const onMix = (ev) => {
      setXp((v) => v + MICRO_SPARKS);
      creditSparks(zone, 1);
      setFlashAt({
        x: (typeof window !== 'undefined' ? window.innerWidth : 400) * 0.5,
        y: (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.5,
        key: Date.now(),
      });
      fireBrain('mixer_assist', { mixer: ev?.detail || null });
    };
    window.addEventListener('sovereign:mixer-tick', onMix);
    return () => window.removeEventListener('sovereign:mixer-tick', onMix);
  }, [open, zone, fireBrain]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={`mini-${mode}-${zone}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 30,
          background: background || 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          userSelect: 'none', touchAction: 'manipulation',
          overflow: 'hidden',
        }}
        data-testid={`chamber-game-${mode}-${zone}`}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          data-testid={`chamber-game-close-${zone}`}
          style={{
            position: 'absolute', top: 18, right: 18,
            background: 'rgba(0,0,0,0.5)', border: `1px solid ${color}55`,
            color, borderRadius: 999, padding: 6, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 5,
          }}
        >
          <X size={16} />
        </button>

        {/* Top HUD — title + XP */}
        <div style={{
          position: 'absolute', top: 16, left: 18, right: 60,
          display: 'flex', flexDirection: 'column', gap: 2,
          fontFamily: 'monospace', color,
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.85 }}>
            {title}{progressive && level > 0 ? ` · TIER ${level + 1}` : ''}
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 10, letterSpacing: 1.5, opacity: 0.75 }}>
            <span data-testid={`chamber-game-xp-${zone}`}>+{xp} SPARKS · XP</span>
            <span data-testid={`chamber-game-progress-${zone}`}>
              {Math.min(cleared, scaledTargetCount)}/{scaledTargetCount}
            </span>
          </div>
        </div>

        {/* Mode-specific stage */}
        {mode === 'break' && (
          <BreakStage
            count={scaledTargetCount}
            hits={scaledHits}
            color={color}
            verb={verb}
            Icon={Icon}
            onHit={onHit}
            onCleared={onTargetCleared}
            reduceFlashing={reduceFlashing}
            reduceMotion={reduceMotion}
            zone={zone}
          />
        )}
        {mode === 'collect' && (
          <CollectStage
            count={scaledTargetCount}
            color={color}
            verb={verb}
            Icon={Icon}
            onHit={onHit}
            onCleared={onTargetCleared}
            reduceMotion={reduceMotion}
            reduceFlashing={reduceFlashing}
            zone={zone}
          />
        )}
        {mode === 'rhythm' && (
          <RhythmStage
            count={scaledTargetCount}
            color={color}
            verb={verb}
            Icon={Icon}
            onHit={onHit}
            onCleared={onTargetCleared}
            onFlash={(x, y) => setFlashAt({ x, y, key: Date.now() })}
            reduceMotion={reduceMotion}
            reduceFlashing={reduceFlashing}
            zone={zone}
          />
        )}

        {/* Flash feedback (non-epilepsy-safe variant only) */}
        <AnimatePresence>
          {flashAt && !reduceFlashing && (
            <motion.div
              key={flashAt.key}
              initial={{ opacity: 0.85, scale: 0.8 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              style={{
                position: 'absolute', left: flashAt.x, top: flashAt.y,
                width: 80, height: 80, marginLeft: -40, marginTop: -40,
                borderRadius: '50%', pointerEvents: 'none',
                background: `radial-gradient(circle, ${color}66 0%, transparent 70%)`,
                border: `2px solid ${color}`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Completion card */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                padding: '14px 20px',
                background: 'rgba(0,0,0,0.65)',
                border: `1px solid ${color}80`,
                borderRadius: 14,
                textAlign: 'center', fontFamily: 'monospace',
                boxShadow: reduceFlashing ? 'none' : `0 0 40px ${color}66`,
              }}
              data-testid={`chamber-game-done-${zone}`}
            >
              <div style={{ fontSize: 10, letterSpacing: 3, color, marginBottom: 6 }}>
                {completionMsg}
              </div>
              <div style={{ fontSize: 13, color: '#fff', letterSpacing: 2 }}>
                +{scaledCompletionXP} BONUS SPARKS
              </div>
              <button
                type="button"
                onClick={onClose}
                data-testid={`chamber-game-finish-${zone}`}
                style={{
                  marginTop: 10,
                  background: `${color}22`,
                  border: `1px solid ${color}`,
                  color,
                  padding: '6px 14px', borderRadius: 999,
                  fontSize: 10, letterSpacing: 2, cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                EXIT CHAMBER
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instruction strip */}
        <div style={{
          position: 'absolute', bottom: 18, left: 0, right: 0,
          textAlign: 'center', fontSize: 9, letterSpacing: 2,
          color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace',
          pointerEvents: 'none',
        }}>
          {mode === 'break'   && `TAP EACH TARGET ${scaledHits}× TO ${verb}`}
          {mode === 'collect' && `TAP THE FLOATING ${verb} BEFORE THEY DRIFT OFF`}
          {mode === 'rhythm'  && `TAP WHEN THE MARKER ALIGNS WITH THE GOLDEN BAND`}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────────── BREAK STAGE ──────────
// N targets sit statically at random positions. Each needs `hits` taps.
function BreakStage({ count, hits, color, verb, Icon, onHit, onCleared, reduceFlashing, reduceMotion, zone }) {
  const [targets, setTargets] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: 12 + Math.random() * 70,
      y: 25 + Math.random() * 55,
      hp: hits,
      cleared: false,
    })),
  );
  const tap = (id) => {
    setTargets((ts) => ts.map((t) => {
      if (t.id !== id || t.cleared) return t;
      const hp = t.hp - 1;
      if (hp <= 0) {
        onCleared();
        return { ...t, hp: 0, cleared: true };
      }
      return { ...t, hp };
    }));
    onHit();
  };
  return (
    <>
      {targets.map((t) => {
        if (t.cleared) return null;
        const progress = 1 - t.hp / hits;
        const size = 92 - progress * 16;
        return (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => tap(t.id)}
            data-testid={`chamber-break-target-${zone}-${t.id}`}
            whileTap={{ scale: 0.88 }}
            animate={reduceMotion ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: t.id * 0.2 }}
            style={{
              position: 'absolute',
              left: `${t.x}%`, top: `${t.y}%`,
              transform: 'translate(-50%, -50%)',
              width: size, height: size, borderRadius: '50%',
              border: `2px solid ${color}`,
              background: `radial-gradient(circle at 35% 30%, ${color}55 0%, ${color}22 50%, #000 95%)`,
              boxShadow: reduceFlashing ? 'none' : `0 0 34px ${color}66, inset 0 0 22px ${color}55`,
              cursor: 'pointer', color: '#fff', padding: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon size={size * 0.34} style={{ color }} />
            <div style={{
              marginTop: 4, fontSize: 8, letterSpacing: 2,
              fontFamily: 'monospace', color,
            }}>
              {t.hp}×
            </div>
          </motion.button>
        );
      })}
    </>
  );
}

// ────────── COLLECT STAGE ──────────
// Targets spawn at right edge, drift left across the stage, tap to collect
// before they exit. Cleared count tracks collected only.
function CollectStage({ count, color, verb, Icon, onHit, onCleared, reduceMotion, reduceFlashing, zone }) {
  const [targets, setTargets] = useState([]);
  const spawnedRef = useRef(0);
  const missedRef = useRef(0);

  useEffect(() => {
    spawnedRef.current = 0;
    missedRef.current = 0;
    setTargets([]);
    const iv = setInterval(() => {
      setTargets((ts) => {
        if (spawnedRef.current >= count + 3) return ts; // small buffer for missed
        spawnedRef.current += 1;
        return [
          ...ts,
          {
            id: spawnedRef.current,
            y: 28 + Math.random() * 48,
            born: Date.now(),
          },
        ];
      });
    }, 900);
    return () => clearInterval(iv);
  }, [count]);

  const tap = (id) => {
    setTargets((ts) => ts.filter((t) => t.id !== id));
    onHit();
    onCleared();
  };

  const expire = (id) => {
    setTargets((ts) => ts.filter((t) => t.id !== id));
    missedRef.current += 1;
  };

  return (
    <>
      {targets.map((t) => (
        <motion.button
          key={t.id}
          type="button"
          onClick={() => tap(t.id)}
          data-testid={`chamber-collect-target-${zone}-${t.id}`}
          initial={{ left: '105%', top: `${t.y}%`, opacity: 0 }}
          animate={{ left: reduceMotion ? '50%' : '-10%', opacity: [0, 1, 1, 0.8, 0] }}
          transition={{ duration: reduceMotion ? 8 : 7, ease: 'linear' }}
          onAnimationComplete={() => expire(t.id)}
          style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            width: 72, height: 72, borderRadius: '50%',
            border: `2px solid ${color}`,
            background: `radial-gradient(circle, ${color}55 0%, ${color}22 50%, transparent 80%)`,
            boxShadow: reduceFlashing ? 'none' : `0 0 26px ${color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, cursor: 'pointer', padding: 0,
          }}
        >
          <Icon size={28} />
          <span style={{
            position: 'absolute', top: 74, left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 8, letterSpacing: 2, fontFamily: 'monospace', color,
            whiteSpace: 'nowrap',
          }}>{verb}</span>
        </motion.button>
      ))}
    </>
  );
}

// ────────── RHYTHM STAGE ──────────
// A marker sweeps across a bar; tap when it enters the golden band (PHI zone).
function RhythmStage({ count, color, verb, Icon, onHit, onCleared, onFlash, reduceMotion, reduceFlashing, zone }) {
  const PERIOD_MS = 2200;
  const startRef = useRef(performance.now());
  const [tick, setTick] = useState(0);
  const hitsRef = useRef(0);
  const lastTapWasInZoneRef = useRef(false);

  useEffect(() => {
    let raf;
    const loop = () => {
      setTick((v) => v + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // position 0..1 across the bar, pendulum sin sweep
  const t = (performance.now() - startRef.current) % PERIOD_MS;
  const phase = t / PERIOD_MS;
  const pos = 0.5 + 0.48 * Math.sin(phase * Math.PI * 2);
  const PHI = 0.618;
  const bandHalf = 0.06;
  const inZone = Math.abs(pos - PHI) <= bandHalf;

  const onTap = () => {
    if (hitsRef.current >= count) return;
    if (inZone) {
      hitsRef.current += 1;
      onHit();
      onCleared();
      lastTapWasInZoneRef.current = true;
      try {
        onFlash(window.innerWidth * pos, window.innerHeight * 0.55);
      } catch { /* noop */ }
    } else {
      lastTapWasInZoneRef.current = false;
      // soft penalty: nothing, user retries
    }
  };

  // Suppress lint unused warnings for unused-but-API props we accept for uniformity
  void tick; void reduceMotion;

  return (
    <button
      type="button"
      onClick={onTap}
      data-testid={`chamber-rhythm-tap-${zone}`}
      style={{
        position: 'absolute', inset: 0,
        background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
      }}
      aria-label={verb}
    >
      {/* Rail */}
      <div style={{
        position: 'absolute', top: '55%', left: '8%', right: '8%',
        height: 10, borderRadius: 999,
        background: 'rgba(255,255,255,0.08)',
        border: `1px solid ${color}44`,
      }} />
      {/* PHI golden band */}
      <div style={{
        position: 'absolute', top: 'calc(55% - 8px)',
        left: `calc(8% + ${(PHI - bandHalf) * 84}%)`,
        width: `${bandHalf * 2 * 84}%`, height: 26,
        borderRadius: 6,
        background: `${color}33`,
        border: `1px solid ${color}`,
        boxShadow: reduceFlashing ? 'none' : `0 0 18px ${color}`,
      }}>
        <div style={{
          position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, letterSpacing: 3, color, fontFamily: 'monospace',
        }}>
          PHI · 0.618
        </div>
      </div>
      {/* Marker */}
      <div style={{
        position: 'absolute', top: 'calc(55% - 14px)',
        left: `calc(8% + ${pos * 84}%)`, transform: 'translateX(-50%)',
        width: 4, height: 38, borderRadius: 2,
        background: inZone ? color : '#fff',
        boxShadow: reduceFlashing ? 'none' : `0 0 18px ${inZone ? color : '#fff'}`,
      }} />
      {/* Center icon */}
      <div style={{
        position: 'absolute', top: '32%', left: '50%',
        transform: 'translate(-50%, -50%)',
        color, opacity: 0.85,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <Icon size={44} />
        <span style={{ fontSize: 10, letterSpacing: 3, fontFamily: 'monospace' }}>
          TAP TO {verb}
        </span>
      </div>
    </button>
  );
}
