import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereign } from '../context/SovereignContext';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Compass, Music, MapPin, Brain, X, Loader2,
  Zap, Lock, ChevronRight, Sparkles,
} from 'lucide-react';

const AGENT_ICONS = { alpha: Compass, beta: Music, gamma: MapPin };
const CONTEXT_LABELS = {
  mixer: 'Divine Director', meditation: 'Meditation', trade: 'Trade Circle',
  wellness: 'Wellness', general: 'General',
};

export default function CommandMode({ context = 'general', pageData = {}, trigger, externalOpen, onExternalClose }) {
  const { executeCommand, hasCapability, tier, tierName } = useSovereign();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Handle external open/close
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onExternalClose?.();
  }, [onExternalClose]);

  // Hide standalone button on dashboard (MissionControlRing handles it there)
  const hideTriggerButton = location.pathname === '/dashboard';

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleExecute = useCallback(async () => {
    if (!command.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await executeCommand(command, context, pageData);
    if (res.error) {
      toast.error(res.error);
    } else {
      setResult(res);
    }
    setLoading(false);
  }, [command, context, pageData, executeCommand]);

  const canUse = hasCapability('thinking_feed');

  return (
    <>
      {/* Trigger Button (hidden on dashboard/hub/immersive pages) */}
      {trigger || (!hideTriggerButton && (
        <motion.button
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-2xl command-mode-trigger-btn"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(96,165,250,0.9))',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
          data-testid="command-mode-trigger"
        >
          <Zap size={20} style={{ color: '#FFF' }} />
        </motion.button>
      ))}

      {/* Command Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {/* Backdrop */}
            <div className="absolute inset-0" style={{ background: 'transparent', backdropFilter: 'none'}} />

            <motion.div
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(15,15,25,0.95)',
                border: '1px solid rgba(139,92,246,0.2)',
                boxShadow: '0 25px 100px rgba(139,92,246,0.15)',
              }}
              initial={{ y: -20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              data-testid="command-mode-modal"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  <Brain size={14} style={{ color: '#8B5CF6' }} />
                  <span className="text-[10px] font-bold" style={{ color: '#8B5CF6' }}>Command Mode</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}>
                    {CONTEXT_LABELS[context] || context}
                  </span>
                  <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>
                    {tierName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                    Ctrl+K
                  </span>
                  <button onClick={handleClose} className="p-1 hover:bg-white/5 rounded-lg" data-testid="command-mode-close">
                    <X size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>

              {/* Input */}
              <div className="px-4 py-3">
                {canUse ? (
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={command}
                      onChange={e => setCommand(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleExecute()}
                      placeholder="Command the Master Orchestrator..."
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#F8FAFC' }}
                      data-testid="command-mode-input"
                    />
                    <motion.button
                      className="px-5 py-2.5 rounded-xl text-[10px] font-semibold cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(96,165,250,0.3))', border: '1px solid rgba(139,92,246,0.3)', color: '#E9D5FF' }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleExecute} disabled={loading}
                      data-testid="command-mode-execute"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <><Sparkles size={12} className="inline mr-1" />Orchestrate</>}
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                    <Lock size={14} style={{ color: '#EF4444' }} />
                    <span className="text-[10px]" style={{ color: '#EF4444' }}>
                      Command Mode requires Glass Box access (Apprentice tier or purchase unit)
                    </span>
                  </div>
                )}
              </div>

              {/* Thinking Chain Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {/* Agent Chain */}
                      <div className="px-4 py-3">
                        <p className="text-[8px] uppercase tracking-wider font-medium mb-2" style={{ color: '#8B5CF6' }}>
                          Thinking Chain — {result.agent_count} Agents
                        </p>
                        <div className="space-y-2">
                          {result.thinking_chain?.map((agent, i) => {
                            const AgentIcon = AGENT_ICONS[agent.agent] || Compass;
                            return (
                              <motion.div key={agent.agent}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="flex items-start gap-2 p-2 rounded-lg"
                                style={{ background: `${agent.color}06`, border: `1px solid ${agent.color}10` }}>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${agent.color}15` }}>
                                  <AgentIcon size={11} style={{ color: agent.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[9px] font-bold" style={{ color: agent.color }}>{agent.name}</span>
                                    <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>({agent.role})</span>
                                    <span className="text-[6px] px-1 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>SYNC</span>
                                  </div>
                                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{agent.thought}</p>
                                  <div className="flex gap-1.5 mt-1">
                                    {agent.layers?.map((layer, j) => (
                                      <div key={j} className="px-1.5 py-0.5 rounded text-[6px]" style={{ background: `${agent.color}08`, color: agent.color }}>
                                        {layer.label}: {layer.value}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* AI Response */}
                      {result.ai_response && (
                        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', background: 'rgba(251,191,36,0.02)' }}>
                          <p className="text-[8px] uppercase tracking-wider font-medium mb-1.5" style={{ color: '#FBBF24' }}>
                            Master Orchestrator Response
                          </p>
                          <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: '#F8FAFC' }}>
                            {result.ai_response}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Suggestions */}
              {!result && canUse && (
                <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  <p className="text-[7px] mb-1.5" style={{ color: 'var(--text-muted)' }}>Quick commands</p>
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Optimize this for deep relaxation',
                      'Create a high-vibration wellness plan',
                      'Analyze frequency balance',
                      'Generate a sacred geometry blueprint',
                    ].map(suggestion => (
                      <button key={suggestion}
                        className="text-[8px] px-2 py-1 rounded-full cursor-pointer hover:bg-white/5 transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
                        onClick={() => { setCommand(suggestion); inputRef.current?.focus(); }}
                        data-testid={`suggestion-${suggestion.slice(0, 10)}`}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
