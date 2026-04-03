import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Sparkles, ChevronRight, Lightbulb, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModality } from '../context/ModalityContext';

const API = process.env.REACT_APP_BACKEND_URL;

const ADVANCEMENT_COLORS = { 1: '#6B7280', 2: '#818CF8', 3: '#22C55E', 4: '#FBBF24' };
const ADVANCEMENT_NAMES = { 1: 'Observer', 2: 'Practitioner', 3: 'Professional', 4: 'Sovereign' };

/**
 * LearningToggle — Floating toggle button + expandable micro-lesson panel
 * Shows on all pages when user is authenticated.
 * Toggle ON = Active Education Mode with "Why" tooltips and AI Co-Pilot.
 * Toggle OFF = Clean Professional Utility Mode.
 */
export default function LearningToggle() {
  const { token, authHeaders } = useAuth();
  const { learningToggle, setLearningToggle } = useModality();
  const [expanded, setExpanded] = useState(false);
  const [toggleStatus, setToggleStatus] = useState(null);
  const [microLesson, setMicroLesson] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [contextInput, setContextInput] = useState('');

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/copilot/toggle-status`, { headers: authHeaders });
      const data = await res.json();
      setToggleStatus(data);
    } catch {}
  }, [token, authHeaders]);

  const handleToggle = async () => {
    const newVal = !learningToggle;
    setLearningToggle(newVal);
    if (newVal && !toggleStatus) fetchStatus();
  };

  const handleExpand = () => {
    setExpanded(e => !e);
    if (!toggleStatus) fetchStatus();
  };

  const requestMicroLesson = async (context) => {
    if (!token) return;
    setLoadingLesson(true);
    try {
      const res = await fetch(`${API}/api/copilot/micro-lesson`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: context || 'general',
          struggle_point: contextInput,
          current_action: window.location.pathname,
        }),
      });
      const data = await res.json();
      setMicroLesson(data);
    } catch {}
    setLoadingLesson(false);
  };

  if (!token) return null;

  const advLevel = toggleStatus?.advancement?.level || 1;
  const advColor = ADVANCEMENT_COLORS[advLevel];
  const advName = ADVANCEMENT_NAMES[advLevel];

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={handleExpand}
        className="fixed z-40 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg"
        style={{
          bottom: 90,
          right: 16,
          background: learningToggle ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${learningToggle ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
        }}
        whileTap={{ scale: 0.95 }}
        data-testid="learning-toggle-btn"
      >
        <BookOpen size={13} style={{ color: learningToggle ? '#22C55E' : 'rgba(248,250,252,0.3)' }} />
        <span className="text-[9px] font-medium" style={{
          color: learningToggle ? '#22C55E' : 'rgba(248,250,252,0.35)',
        }}>
          {learningToggle ? 'Learning ON' : 'Learn'}
        </span>
        {learningToggle && (
          <div className="w-1.5 h-1.5 rounded-full" style={{
            background: '#22C55E',
            boxShadow: '0 0 4px rgba(34,197,94,0.5)',
          }} />
        )}
      </motion.button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed z-50 rounded-2xl overflow-hidden"
            style={{
              bottom: 130,
              right: 16,
              width: 300,
              maxHeight: 420,
              background: '#0D0E18',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            data-testid="learning-toggle-panel"
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div className="flex items-center gap-2">
                <BookOpen size={14} style={{ color: learningToggle ? '#22C55E' : 'rgba(248,250,252,0.3)' }} />
                <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Learning Toggle</span>
              </div>
              <button onClick={() => setExpanded(false)} className="p-1 rounded-lg" style={{
                cursor: 'pointer', background: 'rgba(255,255,255,0.03)',
              }}>
                <X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />
              </button>
            </div>

            <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: 360 }}>
              {/* Toggle Switch */}
              <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl" style={{
                background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
              }}>
                <div>
                  <div className="text-[10px] font-medium" style={{ color: '#F8FAFC' }}>
                    {learningToggle ? 'Active Education Mode' : 'Professional Utility Mode'}
                  </div>
                  <div className="text-[8px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                    {learningToggle ? '"Why" tooltips + AI Co-Pilot active' : 'Clean dashboard, no overlays'}
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  className="w-10 h-5 rounded-full relative transition-all"
                  style={{
                    background: learningToggle ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                  data-testid="learning-toggle-switch"
                >
                  <motion.div
                    className="absolute top-0.5 w-4 h-4 rounded-full"
                    animate={{ left: learningToggle ? 22 : 2 }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{
                      background: learningToggle ? '#22C55E' : 'rgba(248,250,252,0.3)',
                    }}
                  />
                </button>
              </div>

              {/* Advancement Level */}
              {toggleStatus && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{
                  background: `${advColor}06`, border: `1px solid ${advColor}12`,
                }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{
                    background: `${advColor}10`,
                  }}>
                    <span className="text-[9px] font-bold" style={{ color: advColor }}>{advLevel}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[9px] font-semibold" style={{ color: advColor }}>{advName}</div>
                    <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
                      {toggleStatus.advancement.modules_completed} modules completed
                      {toggleStatus.advancement.next_level_at && (
                        <> | {toggleStatus.advancement.next_level_at - toggleStatus.advancement.modules_completed} to next level</>
                      )}
                    </div>
                  </div>
                  {toggleStatus.advancement.next_level_at && (
                    <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(toggleStatus.advancement.modules_completed / toggleStatus.advancement.next_level_at) * 100}%`,
                        background: advColor,
                      }} />
                    </div>
                  )}
                </div>
              )}

              {/* AI Co-Pilot Section (only when toggle is ON) */}
              {learningToggle && (
                <div className="mb-3">
                  <div className="text-[8px] uppercase tracking-[2px] mb-2" style={{ color: 'rgba(248,250,252,0.18)' }}>
                    AI Co-Pilot
                  </div>

                  {/* Quick Context Buttons */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {['trade', 'hexagram', 'wallet', 'forge', 'sentinel'].map(ctx => (
                      <button
                        key={ctx}
                        onClick={() => requestMicroLesson(ctx)}
                        disabled={loadingLesson}
                        className="text-[7px] px-2 py-1 rounded-md capitalize transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          color: 'rgba(248,250,252,0.35)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          cursor: loadingLesson ? 'wait' : 'pointer',
                        }}
                        data-testid={`copilot-ctx-${ctx}`}
                      >
                        {ctx}
                      </button>
                    ))}
                  </div>

                  {/* Custom Question */}
                  <div className="flex gap-1 mb-2">
                    <input
                      type="text"
                      value={contextInput}
                      onChange={e => setContextInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && requestMicroLesson('general')}
                      placeholder="What are you struggling with?"
                      className="flex-1 text-[9px] px-2.5 py-1.5 rounded-lg outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        color: '#F8FAFC',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                      data-testid="copilot-input"
                    />
                    <button
                      onClick={() => requestMicroLesson('general')}
                      disabled={loadingLesson}
                      className="px-2 py-1.5 rounded-lg"
                      style={{
                        background: 'rgba(34,197,94,0.08)',
                        color: '#22C55E',
                        border: '1px solid rgba(34,197,94,0.12)',
                        cursor: loadingLesson ? 'wait' : 'pointer',
                      }}
                      data-testid="copilot-ask-btn"
                    >
                      {loadingLesson ? <Loader2 size={10} className="animate-spin" /> : <ArrowRight size={10} />}
                    </button>
                  </div>

                  {/* Micro-Lesson Result */}
                  <AnimatePresence>
                    {microLesson && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl p-3" style={{
                          background: 'rgba(34,197,94,0.03)',
                          border: '1px solid rgba(34,197,94,0.08)',
                        }}
                        data-testid="micro-lesson-result"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Lightbulb size={10} style={{ color: '#22C55E' }} />
                          <span className="text-[8px] font-semibold" style={{ color: '#22C55E' }}>
                            {microLesson.hint?.title || 'Micro-Lesson'}
                          </span>
                          {microLesson.fallback && (
                            <span className="text-[6px] px-1 py-0.5 rounded" style={{
                              background: 'rgba(251,191,36,0.1)', color: '#FBBF24',
                            }}>Cached</span>
                          )}
                        </div>
                        <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>
                          {microLesson.lesson}
                        </p>
                        {microLesson.hint?.pack_link && (
                          <div className="mt-2 flex items-center gap-1">
                            <ChevronRight size={8} style={{ color: 'rgba(248,250,252,0.2)' }} />
                            <span className="text-[7px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
                              Related program: {microLesson.hint.pack_link}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Quick Links */}
              <div className="space-y-1">
                {[
                  { label: 'Academy', path: '/academy', color: '#FBBF24' },
                  { label: 'Economy', path: '/economy', color: '#C084FC' },
                ].map(link => (
                  <a
                    key={link.path}
                    href={link.path}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[9px] transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.015)',
                      color: 'rgba(248,250,252,0.4)',
                      textDecoration: 'none',
                    }}
                    data-testid={`toggle-link-${link.label.toLowerCase()}`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={10} style={{ color: link.color }} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
