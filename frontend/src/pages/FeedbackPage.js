import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MessageCircle, Lightbulb, AlertTriangle, Heart, ThumbsUp, Check, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const TYPES = [
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: '#FCD34D' },
  { id: 'feedback', label: 'Feedback', icon: Heart, color: '#FDA4AF' },
  { id: 'bug', label: 'Bug Report', icon: AlertTriangle, color: '#EF4444' },
  { id: 'question', label: 'Question', icon: MessageCircle, color: '#3B82F6' },
];

const CATEGORIES = ['General', 'Dashboard', 'Star Chart', 'Crystals', 'Meditation', 'Journal', 'Blessings', 'Sacred Texts', 'AI Coach', 'Mood Tracking', 'Games', 'Design/UI'];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { token, authHeaders } = useAuth();
  const [type, setType] = useState('suggestion');
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);
  const [view, setView] = useState('submit');

  const loadMy = useCallback(() => {
    if (!token) return;
    fetch(`${API}/api/feedback/my`, { headers: authHeaders }).then(r => r.json()).then(d => setMyFeedback(d.feedback || [])).catch(() => {});
  }, [token, authHeaders]);

  useEffect(() => { loadMy(); }, [loadMy]);

  const handleSubmit = async () => {
    if (!message.trim()) { toast.error('Please write your message'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ type, category, message, page: window.location.pathname }),
      });
      if (res.ok) {
        setSubmitted(true);
        setMessage('');
        loadMy();
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch { toast.error('Could not submit feedback'); }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen immersive-page pt-20 pb-24 px-4 max-w-2xl mx-auto" data-testid="feedback-page">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5" data-testid="feedback-back">
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#2DD4BF' }}>Your Voice Matters</p>
          <h1 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Feedback & Suggestions
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setView('submit')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: view === 'submit' ? 'rgba(45,212,191,0.08)' : 'transparent',
            color: view === 'submit' ? '#2DD4BF' : 'var(--text-muted)',
            border: `1px solid ${view === 'submit' ? 'rgba(45,212,191,0.2)' : 'rgba(248,250,252,0.06)'}`,
          }} data-testid="tab-submit">
          <Send size={12} /> Submit
        </button>
        <button onClick={() => setView('history')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: view === 'history' ? 'rgba(45,212,191,0.08)' : 'transparent',
            color: view === 'history' ? '#2DD4BF' : 'var(--text-muted)',
            border: `1px solid ${view === 'history' ? 'rgba(45,212,191,0.2)' : 'rgba(248,250,252,0.06)'}`,
          }} data-testid="tab-history">
          <MessageCircle size={12} /> My Submissions ({myFeedback.length})
        </button>
      </div>

      {view === 'submit' ? (
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="thanks" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-8 text-center" data-testid="feedback-thanks">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
                <Check size={28} style={{ color: '#2DD4BF' }} />
              </div>
              <h2 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Thank You</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your voice helps shape the cosmic collective. We read every message.</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Type */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>Type</label>
                <div className="grid grid-cols-4 gap-2" data-testid="feedback-types">
                  {TYPES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.id} onClick={() => setType(t.id)}
                        className="glass-card p-3 flex flex-col items-center gap-1.5 transition-all"
                        style={{
                          borderColor: type === t.id ? `${t.color}30` : undefined,
                          background: type === t.id ? `${t.color}08` : undefined,
                        }}>
                        <Icon size={16} style={{ color: type === t.id ? t.color : 'var(--text-muted)' }} />
                        <span className="text-[9px] font-medium" style={{ color: type === t.id ? t.color : 'var(--text-muted)' }}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                <div className="flex flex-wrap gap-1.5" data-testid="feedback-categories">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                      className="px-3 py-1.5 rounded-full text-[10px] transition-all"
                      style={{
                        background: category === c ? 'rgba(45,212,191,0.08)' : 'rgba(248,250,252,0.03)',
                        color: category === c ? '#2DD4BF' : 'var(--text-muted)',
                        border: `1px solid ${category === c ? 'rgba(45,212,191,0.2)' : 'rgba(248,250,252,0.06)'}`,
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>Your Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Share your idea, feedback, or report an issue..."
                  rows={5} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                  data-testid="feedback-message" />
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={submitting || !token || !message.trim()}
                className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', color: '#2DD4BF' }}
                data-testid="submit-feedback-btn">
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {submitting ? 'Sending...' : 'Submit Feedback'}
              </button>
              {!token && <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>Sign in to submit feedback</p>}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="space-y-3" data-testid="feedback-history">
          {myFeedback.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <MessageCircle size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No submissions yet</p>
            </div>
          ) : myFeedback.map((f, i) => {
            const typeInfo = TYPES.find(t => t.id === f.type) || TYPES[0];
            const Icon = typeInfo.icon;
            return (
              <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card p-4" data-testid={`feedback-item-${i}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={12} style={{ color: typeInfo.color }} />
                  <span className="text-[10px] font-bold" style={{ color: typeInfo.color }}>{typeInfo.label}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>{f.category}</span>
                  <span className="text-[8px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                    {f.status === 'new' ? 'Pending review' : f.status}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.message}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
