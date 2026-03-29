import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Waves, Headphones, Send, BookOpen, X, ChevronLeft, ChevronRight, Sparkles, Loader2, MessageCircle, Play, Pause } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;
const USAGE_KEY = 'cosmic_dock_usage';

function getUsage() {
  try { return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}'); } catch { return {}; }
}
function trackUsage(id) {
  const u = getUsage();
  u[id] = (u[id] || 0) + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(u));
}

const FREQUENCIES = [
  { name: '432Hz Calm', freq: 432, color: '#D8B4FE' },
  { name: '528Hz Love', freq: 528, color: '#FDA4AF' },
  { name: '396Hz Release', freq: 396, color: '#2DD4BF' },
  { name: '741Hz Intuition', freq: 741, color: '#3B82F6' },
  { name: '852Hz Awakening', freq: 852, color: '#FCD34D' },
  { name: '963Hz Crown', freq: 963, color: '#C084FC' },
];

export default function SmartDock() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState(null);
  const [dockExpanded, setDockExpanded] = useState(false);

  const hidden = location.pathname === '/auth' || location.pathname === '/tutorial' || location.pathname.startsWith('/live/');

  const usage = getUsage();
  const DOCK_ITEMS = [
    { id: 'assistant', icon: HelpCircle, label: 'Sage', color: '#C084FC' },
    { id: 'mixer', icon: Waves, label: 'Mixer', color: '#818CF8' },
    { id: 'frequency', icon: Headphones, label: 'Tones', color: '#2DD4BF' },
    { id: 'feedback', icon: Send, label: 'Feedback', color: '#86EFAC' },
    { id: 'help', icon: BookOpen, label: 'Help', color: '#FCD34D' },
  ].sort((a, b) => (usage[b.id] || 0) - (usage[a.id] || 0));

  const openPanel = (id) => {
    trackUsage(id);
    if (id === 'feedback') { navigate('/feedback'); setActivePanel(null); return; }
    if (id === 'help') { navigate('/help-center'); setActivePanel(null); return; }
    setActivePanel(activePanel === id ? null : id);
  };

  if (hidden) return null;

  const visibleItems = dockExpanded ? DOCK_ITEMS : DOCK_ITEMS.slice(0, 3);

  return createPortal(
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[80] flex items-center pointer-events-none" data-testid="smart-dock">
      {/* Panel — opens to the LEFT of the dock */}
      <div className="pointer-events-auto">
        <AnimatePresence>
          {activePanel === 'assistant' && <AssistantPanel onClose={() => setActivePanel(null)} token={token} authHeaders={authHeaders} />}
          {activePanel === 'frequency' && <FrequencyPanel onClose={() => setActivePanel(null)} />}
          {activePanel === 'mixer' && (
            <motion.div initial={{ opacity: 0, x: 10, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 10, scale: 0.95 }}
              className="mr-2">
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(11,12,21,0.95)', border: '1px solid rgba(129,140,248,0.15)', backdropFilter: 'blur(16px)', width: '200px' }}>
                <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: '#818CF8' }}>Cosmic Mixer</p>
                <button onClick={() => { setActivePanel(null); navigate('/cosmic-mixer'); }}
                  className="w-full py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)', color: '#818CF8' }}>
                  Open Full Mixer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Vertical Dock Rail */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-1 py-2 px-1 rounded-l-2xl pointer-events-auto"
        style={{
          background: 'rgba(11,12,21,0.92)',
          border: '1px solid rgba(248,250,252,0.06)',
          borderRight: 'none',
          backdropFilter: 'blur(16px)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
        }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.85 }}
              onClick={() => openPanel(item.id)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
              style={{
                background: isActive ? `${item.color}15` : 'transparent',
                border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
              }}
              data-testid={`dock-${item.id}`}
              title={item.label}>
              <Icon size={15} style={{ color: isActive ? item.color : 'rgba(248,250,252,0.4)' }} />
            </motion.button>
          );
        })}
        {!dockExpanded && DOCK_ITEMS.length > 3 && (
          <button onClick={() => setDockExpanded(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            data-testid="dock-expand">
            <ChevronLeft size={12} style={{ color: 'rgba(248,250,252,0.25)' }} />
          </button>
        )}
        {dockExpanded && (
          <button onClick={() => setDockExpanded(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            data-testid="dock-collapse">
            <X size={10} style={{ color: 'rgba(248,250,252,0.25)' }} />
          </button>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

/* ─── Assistant Panel ─── */
function AssistantPanel({ onClose, token, authHeaders }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !token) return;
    const text = input;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      let sid = sessionId;
      if (!sid) {
        const r = await fetch(`${API}/api/coach/sessions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ mode: 'spiritual' }),
        });
        const d = await r.json();
        sid = d.session_id;
        setSessionId(sid);
      }
      const r = await fetch(`${API}/api/coach/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ session_id: sid, message: text }),
      });
      const d = await r.json();
      setMessages(prev => [...prev, { role: 'assistant', text: d.reply || d.message || 'Let me reflect on that...' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection issue — try the Help Center for quick answers.' }]);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 10, scale: 0.95 }}
      className="mr-2 rounded-xl overflow-hidden"
      style={{ background: 'rgba(11,12,21,0.97)', border: '1px solid rgba(192,132,252,0.12)', backdropFilter: 'blur(20px)', width: '300px', maxHeight: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      data-testid="assistant-panel">
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={12} style={{ color: '#C084FC' }} />
          <span className="text-[10px] font-medium" style={{ color: '#F8FAFC' }}>Sage</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={12} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>
      <div ref={scrollRef} className="px-3 py-2 space-y-2 overflow-y-auto" style={{ maxHeight: '250px', scrollbarWidth: 'thin' }}>
        {messages.length === 0 && (
          <p className="text-[9px] text-center py-4" style={{ color: 'rgba(248,250,252,0.25)' }}>
            {token ? 'Ask anything about wellness or the app' : 'Sign in to chat'}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed"
              style={{
                background: m.role === 'user' ? 'rgba(192,132,252,0.08)' : 'rgba(248,250,252,0.02)',
                color: m.role === 'user' ? '#D8B4FE' : 'rgba(248,250,252,0.65)',
                border: `1px solid ${m.role === 'user' ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.03)'}`,
              }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
              <Loader2 size={10} className="animate-spin" style={{ color: '#C084FC' }} />
            </div>
          </div>
        )}
      </div>
      {token && (
        <div className="px-3 py-2" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
          <div className="flex gap-1.5">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask Sage..."
              className="flex-1 px-2.5 py-1.5 rounded-lg text-[10px] outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC' }}
              data-testid="assistant-input" />
            <button onClick={send} disabled={loading || !input.trim()}
              className="px-2 rounded-lg disabled:opacity-30"
              style={{ background: 'rgba(192,132,252,0.08)' }}
              data-testid="assistant-send">
              <Send size={10} style={{ color: '#C084FC' }} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Frequency Panel ─── */
function FrequencyPanel({ onClose }) {
  const [playing, setPlaying] = useState(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef(null);

  const stop = useCallback(() => {
    if (nodesRef.current) {
      nodesRef.current.gain.gain.linearRampToValueAtTime(0, (audioCtxRef.current?.currentTime || 0) + 0.3);
      setTimeout(() => {
        try { nodesRef.current?.osc.stop(); } catch {}
        try { nodesRef.current?.osc2.stop(); } catch {}
        nodesRef.current = null;
      }, 400);
    }
    setPlaying(null);
  }, []);

  const playFreq = useCallback((freq) => {
    stop();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    gain.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start();
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq + 4;
    osc2.connect(gain);
    osc2.start();
    nodesRef.current = { osc, osc2, gain };
    setPlaying(freq);
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return (
    <motion.div initial={{ opacity: 0, x: 10, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 10, scale: 0.95 }}
      className="mr-2 rounded-xl overflow-hidden"
      style={{ background: 'rgba(11,12,21,0.97)', border: '1px solid rgba(45,212,191,0.12)', backdropFilter: 'blur(20px)', width: '220px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      data-testid="frequency-panel">
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <span className="text-[10px] font-medium" style={{ color: '#2DD4BF' }}>Solfeggio Tones</span>
        <button onClick={() => { stop(); onClose(); }} className="p-1 rounded-lg hover:bg-white/5"><X size={12} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>
      <div className="p-2 space-y-1">
        {FREQUENCIES.map(f => (
          <button key={f.freq} onClick={() => playing === f.freq ? stop() : playFreq(f.freq)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left"
            style={{
              background: playing === f.freq ? `${f.color}10` : 'transparent',
              border: `1px solid ${playing === f.freq ? `${f.color}20` : 'transparent'}`,
            }}
            data-testid={`freq-${f.freq}`}>
            {playing === f.freq ? <Pause size={11} style={{ color: f.color }} /> : <Play size={11} style={{ color: 'rgba(248,250,252,0.3)' }} />}
            <span className="text-[10px]" style={{ color: playing === f.freq ? f.color : 'rgba(248,250,252,0.5)' }}>{f.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
