import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import {
  ArrowLeft, Sprout, Flame, Mountain, Gem, Droplets,
  AlertTriangle, CheckCircle2, ChevronRight, Zap, Heart,
  Brain, Wind, Music, Star, Target, Activity, TrendingUp,
  TrendingDown, Minus, Play, Calendar, Waves, Settings2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EL_ICONS = { wood: Sprout, fire: Flame, earth: Mountain, metal: Gem, water: Droplets };
const EL_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];
const STATUS_LABELS = {
  balanced: 'Balanced', slightly_high: 'Rising', slightly_low: 'Waning',
  excess: 'Excess', deficient: 'Deficient',
  critical_excess: 'Critical Excess', critical_deficient: 'Critical Deficiency',
};

// ── Constructive cycle flow: Wood→Fire→Earth→Metal→Water→Wood ──
const CYCLE_PAIRS = [
  ['wood', 'fire'], ['fire', 'earth'], ['earth', 'metal'], ['metal', 'water'], ['water', 'wood'],
];

// ── Element Ring with shift indicator ──
function ElementRing({ element, prevPercentage, size = 80 }) {
  const Icon = EL_ICONS[element.icon] || Star;
  const pct = element.percentage || 20;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 60) * circumference;
  const isBalanced = element.status === 'balanced';
  const isWarning = element.status?.includes('excess') || element.status?.includes('deficient');

  const shift = prevPercentage !== null ? pct - prevPercentage : 0;
  const shiftColor = shift > 0 ? '#22C55E' : shift < 0 ? '#EF4444' : 'var(--text-muted)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-1"
      data-testid={`element-${element.icon}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={4} />
          <motion.circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={element.color} strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${element.color_glow || element.color}40)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={14} style={{ color: element.color }} />
          <p className="text-[10px] font-bold mt-0.5" style={{ color: element.color }}>
            {pct.toFixed(0)}%
          </p>
        </div>
        {/* Shift indicator */}
        {shift !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: shift > 0 ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[6px] font-bold"
            style={{ background: `${shiftColor}18`, color: shiftColor }}>
            {shift > 0 ? <TrendingUp size={6} /> : <TrendingDown size={6} />}
            {Math.abs(shift).toFixed(0)}
          </motion.div>
        )}
      </div>
      <p className="text-[9px] font-medium" style={{ color: element.color }}>{element.name}</p>
      <p className="text-[6px] uppercase tracking-wider" style={{
        color: isWarning ? '#EF4444' : isBalanced ? '#22C55E' : 'var(--text-muted)'
      }}>
        {STATUS_LABELS[element.status] || element.status}
      </p>
    </motion.div>
  );
}

// ── Harmony Gauge with cycle glow ──
function HarmonyGauge({ score, trend, cycle, trendValues }) {
  const color = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 80 ? 'Harmonious' : score >= 50 ? 'Shifting' : 'Turbulent';
  const TrendIcon = trend === 'rising' ? TrendingUp : trend === 'falling' ? TrendingDown : Minus;
  const trendColor = trend === 'rising' ? '#22C55E' : trend === 'falling' ? '#EF4444' : '#94A3B8';

  const cycleGlow = cycle === 'constructive'
    ? '0 0 30px rgba(34,197,94,0.15), 0 0 60px rgba(34,197,94,0.05)'
    : cycle === 'destructive'
    ? '0 0 30px rgba(239,68,68,0.15), 0 0 60px rgba(239,68,68,0.05)'
    : 'none';

  const cycleBorder = cycle === 'constructive'
    ? 'rgba(34,197,94,0.12)'
    : cycle === 'destructive'
    ? 'rgba(239,68,68,0.12)'
    : 'rgba(255,255,255,0.04)';

  const cycleLabel = cycle === 'constructive' ? 'Constructive Cycle'
    : cycle === 'destructive' ? 'Destructive Cycle' : 'Neutral Cycle';

  return (
    <motion.div
      className="rounded-xl p-4 text-center mb-4 relative overflow-hidden"
      style={{
        background: `${color}04`,
        border: `1px solid ${cycleBorder}`,
        boxShadow: cycleGlow,
      }}
      data-testid="harmony-gauge">
      {/* Pulsing cycle glow background */}
      {cycle !== 'neutral' && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: cycle === 'constructive'
              ? ['inset 0 0 20px rgba(34,197,94,0.03)', 'inset 0 0 40px rgba(34,197,94,0.06)', 'inset 0 0 20px rgba(34,197,94,0.03)']
              : ['inset 0 0 20px rgba(239,68,68,0.03)', 'inset 0 0 40px rgba(239,68,68,0.06)', 'inset 0 0 20px rgba(239,68,68,0.03)'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div className="relative z-10">
        <div className="relative w-24 h-24 mx-auto mb-2">
          <svg width={96} height={96} className="transform -rotate-90">
            <circle cx={48} cy={48} r={40} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={6} />
            <motion.circle
              cx={48} cy={48} r={40} fill="none" stroke={color} strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 40}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - score / 100) }}
              transition={{ duration: 2, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 8px ${color}60)` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold" style={{ color }}>{score}</p>
            <p className="text-[7px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>harmony</p>
          </div>
        </div>
        <p className="text-[10px] font-medium" style={{ color }}>{label}</p>
        {/* Trend indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <TrendIcon size={10} style={{ color: trendColor }} />
          <span className="text-[8px] font-medium" style={{ color: trendColor }}>
            {trend === 'rising' ? 'Ascending' : trend === 'falling' ? 'Descending' : 'Holding Steady'}
          </span>
        </div>
        {/* Cycle label */}
        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px]"
          style={{
            background: cycle === 'constructive' ? 'rgba(34,197,94,0.06)' : cycle === 'destructive' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
            color: cycle === 'constructive' ? '#22C55E' : cycle === 'destructive' ? '#EF4444' : '#94A3B8',
          }}>
          <Waves size={7} /> {cycleLabel}
        </div>
        {/* Mini trend sparkline */}
        {trendValues && trendValues.length > 1 && (
          <div className="mt-2 flex items-end justify-center gap-0.5 h-5">
            {trendValues.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(15, (v / 100) * 100)}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="w-1.5 rounded-full"
                style={{
                  background: i === trendValues.length - 1 ? color : `${color}40`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Elemental Flow Visualization ──
function ElementFlowVis({ elements, activeFlow }) {
  return (
    <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
      data-testid="element-flow">
      <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        Elemental Flow — Constructive Cycle
      </p>
      <div className="flex items-center justify-center gap-1 text-[8px]">
        {EL_ORDER.map((eid, i) => {
          const el = elements[eid];
          const isFlowSource = activeFlow?.from === eid;
          const isFlowTarget = activeFlow?.to === eid;
          return (
            <React.Fragment key={eid}>
              <motion.span
                className="px-1.5 py-0.5 rounded relative"
                animate={isFlowSource || isFlowTarget ? {
                  boxShadow: [`0 0 0px ${el?.color || '#818CF8'}00`, `0 0 12px ${el?.color || '#818CF8'}40`, `0 0 0px ${el?.color || '#818CF8'}00`],
                } : {}}
                transition={isFlowSource || isFlowTarget ? { duration: 1.5, repeat: Infinity } : {}}
                style={{
                  background: `${el?.color || '#818CF8'}10`,
                  color: el?.color || '#818CF8',
                  border: (isFlowSource || isFlowTarget) ? `1px solid ${el?.color || '#818CF8'}40` : 'none',
                }}>
                {el?.name || eid}
              </motion.span>
              {i < EL_ORDER.length - 1 && (
                <motion.div
                  animate={
                    CYCLE_PAIRS.some(([a, b]) => a === EL_ORDER[i] && b === EL_ORDER[i + 1] && (activeFlow?.from === a || activeFlow?.to === b))
                      ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
                      : {}
                  }
                  transition={{ duration: 1, repeat: Infinity }}>
                  <ChevronRight size={8} style={{ color: 'var(--text-muted)' }} />
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-[7px] text-center mt-1.5" style={{ color: 'var(--text-muted)' }}>
        Wood feeds Fire, Fire creates Earth, Earth yields Metal, Metal carries Water, Water nourishes Wood
      </p>
    </div>
  );
}

// ── Alignment Task Card with Frequency ──
function AlignmentCard({ imbalance, onComplete }) {
  const Icon = EL_ICONS[imbalance.element] || Star;
  const elDef = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };
  const color = elDef[imbalance.element] || '#818CF8';
  const done = imbalance.completed_today;
  const freq = imbalance.frequency;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="rounded-xl p-3 mb-2"
      style={{
        background: done ? 'rgba(34,197,94,0.03)' : `${color}06`,
        border: `1px solid ${done ? 'rgba(34,197,94,0.1)' : `${color}12`}`,
      }}
      data-testid={`alignment-${imbalance.element}`}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: done ? 'rgba(34,197,94,0.08)' : `${color}10` }}>
          {done ? <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
            : <Icon size={14} style={{ color }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[10px] font-semibold" style={{ color: done ? '#22C55E' : color }}>
              {imbalance.element.charAt(0).toUpperCase() + imbalance.element.slice(1)} — {imbalance.direction === 'excess' ? 'Excess' : 'Deficient'}
            </p>
            {!done && (
              <span className="text-[6px] px-1 py-0.5 rounded uppercase"
                style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444' }}>
                {imbalance.status.includes('critical') ? 'Critical' : 'Imbalanced'}
              </span>
            )}
          </div>
          <p className="text-[8px] mb-1" style={{ color: 'var(--text-muted)' }}>{imbalance.warning}</p>
          <p className="text-[9px] mb-1" style={{ color: 'var(--text-primary)' }}>{imbalance.task}</p>
          {/* Frequency pairing */}
          {freq && (
            <div className="flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-lg"
              style={{ background: `${color}06`, border: `1px solid ${color}08` }}
              data-testid={`freq-${imbalance.element}`}>
              <Play size={8} style={{ color }} />
              <span className="text-[7px] font-medium" style={{ color }}>{freq.label}</span>
              <span className="text-[6px] px-1 rounded" style={{ background: `${color}10`, color: 'var(--text-muted)' }}>
                Mantra: {freq.mantra}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
              +{imbalance.xp} XP | {imbalance.description}
            </span>
            {!done && (
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => onComplete(imbalance.element, imbalance.direction)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[7px] font-medium"
                style={{ background: `${color}10`, color, border: `1px solid ${color}15` }}
                data-testid={`align-${imbalance.element}`}>
                <Target size={8} /> Align
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Birth Resonance Card ──
function BirthResonanceCard({ natal, onCalibrate }) {
  if (!natal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-3 mb-4 cursor-pointer"
        onClick={onCalibrate}
        style={{ background: 'rgba(168,85,247,0.04)', border: '1px dashed rgba(168,85,247,0.15)' }}
        data-testid="birth-resonance-uncalibrated">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.08)' }}>
            <Calendar size={14} style={{ color: '#A855F7' }} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold" style={{ color: '#A855F7' }}>Calibrate Birth Resonance</p>
            <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
              Enter your birth date to unlock personalized elemental baselines
            </p>
          </div>
          <ChevronRight size={12} style={{ color: '#A855F7' }} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl p-3 mb-4"
      style={{ background: 'rgba(168,85,247,0.03)', border: '1px solid rgba(168,85,247,0.08)' }}
      data-testid="birth-resonance-card">
      <div className="flex items-center gap-2 mb-2">
        <Star size={11} style={{ color: '#A855F7' }} />
        <p className="text-[9px] font-semibold" style={{ color: '#A855F7' }}>
          Natal Baseline — {natal.sign}
        </p>
        <span className="text-[7px] px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(168,85,247,0.08)', color: '#C084FC' }}>
          Life Path {natal.life_path}
        </span>
      </div>
      <p className="text-[7px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
        Your natal chart favors <span style={{ color: EL_ICONS[natal.boosted_element] ? { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' }[natal.boosted_element] : '#A855F7' }}>{natal.boosted_element?.charAt(0).toUpperCase() + natal.boosted_element?.slice(1)}</span> — your balance ideal is uniquely calibrated
      </p>
    </div>
  );
}

// ── Birth Resonance Modal ──
function BirthModal({ onSubmit, onClose }) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!month || !day || !year) return toast.error('Please fill all fields');
    setSubmitting(true);
    await onSubmit(parseInt(month), parseInt(day), parseInt(year));
    setSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-2xl p-5"
        style={{ background: 'rgba(13,14,26,0.98)', border: '1px solid rgba(168,85,247,0.15)' }}
        onClick={e => e.stopPropagation()}
        data-testid="birth-modal">
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} style={{ color: '#A855F7' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Birth Resonance Calibration
          </h3>
        </div>
        <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
          Your birth data creates a permanent natal baseline, shifting your ideal elemental balance to match your cosmic signature.
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="text-[8px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Month</label>
            <input type="number" min="1" max="12" value={month} onChange={e => setMonth(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg text-xs text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              placeholder="6" data-testid="birth-month" />
          </div>
          <div>
            <label className="text-[8px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Day</label>
            <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg text-xs text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              placeholder="22" data-testid="birth-day" />
          </div>
          <div>
            <label className="text-[8px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Year</label>
            <input type="number" min="1900" max="2025" value={year} onChange={e => setYear(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg text-xs text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              placeholder="1979" data-testid="birth-year" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-3 py-2 rounded-xl text-[10px] font-medium"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
            data-testid="birth-cancel">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 px-3 py-2 rounded-xl text-[10px] font-medium"
            style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}
            data-testid="birth-submit">
            {submitting ? 'Calibrating...' : 'Calibrate'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Decay Freshness Bar ──
function DecayBar({ decay }) {
  if (!decay) return null;
  const items = [
    { key: 'mood_freshness', label: 'Mood', color: '#F87171', icon: Heart },
    { key: 'meditation_freshness', label: 'Meditate', color: '#D8B4FE', icon: Brain },
    { key: 'journal_freshness', label: 'Journal', color: '#86EFAC', icon: Activity },
    { key: 'breathing_freshness', label: 'Breathe', color: '#2DD4BF', icon: Wind },
    { key: 'soundscape_freshness', label: 'Sound', color: '#3B82F6', icon: Music },
  ];

  return (
    <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
      data-testid="decay-freshness">
      <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        Activity Freshness — Decay in Progress
      </p>
      <div className="space-y-1.5">
        {items.map(({ key, label, color, icon: SIcon }) => {
          const val = decay[key] || 0;
          return (
            <div key={key} className="flex items-center gap-2">
              <SIcon size={10} style={{ color }} />
              <span className="text-[8px] w-14" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full"
                  style={{
                    background: val > 60 ? color : val > 30 ? '#F59E0B' : '#EF4444',
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="text-[7px] w-6 text-right" style={{
                color: val > 60 ? color : val > 30 ? '#F59E0B' : '#EF4444'
              }}>{val}%</span>
            </div>
          );
        })}
      </div>
      <p className="text-[6px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
        Elements decay toward neutral when inactive. Practice regularly to maintain your resonance.
      </p>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function ElementalNexus() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const headers = authHeaders;
  const [nexus, setNexus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [activeFlow, setActiveFlow] = useState(null);
  const prevPercentages = useRef({});

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/nexus/state`, { headers });
      // Capture prev percentages for shift indicators
      if (nexus?.elements) {
        const prev = {};
        EL_ORDER.forEach(eid => {
          prev[eid] = nexus.elements[eid]?.percentage || 20;
        });
        prevPercentages.current = prev;
      }
      setNexus(res.data);
      setError(null);
    } catch (err) {
      setError(getCosmicErrorMessage(err));
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completeAlignment = async (element, direction) => {
    try {
      const res = await axios.post(`${API}/nexus/align`,
        { element, direction }, { headers });
      toast(`Alignment complete! +${res.data.xp_awarded} XP`);
      // Trigger flow animation
      if (res.data.flow) {
        setActiveFlow(res.data.flow);
        setTimeout(() => setActiveFlow(null), 3000);
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Already aligned today');
    }
  };

  const submitBirth = async (month, day, year) => {
    try {
      const res = await axios.post(`${API}/nexus/birth-resonance`,
        { birth_month: month, birth_day: day, birth_year: year }, { headers });
      toast(`Natal resonance calibrated — ${res.data.sign}, Life Path ${res.data.life_path}`);
      setShowBirthModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Calibration failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <CosmicInlineLoader message="Entering the Nexus..." />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <CosmicError title={error.title} message={error.message} onRetry={fetchData} />
    </div>
  );

  const elements = nexus?.elements || {};
  const SRC_ICONS = { mood_count: Heart, meditation_count: Brain, journal_count: Activity,
    breathing_count: Wind, soundscape_count: Music, streak_days: Zap, ripple_count: Droplets };
  const SRC_LABELS = { mood_count: 'Moods', meditation_count: 'Meditations', journal_count: 'Journals',
    breathing_count: 'Breathing', soundscape_count: 'Soundscapes', streak_days: 'Streak', ripple_count: 'Ripples' };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }} data-testid="nexus-page">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)' }} data-testid="nexus-back-btn">
          <ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            The Elemental Nexus
          </h1>
          <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
            5th Realm — Where All Elements Converge
          </p>
        </div>
        <button onClick={() => setShowBirthModal(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.1)' }}
          data-testid="nexus-settings-btn">
          <Settings2 size={12} style={{ color: '#A855F7' }} />
        </button>
      </div>

      <div className="px-4">
        {/* Birth Resonance */}
        <BirthResonanceCard natal={nexus?.natal} onCalibrate={() => setShowBirthModal(true)} />

        {/* Harmony Score with cycle glow */}
        <HarmonyGauge
          score={nexus?.harmony_score || 0}
          trend={nexus?.harmony_trend || 'stable'}
          cycle={nexus?.harmony_cycle || 'neutral'}
          trendValues={nexus?.trend_values || []}
        />

        {/* Element Rings with shift indicators */}
        <div className="flex justify-between items-start mb-4 px-2" data-testid="element-rings">
          {EL_ORDER.map(eid => (
            <ElementRing
              key={eid}
              element={elements[eid] || { name: eid, icon: eid, color: '#818CF8', percentage: 20, status: 'balanced' }}
              prevPercentage={prevPercentages.current[eid] ?? null}
            />
          ))}
        </div>

        {/* Element Flow with animated transitions */}
        <ElementFlowVis elements={elements} activeFlow={activeFlow} />

        {/* Decay Freshness */}
        <DecayBar decay={nexus?.decay_activity} />

        {/* Imbalance Alerts & Alignment Tasks with Frequency Pairing */}
        {nexus?.imbalances?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={11} style={{ color: '#EF4444' }} />
              <p className="text-[9px] font-semibold" style={{ color: '#EF4444' }}>
                Elemental Imbalances ({nexus.imbalances.length})
              </p>
            </div>
            {nexus.imbalances.map((imb, i) => (
              <AlignmentCard key={i} imbalance={imb} onComplete={completeAlignment} />
            ))}
          </div>
        )}

        {/* No Imbalances */}
        {nexus?.imbalances?.length === 0 && (
          <div className="rounded-xl p-4 mb-4 text-center"
            style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <CheckCircle2 size={20} className="mx-auto mb-1.5" style={{ color: '#22C55E' }} />
            <p className="text-[10px] font-medium" style={{ color: '#22C55E' }}>Elements in Balance</p>
            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              Your wellness practices are creating natural harmony across all planes
            </p>
          </div>
        )}

        {/* Energy Sources */}
        <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
          data-testid="energy-sources">
          <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Energy Sources (Last 7 Days)
          </p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(nexus?.sources || {}).filter(([k]) => k !== 'ripple_count').map(([key, val]) => {
              const SIcon = SRC_ICONS[key] || Star;
              return (
                <div key={key} className="text-center">
                  <SIcon size={12} className="mx-auto mb-0.5" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{val}</p>
                  <p className="text-[6px]" style={{ color: 'var(--text-muted)' }}>{SRC_LABELS[key] || key}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Element Details */}
        <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Element Details
        </p>
        <div className="space-y-2 mb-4">
          {EL_ORDER.map(eid => {
            const el = elements[eid];
            if (!el) return null;
            const Icon = EL_ICONS[el.icon] || Star;
            const freq = el.frequency;
            return (
              <div key={eid} className="rounded-xl p-3"
                style={{ background: `${el.color}04`, border: `1px solid ${el.color}08` }}
                data-testid={`detail-${eid}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={13} style={{ color: el.color }} />
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold" style={{ color: el.color }}>
                      {el.name} — {el.subtitle}
                    </p>
                    <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
                      {el.universe_label} Plane | {el.description?.slice(0, 70)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: el.color }}>{el.percentage?.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (el.percentage / 40) * 100)}%` }}
                    className="h-full rounded-full"
                    style={{ background: el.color }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
                    Virtues: {el.virtues?.join(', ')}
                  </span>
                  <span className="text-[7px]" style={{
                    color: el.status === 'balanced' ? '#22C55E' : el.status?.includes('excess') || el.status?.includes('deficient') ? '#EF4444' : '#F59E0B'
                  }}>
                    {STATUS_LABELS[el.status]}
                  </span>
                </div>
                {/* Frequency info */}
                {freq && (
                  <div className="flex items-center gap-2 mt-1.5 text-[7px]" style={{ color: 'var(--text-muted)' }}>
                    <Play size={7} style={{ color: el.color }} />
                    <span>{freq.label}</span>
                    <span className="px-1 rounded" style={{ background: `${el.color}08` }}>
                      {freq.mantra}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Birth Modal */}
      <AnimatePresence>
        {showBirthModal && (
          <BirthModal onSubmit={submitBirth} onClose={() => setShowBirthModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
