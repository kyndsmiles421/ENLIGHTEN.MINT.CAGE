import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BookOpen, Loader2, X, Sparkles, ChevronDown } from 'lucide-react';
import NarrationPlayer from './NarrationPlayer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DeepDive({ topic, category, context, color = '#D8B4FE', label = 'Deep Dive' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);

  const fetchKnowledge = useCallback(async () => {
    if (content) { setOpen(true); return; }
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
    <>
      <button
        onClick={fetchKnowledge}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{
          background: `${color}10`,
          border: `1px solid ${color}20`,
          color: color,
          transition: 'all 0.3s',
        }}
        data-testid="deep-dive-btn"
      >
        <Sparkles size={12} />
        {label}
        <ChevronDown size={10} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl"
              style={{
                background: 'rgba(18, 20, 32, 0.98)',
                border: `1px solid ${color}20`,
                boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 40px ${color}08`,
              }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-5"
                style={{
                  background: 'rgba(18, 20, 32, 0.95)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                }}>
                <div className="flex items-center gap-3">
                  <BookOpen size={18} style={{ color }} />
                  <div>
                    <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                      {topic}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI-Powered Knowledge</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {content && !loading && (
                    <NarrationPlayer
                      text={content.substring(0, 3500)}
                      label="Listen"
                      color={color}
                      context={category || 'knowledge'}
                    />
                  )}
                  <button onClick={() => setOpen(false)} className="p-2 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                    data-testid="deep-dive-close">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 md:px-8 py-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 size={28} className="animate-spin" style={{ color }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Channeling deep knowledge...</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This may take a moment</p>
                  </div>
                ) : content ? (
                  <div className="prose-content">
                    {content.split('\n').map((para, i) => {
                      const trimmed = para.trim();
                      if (!trimmed) return <div key={i} className="h-3" />;
                      if (trimmed.startsWith('# ')) {
                        return <h2 key={i} className="text-2xl font-light mt-8 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{trimmed.replace('# ', '')}</h2>;
                      }
                      if (trimmed.startsWith('## ')) {
                        return <h3 key={i} className="text-xl font-light mt-6 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color }}>{trimmed.replace('## ', '')}</h3>;
                      }
                      if (trimmed.startsWith('### ')) {
                        return <h4 key={i} className="text-base font-medium mt-5 mb-2" style={{ color: 'var(--text-primary)' }}>{trimmed.replace('### ', '')}</h4>;
                      }
                      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                        return <p key={i} className="text-sm font-semibold mt-4 mb-2" style={{ color }}>{trimmed.replace(/\*\*/g, '')}</p>;
                      }
                      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                        return (
                          <div key={i} className="flex gap-3 ml-2 mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: color, opacity: 0.5 }} />
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{trimmed.replace(/^[-•] /, '')}</p>
                          </div>
                        );
                      }
                      if (/^\d+[\.\)] /.test(trimmed)) {
                        const num = trimmed.match(/^(\d+)[\.\)] /)[1];
                        const text = trimmed.replace(/^\d+[\.\)] /, '');
                        return (
                          <div key={i} className="flex gap-3 mb-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                              style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                              {num}
                            </span>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</p>
                          </div>
                        );
                      }
                      return <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{trimmed}</p>;
                    })}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
