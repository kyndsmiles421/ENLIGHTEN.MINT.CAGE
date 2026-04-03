import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Volume2, VolumeX, Plus, Trash2, Save, FolderOpen,
  Sliders, Lock, Unlock, Zap, Waves, Sparkles, ChevronDown, Crown,
  Layers, Music, Eye, Radio, X, Loader2, Play, Square,
  Ghost, Package, Gift, ShoppingCart, ArrowUpRight, GripVertical,
  Compass, AlertTriangle, Clock,
} from 'lucide-react';
import { NanoGuide } from '../components/NanoGuide';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BEAD_SIZE = 22;
const COLUMN_WIDTH = 46;
const HEAVEN_COUNT = 2;
const EARTH_COUNT = 5;
const HEAVEN_VALUE = 5;
const COLUMNS = [
  { label: '100s', multiplier: 100 },
  { label: '10s', multiplier: 10 },
  { label: '1s', multiplier: 1 },
  { label: '.1s', multiplier: 0.1 },
];

const TRACK_TYPE_META = {
  phonic_tone: { icon: Radio, color: '#60A5FA', label: 'Phonic' },
  mantra: { icon: Music, color: '#C084FC', label: 'Mantra' },
  ambience: { icon: Waves, color: '#22C55E', label: 'Ambient' },
  visual: { icon: Eye, color: '#A78BFA', label: 'Visual' },
  suanpan: { icon: Sliders, color: '#EAB308', label: 'Suanpan' },
  generator: { icon: Zap, color: '#FB923C', label: 'Generator' },
  bonus_pack: { icon: Gift, color: '#F472B6', label: 'Pack' },
  custom: { icon: Sparkles, color: '#94A3B8', label: 'Custom' },
};

const SUB_COLORS = {
  discovery: '#94A3B8', player: '#2DD4BF', ultra_player: '#C084FC', sovereign: '#EAB308',
};

const TIER_DISPLAY = {
  discovery: 'Discovery', player: 'Player', ultra_player: 'Ultra Player', sovereign: 'Sovereign',
};

