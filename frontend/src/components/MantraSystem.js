import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSensory } from '../context/SensoryContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function MantraBanner({ category = '', className = '' }) {
  const [mantra, setMantra] = useState(null);
  const [fading, setFading] = useState(false);
  const { immersion } = useSensory();

  const fetchMantra = useCallback(async () => {
    try {
      const params = category ? `?count=1&category=${category}` : '?count=1';
      const res = await axios.get(`${API}/mantras${params}`);
      const mantras = res.data.mantras || [];
      if (mantras.length > 0) {
        setFading(true);
        setTimeout(() => {
          setMantra(mantras[0]);
          setFading(false);
        }, 400);
      }
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [category]);

  useEffect(() => {
    fetchMantra();
    const interval = setInterval(fetchMantra, 20000);
    return () => clearInterval(interval);
  }, [fetchMantra]);

  if (!mantra) return null;

  const energyColors = {
    love: '#FDA4AF', power: '#EAB308', cleansing: '#2DD4BF', abundance: '#F59E0B',
    clarity: '#818CF8', peace: '#22C55E', reverence: '#C084FC', community: '#FB923C',
    trust: '#2DD4BF', worthiness: '#EAB308', compassion: '#FDA4AF', truth: '#818CF8',
    unity: '#A78BFA', devotion: '#C084FC', memory: '#818CF8', radiance: '#F59E0B',
    purpose: '#2DD4BF', adventure: '#FB923C', creation: '#C084FC', restoration: '#22C55E',
    forgiveness: '#2DD4BF', growth: '#22C55E', stability: '#94A3B8', integrity: '#818CF8',
    generosity: '#EAB308', honesty: '#22C55E', authenticity: '#C084FC',
    vibration: '#A78BFA', transcendence: '#C084FC', identity: '#818CF8',
  };
  const color = energyColors[mantra.energy] || '#C084FC';

  return (
    <div className={`text-center py-2 ${className}`} data-testid="mantra-banner">
      <AnimatePresence mode="wait">
        <motion.p
          key={mantra.text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: fading ? 0 : 1, y: fading ? -4 : 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.5 }}
          className="text-[11px] italic font-light tracking-wide"
          style={{
            color,
            opacity: immersion === 'calm' ? 0.6 : 0.8,
            fontFamily: 'Cormorant Garamond, serif',
            textShadow: immersion === 'full' ? `0 0 20px ${color}30` : 'none',
          }}
        >
          "{mantra.text}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function MantraOverlay() {
  const [mantras, setMantras] = useState([]);
  const { immersion } = useSensory();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API}/mantras?count=5`);
        setMantras(res.data.mantras || []);
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  if (immersion === 'calm' || mantras.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden" data-testid="mantra-overlay">
      {mantras.slice(0, 3).map((m, i) => (
        <motion.div
          key={`${m.text}-${i}`}
          className="absolute text-[9px] italic tracking-widest whitespace-nowrap"
          style={{
            color: 'rgba(192,132,252,0.06)',
            fontFamily: 'Cormorant Garamond, serif',
            top: `${15 + i * 30}%`,
            left: '-10%',
          }}
          animate={{
            x: ['0%', '120%'],
          }}
          transition={{
            duration: 45 + i * 15,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 5,
          }}
        >
          {m.text}
        </motion.div>
      ))}
    </div>
  );
}

export function LoadingMantra() {
  const [mantra, setMantra] = useState(null);

  useEffect(() => {
    axios.get(`${API}/mantras?count=1`)
      .then(r => {
        const m = r.data.mantras?.[0];
        if (m) setMantra(m);
      })
      .catch(() => setMantra({ text: "Breathe. You are exactly where you need to be.", energy: "peace" }));
  }, []);

  if (!mantra) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-4"
      data-testid="loading-mantra"
    >
      <p className="text-sm italic font-light" style={{
        color: 'var(--text-muted)',
        fontFamily: 'Cormorant Garamond, serif',
      }}>
        "{mantra.text}"
      </p>
    </motion.div>
  );
}
