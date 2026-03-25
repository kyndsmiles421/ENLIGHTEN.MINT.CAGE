import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import NarrationPlayer from '../components/NarrationPlayer';

const PATTERNS = [
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, color: '#2DD4BF', desc: 'Equal parts breathing for calm focus' },
  { name: '4-7-8 Relaxation', inhale: 4, hold1: 7, exhale: 8, hold2: 0, color: '#D8B4FE', desc: 'Deep relaxation and sleep preparation' },
  { name: 'Energizing Breath', inhale: 6, hold1: 0, exhale: 6, hold2: 0, color: '#FCD34D', desc: 'Rhythmic breathing for vitality' },
  { name: 'Wim Hof Style', inhale: 2, hold1: 0, exhale: 2, hold2: 0, color: '#FDA4AF', desc: 'Power breathing for energy activation' },
  { name: 'Pranayama Flow', inhale: 5, hold1: 5, exhale: 5, hold2: 5, color: '#86EFAC', desc: 'Yogic breathing for prana cultivation' },
];

export default function Breathing() {
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('ready');
  const [scale, setScale] = useState(1);
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);
  const phaseRef = useRef({ phase: 'inhale', remaining: 0 });

  const totalCycle = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2;

  const stop = useCallback(() => {
    setActive(false);
    setPhase('ready');
    setScale(1);
    setTimer(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const start = useCallback(() => {
    setActive(true);
    setCycles(0);
    phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
    setPhase('Inhale');
    setTimer(pattern.inhale);

    intervalRef.current = setInterval(() => {
      phaseRef.current.remaining -= 1;
      setTimer(phaseRef.current.remaining);

      if (phaseRef.current.remaining <= 0) {
        const p = phaseRef.current.phase;
        if (p === 'inhale') {
          if (pattern.hold1 > 0) {
            phaseRef.current = { phase: 'hold1', remaining: pattern.hold1 };
            setPhase('Hold');
            setTimer(pattern.hold1);
          } else {
            phaseRef.current = { phase: 'exhale', remaining: pattern.exhale };
            setPhase('Exhale');
            setTimer(pattern.exhale);
          }
        } else if (p === 'hold1') {
          phaseRef.current = { phase: 'exhale', remaining: pattern.exhale };
          setPhase('Exhale');
          setTimer(pattern.exhale);
        } else if (p === 'exhale') {
          if (pattern.hold2 > 0) {
            phaseRef.current = { phase: 'hold2', remaining: pattern.hold2 };
            setPhase('Hold');
            setTimer(pattern.hold2);
          } else {
            phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
            setPhase('Inhale');
            setTimer(pattern.inhale);
            setCycles(c => c + 1);
          }
        } else {
          phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
          setPhase('Inhale');
          setTimer(pattern.inhale);
          setCycles(c => c + 1);
        }
      }
    }, 1000);
  }, [pattern]);

  useEffect(() => {
    if (!active) return;
    const p = phaseRef.current.phase;
    if (p === 'inhale') setScale(1.6);
    else if (p === 'exhale') setScale(1);
    else setScale(prev => prev);
  }, [phase, active]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--secondary)' }}>Breathwork</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Conscious Breathing
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Follow the rhythm. Let each breath expand your awareness.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Pattern Selector */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Choose Pattern</p>
            {PATTERNS.map((p) => (
              <button
                key={p.name}
                onClick={() => { if (!active) setPattern(p); }}
                className="glass-card w-full text-left p-4 flex items-center gap-4"
                style={{
                  borderColor: pattern.name === p.name ? `${p.color}40` : 'rgba(255,255,255,0.08)',
                  opacity: active && pattern.name !== p.name ? 0.4 : 1,
                  transition: 'opacity 0.3s, border-color 0.3s',
                }}
                data-testid={`breathing-pattern-${p.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
                </div>
              </button>
            ))}
            <div className="glass-card p-4 mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Rhythm</p>
              <div className="flex gap-3 text-center">
                {[{ l: 'In', v: pattern.inhale }, { l: 'Hold', v: pattern.hold1 }, { l: 'Out', v: pattern.exhale }, { l: 'Hold', v: pattern.hold2 }].map(s => (
                  <div key={s.l + s.v} className="flex-1">
                    <p className="text-2xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{s.v}s</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Breathing Circle */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[500px]">
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-12">
              {[0.15, 0.25, 0.4, 0.6].map((opacity, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${55 + i * 18}%`,
                    height: `${55 + i * 18}%`,
                    background: `radial-gradient(circle, ${pattern.color}${Math.round(opacity * 25).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                    border: `1px solid ${pattern.color}${Math.round(opacity * 20).toString(16).padStart(2, '0')}`,
                    transform: `scale(${scale})`,
                    transition: `transform ${phaseRef.current.phase === 'inhale' ? pattern.inhale : phaseRef.current.phase === 'exhale' ? pattern.exhale : 0.3}s ease-in-out`,
                  }}
                />
              ))}
              <div
                className="relative z-10 flex flex-col items-center justify-center"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${pattern.color}40 0%, ${pattern.color}10 70%)`,
                  boxShadow: `0 0 60px ${pattern.color}30`,
                  transform: `scale(${scale})`,
                  transition: `transform ${phaseRef.current.phase === 'inhale' ? pattern.inhale : phaseRef.current.phase === 'exhale' ? pattern.exhale : 0.3}s ease-in-out`,
                }}
              >
                <p className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                  {active ? timer : ''}
                </p>
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  {active ? phase : 'Ready'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={active ? stop : start}
                className="btn-glass px-10 py-4 text-lg"
                style={{ boxShadow: active ? `0 0 40px ${pattern.color}20` : undefined }}
                data-testid="breathing-toggle-btn"
              >
                {active ? 'Stop' : 'Begin Breathwork'}
              </button>
            </div>
            <div className="mt-6">
              <NarrationPlayer
                text={`Welcome to ${pattern.name} practice. ${pattern.desc}. When you're ready, inhale slowly through your nose for ${pattern.inhale} seconds. ${pattern.hold1 > 0 ? `Hold your breath gently for ${pattern.hold1} seconds.` : ''} Then exhale smoothly for ${pattern.exhale} seconds. ${pattern.hold2 > 0 ? `Hold empty for ${pattern.hold2} seconds.` : ''} Repeat this cycle, finding your natural rhythm. Let each breath draw you deeper into stillness. Your body knows how to breathe. Simply observe and follow.`}
                label="Guided Voice"
                color={pattern.color}
              />
            </div>
            {cycles > 0 && (
              <p className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                {cycles} cycle{cycles > 1 ? 's' : ''} completed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
