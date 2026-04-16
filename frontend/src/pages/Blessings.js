import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Heart, Shield, Sparkles, Flame, Sun, Moon, Eye, Leaf, Zap, Gift, Clock, Check, Brain, Inbox, BarChart3, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

import CommunityComments from '../components/CommunityComments';

const API = process.env.REACT_APP_BACKEND_URL;

const ICONS = {
  Peace: Heart, Healing: Leaf, Protection: Shield, Abundance: Sparkles,
  Strength: Flame, Love: Heart, Clarity: Eye, Joy: Sun,
  Gratitude: Gift, Rest: Moon, Courage: Zap, Forgiveness: Leaf, Custom: Brain,
};

export default function Blessings() {
  const navigate = useNavigate();
  const { user, token, authHeaders } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toName, setToName] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [feed, setFeed] = useState([]);
  const [myReceived, setMyReceived] = useState([]);
  const [mySent, setMySent] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('send');
  const [aiMode, setAiMode] = useState(false);
  const [aiCategory, setAiCategory] = useState('peace');
  const [aiContext, setAiContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiText, setAiText] = useState('');

  const loadData = useCallback(() => {
    fetch(`${API}/api/blessings/templates`).then(r => r.json()).then(setTemplates).catch(() => {});
    fetch(`${API}/api/blessings/feed`).then(r => r.json()).then(setFeed).catch(() => {});
    if (token) {
      fetch(`${API}/api/blessings/my-received`, { headers: authHeaders }).then(r => r.json()).then(d => setMyReceived(d.blessings || [])).catch(() => {});
      fetch(`${API}/api/blessings/my-sent`, { headers: authHeaders }).then(r => r.json()).then(d => setMySent(d.blessings || [])).catch(() => {});
      fetch(`${API}/api/blessings/stats`, { headers: authHeaders }).then(r => r.json()).then(setStats).catch(() => {});
    }
  }, [token, authHeaders]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('blessings', 8); }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/blessings/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ category: aiCategory, to_name: toName || 'a beautiful soul', context: aiContext }),
      });
      const data = await res.json();
      setAiText(data.blessing_text || '');
    } catch { toast.error('Could not generate blessing'); }
    setGenerating(false);
  };

  const handleSend = async () => {
    if (!selected && !aiText) { toast.error('Choose or generate a blessing first'); return; }
    setSending(true);
    try {
      const body = aiMode && aiText
        ? { text: aiText, to_name: toName || 'A Beautiful Soul', custom_message: customMsg, category: aiCategory, color: '#C084FC', is_ai_generated: true }
        : { template_id: selected?.id, to_name: toName || 'A Beautiful Soul', custom_message: customMsg };
      const res = await fetch(`${API}/api/blessings/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === 'sent') {
        setSent(true);
        toast.success('Blessing sent into the universe');
        loadData();
        setTimeout(() => { setSent(false); setSelected(null); setToName(''); setCustomMsg(''); setAiText(''); setAiMode(false); }, 3000);
      }
    } catch { toast.error('Could not send blessing'); }
    setSending(false);
  };

  const TABS = [
    { id: 'send', label: 'Send', icon: Send },
    { id: 'feed', label: 'Stream', icon: Heart },
    { id: 'received', label: 'Received', icon: Inbox },
    { id: 'sent', label: 'Sent', icon: Gift },
  ];

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 max-w-3xl mx-auto" data-testid="blessings-page">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-all" data-testid="blessings-back">
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            Send a Blessing
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Share love, healing, and light with someone in need
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="flex gap-3 mb-5" data-testid="blessing-stats">
          {[
            { label: 'Sent', value: stats.sent, color: '#C084FC' },
            { label: 'Received', value: stats.received, color: '#2DD4BF' },
            { label: 'Community', value: stats.community_total, color: '#FCD34D' },
          ].map(s => (
            <div key={s.label} className="flex-1 p-3 text-center">
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar" data-testid="blessings-tabs">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setView(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all whitespace-nowrap"
              style={{
                background: view === t.id ? 'rgba(192,132,252,0.1)' : 'transparent',
                color: view === t.id ? '#C084FC' : 'var(--text-muted)',
                border: `1px solid ${view === t.id ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.06)'}`,
              }}
              data-testid={`tab-${t.id}`}>
              <Icon size={11} /> {t.label}
            </button>
          );
        })}
      </div>

      {view === 'send' ? (
        <div className="space-y-5">
          <AnimatePresence>
            {sent && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="p-8 text-center" data-testid="blessing-sent-confirmation">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(192,132,252,0.1)' }}>
                  <Check size={28} style={{ color: '#C084FC' }} />
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Blessing Sent
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Your light has been shared with {toName || 'a beautiful soul'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!sent && (
            <>
              {/* Mode toggle */}
              <div className="flex gap-2">
                <button onClick={() => setAiMode(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: !aiMode ? 'rgba(192,132,252,0.08)' : 'transparent',
                    color: !aiMode ? '#C084FC' : 'var(--text-muted)',
                    border: `1px solid ${!aiMode ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.06)'}`,
                  }}
                  data-testid="mode-template">
                  Template Blessings
                </button>
                <button onClick={() => setAiMode(true)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: aiMode ? 'rgba(192,132,252,0.08)' : 'transparent',
                    color: aiMode ? '#C084FC' : 'var(--text-muted)',
                    border: `1px solid ${aiMode ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.06)'}`,
                  }}
                  data-testid="mode-ai">
                  <Brain size={12} /> AI Blessing
                </button>
              </div>

              {/* Who is this for */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Who is this blessing for?
                </label>
                <input value={toName} onChange={e => setToName(e.target.value)}
                  placeholder="A friend, family member, or leave blank for anyone..."
                  className="input-glass w-full text-sm px-4 py-3 rounded-xl" data-testid="blessing-to-name" />
              </div>

              {aiMode ? (
                /* AI Generation Mode */
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-3 block" style={{ color: 'var(--text-muted)' }}>
                      Blessing Theme
                    </label>
                    <div className="flex flex-wrap gap-1.5" data-testid="ai-categories">
                      {templates.map(t => (
                        <button key={t.id} onClick={() => setAiCategory(t.category.toLowerCase())}
                          className="px-3 py-1.5 rounded-full text-[10px] transition-all"
                          style={{
                            background: aiCategory === t.category.toLowerCase() ? `${t.color}15` : 'rgba(248,250,252,0.03)',
                            color: aiCategory === t.category.toLowerCase() ? t.color : 'var(--text-muted)',
                            border: `1px solid ${aiCategory === t.category.toLowerCase() ? `${t.color}30` : 'rgba(248,250,252,0.06)'}`,
                          }}>
                          {t.category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Context (optional)
                    </label>
                    <textarea value={aiContext} onChange={e => setAiContext(e.target.value)}
                      placeholder="E.g., going through a hard time, celebrating a birthday, starting a new chapter..."
                      rows={2} className="input-glass w-full text-sm px-4 py-3 rounded-xl resize-none" data-testid="ai-context" />
                  </div>
                  <button onClick={handleGenerateAI} disabled={generating || !token}
                    className="w-full py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
                    style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                    data-testid="generate-ai-btn">
                    {generating ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                    {generating ? 'Channeling cosmic wisdom...' : 'Generate AI Blessing'}
                  </button>
                  {aiText && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-5 relative" data-testid="ai-blessing-preview">
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04]"
                        style={{ background: '#C084FC', filter: 'blur(30px)', transform: 'translate(30%, -30%)' }} />
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#C084FC' }}>
                        AI-Generated Blessing
                      </p>
                      <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                        "{aiText}"
                      </p>
                      <button onClick={handleGenerateAI} disabled={generating}
                        className="mt-3 text-[9px] px-3 py-1 rounded-lg transition-all"
                        style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(248,250,252,0.08)' }}>
                        Regenerate
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* Template Mode */
                <>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-3 block" style={{ color: 'var(--text-muted)' }}>
                      Choose a blessing
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" data-testid="blessing-templates">
                      {templates.map(t => {
                        const Icon = ICONS[t.category] || Heart;
                        const active = selected?.id === t.id;
                        return (
                          <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                            onClick={() => setSelected(t)}
                            className="p-3 flex flex-col items-center gap-2 transition-all"
                            style={{
                              borderColor: active ? `${t.color}40` : undefined,
                              background: active ? `${t.color}08` : undefined,
                              boxShadow: active ? `0 0 20px ${t.color}10` : undefined,
                            }}
                            data-testid={`blessing-${t.id}`}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${t.color}12` }}>
                              <Icon size={16} style={{ color: t.color }} />
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: active ? t.color : 'var(--text-secondary)' }}>
                              {t.category}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <AnimatePresence>
                    {selected && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-5 relative overflow-hidden" data-testid="blessing-preview">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04]"
                          style={{ background: selected.color, filter: 'blur(30px)', transform: 'translate(30%, -30%)' }} />
                        <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: selected.color }}>
                          {selected.category} Blessing
                        </p>
                        <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                          "{selected.text}"
                        </p>
                        {toName && <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>— For {toName}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Custom note */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Add a personal note (optional)
                </label>
                <textarea value={customMsg} onChange={e => setCustomMsg(e.target.value)}
                  placeholder="Add your own words of love..."
                  rows={2} className="input-glass w-full text-sm px-4 py-3 rounded-xl resize-none" data-testid="blessing-custom-msg" />
              </div>

              {/* Send button */}
              <button onClick={handleSend} disabled={(!selected && !aiText) || sending || !token}
                className="w-full py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{
                  background: 'rgba(192,132,252,0.1)',
                  color: '#C084FC',
                  border: '1px solid rgba(192,132,252,0.25)',
                }}
                data-testid="send-blessing-btn">
                <Send size={15} />
                {sending ? 'Sending...' : 'Send Blessing'}
              </button>
              {!token && <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>Sign in to send blessings</p>}
            </>
          )}
        </div>
      ) : view === 'received' ? (
        <BlessingList items={myReceived} emptyText="No blessings received yet" label="received" />
      ) : view === 'sent' ? (
        <BlessingList items={mySent} emptyText="You haven't sent any blessings yet" label="sent" />
      ) : (
        <>
          <BlessingList items={feed} emptyText="No blessings yet — be the first to share one" label="feed" />
          <CommunityComments feature="blessings" title="Blessing Community" />
        </>
      )}
    </div>
  );
}

function BlessingList({ items, emptyText, label }) {
  return (
    <div className="space-y-3" data-testid={`blessing-${label}`}>
      {items.length === 0 ? (
        <div className="p-8 text-center">
          <Heart size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>
        </div>
      ) : items.map((b, i) => {
        const Icon = ICONS[b.category] || Heart;
        return (
          <motion.div key={b.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 relative overflow-hidden" data-testid={`${label}-blessing-${i}`}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03]"
              style={{ background: b.color || '#C084FC', filter: 'blur(20px)', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${b.color || '#C084FC'}12` }}>
                <Icon size={14} style={{ color: b.color || '#C084FC' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold" style={{ color: b.color || '#C084FC' }}>{b.category}</span>
                  {b.is_ai_generated && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC' }}>AI</span>
                  )}
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>from {b.from_name}</span>
                </div>
                <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  "{b.text}"
                </p>
                {b.custom_message && (
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>"{b.custom_message}"</p>
                )}
                {b.to_name && b.to_name !== 'A Beautiful Soul' && (
                  <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>For {b.to_name}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
