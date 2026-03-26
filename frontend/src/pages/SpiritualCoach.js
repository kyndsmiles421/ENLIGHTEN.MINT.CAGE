import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Loader2, Send, Plus, Trash2, ChevronLeft, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ModeSelector({ modes, onSelect }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(216,180,254,0.1)', boxShadow: '0 0 60px rgba(216,180,254,0.1)' }}>
          <Sparkles size={28} style={{ color: '#D8B4FE' }} />
        </div>
        <p className="text-sm mb-1" style={{ color: 'rgba(248,250,252,0.6)' }}>
          Choose how Sage can guide you today
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map(mode => (
          <motion.button key={mode.id} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(mode.id)}
            data-testid={`mode-${mode.id}`}
            className="rounded-2xl p-5 text-left transition-all"
            style={{ background: 'rgba(15,17,28,0.6)', border: `1px solid ${mode.color}15`, backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${mode.color}15` }}>
                <Sparkles size={14} style={{ color: mode.color }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>{mode.name}</p>
            </div>
            <p className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>{mode.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ msg, isUser }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0"
          style={{ background: 'rgba(216,180,254,0.15)' }}>
          <Sparkles size={12} style={{ color: '#D8B4FE' }} />
        </div>
      )}
      <div className="max-w-[80%] rounded-2xl px-4 py-3"
        data-testid={isUser ? 'user-message' : 'coach-message'}
        style={{
          background: isUser ? 'rgba(99,102,241,0.15)' : 'rgba(15,17,28,0.6)',
          border: `1px solid ${isUser ? 'rgba(99,102,241,0.2)' : 'rgba(248,250,252,0.06)'}`,
        }}>
        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(248,250,252,0.8)' }}>
          {msg.text}
        </p>
        <p className="text-[9px] mt-1.5 text-right" style={{ color: 'rgba(248,250,252,0.2)' }}>
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </p>
      </div>
    </motion.div>
  );
}

function SessionList({ sessions, onSelect, onNew, onDelete, modes }) {
  return (
    <div className="max-w-md mx-auto">
      <button onClick={onNew} data-testid="new-session-btn"
        className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'rgba(216,180,254,0.1)', border: '1px solid rgba(216,180,254,0.2)', color: '#D8B4FE' }}>
        <Plus size={16} /> New Conversation
      </button>
      {sessions.length === 0 ? (
        <p className="text-center text-sm py-8" style={{ color: 'rgba(248,250,252,0.3)' }}>No conversations yet. Start one!</p>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => {
            const mode = modes.find(m => m.id === s.mode);
            return (
              <div key={s.id} className="rounded-xl p-4 flex items-center justify-between group"
                style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.06)' }}>
                <button onClick={() => onSelect(s.id)} className="flex-1 text-left" data-testid={`session-${s.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: `${mode?.color || '#D8B4FE'}15` }}>
                      <Sparkles size={10} style={{ color: mode?.color || '#D8B4FE' }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{mode?.name || s.mode}</span>
                    <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                      {s.message_count} msgs
                    </span>
                  </div>
                  {s.preview && (
                    <p className="text-[10px] truncate" style={{ color: 'rgba(248,250,252,0.35)' }}>{s.preview}</p>
                  )}
                </button>
                <button onClick={() => onDelete(s.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5">
                  <Trash2 size={12} style={{ color: 'rgba(248,250,252,0.25)' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SpiritualCoach() {
  const { token, authHeaders } = useAuth();
  const [modes, setModes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [view, setView] = useState('list'); // list, mode_select, chat
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/coach/modes`).then(r => setModes(r.data.modes)).catch(() => {});
    if (token) fetchSessions();
    else setLoading(false);
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = () => {
    axios.get(`${API}/coach/sessions`, { headers: authHeaders })
      .then(r => setSessions(r.data.sessions))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const startNew = () => setView('mode_select');

  const createSession = async (mode) => {
    try {
      const r = await axios.post(`${API}/coach/sessions`, { mode }, { headers: authHeaders });
      setActiveSession(r.data.session_id);
      setMessages([]);
      setView('chat');
      fetchSessions();
    } catch { toast.error('Failed to start session'); }
  };

  const openSession = async (id) => {
    try {
      const r = await axios.get(`${API}/coach/sessions/${id}`, { headers: authHeaders });
      setActiveSession(id);
      setMessages(r.data.messages || []);
      setView('chat');
    } catch { toast.error('Failed to load'); }
  };

  const deleteSession = async (id) => {
    try {
      await axios.delete(`${API}/coach/sessions/${id}`, { headers: authHeaders });
      if (activeSession === id) { setView('list'); setActiveSession(null); }
      fetchSessions();
    } catch { toast.error('Failed'); }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    const userMsg = { role: 'user', text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    try {
      const r = await axios.post(`${API}/coach/chat`, {
        session_id: activeSession, message: text,
      }, { headers: authHeaders });
      const assistantMsg = { role: 'assistant', text: r.data.reply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      toast.error('Failed to get response');
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeMode = activeSession ? sessions.find(s => s.id === activeSession)?.mode : null;
  const modeInfo = modes.find(m => m.id === activeMode);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-3xl mx-auto" data-testid="coach-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#D8B4FE' }}>
            <MessageCircle size={12} className="inline mr-1" /> AI Spiritual Coach
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
            {view === 'chat' && modeInfo ? modeInfo.name : 'Sage'}
          </h1>
          {view !== 'chat' && (
            <p className="text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>
              Your personal spiritual and life guide
            </p>
          )}
        </div>

        {!token ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to speak with Sage</p>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={28} style={{ color: '#D8B4FE' }} /></div>
        ) : (
          <>
            {view === 'chat' && (
              <button onClick={() => { setView('list'); setActiveSession(null); }}
                data-testid="back-to-list"
                className="flex items-center gap-1 mb-4 text-xs"
                style={{ color: 'rgba(248,250,252,0.4)' }}>
                <ChevronLeft size={14} /> All conversations
              </button>
            )}

            {view === 'list' && <SessionList sessions={sessions} onSelect={openSession} onNew={startNew} onDelete={deleteSession} modes={modes} />}
            {view === 'mode_select' && <ModeSelector modes={modes} onSelect={createSession} />}

            {view === 'chat' && (
              <div className="flex flex-col">
                {/* Messages */}
                <div className="rounded-2xl p-4 mb-4 min-h-[300px] max-h-[55vh] overflow-y-auto"
                  data-testid="chat-messages"
                  style={{ background: 'rgba(15,17,28,0.4)', border: '1px solid rgba(248,250,252,0.04)' }}>
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <Sparkles size={24} className="mx-auto mb-3" style={{ color: 'rgba(216,180,254,0.3)' }} />
                      <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>
                        Share what's on your mind. Sage is here to listen.
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <ChatBubble key={i} msg={msg} isUser={msg.role === 'user'} />
                  ))}
                  {sending && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(216,180,254,0.15)' }}>
                        <Sparkles size={12} style={{ color: '#D8B4FE' }} />
                      </div>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D8B4FE', animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D8B4FE', animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D8B4FE', animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <textarea value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your thoughts with Sage..."
                    rows={1}
                    data-testid="coach-input"
                    className="flex-1 px-4 py-3 rounded-xl text-xs resize-none"
                    style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' }} />
                  <button onClick={sendMessage} disabled={sending || !input.trim()}
                    data-testid="send-message-btn"
                    className="px-4 py-3 rounded-xl transition-all flex items-center justify-center"
                    style={{
                      background: input.trim() ? 'rgba(216,180,254,0.15)' : 'rgba(15,17,28,0.4)',
                      border: `1px solid ${input.trim() ? 'rgba(216,180,254,0.3)' : 'rgba(248,250,252,0.06)'}`,
                      color: input.trim() ? '#D8B4FE' : 'rgba(248,250,252,0.2)',
                    }}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
