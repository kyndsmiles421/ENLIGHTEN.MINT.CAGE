import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import {
  ArrowLeft, Sprout, Flame, Mountain, Gem, Droplets,
  AlertTriangle, CheckCircle2, ChevronRight, Zap, Heart,
  Brain, Wind, Music, Star, Target, Activity
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EL_ICONS = { wood: Sprout, fire: Flame, earth: Mountain, metal: Gem, water: Droplets };
const STATUS_LABELS = {
  balanced: 'Balanced', slightly_high: 'Rising', slightly_low: 'Waning',
  excess: 'Excess', deficient: 'Deficient',
  critical_excess: 'Critical Excess', critical_deficient: 'Critical Deficiency',
};

// ── Element Ring (circular gauge) ──
function ElementRing({ element, size = 80 }) {
  const Icon = EL_ICONS[element.icon] || Star;
  const pct = element.percentage || 20;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 60) * circumference; // Max 60% fills full ring
  const isBalanced = element.status === 'balanced';
  const isWarning = element.status?.includes('excess') || element.status?.includes('deficient');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-1"
      data-testid={`element-${element.icon}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={4} />
          {/* Value ring */}
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
          <Icon size={16} style={{ color: element.color }} />
          <p className="text-[10px] font-bold mt-0.5" style={{ color: element.color }}>
            {pct.toFixed(0)}%
          </p>
        </div>
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

// ── Harmony Gauge ──
function HarmonyGauge({ score }) {
  const color = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 80 ? 'Harmonious' : score >= 50 ? 'Shifting' : 'Turbulent';
  return (
    <div className="rounded-xl p-4 text-center mb-4"
      style={{ background: `${color}06`, border: `1px solid ${color}12` }}
      data-testid="harmony-gauge">
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
      <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
        {score >= 80 ? 'Your elements flow in unity' : score >= 50 ? 'Some elements need attention' : 'Significant imbalance detected'}
      </p>
    </div>
  );
}

// ── Alignment Task Card ──
function AlignmentCard({ imbalance, onComplete }) {
  const Icon = EL_ICONS[imbalance.element] || Star;
  const elDef = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };
  const color = elDef[imbalance.element] || '#818CF8';
  const done = imbalance.completed_today;

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
          <p className="text-[9px] mb-1.5" style={{ color: 'var(--text-primary)' }}>{imbalance.task}</p>
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/nexus/state`, { headers });
      setNexus(res.data);
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
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Already aligned today');
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
  const elOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
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
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            The Elemental Nexus
          </h1>
          <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
            5th Realm — Where All Elements Converge
          </p>
        </div>
      </div>

      <div className="px-4">
        {/* Harmony Score */}
        <HarmonyGauge score={nexus?.harmony_score || 0} />

        {/* Element Rings */}
        <div className="flex justify-between items-start mb-4 px-2" data-testid="element-rings">
          {elOrder.map(eid => (
            <ElementRing key={eid} element={elements[eid] || { name: eid, icon: eid, color: '#818CF8', percentage: 20, status: 'balanced' }} />
          ))}
        </div>

        {/* Element Flow Connections */}
        <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Elemental Flow
          </p>
          <div className="flex items-center justify-center gap-1 text-[8px]">
            {elOrder.map((eid, i) => (
              <React.Fragment key={eid}>
                <span className="px-1.5 py-0.5 rounded" style={{
                  background: `${elements[eid]?.color || '#818CF8'}10`,
                  color: elements[eid]?.color || '#818CF8',
                }}>
                  {elements[eid]?.name || eid}
                </span>
                {i < elOrder.length - 1 && (
                  <ChevronRight size={8} style={{ color: 'var(--text-muted)' }} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[7px] text-center mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Wood feeds Fire, Fire creates Earth, Earth yields Metal, Metal carries Water, Water nourishes Wood
          </p>
        </div>

        {/* Imbalance Alerts & Alignment Tasks */}
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
          {elOrder.map(eid => {
            const el = elements[eid];
            if (!el) return null;
            const Icon = EL_ICONS[el.icon] || Star;
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
