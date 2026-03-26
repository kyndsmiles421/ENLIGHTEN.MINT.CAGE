import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, Hash, Heart, Sparkles, Loader2, Zap, Flame, Droplets, Wind, Globe, Trophy, Sprout, BarChart3, TrendingUp } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SYSTEM_NAMES = { astrology: 'Astrology', tarot: 'Tarot', numerology: 'Numerology', cardology: 'Cardology', chinese: 'Chinese', mayan: 'Mayan' };
const SYSTEM_COLORS = { astrology: '#C084FC', tarot: '#FDA4AF', numerology: '#FCD34D', cardology: '#2DD4BF', chinese: '#EF4444', mayan: '#FB923C' };
const ENERGY_COLORS = { positive: '#22C55E', neutral: '#94A3B8', challenging: '#FB923C', transformative: '#C084FC' };

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p className="text-2xl font-light" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>{value}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function BarSection({ items, colorMap, label }) {
  if (!items || items.length === 0) return null;
  const max = Math.max(...items.map(i => i.count));
  return (
    <div className="glass-card p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="space-y-2">
        {items.map((item, i) => {
          const key = item.mood || item.element || item.crystal || item.name || item.number;
          const color = colorMap?.[key] || '#C084FC';
          const pct = max > 0 ? (item.count / max) * 100 : 0;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{key}</span>
                <span className="text-[10px] font-medium" style={{ color }}>{item.count}x</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="h-full rounded-full" style={{ background: `${color}80` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CosmicProfile() {
  const { user, authHeaders } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API}/cosmic-profile`, { headers: authHeaders });
      setProfile(res.data);
    } catch {}
    setLoading(false);
  }, [user, authHeaders]);

  useEffect(() => { load(); }, [load]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card p-12 text-center">
        <Star size={32} style={{ color: 'rgba(192,132,252,0.3)', margin: '0 auto 12px' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to view your cosmic profile.</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
    </div>
  );

  if (!profile) return null;

  const domColor = SYSTEM_COLORS[profile.dominant_system] || '#C084FC';

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" data-testid="cosmic-profile-page">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: domColor }}>
            <BarChart3 size={14} className="inline mr-2" />Cosmic Profile
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your Cosmic Fingerprint
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Patterns emerging from your readings, meditations, and cosmic explorations.
          </p>
        </motion.div>

        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Star} label="Forecasts" value={profile.total_forecasts} color="#C084FC" sub={profile.dominant_system ? `Favors ${SYSTEM_NAMES[profile.dominant_system]}` : null} />
          <StatCard icon={Zap} label="Avg Energy" value={profile.avg_cosmic_energy ? `${profile.avg_cosmic_energy}/10` : '—'} color="#FCD34D" sub={profile.dominant_energy_type !== 'neutral' ? `Mostly ${profile.dominant_energy_type}` : null} />
          <StatCard icon={Sparkles} label="Meditations" value={profile.constellation_meditations?.total || 0} color="#2DD4BF" sub={profile.constellation_meditations?.total_minutes ? `${profile.constellation_meditations.total_minutes} min total` : null} />
          <StatCard icon={Trophy} label="Level" value={profile.gamification?.level || 1} color="#FB923C" sub={`${profile.gamification?.xp || 0} XP · ${profile.gamification?.streak || 0}d streak`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* System breakdown */}
          {Object.keys(profile.system_counts || {}).length > 0 && (
            <BarSection
              label="Divination Systems Used"
              items={Object.entries(profile.system_counts).map(([k, v]) => ({ name: SYSTEM_NAMES[k] || k, count: v }))}
              colorMap={Object.fromEntries(Object.entries(SYSTEM_NAMES).map(([k, v]) => [v, SYSTEM_COLORS[k]]))}
            />
          )}

          {/* Energy patterns */}
          {Object.values(profile.section_energies || {}).some(v => v > 0) && (
            <BarSection
              label="Energy Patterns"
              items={Object.entries(profile.section_energies).filter(([, v]) => v > 0).map(([k, v]) => ({ mood: k, count: v }))}
              colorMap={ENERGY_COLORS}
            />
          )}

          {/* Mood patterns */}
          {profile.mood_patterns?.length > 0 && (
            <BarSection label="Recent Mood Patterns" items={profile.mood_patterns} colorMap={{}} />
          )}

          {/* Top constellations */}
          {profile.constellation_meditations?.top_constellations?.length > 0 && (
            <BarSection label="Favorite Constellations" items={profile.constellation_meditations.top_constellations} colorMap={{}} />
          )}
        </div>

        {/* Recurring cosmic elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Lucky numbers */}
          {profile.recurring_numbers?.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Hash size={14} style={{ color: '#FCD34D' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Recurring Numbers</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.recurring_numbers.map((n, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg text-center" style={{ background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.12)' }}>
                    <span className="text-lg font-light" style={{ color: '#FCD34D', fontFamily: 'Cormorant Garamond, serif' }}>{n.number}</span>
                    <span className="block text-[9px]" style={{ color: 'var(--text-muted)' }}>{n.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crystals */}
          {profile.recurring_crystals?.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={14} style={{ color: '#2DD4BF' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cosmic Crystals</span>
              </div>
              <div className="space-y-2">
                {profile.recurring_crystals.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
                    <span className="text-xs capitalize" style={{ color: '#2DD4BF' }}>{c.crystal}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Elements */}
          {profile.recurring_elements?.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} style={{ color: '#FB923C' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Elemental Affinity</span>
              </div>
              <div className="space-y-2">
                {profile.recurring_elements.map((e, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{ background: 'rgba(251,146,60,0.04)', border: '1px solid rgba(251,146,60,0.08)' }}>
                    <span className="text-xs capitalize" style={{ color: '#FB923C' }}>{e.element}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{e.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Garden stats */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sprout size={14} style={{ color: '#22C55E' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Zen Garden</span>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xl font-light" style={{ color: '#22C55E', fontFamily: 'Cormorant Garamond, serif' }}>{profile.garden?.plants || 0}</span>
              <span className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>plants</span>
            </div>
            <div>
              <span className="text-xl font-light" style={{ color: '#22C55E', fontFamily: 'Cormorant Garamond, serif' }}>{profile.garden?.total_waters || 0}</span>
              <span className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>total waters</span>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {profile.total_forecasts === 0 && (
          <div className="glass-card p-12 text-center mt-8">
            <TrendingUp size={28} style={{ color: 'rgba(192,132,252,0.3)', margin: '0 auto 12px' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your cosmic fingerprint grows with each forecast and meditation.</p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Generate forecasts and explore constellations to build your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
