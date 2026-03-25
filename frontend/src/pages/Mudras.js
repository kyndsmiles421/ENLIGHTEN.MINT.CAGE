import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Hand, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function MudraHand({ mudra }) {
  return (
    <div className="w-20 h-20 rounded-full flex items-center justify-center"
      style={{ background: `${mudra.color}15`, border: `1px solid ${mudra.color}25` }}>
      <Hand size={32} style={{ color: mudra.color }} />
    </div>
  );
}

export default function Mudras() {
  const [mudras, setMudras] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/mudras`)
      .then(r => setMudras(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#D8B4FE' }}>
            <Hand size={14} className="inline mr-2" /> Sacred Hand Gestures
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Mudras
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Ancient hand gestures that channel cosmic energy through your body, balancing the five elements within.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <p style={{ color: 'var(--text-muted)' }}>Loading sacred gestures...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mudras.map((mudra, i) => (
              <motion.div key={mudra.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <div className="glass-card p-6 h-full flex flex-col" data-testid={`mudra-${mudra.id}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <MudraHand mudra={mudra} />
                    <div className="flex-1">
                      <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                        {mudra.name}
                      </h3>
                      <p className="text-xs" style={{ color: mudra.color }}>{mudra.sanskrit}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${mudra.color}15`, color: mudra.color }}>
                          {mudra.chakra} Chakra
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={10} /> {mudra.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {mudra.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mudra.benefits.map(b => (
                      <span key={b} className="text-xs px-2 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {b}
                      </span>
                    ))}
                  </div>

                  <button onClick={() => setExpanded(expanded === mudra.id ? null : mudra.id)}
                    className="flex items-center gap-2 text-xs w-full justify-center py-2 rounded-lg"
                    style={{ background: expanded === mudra.id ? `${mudra.color}10` : 'transparent', color: mudra.color, border: `1px solid ${mudra.color}20` }}
                    data-testid={`mudra-practice-${mudra.id}`}>
                    <Sparkles size={12} />
                    {expanded === mudra.id ? 'Hide Practice' : 'How to Practice'}
                    {expanded === mudra.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <AnimatePresence>
                    {expanded === mudra.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>Practice Instructions</p>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {mudra.practice}
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>Element: {mudra.element}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
