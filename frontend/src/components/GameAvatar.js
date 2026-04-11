import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useSensory } from '../context/SensoryContext';
import {
  User, Lock, Coins, Check, Crown, Star, Zap,
  Shield, Flame, Eye, Sun, Sparkles, ChevronRight
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIER_CONFIG = {
  free: { label: 'Free', color: '#94A3B8', icon: User },
  earned: { label: 'Earned', color: '#2DD4BF', icon: Star },
  premium: { label: 'Premium', color: '#EAB308', icon: Crown },
};

const STYLE_ANIMATIONS = {
  ethereal: { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] },
  flowing: { scale: [1, 1.02, 1], rotate: [0, 2, -2, 0] },
  solid: { scale: [1, 1.01, 1] },
  pulsing: { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] },
  shimmering: { scale: [1, 1.03, 1], opacity: [0.9, 1, 0.9] },
  crystalline: { rotate: [0, 1, -1, 0], scale: [1, 1.02, 1] },
  fluid: { scale: [1, 1.04, 1], y: [0, -2, 0] },
  blazing: { scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] },
  cosmic: { scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] },
  regal: { scale: [1, 1.02, 1], y: [0, -1, 0] },
};

function AvatarOrb({ avatar, size = 64, moodColor, showAura = true, onClick, active }) {
  const { immersion } = useSensory();
  const baseColor = avatar?.aura_base || '#818CF8';
  const displayColor = moodColor || baseColor;
  const style = avatar?.style || 'ethereal';
  const anim = STYLE_ANIMATIONS[style] || STYLE_ANIMATIONS.ethereal;

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.1 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      className="relative flex-shrink-0 cursor-pointer"
      style={{ width: size, height: size }}
      data-testid={`avatar-orb-${avatar?.id || 'default'}`}
    >
      {/* Aura ring */}
      {showAura && immersion !== 'calm' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${displayColor}20, transparent 70%)`,
            filter: immersion === 'full' ? `blur(${size / 8}px)` : 'none',
          }}
          animate={immersion === 'full' ? anim : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Core orb */}
      <div className="absolute inset-2 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${displayColor}40, ${displayColor}15)`,
          border: `2px solid ${active ? displayColor : `${displayColor}30`}`,
          boxShadow: immersion === 'full'
            ? `0 0 ${size / 4}px ${displayColor}30, inset 0 0 ${size / 6}px ${displayColor}20`
            : `0 0 ${size / 8}px ${displayColor}15`,
        }}>
        <span className="text-lg font-light" style={{
          color: displayColor,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: size / 3,
        }}>
          {(avatar?.name || 'S')[0]}
        </span>
      </div>
      {/* Active indicator */}
      {active && (
        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ background: displayColor, boxShadow: `0 0 6px ${displayColor}` }} />
      )}
    </motion.div>
  );
}

export function AvatarBadge({ authHeaders, size = 36 }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    axios.get(`${API}/avatar/profile`, { headers: authHeaders })
      .then(r => setProfile(r.data))
      .catch(() => {});
  }, [authHeaders]);

  if (!profile) return null;

  return (
    <div className="flex items-center gap-2" data-testid="avatar-badge">
      <AvatarOrb avatar={profile.avatar} size={size} moodColor={profile.mood_color} showAura={false} />
      <div className="hidden sm:block">
        <p className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{profile.avatar.name}</p>
        <p className="text-[8px] capitalize" style={{ color: profile.mood_color }}>{profile.mood}</p>
      </div>
    </div>
  );
}

