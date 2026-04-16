import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Music, Coins, Truck, Scale, ArrowLeft, Send, Loader2, Trash2,
  Lock, Sparkles, ChevronRight, ArrowRight, Globe, Compass, Brain, Code,
  Leaf, FlaskConical, ShieldCheck, Wrench, Crown, GraduationCap,
  Volume2, VolumeX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = {
  building: Building2, music: Music, coins: Coins, truck: Truck, scale: Scale,
  compass: Compass, brain: Brain, code: Code, leaf: Leaf, flask: FlaskConical,
};

const TIER_LABELS = {
  discovery: 'Seeker', resonance: 'Artisan', sovereign: 'Alchemist', architect: 'Architect',
};

const TIER_COLORS = {
  discovery: '#22C55E', resonance: '#818CF8', sovereign: '#2DD4BF', architect: '#FBBF24',
};

/* ── Council Member Card ── */
function CouncilCard({ member, onSelect, onPurchaseUtility }) {
  const Icon = ICON_MAP[member.icon] || Sparkles;
  const accessible = member.has_free_access || member.has_session;
  const isFaculty = member.role_type === 'faculty';
  const util = member.utility;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ background: `${member.color}03`, border: `1px solid ${member.color}10` }}
      data-testid={`council-card-${member.id}`}
    >
      <button
        onClick={() => onSelect(member)}
        className="w-full text-left p-4"
        style={{ cursor: 'pointer' }}
        data-testid={`council-select-${member.id}`}
      >
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: `${member.color}0D`, border: `1px solid ${member.color}18`,
          }}>
            <Icon size={20} style={{ color: member.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold" style={{ color: member.color }}>{member.name}</span>
              {isFaculty && (
                <GraduationCap size={10} style={{ color: member.color, opacity: 0.6 }} />
              )}
              {!isFaculty && (
                <Crown size={10} style={{ color: member.color, opacity: 0.6 }} />
              )}
            </div>
            <div className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {member.module}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!accessible && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{
                background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)',
              }}>
                <Lock size={8} style={{ color: '#FBBF24' }} />
                <span className="text-[7px] font-medium" style={{ color: '#FBBF24' }}>
                  {member.session_cost} Dust
                </span>
              </div>
            )}
            <ChevronRight size={12} style={{ color: member.color, opacity: 0.4 }} />
          </div>
        </div>

        <p className="text-[9px] leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {member.backstory ? member.backstory.slice(0, 120) + '...' : member.expertise}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[7px] px-1.5 py-0.5 rounded" style={{
            background: isFaculty ? 'rgba(192,132,252,0.06)' : 'rgba(251,191,36,0.06)',
            color: isFaculty ? '#C084FC' : '#FBBF24',
            border: `1px solid ${isFaculty ? 'rgba(192,132,252,0.1)' : 'rgba(251,191,36,0.1)'}`,
          }}>
            {isFaculty ? 'Faculty' : 'Advisor'}
          </span>
          <span className="text-[7px] px-1.5 py-0.5 rounded" style={{
            background: `${TIER_COLORS[member.linked_tier]}08`,
            color: TIER_COLORS[member.linked_tier],
          }}>
            {TIER_LABELS[member.linked_tier]}
          </span>
        </div>
      </button>

      {/* Utility Tool Bar (Faculty only) */}
      {util && (
        <div className="px-4 py-2.5 flex items-center justify-between" style={{
          background: `${util.color}04`, borderTop: `1px solid ${util.color}08`,
        }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Wrench size={10} style={{ color: util.color }} />
            <div className="min-w-0">
              <div className="text-[8px] font-semibold truncate" style={{ color: util.color }}>
                {util.name}
              </div>
              <div className="text-[7px] truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {util.description.slice(0, 60)}...
              </div>
            </div>
          </div>

          {util.owned || util.native_access ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md flex-shrink-0" style={{
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)',
            }}>
              <ShieldCheck size={9} style={{ color: '#22C55E' }} />
              <span className="text-[7px] font-medium" style={{ color: '#22C55E' }}>
                {util.native_access ? 'Included' : 'Owned'}
              </span>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onPurchaseUtility(member, util); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md flex-shrink-0"
              style={{
                background: `${util.color}08`, border: `1px solid ${util.color}15`,
                cursor: 'pointer',
              }}
              data-testid={`buy-utility-${util.id}`}
            >
              <span className="text-[7px] line-through" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {util.base_price}
              </span>
              <span className="text-[8px] font-bold" style={{ color: util.color }}>
                {util.discounted_price} Dust
              </span>
              <span className="text-[6px] px-1 rounded" style={{
                background: 'rgba(34,197,94,0.1)', color: '#22C55E',
              }}>-{util.discount_pct}%</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ── Chat Message ── */
function ChatBubble({ msg, color, name }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      data-testid={`chat-msg-${msg.role}`}
    >
      <div className={`max-w-[85%] rounded-xl px-3 py-2 ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
        style={{
          background: isUser ? 'rgba(248,250,252,0.05)' : `${color}06`,
          border: `1px solid ${isUser ? 'rgba(248,250,252,0.06)' : `${color}10`}`,
        }}
      >
        {!isUser && (
          <div className="text-[7px] font-semibold mb-1" style={{ color }}>{name}</div>
        )}
        <div className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{
          color: isUser ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.75)',
        }}>
          {msg.content?.replace(/\[BRIDGE:\w+\]/g, '')}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Purchase Modal (Session or Utility) ── */
function PurchaseModal({ type, item, dustBalance, onConfirm, onClose, loading }) {
  const isUtility = type === 'utility';
  const cost = isUtility ? item.discounted_price : item.session_cost;
  const canAfford = dustBalance >= cost;
  const color = isUtility ? item.color : (item.member?.color || '#818CF8');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: 'transparent', backdropFilter: 'none'}}
      onClick={onClose}
      data-testid="purchase-modal"
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'transparent', border: `1px solid ${color}18` }}
      >
        <div className="p-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{
            background: `${color}0D`, border: `1px solid ${color}18`,
          }}>
            {isUtility ? <Wrench size={24} style={{ color }} /> : <Sparkles size={24} style={{ color }} />}
          </div>

          <h3 className="text-sm font-semibold mb-1" style={{ color: '#F8FAFC' }}>
            {isUtility ? item.name : `Consult ${item.member?.name}`}
          </h3>
          <p className="text-[9px] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {isUtility ? item.description : item.member?.role}
          </p>

          {isUtility && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[9px] line-through" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {item.base_price} Dust
              </span>
              <span className="text-xs font-bold" style={{ color }}>
                {item.discounted_price} Dust
              </span>
              <span className="text-[7px] px-1.5 py-0.5 rounded" style={{
                background: 'rgba(34,197,94,0.08)', color: '#22C55E',
              }}>
                Save {item.discount_pct}%
              </span>
            </div>
          )}

          <div className="rounded-lg p-2.5 mb-3" style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Cost</span>
              <span className="text-xs font-bold" style={{ color }}>{cost} Dust</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Balance</span>
              <span className="text-xs font-semibold" style={{
                color: canAfford ? '#22C55E' : '#EF4444',
              }}>{dustBalance} Dust</span>
            </div>
          </div>

          {isUtility && (
            <div className="text-[7px] mb-3 px-2 py-1.5 rounded-lg" style={{
              background: 'rgba(192,132,252,0.04)', color: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(192,132,252,0.08)',
            }}>
              Lifetime license. Protected by the 30% Failure Charge refund protocol.
            </div>
          )}

          <button
            onClick={onConfirm}
            disabled={!canAfford || loading}
            className="w-full py-2.5 rounded-xl text-[10px] font-medium transition-all"
            style={{
              background: canAfford ? `${color}10` : 'rgba(239,68,68,0.05)',
              color: canAfford ? color : '#EF4444',
              border: `1px solid ${canAfford ? `${color}18` : 'rgba(239,68,68,0.1)'}`,
              opacity: (!canAfford || loading) ? 0.5 : 1,
              cursor: (!canAfford || loading) ? 'not-allowed' : 'pointer',
            }}
            data-testid="confirm-purchase-btn"
          >
            {loading ? 'Processing...' : canAfford
              ? (isUtility ? 'Purchase Utility' : 'Begin Session')
              : 'Insufficient Dust'}
          </button>
        </div>

        <button onClick={onClose} className="w-full py-2 text-[9px]" style={{
          color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.01)',
          borderTop: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer',
        }}>Cancel</button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   THE SOVEREIGN COUNCIL PAGE
   ═══════════════════════════════════════════ */
export default function SovereignAdvisors() {
  const { token, authHeaders } = useAuth();
  const { language } = useLanguage();
  const [council, setCouncil] = useState([]);
  const [userTier, setUserTier] = useState('discovery');
  const [dustBalance, setDustBalance] = useState(0);
  const [utilitiesOwned, setUtilitiesOwned] = useState(0);
  const [utilitiesTotal, setUtilitiesTotal] = useState(5);
  const [discountRate, setDiscountRate] = useState(10);

  const [selectedMember, setSelectedMember] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [purchaseModal, setPurchaseModal] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const chatEndRef = useRef(null);
  const audioRef = useRef(null);

  const fetchCouncil = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/sovereigns/list`, { headers: authHeaders });
      const data = await res.json();
      setCouncil(data.council || []);
      setUserTier(data.user_tier || 'discovery');
      setDustBalance(data.dust_balance || 0);
      setUtilitiesOwned(data.utilities_owned || 0);
      setUtilitiesTotal(data.utilities_total || 5);
      setDiscountRate(data.discount_rate || 10);
    } catch {}
  }, [token, authHeaders]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('council_advisors', 8); }, []);
  useEffect(() => { fetchCouncil(); }, [fetchCouncil]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const advisors = council.filter(m => m.role_type === 'advisor');
  const faculty = council.filter(m => m.role_type === 'faculty');

  const handleSelect = async (member) => {
    const accessible = member.has_free_access || member.has_session;
    if (!accessible) {
      setPurchaseModal({ type: 'session', item: { member, session_cost: member.session_cost } });
      return;
    }
    setSelectedMember(member);
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/api/sovereigns/history/${member.id}`, { headers: authHeaders });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch { setMessages([]); }
    setLoadingHistory(false);
  };

  const handlePurchaseUtility = (member, util) => {
    setPurchaseModal({ type: 'utility', item: util, member });
  };

  const handleConfirmPurchase = async () => {
    if (!purchaseModal) return;
    setPurchasing(true);
    try {
      if (purchaseModal.type === 'session') {
        const res = await fetch(`${API}/api/sovereigns/purchase-session`, {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sovereign_id: purchaseModal.item.member.id }),
        });
        if (res.ok) {
          setPurchaseModal(null);
          await fetchCouncil();
          const m = purchaseModal.item.member;
          handleSelect({ ...m, has_session: true });
        }
      } else {
        const res = await fetch(`${API}/api/sovereigns/purchase-utility`, {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ utility_id: purchaseModal.item.id }),
        });
        if (res.ok) {
          setPurchaseModal(null);
          await fetchCouncil();
        }
      }
    } catch {}
    setPurchasing(false);
  };

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !selectedMember || sending) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, created_at: new Date().toISOString() }]);
    setSending(true);
    try {
      const res = await fetch(`${API}/api/sovereigns/chat`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sovereign_id: selectedMember.id, message: msg, language,
          voice_enabled: voiceEnabled,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant', content: data.response,
          created_at: new Date().toISOString(), bridges: data.bridges,
        }]);
        // Play TTS
        if (data.audio_base64 && voiceEnabled) {
          stopAudio();
          try {
            const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
            audioRef.current = audio;
            setIsPlaying(true);
            audio.onended = () => setIsPlaying(false);
            audio.play().catch(() => setIsPlaying(false));
          } catch { setIsPlaying(false); }
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant', content: data.detail || 'The Council member is unavailable.',
          created_at: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant', content: 'Connection interrupted.',
        created_at: new Date().toISOString(),
      }]);
    }
    setSending(false);
  };

  const handleClear = async () => {
    if (!selectedMember) return;
    try {
      await fetch(`${API}/api/sovereigns/history/${selectedMember.id}`, {
        method: 'DELETE', headers: authHeaders,
      });
      setMessages([]);
    } catch {}
  };

  const handleBridge = (bridgeId) => {
    const target = council.find(m => m.id === bridgeId);
    if (target) {
      setSelectedMember(null);
      setTimeout(() => handleSelect(target), 100);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Sign in to consult the Sovereign Council</p>
      </div>
    );
  }

  /* ── Chat View ── */
  if (selectedMember) {
    const Icon = ICON_MAP[selectedMember.icon] || Sparkles;
    const isFaculty = selectedMember.role_type === 'faculty';
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'transparent' }} data-testid="council-chat-view">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3" style={{
          borderBottom: `1px solid ${selectedMember.color}0C`,
          background: `${selectedMember.color}02`,
        }}>
          <button onClick={() => { setSelectedMember(null); setMessages([]); }}
            className="p-1.5 rounded-lg" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
            data-testid="back-to-list-btn"
          >
            <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.75)' }} />
          </button>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
            background: `${selectedMember.color}0A`,
          }}>
            <Icon size={16} style={{ color: selectedMember.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold" style={{ color: selectedMember.color }}>
                {selectedMember.name}
              </span>
              {isFaculty ? <GraduationCap size={10} style={{ color: selectedMember.color, opacity: 0.5 }} />
                : <Crown size={10} style={{ color: selectedMember.color, opacity: 0.5 }} />}
            </div>
            <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {selectedMember.module} — Knowledge: {TIER_LABELS[userTier]} depth
            </div>
          </div>
          <button onClick={() => { if (voiceEnabled) { stopAudio(); setVoiceEnabled(false); } else setVoiceEnabled(true); }}
            className="p-1.5 rounded-lg" style={{
              cursor: 'pointer',
              background: voiceEnabled ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
              border: voiceEnabled ? '1px solid rgba(139,92,246,0.25)' : '1px solid transparent',
            }}
            data-testid="voice-toggle-btn"
          >
            {voiceEnabled ? <Volume2 size={13} style={{ color: '#8B5CF6' }} /> : <VolumeX size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />}
          </button>
          <button onClick={handleClear}
            className="p-1.5 rounded-lg" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
            data-testid="clear-history-btn"
          >
            <Trash2 size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
        </div>

        {/* Utility banner if faculty and user doesn't own it */}
        {selectedMember.utility && !selectedMember.utility.owned && !selectedMember.utility.native_access && (
          <div className="px-4 py-2 flex items-center justify-between" style={{
            background: `${selectedMember.utility.color}04`,
            borderBottom: `1px solid ${selectedMember.utility.color}08`,
          }} data-testid="utility-banner">
            <div className="flex items-center gap-2">
              <Wrench size={11} style={{ color: selectedMember.utility.color }} />
              <span className="text-[8px]" style={{ color: selectedMember.utility.color }}>
                {selectedMember.utility.name} — <span className="line-through">{selectedMember.utility.base_price}</span> {selectedMember.utility.discounted_price} Dust
              </span>
            </div>
            <button
              onClick={() => handlePurchaseUtility(selectedMember, selectedMember.utility)}
              className="text-[7px] px-2 py-1 rounded-md font-medium"
              style={{
                background: `${selectedMember.utility.color}0A`,
                color: selectedMember.utility.color,
                border: `1px solid ${selectedMember.utility.color}15`,
                cursor: 'pointer',
              }}
              data-testid="chat-buy-utility-btn"
            >
              Purchase
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: 80 }}>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 size={18} className="animate-spin" style={{ color: selectedMember.color }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{
                background: `${selectedMember.color}06`, border: `1px solid ${selectedMember.color}10`,
              }}>
                <Icon size={28} style={{ color: selectedMember.color, opacity: 0.4 }} />
              </div>
              <p className="text-[10px] font-medium mb-1" style={{ color: selectedMember.color }}>
                {selectedMember.name}
              </p>
              <p className="text-[8px] max-w-xs mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {selectedMember.backstory}
              </p>
              <p className="text-[7px] italic" style={{ color: 'rgba(248,250,252,0.15)' }}>
                Knowledge depth: {TIER_LABELS[userTier]}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <React.Fragment key={i}>
                  <ChatBubble msg={msg} color={selectedMember.color} name={selectedMember.name} />
                  {msg.bridges?.length > 0 && (
                    <div className="flex gap-1.5 mb-3 ml-2">
                      {msg.bridges.map(b => (
                        <button key={b.sovereign_id}
                          onClick={() => handleBridge(b.sovereign_id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[7px] font-medium"
                          style={{
                            background: `${b.color}06`, color: b.color,
                            border: `1px solid ${b.color}12`, cursor: 'pointer',
                          }}
                          data-testid={`bridge-${b.sovereign_id}`}
                        >
                          <ArrowRight size={8} /> {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
              {sending && (
                <div className="flex justify-start mb-3">
                  <div className="rounded-xl px-3 py-2 rounded-bl-sm" style={{
                    background: `${selectedMember.color}06`, border: `1px solid ${selectedMember.color}10`,
                  }}>
                    <Loader2 size={14} className="animate-spin" style={{ color: selectedMember.color }} />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3" style={{
          background: 'rgba(11,12,21,0.95)', backdropFilter: 'none',
          borderTop: `1px solid ${selectedMember.color}08`,
        }}>
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Ask ${selectedMember.name}...`}
              className="flex-1 text-[10px] px-3 py-2.5 rounded-xl outline-none"
              style={{
                background: 'rgba(255,255,255,0.025)', color: '#F8FAFC',
                border: `1px solid ${selectedMember.color}08`,
              }}
              data-testid="chat-input"
            />
            <button onClick={handleSend} disabled={!input.trim() || sending}
              className="p-2.5 rounded-xl" data-testid="send-btn"
              style={{
                background: input.trim() ? `${selectedMember.color}12` : 'rgba(255,255,255,0.02)',
                color: input.trim() ? selectedMember.color : 'rgba(248,250,252,0.15)',
                cursor: input.trim() ? 'pointer' : 'default',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Council List View ── */
  return (
    <div className="min-h-screen pb-32" style={{ background: 'transparent' }} data-testid="sovereign-council-page">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: '#F8FAFC' }}
            data-testid="council-title">
            The Sovereign Council
          </h1>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            10 Domain Authorities — Advisors & Faculty — Tiered Knowledge
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5 mb-5" data-testid="council-stats">
          {[
            { label: 'Tier', value: TIER_LABELS[userTier] || userTier, color: TIER_COLORS[userTier] || '#818CF8' },
            { label: 'Dust', value: dustBalance.toString(), color: '#FBBF24' },
            { label: 'Utilities', value: `${utilitiesOwned}/${utilitiesTotal}`, color: '#2DD4BF' },
            { label: 'Subsidy', value: `${discountRate}%`, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2 text-center" style={{
              background: 'rgba(255,255,255,0.012)', border: '1px solid rgba(255,255,255,0.025)',
            }}>
              <div className="text-xs font-semibold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.18)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Language */}
        <div className="flex items-center gap-1.5 mb-5 px-2 py-1.5 rounded-lg w-fit" style={{
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
        }} data-testid="language-indicator">
          <Globe size={9} style={{ color: 'rgba(255,255,255,0.6)' }} />
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Council responds in: <span style={{ color: '#818CF8' }}>{language.toUpperCase()}</span>
          </span>
        </div>

        {/* Sovereign Advisors Section */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Crown size={11} style={{ color: '#FBBF24' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#FBBF24' }}>
              Sovereign Advisors
            </span>
            <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Strategic Guidance
            </span>
          </div>
          <div className="space-y-2">
            {advisors.map(m => (
              <CouncilCard key={m.id} member={m} onSelect={handleSelect} onPurchaseUtility={handlePurchaseUtility} />
            ))}
          </div>
        </div>

        {/* Faculty Teachers Section */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <GraduationCap size={11} style={{ color: '#C084FC' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#C084FC' }}>
              Faculty Teachers
            </span>
            <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Utility Tools & Education
            </span>
          </div>
          <div className="space-y-2">
            {faculty.map(m => (
              <CouncilCard key={m.id} member={m} onSelect={handleSelect} onPurchaseUtility={handlePurchaseUtility} />
            ))}
          </div>
        </div>

        {/* Protocol */}
        <div className="rounded-xl p-4" style={{
          background: 'rgba(192,132,252,0.025)', border: '1px solid rgba(192,132,252,0.06)',
        }} data-testid="protocol-info">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} style={{ color: '#C084FC' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#C084FC' }}>
              Council Protocol
            </span>
          </div>
          <div className="space-y-1.5 text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <p>Knowledge depth scales with your tier. Seekers receive foundational guidance; Architects access unrestricted intelligence.</p>
            <p>Lower-tier users can purchase utility tools at a {discountRate}% Universal Subsidy. Own 3+ Architect tools and the $89/mo subscription becomes the logical upgrade.</p>
            <p>Every purchase is protected by the 30% Failure Charge refund protocol via The Principal Economist.</p>
            <p>Council members bridge you to each other when your question crosses domains. Language toggle transforms all responses instantly.</p>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchaseModal && (
          <PurchaseModal
            type={purchaseModal.type}
            item={purchaseModal.type === 'utility' ? purchaseModal.item : purchaseModal.item}
            dustBalance={dustBalance}
            onConfirm={handleConfirmPurchase}
            onClose={() => setPurchaseModal(null)}
            loading={purchasing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
