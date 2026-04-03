import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Music, Coins, Truck, Scale, ArrowLeft, Send, Loader2, Trash2,
  Lock, Sparkles, ChevronRight, X, ArrowRight, Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = {
  building: Building2, music: Music, coins: Coins, truck: Truck, scale: Scale,
};

const TIER_LABELS = {
  discovery: 'Seeker', resonance: 'Artisan', sovereign: 'Alchemist', architect: 'Infrastructure Partner',
};

/* ── Sovereign Card ── */
function SovereignCard({ sovereign, onSelect, userTier }) {
  const Icon = ICON_MAP[sovereign.icon] || Sparkles;
  const accessible = sovereign.has_free_access || sovereign.has_session;

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(sovereign)}
      className="w-full text-left rounded-xl overflow-hidden relative group"
      style={{
        background: `${sovereign.color}04`,
        border: `1px solid ${sovereign.color}18`,
      }}
      data-testid={`sovereign-card-${sovereign.id}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: `${sovereign.color}0D`, border: `1px solid ${sovereign.color}20`,
          }}>
            <Icon size={20} style={{ color: sovereign.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold" style={{ color: sovereign.color }}>
              {sovereign.name}
            </div>
            <div className="text-[8px] mt-0.5" style={{ color: 'rgba(248,250,252,0.3)' }}>
              {sovereign.module}
            </div>
          </div>
          {!accessible && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)',
            }}>
              <Lock size={9} style={{ color: '#FBBF24' }} />
              <span className="text-[7px] font-medium" style={{ color: '#FBBF24' }}>
                {sovereign.session_cost} Dust
              </span>
            </div>
          )}
        </div>

        <p className="text-[9px] leading-relaxed mb-2" style={{ color: 'rgba(248,250,252,0.45)' }}>
          {sovereign.expertise}
        </p>

        <div className="flex items-center gap-2 text-[7px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
          <span className="px-1.5 py-0.5 rounded" style={{
            background: `${sovereign.color}08`, color: sovereign.color,
          }}>
            {TIER_LABELS[sovereign.linked_tier] || sovereign.linked_tier}
          </span>
          <span>{sovereign.link_location}</span>
        </div>
      </div>

      <div className="px-4 py-2 flex items-center justify-between" style={{
        background: `${sovereign.color}04`, borderTop: `1px solid ${sovereign.color}08`,
      }}>
        <span className="text-[8px] font-medium" style={{ color: sovereign.color }}>
          {accessible ? 'Consult' : 'Purchase Session'}
        </span>
        <ChevronRight size={12} style={{ color: sovereign.color, opacity: 0.6 }} />
      </div>
    </motion.button>
  );
}

/* ── Chat Message Bubble ── */
function ChatMessage({ msg, sovereignColor, sovereignName }) {
  const isUser = msg.role === 'user';

  // Parse bridge tags from assistant messages
  const renderContent = (text) => {
    if (isUser) return text;
    const parts = text.split(/\[BRIDGE:(\w+)\]/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) return null; // bridge ID — skip, handled by bridge buttons
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      data-testid={`chat-msg-${msg.role}`}
    >
      <div className={`max-w-[85%] rounded-xl px-3 py-2 ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
        style={{
          background: isUser ? 'rgba(248,250,252,0.06)' : `${sovereignColor}08`,
          border: `1px solid ${isUser ? 'rgba(248,250,252,0.08)' : `${sovereignColor}12`}`,
        }}
      >
        {!isUser && (
          <div className="text-[7px] font-semibold mb-1" style={{ color: sovereignColor }}>
            {sovereignName}
          </div>
        )}
        <div className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{
          color: isUser ? 'rgba(248,250,252,0.7)' : 'rgba(248,250,252,0.55)',
        }}>
          {renderContent(msg.content)}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Purchase Modal ── */
function PurchaseModal({ sovereign, dustBalance, onPurchase, onClose, loading }) {
  const Icon = ICON_MAP[sovereign.icon] || Sparkles;
  const canAfford = dustBalance >= sovereign.session_cost;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      data-testid="purchase-modal"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#0B0C15', border: `1px solid ${sovereign.color}20` }}
      >
        <div className="p-5 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{
            background: `${sovereign.color}0D`, border: `1px solid ${sovereign.color}20`,
          }}>
            <Icon size={28} style={{ color: sovereign.color }} />
          </div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: '#F8FAFC' }}>
            Consult {sovereign.name}
          </h3>
          <p className="text-[9px] mb-4" style={{ color: 'rgba(248,250,252,0.35)' }}>
            {sovereign.role}
          </p>

          <div className="rounded-xl p-3 mb-4" style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Session Cost</span>
              <span className="text-xs font-bold" style={{ color: sovereign.color }}>
                {sovereign.session_cost} Dust
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Your Balance</span>
              <span className="text-xs font-semibold" style={{
                color: canAfford ? '#22C55E' : '#EF4444',
              }}>
                {dustBalance} Dust
              </span>
            </div>
          </div>

          <button
            onClick={() => onPurchase(sovereign.id)}
            disabled={!canAfford || loading}
            className="w-full py-2.5 rounded-xl text-[10px] font-medium transition-all"
            style={{
              background: canAfford ? `${sovereign.color}12` : 'rgba(239,68,68,0.06)',
              color: canAfford ? sovereign.color : '#EF4444',
              border: `1px solid ${canAfford ? `${sovereign.color}20` : 'rgba(239,68,68,0.12)'}`,
              opacity: (!canAfford || loading) ? 0.5 : 1,
              cursor: (!canAfford || loading) ? 'not-allowed' : 'pointer',
            }}
            data-testid="confirm-purchase-btn"
          >
            {loading ? 'Processing...' : canAfford ? 'Begin Session' : 'Insufficient Dust'}
          </button>
        </div>

        <button onClick={onClose} className="w-full py-2 text-[9px]" style={{
          color: 'rgba(248,250,252,0.3)', background: 'rgba(255,255,255,0.015)',
          borderTop: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
        }}>Cancel</button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN SOVEREIGN ADVISORS PAGE
   ═══════════════════════════════════════════ */
