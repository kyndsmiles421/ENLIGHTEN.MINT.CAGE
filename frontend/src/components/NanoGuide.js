import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function NanoGuide({ guideId, position = 'top-right' }) {
  const [open, setOpen] = useState(false);
  const [tips, setTips] = useState(null);
  const navigate = useNavigate();

  const loadTips = useCallback(async () => {
    if (tips) { setOpen(true); return; }
    try {
      const res = await axios.get(`${API}/codex/nano-guide/${guideId}`);
      setTips(res.data);
      setOpen(true);
    } catch {
      setTips({ title: guideId, tips: ['Explore the Sovereign Codex'] });
      setOpen(true);
    }
  }, [guideId, tips]);

  const posStyles = {
    'top-right': { top: '100%', right: 0, marginTop: 8 },
    'top-left': { top: '100%', left: 0, marginTop: 8 },
    'bottom-right': { bottom: '100%', right: 0, marginBottom: 8 },
  };

  return (
    <div className="relative inline-flex">
      <button onClick={loadTips}
        className="p-1 rounded-full transition-all hover:scale-110"
        style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}
        data-testid={`nano-guide-${guideId}`}>
        <HelpCircle size={12} style={{ color: '#C084FC' }} />
      </button>

      <AnimatePresence>
        {open && tips && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-[100] w-64 rounded-xl overflow-hidden"
            style={{ ...posStyles[position], background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(192,132,252,0.15)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
            data-testid={`nano-guide-panel-${guideId}`}>
            <div className="px-3 py-2 flex items-center justify-between"
              style={{ background: 'rgba(192,132,252,0.06)', borderBottom: '1px solid rgba(192,132,252,0.1)' }}>
              <span className="text-[9px] font-medium uppercase tracking-[0.15em]" style={{ color: '#C084FC' }}>
                {tips.title}
              </span>
              <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-white/5">
                <X size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />
              </button>
            </div>
            <div className="p-3 space-y-2">
              {tips.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[8px] font-mono mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(192,132,252,0.12)', color: '#C084FC' }}>
                    {i + 1}
                  </span>
                  <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>{tip}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { setOpen(false); navigate('/codex'); }}
              className="w-full px-3 py-2 flex items-center justify-center gap-1 text-[8px] font-medium uppercase tracking-wider"
              style={{ background: 'rgba(192,132,252,0.06)', color: '#C084FC', borderTop: '1px solid rgba(192,132,252,0.08)' }}
              data-testid="nano-guide-to-codex">
              <BookOpen size={9} /> Open Master Codex <ChevronRight size={8} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
