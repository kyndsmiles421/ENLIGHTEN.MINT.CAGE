import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
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

  const hidden = !user || HIDDEN_ROUTES.includes(location.pathname);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    nodesRef.current = [];
    if (masterRef.current) { try { masterRef.current.disconnect(); } catch {} masterRef.current = null; }
    if (ctxRef.current && ctxRef.current.state !== 'closed') { try { ctxRef.current.close(); } catch {} }
    ctxRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (active) {
      setFading(true);
      try {
        if (masterRef.current && ctxRef.current) {
          masterRef.current.gain.linearRampToValueAtTime(0.001, ctxRef.current.currentTime + 1.2);
        }
      } catch {}
      setTimeout(() => { stopAll(); setActive(false); setFading(false); }, 1400);
      setBpm(0);
      toast('Meditation ended', { style: { background: 'rgba(10,10,18,0.92)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,250,252,0.6)' } });
      return;
    }

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.connect(ctx.destination);
      masterRef.current = master;
      master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1.5);

      // 528 Hz — Transformation
      const osc528 = ctx.createOscillator();
      osc528.type = 'sine'; osc528.frequency.value = 528;
      const g528 = ctx.createGain(); g528.gain.value = 0.18;
      osc528.connect(g528); g528.connect(master); osc528.start();

      // 174 Hz — Foundation
      const osc174 = ctx.createOscillator();
      osc174.type = 'sine'; osc174.frequency.value = 174;
      const g174 = ctx.createGain(); g174.gain.value = 0.12;
      osc174.connect(g174); g174.connect(master); osc174.start();

      // Ocean Waves (filtered noise + LFO)
      const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf; noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 320;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain); lfoGain.connect(lp.frequency);
      const oceanGain = ctx.createGain(); oceanGain.gain.value = 0.4;
      noise.connect(lp); lp.connect(oceanGain); oceanGain.connect(master);
      lfo.start(); noise.start();

      nodesRef.current = [osc528, osc174, noise, lfo];
      setBpm(60);
      setActive(true);

      toast('Deep Zen activated', {
        description: '528Hz + 174Hz + Ocean Waves · 60 BPM',
        style: {
          background: 'linear-gradient(135deg, rgba(10,10,18,0.95), rgba(20,40,20,0.95))',
          border: '1px solid rgba(34,197,94,0.3)',
          color: '#4ADE80',
          boxShadow: '0 0 20px rgba(34,197,94,0.1)',
        },
      });
    } catch (err) {
      console.error('QuickMeditate audio error:', err);
      toast.error('Could not start audio. Tap again to retry.');
    }
  }, [active, stopAll, setBpm]);

  useEffect(() => () => stopAll(), [stopAll]);

  if (hidden) return null;

  return createPortal(
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={toggle}
        className="fixed flex items-center justify-center"
        style={{
          bottom: 80,
          left: 16,
          width: 48,
          height: 48,
          zIndex: 9999,
          borderRadius: '50%',
          background: active
            ? 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, rgba(10,10,18,0.95) 70%)'
            : 'rgba(10,10,18,0.9)',
          border: `1.5px solid ${active ? 'rgba(34,197,94,0.5)' : 'rgba(192,132,252,0.2)'}`,
          backdropFilter: 'blur(20px)',
          boxShadow: active
            ? '0 0 24px rgba(34,197,94,0.25), 0 0 48px rgba(34,197,94,0.08)'
            : '0 4px 16px rgba(0,0,0,0.5)',
          cursor: 'pointer',
        }}
        data-testid="quick-meditate-fab"
        aria-label={active ? 'Stop meditation' : 'Quick Meditate'}
      >
        {active && !fading && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ border: '1.5px solid rgba(34,197,94,0.4)' }}
          />
        )}

        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{
            width: 22, height: 22,
            stroke: active ? '#4ADE80' : '#C084FC',
            filter: active ? 'drop-shadow(0 0 8px rgba(34,197,94,0.6))' : 'none',
            transition: 'stroke 0.3s, filter 0.3s',
          }}>
          <path d="M12 21c0 0-3-3-3-7.5S12 3 12 3s3 6 3 10.5S12 21 12 21z" />
          <path d="M12 21c0 0-6-2-7.5-6.5S6 3 6 3" opacity="0.5" />
          <path d="M12 21c0 0 6-2 7.5-6.5S18 3 18 3" opacity="0.5" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {!active && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: [0, 1, 1, 0], x: [-10, 0, 0, 5] }}
            transition={{ duration: 4, times: [0, 0.1, 0.85, 1], delay: 1.5 }}
            className="fixed pointer-events-none"
            style={{ bottom: 88, left: 72, whiteSpace: 'nowrap', zIndex: 9999 }}
          >
            <div className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
              style={{
                background: 'rgba(10,10,18,0.95)',
                border: '1px solid rgba(192,132,252,0.2)',
                color: '#C084FC',
                backdropFilter: 'blur(12px)',
              }}>
              Quick Meditate
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
