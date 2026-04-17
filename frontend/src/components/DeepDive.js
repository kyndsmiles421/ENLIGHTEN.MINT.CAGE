/**
 * DeepDive.js — V56.2 ADAPTIVE AI Knowledge Engine
 * 
 * Every tap generates FRESH content. The backend tracks user history
 * and rotates perspectives (practical → cultural → scientific → narrative).
 * "Go Deeper" button always available after first read.
 * Content includes Listen (TTS) and renders markdown in-place.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Sparkles, Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import NarrationPlayer from './NarrationPlayer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DeepDive({ topic, category, context, color = '#D8B4FE', label = 'Explore deeper' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [visitNum, setVisitNum] = useState(0);

  const fetchKnowledge = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && content && !open) {
      setOpen(true);
      return;
    }
    setOpen(true);
    setLoading(true);
    try {
      const ctxStr = forceRefresh ? `${context || ''} fresh` : (context || '');
      const res = await axios.post(`${API}/knowledge/deep-dive`, {
        topic, category, context: ctxStr,
      }, { timeout: 90000 });
      setContent(res.data.content);
      setVisitNum(res.data.visit_number || visitNum + 1);
      if (typeof window.__workAccrue === 'function') window.__workAccrue(category || 'exploration', 12);
    } catch {
      setContent('The knowledge stream is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [topic, category, context, content, open, visitNum]);

  const renderContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((para, i) => {
      const t = para.trim();
      if (!t) return <div key={i} className="h-2" />;
      if (t.startsWith('# ')) return <h2 key={i} className="text-lg font-light mt-5 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'rgba(248,250,252,0.9)' }}>{t.replace('# ', '')}</h2>;
      if (t.startsWith('## ')) return <h3 key={i} className="text-base font-light mt-4 mb-1.5" style={{ fontFamily: 'Cormorant Garamond, serif', color }}>{t.replace('## ', '')}</h3>;
      if (t.startsWith('### ')) return <h4 key={i} className="text-sm font-medium mt-3 mb-1" style={{ color: 'rgba(248,250,252,0.85)' }}>{t.replace('### ', '')}</h4>;
      if (t.startsWith('**') && t.endsWith('**')) return <p key={i} className="text-sm font-semibold mt-3 mb-1" style={{ color }}>{t.replace(/\*\*/g, '')}</p>;
      if (t.startsWith('- ') || t.startsWith('• ')) return (
        <div key={i} className="flex gap-2.5 ml-1 mb-1">
          <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: color, opacity: 0.5 }} />
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{t.replace(/^[-•] /, '')}</p>
        </div>
      );
      if (/^\d+[\.\)] /.test(t)) {
        const num = t.match(/^(\d+)[\.\)] /)[1];
        const txt = t.replace(/^\d+[\.\)] /, '');
        return (
          <div key={i} className="flex gap-2.5 mb-1.5">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5"
              style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>{num}</span>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{txt}</p>
          </div>
        );
      }
      return <p key={i} className="text-sm leading-relaxed mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>{t}</p>;
    });
  };

  return (
    <div data-testid="deep-dive-container">
      <button
        onClick={() => fetchKnowledge(false)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{ background: `${color}10`, border: `1px solid ${color}20`, color }}
        data-testid="deep-dive-btn"
      >
        <Sparkles size={12} />
        {label}
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2">
              {loading ? (
                <div className="flex items-center gap-3 py-8">
                  <Loader2 size={18} className="animate-spin" style={{ color }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Channeling wisdom...</p>
                </div>
              ) : content ? (
                <div>
                  {/* Listen + Refresh */}
                  <div className="flex items-center gap-2 mb-4">
                    <NarrationPlayer text={content.substring(0, 3500)} label="Listen" color={color} context={category || 'knowledge'} />
                    <button
                      onClick={() => fetchKnowledge(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs"
                      style={{ background: `${color}08`, border: `1px solid ${color}15`, color: `${color}90` }}
                      data-testid="deep-dive-refresh"
                    >
                      <RefreshCw size={10} />
                      Go Deeper
                    </button>
                    {visitNum > 1 && (
                      <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Visit #{visitNum}
                      </span>
                    )}
                  </div>

                  {renderContent(content)}

                  <button onClick={() => setOpen(false)}
                    className="mt-4 flex items-center gap-1.5 text-xs"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    data-testid="deep-dive-collapse">
                    <ChevronUp size={10} /> Collapse
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
