import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Music, Coins, Truck, Scale, Compass, Brain, Code, Leaf, FlaskConical,
  Send, Loader2, X, ChevronDown, Wrench, Sparkles, Lock, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = {
  building: Building2, music: Music, coins: Coins, truck: Truck, scale: Scale,
  compass: Compass, brain: Brain, code: Code, leaf: Leaf, flask: FlaskConical,
};

/* ── Page-to-Sovereign context mapping ── */
const PAGE_SOVEREIGN_MAP = {
  '/star-chart': 'astraeus',
  '/cosmic-mixer': 'master_harmonic',
  '/wellness': 'zenith',
  '/meditation': 'zenith',
  '/sanctuary': 'zenith',
  '/garden': 'gaea',
  '/horticulture': 'gaea',
  '/nourish': 'vesta',
  '/alchemy': 'vesta',
  '/economy': 'principal_economist',
  '/trade': 'principal_economist',
  '/marketplace': 'chief_logistics',
  '/logistics': 'chief_logistics',
  '/community': 'sovereign_ethicist',
  '/barter': 'sovereign_ethicist',
  '/developer': 'grand_architect',
  '/settings': 'grand_architect',
  '/academy': 'aurelius',
  '/code': 'aurelius',
};

function getContextSovereign(pathname) {
  for (const [prefix, sid] of Object.entries(PAGE_SOVEREIGN_MAP)) {
    if (pathname.startsWith(prefix)) return sid;
  }
  return 'sovereign_ethicist'; // default: the community guide
}

