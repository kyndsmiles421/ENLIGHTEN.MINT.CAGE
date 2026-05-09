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
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useSensory } from '../../context/SensoryContext';
import { useSovereignUniverse } from '../../context/SovereignUniverseContext';
// V68.64 — Knowledge-as-Substance bridge. The chamber reads the
// active entity from ContextBus.entityState (already broadcast by
// V68.62 InteractiveModule) and replaces abstract leaf/flame
// flashes with herb-specific gesture fragments + lesson topics.
import { readKey as busReadKey, subscribe as busSubscribe } from '../../state/ContextBus';
import {
  fragmentsFor,
  paceFor,
  teachOverrideFor,
} from '../../data/herbal_gestures';

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
  } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
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
  } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
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
  // V68.29 — Drill-down chain. After completion, the user can tap
  // "CONTINUE DEEPER →" to immediately swap this overlay into the next
  // stage without closing and reopening. Pass either a config object
  // ({ mode, verb, icon, title, targetCount, zone, completionMsg, … })
  // or an array of configs to chain automatically.
  nextGame = null,
  onGoDeeper = null,       // optional callback when user taps CONTINUE DEEPER
  // V68.30 — Education wiring. Each game can carry a `teach` payload:
  //   teach: { topic: "Grinding herbs with mortar and pestle",
  //            category: "herbology",
  //            context: "Explain the alchemical principle and real benefits" }
  // When the user completes the stage they'll see a LEARN button in the
  // completion card. Tapping it POSTs to /api/knowledge/deep-dive (GPT-5.2,
  // already live on the backend) and renders the returned markdown
  // inline — right where the action happened.
  teach = null,
}) {
  const sensory = useSensory() || {};
  const brain = useSovereignUniverse();
  const reduceFlashing = !!(sensory.prefs && sensory.prefs.reduceFlashing);
  const reduceMotion   = !!(sensory.prefs && sensory.prefs.reduceMotion);
  // V1.0.8 — Honor the auto-visuals preference. When OFF (or in calm
  // immersion), the chamber souvenir card on completion is suppressed
  // so the user is never surprised by AI-generated imagery they
  // didn't request. Defaults to true for backwards compatibility.
  const autoVisualsEnabled = sensory.autoVisualsEnabled !== false;

  // V68.29 — Drill-down chain state. If `nextGame` is provided the
  // completion card shows "CONTINUE DEEPER →" which swaps this overlay
  // into the next stage without closing. `chain` is the remaining
  // queue (supports arrays for multi-step drill-downs).
  const [chain, setChain] = useState(() => {
    if (!nextGame) return [];
    return Array.isArray(nextGame) ? [...nextGame] : [nextGame];
  });
  const [stageOverride, setStageOverride] = useState(null);
  useEffect(() => {
    // Reset the chain whenever the parent re-opens the game machine
    if (open) {
      setChain(nextGame ? (Array.isArray(nextGame) ? [...nextGame] : [nextGame]) : []);
      setStageOverride(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const effMode          = stageOverride?.mode          ?? mode;
  const effColor         = stageOverride?.color         ?? color;
  const effTitle         = stageOverride?.title         ?? title;
  const effVerb          = stageOverride?.verb          ?? verb;
  const effIcon          = stageOverride?.icon          ?? Icon;
  const effTargetCount   = stageOverride?.targetCount   ?? targetCount;
  const effHitsPerTarget = stageOverride?.hitsPerTarget ?? hitsPerTarget;
  const effZone          = stageOverride?.zone          ?? zone;
  const effCompletionMsg = stageOverride?.completionMsg ?? completionMsg;
  const effCompletionXP  = stageOverride?.completionXP  ?? completionXP;

  // Read the adaptive level for this zone (0 = first run).
  const levelKey = `emcafe_gamelvl_${effZone}`;
  const readLevel = () => {
    try {
      const v = parseInt(localStorage.getItem(levelKey) || '0', 10);
      return Number.isFinite(v) ? Math.max(0, Math.min(maxLevel, v)) : 0;
    } catch { return 0; }
  };
  const [level, setLevel] = useState(readLevel);
  const scaledTargetCount = progressive ? Math.min(effTargetCount + level, effTargetCount + maxLevel) : effTargetCount;
  const scaledHits        = progressive ? Math.min(effHitsPerTarget + Math.floor(level / 2), effHitsPerTarget + 5) : effHitsPerTarget;
  const scaledCompletionXP = progressive ? effCompletionXP + level * 2 : effCompletionXP;

  const [xp, setXp] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [done, setDone] = useState(false);
  const [flashAt, setFlashAt] = useState(null); // {x,y,key}

  // V1.0.8 — Chamber souvenir. When the user completes a chamber
  // session we fetch a personal "card" image from /ai-visuals/daily-card
  // (existing endpoint, already proven for the Daily Briefing flow).
  // The image is themed by the chamber zone + the active entity (herb,
  // rock, etc) so each session produces a unique, one-tap souvenir the
  // user can save or share. Caches to localStorage by (zone, entity)
  // so re-opening a completed chamber doesn't burn a fresh API call.
  const [souvenir, setSouvenir] = useState(null);
  const [souvenirLoading, setSouvenirLoading] = useState(false);

  // V68.64 — Read the active entity from ContextBus. When the user
  // opened Mint (or any herb) from the unified Inlay, the InteractiveModule
  // commits entityState. We pick that up here so the chamber's gestures,
  // pace, and lessons all bind to the herb the user is actually working
  // with — no more generic "Sacred Herbalism" filler.
  const [activeEntity, setActiveEntity] = useState(() => {
    try { return busReadKey('entityState')?.activeEntity || null; } catch { return null; }
  });
  const [activeEntityName, setActiveEntityName] = useState(() => {
    try { return busReadKey('entityState')?.name || null; } catch { return null; }
  });
  useEffect(() => {
    if (!open) return;
    // Re-read on open in case the user picked an herb just before launching.
    try {
      const es = busReadKey('entityState');
      setActiveEntity(es?.activeEntity || null);
      setActiveEntityName(es?.name || null);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    // Live subscribe so an entity swap mid-game (rare but possible) updates the fragments.
    const unsub = busSubscribe(() => {
      try {
        const es = busReadKey('entityState');
        setActiveEntity(es?.activeEntity || null);
        setActiveEntityName(es?.name || null);
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    });
    return unsub;
  }, [open]);

  // Knowledge fragments for THIS herb + THIS mode. Falls back to GENERIC.
  const fragments = useMemo(() => fragmentsFor(activeEntity, effMode), [activeEntity, effMode]);
  const pace = useMemo(() => paceFor(activeEntity), [activeEntity]);

  // V68.64 — Resolve the effective teach payload, layering an
  // herb-specific topic when the active entity has one (Mint →
  // "Peppermint harvest — the tear-not-cut technique..."). Falls
  // through to whatever the parent (Herbology page) declared.
  const effTeach = useMemo(() => {
    const base = stageOverride?.teach ?? teach;
    if (!base) return base;
    const override = teachOverrideFor(activeEntity, effMode);
    if (override) {
      return {
        ...base,
        topic: override,
        context: `${base.context || ''} The user is currently working with ${activeEntityName || 'this herb'}. Teach THIS herb specifically — its constituents, its preparation, its real-world use — not a generic herbalism overview.`.trim(),
      };
    }
    if (activeEntityName) {
      return {
        ...base,
        topic: `${base.topic} \u2014 applied to ${activeEntityName}`,
        context: `${base.context || ''} The user is currently working with ${activeEntityName}. Reference this herb specifically.`.trim(),
      };
    }
    return base;
  }, [stageOverride, teach, activeEntity, activeEntityName, effMode]);

  // V68.64 — Inline fragment that flashes near each tap. Replaces the
  // mute "+2 SPARKS" with an actual teaching shard.
  const [fragmentFlashes, setFragmentFlashes] = useState([]);
  const fragmentIndexRef = useRef(0);
  const showFragmentAt = useCallback((x, y) => {
    if (!fragments.length) return;
    const text = fragments[fragmentIndexRef.current % fragments.length];
    fragmentIndexRef.current += 1;
    const id = Date.now() + Math.random();
    setFragmentFlashes((arr) => [...arr.slice(-4), { id, text, x, y }]);
    setTimeout(() => {
      setFragmentFlashes((arr) => arr.filter((f) => f.id !== id));
    }, 2200);
  }, [fragments]);

  // V68.30 — inline lesson state for the LEARN button
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonText, setLessonText] = useState(null);
  // V1.0.8 — track the in-flight axios cancel token so the user can
  // abort a hung "TEACHING…" request instead of staring at it. The
  // backend `mode:'quick'` path targets 8-20s but if anything sticks
  // we let the user reclaim the UI immediately.
  const lessonAbortRef = useRef(null);
  const cancelLesson = useCallback(() => {
    try { lessonAbortRef.current?.abort?.('user-cancel'); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    lessonAbortRef.current = null;
    setLessonLoading(false);
  }, []);
  const loadLesson = useCallback(async () => {
    if (!effTeach?.topic) return;
    setLessonLoading(true);
    setLessonText(null);
    // Build an AbortController so the user can cancel the in-flight
    // request and reset the button to its idle state.
    const ctrl = new AbortController();
    lessonAbortRef.current = ctrl;
    try {
      const token = localStorage.getItem('zen_token');
      const headers = token && token !== 'guest_token' ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${API}/knowledge/deep-dive`,
        {
          topic: effTeach.topic,
          category: effTeach.category || 'general',
          // Chamber-fast path. ~500-word lesson in 8-20s so the user
          // gets a real teaching inside one breath cycle, not a hung
          // spinner that gets ingress-killed at 60s.
          mode: 'quick',
          context: effTeach.context || `Teach this in the context of the ${effZone} chamber activity.`,
        },
        { headers, timeout: 30000, signal: ctrl.signal },
      );
      setLessonText(res.data?.content || 'No teaching returned — try again.');
      try { fireBrain('learn', { topic: effTeach.topic }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    } catch (err) {
      // Distinguish user-cancel from a genuine failure so we don't
      // show an error toast when the user themselves aborted.
      if (axios.isCancel?.(err) || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        return;
      }
      setLessonText('The teaching could not load right now. Tap LEARN again to retry, or move on with the practice — your progress is safe.');
    } finally {
      lessonAbortRef.current = null;
      setLessonLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effTeach, effZone]);

  const fireBrain = useCallback((kind, meta = {}) => {
    try {
      const sig = brainSignal || `${effZone}:${effMode}:${kind}`;
      brain?.checkQuestLogic?.(sig, zone, { level, ...meta });
    } catch { /* brain unavailable — safe no-op */ }
  }, [brain, brainSignal, zone, mode, level]);

  const onHit = useCallback((tapEvent = null) => {
    setXp((v) => v + MICRO_SPARKS);
    creditSparks(zone, 2);
    haptic();
    fireBrain('hit');
    // V68.64 — Knowledge-as-substance: every tap surfaces a gesture
    // fragment (Mint → "tear, don't cut — menthol shatters under blade").
    try {
      const x = (tapEvent?.clientX ?? tapEvent?.touches?.[0]?.clientX) ?? null;
      const y = (tapEvent?.clientY ?? tapEvent?.touches?.[0]?.clientY) ?? null;
      if (x != null && y != null) showFragmentAt(x, y);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [zone, fireBrain, showFragmentAt]);

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
          } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
        }
        fireBrain('complete', { cleared: next, xp_awarded: scaledCompletionXP });
        try { onComplete?.({ level, cleared: next, xp: scaledCompletionXP }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }

        // V1.0.8 — Generate completion souvenir image. Themed by the
        // chamber zone + the active entity (herb, rock, etc). Cached
        // per (zone, entity) so re-completing a chamber re-uses the
        // existing card instead of burning credits. Gated by the
        // user's `autoVisuals` preference + immersion level — calm
        // mode and explicit opt-out both suppress the generation, in
        // which case the user gets the +XP message alone (no image).
        try {
          if (!autoVisualsEnabled) {
            // Respect user preference: no surprise media.
          } else {
            const entityKey = activeEntityName || effTeach?.topic || effZone || 'sovereign';
            const cacheKey = `chamber_souvenir:${effZone}:${entityKey}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              setSouvenir(cached);
            } else {
              setSouvenirLoading(true);
              const token = localStorage.getItem('zen_token');
              const headers = token && token !== 'guest_token'
                ? { Authorization: `Bearer ${token}` } : {};
              const theme = `${effZone || 'sovereign'} chamber · ${entityKey}`;
              const affirmation = `${entityKey} attuned · level ${level} · ${scaledCompletionXP} XP earned`;
              axios.post(
                `${API}/ai-visuals/daily-card`,
                { theme, affirmation: affirmation.slice(0, 150) },
                { headers, timeout: 60000 },
              ).then((r) => {
                if (r.data?.image_b64) {
                  setSouvenir(r.data.image_b64);
                  try { localStorage.setItem(cacheKey, r.data.image_b64); } catch { /* quota */ }
                }
              }).catch(() => { /* silent — souvenir is a bonus */ })
                .finally(() => setSouvenirLoading(false));
            }
          }
        } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      }
      return next;
    });
  }, [scaledTargetCount, zone, scaledCompletionXP, onComplete, progressive, level, levelKey, maxLevel, fireBrain, activeEntityName, effTeach, effZone, autoVisualsEnabled]);

  // Reset on every open — also re-read the adaptive level so repeated
  // sessions immediately reflect the progression.
  useEffect(() => {
    if (open) {
      setXp(0); setCleared(0); setDone(false); setFlashAt(null);
      setLessonText(null); setLessonLoading(false);
      setSouvenir(null); setSouvenirLoading(false);
      setLevel(readLevel());
      // Announce entry to the brain so quests that require "visit X" fire.
      try {
        brain?.checkQuestLogic?.(brainSignal || `${effZone}:${effMode}:enter`, zone);
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
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
        key={`mini-${effMode}-${effZone}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        style={{
          // Flatland-compliant: inline document flow, no fixed positioning,
          // no overlay, no backdrop-filter. Game lives WITHIN the page.
          position: 'relative',
          width: '100%',
          minHeight: '70vh',
          // V57.3 — environmental depth so the chamber doesn't render as a
          // pure black void. Subtle radial gradient with the chamber's
          // accent color gives the user a sense of "world".
          background: background || `
            radial-gradient(circle at 30% 30%, ${effColor}1A 0%, transparent 35%),
            radial-gradient(circle at 70% 70%, ${effColor}14 0%, transparent 40%),
            linear-gradient(180deg, rgba(8,10,18,0.96) 0%, rgba(4,6,15,0.98) 100%)
          `,
          borderRadius: 16,
          marginBottom: 16,
          padding: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start',
          userSelect: 'none', touchAction: 'manipulation',
          overflow: 'hidden',
        }}
        data-testid={`chamber-game-${effMode}-${effZone}`}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          data-testid={`chamber-game-close-${effZone}`}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(0,0,0,0.5)', border: `1px solid ${effColor}55`,
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
            {effTitle}{progressive && level > 0 ? ` · TIER ${level + 1}` : ''}
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 10, letterSpacing: 1.5, opacity: 0.75 }}>
            <span data-testid={`chamber-game-xp-${effZone}`}>+{xp} SPARKS · XP</span>
            <span data-testid={`chamber-game-progress-${effZone}`}>
              {Math.min(cleared, scaledTargetCount)}/{scaledTargetCount}
            </span>
            {/* V68.64 — Active herb chip. Lets the user see the
                gestures + lessons are bound to THIS herb. */}
            {activeEntityName && (
              <span
                data-testid="chamber-active-entity"
                style={{
                  letterSpacing: 1.5,
                  opacity: 0.95,
                  color: effColor,
                  textShadow: `0 0 8px ${effColor}40`,
                }}
              >
                · WORKING WITH {activeEntityName.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* V68.64 — Early LEARN button. The lesson is no longer gated
            behind completion; the user can read about THIS herb's
            technique BEFORE the work, DURING the work, or AFTER.
            V1.0.8 — flips to a CANCEL affordance while loading so a
            slow teaching can be aborted instead of trapping the UI. */}
        {effTeach?.topic && !lessonText && !done && (
          <button
            type="button"
            onClick={lessonLoading ? cancelLesson : loadLesson}
            data-testid={`chamber-learn-first-${effZone}`}
            style={{
              position: 'absolute', top: 56, right: 14,
              background: `${effColor}10`,
              border: `1px solid ${effColor}55`,
              color: effColor,
              borderRadius: 999, padding: '6px 12px',
              fontSize: 9, letterSpacing: 1.5,
              fontFamily: 'monospace',
              cursor: 'pointer',
              opacity: 0.85,
              zIndex: 4,
            }}
          >
            {lessonLoading ? 'TEACHING\u2026 \u00B7 TAP TO CANCEL' : '\u2726 TEACH ME FIRST'}
          </button>
        )}

        {/* V68.64 — Fragment flash overlay. Each tap surfaces a
            herb-specific knowledge fragment near the tap site. The
            gesture IS the teaching. */}
        <AnimatePresence>
          {fragmentFlashes.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.85 }}
              animate={{ opacity: 1, y: -28, scale: 1 }}
              exit={{ opacity: 0, y: -56 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              data-testid="chamber-fragment-flash"
              style={{
                position: 'fixed',
                left: f.x, top: f.y,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                fontFamily: 'monospace',
                fontSize: 11,
                letterSpacing: 0.6,
                color: effColor,
                background: 'rgba(0,0,0,0.55)',
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${effColor}55`,
                textShadow: `0 0 8px ${effColor}80`,
                whiteSpace: 'nowrap',
                maxWidth: 'min(80vw, 360px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                zIndex: 6,
              }}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Mode-specific stage */}
        {mode === 'break' && (
          <BreakStage
            count={scaledTargetCount}
            hits={scaledHits}
            color={effColor}
            verb={effVerb}
            Icon={effIcon}
            onHit={onHit}
            onCleared={onTargetCleared}
            reduceFlashing={reduceFlashing}
            reduceMotion={reduceMotion}
            zone={effZone}
          />
        )}
        {mode === 'collect' && (
          <CollectStage
            count={scaledTargetCount}
            color={effColor}
            verb={effVerb}
            Icon={effIcon}
            onHit={onHit}
            onCleared={onTargetCleared}
            reduceMotion={reduceMotion}
            reduceFlashing={reduceFlashing}
            zone={effZone}
          />
        )}
        {mode === 'rhythm' && (
          <RhythmStage
            count={scaledTargetCount}
            color={effColor}
            verb={effVerb}
            Icon={effIcon}
            onHit={onHit}
            onCleared={onTargetCleared}
            onFlash={(x, y) => setFlashAt({ x, y, key: Date.now() })}
            reduceMotion={reduceMotion}
            reduceFlashing={reduceFlashing}
            zone={effZone}
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
                background: `radial-gradient(circle, ${effColor}66 0%, transparent 70%)`,
                border: `2px solid ${effColor}`,
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
                border: `1px solid ${effColor}80`,
                borderRadius: 14,
                textAlign: 'center', fontFamily: 'monospace',
                boxShadow: reduceFlashing ? 'none' : `0 0 40px ${effColor}66`,
              }}
              data-testid={`chamber-game-done-${effZone}`}
            >
              <div style={{ fontSize: 10, letterSpacing: 3, color, marginBottom: 6 }}>
                {effCompletionMsg}
              </div>
              <div style={{ fontSize: 13, color: '#fff', letterSpacing: 2 }}>
                +{scaledCompletionXP} BONUS SPARKS
              </div>

              {/* V1.0.8 — Chamber souvenir card (auto-generated on
                  completion via /ai-visuals/daily-card). Each card is
                  unique to this zone × entity. The user can long-press
                  to save the image just like any other native image. */}
              {(souvenirLoading || souvenir) && (
                <div
                  data-testid={`chamber-game-souvenir-${effZone}`}
                  style={{
                    marginTop: 10,
                    width: 168,
                    aspectRatio: '3 / 4',
                    margin: '10px auto 0',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${effColor}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 24px ${effColor}33`,
                  }}
                >
                  {souvenirLoading && (
                    <span style={{
                      fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.55)',
                      fontFamily: 'monospace', textAlign: 'center', padding: 8,
                    }}>
                      MINTING<br/>SOUVENIR…
                    </span>
                  )}
                  {!souvenirLoading && souvenir && (
                    <img
                      src={souvenir}
                      alt={`${effZone} souvenir`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
              )}

              {effTeach?.topic && !lessonText && (
                <button
                  type="button"
                  onClick={lessonLoading ? cancelLesson : loadLesson}
                  data-testid={`chamber-game-learn-${effZone}`}
                  style={{
                    marginTop: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px dashed rgba(255,255,255,0.35)',
                    color: '#fff',
                    padding: '6px 14px', borderRadius: 999,
                    fontSize: 9, letterSpacing: 3, cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  {lessonLoading ? 'TEACHING\u2026 \u00B7 TAP TO CANCEL' : `LEARN \u00B7 ${effTeach.topic.toUpperCase()}`}
                </button>
              )}

              {lessonText && (
                <div
                  data-testid={`chamber-game-lesson-${effZone}`}
                  style={{
                    marginTop: 10,
                    maxHeight: 220,
                    overflowY: 'auto',
                    textAlign: 'left',
                    fontSize: 10, lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.82)',
                    padding: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  {lessonText}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                {chain.length > 0 && (
                  <button
                    type="button"
                    data-testid={`chamber-game-deeper-${effZone}`}
                    onClick={() => {
                      const [next, ...rest] = chain;
                      setChain(rest);
                      setStageOverride(next);
                      // Reset in-stage state so the next level starts clean
                      setXp(0); setCleared(0); setDone(false); setFlashAt(null);
                      setLessonText(null); setLessonLoading(false);
                      setLevel(() => {
                        try {
                          const v = parseInt(localStorage.getItem(`emcafe_gamelvl_${next.zone || effZone}`) || '0', 10);
                          return Number.isFinite(v) ? v : 0;
                        } catch { return 0; }
                      });
                      try { onGoDeeper?.(next, rest); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
                      try { fireBrain('go_deeper', { next_zone: next.zone }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
                    }}
                    style={{
                      background: `${effColor}`, border: `1px solid ${effColor}`,
                      color: '#000', fontWeight: 600,
                      padding: '6px 14px', borderRadius: 999,
                      fontSize: 10, letterSpacing: 2, cursor: 'pointer',
                      fontFamily: 'monospace',
                    }}
                  >
                    CONTINUE DEEPER →
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  data-testid={`chamber-game-finish-${effZone}`}
                  style={{
                    background: `${effColor}22`,
                    border: `1px solid ${effColor}`,
                    color,
                    padding: '6px 14px', borderRadius: 999,
                    fontSize: 10, letterSpacing: 2, cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  EXIT CHAMBER
                </button>
              </div>
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
          {mode === 'break'   && `TAP EACH TARGET ${scaledHits}× TO ${effVerb}`}
          {mode === 'collect' && `TAP THE FLOATING ${effVerb} BEFORE THEY DRIFT OFF`}
          {mode === 'rhythm'  && `TAP WHEN THE MARKER ALIGNS WITH THE GOLDEN BAND`}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────────── BREAK STAGE ──────────
// N targets sit statically at random positions. Each needs `hits` taps.
function BreakStage({ count, hits, color, verb, Icon, onHit, onCleared, reduceFlashing, reduceMotion, zone }) {
  // V57.3 — distribute targets evenly across the chamber instead of pure
  // random clustering. Splits the stage into a quasi-grid then jitters
  // each cell so it still feels organic but every target is visible
  // and reachable.
  const [targets, setTargets] = useState(() => {
    const cols = count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);
    return Array.from({ length: count }).map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const xCell = (100 / cols) * col + (100 / cols) / 2;
      const yCell = 18 + ((100 - 35) / Math.max(1, rows - 1 || 1)) * row;
      return {
        id: i,
        x: Math.max(14, Math.min(86, xCell + (Math.random() - 0.5) * 14)),
        y: Math.max(20, Math.min(82, yCell + (Math.random() - 0.5) * 10)),
        hp: hits,
        cleared: false,
      };
    });
  });
  const tap = (id, e) => {
    setTargets((ts) => ts.map((t) => {
      if (t.id !== id || t.cleared) return t;
      const hp = t.hp - 1;
      if (hp <= 0) {
        onCleared();
        return { ...t, hp: 0, cleared: true };
      }
      return { ...t, hp };
    }));
    onHit(e);
  };
  return (
    <>
      {/* V57.3 — Ambient depth particles so the chamber doesn't look like an empty void.
          Drift slowly behind the targets, giving the user a sense of "world" without
          competing for attention. CSS-only, GPU-accelerated. */}
      {!reduceMotion && Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={`amb-${i}`}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            x: [0, (Math.random() - 0.5) * 60],
            y: [0, (Math.random() - 0.5) * 60],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            delay: i * 0.35,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${5 + Math.random() * 90}%`,
            top: `${10 + Math.random() * 80}%`,
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            borderRadius: '50%',
            background: color,
            boxShadow: reduceFlashing ? 'none' : `0 0 8px ${color}`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
      {targets.map((t) => {
        if (t.cleared) return null;
        const progress = 1 - t.hp / hits;
        const size = 92 - progress * 16;
        return (
          <motion.button
            key={t.id}
            type="button"
            onClick={(e) => tap(t.id, e)}
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
              cursor: 'pointer', color: '#fff', padding: 0, zIndex: 2,
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

  const tap = (id, e) => {
    setTargets((ts) => ts.filter((t) => t.id !== id));
    onHit(e);
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

  const onTap = (e) => {
    if (hitsRef.current >= count) return;
    if (inZone) {
      hitsRef.current += 1;
      onHit(e);
      onCleared();
      lastTapWasInZoneRef.current = true;
      try {
        onFlash(window.innerWidth * pos, window.innerHeight * 0.55);
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
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
