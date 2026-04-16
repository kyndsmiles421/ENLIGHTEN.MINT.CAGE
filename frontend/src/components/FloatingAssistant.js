import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, HelpCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

const QUICK_ACTIONS = [
  { label: 'Help Center', path: '/help-center', color: '#2DD4BF' },
  { label: 'Submit Feedback', path: '/feedback', color: '#86EFAC' },
  { label: 'Quick Reset', action: 'reset', color: '#C084FC' },
];

export default function FloatingAssistant() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  // Don't show on auth page or during tour
  const hidden = location.pathname === '/auth' || location.pathname === '/tutorial';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !token) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Create session if first message
      let sid = sessionId;
      if (!sid) {
        const sessionRes = await fetch(`${API}/api/coach/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ mode: 'spiritual' }),
        });
        const sessionData = await sessionRes.json();
        sid = sessionData.session_id;
        setSessionId(sid);
      }

      const res = await fetch(`${API}/api/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ session_id: sid, message: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || data.message || 'I hear you. Let me think about that...' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'I\'m having trouble connecting. Try the Help Center for quick answers.' }]);
    }
    setLoading(false);
  };

  if (hidden) return null;

  return createPortal(
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-[72px] right-4 z-[90] w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
            style={{
              background: 'linear-gradient(135deg, rgba(192,132,252,0.9), rgba(129,140,248,0.9))',
              boxShadow: '0 4px 20px rgba(192,132,252,0.3)',
            }}
            data-testid="floating-assistant-btn"
          >
            <HelpCircle size={20} style={{ color: '#fff' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[72px] right-4 z-[90] w-[340px] max-w-[calc(100vw-32px)] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(11,12,21,0.97)',
              border: '1px solid rgba(192,132,252,0.15)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 0 30px rgba(192,132,252,0.08)',
              backdropFilter: 'none',
              maxHeight: '480px',
            }}
            data-testid="assistant-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(248,250,252,0.06)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(192,132,252,0.12)' }}>
                  <Sparkles size={13} style={{ color: '#C084FC' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#F8FAFC' }}>Sage Assistant</p>
                  <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.7)' }}>AI guide & help</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                data-testid="close-assistant">
                <X size={14} style={{ color: 'rgba(255,255,255,0.75)' }} />
              </button>
            </div>

            {/* Quick actions */}
            <div className="px-4 py-2.5 flex gap-1.5" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
              {QUICK_ACTIONS.map(a => (
                <button key={a.label}
                  onClick={() => {
                    if (a.path) { navigate(a.path); setOpen(false); }
                  }}
                  className="px-2.5 py-1 rounded-full text-[9px] font-medium transition-all hover:scale-[1.03]"
                  style={{ background: `${a.color}08`, border: `1px solid ${a.color}20`, color: a.color }}
                  data-testid={`quick-${a.label.toLowerCase().replace(/\s/g, '-')}`}>
                  {a.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="px-4 py-3 space-y-3 overflow-y-auto" style={{ maxHeight: '280px', scrollbarWidth: 'thin' }}>
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles size={20} style={{ color: 'rgba(192,132,252,0.3)', margin: '0 auto 8px' }} />
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {token ? 'Ask me anything about wellness, the app, or your spiritual path.' : 'Sign in to chat with Sage'}
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed"
                    style={{
                      background: m.role === 'user' ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.03)',
                      color: m.role === 'user' ? '#D8B4FE' : 'rgba(255,255,255,0.9)',
                      border: `1px solid ${m.role === 'user' ? 'rgba(192,132,252,0.15)' : 'rgba(248,250,252,0.04)'}`,
                    }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <Loader2 size={12} className="animate-spin" style={{ color: '#C084FC' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {token && (
              <div className="px-3 py-2.5" style={{ borderTop: '1px solid rgba(248,250,252,0.06)' }}>
                <div className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC' }}
                    data-testid="assistant-input" />
                  <button onClick={sendMessage} disabled={loading || !input.trim()}
                    className="p-2 rounded-xl transition-all disabled:opacity-30"
                    style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}
                    data-testid="assistant-send">
                    <Send size={12} style={{ color: '#C084FC' }} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
