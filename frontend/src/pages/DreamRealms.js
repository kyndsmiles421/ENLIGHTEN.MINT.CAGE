import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import {
  ArrowLeft, Zap, Star, Target, CheckCircle2,
  ChevronRight, Play, XCircle, Trophy,
  Music, Flame, Droplets, Mountain, Gem, Sprout,
  Eye, Clock, Award, Skull, Shield
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EL_COLORS = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };
const EL_ICONS = { wood: Sprout, fire: Flame, earth: Mountain, metal: Gem, water: Droplets };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  RULE 1: ENTROPY — Harmony Score → Lens Clarity
//  High=crisp, Low=blur+flicker+derez
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function EntropyLayer({ harmony }) {
  // 0-100 harmony → visual quality
  const blur = harmony >= 80 ? 0 : harmony >= 50 ? 0.5 : harmony >= 30 ? 1.5 : 3;
  const saturation = harmony >= 80 ? 1.1 : harmony >= 50 ? 1 : harmony >= 30 ? 0.8 : 0.5;
  const contrast = harmony >= 80 ? 1.05 : harmony >= 50 ? 1 : 0.9;
  const flickerOpacity = harmony < 40 ? 0.06 : 0;

  return (
    <>
      {/* Blur + desaturation overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backdropFilter: blur > 0 ? `blur(${blur}px) saturate(${saturation}) contrast(${contrast})` : 'none',
        }} />
      {/* Low harmony flicker */}
      {flickerOpacity > 0 && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[2]"
          animate={{
            opacity: [0, flickerOpacity, 0, flickerOpacity * 0.5, 0],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'steps(5)' }}
          style={{ background: 'rgba(255,255,255,0.03)' }} />
      )}
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  RULE 2: ELEMENTAL TINTING — Dominant element → color grade
//  Wood=green sway, Fire=bloom haze, Water=blue refraction,
//  Earth=amber weight, Metal=silver shimmer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ElementalTintLayer({ dominantElement, dominantPercentage }) {
  const intensity = Math.min(0.12, (dominantPercentage - 20) * 0.004);
  if (intensity <= 0) return null;

  const tintConfig = {
    wood: {
      gradient: `radial-gradient(ellipse at 50% 60%, rgba(34,197,94,${intensity}), transparent 70%)`,
      animation: { x: [0, 3, -3, 0], y: [0, 2, -1, 0] },
      duration: 6,
    },
    fire: {
      gradient: `radial-gradient(ellipse at 50% 40%, rgba(239,68,68,${intensity}), transparent 65%)`,
      animation: { scale: [1, 1.02, 1], opacity: [intensity, intensity * 1.5, intensity] },
      duration: 3,
    },
    water: {
      gradient: `radial-gradient(ellipse at 50% 70%, rgba(59,130,246,${intensity}), transparent 75%)`,
      animation: { y: [0, -2, 2, 0], opacity: [intensity * 0.8, intensity, intensity * 0.8] },
      duration: 8,
    },
    earth: {
      gradient: `radial-gradient(ellipse at 50% 80%, rgba(245,158,11,${intensity}), transparent 60%)`,
      animation: { y: [0, 1, 0] },
      duration: 10,
    },
    metal: {
      gradient: `radial-gradient(ellipse at 30% 30%, rgba(148,163,184,${intensity}), transparent 70%)`,
      animation: { x: [0, 5, 0], opacity: [intensity * 0.6, intensity, intensity * 0.6] },
      duration: 5,
    },
  };

  const config = tintConfig[dominantElement] || tintConfig.water;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-[3]"
      animate={config.animation}
      transition={{ duration: config.duration, repeat: Infinity, ease: 'easeInOut' }}
      style={{ background: config.gradient }}
    />
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  RULE 3: DECAY DISTORTION — Inactivity → glitch shift
//  Day 1-2: solid. Day 3+: wireframe flickers, symbol vibration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DecayDistortionLayer({ avgFreshness, difficulty }) {
  // avgFreshness 0-100, lower = more decay distortion
  const decayIntensity = Math.max(0, (100 - avgFreshness) / 100);
  if (decayIntensity < 0.3) return null;

  const glitchCount = Math.min(8, Math.round(decayIntensity * 10));

  return (
    <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden">
      {/* Scan line effect for high decay */}
      {decayIntensity > 0.5 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(255,255,255,${decayIntensity * 0.015}) 3px,
              rgba(255,255,255,${decayIntensity * 0.015}) 4px
            )`,
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatType: 'loop' }}
        />
      )}
      {/* Glitch-shift blocks */}
      {[...Array(glitchCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: `${12 + i * 5}px`,
            height: '2px',
            background: `rgba(255,255,255,${decayIntensity * 0.08})`,
            top: `${10 + i * 12}%`,
            left: `${5 + i * 8}%`,
          }}
          animate={{
            x: [0, (i % 2 === 0 ? 6 : -6) * decayIntensity, 0],
            opacity: [0, decayIntensity * 0.15, 0],
          }}
          transition={{
            duration: 0.15 + Math.random() * 0.3,
            repeat: Infinity,
            repeatDelay: 2 + Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  RULE 4: GEOMETRIC FRACTURING — Destructive cycle → jagged edges
//  When elements attack each other, environment fractures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FractureLayer({ cycle, harmony }) {
  if (cycle !== 'destructive' && harmony >= 50) return null;

  const fractureCount = cycle === 'destructive' ? 6 : harmony < 30 ? 4 : 2;
  const fractureOpacity = cycle === 'destructive' ? 0.06 : 0.03;

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {[...Array(fractureCount)].map((_, i) => {
        const angle = 15 + i * 30;
        const x = 10 + i * 15;
        const y = 20 + i * 10;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: `${40 + i * 20}px`,
              height: '1px',
              background: `linear-gradient(90deg, transparent, rgba(239,68,68,${fractureOpacity}), transparent)`,
              top: `${y}%`,
              left: `${x}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'center',
            }}
            animate={{
              opacity: [0, fractureOpacity, fractureOpacity * 0.5, 0],
              scaleX: [0.5, 1, 0.8, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        );
      })}
      {/* Corner fracture indicators */}
      {cycle === 'destructive' && (
        <>
          <motion.div className="absolute top-2 left-2 w-8 h-8"
            style={{ borderTop: '1px solid rgba(239,68,68,0.08)', borderLeft: '1px solid rgba(239,68,68,0.08)' }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }} />
          <motion.div className="absolute bottom-2 right-2 w-8 h-8"
            style={{ borderBottom: '1px solid rgba(239,68,68,0.08)', borderRight: '1px solid rgba(239,68,68,0.08)' }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
        </>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  RULE 5: MANTRA FEEDBACK — Frequency play → cleaning ripple
//  Triggered on challenge completion, clears distortion momentarily
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MantraRipple({ active, color }) {
  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-[10] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          initial={{ width: 10, height: 10, opacity: 0.6 }}
          animate={{
            width: [10, 400],
            height: [10, 400],
            opacity: [0.4, 0],
            borderWidth: [3, 1],
          }}
          transition={{ duration: 2, delay: i * 0.4, ease: 'easeOut' }}
          style={{
            border: `2px solid ${color || '#A855F7'}30`,
            boxShadow: `0 0 20px ${color || '#A855F7'}15`,
          }}
        />
      ))}
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MASTER DISTORTION COMPOSITOR
//  Combines all 5 rules into a single overlay system
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DistortionCompositor({ harmony, elements, decay, cycle, difficulty, mantraActive, mantraColor }) {
  // Determine dominant element
  const dominant = useMemo(() => {
    let maxPct = 0;
    let maxEl = 'water';
    if (elements) {
      Object.entries(elements).forEach(([eid, e]) => {
        const pct = e?.percentage || 0;
        if (pct > maxPct) { maxPct = pct; maxEl = eid; }
      });
    }
    return { element: maxEl, percentage: maxPct };
  }, [elements]);

  const avgFreshness = useMemo(() => {
    if (!decay) return 100;
    const vals = Object.values(decay);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 100;
  }, [decay]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" data-testid="distortion-compositor">
      <EntropyLayer harmony={harmony} />
      <ElementalTintLayer dominantElement={dominant.element} dominantPercentage={dominant.percentage} />
      <DecayDistortionLayer avgFreshness={avgFreshness} difficulty={difficulty?.difficulty || 1} />
      <FractureLayer cycle={cycle} harmony={harmony} />
      <AnimatePresence>
        {mantraActive && <MantraRipple active={mantraActive} color={mantraColor} />}
      </AnimatePresence>
    </div>
  );
}

