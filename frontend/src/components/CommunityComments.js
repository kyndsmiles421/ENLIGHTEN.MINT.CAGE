import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, ThumbsUp, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

export default function CommunityComments({ feature, title }) {
  const { token, authHeaders, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(() => {
    fetch(`${API}/api/comments/${feature}`).then(r => r.json()).then(d => setComments(d.comments || [])).catch(() => {});
  }, [feature]);

  useEffect(() => { load(); }, [load]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API}/api/comments/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ feature, text }),
      });
      if (res.ok) {
        setText('');
        load();
        toast.success('Comment posted');
      }
    } catch { toast.error('Could not post comment'); }
    setPosting(false);
  };

  const handleLike = async (commentId) => {
    try {
      await fetch(`${API}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: authHeaders,
      });
      load();
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  const displayComments = expanded ? comments : comments.slice(0, 3);

  return (
    <div className="mt-6" data-testid={`community-comments-${feature}`}>
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 w-full text-left"
        data-testid={`comments-toggle-${feature}`}>
        <MessageCircle size={12} style={{ color: 'var(--text-muted)' }} />
        <span className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: 'var(--text-muted)' }}>
          {title || 'Community'} ({comments.length})
        </span>
        {comments.length > 3 && (
          expanded ? <ChevronUp size={10} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {/* Post comment */}
      {token && (
        <div className="flex gap-2 mb-3">
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Share a thought..."
            onKeyDown={e => e.key === 'Enter' && handlePost()}
            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)' }}
            data-testid={`comment-input-${feature}`} />
          <button onClick={handlePost} disabled={posting || !text.trim()}
            className="px-3 py-2 rounded-lg transition-all disabled:opacity-30"
            style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)', color: '#C084FC' }}
            data-testid={`comment-post-${feature}`}>
            {posting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          </button>
        </div>
      )}

      {/* Comments list */}
      <AnimatePresence>
        <div className="space-y-2">
          {displayComments.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="flex gap-2.5 p-2.5 rounded-lg"
              style={{ background: 'rgba(248,250,252,0.02)' }}
              data-testid={`comment-${c.id}`}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC' }}>
                {(c.user_name || 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{c.user_name}</span>
                  <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
              </div>
              {token && (
                <button onClick={() => handleLike(c.id)} className="flex items-center gap-1 self-start pt-1 transition-all hover:scale-110"
                  data-testid={`like-${c.id}`}>
                  <ThumbsUp size={10} style={{ color: c.likes > 0 ? '#C084FC' : 'var(--text-muted)' }} />
                  {c.likes > 0 && <span className="text-[8px]" style={{ color: '#C084FC' }}>{c.likes}</span>}
                </button>
              )}
            </motion.div>
          ))}
          {comments.length === 0 && (
            <p className="text-[10px] text-center py-3" style={{ color: 'var(--text-muted)' }}>No comments yet — be the first to share</p>
          )}
          {!expanded && comments.length > 3 && (
            <button onClick={() => setExpanded(true)} className="w-full text-center py-2 text-[10px]" style={{ color: '#C084FC' }}>
              Show {comments.length - 3} more comments
            </button>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
