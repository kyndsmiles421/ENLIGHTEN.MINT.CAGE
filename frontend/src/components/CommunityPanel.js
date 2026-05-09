import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Ghost, User, Users, MessageSquare, Send, Shield, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';
import { scanContent } from '../utils/sentinel';

const API = process.env.REACT_APP_BACKEND_URL;

const IDENTITY_ICONS = {
  full: User,
  avatar: Eye,
  ghost: Ghost,
};

const IDENTITY_COLORS = {
  full: '#22C55E',
  avatar: '#818CF8',
  ghost: '#6B7280',
};

export default function CommunityPanel({ isOpen, onClose }) {
  const { token, authHeaders } = useAuth();
  const { activeClass } = useClass();
  const [identity, setIdentity] = useState(null);
  const [channels, setChannels] = useState({ guilds: [], feeds: [] });
  const [activeFeed, setActiveFeed] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchIdentity = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/guilds/identity`, { headers: authHeaders });
      const data = await res.json();
      setIdentity(data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  const fetchChannels = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/guilds/channels`, { headers: authHeaders });
      const data = await res.json();
      setChannels(data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  const fetchPosts = useCallback(async (feedId) => {
    try {
      const res = await fetch(`${API}/api/guilds/feed/${feedId}/posts`, {
        headers: token ? authHeaders : {},
      });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  useEffect(() => {
    if (!isOpen) return;
    fetchIdentity();
    fetchChannels();
  }, [isOpen, fetchIdentity, fetchChannels]);

  useEffect(() => {
    if (activeFeed) fetchPosts(activeFeed);
  }, [activeFeed, fetchPosts]);

  const updateIdentity = async (updates) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/guilds/identity`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setIdentity(data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  const handlePost = async () => {
    if (!postText.trim() || !activeFeed || !token) return;
    setPosting(true);
    setScanError(null);

    // Sentinel scan before posting
    const scan = await scanContent(postText, 'feed', authHeaders);
    if (!scan.clean && scan.blocked) {
      setScanError(scan.message || 'Content blocked by Sentinel');
      setPosting(false);
      return;
    }

    try {
      await fetch(`${API}/api/guilds/feed/${activeFeed}/post`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: postText.trim() }),
      });
      setPostText('');
      fetchPosts(activeFeed);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setPosting(false);
  };

  const joinFeed = async (feedId) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/guilds/feed/${feedId}/join`, {
        method: 'POST',
        headers: authHeaders,
      });
      setActiveFeed(feedId);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  if (!isOpen) return null;

  const currentMode = identity?.mode || 'full';
  const ModeIcon = IDENTITY_ICONS[currentMode] || User;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(11,12,21,0.97)',
        border: '1px solid rgba(192,132,252,0.1)',
        maxHeight: '70vh',
      }}
      data-testid="community-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: '#C084FC' }} />
          <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>Community</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5" data-testid="community-close">
          <X size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 48px)' }}>
        {/* Identity Controls */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Shield size={10} style={{ color: 'rgba(255,255,255,0.65)' }} />
            <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.65)' }}>Identity Mode</span>
          </div>

          <div className="flex gap-1.5 mb-2" data-testid="identity-mode-selector">
            {['full', 'avatar', 'ghost'].map(mode => {
              const Icon = IDENTITY_ICONS[mode];
              const active = currentMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => updateIdentity({ mode })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
                  style={{
                    background: active ? `${IDENTITY_COLORS[mode]}12` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${active ? `${IDENTITY_COLORS[mode]}30` : 'rgba(255,255,255,0.04)'}`,
                    color: active ? IDENTITY_COLORS[mode] : 'rgba(255,255,255,0.65)',
                    cursor: 'pointer',
                  }}
                  data-testid={`identity-mode-${mode}`}
                >
                  <Icon size={11} />
                  <span className="text-[9px] capitalize">{mode}</span>
                </button>
              );
            })}
          </div>

          {identity?.mode_data && (
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {identity.mode_data.description}
            </p>
          )}

          {/* Mic/Video toggles (only for full/avatar modes) */}
          {currentMode !== 'ghost' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateIdentity({ mic_enabled: !identity?.mic_enabled })}
                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{
                  background: identity?.mic_enabled ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${identity?.mic_enabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  color: identity?.mic_enabled ? '#22C55E' : '#EF4444',
                  cursor: 'pointer',
                }}
                data-testid="toggle-mic"
              >
                {identity?.mic_enabled ? <Mic size={10} /> : <MicOff size={10} />}
                <span className="text-[8px]">{identity?.mic_enabled ? 'On' : 'Off'}</span>
              </button>
              <button
                onClick={() => updateIdentity({ video_enabled: !identity?.video_enabled })}
                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{
                  background: identity?.video_enabled ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${identity?.video_enabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  color: identity?.video_enabled ? '#22C55E' : '#EF4444',
                  cursor: 'pointer',
                }}
                data-testid="toggle-video"
              >
                {identity?.video_enabled ? <Video size={10} /> : <VideoOff size={10} />}
                <span className="text-[8px]">{identity?.video_enabled ? 'On' : 'Off'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Guild Channels (class-based) */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Guild Channels
          </div>
          <div className="space-y-1.5">
            {channels.guilds?.map(guild => (
              <button
                key={guild.id}
                onClick={() => guild.accessible && joinFeed(guild.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all"
                style={{
                  background: activeFeed === guild.id ? `${guild.color}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeFeed === guild.id ? `${guild.color}25` : 'rgba(255,255,255,0.04)'}`,
                  opacity: guild.accessible ? 1 : 0.4,
                  cursor: guild.accessible ? 'pointer' : 'not-allowed',
                }}
                data-testid={`guild-${guild.class_id}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: guild.color }} />
                  <span className="text-[10px]" style={{ color: activeFeed === guild.id ? guild.color : 'rgba(255,255,255,0.75)' }}>
                    {guild.name}
                  </span>
                </div>
                <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {guild.member_count || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Widget Feed Channels */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Widget Feeds
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {channels.feeds?.map(feed => (
              <button
                key={feed.id}
                onClick={() => joinFeed(feed.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{
                  background: activeFeed === feed.id ? `${feed.color}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeFeed === feed.id ? `${feed.color}25` : 'rgba(255,255,255,0.04)'}`,
                  cursor: 'pointer',
                }}
                data-testid={`feed-${feed.widget}`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: feed.color }} />
                <span className="text-[9px]" style={{ color: activeFeed === feed.id ? feed.color : 'rgba(255,255,255,0.7)' }}>
                  {feed.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Feed Posts */}
        {activeFeed && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <MessageSquare size={10} style={{ color: '#C084FC' }} />
              <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.65)' }}>Feed</span>
            </div>

            {/* Post Input */}
            {token && currentMode !== 'ghost' && (
              <div className="mb-3">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={postText}
                    onChange={e => { setPostText(e.target.value); setScanError(null); }}
                    placeholder="Share with the collective..."
                    maxLength={500}
                    className="flex-1 px-3 py-2 rounded-lg text-[10px] outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${scanError ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      color: '#F8FAFC',
                    }}
                    data-testid="feed-post-input"
                    onKeyDown={e => e.key === 'Enter' && handlePost()}
                  />
                  <button
                    onClick={handlePost}
                    disabled={posting || !postText.trim()}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background: 'rgba(192,132,252,0.1)',
                      border: '1px solid rgba(192,132,252,0.15)',
                      color: '#C084FC',
                      opacity: (posting || !postText.trim()) ? 0.4 : 1,
                      cursor: (posting || !postText.trim()) ? 'not-allowed' : 'pointer',
                    }}
                    data-testid="feed-post-submit"
                  >
                    <Send size={11} />
                  </button>
                </div>
                {scanError && (
                  <p className="text-[8px] mt-1" style={{ color: '#EF4444' }} data-testid="feed-scan-error">
                    {scanError}
                  </p>
                )}
                {currentMode === 'avatar' && (
                  <p className="text-[8px] mt-1" style={{ color: 'rgba(129,140,248,0.4)' }}>
                    Posting as Avatar
                  </p>
                )}
              </div>
            )}

            {currentMode === 'ghost' && token && (
              <p className="text-[9px] text-center py-2 mb-2 rounded-lg"
                style={{ background: 'rgba(107,114,128,0.06)', color: '#6B7280' }}>
                Ghost mode: viewing only
              </p>
            )}

            {/* Posts List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {posts.length === 0 ? (
                <p className="text-[10px] text-center py-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  No posts yet. Be the first to share.
                </p>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}
                    data-testid="feed-post-item"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-medium" style={{
                        color: post.identity_mode === 'avatar' ? '#818CF8' : 'rgba(255,255,255,0.75)'
                      }}>
                        {post.user_name}
                      </span>
                      <span className="text-[7px]" style={{ color: 'rgba(248,250,252,0.15)' }}>
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {post.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
