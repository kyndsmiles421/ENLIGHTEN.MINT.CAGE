import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Trash2, Lock, Unlock, Sliders, Waves,
  Sparkles, ChevronDown, Radio, Music, Eye, Zap, Gift,
  Ghost, GripVertical, Clock,
} from 'lucide-react';

// ━━━ Shared Constants ━━━
export const BEAD_SIZE = 22;
export const COLUMN_WIDTH = 46;
export const HEAVEN_COUNT = 2;
export const EARTH_COUNT = 5;
export const HEAVEN_VALUE = 5;
export const COLUMNS = [
  { label: '100s', multiplier: 100 },
  { label: '10s', multiplier: 10 },
  { label: '1s', multiplier: 1 },
  { label: '.1s', multiplier: 0.1 },
];

export const TRACK_TYPE_META = {
  phonic_tone: { icon: Radio, color: '#60A5FA', label: 'Phonic' },
  mantra: { icon: Music, color: '#C084FC', label: 'Mantra' },
  ambience: { icon: Waves, color: '#22C55E', label: 'Ambient' },
  visual: { icon: Eye, color: '#A78BFA', label: 'Visual' },
  suanpan: { icon: Sliders, color: '#EAB308', label: 'Suanpan' },
  generator: { icon: Zap, color: '#FB923C', label: 'Generator' },
  bonus_pack: { icon: Gift, color: '#F472B6', label: 'Pack' },
  custom: { icon: Sparkles, color: '#94A3B8', label: 'Custom' },
};

export const SUB_COLORS = {
  discovery: '#94A3B8', player: '#2DD4BF', ultra_player: '#C084FC', sovereign: '#EAB308',
};

export const TIER_DISPLAY = {
  discovery: 'Discovery', player: 'Player', ultra_player: 'Ultra Player', sovereign: 'Sovereign',
};

export const PHI = 1.618033988749895;
export const GOLDEN_SNAPS = [0, 1/PHI/PHI, 1/PHI, 1 - 1/PHI, 1 - 1/PHI/PHI, 1];

// ━━━ Suanpan Mini-Abacus ━━━
export function SuanpanSource({ onFrequencySet, color }) {
  const [values, setValues] = useState([5, 2, 8, 0]);
  const totalHz = COLUMNS.reduce((sum, col, i) => sum + values[i] * col.multiplier, 0);

  const handleChange = (colIdx, newVal) => {
    setValues(prev => { const n = [...prev]; n[colIdx] = Math.min(newVal, 9); return n; });
  };

  return (
    <div className="p-3" data-testid="suanpan-source-panel">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[8px] font-medium tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>Frequency Source</p>
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

// ━━━ Keyframe Automation Lane (SVG curve) ━━━
export function KeyframeLane({ keyframes, onChange, color, label, maxValue, minValue }) {
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
        <div className="flex-1" />
        <p className="text-[5px] font-mono" style={{ color: 'rgba(248,250,252,0.1)' }}>
          {points.length} pts
        </p>
      </div>
      <svg ref={svgRef} width={W} height={H} className="cursor-crosshair rounded"
        style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.03)' }}
        onClick={handleSvgClick}>
        {GOLDEN_SNAPS.slice(1, -1).map((s, i) => (
          <line key={i} x1={s * W} y1={0} x2={s * W} y2={H}
            stroke={`${color}10`} strokeWidth={0.5} strokeDasharray="2,2" />
        ))}
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}40)` }} />
        <path d={`${pathD} L ${W} ${H} L 0 ${H} Z`} fill={`${color}08`} />
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

// ━━━ Track Row with Keyframe Automation + Ripple Lock ━━━
export function TrackRow({ track, index, onUpdate, onRemove, isGhost, onGhostClick, showKeyframes, onRipple, totalDuration, isRippling }) {
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

      {isRippling && (
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.color}15, transparent)` }}
          initial={{ x: '-100%' }} animate={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

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

      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <GripVertical size={9} className="opacity-0 group-hover:opacity-30 transition-opacity cursor-grab" style={{ color: '#F8FAFC' }} />

        <div className="p-1 rounded" style={{ background: `${meta.color}10` }}>
          <Icon size={10} style={{ color: track.muted ? 'rgba(255,255,255,0.6)' : meta.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-medium truncate" style={{ color: track.muted ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)' }}>
            {track.source_label}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {track.frequency && <span className="text-[6px] font-mono" style={{ color: `${meta.color}50` }}>{track.frequency}Hz</span>}
            <span className="text-[6px] font-mono flex items-center gap-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <Clock size={6} /> {track.start_time || 0}s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <button className="text-[7px] px-0.5 rounded hover:bg-white/5" data-testid={`dur-minus-${index}`}
            onClick={() => handleDurationChange((track.duration || 60) - 5)}
            style={{ color: 'rgba(255,255,255,0.65)' }}>-</button>
          <span className="text-[7px] font-mono w-6 text-center" style={{ color: meta.color }}
            data-testid={`track-duration-${index}`}>
            {track.duration || 60}s
          </span>
          <button className="text-[7px] px-0.5 rounded hover:bg-white/5" data-testid={`dur-plus-${index}`}
            onClick={() => handleDurationChange((track.duration || 60) + 5)}
            style={{ color: 'rgba(255,255,255,0.65)' }}>+</button>
        </div>

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
          {track.muted ? <VolumeX size={9} style={{ color: 'rgba(255,255,255,0.6)' }} /> : <Volume2 size={9} style={{ color: meta.color }} />}
        </button>

        <button className="text-[6px] font-bold px-0.5 py-0.5 rounded" data-testid={`track-solo-${index}`}
          style={{ color: track.solo ? '#EAB308' : 'rgba(255,255,255,0.6)', background: track.solo ? 'rgba(234,179,8,0.1)' : 'transparent' }}
          onClick={() => onUpdate(index, { solo: !track.solo })}>S</button>

        <button className="p-0.5 rounded" data-testid={`track-lock-${index}`}
          onClick={() => onUpdate(index, { ripple_locked: !isLocked })}
          title={isLocked ? 'Locked - anchored position' : 'Unlocked - shifts with ripple'}>
          {isLocked
            ? <Lock size={9} style={{ color: '#EAB308' }} />
            : <Unlock size={9} style={{ color: 'rgba(248,250,252,0.15)' }} />}
        </button>

        {showKeyframes && (
          <button className="p-0.5 rounded" onClick={() => setExpanded(!expanded)}
            data-testid={`track-keyframe-toggle-${index}`}>
            <ChevronDown size={9} style={{
              color: expanded ? meta.color : 'rgba(255,255,255,0.6)',
              transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
            }} />
          </button>
        )}

        <button className="p-0.5 rounded opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
          onClick={() => onRemove(index)} data-testid={`track-remove-${index}`}>
          <Trash2 size={9} style={{ color: '#EF4444' }} />
        </button>
      </div>

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
