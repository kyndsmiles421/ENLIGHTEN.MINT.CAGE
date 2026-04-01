import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Mountain, Droplets, Flame, Wind, Sparkles,
  Lock, Unlock, Gem, Coins, ArrowRightLeft, MapPin,
  Clock, Zap, ChevronRight, Check, AlertTriangle, Eye
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = {
  Earth: Mountain,
  Water: Droplets,
  Fire: Flame,
  Air: Wind,
  Ether: Sparkles,
};

const REALM_LABELS = {
  starseed_journey: 'Starseed Journey',
  refinement_lab: 'Refinement Lab',
  cosmic_mixer: 'Cosmic Mixer',
  dream_realms: 'Dream Realms',
  trade_circle: 'Trade Circle',
};

function ProgressSegment({ label, icon: Icon, current, required, met, color }) {
  const pct = required === 0 ? 100 : Math.min(100, Math.round((current / Math.max(1, required)) * 100));
  return (
    <div className="flex items-center gap-2" data-testid={`gate-progress-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <Icon size={11} style={{ color: met ? '#22C55E' : color, opacity: met ? 1 : 0.6 }} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span className="text-[9px] font-medium" style={{ color: met ? '#22C55E' : color }}>
            {current}/{required} {met && <Check size={8} className="inline ml-0.5" />}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: met ? '#22C55E' : color }}
          />
        </div>
      </div>
    </div>
  );
}

function TimeLockDisplay({ timeLock, warpCost, credits, onWarp, gateColor }) {
  if (!timeLock?.locked) return null;

  if (timeLock.reason === 'previous_gate_required') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)' }}>
        <Lock size={12} style={{ color: 'var(--text-muted)' }} />
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Unlock the previous gate to begin this countdown</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={12} style={{ color: '#FB923C' }} />
          <span className="text-[10px] font-medium" style={{ color: '#FB923C' }}>
            Time Lock: {timeLock.hours_remaining}h remaining
          </span>
        </div>
        {warpCost > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onWarp}
            disabled={credits < warpCost}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-medium"
            style={{
              background: credits >= warpCost ? `${gateColor}15` : 'rgba(248,250,252,0.03)',
              color: credits >= warpCost ? gateColor : 'var(--text-muted)',
              border: `1px solid ${credits >= warpCost ? `${gateColor}30` : 'rgba(248,250,252,0.06)'}`,
              opacity: credits < warpCost ? 0.5 : 1,
            }}
            data-testid="warp-btn"
          >
            <Zap size={10} /> Warp ({warpCost} Credits)
          </motion.button>
        )}
      </div>
      {timeLock.unlocks_at && (
        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
          Available: {new Date(timeLock.unlocks_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function TravelChecklist({ realms, visited, missing, met, gateColor }) {
  if (realms.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <MapPin size={11} style={{ color: met ? '#22C55E' : gateColor }} />
        <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Travel Requirements {met && <Check size={8} className="inline text-green-400 ml-0.5" />}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {realms.map(realm => {
          const isVisited = visited.includes(realm);
          return (
            <span key={realm} className="text-[8px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{
                background: isVisited ? 'rgba(34,197,94,0.08)' : 'rgba(248,250,252,0.03)',
                color: isVisited ? '#22C55E' : 'var(--text-muted)',
                border: `1px solid ${isVisited ? 'rgba(34,197,94,0.2)' : 'rgba(248,250,252,0.06)'}`,
              }}
              data-testid={`travel-realm-${realm}`}
            >
              {isVisited ? <Check size={7} /> : <MapPin size={7} />}
              {REALM_LABELS[realm] || realm}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function GateCard({ gate, userStats, onUnlock, onWarp, expanded, onToggle }) {
  const ElIcon = ELEMENT_ICONS[gate.element] || Sparkles;
  const p = gate.progress;
  const isEther = gate.element === 'Ether';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden relative"
      style={{
        background: gate.unlocked
          ? `linear-gradient(135deg, ${gate.color}08, ${gate.color}03)`
          : 'rgba(248,250,252,0.015)',
        border: `1px solid ${gate.unlocked ? `${gate.color}30` : 'rgba(248,250,252,0.06)'}`,
      }}
      data-testid={`energy-gate-${gate.id}`}
    >
      {/* Aura glow for unlocked */}
      {gate.unlocked && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            background: `radial-gradient(ellipse at center, ${gate.aura_glow}, transparent 70%)`,
          }}
        />
      )}

      {/* Ether halo ring */}
      {isEther && gate.unlocked && (
        <motion.div
          className="absolute -top-1 -right-1 w-20 h-20 rounded-full pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(251,191,36,0.15), rgba(255,251,235,0.1), transparent)',
          }}
        />
      )}

      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 relative z-10"
        data-testid={`gate-header-${gate.id}`}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: gate.unlocked ? `${gate.color}15` : 'rgba(248,250,252,0.04)',
            boxShadow: gate.unlocked ? `0 0 20px ${gate.aura_glow}` : 'none',
            border: `1px solid ${gate.unlocked ? `${gate.color}35` : 'rgba(248,250,252,0.08)'}`,
          }}>
          {gate.unlocked
            ? <Unlock size={16} style={{ color: gate.color }} />
            : gate.prev_unlocked
              ? <ElIcon size={16} style={{ color: gate.color, opacity: 0.7 }} />
              : <Lock size={14} style={{ color: 'var(--text-muted)' }} />
          }
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium" style={{
              color: gate.unlocked ? gate.color : gate.prev_unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'Cormorant Garamond, serif',
            }}>
              {gate.name}
            </h3>
            {gate.unlocked && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-widest"
                style={{ background: `${gate.color}12`, color: gate.color, border: `1px solid ${gate.color}20` }}>
                Unlocked
              </span>
            )}
          </div>
          <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {gate.frequency} Hz &middot; {gate.element}
            {gate.min_consciousness > 1 && ` \u00b7 Level ${gate.min_consciousness}+`}
          </p>
        </div>
        <ChevronRight size={14}
          style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 relative z-10">
              {/* Description */}
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {gate.description}
              </p>

              {/* Lore (if unlocked) */}
              {gate.unlocked && (
                <div className="rounded-lg p-3" style={{ background: `${gate.color}06`, border: `1px solid ${gate.color}12` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Eye size={10} style={{ color: gate.color }} />
                    <span className="text-[8px] uppercase tracking-widest" style={{ color: gate.color }}>Gate Lore</span>
                  </div>
                  <p className="text-[10px] italic leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif' }}>
                    "{gate.lore}"
                  </p>
                </div>
              )}

              {/* Progress bars (only if not unlocked) */}
              {!gate.unlocked && gate.prev_unlocked && (
                <div className="space-y-2">
                  <ProgressSegment label="Consciousness" icon={Sparkles}
                    current={p.consciousness.current} required={p.consciousness.required}
                    met={p.consciousness.met} color={gate.color} />
                  <ProgressSegment label="Polished Gems" icon={Gem}
                    current={p.polished_gems.current} required={p.polished_gems.required}
                    met={p.polished_gems.met} color={gate.color} />
                  {p.dust.required > 0 && (
                    <ProgressSegment label="Cosmic Dust" icon={Coins}
                      current={p.dust.current} required={p.dust.required}
                      met={p.dust.met} color={gate.color} />
                  )}
                  {p.trades.required > 0 && (
                    <ProgressSegment label="Trades" icon={ArrowRightLeft}
                      current={p.trades.current} required={p.trades.required}
                      met={p.trades.met} color={gate.color} />
                  )}

                  {/* Travel requirements */}
                  <TravelChecklist
                    realms={p.travel.required}
                    visited={p.travel.visited}
                    missing={p.travel.missing}
                    met={p.travel.met}
                    gateColor={gate.color}
                  />

                  {/* Time lock */}
                  <TimeLockDisplay
                    timeLock={p.time_lock}
                    warpCost={gate.warp_cost_credits}
                    credits={userStats?.credits || 0}
                    onWarp={() => onWarp(gate.id)}
                    gateColor={gate.color}
                  />
                </div>
              )}

              {/* Rewards preview */}
              {!gate.unlocked && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Rewards:</span>
                  <span className="text-[9px] flex items-center gap-1" style={{ color: '#FBBF24' }}>
                    <Sparkles size={9} /> +{gate.rewards.xp} XP
                  </span>
                  {gate.rewards.dust > 0 && (
                    <span className="text-[9px] flex items-center gap-1" style={{ color: '#2DD4BF' }}>
                      <Coins size={9} /> +{gate.rewards.dust} Dust
                    </span>
                  )}
                </div>
              )}

              {/* Unlock button */}
              {gate.can_unlock && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUnlock(gate.id)}
                  className="w-full py-2.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${gate.color}20, ${gate.color}10)`,
                    color: gate.color,
                    border: `1px solid ${gate.color}30`,
                    boxShadow: `0 0 20px ${gate.aura_glow}`,
                  }}
                  data-testid={`unlock-gate-${gate.id}`}
                >
                  <Unlock size={12} className="inline mr-1.5" />
                  Open the {gate.name}
                </motion.button>
              )}

              {/* Cannot unlock reason */}
              {!gate.unlocked && !gate.can_unlock && !gate.prev_unlocked && (
                <div className="flex items-center gap-2 py-2">
                  <Lock size={11} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    Unlock the previous gate to access this one
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EnergyGates() {
  const { authHeaders } = useAuth();
  const [gates, setGates] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedGate, setExpandedGate] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  const fetchGates = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/energy-gates/status`, { headers: authHeaders });
      setGates(res.data.gates);
      setUserStats(res.data.user_stats);
      // Auto-expand first locked gate
      const firstLocked = res.data.gates.find(g => !g.unlocked && g.prev_unlocked);
      if (firstLocked && !expandedGate) setExpandedGate(firstLocked.id);
    } catch (err) {
      toast.error('Failed to load energy gates');
    }
    setLoading(false);
  }, [authHeaders, expandedGate]);

  useEffect(() => { fetchGates(); }, [fetchGates]);

  const handleUnlock = async (gateId) => {
    setUnlocking(true);
    try {
      const res = await axios.post(`${API}/energy-gates/unlock`, { gate_id: gateId }, { headers: authHeaders });
      toast.success(`${res.data.gate} opened! +${res.data.rewards.xp_gained} XP`);
      setExpandedGate(gateId);
      fetchGates();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to unlock gate');
    }
    setUnlocking(false);
  };

  const handleWarp = async (gateId) => {
    try {
      const res = await axios.post(`${API}/energy-gates/warp`, { gate_id: gateId }, { headers: authHeaders });
      toast.success(res.data.message);
      fetchGates();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Warp failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(217,119,6,0.2)', borderTopColor: '#D97706' }} />
      </div>
    );
  }

  const totalUnlocked = gates.filter(g => g.unlocked).length;

  return (
    <div className="space-y-4" data-testid="energy-gates-panel">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={18} style={{ color: '#FBBF24' }} />
          <h2 className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            Starseed Energy Gates
          </h2>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Channel polished gems, cosmic dust, and traded materials to unlock dimensional gateways
        </p>

        {/* Progress overview */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {gates.map((g, i) => (
            <React.Fragment key={g.id}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  background: g.unlocked ? `${g.color}15` : 'rgba(248,250,252,0.04)',
                  color: g.unlocked ? g.color : 'var(--text-muted)',
                  border: `1px solid ${g.unlocked ? `${g.color}30` : 'rgba(248,250,252,0.08)'}`,
                  boxShadow: g.unlocked ? `0 0 10px ${g.aura_glow}` : 'none',
                }}
                data-testid={`gate-dot-${g.id}`}
              >
                {g.unlocked ? <Check size={10} /> : i + 1}
              </div>
              {i < gates.length - 1 && (
                <div className="w-6 h-px" style={{
                  background: g.unlocked ? g.color : 'rgba(248,250,252,0.08)',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[9px] mt-2" style={{ color: 'var(--text-muted)' }}>
          {totalUnlocked} of {gates.length} gates opened
        </p>
      </div>

      {/* User resource summary */}
      {userStats && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Gems', value: userStats.polished_gems, icon: Gem, color: '#D97706' },
            { label: 'Dust', value: userStats.dust, icon: Coins, color: '#2DD4BF' },
            { label: 'Trades', value: userStats.trades_completed, icon: ArrowRightLeft, color: '#C084FC' },
            { label: 'Level', value: userStats.consciousness_level, icon: Sparkles, color: '#FBBF24' },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-2 text-center"
              style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}
              data-testid={`gate-stat-${s.label.toLowerCase()}`}
            >
              <s.icon size={12} className="mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-sm font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
              <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Gate cards */}
      <div className="space-y-2">
        {gates.map(gate => (
          <GateCard
            key={gate.id}
            gate={gate}
            userStats={userStats}
            onUnlock={handleUnlock}
            onWarp={handleWarp}
            expanded={expandedGate === gate.id}
            onToggle={() => setExpandedGate(expandedGate === gate.id ? null : gate.id)}
          />
        ))}
      </div>

      {/* Warp info */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={11} style={{ color: '#FB923C' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Warp &amp; Travel</span>
        </div>
        <div className="space-y-1">
          <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            <Clock size={8} className="inline mr-1" style={{ color: '#FB923C' }} />
            <strong>Time Locks:</strong> Higher gates require a cooldown after the previous unlock.
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            <Zap size={8} className="inline mr-1" style={{ color: '#FBBF24' }} />
            <strong>Warp:</strong> Spend Resonance Credits to bypass time locks instantly.
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            <MapPin size={8} className="inline mr-1" style={{ color: '#8B5CF6' }} />
            <strong>Travel:</strong> Visit specific realms across the Cosmos to fulfill gate requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