// ── Escape Progress Gauge ──
function EscapeGauge({ current, threshold }) {
  const progress = Math.min(100, (current / threshold) * 100);
  const color = progress >= 100 ? '#22C55E' : progress >= 60 ? '#F59E0B' : '#EF4444';
  const canEscape = current >= threshold;

  return (
    <div className="mb-4" data-testid="escape-gauge">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Escape Velocity
        </span>
        <span className="text-[9px] font-bold" style={{ color }}>
          {current} / {threshold}
        </span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: canEscape ? `0 0 12px ${color}60` : 'none',
          }}>
          {canEscape && (
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
          )}
        </motion.div>
      </div>
      <p className="text-[7px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {canEscape
          ? 'Harmony threshold reached — complete a challenge to break the loop'
          : `Raise Harmony to ${threshold} through wellness practices`}
      </p>
    </div>
  );
}

// ── Loop Challenge Card ──
function ChallengeCard({ challenge, index, onComplete, realmColor, completing }) {
  const done = challenge.completed;
  const freq = challenge.frequency;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl p-3 mb-2"
      style={{
        background: done ? 'rgba(34,197,94,0.04)' : `${realmColor}06`,
        border: `1px solid ${done ? 'rgba(34,197,94,0.12)' : `${realmColor}12`}`,
      }}
      data-testid={`challenge-${index}`}>
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: done ? 'rgba(34,197,94,0.08)' : `${realmColor}10` }}>
          {done ? <CheckCircle2 size={13} style={{ color: '#22C55E' }} />
            : <Target size={13} style={{ color: realmColor }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium mb-0.5"
            style={{ color: done ? '#22C55E' : 'var(--text-primary)' }}>
            {challenge.task}
          </p>
          {freq && freq.label && !done && (
            <div className="flex items-center gap-1.5 mb-1 px-2 py-0.5 rounded"
              style={{ background: `${realmColor}06` }}>
              <Play size={7} style={{ color: realmColor }} />
              <span className="text-[7px]" style={{ color: realmColor }}>{freq.label}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
              +{challenge.xp} XP | +{challenge.harmony_boost} Harmony
            </span>
            {!done && (
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => onComplete(index)}
                disabled={completing === index}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[7px] font-medium"
                style={{ background: `${realmColor}12`, color: realmColor, border: `1px solid ${realmColor}20`, opacity: completing === index ? 0.5 : 1 }}
                data-testid={`complete-challenge-${index}`}>
                <Zap size={8} /> {completing === index ? 'Resolving...' : 'Resolve'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Legendary Frequency Card ──
function LegendaryCard({ frequency }) {
  const rarityColor = { legendary: '#FCD34D', epic: '#A855F7', mythic: '#EF4444' }[frequency.rarity] || '#FCD34D';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-3 mb-2 relative overflow-hidden"
      style={{ background: `${rarityColor}06`, border: `1px solid ${rarityColor}15` }}
      data-testid="legendary-freq">
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ background: `radial-gradient(circle at 50% 50%, ${rarityColor}20, transparent 70%)` }}
      />
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${rarityColor}12`, border: `1px solid ${rarityColor}20` }}>
          <Music size={16} style={{ color: rarityColor }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[10px] font-bold" style={{ color: rarityColor }}>{frequency.hz} Hz</p>
            <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase font-bold"
              style={{ background: `${rarityColor}15`, color: rarityColor }}>
              {frequency.rarity}
            </span>
          </div>
          <p className="text-[9px]" style={{ color: 'var(--text-primary)' }}>{frequency.name}</p>
          <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
            Mantra: {frequency.mantra_combo} | {frequency.discovery_note}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Difficulty Badge ──
function DifficultyBadge({ difficulty }) {
  const { state, difficulty: level } = difficulty;
  const Icon = state === 'tightening' ? Skull : state === 'expanding' ? Shield : Eye;
  const color = state === 'tightening' ? '#EF4444' : state === 'expanding' ? '#22C55E' : '#F59E0B';

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
      style={{ background: `${color}08`, border: `1px solid ${color}12` }}
      data-testid="difficulty-badge">
      <Icon size={10} style={{ color }} />
      <span className="text-[8px] font-medium capitalize" style={{ color }}>
        {state} ({level.toFixed(1)}x)
      </span>
    </div>
  );
}

// ── Loop Broken Celebration ──
function LoopBrokenOverlay({ result, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onDismiss}
      data-testid="loop-broken-overlay">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} />
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(252,211,77,0.2)' }}
        onClick={e => e.stopPropagation()}>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <Trophy size={40} className="mx-auto mb-3" style={{ color: '#FCD34D', filter: 'drop-shadow(0 0 12px rgba(252,211,77,0.4))' }} />
        </motion.div>
        <h3 className="text-lg font-bold mb-1" style={{ color: '#FCD34D', fontFamily: 'Cormorant Garamond, serif' }}>
          Loop Shattered
        </h3>
        <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
          {result.message}
        </p>
        {result.legendary_frequency && <LegendaryCard frequency={result.legendary_frequency} />}
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="text-[9px] px-2 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
            +{result.bonus_xp} XP
          </span>
          <span className="text-[9px] px-2 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6' }}>
            +{result.bonus_dust} Dust
          </span>
        </div>
        {result.decoded_modifier_element && (
          <p className="text-[7px] mt-2" style={{ color: '#A855F7' }}>
            Nexus modifier unlocked: +2 {result.decoded_modifier_element} resonance
          </p>
        )}
        <button onClick={onDismiss}
          className="mt-4 w-full py-2 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(252,211,77,0.1)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.2)' }}
          data-testid="dismiss-loop-broken">
          Enter the Void
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Tighten Warning Banner ──
function TightenBanner({ iteration }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-xl p-3 mb-3"
      style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
      data-testid="tighten-banner">
      <div className="flex items-center gap-2">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Skull size={14} style={{ color: '#EF4444' }} />
        </motion.div>
        <div>
          <p className="text-[9px] font-semibold" style={{ color: '#EF4444' }}>Loop Tightened — Iteration {iteration + 1}</p>
          <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
            The realm distorts further. Challenges intensify. Practice your wellness tools to escape.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function DreamRealms() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const headers = authHeaders;
  const [realm, setRealm] = useState(null);
  const [nexus, setNexus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [loopResult, setLoopResult] = useState(null);
  const [mantraRipple, setMantraRipple] = useState(false);
  const [mantraColor, setMantraColor] = useState('#A855F7');
  const [tab, setTab] = useState('realm');
  const [history, setHistory] = useState([]);
  const [legendaries, setLegendaries] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [realmRes, nexusRes] = await Promise.all([
        axios.get(`${API}/dream-realms/active`, { headers }),
        axios.get(`${API}/nexus/state`, { headers }),
      ]);
      setRealm(realmRes.data);
      setNexus(nexusRes.data);
      setError(null);
    } catch (err) {
      setError(getCosmicErrorMessage(err));
    }
    setLoading(false);
  }, [headers]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/dream-realms/history`, { headers });
      setHistory(res.data.realms || []);
    } catch {}
  }, [headers]);

  const fetchLegendaries = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/dream-realms/legendary-frequencies`, { headers });
      setLegendaries(res.data.frequencies || []);
    } catch {}
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (tab === 'history') fetchHistory(); }, [tab, fetchHistory]);
  useEffect(() => { if (tab === 'legendary') fetchLegendaries(); }, [tab, fetchLegendaries]);

  const completeChallenge = async (index) => {
    setCompleting(index);
    try {
      const challenge = realm?.challenges?.[index];
      const freq = challenge?.frequency;

      const res = await axios.post(`${API}/dream-realms/complete-challenge`,
        { challenge_index: index }, { headers });

      // Trigger Rule 5: Mantra cleaning ripple
      const rippleColor = freq?.hz
        ? EL_COLORS[realm?.biome?.challenge_element] || '#A855F7'
        : '#A855F7';
      setMantraColor(rippleColor);
      setMantraRipple(true);
      setTimeout(() => setMantraRipple(false), 2500);

      if (res.data.loop_broken && res.data.loop_result) {
        setLoopResult(res.data.loop_result);
        toast('The loop shatters!');
      } else if (res.data.loop_tightened) {
        toast('The loop tightens...');
        fetchData();
      } else {
        toast(`Challenge resolved! +${res.data.xp_awarded} XP`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to complete challenge');
    }
    setCompleting(null);
  };

  const abandonRealm = async () => {
    try {
      await axios.post(`${API}/dream-realms/abandon`, {}, { headers });
      toast('Dream Realm abandoned');
      setRealm(null);
      setLoading(true);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to abandon');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <CosmicInlineLoader message="Weaving your Dream Realm..." />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <CosmicError title={error.title} message={error.message} onRetry={fetchData} />
    </div>
  );

  const biome = realm?.biome || {};
  const difficulty = realm?.difficulty || {};
  const realmColor = biome.color_primary || '#A855F7';
  const challenges = realm?.challenges || [];
  const elementsSnapshot = realm?.elements_snapshot || {};
  const harmony = nexus?.harmony_score ?? realm?.current_harmony ?? 50;
  const nexusCycle = nexus?.harmony_cycle || 'neutral';
  const nexusDecay = nexus?.decay_activity || {};
  const nexusElements = nexus?.elements || {};

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }} data-testid="dream-realms-page">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)' }} data-testid="dream-back-btn">
          <ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Dream Realms</h1>
          <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
            Procedural Loops — Visuals mirror your inner state
          </p>
        </div>
        <button onClick={() => navigate('/nexus')}
          className="text-[8px] px-2 py-1 rounded-lg"
          style={{ background: 'rgba(168,85,247,0.06)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.1)' }}
          data-testid="nexus-link">
          Nexus
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-2 mb-4" data-testid="dream-tabs">
        {[
          { id: 'realm', label: 'Active Realm', icon: Eye },
          { id: 'history', label: 'Past Loops', icon: Clock },
          { id: 'legendary', label: 'Discoveries', icon: Award },
        ].map(t => {
          const TIcon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium transition-all"
              style={{
                background: tab === t.id ? `${realmColor}12` : 'rgba(255,255,255,0.02)',
                color: tab === t.id ? realmColor : 'var(--text-muted)',
                border: `1px solid ${tab === t.id ? `${realmColor}20` : 'rgba(255,255,255,0.04)'}`,
              }}
              data-testid={`tab-${t.id}`}>
              <TIcon size={10} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-4">
        {tab === 'realm' && realm && (
          <>
            {/* Tighten warning */}
            {(realm.loop_iteration || 0) > 0 && <TightenBanner iteration={realm.loop_iteration} />}

            {/* Realm Card with full distortion compositor */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 mb-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${biome.color_ambient || '#1a1a2e'}E0, ${biome.color_primary || '#A855F7'}08)`,
                border: `1px solid ${realmColor}15`,
                minHeight: 180,
              }}
              data-testid="realm-card">

              {/* ── 5-RULE DISTORTION COMPOSITOR ── */}
              <DistortionCompositor
                harmony={harmony}
                elements={nexusElements}
                decay={nexusDecay}
                cycle={nexusCycle}
                difficulty={difficulty}
                mantraActive={mantraRipple}
                mantraColor={mantraColor}
              />

              <div className="relative z-[20]">
                {/* Realm name + cosmic context */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-bold" style={{ color: realmColor, fontFamily: 'Cormorant Garamond, serif' }}>
                      {biome.name || 'Dream Realm'}
                    </h2>
                    <p className="text-[7px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {biome.atmosphere} | Loop {(realm.loop_iteration || 0) + 1}
                    </p>
                  </div>
                  <DifficultyBadge difficulty={difficulty} />
                </div>

                {/* Narrative */}
                <p className="text-[10px] leading-relaxed mb-3 italic"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  {realm.tighten_narrative || realm.narrative || 'The realm awaits...'}
                </p>

                {/* Distortion legend — tells user what's happening */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-[6px] px-1.5 py-0.5 rounded-full" style={{
                    background: harmony >= 80 ? 'rgba(34,197,94,0.08)' : harmony >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                    color: harmony >= 80 ? '#22C55E' : harmony >= 50 ? '#F59E0B' : '#EF4444',
                  }}>
                    Entropy: {harmony >= 80 ? 'Clear' : harmony >= 50 ? 'Shifting' : harmony >= 30 ? 'Blurred' : 'De-Rezzed'}
                  </span>
                  <span className="text-[6px] px-1.5 py-0.5 rounded-full" style={{ background: `${realmColor}08`, color: realmColor }}>
                    Tint: {biome.imbalance_element || 'Balanced'}
                  </span>
                  {nexusCycle === 'destructive' && (
                    <span className="text-[6px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                      Fracturing
                    </span>
                  )}
                </div>

                {/* Element snapshot */}
                <div className="flex items-center gap-2 mb-2">
                  {['wood', 'fire', 'earth', 'metal', 'water'].map(eid => {
                    const el = elementsSnapshot[eid] || {};
                    const ElIcon = EL_ICONS[eid] || Star;
                    const isTarget = biome.challenge_element === eid;
                    return (
                      <motion.div
                        key={eid}
                        animate={isTarget ? { scale: [1, 1.1, 1] } : {}}
                        transition={isTarget ? { duration: 2, repeat: Infinity } : {}}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px]"
                        style={{
                          background: isTarget ? `${EL_COLORS[eid]}15` : 'rgba(255,255,255,0.02)',
                          color: EL_COLORS[eid],
                          border: isTarget ? `1px solid ${EL_COLORS[eid]}30` : '1px solid transparent',
                        }}>
                        <ElIcon size={8} />
                        <span>{el.percentage?.toFixed(0) || 20}%</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Cosmic context */}
                {realm.cosmic_context && (
                  <div className="flex items-center gap-2 text-[7px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{realm.cosmic_context.zodiac} Season</span>
                    <span>|</span>
                    <span>Natal: {realm.cosmic_context.natal_sign}</span>
                    <span>|</span>
                    <span>{realm.cosmic_context.element} Weather</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Escape Gauge */}
            <EscapeGauge
              current={harmony}
              threshold={realm.escape_threshold || 60}
            />

            {/* Challenges */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Target size={11} style={{ color: realmColor }} />
                  <p className="text-[9px] font-semibold" style={{ color: realmColor }}>
                    Loop Challenges ({realm.challenges_completed || 0}/{challenges.length})
                  </p>
                </div>
                {biome.challenge_element && (
                  <span className="text-[7px] px-1.5 py-0.5 rounded"
                    style={{ background: `${EL_COLORS[biome.challenge_element]}10`, color: EL_COLORS[biome.challenge_element] }}>
                    {biome.challenge_element} alignment
                  </span>
                )}
              </div>
              {challenges.map((ch, i) => (
                <ChallengeCard
                  key={i}
                  challenge={ch}
                  index={i}
                  onComplete={completeChallenge}
                  realmColor={realmColor}
                  completing={completing}
                />
              ))}
            </div>

            {/* Loop Mechanics Info */}
            <div className="rounded-xl p-3 mb-4"
              style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
              data-testid="loop-mechanics">
              <p className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Distortion Rules Active
              </p>
              <div className="space-y-1">
                <p className="text-[8px]" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#EF4444' }}>Entropy:</span> {harmony < 40 ? 'Low harmony causes blur and flicker' : harmony < 80 ? 'Moderate clarity' : 'Clear lens — high harmony'}
                </p>
                <p className="text-[8px]" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: realmColor }}>Tint:</span> {biome.imbalance_element ? `${biome.imbalance_element} dominance colors the environment` : 'Balanced tinting'}
                </p>
                <p className="text-[8px]" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#F59E0B' }}>Decay:</span> {difficulty.description}
                </p>
                {nexusCycle === 'destructive' && (
                  <p className="text-[8px]" style={{ color: '#EF4444' }}>
                    <span>Fracture:</span> Destructive cycle detected — geometry breaking
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 text-[7px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                <span>Difficulty: {difficulty.difficulty?.toFixed(1)}x</span>
                <span>Freshness: {(difficulty.freshness_factor * 100).toFixed(0)}%</span>
                <span>Harmony: {(difficulty.harmony_factor * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Abandon */}
            <button onClick={abandonRealm}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-medium mb-4"
              style={{ background: 'rgba(239,68,68,0.04)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.08)' }}
              data-testid="abandon-realm-btn">
              <XCircle size={10} /> Abandon Realm (No Rewards)
            </button>
          </>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div data-testid="history-tab">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>No past Dream Realms yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((r, i) => (
                  <div key={i} className="rounded-xl p-3"
                    style={{
                      background: r.status === 'completed' ? 'rgba(34,197,94,0.03)' : 'rgba(239,68,68,0.03)',
                      border: `1px solid ${r.status === 'completed' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'}`,
                    }}
                    data-testid={`history-${i}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold" style={{ color: r.biome?.color_primary || 'var(--text-primary)' }}>
                        {r.biome?.name || 'Unknown Realm'}
                      </p>
                      <span className="text-[7px] px-1.5 py-0.5 rounded uppercase"
                        style={{
                          background: r.status === 'completed' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                          color: r.status === 'completed' ? '#22C55E' : '#EF4444',
                        }}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                      Loops: {(r.loop_iteration || 0) + 1} | Harmony: {r.completion_harmony || '—'}
                    </p>
                    {r.legendary_discovery && (
                      <div className="flex items-center gap-1 mt-1 text-[7px]" style={{ color: '#FCD34D' }}>
                        <Music size={8} /> {r.legendary_discovery.hz} Hz — {r.legendary_discovery.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legendary frequencies tab */}
        {tab === 'legendary' && (
          <div data-testid="legendary-tab">
            {legendaries.length === 0 ? (
              <div className="text-center py-12">
                <Music size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Break Dream Realm loops to discover legendary frequencies
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Discovered Frequencies ({legendaries.length})
                </p>
                {legendaries.map((freq, i) => <LegendaryCard key={i} frequency={freq} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loop Broken Overlay */}
      <AnimatePresence>
        {loopResult && (
          <LoopBrokenOverlay
            result={loopResult}
            onDismiss={() => {
              setLoopResult(null);
              setRealm(null);
              setLoading(true);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