/* ── Solfeggio Geometric Pulse — renders in the SmartDock button ── */
export function SolfeggioGlow({ color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="absolute inset-0">
      {/* Outer hexagonal ring — breathing */}
      <motion.polygon
        points="14,1 25,7.5 25,20.5 14,27 3,20.5 3,7.5"
        fill="none"
        stroke={color}
        strokeWidth="0.6"
        animate={{
          opacity: [0.12, 0.35, 0.12],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      />
      {/* Inner triangle — counter-rotating */}
      <motion.polygon
        points="14,5 23,19 5,19"
        fill="none"
        stroke={color}
        strokeWidth="0.4"
        animate={{
          rotate: [0, 60, 0],
          opacity: [0.08, 0.25, 0.08],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      />
      {/* Center circle — pulse */}
      <motion.circle
        cx="14" cy="14" r="3"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        animate={{
          r: [3, 4.5, 3],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   SOVEREIGN CONSULT OVERLAY
   Semi-transparent panel over current page
   ═══════════════════════════════════════════ */
export default function SovereignConsultOverlay({ isOpen, onClose, pathname }) {
  const { token, authHeaders } = useAuth();
  const { language } = useLanguage();
  const [council, setCouncil] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const chatEndRef = useRef(null);

  // Load council data
  useEffect(() => {
    if (!isOpen || !token) return;
    fetch(`${API}/api/sovereigns/list`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        const members = data.council || [];
        setCouncil(members);
        // Auto-select context-relevant sovereign
        const contextId = getContextSovereign(pathname || '/');
        const match = members.find(m => m.id === contextId);
        if (match && (match.has_free_access || match.has_session)) {
          setSelectedMember(match);
        } else {
          // Fallback to first accessible member
          const accessible = members.find(m => m.has_free_access || m.has_session);
          setSelectedMember(accessible || members[0]);
        }
      })
      .catch(() => {});
  }, [isOpen, token, authHeaders, pathname]);

  // Load history when member changes
  useEffect(() => {
    if (!selectedMember || !token) return;
    fetch(`${API}/api/sovereigns/history/${selectedMember.id}`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => setMessages(data.messages || []))
      .catch(() => setMessages([]));
  }, [selectedMember, token, authHeaders]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !selectedMember || sending || !token) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setSending(true);
    try {
      const res = await fetch(`${API}/api/sovereigns/chat`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sovereign_id: selectedMember.id, message: msg, language }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, bridges: data.bridges }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.detail || 'Unable to connect.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection interrupted.' }]);
    }
    setSending(false);
  }, [input, selectedMember, sending, token, authHeaders, language]);

  const handleBridge = (bridgeId) => {
    const target = council.find(m => m.id === bridgeId);
    if (target && (target.has_free_access || target.has_session)) {
      setSelectedMember(target);
      setMessages([]);
    }
  };

  if (!isOpen) return null;

  const Icon = selectedMember ? (ICON_MAP[selectedMember.icon] || Sparkles) : Sparkles;
  const color = selectedMember?.color || '#C084FC';
  const util = selectedMember?.utility;
  const accessible = selectedMember?.has_free_access || selectedMember?.has_session;

  return (
    <AnimatePresence>
      <motion.div
        key="consult-overlay"
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 z-[200] flex flex-col"
        style={{
          width: 'min(340px, 85vw)',
          background: 'rgba(11,12,21,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${color}12`,
          boxShadow: `-8px 0 40px rgba(0,0,0,0.5), -2px 0 16px ${color}08`,
        }}
        data-testid="consult-overlay"
      >
        {/* ── Header ── */}
        <div className="px-3 py-2.5 flex items-center gap-2" style={{
          borderBottom: `1px solid ${color}0C`,
          background: `${color}03`,
        }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
            background: `${color}0A`,
          }}>
            <Icon size={14} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setShowSelector(s => !s)}
              className="flex items-center gap-1"
              style={{ cursor: 'pointer' }}
              data-testid="consult-member-selector"
            >
              <span className="text-[10px] font-semibold truncate" style={{ color }}>
                {selectedMember?.name || 'Council'}
              </span>
              <ChevronDown size={10} style={{ color, opacity: 0.5 }} />
            </button>
            <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
              {selectedMember?.module || 'Select a Sovereign'}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{
            cursor: 'pointer', background: 'rgba(255,255,255,0.03)',
          }} data-testid="consult-close-btn">
            <X size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </button>
        </div>

        {/* ── Member Selector Dropdown ── */}
        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {council.map(m => {
                  const MIcon = ICON_MAP[m.icon] || Sparkles;
                  const isAccessible = m.has_free_access || m.has_session;
                  const isActive = selectedMember?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { if (isAccessible) { setSelectedMember(m); setMessages([]); setShowSelector(false); } }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left"
                      style={{
                        background: isActive ? `${m.color}0A` : 'transparent',
                        border: `1px solid ${isActive ? `${m.color}12` : 'transparent'}`,
                        opacity: isAccessible ? 1 : 0.4,
                        cursor: isAccessible ? 'pointer' : 'not-allowed',
                      }}
                      data-testid={`consult-select-${m.id}`}
                    >
                      <MIcon size={11} style={{ color: m.color }} />
                      <span className="text-[8px] flex-1 truncate" style={{ color: m.color }}>
                        {m.name}
                      </span>
                      {!isAccessible && <Lock size={8} style={{ color: 'rgba(248,250,252,0.25)' }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Utility Subsidy Nudge ── */}
        {util && !util.owned && !util.native_access && (
          <div className="px-3 py-2 flex items-center gap-2" style={{
            background: `${util.color}03`,
            borderBottom: `1px solid ${util.color}06`,
          }} data-testid="consult-utility-nudge">
            <Wrench size={10} style={{ color: util.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-semibold" style={{ color: util.color }}>
                {util.name}
              </div>
              <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {util.description.slice(0, 50)}...
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md flex-shrink-0" style={{
              background: `${util.color}08`, border: `1px solid ${util.color}12`,
            }}>
              <span className="text-[6px] line-through" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {util.base_price}
              </span>
              <span className="text-[8px] font-bold" style={{ color: util.color }}>
                {util.discounted_price}
              </span>
              <span className="text-[5px] px-0.5 rounded" style={{
                background: 'rgba(34,197,94,0.08)', color: '#22C55E',
              }}>-{util.discount_pct}%</span>
            </div>
          </div>
        )}

        {/* ── Chat Messages ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: 'thin' }}>
          {!accessible ? (
            <div className="text-center py-8">
              <Lock size={20} style={{ color: 'rgba(248,250,252,0.15)' }} className="mx-auto mb-2" />
              <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
                Purchase a session ({selectedMember?.session_cost} Dust) to consult this Sovereign
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{
                background: `${color}06`, border: `1px solid ${color}0C`,
              }}>
                <Icon size={24} style={{ color, opacity: 0.35 }} />
              </div>
              <p className="text-[9px] font-medium mb-1" style={{ color }}>
                {selectedMember?.name}
              </p>
              <p className="text-[7px] max-w-[200px] mx-auto" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {selectedMember?.backstory?.slice(0, 100)}...
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <React.Fragment key={i}>
                    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`max-w-[88%] rounded-xl px-2.5 py-1.5 ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                        style={{
                          background: isUser ? 'rgba(248,250,252,0.04)' : `${color}05`,
                          border: `1px solid ${isUser ? 'rgba(248,250,252,0.05)' : `${color}08`}`,
                        }}
                      >
                        {!isUser && (
                          <div className="text-[6px] font-semibold mb-0.5" style={{ color }}>{selectedMember?.name}</div>
                        )}
                        <div className="text-[9px] leading-relaxed whitespace-pre-wrap" style={{
                          color: isUser ? 'rgba(248,250,252,0.6)' : 'rgba(248,250,252,0.45)',
                        }}>
                          {msg.content?.replace(/\[BRIDGE:\w+\]/g, '')}
                        </div>
                      </div>
                    </div>
                    {msg.bridges?.length > 0 && (
                      <div className="flex gap-1 mb-2 ml-1">
                        {msg.bridges.map(b => (
                          <button key={b.sovereign_id}
                            onClick={() => handleBridge(b.sovereign_id)}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[6px] font-medium"
                            style={{
                              background: `${b.color}06`, color: b.color,
                              border: `1px solid ${b.color}10`, cursor: 'pointer',
                            }}
                            data-testid={`consult-bridge-${b.sovereign_id}`}
                          >
                            <ArrowRight size={7} /> {b.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {sending && (
                <div className="flex justify-start mb-2">
                  <div className="rounded-xl px-2.5 py-1.5 rounded-bl-sm" style={{
                    background: `${color}05`, border: `1px solid ${color}08`,
                  }}>
                    <Loader2 size={12} className="animate-spin" style={{ color }} />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Input Bar ── */}
        {accessible && (
          <div className="px-3 py-2.5" style={{
            borderTop: `1px solid ${color}08`,
            background: 'rgba(11,12,21,0.5)',
          }}>
            <div className="flex items-center gap-1.5">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={`Ask ${selectedMember?.name?.split(' ').pop()}...`}
                className="flex-1 text-[9px] px-2.5 py-2 rounded-lg outline-none"
                style={{
                  background: 'rgba(255,255,255,0.025)', color: '#F8FAFC',
                  border: `1px solid ${color}08`,
                }}
                data-testid="consult-input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="p-2 rounded-lg"
                style={{
                  background: input.trim() ? `${color}10` : 'rgba(255,255,255,0.02)',
                  color: input.trim() ? color : 'rgba(248,250,252,0.15)',
                  cursor: input.trim() ? 'pointer' : 'default',
                }}
                data-testid="consult-send-btn"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
