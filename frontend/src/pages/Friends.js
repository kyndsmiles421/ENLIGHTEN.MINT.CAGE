import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users, Search, UserPlus, UserCheck, MessageCircle, Share2,
  Clock, Send, ArrowLeft, X, ChevronRight, Flame, Check,
  Heart, Sparkles, Trophy, Zap, BookOpen, Timer, XCircle, Loader2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ACTIVITY_ICONS = {
  friend_accepted: UserCheck,
  friend_request: UserPlus,
  streak_milestone: Flame,
  share_achievement: Trophy,
  share_score: Sparkles,
  share_milestone: Zap,
  share_tool: Heart,
  challenge_complete: Trophy,
};

const ACTIVITY_COLORS = {
  friend_accepted: '#22C55E',
  friend_request: '#3B82F6',
  streak_milestone: '#FCD34D',
  share_achievement: '#FB923C',
  share_score: '#D8B4FE',
  share_milestone: '#2DD4BF',
  share_tool: '#FDA4AF',
  challenge_complete: '#FCD34D',
};

function AvatarBubble({ style, name, size = 36, color }) {
  const colors = {
    'purple-teal': ['#D8B4FE', '#2DD4BF'],
    'gold-rose': ['#FCD34D', '#FDA4AF'],
    'blue-green': ['#3B82F6', '#22C55E'],
    'fire': ['#EF4444', '#FB923C'],
  };
  const [c1, c2] = colors[style] || colors['purple-teal'];
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${c1}, ${c2})`, color: '#fff', fontSize: size * 0.35 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

function UserCard({ u, onAction, actionLabel, actionIcon: ActionIcon, loading, actionColor, onMessage, showMessageBtn }) {
  const canMessage = u.message_privacy !== 'nobody' && !(u.message_privacy === 'friends_only' && !u.is_friend);
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <AvatarBubble style={u.avatar_style} name={u.display_name || u.name} color={u.theme_color} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.display_name || u.name}</p>
        {u.vibe_status && <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{u.vibe_status}</p>}
        {u.streak > 0 && <p className="text-[10px] flex items-center gap-1" style={{ color: '#FCD34D' }}><Flame size={9} /> {u.streak} day streak</p>}
      </div>
      <div className="flex items-center gap-1.5">
        {showMessageBtn && canMessage && (
          <button onClick={() => onMessage?.(u)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.15)' }}
            data-testid={`msg-user-${u.id}`}>
            <MessageCircle size={11} />
          </button>
        )}
        {showMessageBtn && !canMessage && u.message_privacy === 'nobody' && (
          <span className="text-[9px] px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444' }}>DMs off</span>
        )}
        {showMessageBtn && !canMessage && u.message_privacy === 'friends_only' && !u.is_friend && (
          <span className="text-[9px] px-2 py-1 rounded-full" style={{ background: 'rgba(252,211,77,0.06)', color: '#FCD34D' }}>Friends only</span>
        )}
        {onAction && (
          <button onClick={() => onAction(u)} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: `${actionColor || '#D8B4FE'}12`, color: actionColor || '#D8B4FE', border: `1px solid ${actionColor || '#D8B4FE'}20` }}
            data-testid={`action-${u.id}`}>
            {ActionIcon && <ActionIcon size={12} />} {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ========== FIND TAB ========== */
function FindTab({ authHeaders, onMessage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/friends/suggested`, { headers: authHeaders }).then(r => setSuggested(r.data.suggested)).catch(() => {});
    axios.get(`${API}/users/discover`, { headers: authHeaders }).then(r => setDiscover(r.data.users)).catch(() => {});
  }, [authHeaders]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/friends/search?q=${encodeURIComponent(query)}`, { headers: authHeaders });
        setResults(res.data.users);
      } catch {} finally { setLoading(false); }
    }, 300);
  }, [query, authHeaders]);

  const sendRequest = async (u) => {
    try {
      const res = await axios.post(`${API}/friends/request`, { user_id: u.id }, { headers: authHeaders });
      toast.success(res.data.message);
      setResults(prev => prev.map(r => r.id === u.id ? { ...r, is_pending: true } : r));
      setSuggested(prev => prev.map(s => s.id === u.id ? { ...s, is_pending: true } : s));
      setDiscover(prev => prev.map(d => d.id === u.id ? { ...d, is_pending: true } : d));
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to send request');
    }
  };

  return (
    <div data-testid="find-tab">
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name..."
          className="input-glass pl-10 w-full text-sm"
          data-testid="friend-search-input" />
      </div>

      {results.length > 0 ? (
        <div className="space-y-2">
          {results.map(u => (
            <UserCard key={u.id} u={u}
              onAction={u.is_friend ? null : u.is_pending ? null : () => sendRequest(u)}
              actionLabel={u.is_friend ? 'Friends' : u.is_pending ? 'Pending' : 'Add Friend'}
              actionIcon={u.is_friend ? UserCheck : u.is_pending ? Clock : UserPlus}
              actionColor={u.is_friend ? '#22C55E' : u.is_pending ? '#FCD34D' : '#D8B4FE'}
              showMessageBtn onMessage={onMessage}
            />
          ))}
        </div>
      ) : query.length >= 2 ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
          {loading ? 'Searching...' : 'No users found'}
        </p>
      ) : (
        <>
          {suggested.length > 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>People You May Know</p>
              <div className="space-y-2 mb-8">
                {suggested.map(u => (
                  <UserCard key={u.id} u={u}
                    onAction={u.is_pending ? null : () => sendRequest(u)}
                    actionLabel={u.is_pending ? 'Pending' : 'Add Friend'}
                    actionIcon={u.is_pending ? Clock : UserPlus}
                    actionColor={u.is_pending ? '#FCD34D' : '#D8B4FE'}
                    showMessageBtn onMessage={onMessage}
                  />
                ))}
              </div>
            </>
          )}
          {discover.length > 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Discover People</p>
              <div className="space-y-2">
                {discover.map(u => (
                  <UserCard key={u.id} u={u}
                    onAction={u.is_friend ? null : u.is_pending ? null : () => sendRequest(u)}
                    actionLabel={u.is_friend ? 'Friends' : u.is_pending ? 'Pending' : 'Add Friend'}
                    actionIcon={u.is_friend ? UserCheck : u.is_pending ? Clock : UserPlus}
                    actionColor={u.is_friend ? '#22C55E' : u.is_pending ? '#FCD34D' : '#D8B4FE'}
                    showMessageBtn onMessage={onMessage}
                  />
                ))}
              </div>
            </>
          )}
          {suggested.length === 0 && discover.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Invite friends to join The Cosmic Collective!
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ========== REQUESTS TAB ========== */
function RequestsTab({ authHeaders, onUpdate }) {
  const [requests, setRequests] = useState({ received: [], sent: [] });

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/friends/requests`, { headers: authHeaders });
      setRequests(res.data);
    } catch {}
  }, [authHeaders]);

  useEffect(() => { load(); }, [load]);

  const respond = async (id, action) => {
    try {
      const res = await axios.post(`${API}/friends/respond`, { request_id: id, action }, { headers: authHeaders });
      toast.success(res.data.message);
      load();
      onUpdate();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed');
    }
  };

  return (
    <div data-testid="requests-tab">
      {requests.received.length > 0 && (
        <>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Received</p>
          <div className="space-y-2 mb-8">
            {requests.received.map(r => (
              <div key={r.id} className="glass-card p-4 flex items-center gap-3">
                <AvatarBubble style="purple-teal" name={r.from_name} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.from_name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>wants to be friends</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respond(r.id, 'accept')}
                    className="p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}
                    data-testid={`accept-${r.id}`}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => respond(r.id, 'decline')}
                    className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                    data-testid={`decline-${r.id}`}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {requests.sent.length > 0 && (
        <>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Sent</p>
          <div className="space-y-2">
            {requests.sent.map(r => (
              <div key={r.id} className="glass-card p-4 flex items-center gap-3">
                <AvatarBubble style="purple-teal" name={r.to_name} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.to_name}</p>
                </div>
                <span className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(252,211,77,0.1)', color: '#FCD34D' }}>
                  <Clock size={9} /> Pending
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {requests.received.length === 0 && requests.sent.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No pending requests</p>
      )}
    </div>
  );
}

/* ========== FRIENDS LIST TAB ========== */
function FriendsListTab({ authHeaders, onMessage }) {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/friends/list`, { headers: authHeaders }).then(r => setFriends(r.data.friends)).catch(() => {});
  }, [authHeaders]);

  if (friends.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No friends yet. Find people to connect with!</p>;
  }

  return (
    <div className="space-y-2" data-testid="friends-list-tab">
      {friends.map(f => (
        <div key={f.id} className="glass-card p-4 flex items-center gap-3 group">
          <AvatarBubble style={f.avatar_style} name={f.display_name} color={f.theme_color} />
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${f.id}`)}>
            <p className="text-sm font-medium truncate group-hover:underline" style={{ color: 'var(--text-primary)' }}>{f.display_name}</p>
            {f.vibe_status && <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{f.vibe_status}</p>}
          </div>
          {f.streak > 0 && (
            <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
              <Flame size={9} /> {f.streak}
            </span>
          )}
          <button onClick={() => onMessage(f)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}
            data-testid={`message-${f.id}`}>
            <MessageCircle size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ========== MESSAGES TAB ========== */
function MessagesTab({ authHeaders, initialChat, onBack }) {
  const { user } = useAuth();
  const [convos, setConvos] = useState([]);
  const [activeChat, setActiveChat] = useState(initialChat);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const msgEndRef = useRef(null);
  const pollRef = useRef(null);

  const loadConvos = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/messages/conversations`, { headers: authHeaders });
      setConvos(res.data.conversations);
    } catch {}
  }, [authHeaders]);

  const loadMessages = useCallback(async (convoId) => {
    try {
      const res = await axios.get(`${API}/messages/${convoId}`, { headers: authHeaders });
      setMessages(res.data.messages);
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  }, [authHeaders]);

  useEffect(() => {
    if (!activeChat) loadConvos();
  }, [activeChat, loadConvos]);

  useEffect(() => {
    if (activeChat) {
      const convoId = [user.id, activeChat.id].sort().join('_');
      loadMessages(convoId);
      pollRef.current = setInterval(() => loadMessages(convoId), 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [activeChat, loadMessages, user]);

  const sendMsg = async () => {
    if (!text.trim() || !activeChat) return;
    setSending(true);
    try {
      await axios.post(`${API}/messages/send`, { to_id: activeChat.id, text: text.trim() }, { headers: authHeaders });
      setText('');
      const convoId = [user.id, activeChat.id].sort().join('_');
      loadMessages(convoId);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  // Active chat view
  if (activeChat) {
    return (
      <div className="flex flex-col h-[500px]" data-testid="chat-view">
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button onClick={() => { setActiveChat(null); onBack?.(); }} className="p-1" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={16} />
          </button>
          <AvatarBubble style={activeChat.avatar_style || 'purple-teal'} name={activeChat.display_name || activeChat.other_name || activeChat.name} size={32} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{activeChat.display_name || activeChat.other_name || activeChat.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.from_id === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[70%] px-3.5 py-2 rounded-2xl text-sm"
                style={{
                  background: m.from_id === user.id ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.04)',
                  color: 'var(--text-secondary)',
                  borderBottomRightRadius: m.from_id === user.id ? '4px' : '16px',
                  borderBottomLeftRadius: m.from_id !== user.id ? '4px' : '16px',
                }}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={msgEndRef} />
        </div>

        <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder="Type a message..."
            className="input-glass flex-1 text-sm"
            data-testid="message-input" />
          <button onClick={sendMsg} disabled={sending || !text.trim()}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: text.trim() ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.03)', color: text.trim() ? '#D8B4FE' : 'var(--text-muted)' }}
            data-testid="send-message-btn">
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div data-testid="messages-tab">
      {convos.length === 0 ? (
        <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No conversations yet. Message a friend to get started!</p>
      ) : (
        <div className="space-y-2">
          {convos.map(c => (
            <button key={c.conversation_id}
              onClick={() => setActiveChat({ id: c.other_id, display_name: c.other_name, avatar_style: c.avatar_style })}
              className="w-full glass-card p-4 flex items-center gap-3 text-left hover:scale-[1.01] transition-all group"
              data-testid={`convo-${c.other_id}`}>
              <AvatarBubble style={c.avatar_style} name={c.other_name} color={c.theme_color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.other_name}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{c.last_message}</p>
              </div>
              {c.unread_count > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: '#D8B4FE', color: '#0B0C15' }}>{c.unread_count}</span>
              )}
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== FEED TAB ========== */
function FeedTab({ authHeaders }) {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    axios.get(`${API}/friends/feed`, { headers: authHeaders }).then(r => setFeed(r.data.feed)).catch(() => {});
  }, [authHeaders]);

  if (feed.length === 0) {
    return <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No activity yet. Connect with friends to see their journey!</p>;
  }

  return (
    <div className="space-y-3" data-testid="feed-tab">
      {feed.map(a => {
        const Icon = ACTIVITY_ICONS[a.type] || Sparkles;
        const color = ACTIVITY_COLORS[a.type] || '#D8B4FE';
        return (
          <div key={a.id} className="glass-card p-4 flex items-start gap-3">
            <AvatarBubble style={a.avatar_style} name={a.user_name} size={32} />
            <div className="flex-1">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.user_name}</span>{' '}
                {a.message}
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <Icon size={14} style={{ color, flexShrink: 0, marginTop: 4 }} />
          </div>
        );
      })}
    </div>
  );
}

/* ========== SHARE MODAL ========== */
function ShareModal({ open, onClose, authHeaders }) {
  const [type, setType] = useState('achievement');
  const [message, setMessage] = useState('');
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    if (!message.trim()) return;
    setSharing(true);
    try {
      await axios.post(`${API}/friends/share`, { type, message: message.trim(), data: {} }, { headers: authHeaders });
      toast.success('Shared with friends!');
      onClose();
      setMessage('');
    } catch {
      toast.error('Failed to share');
    } finally { setSharing(false); }
  };

  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card w-full max-w-md p-6 relative" data-testid="share-modal">
        <button onClick={onClose} className="absolute top-3 right-3" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        <Share2 size={20} style={{ color: '#D8B4FE', marginBottom: 12 }} />
        <h3 className="text-lg font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Share with Friends</h3>
        <div className="flex gap-2 mb-4">
          {['achievement', 'milestone', 'tool'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className="text-xs px-3 py-1.5 rounded-full capitalize"
              style={{ background: type === t ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.03)', color: type === t ? '#D8B4FE' : 'var(--text-muted)', border: `1px solid ${type === t ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
              {t}
            </button>
          ))}
        </div>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="What do you want to share?"
          className="input-glass w-full text-sm resize-none h-24 mb-4"
          data-testid="share-message" />
        <button onClick={share} disabled={sharing || !message.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: 'rgba(192,132,252,0.12)', color: '#D8B4FE', border: '1px solid rgba(192,132,252,0.2)' }}
          data-testid="share-submit-btn">
          <Send size={14} /> {sharing ? 'Sharing...' : 'Share'}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ========== CHALLENGES TAB ========== */
function ChallengesTab({ authHeaders }) {
  const [challenge, setChallenge] = useState(null);
  const [stats, setStats] = useState({ total_completed: 0, current_streak: 0 });
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [view, setView] = useState('today');
  const [completing, setCompleting] = useState(false);
  const [totalXp, setTotalXp] = useState(0);

  const load = useCallback(async () => {
    try {
      const [dailyRes, histRes, lbRes] = await Promise.all([
        axios.get(`${API}/daily-challenge`, { headers: authHeaders }),
        axios.get(`${API}/daily-challenge/history`, { headers: authHeaders }),
        axios.get(`${API}/daily-challenge/leaderboard`, { headers: authHeaders }),
      ]);
      setChallenge(dailyRes.data.challenge);
      setStats(dailyRes.data.stats);
      setHistory(histRes.data.history);
      setTotalXp(histRes.data.total_xp);
      setLeaderboard(lbRes.data.leaderboard);
    } catch {}
  }, [authHeaders]);

  useEffect(() => { load(); }, [load]);

  const complete = async () => {
    setCompleting(true);
    try {
      const res = await axios.post(`${API}/daily-challenge/complete`, {}, { headers: authHeaders });
      if (res.data.status === 'completed') {
        toast.success(res.data.message);
        const pg = res.data.plant_growth;
        if (pg) {
          setTimeout(() => toast.success(`${pg.plant_name} received cosmic nourishment${pg.grew ? ` and grew to ${pg.new_stage}!` : '!'}`), 1500);
        }
        setChallenge(prev => ({ ...prev, completed: true, completed_at: new Date().toISOString() }));
        load();
      } else {
        toast.info('Already completed today!');
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed');
    } finally { setCompleting(false); }
  };

  const CATEGORY_ICONS = { breathing: Timer, meditation: Sparkles, journaling: BookOpen, physical: Zap, movement: Flame, mindfulness: Heart, social: Users, spiritual: Sparkles, sounds: Sparkles };

  if (!challenge) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading challenge...</div>;

  const CatIcon = CATEGORY_ICONS[challenge.category] || Sparkles;

  return (
    <div data-testid="challenges-tab">
      {/* Sub-navigation */}
      <div className="flex gap-2 mb-6">
        {['today', 'history', 'leaderboard'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className="text-xs px-4 py-1.5 rounded-full capitalize font-medium transition-all"
            style={{
              background: view === v ? 'rgba(252,211,77,0.1)' : 'rgba(255,255,255,0.02)',
              color: view === v ? '#FCD34D' : 'var(--text-muted)',
              border: `1px solid ${view === v ? 'rgba(252,211,77,0.15)' : 'rgba(255,255,255,0.04)'}`,
            }}
            data-testid={`challenge-view-${v}`}>
            {v}
          </button>
        ))}
      </div>

      {view === 'today' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Challenge Card */}
          <div className="glass-card p-6 mb-6 relative overflow-hidden" data-testid="daily-challenge-card">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.04]"
              style={{ background: challenge.color, filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ background: `${challenge.color}12`, color: challenge.color, border: `1px solid ${challenge.color}20` }}>
                <CatIcon size={10} className="inline mr-1" /> {challenge.category}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
                +{challenge.xp} XP
              </span>
              {challenge.duration > 0 && (
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <Timer size={9} className="inline mr-0.5" /> {challenge.duration} min
                </span>
              )}
            </div>
            <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              {challenge.title}
            </h3>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {challenge.description}
            </p>

            {challenge.completed ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
                data-testid="challenge-completed-badge">
                <Check size={16} style={{ color: '#22C55E' }} />
                <span className="text-sm font-medium" style={{ color: '#22C55E' }}>Completed!</span>
                <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                  {challenge.completed_at && new Date(challenge.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : (
              <button onClick={complete} disabled={completing}
                className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                style={{ background: `${challenge.color}15`, color: challenge.color, border: `1px solid ${challenge.color}25` }}
                data-testid="complete-challenge-btn">
                {completing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {completing ? 'Completing...' : 'Mark Complete'}
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FCD34D' }}>{stats.total_completed}</p>
              <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Completed</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2DD4BF' }}>{totalXp}</p>
              <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Total XP</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FB923C' }}>{stats.current_streak}</p>
              <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Day Streak</p>
            </div>
          </div>
        </motion.div>
      )}

      {view === 'history' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {history.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No challenges completed yet. Start today!</p>
          ) : (
            <div className="space-y-2">
              {history.map(h => (
                <div key={h.id} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `${CATEGORY_COLORS[h.category] || '#D8B4FE'}12` }}>
                    <Check size={14} style={{ color: CATEGORY_COLORS[h.category] || '#D8B4FE' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{h.challenge_title}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(h.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#FCD34D' }}>+{h.xp_earned} XP</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {view === 'leaderboard' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No one on the leaderboard yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map(l => (
                <div key={l.user_id} className={`glass-card p-4 flex items-center gap-3 ${l.is_me ? 'ring-1 ring-yellow-500/20' : ''}`}
                  data-testid={`lb-${l.rank}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: l.rank <= 3 ? ['rgba(252,211,77,0.15)', 'rgba(192,192,192,0.12)', 'rgba(205,127,50,0.12)'][l.rank - 1] : 'rgba(255,255,255,0.03)',
                      color: l.rank <= 3 ? ['#FCD34D', '#C0C0C0', '#CD7F32'][l.rank - 1] : 'var(--text-muted)',
                    }}>
                    {l.rank}
                  </div>
                  <AvatarBubble style={l.avatar_style} name={l.display_name} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: l.is_me ? '#FCD34D' : 'var(--text-primary)' }}>
                      {l.display_name} {l.is_me && <span className="text-[9px] opacity-60">(you)</span>}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{l.total_completed} challenges</p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#FCD34D' }}>{l.total_xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

const CATEGORY_COLORS = {
  breathing: '#2DD4BF',
  meditation: '#D8B4FE',
  journaling: '#FCD34D',
  physical: '#FB923C',
  movement: '#22C55E',
  mindfulness: '#3B82F6',
  social: '#FDA4AF',
  spiritual: '#C084FC',
  sounds: '#06B6D4',
};

/* ========== MAIN PAGE ========== */
const TABS = [
  { id: 'feed', label: 'Feed', icon: Sparkles },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'find', label: 'Find', icon: Search },
  { id: 'requests', label: 'Requests', icon: UserPlus },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
];

export default function Friends() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('feed');
  const [showShare, setShowShare] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (user) {
      axios.get(`${API}/friends/requests`, { headers: authHeaders }).then(r => setRequestCount(r.data.received.length)).catch(() => {});
      axios.get(`${API}/messages/conversations`, { headers: authHeaders }).then(r => {
        const total = r.data.conversations.reduce((s, c) => s + c.unread_count, 0);
        setUnreadCount(total);
      }).catch(() => {});
    }
  }, [user, authLoading, navigate, authHeaders]);

  const openMessage = (friend) => {
    setChatTarget(friend);
    setTab('messages');
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }} data-testid="friends-page">
      <ShareModal open={showShare} onClose={() => setShowShare(false)} authHeaders={authHeaders} />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#3B82F6' }}>
                <Users size={14} className="inline mr-2" /> Social
              </p>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Friends
              </h1>
            </div>
            <button onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
              style={{ background: 'rgba(192,132,252,0.1)', color: '#D8B4FE', border: '1px solid rgba(192,132,252,0.15)' }}
              data-testid="share-btn">
              <Share2 size={14} /> Share
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
          {TABS.map(t => {
            const Icon = t.icon;
            const badge = t.id === 'requests' ? requestCount : t.id === 'messages' ? unreadCount : 0;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); if (t.id !== 'messages') setChatTarget(null); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all relative"
                style={{
                  background: tab === t.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                  color: tab === t.id ? '#3B82F6' : 'var(--text-muted)',
                  border: `1px solid ${tab === t.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)'}`,
                }}
                data-testid={`tab-${t.id}`}>
                <Icon size={13} /> {t.label}
                {badge > 0 && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ml-1"
                    style={{ background: '#D8B4FE', color: '#0B0C15' }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {tab === 'feed' && <FeedTab authHeaders={authHeaders} />}
            {tab === 'challenges' && <ChallengesTab authHeaders={authHeaders} />}
            {tab === 'friends' && <FriendsListTab authHeaders={authHeaders} onMessage={openMessage} />}
            {tab === 'find' && <FindTab authHeaders={authHeaders} onMessage={openMessage} />}
            {tab === 'requests' && <RequestsTab authHeaders={authHeaders} onUpdate={() => { setRequestCount(c => Math.max(0, c - 1)); }} />}
            {tab === 'messages' && <MessagesTab authHeaders={authHeaders} initialChat={chatTarget} onBack={() => setChatTarget(null)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
