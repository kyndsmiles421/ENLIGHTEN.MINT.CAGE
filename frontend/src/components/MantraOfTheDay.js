import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Quote, RefreshCw } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MantraOfTheDay() {
  const [mantra, setMantra] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const fetchMantra = async () => {
    try {
      // Use a seed based on today's date for consistency
      const res = await axios.get(`${API}/mantras?count=1`);
      const m = res.data.mantras?.[0];
      if (m) setMantra(m);
    } catch {}
    setLoaded(true);
  };

  useEffect(() => {
    // Check localStorage for today's cached mantra
    const today = new Date().toISOString().slice(0, 10);
    const cached = localStorage.getItem('cosmic_mantra_of_day');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === today) {
          setMantra(parsed.mantra);
          setLoaded(true);
          return;
        }
      } catch {}
    }
    fetchMantra();
  }, []);

  // Cache on load
  useEffect(() => {
    if (mantra && loaded) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('cosmic_mantra_of_day', JSON.stringify({ date: today, mantra }));
    }
  }, [mantra, loaded]);

  const refresh = () => {
    localStorage.removeItem('cosmic_mantra_of_day');
    fetchMantra();
  };

  if (!mantra) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl p-4 relative overflow-hidden group"
      style={{
        background: 'rgba(139,92,246,0.03)',
        border: '1px solid rgba(139,92,246,0.08)',
      }}
      data-testid="mantra-of-the-day"
    >
      {/* Subtle animated glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.04), transparent 70%)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Quote size={11} style={{ color: '#8B5CF6' }} />
            <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: '#8B5CF6' }}>
              Mantra of the Day
            </span>
          </div>
          <button onClick={refresh}
            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            data-testid="refresh-mantra-btn">
            <RefreshCw size={10} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <p className="text-sm leading-relaxed italic"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif' }}>
          "{mantra.text}"
        </p>
        {mantra.category && (
          <p className="text-[8px] mt-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {mantra.energy} &middot; {mantra.category}
          </p>
        )}
      </div>
    </motion.div>
  );
}
