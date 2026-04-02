import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';

const BEAD_SIZE = 28;
const COLUMN_WIDTH = 60;
const HEAVEN_COUNT = 2;
const EARTH_COUNT = 5;
const HEAVEN_VALUE = 5;

const COLUMNS = [
  { label: '100s', multiplier: 100 },
  { label: '10s', multiplier: 10 },
  { label: '1s', multiplier: 1 },
  { label: '.1s', multiplier: 0.1 },
];

const PRESETS = [
  { label: 'Schumann', hz: 7.83, desc: "Earth's heartbeat" },
  { label: 'OM', hz: 136.1, desc: 'Vedic year-tone' },
  { label: 'UT', hz: 174.0, desc: 'Pain reduction' },
  { label: 'RE', hz: 285.0, desc: 'Tissue healing' },
  { label: 'MI', hz: 528.0, desc: 'Transformation' },
  { label: 'FA', hz: 639.0, desc: 'Connection' },
  { label: 'SOL', hz: 741.0, desc: 'Expression' },
  { label: 'LA', hz: 852.0, desc: 'Intuition' },
  { label: 'SI', hz: 963.0, desc: 'Pineal activation' },
];

function BeadColumn({ index, value, onChange, multiplier, label, color }) {
  const heavenActive = Math.floor(value / HEAVEN_VALUE);
  const earthActive = value % HEAVEN_VALUE;

  const toggleHeaven = (beadIdx) => {
    const targetActive = beadIdx + 1;
    const newHeavenVal = heavenActive === targetActive ? targetActive - 1 : targetActive;
    onChange(index, newHeavenVal * HEAVEN_VALUE + earthActive);
  };

  const toggleEarth = (beadIdx) => {
    const targetActive = beadIdx + 1;
    const newEarthVal = earthActive === targetActive ? targetActive - 1 : targetActive;
    onChange(index, heavenActive * HEAVEN_VALUE + newEarthVal);
  };

  return (
    <div className="flex flex-col items-center" style={{ width: COLUMN_WIDTH }} data-testid={`suanpan-col-${index}`}>
      <p className="text-[8px] font-mono mb-2" style={{ color: 'rgba(248,250,252,0.2)' }}>{label}</p>

      {/* Heaven beads */}
      <div className="flex flex-col items-center gap-1 mb-1">
        {Array.from({ length: HEAVEN_COUNT }).map((_, i) => {
          const active = i < heavenActive;
          return (
            <motion.button key={`h-${i}`}
              className="rounded-full cursor-pointer"
              style={{
                width: BEAD_SIZE, height: BEAD_SIZE,
                background: active ? `${color}` : 'rgba(248,250,252,0.06)',
                border: `2px solid ${active ? color : 'rgba(248,250,252,0.08)'}`,
                boxShadow: active ? `0 0 12px ${color}40` : 'none',
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: active ? 8 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => toggleHeaven(i)}
              data-testid={`heaven-bead-${index}-${i}`}
            />
          );
        })}
      </div>

      {/* Divider bar */}
      <div className="w-full h-[2px] my-1" style={{ background: `${color}30` }} />

      {/* Earth beads */}
      <div className="flex flex-col items-center gap-1 mt-1">
        {Array.from({ length: EARTH_COUNT }).map((_, i) => {
          const active = i < earthActive;
          return (
            <motion.button key={`e-${i}`}
              className="rounded-full cursor-pointer"
              style={{
                width: BEAD_SIZE - 4, height: BEAD_SIZE - 4,
                background: active ? `${color}90` : 'rgba(248,250,252,0.04)',
                border: `1.5px solid ${active ? `${color}60` : 'rgba(248,250,252,0.06)'}`,
                boxShadow: active ? `0 0 8px ${color}25` : 'none',
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: active ? -6 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => toggleEarth(i)}
              data-testid={`earth-bead-${index}-${i}`}
            />
          );
        })}
      </div>

      {/* Column value */}
      <p className="text-[10px] font-mono mt-2" style={{ color: `${color}80` }}>
        {(value * multiplier).toFixed(multiplier < 1 ? 1 : 0)}
      </p>
    </div>
  );
}

export default function SuanpanMixer() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [values, setValues] = useState([5, 2, 8, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const ctxRef = useRef(null);

  const totalHz = COLUMNS.reduce((sum, col, i) => sum + values[i] * col.multiplier, 0);
  const color = totalHz > 700 ? '#C084FC' : totalHz > 400 ? '#A78BFA' : totalHz > 200 ? '#2DD4BF' : '#60A5FA';

  const handleChange = useCallback((colIdx, newVal) => {
    setValues(prev => { const next = [...prev]; next[colIdx] = Math.min(newVal, 9); return next; });
  }, []);

  const setPreset = useCallback((hz) => {
    const h = Math.floor(hz / 100);
    const t = Math.floor((hz % 100) / 10);
    const o = Math.floor(hz % 10);
    const d = Math.round((hz * 10) % 10);
    setValues([Math.min(h, 9), Math.min(t, 9), Math.min(o, 9), Math.min(d, 9)]);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.5);
        const osc = oscRef.current;
        setTimeout(() => { try { osc?.stop(); } catch {} }, 600);
      }
      oscRef.current = null;
      gainRef.current = null;
      setIsPlaying(false);
      return;
    }

    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = totalHz;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlaying(true);
    } catch {}
  }, [isPlaying, totalHz]);

  useEffect(() => {
    if (isPlaying && oscRef.current) {
      oscRef.current.frequency.linearRampToValueAtTime(totalHz, (ctxRef.current?.currentTime || 0) + 0.1);
    }
  }, [totalHz, isPlaying]);

  useEffect(() => {
    return () => { try { oscRef.current?.stop(); } catch {} };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#06060e' }} data-testid="suanpan-page">
      {/* Header */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
          style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
          data-testid="suanpan-back-btn">
          <ArrowLeft size={16} style={{ color: 'rgba(248,250,252,0.4)' }} />
        </button>
        <div>
          <h1 className="text-lg font-light tracking-[0.2em] uppercase"
            style={{ color: 'rgba(248,250,252,0.3)', fontFamily: 'Cormorant Garamond, serif' }}>
            The Suanpan
          </h1>
          <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.15)' }}>
            Ancient Abacus Frequency Mixer
          </p>
        </div>
      </div>

      {/* Frequency display */}
      <motion.div className="text-center mb-8"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <p className="text-5xl font-light font-mono" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>
          {totalHz.toFixed(1)}
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(248,250,252,0.2)' }}>Hertz</p>
      </motion.div>

      {/* Abacus frame */}
      <div className="rounded-2xl p-6" style={{
        background: 'rgba(10,10,18,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}15`,
        boxShadow: isPlaying ? `0 0 40px ${color}10` : 'none',
      }}>
        <div className="flex items-start gap-2">
          {COLUMNS.map((col, i) => (
            <BeadColumn key={i} index={i} value={values[i]}
              onChange={handleChange} multiplier={col.multiplier}
              label={col.label} color={color} />
          ))}
        </div>

        {/* Play button */}
        <div className="flex justify-center mt-6">
          <motion.button
            className="flex items-center gap-2 px-6 py-2.5 rounded-full"
            style={{
              background: isPlaying ? `${color}20` : 'rgba(248,250,252,0.04)',
              border: `1px solid ${isPlaying ? color : 'rgba(248,250,252,0.08)'}`,
              boxShadow: isPlaying ? `0 0 20px ${color}20` : 'none',
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            data-testid="suanpan-play-btn"
          >
            {isPlaying ? <VolumeX size={14} style={{ color }} /> : <Volume2 size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />}
            <span className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: isPlaying ? color : 'rgba(248,250,252,0.4)' }}>
              {isPlaying ? 'Stop' : 'Emit Frequency'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Presets */}
      <div className="mt-8">
        <p className="text-[9px] text-center font-medium tracking-[0.15em] uppercase mb-3"
          style={{ color: 'rgba(248,250,252,0.15)' }}>Solfeggio Presets</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {PRESETS.map(p => (
            <motion.button key={p.label}
              className="px-3 py-1.5 rounded-full"
              style={{
                background: Math.abs(totalHz - p.hz) < 1 ? 'rgba(192,132,252,0.12)' : 'rgba(248,250,252,0.03)',
                border: `1px solid ${Math.abs(totalHz - p.hz) < 1 ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.05)'}`,
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setPreset(p.hz)}
              data-testid={`preset-${p.label}`}
            >
              <span className="text-[9px] font-medium" style={{ color: 'rgba(248,250,252,0.4)' }}>{p.label}</span>
              <span className="text-[8px] ml-1 font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>{p.hz}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <p className="absolute bottom-6 text-[8px] tracking-wider"
        style={{ color: 'rgba(248,250,252,0.1)' }}>
        Slide heaven beads (worth 5) and earth beads (worth 1) to set frequencies
      </p>
    </div>
  );
}
