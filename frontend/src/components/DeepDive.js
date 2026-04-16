/**
 * DeepDive.js — ZERO-STACK In-Place Knowledge Expansion
 * 
 * NO modals. NO overlays. NO z-index stacking. NO fixed positioning.
 * Content expands IN-PLACE within the page flow, pushing other content down.
 * The background remains the interface at all times.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import NarrationPlayer from './NarrationPlayer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DeepDive({ topic, category, context, color = '#D8B4FE', label = 'Deep Dive' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);

  const fetchKnowledge = useCallback(async () => {
    if (content) { setOpen(prev => !prev); return; }
    setOpen(true);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/knowledge/deep-dive`, { topic, category, context }, { timeout: 90000 });
      setContent(res.data.content);
    } catch {
      setContent('Unable to generate content at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [topic, category, context, content]);

  return (
    <div data-testid="deep-dive-container">
      <button
        onClick={fetchKnowledge}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{
          background: `${color}10`,
          border: `1px solid ${color}20`,
          color: color,
        }}
        data-testid="deep-dive-btn"
      >
        <Sparkles size={12} />
        {label}
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {/* IN-PLACE expansion — pushes content down, no overlay */}
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
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Channeling deep knowledge...</p>
                </div>
              ) : content ? (
                <div>
                  {/* Narration */}
                  <div className="mb-4">
                    <NarrationPlayer
                      text={content.substring(0, 3500)}
                      label="Listen"
                      color={color}
                      context={category || 'knowledge'}
                    />
                  </div>

                  {/* Content rendered in-place */}
                  <div className="space-y-2">
                    {content.split('\n').map((para, i) => {
                      const trimmed = para.trim();
                      if (!trimmed) return <div key={i} className="h-2" />;
                      if (trimmed.startsWith('# ')) {
                        return <h2 key={i} className="text-xl font-light mt-6 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'rgba(248,250,252,0.9)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{trimmed.replace('# ', '')}</h2>;
                      }
                      if (trimmed.startsWith('## ')) {
                        return <h3 key={i} className="text-lg font-light mt-4 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{trimmed.replace('## ', '')}</h3>;
                      }
                      if (trimmed.startsWith('### ')) {
                        return <h4 key={i} className="text-base font-medium mt-3 mb-1" style={{ color: 'rgba(248,250,252,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{trimmed.replace('### ', '')}</h4>;
                      }
                      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                        return <p key={i} className="text-sm font-semibold mt-3 mb-1" style={{ color, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{trimmed.replace(/\*\*/g, '')}</p>;
                      }
                      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                        return (
                          <div key={i} className="flex gap-3 ml-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: color, opacity: 0.5 }} />
                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{trimmed.replace(/^[-•] /, '')}</p>
                          </div>
                        );
                      }
                      if (/^\d+[\.\)] /.test(trimmed)) {
                        const num = trimmed.match(/^(\d+)[\.\)] /)[1];
                        const text = trimmed.replace(/^\d+[\.\)] /, '');
                        return (
                          <div key={i} className="flex gap-3 mb-1.5">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                              style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                              {num}
                            </span>
                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{text}</p>
                          </div>
                        );
                      }
                      return <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{trimmed}</p>;
                    })}
                  </div>

                  {/* Collapse button */}
                  <button onClick={() => setOpen(false)}
                    className="mt-4 flex items-center gap-1.5 text-xs"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
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