export default function SovereignAdvisors() {
  const { token, authHeaders } = useAuth();
  const { language } = useLanguage();
  const [sovereigns, setSovereigns] = useState([]);
  const [userTier, setUserTier] = useState('discovery');
  const [dustBalance, setDustBalance] = useState(0);
  const [selectedSovereign, setSelectedSovereign] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPurchase, setShowPurchase] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const chatEndRef = useRef(null);

  const fetchSovereigns = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/sovereigns/list`, { headers: authHeaders });
      const data = await res.json();
      setSovereigns(data.sovereigns || []);
      setUserTier(data.user_tier || 'discovery');
      setDustBalance(data.dust_balance || 0);
    } catch {}
  }, [token, authHeaders]);

  useEffect(() => { fetchSovereigns(); }, [fetchSovereigns]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectSovereign = async (sovereign) => {
    const accessible = sovereign.has_free_access || sovereign.has_session;
    if (!accessible) {
      setShowPurchase(sovereign);
      return;
    }
    setSelectedSovereign(sovereign);
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/api/sovereigns/history/${sovereign.id}`, { headers: authHeaders });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    }
    setLoadingHistory(false);
  };

  const handlePurchaseSession = async (sovereignId) => {
    setPurchasing(true);
    try {
      const res = await fetch(`${API}/api/sovereigns/purchase-session`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sovereign_id: sovereignId }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowPurchase(null);
        await fetchSovereigns();
        const updated = sovereigns.find(s => s.id === sovereignId);
        if (updated) {
          handleSelectSovereign({ ...updated, has_session: true, has_free_access: updated.has_free_access });
        }
      }
    } catch {}
    setPurchasing(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedSovereign || sending) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, created_at: new Date().toISOString() }]);
    setSending(true);

    try {
      const res = await fetch(`${API}/api/sovereigns/chat`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sovereign_id: selectedSovereign.id,
          message: msg,
          language: language,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant', content: data.response,
          created_at: new Date().toISOString(), bridges: data.bridges,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.detail || 'The Sovereign is currently unavailable. Please try again.',
          created_at: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection to the Sovereign was interrupted.',
        created_at: new Date().toISOString(),
      }]);
    }
    setSending(false);
  };

  const handleClearHistory = async () => {
    if (!selectedSovereign) return;
    try {
      await fetch(`${API}/api/sovereigns/history/${selectedSovereign.id}`, {
        method: 'DELETE', headers: authHeaders,
      });
      setMessages([]);
    } catch {}
  };

  const handleBridge = (bridgeSovereignId) => {
    const target = sovereigns.find(s => s.id === bridgeSovereignId);
    if (target) {
      setSelectedSovereign(null);
      setTimeout(() => handleSelectSovereign(target), 100);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0C15' }}>
        <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>Sign in to consult the Sovereigns</p>
      </div>
    );
  }

  /* ── Chat View ── */
  if (selectedSovereign) {
    const Icon = ICON_MAP[selectedSovereign.icon] || Sparkles;
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#0B0C15' }} data-testid="sovereign-chat-view">
        {/* Chat Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b" style={{
          borderColor: `${selectedSovereign.color}12`,
          background: `${selectedSovereign.color}03`,
        }}>
          <button onClick={() => { setSelectedSovereign(null); setMessages([]); }}
            className="p-1.5 rounded-lg" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}
            data-testid="back-to-list-btn"
          >
            <ArrowLeft size={16} style={{ color: 'rgba(248,250,252,0.5)' }} />
          </button>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
            background: `${selectedSovereign.color}0D`,
          }}>
            <Icon size={16} style={{ color: selectedSovereign.color }} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold" style={{ color: selectedSovereign.color }}>
              {selectedSovereign.name}
            </div>
            <div className="text-[8px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
              {selectedSovereign.module}
            </div>
          </div>
          <button onClick={handleClearHistory}
            className="p-1.5 rounded-lg" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}
            data-testid="clear-history-btn"
          >
            <Trash2 size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: 80 }}>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin" style={{ color: selectedSovereign.color }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
                background: `${selectedSovereign.color}08`, border: `1px solid ${selectedSovereign.color}15`,
              }}>
                <Icon size={32} style={{ color: selectedSovereign.color, opacity: 0.5 }} />
              </div>
              <p className="text-[10px] font-medium mb-1" style={{ color: selectedSovereign.color }}>
                {selectedSovereign.name}
              </p>
              <p className="text-[9px] max-w-xs mx-auto" style={{ color: 'rgba(248,250,252,0.3)' }}>
                {selectedSovereign.role}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <React.Fragment key={i}>
                  <ChatMessage
                    msg={msg}
                    sovereignColor={selectedSovereign.color}
                    sovereignName={selectedSovereign.name}
                  />
                  {msg.bridges && msg.bridges.length > 0 && (
                    <div className="flex gap-1.5 mb-3 ml-2">
                      {msg.bridges.map(b => (
                        <button key={b.sovereign_id}
                          onClick={() => handleBridge(b.sovereign_id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-medium"
                          style={{
                            background: `${b.color}08`, color: b.color,
                            border: `1px solid ${b.color}15`, cursor: 'pointer',
                          }}
                          data-testid={`bridge-${b.sovereign_id}`}
                        >
                          <ArrowRight size={9} /> {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
              {sending && (
                <div className="flex justify-start mb-3">
                  <div className="rounded-xl px-3 py-2 rounded-bl-sm" style={{
                    background: `${selectedSovereign.color}08`,
                    border: `1px solid ${selectedSovereign.color}12`,
                  }}>
                    <Loader2 size={14} className="animate-spin" style={{ color: selectedSovereign.color }} />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3" style={{
          background: 'rgba(11,12,21,0.95)', backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${selectedSovereign.color}10`,
        }}>
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Ask ${selectedSovereign.name}...`}
              className="flex-1 text-[10px] px-3 py-2.5 rounded-xl outline-none"
              style={{
                background: 'rgba(255,255,255,0.03)', color: '#F8FAFC',
                border: `1px solid ${selectedSovereign.color}10`,
              }}
              data-testid="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-xl transition-all"
              style={{
                background: input.trim() ? `${selectedSovereign.color}15` : 'rgba(255,255,255,0.02)',
                color: input.trim() ? selectedSovereign.color : 'rgba(248,250,252,0.2)',
                cursor: input.trim() ? 'pointer' : 'default',
              }}
              data-testid="send-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Sovereign List View ── */
  return (
    <div className="min-h-screen pb-32" style={{ background: '#0B0C15' }} data-testid="sovereign-advisors-page">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: '#F8FAFC' }}
            data-testid="sovereigns-title">
            Sovereign Advisors
          </h1>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,252,0.25)' }}>
            5 Domain-Specific AI Authorities — Hard-Linked to Platform Modules
          </p>
        </div>

        {/* User Status Bar */}
        <div className="grid grid-cols-3 gap-1.5 mb-5" data-testid="sovereign-stats">
          {[
            { label: 'Your Tier', value: userTier.charAt(0).toUpperCase() + userTier.slice(1), color: '#818CF8' },
            { label: 'Dust Balance', value: dustBalance.toString(), color: '#FBBF24' },
            { label: 'Session Cost', value: `${sovereigns[0]?.session_cost || 50} Dust`, color: '#2DD4BF' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2 text-center" style={{
              background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
            }}>
              <div className="text-xs font-semibold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.2)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Language Indicator */}
        <div className="flex items-center gap-1.5 mb-4 px-2 py-1.5 rounded-lg w-fit" style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
        }} data-testid="language-indicator">
          <Globe size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />
          <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
            Sovereigns respond in your selected language: <span style={{ color: '#818CF8' }}>{language.toUpperCase()}</span>
          </span>
        </div>

        {/* Sovereign Cards */}
        <div className="space-y-2">
          {sovereigns.map(sovereign => (
            <SovereignCard
              key={sovereign.id}
              sovereign={sovereign}
              onSelect={handleSelectSovereign}
              userTier={userTier}
            />
          ))}
        </div>

        {/* Protocol Info */}
        <div className="mt-6 rounded-xl p-4" style={{
          background: 'rgba(192,132,252,0.03)', border: '1px solid rgba(192,132,252,0.08)',
        }} data-testid="protocol-info">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={12} style={{ color: '#C084FC' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#C084FC' }}>
              Universal DNA-Level Protocol
            </span>
          </div>
          <div className="space-y-1.5 text-[8px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
            <p>Each Sovereign is hard-linked to their module. Consultations initialize with the specific technical history of your current context.</p>
            <p>The Language Toggle is site-wide — switching language transforms all Sovereign names and responses into master-level terminology.</p>
            <p>All Sovereigns enforce the Central Broker mandate: cash is obsolete. Only Dust moves value.</p>
            <p>Sovereigns bridge you to each other when your question crosses domains.</p>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchase && (
          <PurchaseModal
            sovereign={showPurchase}
            dustBalance={dustBalance}
            onPurchase={handlePurchaseSession}
            onClose={() => setShowPurchase(null)}
            loading={purchasing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
