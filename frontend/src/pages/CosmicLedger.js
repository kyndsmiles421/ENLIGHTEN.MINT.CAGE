import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Star, Shield, Heart, Eye, Brain, Swords, Flame, Crown,
  Loader2, Sparkles, Gem, Trophy, Globe, Diamond, Moon, Sun, Zap,
  Hammer, Share2, ChevronDown, Lock, Unlock, Infinity, Check,
  User, Medal, Hexagon
} from 'lucide-react';
import CrystalMintPanel from '../components/CrystalMintPanel';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_META = {
  exploration: { label: 'Exploration', color: '#C084FC', icon: Globe },
  combat: { label: 'Combat', color: '#EF4444', icon: Swords },
  crafting: { label: 'Crafting', color: '#F59E0B', icon: Hammer },
  community: { label: 'Community', color: '#EC4899', icon: Heart },
  story: { label: 'Story', color: '#818CF8', icon: Star },
  mastery: { label: 'Mastery', color: '#34D399', icon: Crown },
};

const ICON_MAP = {
  star: Star, globe: Globe, gem: Gem, orbit: Globe, swords: Swords, zap: Zap,
  shield: Shield, hammer: Hammer, crown: Crown, sparkles: Sparkles,
  share: Share2, heart: Heart, trophy: Trophy, infinity: Infinity,
  flame: Flame, diamond: Diamond, moon: Moon, sun: Sun, eye: Eye,
  droplet: Gem,
};

const ORIGIN_COLORS = {
  pleiadian: '#818CF8', sirian: '#38BDF8', arcturian: '#A855F7',
  lyran: '#F59E0B', andromedan: '#0EA5E9', orion: '#DC2626',
};

// Origin → Mixer soundscape presets
const ORIGIN_SOUNDSCAPES = {
  pleiadian: { label: 'Pleiadian Light', freq: [528, 963], sound: 'singing-bowl', drone: 'harp-drone', bpm: 60 },
  sirian: { label: 'Sirian Ocean', freq: [639, 852], sound: 'ocean', drone: 'bowl-drone', bpm: 72 },
  arcturian: { label: 'Arcturian Cosmos', freq: [741, 963], sound: 'wind', drone: 'shakuhachi-drone', bpm: 50 },
  lyran: { label: 'Lyran Fire', freq: [396, 528], sound: 'fire', drone: 'sitar-drone', bpm: 80 },
  andromedan: { label: 'Andromedan Stream', freq: [432, 639], sound: 'stream', drone: 'kalimba-drone', bpm: 65 },
  orion: { label: 'Orion Thunder', freq: [174, 396], sound: 'thunder', drone: 'didgeridoo-drone', bpm: 100 },
};

/* ─── Stat Card ─── */
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: `${color}06`, border: `1px solid ${color}10` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: `${color}12` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-light tabular-nums" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>
          {value}
        </p>
        <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </div>
  );
}