export default function GameAvatarPanel({ authHeaders }) {
  const [catalog, setCatalog] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [credits, setCredits] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState('');
  const { immersion } = useSensory();

  const fetchAll = useCallback(async () => {
    try {
      const [catRes, profRes] = await Promise.all([
        axios.get(`${API}/avatar/catalog`, { headers: authHeaders }),
        axios.get(`${API}/avatar/profile`, { headers: authHeaders }),
      ]);
      setCatalog(catRes.data.catalog || []);
      setActiveId(catRes.data.active_avatar);
      setCredits(catRes.data.credits);
      setProfile(profRes.data);
    } catch {}
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSelect = async (id) => {
    setActing(id);
    try {
      await axios.post(`${API}/avatar/select`, { avatar_id: id }, { headers: authHeaders });
      setActiveId(id);
      toast.success('Avatar selected!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Selection failed');
    }
    setActing('');
  };

  const handlePurchase = async (id) => {
    setActing(id);
    try {
      const res = await axios.post(`${API}/avatar/purchase`, { avatar_id: id }, { headers: authHeaders });
      toast.success(`${res.data.purchased} unlocked!`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Purchase failed');
    }
    setActing('');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(192,132,252,0.2)', borderTopColor: '#C084FC' }} />
      </div>
    );
  }

  const tiers = ['free', 'earned', 'premium'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="game-avatar-panel">
      {/* Active Avatar Display */}
      {profile && (
        <div className="text-center mb-6">
          <AvatarOrb avatar={profile.avatar} size={80} moodColor={profile.mood_color} active />
          <h3 className="text-lg font-light mt-3" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            {profile.avatar.name}
          </h3>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
              style={{ background: `${profile.mood_color}12`, color: profile.mood_color, border: `1px solid ${profile.mood_color}25` }}>
              {profile.mood}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Resonance: <span style={{ color: '#EAB308' }}>{profile.resonance_level}</span>/100
            </span>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 max-w-xs mx-auto">
            {[
              { label: 'Mixer', value: profile.stats.mixer_sessions, color: '#C084FC' },
              { label: 'Mined', value: profile.stats.specimens_mined, color: '#2DD4BF' },
              { label: 'Karma', value: profile.stats.trade_karma, color: '#EAB308' },
            ].map(s => (
              <div key={s.label} className="rounded-lg py-1.5 text-center"
                style={{ background: `${s.color}06`, border: `1px solid ${s.color}12` }}>
                <p className="text-sm font-mono font-light" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avatar Catalog by Tier */}
      {tiers.map(tier => {
        const tierCfg = TIER_CONFIG[tier];
        const tierAvatars = catalog.filter(a => a.tier === tier);
        if (tierAvatars.length === 0) return null;
        const TIcon = tierCfg.icon;

        return (
          <div key={tier} className="mb-5">
            <div className="flex items-center gap-2 mb-3 px-1">
              <TIcon size={12} style={{ color: tierCfg.color }} />
              <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: tierCfg.color }}>
                {tierCfg.label} Characters
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tierAvatars.map(av => {
                const isActive = av.id === activeId;
                const canSelect = av.unlocked && !isActive;
                const canBuy = !av.unlocked && tier === 'premium';

                return (
                  <motion.div
                    key={av.id}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl p-3 text-center relative"
                    style={{
                      background: isActive ? `${av.aura_base}08` : 'rgba(248,250,252,0.02)',
                      border: `1px solid ${isActive ? `${av.aura_base}25` : 'rgba(248,250,252,0.06)'}`,
                      opacity: av.unlocked ? 1 : 0.6,
                    }}
                    data-testid={`avatar-card-${av.id}`}
                  >
                    {!av.unlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock size={10} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <AvatarOrb avatar={av} size={48} showAura={av.unlocked} active={isActive} />
                    <p className="text-[11px] font-medium mt-2" style={{ color: av.unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {av.name}
                    </p>
                    <p className="text-[8px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {av.description}
                    </p>

                    {canSelect && (
                      <button onClick={() => handleSelect(av.id)} disabled={acting === av.id}
                        className="mt-2 w-full py-1 rounded-lg text-[9px] font-medium transition-all"
                        style={{ background: `${av.aura_base}10`, color: av.aura_base, border: `1px solid ${av.aura_base}20` }}
                        data-testid={`select-avatar-${av.id}`}>
                        {acting === av.id ? '...' : 'Select'}
                      </button>
                    )}
                    {isActive && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-[9px]" style={{ color: '#22C55E' }}>
                        <Check size={10} /> Active
                      </div>
                    )}
                    {canBuy && (
                      <button onClick={() => handlePurchase(av.id)} disabled={acting === av.id || credits < av.price_credits}
                        className="mt-2 w-full py-1 rounded-lg text-[9px] font-medium flex items-center justify-center gap-1 transition-all"
                        style={{
                          background: credits >= av.price_credits ? 'rgba(234,179,8,0.1)' : 'rgba(248,250,252,0.02)',
                          color: credits >= av.price_credits ? '#EAB308' : 'var(--text-muted)',
                          border: `1px solid ${credits >= av.price_credits ? 'rgba(234,179,8,0.2)' : 'rgba(248,250,252,0.06)'}`,
                        }}
                        data-testid={`buy-avatar-${av.id}`}>
                        <Coins size={9} /> {av.price_credits} Credits
                      </button>
                    )}
                    {!av.unlocked && tier === 'earned' && (
                      <p className="mt-2 text-[8px] italic" style={{ color: 'var(--text-muted)' }}>
                        {av.unlock_condition}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
