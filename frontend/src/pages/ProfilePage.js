import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Settings, Camera, Music, Palette, Save, Eye, Loader2, X, Quote, Globe, Lock, Users, Shield, MessageCircle, Share2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AVATAR_STYLES = [
  { id: 'purple-teal', colors: ['#C084FC', '#2DD4BF'] },
  { id: 'gold-rose', colors: ['#FCD34D', '#FDA4AF'] },
  { id: 'blue-green', colors: ['#3B82F6', '#22C55E'] },
  { id: 'fire-orange', colors: ['#EF4444', '#FB923C'] },
  { id: 'ocean-deep', colors: ['#06B6D4', '#8B5CF6'] },
  { id: 'forest-earth', colors: ['#22C55E', '#92400E'] },
  { id: 'cosmic-pink', colors: ['#D8B4FE', '#FDA4AF'] },
  { id: 'midnight', colors: ['#1E3A5F', '#4B0082'] },
];

const THEME_COLORS = [
  { id: '#D8B4FE', name: 'Amethyst' },
  { id: '#2DD4BF', name: 'Teal' },
  { id: '#FCD34D', name: 'Gold' },
  { id: '#FDA4AF', name: 'Rose' },
  { id: '#86EFAC', name: 'Jade' },
  { id: '#3B82F6', name: 'Sapphire' },
  { id: '#FB923C', name: 'Amber' },
  { id: '#8B5CF6', name: 'Violet' },
  { id: '#F87171', name: 'Ruby' },
  { id: '#E879F9', name: 'Fuchsia' },
];

const MUSIC_OPTIONS = [
  { id: 'none', name: 'Silence', freq: 0 },
  { id: '174hz', name: '174 Hz - Foundation', freq: 174 },
  { id: '432hz', name: '432 Hz - Harmony', freq: 432 },
  { id: '528hz', name: '528 Hz - Love', freq: 528 },
  { id: '639hz', name: '639 Hz - Connection', freq: 639 },
  { id: '852hz', name: '852 Hz - Intuition', freq: 852 },
  { id: '963hz', name: '963 Hz - Divine', freq: 963 },
];

function TonePlayer({ frequency, playing }) {
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    if (playing && frequency > 0) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      oscRef.current = audioCtxRef.current.createOscillator();
      gainRef.current = audioCtxRef.current.createGain();
      oscRef.current.type = 'sine';
      oscRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
      gainRef.current.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
      oscRef.current.connect(gainRef.current);
      gainRef.current.connect(audioCtxRef.current.destination);
      oscRef.current.start();
    }
    return () => {
      if (oscRef.current) { try { oscRef.current.stop(); } catch {} }
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} }
    };
  }, [playing, frequency]);

  return null;
}