/* ─── Achievement Badge ─── */
function AchievementBadge({ achievement, earned }) {
  const AchIcon = ICON_MAP[achievement.icon] || Star;
  return (
    <motion.div
      whileHover={earned ? { scale: 1.03, y: -2 } : {}}
      className="rounded-xl p-3 flex items-center gap-2.5 transition-all"
      style={{
        background: earned ? `${achievement.color}08` : 'rgba(255,255,255,0.015)',
        border: `1px solid ${earned ? `${achievement.color}15` : 'rgba(255,255,255,0.04)'}`,
        opacity: earned ? 1 : 0.4,
      }}
      data-testid={`achievement-${achievement.id}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: earned ? `${achievement.color}15` : 'rgba(255,255,255,0.04)',
          boxShadow: earned ? `0 0 12px ${achievement.color}15` : 'none',
        }}>
        {earned ? <AchIcon size={14} style={{ color: achievement.color }} /> : <Lock size={10} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium truncate" style={{ color: earned ? achievement.color : 'var(--text-muted)' }}>
          {achievement.name}
        </p>
        <p className="text-[8px] truncate" style={{ color: 'var(--text-muted)' }}>{achievement.desc}</p>
      </div>
      {earned && <Check size={10} style={{ color: achievement.color }} />}
    </motion.div>
  );
}

/* ─── Legendary Path Card ─── */
function LegendaryPathCard({ path }) {
  const PathIcon = ICON_MAP[path.icon] || Crown;
  return (
    <motion.div
      whileHover={path.unlocked ? { scale: 1.02 } : {}}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: path.unlocked ? `linear-gradient(135deg, ${path.color}08, rgba(0,0,0,0.3))` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${path.unlocked ? `${path.color}20` : 'rgba(255,255,255,0.05)'}`,
        boxShadow: path.unlocked ? `0 0 20px ${path.color}08` : 'none',
      }}
      data-testid={`legendary-${path.id}`}>
      {path.unlocked && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 20% 30%, ${path.color}05, transparent 60%)` }} />
      )}
      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${path.color}15`, border: `1px solid ${path.color}20` }}>
          {path.unlocked ? <PathIcon size={18} style={{ color: path.color }} /> : <Lock size={14} style={{ color: 'var(--text-muted)' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-xs font-medium" style={{ color: path.unlocked ? path.color : 'var(--text-muted)' }}>
              {path.name}
            </p>
            {path.unlocked && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                style={{ background: `${path.color}12`, color: path.color }}>Unlocked</span>
            )}
          </div>
          <p className="text-[9px] mb-2" style={{ color: 'var(--text-secondary)' }}>{path.desc}</p>
          <div className="flex items-center gap-1">
            {path.progress?.map((p, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-3 h-3 rounded-full"
                  style={{
                    background: p.has >= p.required ? `${path.color}30` : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${p.has >= p.required ? `${path.color}40` : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {p.has >= p.required && <Gem size={5} className="m-auto mt-[2px]" style={{ color: path.color }} />}
                </div>
                <span className="text-[7px]" style={{ color: p.has >= p.required ? path.color : 'var(--text-muted)' }}>
                  {p.has}/{p.required}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


/* ═══════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════ */
export default function CosmicLedger() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [ledger, setLedger] = useState(null);
  const [legendaryPaths, setLegendaryPaths] = useState(null);
  const [realmLeaderboard, setRealmLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [mintPanelOpen, setMintPanelOpen] = useState(false);

  // Silent dust accrual
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 10); }, []);

  useEffect(() => {
    if (!authHeaders?.Authorization) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const [ledgerRes, pathsRes, lbRes] = await Promise.all([
          axios.get(`${API}/starseed/ledger`, { headers: authHeaders }),
          axios.get(`${API}/starseed/ledger/legendary-paths`, { headers: authHeaders }),
          axios.get(`${API}/starseed/leaderboard/realms`, { headers: authHeaders }),
        ]);
        setLedger(ledgerRes.data);
        setLegendaryPaths(pathsRes.data);
        setRealmLeaderboard(lbRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authHeaders]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  // V1.1.22 — Redirect from useEffect, not render.
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  const stats = ledger?.stats || {};
  const achievements = ledger?.achievements || {};
  const earnedSet = new Set(achievements.earned || []);
  const allAchievements = achievements.definitions || [];
  const paths = legendaryPaths?.paths || [];
  const lb = realmLeaderboard || {};

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star, color: '#C084FC' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, color: '#FCD34D' },
    { id: 'legendary', label: 'Legendary Paths', icon: Crown, color: '#F59E0B' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Medal, color: '#38BDF8' },
  ];

  const achByCategory = {};
  for (const ach of allAchievements) {
    if (!achByCategory[ach.category]) achByCategory[ach.category] = [];
    achByCategory[ach.category].push(ach);
  }

  return (
    <div className="min-h-screen pb-40 shadow-void-container" style={{ background: 'transparent', paddingTop: '70px' }} data-testid="cosmic-ledger-page">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(10,10,15,0.88)', backdropFilter: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="ledger-back">
          <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Cosmic Ledger
          </h1>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Universal Profile | {earnedSet.size}/{allAchievements.length} Achievements
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {tabs.map(t => {
            const TabIcon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: active ? `${t.color}12` : 'transparent',
                  color: active ? t.color : 'var(--text-muted)',
                  border: active ? `1px solid ${t.color}20` : '1px solid transparent',
                }}
                data-testid={`ledger-tab-${t.id}`}>
                <TabIcon size={11} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Crystal Mint Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl relative overflow-hidden cursor-pointer group"
              onClick={() => setMintPanelOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.08))',
                border: '1px solid rgba(139, 92, 246, 0.25)',
              }}
              data-testid="open-crystal-mint"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(139, 92, 246, 0.15), transparent 60%)' }} />
              
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2))' }}>
                  <Diamond size={20} style={{ color: '#C084FC' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">Crystal-QR Synthesis</p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                      style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#C4B5FD' }}>
                      NFT
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50">
                    Mint your Sovereign Mastery Certificate • Metaplex Core V1
                  </p>
                </div>
                <Hexagon size={16} className="text-purple-400/60 group-hover:text-purple-400 transition-colors" />
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <StatCard label="Total XP" value={stats.total_xp?.toLocaleString() || 0} icon={Sparkles} color="#C084FC" />
              <StatCard label="Max Level" value={stats.max_level || 1} icon={Star} color="#FCD34D" />
              <StatCard label="Origins" value={stats.unique_origins || 0} icon={Globe} color="#818CF8" />
              <StatCard label="Gems" value={stats.total_gems || 0} icon={Gem} color="#A855F7" />
              <StatCard label="Equipment" value={stats.total_equipment || 0} icon={Shield} color="#38BDF8" />
              <StatCard label="Bosses Slain" value={stats.bosses_defeated || 0} icon={Swords} color="#EF4444" />
              <StatCard label="Crafted" value={stats.crafted_items || 0} icon={Hammer} color="#F59E0B" />
              <StatCard label="Radiates Received" value={stats.radiates_received || 0} icon={Zap} color="#FCD34D" />
              <StatCard label="Radiates Given" value={stats.radiates_given || 0} icon={Heart} color="#EC4899" />
            </div>

            {/* Origins */}
            <div className="mb-6">
              <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Active Origins ({stats.unique_origins || 0}/6)
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {['pleiadian', 'sirian', 'arcturian', 'lyran', 'andromedan', 'orion'].map(o => {
                  const active = stats.origin_ids?.includes(o);
                  const color = ORIGIN_COLORS[o];
                  const soundscape = ORIGIN_SOUNDSCAPES[o];
                  return (
                    <div key={o} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg group"
                      style={{
                        background: active ? `${color}10` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${active ? `${color}20` : 'rgba(255,255,255,0.05)'}`,
                        opacity: active ? 1 : 0.35,
                      }}>
                      <Star size={9} style={{ color: active ? color : 'var(--text-muted)' }} />
                      <span className="text-[9px] font-medium capitalize" style={{ color: active ? color : 'var(--text-muted)' }}>
                        {o}
                      </span>
                      {active && soundscape && (
                        <button onClick={() => navigate(`/cosmic-mixer?origin=${o}`)}
                          className="text-[7px] ml-1 px-1.5 py-0.5 rounded-md transition-all hover:scale-105"
                          style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
                          data-testid={`origin-soundscape-${o}`}>
                          Soundscape
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: '#FCD34D' }}>
                Recent Achievements ({earnedSet.size})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allAchievements.filter(a => earnedSet.has(a.id)).slice(0, 6).map(ach => (
                  <AchievementBadge key={ach.id} achievement={ach} earned />
                ))}
                {earnedSet.size === 0 && (
                  <p className="text-xs col-span-2" style={{ color: 'var(--text-muted)' }}>
                    No achievements yet. Start exploring!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── ACHIEVEMENTS TAB ─── */}
        {tab === 'achievements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {Object.entries(achByCategory).map(([catId, achs]) => {
              const meta = CATEGORY_META[catId] || { label: catId, color: '#9CA3AF', icon: Star };
              const CatIcon = meta.icon;
              const earned = achs.filter(a => earnedSet.has(a.id)).length;
              return (
                <div key={catId} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CatIcon size={12} style={{ color: meta.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: meta.color }}>
                      {meta.label} ({earned}/{achs.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {achs.map(ach => (
                      <AchievementBadge key={ach.id} achievement={ach} earned={earnedSet.has(ach.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ─── LEGENDARY PATHS TAB ─── */}
        {tab === 'legendary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-4">
              <Crown size={12} style={{ color: '#FCD34D' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#FCD34D' }}>
                Legendary Narrative Arcs ({legendaryPaths?.unlocked_count || 0}/{paths.length})
              </span>
            </div>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Collect matching gem sets to unlock epic story arcs within your adventures. These legendary paths lead to unique encounters, lore, and rewards.
            </p>
            <div className="space-y-3">
              {paths.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <LegendaryPathCard path={p} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── LEADERBOARD TAB ─── */}
        {tab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Exploration Rankings */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={12} style={{ color: '#C084FC' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#C084FC' }}>
                  Exploration Depth
                </span>
              </div>
              {(lb.exploration || []).length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No explorers yet</p>
              ) : (
                <div className="space-y-1.5">
                  {(lb.exploration || []).map((entry, i) => {
                    const medals = ['#FCD34D', '#C0C0C0', '#CD7F32'];
                    return (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                        style={{ background: i < 3 ? `${medals[i]}08` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${i < 3 ? `${medals[i]}15` : 'rgba(255,255,255,0.05)'}` }}>
                        <span className="w-5 text-center text-[10px] font-bold"
                          style={{ color: i < 3 ? medals[i] : 'var(--text-muted)' }}>
                          {i + 1}
                        </span>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: `${ORIGIN_COLORS[entry.origin_id] || '#818CF8'}15` }}>
                          <Star size={9} style={{ color: ORIGIN_COLORS[entry.origin_id] || '#818CF8' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {entry.name}
                          </p>
                          <p className="text-[8px] capitalize" style={{ color: 'var(--text-muted)' }}>
                            {entry.origin_id} | {entry.character_name}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: '#C084FC' }}>
                          Lvl {entry.level}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Brightest Aura */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={12} style={{ color: '#FCD34D' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#FCD34D' }}>
                  Brightest Aura (Most Radiated)
                </span>
              </div>
              {(lb.brightest_aura || []).length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No radiates yet</p>
              ) : (
                <div className="space-y-1.5">
                  {(lb.brightest_aura || []).map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(252,211,77,0.03)', border: '1px solid rgba(252,211,77,0.08)' }}>
                      <span className="w-5 text-center text-[10px] font-bold" style={{ color: '#FCD34D' }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{entry.name}</p>
                        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{entry.avatar_title}</p>
                      </div>
                      <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: '#FCD34D' }}>
                        <Zap size={9} /> {entry.radiates}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most Helpful */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={12} style={{ color: '#34D399' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#34D399' }}>
                  Most Helpful (Radiates Given)
                </span>
              </div>
              {(lb.most_helpful || []).length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No helpers yet</p>
              ) : (
                <div className="space-y-1.5">
                  {(lb.most_helpful || []).map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(52,211,153,0.03)', border: '1px solid rgba(52,211,153,0.08)' }}>
                      <span className="w-5 text-center text-[10px] font-bold" style={{ color: '#34D399' }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{entry.name}</p>
                      </div>
                      <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: '#34D399' }}>
                        <Heart size={9} /> {entry.radiates_given}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* First to Enter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={12} style={{ color: '#EC4899' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#EC4899' }}>
                  First to Enter
                </span>
              </div>
              {(lb.first_to_enter || []).length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No portals claimed yet. Be the first!</p>
              ) : (
                <div className="space-y-1.5">
                  {(lb.first_to_enter || []).map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(236,72,153,0.03)', border: '1px solid rgba(236,72,153,0.08)' }}>
                      <Trophy size={12} style={{ color: '#EC4899' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium" style={{ color: '#EC4899' }}>
                          {entry.realm_id?.replace(/-/g, ' ')}
                        </p>
                        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                          First claimed by {entry.user_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Crystal Mint Panel Modal */}
      <CrystalMintPanel 
        isOpen={mintPanelOpen} 
        onClose={() => setMintPanelOpen(false)} 
      />
    </div>
  );
}
