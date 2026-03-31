import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Trash2, Plus, Sparkles, Languages, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ── Page Context Map — Cosmic Concierge awareness ──
const PAGE_CONTEXT = {
  '/dashboard': { area: 'Dashboard', hint: 'their personal wellness overview with shortcuts, mood history, and daily challenges', suggest: 'Would you like a personalized practice recommendation based on your mood?' },
  '/frequencies': { area: 'Frequencies', hint: 'the sacred healing frequency generator with solfeggio tones', suggest: 'Curious which frequency matches your energy right now?' },
  '/cosmic-mixer': { area: 'Cosmic Mixer', hint: 'the multi-layer sound healing mixer with frequencies, ambient sounds, drones, and mantras', suggest: 'Need help crafting the perfect soundscape for your mood?' },
  '/soundscapes': { area: 'Soundscapes', hint: 'saved mixer sessions and curated ambient playlists', suggest: 'Want me to suggest a soundscape for focus, sleep, or healing?' },
  '/meditation': { area: 'Meditation', hint: 'guided meditation sessions and timers', suggest: 'Looking for a meditation style that fits your current state?' },
  '/breathing': { area: 'Breathing', hint: 'breathing exercise patterns like box breathing and 4-7-8', suggest: 'Which breathing technique would serve you best right now?' },
  '/mood': { area: 'Mood Tracker', hint: 'logging and tracking emotional states over time', suggest: 'Want insight on your mood patterns this week?' },
  '/journal': { area: 'Journal', hint: 'personal reflection and gratitude journaling', suggest: 'Need a journal prompt to get the thoughts flowing?' },
  '/oracle': { area: 'Oracle', hint: 'tarot, astrology, I Ching, and sacred geometry divination readings', suggest: 'Curious what the cosmos has to say? Ask about any oracle system.' },
  '/star-chart': { area: 'Star Chart', hint: 'personalized astrology chart with 20 global cultural traditions', suggest: 'Want to understand what the stars say about you today?' },
  '/starseed': { area: 'Starseed Journey', hint: 'a choose-your-own-adventure to discover their cosmic starseed origin', suggest: 'Ready to discover which star nation your soul calls home?' },
  '/multiverse-realms': { area: 'Multiverse Realms', hint: 'dimensional travel through 6 consciousness realms with immersive soundscapes', suggest: 'Which realm is calling to you? I can guide you.' },
  '/coach': { area: 'Spiritual Coach (Sage)', hint: 'deep AI spiritual coaching with multiple modes', suggest: 'Sage is here for deep sessions. Want a quick insight instead?' },
  '/yoga': { area: 'Yoga', hint: 'yoga pose libraries and session tracking', suggest: 'Looking for a yoga flow that matches your energy level?' },
  '/crystals': { area: 'Crystals', hint: 'crystal healing properties and resonance', suggest: 'Want to know which crystal aligns with your intention today?' },
  '/sacred-texts': { area: 'Sacred Texts', hint: 'cross-tradition sacred scripture library', suggest: 'Seeking wisdom from a particular tradition? I can guide you.' },
  '/dreams': { area: 'Dream Journal', hint: 'dream logging with symbol tracking', suggest: 'Had a vivid dream? I can help interpret the symbols.' },
  '/numerology': { area: 'Numerology', hint: 'life path and numerological analysis', suggest: 'Want to know what your numbers reveal about this moment?' },
  '/trade-circle': { area: 'Trade Circle', hint: 'community barter marketplace with trust scores', suggest: 'Need help navigating the Trade Circle or listing something?' },
  '/pricing': { area: 'Pricing', hint: 'subscription tiers and Plus upgrade options', suggest: 'Questions about what\'s included in each tier? I can explain.' },
  '/settings': { area: 'Settings', hint: 'app preferences, language, notifications', suggest: 'Need help configuring something?' },
  '/vr': { area: 'Virtual Reality', hint: 'immersive WebXR meditation environment', suggest: 'Ready for an immersive experience? I can help you prepare.' },
  '/light-therapy': { area: 'Light Therapy', hint: 'chromotherapy color healing overlays', suggest: 'Which color frequency would benefit you right now?' },
  '/mantras': { area: 'Mantras', hint: 'sacred chants from world traditions', suggest: 'Looking for a mantra that resonates with your intention?' },
  '/bible': { area: 'Scriptures', hint: 'comprehensive scripture reader and journey system', suggest: 'Want guidance on where to start reading?' },
  '/exercises': { area: 'Qigong & Exercise', hint: 'energy movement exercises', suggest: 'Need an energy-boosting exercise recommendation?' },
};

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(192,132,252,0.15))'
            : 'rgba(255,255,255,0.04)',
          border: isUser
            ? '1px solid rgba(129,140,248,0.2)'
            : '1px solid rgba(255,255,255,0.06)',
          color: 'var(--text-primary)',
          borderBottomRightRadius: isUser ? '6px' : '18px',
          borderBottomLeftRadius: isUser ? '18px' : '6px',
        }}
        data-testid={`msg-${msg.role}`}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <p className="text-[9px] mt-1 opacity-30 text-right">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

