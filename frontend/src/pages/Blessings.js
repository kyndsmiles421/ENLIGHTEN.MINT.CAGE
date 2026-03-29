import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Heart, Shield, Sparkles, Flame, Sun, Moon, Eye, Leaf, Zap, Gift, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const ICONS = {
  Peace: Heart, Healing: Leaf, Protection: Shield, Abundance: Sparkles,
  Strength: Flame, Love: Heart, Clarity: Eye, Joy: Sun,
  Gratitude: Gift, Rest: Moon, Courage: Zap, Forgiveness: Leaf,
};

export default function Blessings() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toName, setToName] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [feed, setFeed] = useState([]);
  const [view, setView] = useState('send'); // 'send' | 'feed'

  useEffect(() => {
    fetch(`${API}/api/blessings/templates`).then(r => r.json()).then(setTemplates).catch(() => {});
    fetch(`${API}/api/blessings/feed`).then(r => r.json()).then(setFeed).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!selected) { toast.error('Choose a blessing first'); return; }
    setSending(true);
    try {
      const res = await fetch(`${API}/api/blessings/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ template_id: selected.id, to_name: toName || 'A Beautiful Soul', custom_message: customMsg }),
      });
      const data = await res.json();
      if (data.status === 'sent') {
        setSent(true);
        toast.success('Blessing sent into the universe');
        // Refresh feed
        fetch(`${API}/api/blessings/feed`).then(r => r.json()).then(setFeed).catch(() => {});
        setTimeout(() => { setSent(false); setSelected(null); setToName(''); setCustomMsg(''); }, 3000);
      }
    } catch { toast.error('Could not send blessing'); }
    setSending(false);
  };

  return (
    <div className="min-h-screen immersive-page pt-20 pb-24 px-4 max-w-3xl mx-auto" data-testid="blessings-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-all" data-testid="blessings-back">
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            Send a Blessing
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Share love, healing, and light with someone in need
          </p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 mb-6" data-testid="blessings-tabs">
        {[
          { id: 'send', label: 'Send Blessing', icon: Send },
          { id: 'feed', label: 'Blessing Stream', icon: Heart },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setView(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all"
              style={{
                background: view === t.id ? 'var(--primary)12' : 'transparent',
                color: view === t.id ? 'var(--primary)' : 'var(--text-muted)',
                border: `1px solid ${view === t.id ? 'var(--primary)30' : 'var(--text-muted)22'}`,
              }}
              data-testid={`tab-${t.id}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {view === 'send' ? (
        <div className="space-y-5">
          {/* Sent confirmation */}
          <AnimatePresence>
            {sent && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="glass-card p-8 text-center" data-testid="blessing-sent-confirmation">
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
              {/* Who is this for */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Who is this blessing for?
                </label>
                <input
                  value={toName}
                  onChange={e => setToName(e.target.value)}
                  placeholder="A friend, family member, or leave blank for anyone..."
                  className="input-glass w-full text-sm px-4 py-3 rounded-xl"
                  data-testid="blessing-to-name"
                />
              </div>

              {/* Choose blessing */}
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
                        className="glass-card p-3 flex flex-col items-center gap-2 transition-all"
                        style={{
                          borderColor: active ? `${t.color}40` : undefined,
                          background: active ? `${t.color}08` : undefined,
                          boxShadow: active ? `0 0 20px ${t.color}10` : undefined,
                        }}
                        data-testid={`blessing-${t.id}`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${t.color}12` }}>
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

              {/* Preview */}
              <AnimatePresence>
                {selected && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="glass-card p-5 relative overflow-hidden" data-testid="blessing-preview">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04]"
                      style={{ background: selected.color, filter: 'blur(30px)', transform: 'translate(30%, -30%)' }} />
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: selected.color }}>
                      {selected.category} Blessing
                    </p>
                    <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                      "{selected.text}"
                    </p>
                    {toName && (
                      <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
                        — For {toName}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom note */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Add a personal note (optional)
                </label>
                <textarea
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  placeholder="Add your own words of love..."
                  rows={2}
                  className="input-glass w-full text-sm px-4 py-3 rounded-xl resize-none"
                  data-testid="blessing-custom-msg"
                />
              </div>

              {/* Send button */}
              <button onClick={handleSend} disabled={!selected || sending}
                className="w-full py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{
                  background: selected ? `${selected.color}15` : 'var(--text-muted)08',
                  color: selected ? selected.color : 'var(--text-muted)',
                  border: `1px solid ${selected ? `${selected.color}30` : 'var(--text-muted)15'}`,
                }}
                data-testid="send-blessing-btn">
                <Send size={15} />
                {sending ? 'Sending...' : 'Send Blessing'}
              </button>
            </>
          )}
        </div>
      ) : (
        /* Blessing Feed */
        <div className="space-y-3" data-testid="blessing-feed">
          {feed.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Heart size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No blessings yet — be the first to share one</p>
            </div>
          ) : feed.map((b, i) => {
            const Icon = ICONS[b.category] || Heart;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 relative overflow-hidden" data-testid={`feed-blessing-${i}`}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03]"
                  style={{ background: b.color, filter: 'blur(20px)', transform: 'translate(30%, -30%)' }} />
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${b.color}12` }}>
                    <Icon size={14} style={{ color: b.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold" style={{ color: b.color }}>{b.category}</span>
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>from {b.from_name}</span>
                    </div>
                    <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                      "{b.text}"
                    </p>
                    {b.custom_message && (
                      <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                        "{b.custom_message}"
                      </p>
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
      )}
    </div>
  );
}