function AvatarDisplay({ style, size = 80, name = '?' }) {
  const avatarStyle = AVATAR_STYLES.find(a => a.id === style) || AVATAR_STYLES[0];
  return (
    <div className="rounded-full flex items-center justify-center font-bold"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${avatarStyle.colors[0]}, ${avatarStyle.colors[1]})`,
        fontSize: size * 0.35,
        color: 'white',
        boxShadow: `0 0 ${size / 3}px ${avatarStyle.colors[0]}40`,
      }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const { user, authHeaders } = useAuth();
  const [profile, setProfile] = useState(null);
  const [covers, setCovers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const isOwnProfile = !userId || (user && userId === user.id);

  useEffect(() => {
    axios.get(`${API}/profile/covers`).then(r => setCovers(r.data)).catch(() => {});
    if (userId && (!user || userId !== user.id)) {
      // Viewing someone else's public profile
      axios.get(`${API}/profile/public/${userId}`)
        .then(r => { setProfile(r.data); setDraft(r.data); })
        .catch(() => toast.error('Profile not found'))
        .finally(() => setLoading(false));
    } else if (user) {
      axios.get(`${API}/profile/me`, { headers: authHeaders })
        .then(r => { setProfile(r.data); setDraft(r.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, authHeaders, userId]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/profile/customize`, draft, { headers: authHeaders });
      setProfile({ ...profile, ...res.data });
      setEditing(false);
      toast.success('Profile updated');
    } catch { toast.error('Could not save'); } finally { setSaving(false); }
  };

  const update = (key, val) => setDraft({ ...draft, [key]: val });

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}><Loader2 className="animate-spin" style={{ color: 'var(--text-muted)' }} /></div>;
  if (!user && !userId) return <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'transparent' }}><div className="text-center"><h2 className="text-3xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Begin your journey to customize your profile</h2><a href="/auth" className="btn-glass" data-testid="profile-signin">Begin Journey</a></div></div>;

  // Restricted profile view
  if (profile?.restricted) {
    const themeColor = profile.theme_color || '#D8B4FE';
    const VisIcon = profile.visibility === 'private' ? Lock : Users;
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'transparent' }} data-testid="restricted-profile">
        <div className="p-12 text-center max-w-md">
          <AvatarDisplay style={profile.avatar_style} size={80} name={profile.display_name || '?'} />
          <h2 className="text-2xl font-light mt-6 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {profile.display_name}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <VisIcon size={14} style={{ color: themeColor }} />
            <span className="text-xs" style={{ color: themeColor }}>
              {profile.visibility === 'private' ? 'Private Profile' : 'Friends Only'}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.message}</p>
        </div>
      </div>
    );
  }

  const p = editing ? draft : (profile || {});
  const themeColor = p.theme_color || '#D8B4FE';

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <TonePlayer frequency={p.music_frequency || 0} playing={musicPlaying && p.music_choice !== 'none'} />

      {/* Cover Photo */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img src={p.cover_image || covers[0]?.url} alt="Cover" className="w-full h-full object-cover" style={{ filter: 'brightness(0.7)' }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, var(--bg-default) 100%)` }} />
        {editing && (
          <button onClick={() => {}} className="absolute top-4 right-4 btn-glass text-xs flex items-center gap-2" data-testid="change-cover-btn">
            <Camera size={14} /> Change Cover
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        {/* Avatar + Name */}
        <div className="flex items-end gap-6 mb-8">
          <div className="relative">
            <AvatarDisplay style={p.avatar_style} size={120} name={p.display_name || p.name || user?.name || '?'} />
            {p.vibe_status && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs whitespace-nowrap"
                style={{ background: `${themeColor}20`, border: `1px solid ${themeColor}30`, color: themeColor }}>
                {p.vibe_status}
              </div>
            )}
          </div>
          <div className="pb-2 flex-1">
            <div className="flex items-center justify-between">
              <div>
                {editing ? (
                  <input value={draft.display_name || ''} onChange={(e) => update('display_name', e.target.value)}
                    className="input-glass text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', padding: '4px 8px' }}
                    placeholder="Display Name" data-testid="edit-display-name" />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {p.display_name || p.name || user?.name}
                    {isOwnProfile && p.visibility && p.visibility !== 'public' && (
                      <span className="inline-flex items-center gap-1 ml-3 text-xs px-2 py-0.5 rounded-full align-middle"
                        style={{ background: p.visibility === 'private' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', color: p.visibility === 'private' ? '#EF4444' : '#3B82F6', border: `1px solid ${p.visibility === 'private' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}` }}
                        data-testid="visibility-badge">
                        {p.visibility === 'private' ? <Lock size={10} /> : <Users size={10} />}
                        {p.visibility === 'private' ? 'Private' : 'Friends'}
                      </span>
                    )}
                  </h1>
                )}
              </div>
              <div className="flex gap-2">
                {isOwnProfile && (
                  <button onClick={async () => {
                    const shareData = {
                      title: `${p.display_name || user?.name}'s Sanctuary — The ENLIGHTEN.MINT.CAFE`,
                      text: `Check out my cosmic sanctuary on The ENLIGHTEN.MINT.CAFE! ${p.bio || ''}`.trim(),
                      url: `${window.location.origin}/profile/${user?.id}`,
                    };
                    if (navigator.share) {
                      try { await navigator.share(shareData); } catch {}
                    } else {
                      await navigator.clipboard.writeText(shareData.url);
                      toast.success('Profile link copied to clipboard');
                    }
                  }}
                    className="btn-glass px-3 py-2 text-xs flex items-center gap-1.5"
                    style={{ color: 'var(--text-muted)' }}
                    data-testid="share-profile-btn">
                    <Share2 size={14} /> Share
                  </button>
                )}
                {isOwnProfile && p.music_choice !== 'none' && (
                  <button onClick={() => setMusicPlaying(!musicPlaying)}
                    className="btn-glass px-3 py-2 text-xs flex items-center gap-1.5"
                    style={{ borderColor: musicPlaying ? `${themeColor}40` : 'rgba(255,255,255,0.1)', color: musicPlaying ? themeColor : 'var(--text-muted)' }}
                    data-testid="music-toggle-btn">
                    <Music size={14} /> {musicPlaying ? `${p.music_frequency}Hz` : 'Play Music'}
                  </button>
                )}
                {isOwnProfile && (
                  <button onClick={() => editing ? save() : setEditing(true)}
                    className="btn-glass px-4 py-2 text-xs flex items-center gap-1.5"
                    style={{ borderColor: editing ? `${themeColor}40` : 'rgba(255,255,255,0.1)' }}
                    data-testid="edit-profile-btn">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : editing ? <Save size={14} /> : <Settings size={14} />}
                    {saving ? 'Saving...' : editing ? 'Save Profile' : 'Edit Profile'}
                  </button>
                )}
                {editing && (
                  <button onClick={() => { setEditing(false); setDraft(profile); }} className="btn-glass px-3 py-2 text-xs" data-testid="cancel-edit-btn">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Panel */}
        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
              <div className="p-6 space-y-6">
                {/* Cover Selection */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Cover Photo</p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {covers.map(c => (
                      <button key={c.id} onClick={() => update('cover_image', c.url)}
                        className="h-16 rounded-lg overflow-hidden"
                        style={{ border: draft.cover_image === c.url ? `2px solid ${themeColor}` : '2px solid transparent', opacity: draft.cover_image === c.url ? 1 : 0.6, transition: 'opacity 0.3s, border-color 0.3s' }}
                        data-testid={`cover-${c.id}`}>
                        <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                {/* Avatar Style */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Avatar Style</p>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_STYLES.map(a => (
                      <button key={a.id} onClick={() => update('avatar_style', a.id)}
                        className="w-12 h-12 rounded-full"
                        style={{ background: `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`, border: draft.avatar_style === a.id ? '3px solid white' : '3px solid transparent', transition: 'border-color 0.3s' }}
                        data-testid={`avatar-${a.id}`} />
                    ))}
                  </div>
                </div>
                {/* Theme Color */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}><Palette size={12} className="inline mr-1" /> Theme Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {THEME_COLORS.map(c => (
                      <button key={c.id} onClick={() => update('theme_color', c.id)}
                        className="w-8 h-8 rounded-full" title={c.name}
                        style={{ background: c.id, border: draft.theme_color === c.id ? '3px solid white' : '3px solid transparent', boxShadow: draft.theme_color === c.id ? `0 0 15px ${c.id}40` : 'none', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                        data-testid={`theme-${c.name.toLowerCase()}`} />
                    ))}
                  </div>
                </div>
                {/* Bio */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Bio</p>
                  <textarea value={draft.bio || ''} onChange={(e) => update('bio', e.target.value)}
                    className="input-glass w-full h-24 resize-none" placeholder="Tell the world about your spiritual journey..." data-testid="edit-bio" />
                </div>
                {/* Vibe Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Vibe Status</p>
                    <input value={draft.vibe_status || ''} onChange={(e) => update('vibe_status', e.target.value)}
                      className="input-glass w-full" placeholder="Radiating peace..." data-testid="edit-vibe" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Favorite Quote</p>
                    <input value={draft.favorite_quote || ''} onChange={(e) => update('favorite_quote', e.target.value)}
                      className="input-glass w-full" placeholder="Be the change..." data-testid="edit-quote" />
                  </div>
                </div>
                {/* Music */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}><Music size={12} className="inline mr-1" /> Personal Music (Frequency Tone)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {MUSIC_OPTIONS.map(m => (
                      <button key={m.id} onClick={() => { update('music_choice', m.id); update('music_frequency', m.freq); }}
                        className="p-3 text-sm text-center"
                        style={{ borderColor: draft.music_choice === m.id ? `${themeColor}40` : 'rgba(255,255,255,0.08)', color: draft.music_choice === m.id ? themeColor : 'var(--text-muted)', transition: 'border-color 0.3s, color 0.3s' }}
                        data-testid={`music-${m.id}`}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Profile Visibility */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}><Shield size={12} className="inline mr-1" /> Profile Visibility</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'public', label: 'Public', icon: Globe, desc: 'Anyone can see your profile', color: '#22C55E' },
                      { id: 'friends', label: 'Friends Only', icon: Users, desc: 'Only mutual followers can see', color: '#3B82F6' },
                      { id: 'private', label: 'Private', icon: Lock, desc: 'Only you can see your profile', color: '#EF4444' },
                    ].map(v => {
                      const VIcon = v.icon;
                      const sel = (draft.visibility || 'public') === v.id;
                      return (
                        <button key={v.id} onClick={() => update('visibility', v.id)}
                          className="p-4 text-left transition-all"
                          style={{ borderColor: sel ? `${v.color}40` : 'rgba(255,255,255,0.06)' }}
                          data-testid={`visibility-${v.id}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <VIcon size={14} style={{ color: sel ? v.color : 'var(--text-muted)' }} />
                            <span className="text-sm font-medium" style={{ color: sel ? v.color : 'var(--text-secondary)' }}>{v.label}</span>
                          </div>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{v.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Message Privacy */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}><MessageCircle size={12} className="inline mr-1" /> Who Can Message You</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'everyone', label: 'Everyone', icon: Globe, desc: 'Any user on the platform', color: '#22C55E' },
                      { id: 'friends_only', label: 'Friends Only', icon: Users, desc: 'Only your friends can message', color: '#3B82F6' },
                      { id: 'nobody', label: 'Nobody', icon: Lock, desc: 'Disable all messages', color: '#EF4444' },
                    ].map(v => {
                      const VIcon = v.icon;
                      const sel = (draft.message_privacy || 'everyone') === v.id;
                      return (
                        <button key={v.id} onClick={() => update('message_privacy', v.id)}
                          className="p-4 text-left transition-all"
                          style={{ borderColor: sel ? `${v.color}40` : 'rgba(255,255,255,0.06)' }}
                          data-testid={`msg-privacy-${v.id}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <VIcon size={14} style={{ color: sel ? v.color : 'var(--text-muted)' }} />
                            <span className="text-sm font-medium" style={{ color: sel ? v.color : 'var(--text-secondary)' }}>{v.label}</span>
                          </div>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{v.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-16">
          {/* Left - Bio & Quote */}
          <div className="md:col-span-2 space-y-6">
            {p.bio && (
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: themeColor }}>About</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.bio}</p>
              </div>
            )}
            {p.favorite_quote && (
              <div className="p-6" style={{ borderColor: `${themeColor}15` }}>
                <Quote size={20} style={{ color: themeColor, opacity: 0.4 }} className="mb-3" />
                <p className="text-xl font-light italic" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                  "{p.favorite_quote}"
                </p>
              </div>
            )}
            {!p.bio && !p.favorite_quote && !editing && (
              <div className="p-8 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {isOwnProfile ? 'Click "Edit Profile" to add your bio, favorite quote, cover photo, and personal music.' : 'This user hasn\'t customized their profile yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Right - Stats */}
          <div className="space-y-6">
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Customization</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Theme</span>
                  <div className="w-4 h-4 rounded-full" style={{ background: themeColor, boxShadow: `0 0 10px ${themeColor}40` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Music</span>
                  <span style={{ color: 'var(--text-muted)' }}>{p.music_choice === 'none' ? 'Off' : `${p.music_frequency}Hz`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Avatar</span>
                  <AvatarDisplay style={p.avatar_style} size={24} name={p.display_name || p.name || user?.name || '?'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
