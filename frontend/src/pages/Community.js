import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Users, Heart, MessageCircle, Send, Sparkles, Flame,
  Sunrise, Share2, Award, PenLine, ChevronDown, ChevronUp,
  UserPlus, UserCheck, Trash2, Loader2, X
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const POST_TYPE_CONFIG = {
  thought: { label: 'Reflection', icon: PenLine, color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
  shared_ritual: { label: 'Shared Ritual', icon: Sunrise, color: '#FCD34D', bg: 'rgba(252,211,77,0.08)' },
  shared_affirmation: { label: 'Affirmation', icon: Sparkles, color: '#D8B4FE', bg: 'rgba(216,180,254,0.08)' },
  milestone: { label: 'Milestone', icon: Award, color: '#2DD4BF', bg: 'rgba(45,212,191,0.08)' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function PostCard({ post, currentUserId, authHeaders, onDelete, onUpdate }) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const config = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.thought;
  const Icon = config.icon;

  const toggleLike = async () => {
    if (!currentUserId) { toast.error('Sign in to interact'); return; }
    // Optimistic update for instant feedback
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      const res = await axios.post(`${API}/community/posts/${post.id}/like`, {}, { headers: authHeaders });
      setLiked(res.data.action === 'liked');
      setLikeCount(res.data.like_count);
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      toast.error('Could not like');
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axios.get(`${API}/community/posts/${post.id}/comments`);
      setComments(res.data);
    } catch {} finally { setLoadingComments(false); }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUserId) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/community/posts/${post.id}/comment`, { text: commentText }, { headers: authHeaders });
      setComments([...comments, res.data]);
      setCommentText('');
      if (onUpdate) onUpdate(post.id, { comment_count: (post.comment_count || 0) + 1 });
    } catch { toast.error('Could not comment'); } finally { setSubmitting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
      data-testid={`community-post-${post.id}`}
    >
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, rgba(192,132,252,0.3), rgba(45,212,191,0.3))', color: 'var(--text-primary)' }}>
              {post.user_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{post.user_name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(post.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
              style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}20` }}>
              <Icon size={12} /> {config.label}
            </span>
            {currentUserId === post.user_id && (
              <button onClick={() => onDelete(post.id)} className="p-1.5 rounded-full" style={{ color: 'var(--text-muted)' }} data-testid={`delete-post-${post.id}`}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
          {post.content}
        </p>

        {post.post_type === 'shared_affirmation' && post.affirmation_text && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(216,180,254,0.06)', border: '1px solid rgba(216,180,254,0.1)' }}>
            <p className="text-base italic" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--primary)' }}>
              "{post.affirmation_text}"
            </p>
          </div>
        )}

        {post.post_type === 'shared_ritual' && post.ritual_data && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(252,211,77,0.04)', border: '1px solid rgba(252,211,77,0.1)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#FCD34D' }}>{post.ritual_data.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {post.ritual_data.steps?.map((s, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.post_type === 'milestone' && (
          <div className="mt-4 p-4 rounded-xl flex items-center gap-4" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
            <Award size={24} style={{ color: '#2DD4BF' }} />
            <div>
              <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2DD4BF' }}>
                {post.milestone_value} {post.milestone_type}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-3 flex items-center gap-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <motion.button
          onClick={toggleLike}
          whileTap={{ scale: 1.3 }}
          className="flex items-center gap-2 text-sm py-1 px-2 rounded-lg"
          data-testid={`like-btn-${post.id}`}
          style={{
            color: liked ? '#FDA4AF' : 'var(--text-muted)',
            background: liked ? 'rgba(253,164,175,0.08)' : 'transparent',
            transition: 'color 0.2s, background 0.2s',
          }}>
          <Heart size={16} fill={liked ? '#FDA4AF' : 'none'} style={{ transition: 'fill 0.2s' }} />
          <span>{likeCount}</span>
        </motion.button>
        <motion.button
          onClick={toggleComments}
          whileTap={{ scale: 1.1 }}
          className="flex items-center gap-2 text-sm py-1 px-2 rounded-lg"
          data-testid={`comment-btn-${post.id}`}
          style={{
            color: showComments ? 'var(--text-primary)' : 'var(--text-muted)',
            background: showComments ? 'rgba(255,255,255,0.06)' : 'transparent',
            transition: 'color 0.2s, background 0.2s',
          }}>
          <MessageCircle size={16} />
          <span>{post.comment_count || 0}</span>
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              {loadingComments ? (
                <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</p>
              ) : (
                <div className="space-y-3 pt-4 max-h-64 overflow-y-auto">
                  {comments.length === 0 && (
                    <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>No comments yet. Be the first to share your energy.</p>
                  )}
                  {comments.map(c => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {c.user_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{c.user_name}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentUserId && (
                <div className="flex gap-2 mt-4">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                    className="input-glass flex-1 text-sm py-2"
                    placeholder="Share your thoughts..."
                    data-testid={`comment-input-${post.id}`}
                  />
                  <button onClick={submitComment} disabled={submitting || !commentText.trim()}
                    className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', color: commentText.trim() ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }}
                    data-testid={`comment-submit-${post.id}`}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Create Post Modal ---
function CreatePostForm({ authHeaders, onCreated, onClose }) {
  const [postType, setPostType] = useState('thought');
  const [content, setContent] = useState('');
  const [affirmationText, setAffirmationText] = useState('');
  const [milestoneType, setMilestoneType] = useState('day streak');
  const [milestoneValue, setMilestoneValue] = useState(7);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!content.trim()) { toast.error('Write something to share'); return; }
    setSaving(true);
    try {
      const payload = {
        post_type: postType,
        content,
        affirmation_text: postType === 'shared_affirmation' ? affirmationText : null,
        milestone_type: postType === 'milestone' ? milestoneType : null,
        milestone_value: postType === 'milestone' ? milestoneValue : null,
        ritual_data: null,
      };
      const res = await axios.post(`${API}/community/posts`, payload, { headers: authHeaders });
      onCreated(res.data);
      toast.success('Shared with the community');
    } catch { toast.error('Could not create post'); } finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Share with the Community</h3>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }} data-testid="close-create-post"><X size={18} /></button>
      </div>

      {/* Post Type Selection */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(POST_TYPE_CONFIG).map(([key, cfg]) => {
          const TypeIcon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setPostType(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: postType === key ? cfg.bg : 'transparent',
                border: `1px solid ${postType === key ? cfg.color + '30' : 'rgba(255,255,255,0.06)'}`,
                color: postType === key ? cfg.color : 'var(--text-muted)',
                transition: 'background 0.3s, border-color 0.3s, color 0.3s',
              }}
              data-testid={`post-type-${key}`}
            >
              <TypeIcon size={12} /> {cfg.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="input-glass w-full h-28 resize-none mb-4"
        placeholder={postType === 'thought' ? "Share a reflection, insight, or encouragement..." :
          postType === 'shared_affirmation' ? "Share what this affirmation means to you..." :
          postType === 'milestone' ? "Tell others about your achievement..." :
          "Describe the ritual you're sharing..."}
        data-testid="post-content-input"
      />

      {postType === 'shared_affirmation' && (
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>The Affirmation</label>
          <input
            value={affirmationText}
            onChange={(e) => setAffirmationText(e.target.value)}
            className="input-glass w-full"
            placeholder="I am connected to infinite wisdom..."
            data-testid="post-affirmation-input"
          />
        </div>
      )}

      {postType === 'milestone' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Milestone Type</label>
            <select
              value={milestoneType}
              onChange={(e) => setMilestoneType(e.target.value)}
              className="input-glass w-full"
              data-testid="milestone-type-select"
            >
              <option value="day streak">Day Streak</option>
              <option value="meditation sessions">Meditation Sessions</option>
              <option value="journal entries">Journal Entries</option>
              <option value="rituals completed">Rituals Completed</option>
              <option value="mood logs">Mood Logs</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Value</label>
            <input
              type="number"
              value={milestoneValue}
              onChange={(e) => setMilestoneValue(parseInt(e.target.value) || 0)}
              className="input-glass w-full"
              data-testid="milestone-value-input"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={submit} disabled={saving} className="btn-glass glow-primary flex items-center gap-2" data-testid="submit-post-btn"
          style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
          {saving ? 'Sharing...' : 'Share'}
        </button>
        <button onClick={onClose} className="btn-glass" style={{ background: 'transparent' }}>Cancel</button>
      </div>
    </motion.div>
  );
}

// --- User Card ---
function UserCard({ member, currentUserId, authHeaders, followingList, onFollowToggle }) {
  const isFollowing = followingList.includes(member.id);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    if (!currentUserId) { toast.error('Sign in to follow'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/community/follow/${member.id}`, {}, { headers: authHeaders });
      onFollowToggle(member.id);
    } catch { toast.error('Could not follow'); } finally { setLoading(false); }
  };

  return (
    <div className="glass-card p-4 flex items-center gap-4" data-testid={`user-card-${member.id}`}>
      <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(192,132,252,0.25), rgba(45,212,191,0.25))', color: 'var(--text-primary)' }}>
        {member.name?.charAt(0)?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {member.post_count} posts &middot; {member.follower_count} followers
        </p>
      </div>
      {currentUserId && currentUserId !== member.id && (
        <button
          onClick={toggleFollow}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: isFollowing ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isFollowing ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.1)'}`,
            color: isFollowing ? '#2DD4BF' : 'var(--text-secondary)',
            transition: 'background 0.3s, border-color 0.3s, color 0.3s',
          }}
          data-testid={`follow-btn-${member.id}`}
        >
          {isFollowing ? <><UserCheck size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
        </button>
      )}
    </div>
  );
}

// --- Main Community Page ---
export default function Community() {
  const { user, authHeaders } = useAuth();
  const [feed, setFeed] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('feed');

  const loadFeed = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/community/feed`);
      setFeed(res.data.posts || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadFeed();
    axios.get(`${API}/community/users/active`).then(res => setActiveUsers(res.data)).catch(() => {});
    if (user) {
      axios.get(`${API}/community/me/following`, { headers: authHeaders }).then(res => setFollowingList(res.data)).catch(() => {});
    }
  }, [user, authHeaders, loadFeed]);

  const handlePostCreated = (newPost) => {
    setFeed([newPost, ...feed]);
    setShowCreate(false);
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API}/community/posts/${postId}`, { headers: authHeaders });
      setFeed(feed.filter(p => p.id !== postId));
      toast.success('Post released');
    } catch { toast.error('Could not delete'); }
  };

  const handleFollowToggle = (userId) => {
    setFollowingList(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handlePostUpdate = (postId, updates) => {
    setFeed(feed.map(p => p.id === postId ? { ...p, ...updates } : p));
  };

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FDA4AF' }}>
                <Users size={14} className="inline mr-2" />
                Community
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Collective Consciousness
              </h1>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Share your journey. Inspire others. Rise together.
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="btn-glass flex items-center gap-2 mt-2"
                data-testid="create-post-btn"
              >
                <PenLine size={16} />
                Share
              </button>
            )}
          </div>
        </motion.div>

        {/* Create Post */}
        <AnimatePresence>
          {showCreate && user && (
            <CreatePostForm
              authHeaders={authHeaders}
              onCreated={handlePostCreated}
              onClose={() => setShowCreate(false)}
            />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Tab bar */}
            <div className="flex gap-2 mb-6">
              {[{ k: 'feed', l: 'Community Feed' }, { k: 'following', l: 'Following' }].map(t => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className="px-5 py-2 rounded-full text-sm"
                  style={{
                    background: tab === t.k ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: `1px solid ${tab === t.k ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    color: tab === t.k ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'background 0.3s, border-color 0.3s, color 0.3s',
                  }}
                  data-testid={`community-tab-${t.k}`}
                >
                  {t.l}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="glass-card p-12 text-center">
                <Loader2 size={24} className="animate-spin mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading community feed...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(tab === 'following' ? feed.filter(p => followingList.includes(p.user_id)) : feed).length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Users size={32} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    <p className="text-lg mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                      {tab === 'following' ? 'Follow others to see their posts here.' : 'The community space awaits its first voice.'}
                    </p>
                    {user && tab !== 'following' && (
                      <button onClick={() => setShowCreate(true)} className="btn-glass text-sm mt-4" data-testid="first-post-btn">
                        Be the first to share
                      </button>
                    )}
                  </div>
                ) : (
                  (tab === 'following' ? feed.filter(p => followingList.includes(p.user_id)) : feed).map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      authHeaders={authHeaders}
                      onDelete={handleDelete}
                      onUpdate={handlePostUpdate}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="glass-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Community Pulse</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Posts</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{feed.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Members</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{activeUsers.length}</span>
                </div>
                {user && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>You Follow</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{followingList.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Members */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Active Seekers</p>
              {activeUsers.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No active members yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeUsers.map(member => (
                    <UserCard
                      key={member.id}
                      member={member}
                      currentUserId={user?.id}
                      authHeaders={authHeaders}
                      followingList={followingList}
                      onFollowToggle={handleFollowToggle}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!user && (
              <div className="glass-card p-6 text-center">
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Join the community to share, connect, and grow together.
                </p>
                <a href="/auth" className="btn-glass text-sm inline-block" data-testid="community-signin-btn">Sign In</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
