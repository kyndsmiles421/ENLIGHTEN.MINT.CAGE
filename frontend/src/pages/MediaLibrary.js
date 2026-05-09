import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Library, Globe, Lock, Heart, Trash2, Play, Eye, Clock, Film,
  Music, Hexagon, Sparkles, Sun, Users, Star, Search, X, Share2,
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const TYPE_LABELS = {
  mix_recording: { label: 'Recording', icon: Film, color: '#EF4444' },
  live_recording: { label: 'Live Session', icon: Users, color: '#3B82F6' },
  journey: { label: 'Journey', icon: Star, color: '#F59E0B' },
  custom: { label: 'Creation', icon: Sparkles, color: '#C084FC' },
};

const LAYER_ICONS = {
  light: { icon: Sun, color: '#FCD34D' },
  video: { icon: Film, color: '#818CF8' },
  fractal: { icon: Hexagon, color: '#8B5CF6' },
  filter: { icon: Sparkles, color: '#F472B6' },
};

export default function MediaLibrary() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('media', 8); }, []);

  const { user, authHeaders } = useAuth();
  const [tab, setTab] = useState('mine');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'mine' ? '/api/media-library' : `/api/media-library/community${typeFilter ? `?media_type=${typeFilter}` : ''}`;
      const res = await axios.get(`${API}${endpoint}`, { headers: authHeaders });
      setItems(res.data);
    } catch { setItems([]); }
    setLoading(false);
  }, [tab, typeFilter, authHeaders]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.tags?.some(t => t.toLowerCase().includes(q));
  });

  const toggleLike = async (itemId) => {
    try {
      const res = await axios.post(`${API}/api/media-library/${itemId}/like`, {}, { headers: authHeaders });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, like_count: res.data.like_count, likes: res.data.liked ? [...(i.likes || []), user?.id] : (i.likes || []).filter(x => x !== user?.id) } : i));
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`${API}/api/media-library/${itemId}`, { headers: authHeaders });
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  const togglePublic = async (item) => {
    try {
      await axios.put(`${API}/api/media-library/${item.id}`, { is_public: !item.is_public }, { headers: authHeaders });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_public: !i.is_public } : i));
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  const shareItem = async (item) => {
    const url = `${window.location.origin}/media-library/${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: item.description || 'Check out this creation on ENLIGHTEN.MINT.CAFE!', url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  const formatDuration = (sec) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="min-h-screen pt-16 pb-40 px-4 sm:px-6 max-w-3xl mx-auto" data-testid="media-library-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Library size={20} style={{ color: '#C084FC' }} />
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Media Library
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Your creations, recordings, and shared experiences
        </p>
      </motion.div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {[
            { id: 'mine', label: 'My Library', icon: Lock },
            { id: 'community', label: 'Community', icon: Globe },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${tab === t.id ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)'}`,
                color: tab === t.id ? '#C084FC' : 'var(--text-muted)',
              }}
              data-testid={`library-tab-${t.id}`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search creations..."
            className="w-full pl-9 pr-9 py-2 rounded-xl text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
            data-testid="library-search" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Type filter chips (community tab) */}
      {tab === 'community' && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          <button onClick={() => setTypeFilter('')}
            className="text-[10px] px-2.5 py-1.5 rounded-full transition-all"
            style={{ background: !typeFilter ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.03)', color: !typeFilter ? '#C084FC' : 'var(--text-muted)', border: `1px solid ${!typeFilter ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
            All
          </button>
          {Object.entries(TYPE_LABELS).map(([key, meta]) => (
            <button key={key} onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
              className="text-[10px] px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1"
              style={{ background: typeFilter === key ? `${meta.color}15` : 'rgba(255,255,255,0.03)', color: typeFilter === key ? meta.color : 'var(--text-muted)', border: `1px solid ${typeFilter === key ? `${meta.color}30` : 'rgba(255,255,255,0.05)'}` }}>
              <meta.icon size={9} /> {meta.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(192,132,252,0.3)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" data-testid="library-empty">
          <Library size={40} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            {tab === 'mine' ? 'Your library is empty' : 'No creations found'}
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {tab === 'mine' ? 'Record a session in the Production Console to get started' : 'Be the first to share!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="library-grid">
          {filtered.map((item, i) => {
            const typeMeta = TYPE_LABELS[item.media_type] || TYPE_LABELS.custom;
            const TypeIcon = typeMeta.icon;
            const isLiked = (item.likes || []).includes(user?.id);
            const isOwner = item.creator_id === user?.id;

            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden group"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                data-testid={`library-item-${item.id}`}>

                {/* Visual preview */}
                <div className="h-28 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${typeMeta.color}08, rgba(0,0,0,0.3))` }}>
                  {/* Layer thumbnails */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {(item.thumbnail_layers || []).slice(0, 4).map((tl, j) => {
                      const lm = LAYER_ICONS[tl.type];
                      if (!lm) return null;
                      const LIcon = lm.icon;
                      return (
                        <div key={j} className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: 'transparent', border: `1px solid ${lm.color}40` }}>
                          <LIcon size={8} style={{ color: lm.color }} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-medium"
                    style={{ background: 'transparent', color: typeMeta.color }}>
                    <TypeIcon size={8} /> {typeMeta.label}
                  </div>
                  {/* Duration */}
                  {item.duration_seconds > 0 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[8px]"
                      style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                      <Clock size={8} /> {formatDuration(item.duration_seconds)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium mb-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-[10px] mb-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                  )}
                  {item.creator_name && tab === 'community' && (
                    <p className="text-[9px] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>by {item.creator_name}</p>
                  )}

                  {/* Tags */}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[7px] px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(192,132,252,0.06)', color: 'rgba(192,132,252,0.5)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggleLike(item.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] transition-all"
                      style={{ color: isLiked ? '#EF4444' : 'var(--text-muted)' }}
                      data-testid={`library-like-${item.id}`}>
                      <Heart size={10} className={isLiked ? 'fill-current' : ''} /> {item.like_count || 0}
                    </button>
                    <span className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      <Eye size={9} /> {item.view_count || 0}
                    </span>
                    <button onClick={() => shareItem(item)}
                      className="p-1 rounded-lg transition-all hover:bg-white/5"
                      style={{ color: 'var(--text-muted)' }}
                      data-testid={`library-share-${item.id}`}>
                      <Share2 size={10} />
                    </button>
                    {isOwner && (
                      <>
                        <button onClick={() => togglePublic(item)}
                          className="p-1 rounded-lg transition-all hover:bg-white/5 ml-auto"
                          style={{ color: item.is_public ? '#3B82F6' : 'var(--text-muted)' }}
                          data-testid={`library-toggle-public-${item.id}`}>
                          {item.is_public ? <Globe size={10} /> : <Lock size={10} />}
                        </button>
                        <button onClick={() => deleteItem(item.id)}
                          className="p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500/10"
                          style={{ color: 'var(--text-muted)' }}
                          data-testid={`library-delete-${item.id}`}>
                          <Trash2 size={10} />
                        </button>
                      </>
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
