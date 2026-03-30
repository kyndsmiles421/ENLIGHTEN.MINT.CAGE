import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTempo } from '../context/TempoContext';

const HIDDEN_ROUTES = ['/cosmic-mixer', '/auth', '/'];

export default function QuickMeditateFAB() {
  const { user } = useAuth();
  const location = useLocation();
  const { setBpm } = useTempo();
  const [active, setActive] = useState(false);
  const [fading, setFading] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const masterRef = useRef(null);
  const heartbeatRef = useRef(null);

  const hidden = !user || HIDDEN_ROUTES.includes(location.pathname);

  const createOcean = useCallback((ctx, dest) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 300;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lg = ctx.createGain();
    lg.gain.value = 180;
    lfo.connect(lg); lg.connect(lp.frequency);
    src.connect(lp); lp.connect(dest); lfo.start(); src.start();
    return [src, lfo];
  }, []);

  const createTone = useCallback((ctx, dest, hz) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = hz;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    osc.connect(g); g.connect(dest); osc.start();
    return [osc];
  }, []);

  const startHeartbeat = useCallback(() => {
    if (!('vibrate' in navigator)) return;
    heartbeatRef.current = setInterval(() => {
      navigator.vibrate?.([60, 200, 40]);
    }, 1000);
  }, []);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    nodesRef.current = [];
    if (masterRef.current) { try { masterRef.current.disconnect(); } catch {} masterRef.current = null; }
    if (ctxRef.current?.state !== 'closed') { try { ctxRef.current?.close(); } catch {} }
    ctxRef.current = null;
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    navigator.vibrate?.(0);
  }, []);

  const toggle = useCallback(() => {
    if (active) {
      setFading(true);
      if (masterRef.current) {
        const ctx = ctxRef.current;
        if (ctx) masterRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      }
      setTimeout(() => { stopAll(); setActive(false); setFading(false); }, 1600);
      setBpm(0);
      return;
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2);

    const freqGain = ctx.createGain(); freqGain.gain.value = 0.5;
    freqGain.connect(master);
    const oceanGain = ctx.createGain(); oceanGain.gain.value = 0.35;
    oceanGain.connect(master);

    const nodes = [
      ...createTone(ctx, freqGain, 528),
      ...createTone(ctx, freqGain, 174),
      ...createOcean(ctx, oceanGain),
    ];
    nodesRef.current = nodes;

    setBpm(60);
    startHeartbeat();
    setActive(true);
  }, [active, stopAll, createTone, createOcean, setBpm, startHeartbeat]);

  useEffect(() => () => stopAll(), [stopAll]);

  if (hidden) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={toggle}
        className="fixed z-40 flex items-center justify-center"
        style={{
          bottom: 90,
          right: 16,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: active
            ? 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(10,10,18,0.92) 70%)'
            : 'rgba(10,10,18,0.88)',
          border: `1.5px solid ${active ? 'rgba(34,197,94,0.4)' : 'rgba(192,132,252,0.15)'}`,
          backdropFilter: 'blur(20px)',
          boxShadow: active
            ? '0 0 30px rgba(34,197,94,0.2), 0 0 60px rgba(34,197,94,0.08)'
            : '0 4px 20px rgba(0,0,0,0.4)',
          cursor: 'pointer',
        }}
        data-testid="quick-meditate-fab"
        aria-label={active ? 'Stop meditation' : 'Quick Meditate'}
      >
        {/* Outer pulse ring when active */}
        {active && !fading && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ border: '1px solid rgba(34,197,94,0.3)' }}
          />
        )}
        {active && !fading && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ border: '1px solid rgba(34,197,94,0.2)' }}
          />
        )}

        {/* Lotus SVG icon */}
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{
            width: 22, height: 22,
            color: active ? '#4ADE80' : '#C084FC',
            filter: active ? 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' : 'none',
            transition: 'color 0.3s, filter 0.3s',
          }}
        >
          {/* Lotus petals */}
          <path d="M12 21c0 0-3-3-3-7.5S12 3 12 3s3 6 3 10.5S12 21 12 21z" />
          <path d="M12 21c0 0-6-2-7.5-6.5S6 3 6 3" opacity="0.6" />
          <path d="M12 21c0 0 6-2 7.5-6.5S18 3 18 3" opacity="0.6" />
        </svg>

        {/* Fading indicator */}
        {fading && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1.5 }}
            style={{ background: 'rgba(34,197,94,0.15)' }}
          />
        )}
      </motion.button>

      {/* Tooltip on first load */}
      {!active && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: [0, 1, 1, 0], x: [10, 0, 0, -5] }}
          transition={{ duration: 4, times: [0, 0.1, 0.85, 1], delay: 2 }}
          className="fixed z-39 pointer-events-none"
          style={{ bottom: 100, right: 74, whiteSpace: 'nowrap' }}
        >
          <div className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
            style={{
              background: 'rgba(10,10,18,0.92)',
              border: '1px solid rgba(192,132,252,0.15)',
              color: '#C084FC',
              backdropFilter: 'blur(12px)',
            }}>
            Quick Meditate
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