export default function CosmicAssistant() {
  const { authHeaders, user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get current page context
  const currentPath = location.pathname;
  const pageCtx = PAGE_CONTEXT[currentPath] || null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Load sessions list when opened
  useEffect(() => {
    if (open && authHeaders?.Authorization) {
      axios.get(`${API}/gemini/sessions`, { headers: authHeaders })
        .then(r => setSessions(r.data))
        .catch(() => {});
    }
  }, [open, authHeaders]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    if (!authHeaders?.Authorization) {
      toast('Sign in to chat with Cosmos');
      return;
    }

    const userMsg = { role: 'user', text: input.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/gemini/chat`, {
        session_id: sessionId,
        message: userMsg.text,
        page_context: pageCtx ? { area: pageCtx.area, hint: pageCtx.hint, path: currentPath } : null,
      }, { headers: authHeaders });

      if (!sessionId) setSessionId(res.data.session_id);

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.data.reply,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      const status = err?.response?.status;
      const errText = status === 429
        ? 'The cosmos needs a breath — try again in a moment.'
        : status >= 500
          ? 'A ripple in the astral plane. Your message is safe — try again.'
          : 'The cosmic connection wavered. Try again.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: errText,
        timestamp: new Date().toISOString(),
      }]);
    }
    setLoading(false);
  }, [input, loading, sessionId, authHeaders, pageCtx, currentPath]);

  const startNewChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setShowSessions(false);
  }, []);

  const loadSession = useCallback(async (sid) => {
    if (!authHeaders?.Authorization) return;
    try {
      const res = await axios.get(`${API}/gemini/sessions/${sid}`, { headers: authHeaders });
      setSessionId(sid);
      setMessages(res.data.messages || []);
      setShowSessions(false);
    } catch {
      toast.error('Could not load session');
    }
  }, [authHeaders]);

  const deleteSession = useCallback(async (sid) => {
    if (!authHeaders?.Authorization) return;
    try {
      await axios.delete(`${API}/gemini/sessions/${sid}`, { headers: authHeaders });
      setSessions(prev => prev.filter(s => s.id !== sid));
      if (sessionId === sid) startNewChat();
      toast('Session deleted');
    } catch {}
  }, [authHeaders, sessionId, startNewChat]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick actions — context-aware
  const baseActions = [
    { label: 'Translate something', icon: Languages, prompt: 'I need help translating: ' },
    { label: 'Wellness guidance', icon: Sparkles, prompt: 'I could use some guidance on ' },
  ];
  const quickActions = pageCtx
    ? [{ label: pageCtx.suggest.slice(0, 40), icon: Sparkles, prompt: pageCtx.suggest }, ...baseActions]
    : baseActions;

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className="fixed z-[9998] flex items-center justify-center"
            style={{
              bottom: '88px',
              right: '20px',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #818CF8, #C084FC)',
              boxShadow: '0 4px 24px rgba(129,140,248,0.35), 0 0 0 3px rgba(129,140,248,0.08)',
              border: 'none',
              cursor: 'pointer',
            }}
            data-testid="cosmic-assistant-btn"
          >
            <MessageCircle size={22} color="#fff" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[9999] flex flex-col"
            style={{
              bottom: '20px',
              right: '20px',
              width: 'min(380px, calc(100vw - 32px))',
              height: 'min(540px, calc(100vh - 100px))',
              borderRadius: '20px',
              background: 'rgba(8,8,16,0.96)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(129,140,248,0.12)',
              boxShadow: '0 12px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(129,140,248,0.06)',
              overflow: 'hidden',
            }}
            data-testid="cosmic-assistant-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(192,132,252,0.15))' }}>
                  <Sparkles size={14} style={{ color: '#C084FC' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Cosmos</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Gemini-powered assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setShowSessions(!showSessions)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-all" data-testid="toggle-sessions">
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: showSessions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                <button onClick={startNewChat} className="p-1.5 rounded-lg hover:bg-white/5 transition-all" data-testid="new-chat-btn">
                  <Plus size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-all" data-testid="close-assistant">
                  <X size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>

            {/* Sessions Dropdown */}
            <AnimatePresence>
              {showSessions && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="px-3 py-2 max-h-[140px] overflow-y-auto">
                    {sessions.length === 0 ? (
                      <p className="text-[10px] text-center py-2" style={{ color: 'var(--text-muted)' }}>No previous chats</p>
                    ) : sessions.map(s => (
                      <div key={s.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/3 cursor-pointer group"
                        onClick={() => loadSession(s.id)}>
                        <MessageCircle size={10} style={{ color: sessionId === s.id ? '#818CF8' : 'var(--text-muted)' }} />
                        <span className="text-[10px] flex-1 truncate" style={{ color: sessionId === s.id ? '#818CF8' : 'var(--text-secondary)' }}>
                          {s.preview || 'New conversation'}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                          className="opacity-0 group-hover:opacity-100 p-0.5" data-testid={`delete-session-${s.id}`}>
                          <Trash2 size={10} style={{ color: '#EF4444' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.08)' }}>
                    <Sparkles size={24} style={{ color: '#818CF8' }} />
                  </div>
                  <p className="text-sm font-light mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {pageCtx ? `I see you're in ${pageCtx.area}` : 'How can I help?'}
                  </p>
                  <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
                    {pageCtx ? pageCtx.suggest : 'Ask anything, translate text, or get guidance'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickActions.map(qa => (
                      <button key={qa.label} onClick={() => setInput(qa.prompt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] transition-all hover:scale-105"
                        style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.1)', color: '#818CF8' }}
                        data-testid={`quick-${qa.label.toLowerCase().replace(/\s/g, '-')}`}>
                        <qa.icon size={11} /> {qa.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                  {loading && (
                    <div className="flex justify-start mb-3">
                      <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Loader2 size={16} className="animate-spin" style={{ color: '#818CF8' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="px-3 pb-3 pt-1">
              <div className="flex items-end gap-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Cosmos anything..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-white/20"
                  style={{ color: 'var(--text-primary)', maxHeight: '80px', minHeight: '22px' }}
                  data-testid="assistant-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-lg transition-all flex-shrink-0"
                  style={{
                    background: input.trim() ? 'rgba(129,140,248,0.15)' : 'transparent',
                    opacity: input.trim() ? 1 : 0.3,
                  }}
                  data-testid="assistant-send"
                >
                  <Send size={14} style={{ color: '#818CF8' }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
