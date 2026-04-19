import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2, Send, Plus, Trash2, ChevronLeft, Compass, Clock, Repeat, Heart, Sparkles, Star, BookOpen, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICON_MAP = {
  compass: Compass, clock: Clock, repeat: Repeat,
  heart: Heart, sparkles: Sparkles, star: Star,
};

/* ─── Prompt Selection ─── */
function PromptSelector({ prompts, onSelect, sessions, onOpenSession, onDeleteSession, loading }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)', border: '1px solid rgba(129,140,248,0.1)' }}>
          <BookOpen size={32} style={{ color: '#818CF8' }} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>The Akashic Records</h2>
        <p className="text-xs leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
          The cosmic library of every soul's journey. Choose a gateway to begin your reading, or ask anything your heart desires.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {prompts.map(p => {
          const Icon = ICON_MAP[p.icon] || Sparkles;
          return (
            <motion.button key={p.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(p)}
              data-testid={`akashic-prompt-${p.id}`}
              className="rounded-2xl p-4 text-left transition-all"
              style={{ background: 'transparent', border: `1px solid ${p.color}12`, backdropFilter: 'none'}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${p.color}12` }}>
                <Icon size={16} style={{ color: p.color }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{p.label}</p>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Past Sessions */}
      {sessions.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Past Readings</p>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <button onClick={() => onOpenSession(s.id)}
                  data-testid={`akashic-session-${s.id}`}
                  className="flex-1 rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.01]"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                      {s.preview || `${s.prompt_id || 'Open'} reading`}
                    </p>
                    <span className="text-[10px] ml-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {s.message_count} msgs
                    </span>
                  </div>
                </button>
                <button onClick={() => onDeleteSession(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  data-testid={`akashic-delete-${s.id}`}>
                  <Trash2 size={12} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Chat View ─── */
function ChatView({ session, onSend, onBack, sending }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const messages = session?.messages || [];

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('akashic_records', 8); }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    onSend(text);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 160px - var(--dock-total-clearance, 144px))' }} data-testid="akashic-chat-view">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors" data-testid="akashic-back-btn">
          <ChevronLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(129,140,248,0.12)' }}>
          <BookOpen size={14} style={{ color: '#818CF8' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Akashic Records</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Your soul's eternal library</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
              style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(192,132,252,0.1))'
                  : 'rgba(0,0,0,0)',
                border: msg.role === 'user'
                  ? '1px solid rgba(129,140,248,0.2)'
                  : '1px solid rgba(255,255,255,0.04)',
                backdropFilter: 'none',
              }}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen size={10} style={{ color: '#818CF8' }} />
                  <span className="text-[9px] font-medium" style={{ color: '#818CF8' }}>Keeper of Records</span>
                </div>
              )}
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 rounded-bl-md"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={12} style={{ color: '#818CF8' }} />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Consulting the Records...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-3">
        <div className="flex gap-2 items-end">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask the Records anything..."
            data-testid="akashic-input"
            className="flex-1 text-sm rounded-xl px-4 py-3 outline-none transition-all"
            style={{ background: 'transparent', border: '1px solid rgba(129,140,248,0.12)', color: 'var(--text-primary)', caretColor: '#818CF8' }} />
          <button onClick={handleSend} disabled={sending || !input.trim()}
            data-testid="akashic-send-btn"
            className="p-3 rounded-xl transition-all"
            style={{ background: input.trim() ? 'rgba(129,140,248,0.15)' : 'rgba(0,0,0,0)', border: '1px solid rgba(129,140,248,0.2)', opacity: input.trim() ? 1 : 0.4 }}>
            <Send size={16} style={{ color: '#818CF8' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AkashicRecords() {
  const { token } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      const promises = [axios.get(`${API}/akashic/prompts`)];
      if (token) promises.push(axios.get(`${API}/akashic/sessions`, { headers }));
      const results = await Promise.all(promises);
      setPrompts(results[0].data.prompts || []);
      if (results[1]) setSessions(results[1].data.sessions || []);
    } catch { /* silent */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startSession = async (prompt) => {
    if (!token) { toast.error('Sign in to access the Akashic Records'); return; }
    // Instant optimistic UI — show the chat view immediately with a loading state
    // so the user sees feedback within one tap-frame (no dead-tap perception).
    setActiveSession({ id: null, messages: [{ role: 'user', text: prompt.prompt, timestamp: new Date().toISOString() }], prompt_id: prompt.id });
    setSending(true);
    try {
      const res = await axios.post(`${API}/akashic/sessions`, { prompt_id: prompt.id }, { headers });
      const sid = res.data.session_id;
      const chatRes = await axios.post(`${API}/akashic/chat`, { session_id: sid, message: prompt.prompt }, { headers });
      setActiveSession({
        id: sid,
        prompt_id: prompt.id,
        messages: [
          { role: 'user', text: prompt.prompt, timestamp: new Date().toISOString() },
          { role: 'assistant', text: chatRes.data.reply, timestamp: new Date().toISOString() },
        ],
      });
    } catch {
      toast.error('Could not open the Records');
      setActiveSession(null);
    }
    setSending(false);
  };

  const openSession = async (sessionId) => {
    try {
      const res = await axios.get(`${API}/akashic/sessions/${sessionId}`, { headers });
      setActiveSession(res.data);
    } catch {
      toast.error('Could not load session');
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API}/akashic/sessions/${sessionId}`, { headers });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Reading removed');
    } catch {
      toast.error('Could not delete');
    }
  };

  const sendMessage = async (text) => {
    if (!activeSession) return;
    setActiveSession(prev => ({
      ...prev,
      messages: [...(prev.messages || []), { role: 'user', text, timestamp: new Date().toISOString() }],
    }));
    setSending(true);
    try {
      const res = await axios.post(`${API}/akashic/chat`, { session_id: activeSession.id, message: text }, { headers });
      setActiveSession(prev => ({
        ...prev,
        messages: [...(prev.messages || []), { role: 'assistant', text: res.data.reply, timestamp: new Date().toISOString() }],
      }));
    } catch {
      toast.error('Connection to the Records disrupted');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} style={{ color: '#818CF8' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-40" data-testid="akashic-records-page">
      {!activeSession ? (
        <PromptSelector
          prompts={prompts}
          sessions={sessions}
          onSelect={startSession}
          onOpenSession={openSession}
          onDeleteSession={deleteSession}
          loading={loading}
        />
      ) : (
        <ChatView
          session={activeSession}
          onSend={sendMessage}
          onBack={() => { setActiveSession(null); fetchData(); }}
          sending={sending}
        />
      )}
    </div>
  );
}
