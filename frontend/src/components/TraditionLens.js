/**
 * TraditionLens.js — System-Wide Cultural Perspective Selector
 * 
 * Every page gets a "Lens" button. When selected:
 * - The OmniBridge AI generates insights through that tradition's voice
 * - The UI accent shifts subtly to reflect the tradition
 * - "Omni" mode shows the genuine thread between all 10
 * 
 * Plugs into any module via: <TraditionLens module="crystals" topic="Amethyst" />
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Loader2, Compass } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const TRADITION_COLORS = {
  lakota: '#EF4444',
  kemetic: '#FBBF24',
  vedic: '#F97316',
  yoruba: '#22C55E',
  mayan: '#06B6D4',
  aboriginal: '#92400E',
  celtic: '#10B981',
  kabbalistic: '#8B5CF6',
  taoist: '#6B7280',
  sufi: '#EC4899',
  omni: '#D946EF',
};

const TRADITION_LABELS = {
  lakota: 'Lakota',
  kemetic: 'Kemetic',
  vedic: 'Vedic',
  yoruba: 'Yoruba',
  mayan: 'Mayan',
  aboriginal: 'Aboriginal',
  celtic: 'Celtic',
  kabbalistic: 'Kabbalistic',
  taoist: 'Taoist',
  sufi: 'Sufi',
  omni: 'Omni (All Traditions)',
};

export default function TraditionLens({ module = 'general', topic = '', context = '' }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLensInsight = useCallback(async (traditionId) => {
    if (!topic) return;
    setLoading(true);
    setInsight(null);

    try {
      if (traditionId === 'omni') {
        // Use the standard omni-bridge insight (all traditions)
        const res = await fetch(`${API}/api/omni-bridge/insight`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module, topic, context }),
        });
        if (res.ok) setInsight(await res.json());
      } else {
        // Use cross-tradition with a single tradition for focused lens
        const res = await fetch(`${API}/api/omni-bridge/cross-tradition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traditions: [traditionId], topic, module }),
        });
        if (res.ok) setInsight(await res.json());
      }
    } catch {}
    setLoading(false);
  }, [module, topic, context]);

  const selectTradition = (tid) => {
    setSelected(tid);
    setOpen(false);
    fetchLensInsight(tid);
  };

  const color = selected ? TRADITION_COLORS[selected] || '#D946EF' : '#D946EF';

  return (
    <div className="relative inline-block" data-testid="tradition-lens">
      {/* Lens toggle */}
      <button
        onClick={() => topic && setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px]"
        style={{
          background: selected ? `${color}10` : 'rgba(255,255,255,0.02)',
          border: `1px solid ${selected ? `${color}25` : 'rgba(255,255,255,0.06)'}`,
          color: selected ? color : 'rgba(255,255,255,0.4)',
          opacity: topic ? 1 : 0.3,
        }}
        data-testid="tradition-lens-btn"
      >
        <Globe size={10} />
        {selected ? TRADITION_LABELS[selected] : 'Cultural Lens'}
        <ChevronDown size={8} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 mt-1 rounded-xl py-1 min-w-48"
            style={{
              background: 'rgba(10,10,18,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              zIndex: 50,
            }}
            data-testid="tradition-lens-dropdown"
          >
            {Object.entries(TRADITION_LABELS).map(([tid, label]) => (
              <button
                key={tid}
                onClick={() => selectTradition(tid)}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-[9px]"
                style={{
                  color: selected === tid ? TRADITION_COLORS[tid] : 'rgba(255,255,255,0.5)',
                  background: selected === tid ? `${TRADITION_COLORS[tid]}08` : 'transparent',
                }}
                data-testid={`lens-${tid}`}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: TRADITION_COLORS[tid] }} />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight display */}
      <AnimatePresence>
        {(loading || insight) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 rounded-xl p-3 overflow-hidden"
            style={{ background: `${color}04`, border: `1px solid ${color}10` }}
            data-testid="tradition-lens-insight"
          >
            {loading ? (
              <div className="flex items-center gap-2 py-2 justify-center">
                <Loader2 size={12} className="animate-spin" style={{ color }} />
                <span className="text-[9px]" style={{ color: `${color}80` }}>
                  Channeling {TRADITION_LABELS[selected]}...
                </span>
              </div>
            ) : insight ? (
              <>
                <div className="flex items-center gap-1.5 mb-2">
                  <Compass size={10} style={{ color }} />
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color }}>
                    {selected === 'omni' ? 'Unified Thread' : `${TRADITION_LABELS[selected]} Perspective`}
                  </span>
                </div>
                <div className="text-[10px] leading-relaxed whitespace-pre-line"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  data-testid="lens-insight-text">
                  {insight.insight}
                </div>
                {insight.genuine_thread && (
                  <p className="text-[8px] mt-2 italic" style={{ color: `${color}60` }}>
                    Thread: {insight.genuine_thread}
                  </p>
                )}
                <button onClick={() => fetchLensInsight(selected)}
                  className="text-[8px] mt-2 flex items-center gap-1"
                  style={{ color: `${color}50` }}>
                  <Globe size={8} /> Different perspective
                </button>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