/* ━━━ Sacred Assembly Loader ━━━ */
function SacredAssemblyLoader({ delay, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = ['Aligning Frequencies', 'Weaving Harmonics', 'Assembling Resonance', 'Manifesting'];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (delay * 10));
        if (next >= 100) { clearInterval(interval); setTimeout(onComplete, 300); return 100; }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [delay, onComplete]);

  useEffect(() => {
    setPhase(Math.min(3, Math.floor(progress / 25)));
  }, [progress]);

  return (
    <motion.div className="fixed inset-0 z-[10002] flex flex-col items-center justify-center"
      style={{ background: 'rgba(6,6,14,0.95)', backdropFilter: 'blur(16px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      data-testid="sacred-assembly-loader"
    >
      {/* Concentric rings */}
      <div className="relative w-40 h-40 mb-8">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div key={i} className="absolute inset-0 rounded-full border"
            style={{
              borderColor: `rgba(192,132,252,${0.08 + i * 0.04})`,
              transform: `scale(${0.3 + i * 0.18})`,
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [0.3 + i * 0.18, 0.35 + i * 0.18, 0.3 + i * 0.18] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'linear' }}
          />
        ))}
        <motion.div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-mono font-light" style={{ color: '#C084FC' }}>
            {Math.round(progress)}%
          </p>
        </motion.div>
      </div>

      <motion.p className="text-[10px] tracking-[0.25em] uppercase mb-2"
        style={{ color: 'rgba(248,250,252,0.2)' }}
        key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        Sacred Assembly
      </motion.p>
      <motion.p className="text-[11px] font-light"
        style={{ color: '#C084FC', fontFamily: 'Cormorant Garamond, serif' }}
        key={`phase-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {phases[phase]}...
      </motion.p>

      {/* Progress bar */}
      <div className="w-48 h-[2px] mt-6 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #C084FC, #EAB308)', width: `${progress}%` }}
        />
      </div>

      <p className="text-[7px] mt-4 max-w-xs text-center" style={{ color: 'rgba(248,250,252,0.12)' }}>
        Complex renders require assembly time. Upgrade your tier for faster materialization.
      </p>
    </motion.div>
  );
}

/* ━━━ Suanpan Mini-Abacus ━━━ */
function SuanpanSource({ onFrequencySet, color }) {
  const [values, setValues] = useState([5, 2, 8, 0]);
  const totalHz = COLUMNS.reduce((sum, col, i) => sum + values[i] * col.multiplier, 0);

  const handleChange = (colIdx, newVal) => {
    setValues(prev => { const n = [...prev]; n[colIdx] = Math.min(newVal, 9); return n; });
  };

  return (
    <div className="p-3" data-testid="suanpan-source-panel">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[8px] font-medium tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.25)' }}>Frequency Source</p>
        <p className="text-sm font-mono font-light" style={{ color }}>{totalHz.toFixed(1)} Hz</p>
      </div>
      <div className="flex items-start justify-center gap-1 mb-2">
        {COLUMNS.map((col, i) => (
          <div key={i} className="flex flex-col items-center" style={{ width: COLUMN_WIDTH }}>
            <p className="text-[6px] font-mono mb-1" style={{ color: 'rgba(248,250,252,0.12)' }}>{col.label}</p>
            <div className="flex flex-col items-center gap-0.5 mb-0.5">
              {Array.from({ length: HEAVEN_COUNT }).map((_, bi) => {
                const ha = Math.floor(values[i] / HEAVEN_VALUE);
                const active = bi < ha;
                return (
                  <button key={`h-${bi}`} className="rounded-full" style={{
                    width: BEAD_SIZE, height: BEAD_SIZE,
                    background: active ? color : 'rgba(248,250,252,0.04)',
                    border: `1.5px solid ${active ? color : 'rgba(248,250,252,0.06)'}`,
                    boxShadow: active ? `0 0 6px ${color}30` : 'none',
                    transform: active ? 'translateY(3px)' : 'none', transition: 'all 0.2s',
                  }} onClick={() => {
                    const ea = values[i] % HEAVEN_VALUE;
                    const tgt = bi + 1;
                    handleChange(i, (ha === tgt ? tgt - 1 : tgt) * HEAVEN_VALUE + ea);
                  }} data-testid={`src-heaven-${i}-${bi}`} />
                );
              })}
            </div>
            <div className="w-full h-[1px] my-0.5" style={{ background: `${color}20` }} />
            <div className="flex flex-col items-center gap-0.5 mt-0.5">
              {Array.from({ length: EARTH_COUNT }).map((_, bi) => {
                const ea = values[i] % HEAVEN_VALUE;
                const ha = Math.floor(values[i] / HEAVEN_VALUE);
                const active = bi < ea;
                return (
                  <button key={`e-${bi}`} className="rounded-full" style={{
                    width: BEAD_SIZE - 4, height: BEAD_SIZE - 4,
                    background: active ? `${color}70` : 'rgba(248,250,252,0.02)',
                    border: `1px solid ${active ? `${color}40` : 'rgba(248,250,252,0.04)'}`,
                    transform: active ? 'translateY(-2px)' : 'none', transition: 'all 0.2s',
                  }} onClick={() => {
                    const tgt = bi + 1;
                    handleChange(i, ha * HEAVEN_VALUE + (ea === tgt ? tgt - 1 : tgt));
                  }} data-testid={`src-earth-${i}-${bi}`} />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <motion.button className="w-full py-1.5 rounded-lg text-[8px] font-medium tracking-wider uppercase cursor-pointer"
        style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => onFrequencySet(totalHz)} data-testid="add-suanpan-track-btn">
        Add as Track ({totalHz.toFixed(1)} Hz)
      </motion.button>
    </div>
  );
}

/* ━━━ Keyframe Automation Lane (SVG curve) ━━━ */
const PHI = 1.618033988749895;
const GOLDEN_SNAPS = [0, 1/PHI/PHI, 1/PHI, 1 - 1/PHI, 1 - 1/PHI/PHI, 1];

function KeyframeLane({ keyframes, onChange, color, label, maxValue, minValue }) {
  const svgRef = useRef(null);
  const W = 280;
  const H = 32;

  const points = keyframes || [{ time: 0, value: maxValue * 0.8 }, { time: 60, value: maxValue * 0.8 }];
  const maxTime = Math.max(60, ...points.map(p => p.time));

  const toX = (time) => (time / maxTime) * W;
  const toY = (val) => H - ((val - minValue) / (maxValue - minValue)) * H;
  const fromX = (x) => (x / W) * maxTime;
  const fromY = (y) => minValue + ((H - y) / H) * (maxValue - minValue);

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.time).toFixed(1)} ${toY(p.value).toFixed(1)}`).join(' ')
    : `M 0 ${H / 2} L ${W} ${H / 2}`;

  const handleSvgClick = useCallback((e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let time = fromX(x);
    let value = fromY(y);

    // Snap to Golden Ratio intervals
    const snapT = GOLDEN_SNAPS.map(s => s * maxTime);
    const nearest = snapT.reduce((best, s) => Math.abs(s - time) < Math.abs(best - time) ? s : best, time);
    if (Math.abs(nearest - time) < maxTime * 0.03) time = nearest;

    value = Math.max(minValue, Math.min(maxValue, value));
    const newPoints = [...points, { time: Math.round(time * 10) / 10, value: Math.round(value * 100) / 100 }]
      .sort((a, b) => a.time - b.time);
    onChange(newPoints);
  }, [points, onChange, maxTime, minValue, maxValue]);

  const removePoint = useCallback((idx) => {
    if (points.length <= 2) return;
    onChange(points.filter((_, i) => i !== idx));
  }, [points, onChange]);

  return (
    <div className="mt-1" data-testid={`keyframe-lane-${label}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <p className="text-[6px] tracking-wider uppercase" style={{ color: `${color}60` }}>{label}</p>
        {/* Golden ratio snap lines */}
        <div className="flex-1" />
        <p className="text-[5px] font-mono" style={{ color: 'rgba(248,250,252,0.1)' }}>
          {points.length} pts
        </p>
      </div>
      <svg ref={svgRef} width={W} height={H} className="cursor-crosshair rounded"
        style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.03)' }}
        onClick={handleSvgClick}>
        {/* Golden ratio snap lines */}
        {GOLDEN_SNAPS.slice(1, -1).map((s, i) => (
          <line key={i} x1={s * W} y1={0} x2={s * W} y2={H}
            stroke={`${color}10`} strokeWidth={0.5} strokeDasharray="2,2" />
        ))}
        {/* Curve */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}40)` }} />
        {/* Fill under curve */}
        <path d={`${pathD} L ${W} ${H} L 0 ${H} Z`} fill={`${color}08`} />
        {/* Control points */}
        {points.map((p, i) => (
          <circle key={i} cx={toX(p.time)} cy={toY(p.value)} r={3}
            fill={color} stroke="rgba(6,6,14,0.8)" strokeWidth={1}
            className="cursor-pointer" style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            onDoubleClick={(e) => { e.stopPropagation(); removePoint(i); }} />
        ))}
      </svg>
    </div>
  );
}

/* ━━━ Track Row with Keyframe Automation + Ripple Lock ━━━ */
function TrackRow({ track, index, onUpdate, onRemove, isGhost, onGhostClick, showKeyframes, onRipple, totalDuration, isRippling }) {
  const meta = TRACK_TYPE_META[track.type] || TRACK_TYPE_META.custom;
  const Icon = meta.icon;
  const [expanded, setExpanded] = useState(false);
  const isLocked = track.ripple_locked;
  const startPct = totalDuration > 0 ? (track.start_time || 0) / totalDuration * 100 : 0;
  const durPct = totalDuration > 0 ? (track.duration || 60) / totalDuration * 100 : 100;

  if (isGhost) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer"
        style={{ background: 'rgba(248,250,252,0.01)', border: '1px dashed rgba(248,250,252,0.05)', opacity: 0.35 }}
        onClick={onGhostClick} data-testid={`ghost-track-${index}`}>
        <Ghost size={11} style={{ color: 'rgba(248,250,252,0.15)' }} />
        <p className="flex-1 text-[9px]" style={{ color: 'rgba(248,250,252,0.15)' }}>{track.source_label || 'Locked Layer'}</p>
        <Lock size={9} style={{ color: 'rgba(248,250,252,0.1)' }} />
      </div>
    );
  }

  const handleDurationChange = (newDur) => {
    const oldDur = track.duration || 60;
    const clamped = Math.max(1, Math.round(newDur));
    if (clamped !== oldDur) {
      onUpdate(index, { duration: clamped });
      if (onRipple) onRipple(index, oldDur, clamped, track.start_time || 0, track.start_time || 0);
    }
  };

  return (
    <motion.div className="rounded-lg mb-1 group relative overflow-hidden"
      style={{
        background: track.muted ? 'rgba(248,250,252,0.01)' : `${meta.color}05`,
        border: `1px solid ${track.muted ? 'rgba(248,250,252,0.03)' : `${meta.color}12`}`,
      }}
      layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
      data-testid={`track-row-${index}`}>

      {/* Ripple wave animation */}
      {isRippling && (
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.color}15, transparent)` }}
          initial={{ x: '-100%' }} animate={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {/* Timeline position bar */}
      <div className="h-[3px] w-full relative" style={{ background: 'rgba(248,250,252,0.02)' }}>
        <motion.div className="absolute top-0 h-full rounded-full"
          style={{
            left: `${startPct}%`, width: `${Math.max(2, durPct)}%`,
            background: isLocked
              ? `repeating-linear-gradient(45deg, ${meta.color}30, ${meta.color}30 2px, transparent 2px, transparent 4px)`
              : `${meta.color}40`,
          }}
          layout
        />
      </div>

      {/* Main row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <GripVertical size={9} className="opacity-0 group-hover:opacity-30 transition-opacity cursor-grab" style={{ color: '#F8FAFC' }} />

        <div className="p-1 rounded" style={{ background: `${meta.color}10` }}>
          <Icon size={10} style={{ color: track.muted ? 'rgba(248,250,252,0.2)' : meta.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-medium truncate" style={{ color: track.muted ? 'rgba(248,250,252,0.2)' : 'rgba(248,250,252,0.6)' }}>
            {track.source_label}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {track.frequency && <span className="text-[6px] font-mono" style={{ color: `${meta.color}50` }}>{track.frequency}Hz</span>}
            <span className="text-[6px] font-mono flex items-center gap-0.5" style={{ color: 'rgba(248,250,252,0.2)' }}>
              <Clock size={6} /> {track.start_time || 0}s
            </span>
          </div>
        </div>

        {/* Duration control */}
        <div className="flex items-center gap-0.5">
          <button className="text-[7px] px-0.5 rounded hover:bg-white/5" data-testid={`dur-minus-${index}`}
            onClick={() => handleDurationChange((track.duration || 60) - 5)}
            style={{ color: 'rgba(248,250,252,0.3)' }}>-</button>
          <span className="text-[7px] font-mono w-6 text-center" style={{ color: meta.color }}
            data-testid={`track-duration-${index}`}>
            {track.duration || 60}s
          </span>
          <button className="text-[7px] px-0.5 rounded hover:bg-white/5" data-testid={`dur-plus-${index}`}
            onClick={() => handleDurationChange((track.duration || 60) + 5)}
            style={{ color: 'rgba(248,250,252,0.3)' }}>+</button>
        </div>

        {/* Volume */}
        <div className="w-10 h-1.5 rounded-full overflow-hidden cursor-pointer relative"
          style={{ background: 'rgba(248,250,252,0.05)' }}
          onClick={e => {
            const r = e.currentTarget.getBoundingClientRect();
            onUpdate(index, { volume: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) });
          }} data-testid={`track-volume-${index}`}>
          <div className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${(track.volume || 0.8) * 100}%`, background: track.muted ? 'rgba(248,250,252,0.08)' : meta.color }} />
        </div>

        <button className="p-0.5 rounded" onClick={() => onUpdate(index, { muted: !track.muted })} data-testid={`track-mute-${index}`}>
          {track.muted ? <VolumeX size={9} style={{ color: 'rgba(248,250,252,0.25)' }} /> : <Volume2 size={9} style={{ color: meta.color }} />}
        </button>

        <button className="text-[6px] font-bold px-0.5 py-0.5 rounded" data-testid={`track-solo-${index}`}
          style={{ color: track.solo ? '#EAB308' : 'rgba(248,250,252,0.2)', background: track.solo ? 'rgba(234,179,8,0.1)' : 'transparent' }}
          onClick={() => onUpdate(index, { solo: !track.solo })}>S</button>

        {/* Ripple Lock */}
        <button className="p-0.5 rounded" data-testid={`track-lock-${index}`}
          onClick={() => onUpdate(index, { ripple_locked: !isLocked })}
          title={isLocked ? 'Locked — anchored position' : 'Unlocked — shifts with ripple'}>
          {isLocked
            ? <Lock size={9} style={{ color: '#EAB308' }} />
            : <Unlock size={9} style={{ color: 'rgba(248,250,252,0.15)' }} />}
        </button>

        {showKeyframes && (
          <button className="p-0.5 rounded" onClick={() => setExpanded(!expanded)}
            data-testid={`track-keyframe-toggle-${index}`}>
            <ChevronDown size={9} style={{
              color: expanded ? meta.color : 'rgba(248,250,252,0.2)',
              transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
            }} />
          </button>
        )}

        <button className="p-0.5 rounded opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
          onClick={() => onRemove(index)} data-testid={`track-remove-${index}`}>
          <Trash2 size={9} style={{ color: '#EF4444' }} />
        </button>
      </div>

      {/* Keyframe automation lanes */}
      <AnimatePresence>
        {expanded && showKeyframes && (
          <motion.div className="px-3 pb-2 space-y-1"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <KeyframeLane
              keyframes={track.keyframes_volume}
              onChange={(kf) => onUpdate(index, { keyframes_volume: kf })}
              color={meta.color} label="Volume" maxValue={1} minValue={0}
            />
            {track.frequency && (
              <KeyframeLane
                keyframes={track.keyframes_frequency}
                onChange={(kf) => onUpdate(index, { keyframes_frequency: kf })}
                color="#EAB308" label="Frequency"
                maxValue={Math.max(1200, (track.frequency || 528) * 2)} minValue={0}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ━━━ Speed Bridge Modal (4 Tiers) ━━━ */
function SpeedBridgeModal({ currentTier, onUpgrade, onClose }) {
  const tiers = [
    { key: 'discovery', name: 'Discovery', price: 'Free', color: '#94A3B8', cap: '3 tracks', features: ['Basic Tones', '44.1kHz Stereo', '5 AI Credits/mo', '15-30s Assembly'] },
    { key: 'player', name: 'Player', price: '$9.99/mo', color: '#2DD4BF', cap: '8 tracks', features: ['Extended Library', '48kHz Hi-Fi', '40 AI Credits/mo', '5-8s Loading'] },
    { key: 'ultra_player', name: 'Ultra Player', price: '$24.99/mo', color: '#C084FC', cap: '20 tracks', features: ['3,000+ Effects', '88.2kHz Lossless', '150 AI Credits/mo', '2-3s Stabilization'] },
    { key: 'sovereign', name: 'Sovereign', price: '$49.99/mo', color: '#EAB308', cap: 'Unlimited', features: ['Full Phonic', '96kHz Spatial', '250+ Credits + NPU', 'Instant'] },
  ];
  const tierOrder = ['discovery', 'player', 'ultra_player', 'sovereign'];
  const currentIdx = tierOrder.indexOf(currentTier);

  return (
    <motion.div className="fixed inset-0 z-[10002] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      data-testid="speed-bridge-modal">
      <motion.div className="w-full max-w-2xl mx-4 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(10,10,18,0.97)', border: '1px solid rgba(248,250,252,0.06)' }}
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>

        <div className="p-5 text-center border-b" style={{ borderColor: 'rgba(248,250,252,0.05)' }}>
          <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: '#EAB308' }}>Speed Bridge</p>
          <p className="text-base font-light" style={{ color: 'rgba(248,250,252,0.5)', fontFamily: 'Cormorant Garamond, serif' }}>
            Your composition has reached Divine Complexity
          </p>
          <p className="text-[8px] mt-1" style={{ color: 'rgba(248,250,252,0.2)' }}>
            Upgrade for more layers, faster rendering, and expanded libraries
          </p>
        </div>

        <div className="p-4 grid grid-cols-4 gap-2">
          {tiers.map((t, i) => {
            const isCurrent = t.key === currentTier;
            const isUpgrade = i > currentIdx;
            return (
              <div key={t.key} className="rounded-xl p-3 text-center flex flex-col"
                style={{ background: isCurrent ? `${t.color}06` : 'rgba(248,250,252,0.015)', border: `1px solid ${isCurrent ? `${t.color}25` : 'rgba(248,250,252,0.04)'}` }}
                data-testid={`tier-card-${t.key}`}>
                <p className="text-[10px] font-medium tracking-wider" style={{ color: t.color }}>{t.name}</p>
                <p className="text-[11px] font-light mt-0.5" style={{ color: 'rgba(248,250,252,0.4)' }}>{t.price}</p>
                <p className="text-[8px] font-mono mt-1" style={{ color: `${t.color}80` }}>{t.cap}</p>
                <div className="mt-2 space-y-0.5 flex-1">
                  {t.features.map((f, fi) => <p key={fi} className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>{f}</p>)}
                </div>
                {isCurrent && (
                  <p className="text-[7px] mt-2 px-2 py-0.5 rounded-full inline-block mx-auto"
                    style={{ background: `${t.color}12`, color: t.color }}>Current</p>
                )}
                {isUpgrade && (
                  <motion.button className="mt-2 px-3 py-1 rounded-full text-[8px] font-medium cursor-pointer mx-auto"
                    style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}25` }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => onUpgrade(t.key)} data-testid={`upgrade-to-${t.key}`}>
                    Upgrade <ArrowUpRight size={8} className="inline ml-0.5" />
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 text-center border-t" style={{ borderColor: 'rgba(248,250,252,0.05)' }}>
          <button className="text-[8px] px-4 py-1.5 rounded-full cursor-pointer"
            style={{ color: 'rgba(248,250,252,0.25)', background: 'rgba(248,250,252,0.02)' }}
            onClick={onClose} data-testid="close-speed-bridge">
            Continue with {TIER_DISPLAY[currentTier] || 'Current'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ━━━ Bonus Pack Card ━━━ */
function BonusPackCard({ pack, onPurchase, purchasing }) {
  const tierColor = SUB_COLORS[pack.tier_required] || '#94A3B8';
  return (
    <motion.div className="rounded-xl p-3 mb-2 relative overflow-hidden"
      style={{
        background: pack.owned ? `${pack.color}06` : 'rgba(248,250,252,0.015)',
        border: `1px solid ${pack.owned ? `${pack.color}20` : pack.tier_locked ? 'rgba(248,250,252,0.03)' : 'rgba(248,250,252,0.06)'}`,
        opacity: pack.tier_locked ? 0.5 : 1,
      }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      data-testid={`bonus-pack-${pack.id}`}>

      {pack.owned && (
        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 16px ${pack.color}10` }}
          animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
      )}

      <div className="flex items-start gap-2 relative z-10">
        <div className="p-1.5 rounded-lg" style={{ background: `${pack.color}12` }}>
          <Package size={12} style={{ color: pack.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium" style={{ color: '#F8FAFC' }}>{pack.name}</p>
          <p className="text-[7px] mt-0.5 line-clamp-2" style={{ color: 'rgba(248,250,252,0.3)' }}>{pack.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: `${tierColor}12`, color: tierColor, border: `1px solid ${tierColor}20` }}>
              {(pack.tier_required || '').replace('_', ' ')}
            </span>
            <span className="text-[7px] font-mono" style={{ color: '#22C55E' }}>
              {pack.bonus_wrap?.label}
            </span>
            <span className="text-[7px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
              {pack.tracks_included} tracks
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {pack.tier_locked ? (
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
              <Crown size={11} style={{ color: tierColor }} />
            </div>
          ) : pack.owned ? (
            <p className="text-[7px] px-2 py-0.5 rounded-full" style={{ background: `${pack.color}12`, color: pack.color }}>Owned</p>
          ) : (
            <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer"
              style={{
                background: pack.can_afford ? `${pack.color}10` : 'rgba(248,250,252,0.02)',
                border: `1px solid ${pack.can_afford ? `${pack.color}20` : 'rgba(248,250,252,0.04)'}`,
                opacity: pack.can_afford ? 1 : 0.5,
              }}
              whileHover={pack.can_afford ? { scale: 1.05 } : {}} whileTap={pack.can_afford ? { scale: 0.95 } : {}}
              onClick={() => pack.can_afford && onPurchase(pack.id)}
              disabled={purchasing || !pack.can_afford}
              data-testid={`buy-pack-${pack.id}`}>
              {purchasing ? <Loader2 size={9} className="animate-spin" style={{ color: pack.color }} />
                : <ShoppingCart size={9} style={{ color: pack.can_afford ? pack.color : 'rgba(248,250,252,0.2)' }} />}
              <span className="text-[8px] font-mono" style={{ color: pack.can_afford ? pack.color : 'rgba(248,250,252,0.2)' }}>
                {pack.price_credits}c
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ━━━ Hexagram Recommendation Card ━━━ */
function RecommendationCard({ rec, onPurchase, purchasing }) {
  const isStagnation = rec.type === 'stagnation';
  const isActive = rec.tone === 'active';
  const borderColor = isStagnation ? '#EF4444' : rec.pack_color || '#C084FC';

  return (
    <motion.div className="rounded-xl p-3 mb-2 relative overflow-hidden"
      style={{
        background: isStagnation ? 'rgba(239,68,68,0.04)' : `${rec.pack_color}04`,
        border: `1px solid ${isStagnation ? 'rgba(239,68,68,0.15)' : `${rec.pack_color}15`}`,
      }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      data-testid={`rec-card-${rec.type}`}>

      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded-lg" style={{ background: `${borderColor}12` }}>
          {isStagnation ? <AlertTriangle size={12} style={{ color: '#EF4444' }} />
            : <Compass size={12} style={{ color: borderColor }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[7px] uppercase tracking-wider font-medium"
              style={{ color: isStagnation ? '#EF4444' : `${borderColor}80` }}>
              {rec.trigram}
            </p>
            <span className="text-[6px] px-1 py-0.5 rounded-full"
              style={{ background: isActive ? `${borderColor}15` : 'rgba(248,250,252,0.03)',
                       color: isActive ? borderColor : 'rgba(248,250,252,0.3)' }}>
              {isActive ? 'RECOMMENDED' : 'IN YOUR KIT'}
            </span>
          </div>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: '#F8FAFC' }}>{rec.pack_name}</p>
          <p className="text-[7px] mt-0.5" style={{ color: isActive ? 'rgba(248,250,252,0.4)' : 'rgba(248,250,252,0.25)' }}>
            {rec.message}
          </p>
          {rec.bonus_wrap && (
            <span className="text-[6px] font-mono mt-1 inline-block" style={{ color: '#22C55E' }}>
              {rec.bonus_wrap.label}
            </span>
          )}
        </div>
        {isActive && !rec.owned && (
          <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer flex-shrink-0"
            style={{ background: `${borderColor}12`, border: `1px solid ${borderColor}20` }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onPurchase(rec.pack_id)}
            disabled={purchasing}
            data-testid={`rec-buy-${rec.pack_id}`}>
            {purchasing ? <Loader2 size={9} className="animate-spin" style={{ color: borderColor }} />
              : <ShoppingCart size={9} style={{ color: borderColor }} />}
            <span className="text-[7px] font-mono" style={{ color: borderColor }}>{rec.price_credits}c</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* ━━━ DIVINE DIRECTOR — Main Component ━━━ */
export default function SuanpanMixer() {
  const navigate = useNavigate();
  const { authHeaders, loading: authLoading, token } = useAuth();
  const { playConfirmation, isMuted } = useSensory();

  const [subTier, setSubTier] = useState('discovery');
  const [tierConfig, setTierConfig] = useState(null);
  const [aiCredits, setAiCredits] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const [tracks, setTracks] = useState([]);
  const [projectName, setProjectName] = useState('Untitled Session');
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);

  const [suanpanOpen, setSuanpanOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [packsOpen, setPacksOpen] = useState(false);
  const [sources, setSources] = useState([]);
  const [bonusPacks, setBonusPacks] = useState([]);
  const [purchasingPack, setPurchasingPack] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [hexagramInfo, setHexagramInfo] = useState(null);
  const [showSpeedBridge, setShowSpeedBridge] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showAssembly, setShowAssembly] = useState(false);
  const [ripplingIndices, setRipplingIndices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  const layerCap = tierConfig?.layer_cap || 3;
  const atCap = layerCap > 0 && tracks.length >= layerCap;
  const tierColor = SUB_COLORS[subTier] || '#94A3B8';
  const matDelay = tierConfig?.materialization_delay || 20;
  const keyframesEnabled = tierConfig?.keyframe_automation || false;

  const ghostTracks = sources.filter(s => s.locked).slice(0, 3).map(s => ({
    type: s.type, source_label: s.label, volume: 0.5, locked: true, frequency: s.frequency,
  }));

  // Load data
  useEffect(() => {
    if (authLoading || !token) return;
    const load = async () => {
      try {
        const [subRes, srcRes, projRes, packRes, recRes] = await Promise.all([
          axios.get(`${API}/mixer/subscription`, { headers: authHeaders }),
          axios.get(`${API}/mixer/sources`, { headers: authHeaders }),
          axios.get(`${API}/mixer/projects`, { headers: authHeaders }),
          axios.get(`${API}/mixer/bonus-packs`, { headers: authHeaders }),
          axios.get(`${API}/mixer/recommendations`, { headers: authHeaders }),
        ]);
        setSubTier(subRes.data.tier);
        setTierConfig(subRes.data.tier_config);
        setAiCredits(subRes.data.ai_credits_remaining);
        setSpeedBonus(subRes.data.speed_bonus_pct);
        setSources(srcRes.data.sources || []);
        setProjects(projRes.data.projects || []);
        setBonusPacks(packRes.data.packs || []);
        setRecommendations(recRes.data.recommendations || []);
        setHexagramInfo(recRes.data.hexagram || null);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [authHeaders, authLoading, token]);

  const reloadAll = useCallback(async () => {
    try {
      const [subRes, srcRes, projRes, packRes, recRes] = await Promise.all([
        axios.get(`${API}/mixer/subscription`, { headers: authHeaders }),
        axios.get(`${API}/mixer/sources`, { headers: authHeaders }),
        axios.get(`${API}/mixer/projects`, { headers: authHeaders }),
        axios.get(`${API}/mixer/bonus-packs`, { headers: authHeaders }),
        axios.get(`${API}/mixer/recommendations`, { headers: authHeaders }),
      ]);
      setSubTier(subRes.data.tier);
      setTierConfig(subRes.data.tier_config);
      setAiCredits(subRes.data.ai_credits_remaining);
      setSpeedBonus(subRes.data.speed_bonus_pct);
      setSources(srcRes.data.sources || []);
      setProjects(projRes.data.projects || []);
      setBonusPacks(packRes.data.packs || []);
      setRecommendations(recRes.data.recommendations || []);
      setHexagramInfo(recRes.data.hexagram || null);
    } catch {}
  }, [authHeaders]);

  const addTrack = useCallback((source) => {
    if (source.locked) { setShowSpeedBridge(true); return; }
    if (atCap) { setShowSpeedBridge(true); return; }
    // Trigger Sacred Assembly for Discovery tier
    if (matDelay > 10 && source.tier !== 'discovery') {
      setShowAssembly(true);
      setTimeout(() => {
        setTracks(prev => [...prev, {
          type: source.type || 'custom', source_id: source.id || '',
          source_label: source.label || 'New Track', volume: 0.8,
          muted: false, solo: false, start_time: 0, duration: 60,
          frequency: source.frequency || null, color: source.color || '#94A3B8', locked: false, ripple_locked: false,
        }]);
        setShowAssembly(false);
        if (!isMuted) playConfirmation(660, 'medium');
      }, matDelay * 1000);
      return;
    }
    setTracks(prev => [...prev, {
      type: source.type || 'custom', source_id: source.id || '',
      source_label: source.label || 'New Track', volume: 0.8,
      muted: false, solo: false, start_time: 0, duration: 60,
      frequency: source.frequency || null, color: source.color || '#94A3B8', locked: false, ripple_locked: false,
    }]);
    if (!isMuted) playConfirmation(660, 'medium');
    setSourcesOpen(false);
  }, [atCap, isMuted, playConfirmation, matDelay]);

  const addSuanpanTrack = useCallback((hz) => {
    if (atCap) { setShowSpeedBridge(true); return; }
    setTracks(prev => [...prev, {
      type: 'suanpan', source_id: `suanpan-${hz}`, source_label: `Suanpan ${hz.toFixed(1)} Hz`,
      volume: 0.8, muted: false, solo: false, start_time: 0, duration: 60,
      frequency: hz, color: '#EAB308', locked: false, ripple_locked: false,
    }]);
    if (!isMuted) playConfirmation(hz > 500 ? 880 : 440, 'medium');
    setSuanpanOpen(false);
  }, [atCap, isMuted, playConfirmation]);

  const addBonusPackTracks = useCallback(async (packId) => {
    try {
      const owned = await axios.get(`${API}/mixer/bonus-packs/owned`, { headers: authHeaders });
      const pack = (owned.data.owned_packs || []).find(p => p.pack_id === packId);
      if (!pack) return;
      const newTracks = (pack.tracks || []).map(t => ({
        type: t.type || 'bonus_pack', source_id: packId,
        source_label: t.source_label || 'Pack Track', volume: 0.8,
        muted: false, solo: false, start_time: 0, duration: 60,
        frequency: t.frequency || null, color: t.color || '#F472B6', locked: false, ripple_locked: false,
      }));
      const remaining = layerCap > 0 ? layerCap - tracks.length : 50;
      setTracks(prev => [...prev, ...newTracks.slice(0, remaining)]);
      toast.success(`Added ${Math.min(newTracks.length, remaining)} tracks from pack`);
    } catch {}
  }, [authHeaders, tracks.length, layerCap]);

  const purchasePack = useCallback(async (packId) => {
    setPurchasingPack(packId);
    try {
      const res = await axios.post(`${API}/mixer/bonus-packs/purchase`, { packId }, { headers: authHeaders });
      toast.success(`${res.data.purchased} — ${res.data.bonus_activated}`);
      if (!isMuted) playConfirmation(1046.5, 'high');
      reloadAll();
      addBonusPackTracks(packId);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Purchase failed');
    } finally { setPurchasingPack(null); }
  }, [authHeaders, reloadAll, isMuted, playConfirmation, addBonusPackTracks]);

  const updateTrack = useCallback((index, updates) => {
    setTracks(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t));
  }, []);

  const removeTrack = useCallback((index) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Total timeline duration for position bar calculation
  const totalDuration = Math.max(60, ...tracks.map(t => (t.start_time || 0) + (t.duration || 60)));

  // Ripple edit handler — shift subsequent unlocked tracks when duration changes
  const handleRipple = useCallback((changedIdx, oldDur, newDur, oldStart, newStart) => {
    const delta = newDur - oldDur;
    if (delta === 0) return;

    setTracks(prev => {
      const result = prev.map((t, i) => {
        if (i <= changedIdx) return t;
        if (t.ripple_locked) return t;
        // Shift start_time by delta
        return { ...t, start_time: Math.max(0, (t.start_time || 0) + delta) };
      });
      return result;
    });

    // Show ripple wave animation on shifted tracks
    const shifted = tracks
      .map((t, i) => (i > changedIdx && !t.ripple_locked) ? i : -1)
      .filter(i => i >= 0);
    setRipplingIndices(shifted);
    setTimeout(() => setRipplingIndices([]), 700);

    if (!isMuted) playConfirmation(delta > 0 ? 523 : 392, 'low');
  }, [tracks, isMuted, playConfirmation]);


  const saveProject = useCallback(async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/mixer/projects`, { name: projectName, tracks }, { headers: authHeaders });
      toast.success(`"${projectName}" saved`);
      const r = await axios.get(`${API}/mixer/projects`, { headers: authHeaders });
      setProjects(r.data.projects || []);
    } catch (e) {
      const d = e.response?.data?.detail || 'Save failed';
      if (d.includes('Layer cap')) setShowSpeedBridge(true);
      toast.error(d);
    } finally { setSaving(false); }
  }, [projectName, tracks, authHeaders]);

  const loadProject = useCallback(async (pid) => {
    try {
      const r = await axios.get(`${API}/mixer/projects/${pid}`, { headers: authHeaders });
      setTracks(r.data.tracks || []);
      setProjectName(r.data.name || 'Loaded Session');
      setShowProjects(false);
      toast.success(`Loaded: ${r.data.name}`);
    } catch { toast.error('Load failed'); }
  }, [authHeaders]);

  const handleUpgrade = useCallback(async (tier) => {
    try {
      const r = await axios.post(`${API}/mixer/subscription/upgrade`, { tier }, { headers: authHeaders });
      setSubTier(r.data.tier);
      setTierConfig(r.data.tier_config);
      setShowSpeedBridge(false);
      toast.success(r.data.message);
      reloadAll();
    } catch (e) { toast.error(e.response?.data?.detail || 'Upgrade failed'); }
  }, [authHeaders, reloadAll]);

  const togglePlayAll = useCallback(() => {
    if (isPlaying) {
      nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
      nodesRef.current = [];
      setIsPlaying(false);
      return;
    }
    if (tracks.length === 0) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const hasSolo = tracks.some(t => t.solo);
      const playable = tracks.filter(t => !t.muted && t.frequency && (!hasSolo || t.solo));
      playable.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = t.frequency;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(t.volume * 0.04, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        nodesRef.current.push(osc);
      });
      setIsPlaying(true);
    } catch {}
  }, [isPlaying, tracks]);

  useEffect(() => { return () => { nodesRef.current.forEach(n => { try { n.stop(); } catch {} }); }; }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'rgba(248,250,252,0.15)' }} />
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#06060e' }} data-testid="divine-director-page">

      {/* ━━━ HEADER ━━━ */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b z-[10000]"
        style={{ borderColor: 'rgba(248,250,252,0.05)', background: 'rgba(6,6,14,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hub')} className="p-1.5 rounded-lg"
            style={{ background: 'rgba(248,250,252,0.03)' }} data-testid="director-back-btn">
            <ArrowLeft size={13} style={{ color: 'rgba(248,250,252,0.35)' }} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-light tracking-[0.15em] uppercase"
                style={{ color: 'rgba(248,250,252,0.35)', fontFamily: 'Cormorant Garamond, serif' }}>
                Divine Director
              </h1>
              <NanoGuide guideId="divine-director" position="top-right" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium"
                style={{ background: `${tierColor}12`, color: tierColor, border: `1px solid ${tierColor}20` }}>
                {TIER_DISPLAY[subTier] || subTier}
              </span>
              <span className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {aiCredits} AI &middot; {speedBonus > 0 ? `+${speedBonus}% speed` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
            className="text-[9px] px-2 py-1 rounded-lg w-32 text-right"
            style={{ background: 'rgba(248,250,252,0.025)', border: '1px solid rgba(248,250,252,0.05)', color: '#F8FAFC', outline: 'none' }}
            data-testid="project-name-input" />
          <motion.button className="p-1.5 rounded-lg cursor-pointer" style={{ background: 'rgba(248,250,252,0.03)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowProjects(!showProjects)} data-testid="open-projects-btn">
            <FolderOpen size={12} style={{ color: 'rgba(248,250,252,0.35)' }} />
          </motion.button>
          <motion.button className="p-1.5 rounded-lg cursor-pointer"
            style={{ background: saving ? `${tierColor}12` : 'rgba(248,250,252,0.03)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={saveProject} disabled={saving} data-testid="save-project-btn">
            {saving ? <Loader2 size={12} className="animate-spin" style={{ color: tierColor }} />
              : <Save size={12} style={{ color: 'rgba(248,250,252,0.35)' }} />}
          </motion.button>
          <motion.button className="p-1.5 rounded-lg cursor-pointer" style={{ background: 'rgba(248,250,252,0.03)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowSpeedBridge(true)} data-testid="tier-info-btn">
            <Crown size={12} style={{ color: tierColor }} />
          </motion.button>
        </div>
      </div>

      {/* ━━━ MAIN ━━━ */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Transport */}
          <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
            <motion.button className="p-1.5 rounded-lg cursor-pointer"
              style={{
                background: isPlaying ? 'rgba(239,68,68,0.1)' : `${tierColor}08`,
                border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.2)' : `${tierColor}15`}`,
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={togglePlayAll} data-testid="play-all-btn">
              {isPlaying ? <Square size={11} style={{ color: '#EF4444' }} /> : <Play size={11} style={{ color: tierColor }} />}
            </motion.button>

            <div className="flex-1 flex items-center gap-2">
              <Layers size={10} style={{ color: 'rgba(248,250,252,0.15)' }} />
              <p className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.25)' }}>
                {tracks.length}{layerCap > 0 ? `/${layerCap}` : ''} layers
              </p>
              {atCap && <span className="text-[6px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>CAP</span>}
              {speedBonus > 0 && <span className="text-[6px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>+{speedBonus}%</span>}
            </div>

            <div className="flex items-center gap-1">
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.35)' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSourcesOpen(!sourcesOpen)} data-testid="add-source-btn">
                <Plus size={9} /> Sources
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.1)', color: '#EAB308' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSuanpanOpen(!suanpanOpen)} data-testid="add-suanpan-btn">
                <Sliders size={9} /> Suanpan
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.1)', color: '#F472B6' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setPacksOpen(!packsOpen)} data-testid="open-packs-btn">
                <Package size={9} /> Packs
              </motion.button>
            </div>
          </div>

          {/* Collapsible panels */}
          <AnimatePresence>
            {suanpanOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(234,179,8,0.015)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <SuanpanSource onFrequencySet={addSuanpanTrack} color="#EAB308" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sourcesOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(248,250,252,0.008)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="p-3 max-h-44 overflow-y-auto">
                  <p className="text-[7px] tracking-wider uppercase mb-2" style={{ color: 'rgba(248,250,252,0.15)' }}>Track Sources</p>
                  <div className="grid grid-cols-3 gap-1">
                    {sources.map(s => {
                      const m = TRACK_TYPE_META[s.type] || TRACK_TYPE_META.custom;
                      return (
                        <motion.button key={s.id}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-left cursor-pointer"
                          style={{
                            background: s.locked ? 'rgba(248,250,252,0.008)' : `${m.color}05`,
                            border: `1px solid ${s.locked ? 'rgba(248,250,252,0.03)' : `${m.color}10`}`,
                            opacity: s.locked ? 0.45 : 1,
                          }}
                          whileHover={s.locked ? {} : { scale: 1.02 }} whileTap={s.locked ? {} : { scale: 0.98 }}
                          onClick={() => addTrack(s)} data-testid={`source-${s.id}`}>
                          {s.locked ? <Lock size={8} style={{ color: 'rgba(248,250,252,0.15)' }} />
                            : <m.icon size={8} style={{ color: m.color }} />}
                          <span className="text-[7px] truncate" style={{ color: s.locked ? 'rgba(248,250,252,0.15)' : 'rgba(248,250,252,0.45)' }}>
                            {s.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {packsOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(244,114,182,0.01)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="p-3 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[7px] tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.15)' }}>
                      Bonus Wrapped Packs
                    </p>
                    <p className="text-[7px] font-mono" style={{ color: '#F472B6' }}>
                      Purchases grant permanent speed bonuses
                    </p>
                  </div>
                  {bonusPacks.map(p => (
                    <BonusPackCard key={p.id} pack={p}
                      onPurchase={purchasePack}
                      purchasing={purchasingPack === p.id} />
                  ))}

                  {/* Hexagram-Based Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(248,250,252,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Compass size={9} style={{ color: hexagramInfo ? '#C084FC' : 'rgba(248,250,252,0.2)' }} />
                        <p className="text-[7px] tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.15)' }}>
                          Hexagram Recommendations
                        </p>
                        {hexagramInfo && (
                          <span className="text-[6px] px-1 py-0.5 rounded-full font-mono"
                            style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC' }}>
                            #{hexagramInfo.number} {hexagramInfo.chinese}
                          </span>
                        )}
                      </div>
                      {hexagramInfo && (
                        <p className="text-[7px] mb-2" style={{ color: 'rgba(248,250,252,0.2)' }}>
                          Lower: {hexagramInfo.lower_trigram?.name} ({hexagramInfo.lower_trigram?.quality}) &middot;
                          Upper: {hexagramInfo.upper_trigram?.name} ({hexagramInfo.upper_trigram?.quality})
                        </p>
                      )}
                      {recommendations.map((rec, i) => (
                        <RecommendationCard key={`rec-${i}`} rec={rec}
                          onPurchase={purchasePack}
                          purchasing={purchasingPack === rec.pack_id} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeline ruler */}
          {tracks.length > 0 && (
            <div className="px-4 pt-1 pb-0">
              <div className="flex items-center h-4 relative" style={{ background: 'rgba(248,250,252,0.01)' }}>
                {Array.from({ length: Math.ceil(totalDuration / 15) + 1 }).map((_, i) => {
                  const t = i * 15;
                  const pct = totalDuration > 0 ? (t / totalDuration) * 100 : 0;
                  return (
                    <div key={i} className="absolute flex flex-col items-center" style={{ left: `${pct}%` }}>
                      <div className="w-[1px] h-2" style={{ background: 'rgba(248,250,252,0.06)' }} />
                      <span className="text-[5px] font-mono" style={{ color: 'rgba(248,250,252,0.12)' }}>
                        {t}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Track list */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <AnimatePresence>
              {tracks.map((t, i) => (
                <TrackRow key={`t-${i}-${t.source_label}`} track={t} index={i}
                  onUpdate={updateTrack} onRemove={removeTrack} isGhost={false}
                  showKeyframes={keyframesEnabled} onRipple={handleRipple}
                  totalDuration={totalDuration} isRippling={ripplingIndices.includes(i)} />
              ))}
            </AnimatePresence>

            {tierConfig?.shadow_tracks && ghostTracks.length > 0 && (
              <div className="mt-3">
                <p className="text-[6px] tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,252,0.1)' }}>
                  Unlock with upgrade
                </p>
                {ghostTracks.map((gt, i) => (
                  <TrackRow key={`g-${i}`} track={gt} index={tracks.length + i}
                    onUpdate={() => {}} onRemove={() => {}} isGhost={true}
                    onGhostClick={() => setShowSpeedBridge(true)} />
                ))}
              </div>
            )}

            {tracks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Layers size={24} style={{ color: 'rgba(248,250,252,0.06)' }} />
                <p className="text-[10px] mt-3" style={{ color: 'rgba(248,250,252,0.15)' }}>No tracks yet</p>
                <p className="text-[8px] mt-1 max-w-xs" style={{ color: 'rgba(248,250,252,0.08)' }}>
                  Add tones, mantras, and ambient layers from Sources, the Suanpan abacus, or Bonus Packs.
                </p>
                <div className="flex gap-2 mt-4">
                  <motion.button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] cursor-pointer"
                    style={{ background: `${tierColor}08`, border: `1px solid ${tierColor}15`, color: tierColor }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSourcesOpen(true)}>
                    <Plus size={9} /> Sources
                  </motion.button>
                  <motion.button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] cursor-pointer"
                    style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.1)', color: '#EAB308' }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSuanpanOpen(true)}>
                    <Sliders size={9} /> Suanpan
                  </motion.button>
                  <motion.button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] cursor-pointer"
                    style={{ background: 'rgba(244,114,182,0.05)', border: '1px solid rgba(244,114,182,0.1)', color: '#F472B6' }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setPacksOpen(true)}>
                    <Package size={9} /> Packs
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects slide-over */}
      <AnimatePresence>
        {showProjects && (
          <motion.div className="fixed top-0 right-0 h-full z-[10001] w-64 flex flex-col"
            style={{ background: 'rgba(6,6,14,0.97)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(248,250,252,0.05)' }}
            initial={{ x: 260 }} animate={{ x: 0 }} exit={{ x: 260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} data-testid="projects-panel">
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'rgba(248,250,252,0.05)' }}>
              <p className="text-[9px] font-medium tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.3)' }}>Projects</p>
              <button className="p-1 rounded" onClick={() => setShowProjects(false)} data-testid="close-projects-btn">
                <X size={11} style={{ color: 'rgba(248,250,252,0.25)' }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {projects.map(p => (
                <motion.button key={p.id} className="w-full text-left px-3 py-2 rounded-lg cursor-pointer"
                  style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.03)' }}
                  whileHover={{ scale: 1.02 }} onClick={() => loadProject(p.id)} data-testid={`project-item-${p.id}`}>
                  <p className="text-[9px] font-medium" style={{ color: 'rgba(248,250,252,0.5)' }}>{p.name}</p>
                  <p className="text-[7px] mt-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
                    {p.track_count} tracks &middot; {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </motion.button>
              ))}
              {projects.length === 0 && <p className="text-[8px] text-center py-6" style={{ color: 'rgba(248,250,252,0.1)' }}>No projects</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Bridge */}
      <AnimatePresence>
        {showSpeedBridge && (
          <SpeedBridgeModal currentTier={subTier} onUpgrade={handleUpgrade} onClose={() => setShowSpeedBridge(false)} />
        )}
      </AnimatePresence>

      {/* Sacred Assembly */}
      <AnimatePresence>
        {showAssembly && (
          <SacredAssemblyLoader delay={matDelay} onComplete={() => setShowAssembly(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
