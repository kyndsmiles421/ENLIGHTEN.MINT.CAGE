import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import {
  ArrowLeft, Mountain, Droplets, Flame, Wind, MapPin, User, Lock,
  Compass, Zap, Star, Eye, ChevronRight, Sparkles, ArrowRightLeft,
  MessageCircle, Package, Globe
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const U_ICONS = { terrestrial: Mountain, ethereal: Droplets, astral: Flame, void: Wind };

// ── Region Node ──
function RegionNode({ region, color, onExplore, onNpcTalk, isActive }) {
  const discovered = region.discovered;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.random() * 0.3 }}
      style={{ cursor: discovered ? 'pointer' : 'default' }}
      onClick={() => discovered ? onExplore(region.id) : null}
      data-testid={`region-${region.id}`}>
      {/* Node circle */}
      <circle
        cx={`${region.x}%`} cy={`${region.y}%`}
        r={discovered ? 14 : 8}
        fill={discovered ? `${color}30` : 'rgba(100,100,100,0.15)'}
        stroke={discovered ? color : 'rgba(100,100,100,0.3)'}
        strokeWidth={isActive ? 2.5 : 1}
        className="transition-all" />
      {/* Portal indicator */}
      {region.type === 'portal' && discovered && (
        <circle cx={`${region.x}%`} cy={`${region.y}%`} r={18}
          fill="none" stroke={color} strokeWidth={0.5} strokeDasharray="3 3"
          className="animate-spin" style={{ animationDuration: '8s', transformOrigin: `${region.x}% ${region.y}%` }} />
      )}
      {/* Nexus indicator */}
      {region.type === 'nexus' && discovered && (
        <>
          <circle cx={`${region.x}%`} cy={`${region.y}%`} r={20} fill="none" stroke="#F59E0B" strokeWidth={0.5} strokeDasharray="2 4" />
          <circle cx={`${region.x}%`} cy={`${region.y}%`} r={24} fill="none" stroke="#A855F7" strokeWidth={0.3} strokeDasharray="1 5" />
        </>
      )}
      {/* Icon */}
      {!discovered && (
        <text x={`${region.x}%`} y={`${region.y}%`} textAnchor="middle" dominantBaseline="central"
          fill="rgba(100,100,100,0.5)" fontSize="8">?</text>
      )}
      {discovered && region.has_npc && (
        <circle cx={`${region.x + 3}%`} cy={`${region.y - 3}%`} r={4}
          fill="#F59E0B" stroke="#1a1a2e" strokeWidth={1} />
      )}
      {/* Label */}
      {discovered && (
        <text x={`${region.x}%`} y={`${region.y + 6}%`} textAnchor="middle"
          fill={color} fontSize="6" fontWeight="500">{region.name}</text>
      )}
    </motion.g>
  );
}

// ── Universe Card ──
function UniverseSelector({ universe, isActive, onClick }) {
  const Icon = U_ICONS[universe.id] || Globe;
  return (
    <motion.button whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative rounded-xl p-3 text-left transition-all w-full"
      style={{
        background: isActive ? `${universe.color}10` : 'rgba(255,255,255,0.015)',
        border: `1px solid ${isActive ? `${universe.color}25` : 'rgba(255,255,255,0.04)'}`,
      }}
      data-testid={`universe-${universe.id}`}>
      {universe.is_ascendant && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: '#F59E0B', fontSize: '7px' }}>
          <Star size={8} color="#fff" />
        </span>
      )}
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color: universe.color }} />
        <span className="text-[10px] font-semibold" style={{ color: isActive ? universe.color : 'var(--text-primary)' }}>
          {universe.name}
        </span>
      </div>
      <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{universe.subtitle}</p>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
          {universe.discovered_count}/{universe.total_regions}
        </span>
        <div className="flex items-center gap-1">
          <Sparkles size={7} style={{ color: universe.color }} />
          <span className="text-[7px]" style={{ color: universe.color }}>{universe.resonance}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ── Ripple Feed Item ──
function RippleItem({ ripple }) {
  const srcColor = UNIVERSES[ripple.source_universe]?.color || '#818CF8';
  const tgtColor = UNIVERSES[ripple.target_universe]?.color || '#818CF8';
  return (
    <div className="flex items-start gap-2 py-1.5">
      <ArrowRightLeft size={10} className="mt-0.5 flex-shrink-0" style={{ color: srcColor }} />
      <div className="min-w-0">
        <p className="text-[8px]" style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: srcColor }}>{UNIVERSES[ripple.source_universe]?.name || ripple.source_universe}</span>
          {' '}<span style={{ color: 'var(--text-muted)' }}>→</span>{' '}
          <span style={{ color: tgtColor }}>{UNIVERSES[ripple.target_universe]?.name || ripple.target_universe}</span>
        </p>
        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
          {ripple.detail || ripple.description}
        </p>
      </div>
    </div>
  );
}

// Static reference for colors in RippleItem
const UNIVERSES = {
  terrestrial: { name: 'Terrestrial', color: '#22C55E' },
  ethereal: { name: 'Ethereal', color: '#3B82F6' },
  astral: { name: 'Astral', color: '#F59E0B' },
  void: { name: 'Void', color: '#A855F7' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function MultiverseMap() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('multiverse', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const headers = authHeaders;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUniverse, setActiveUniverse] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [exploring, setExploring] = useState(false);
  const [showRipples, setShowRipples] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/multiverse/state`, { headers });
      setData(res.data);
      if (!activeUniverse) setActiveUniverse(res.data.current_universe);
    } catch (err) {
      setError(getCosmicErrorMessage(err));
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exploreRegion = async (regionId) => {
    if (exploring) return;
    setExploring(true);
    try {
      const res = await axios.post(`${API}/multiverse/explore`,
        { universe_id: activeUniverse, region_id: regionId }, { headers });
      const d = res.data;
      let msg = `${d.region} — +${d.xp_gained} XP, +${d.dust_gained} dust`;
      if (d.new_discovery) msg = `Discovered ${d.region}! ${msg}`;
      if (d.npc_met) msg += ` | Met ${d.npc_met.name}`;
      if (d.portal_unlocked) msg += ` | Portal opened!`;
      toast(msg);

      // Show ripple toasts
      d.ripples?.forEach((r, i) => {
        setTimeout(() => {
          if (r.detail) toast(r.detail, { icon: '🌀' });
        }, 600 * (i + 1));
      });

      setSelectedRegion(regionId);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot explore');
    }
    setExploring(false);
  };

  const talkToNpc = async (regionId, npcId) => {
    try {
      const res = await axios.post(`${API}/multiverse/interact-npc`,
        { universe_id: activeUniverse, region_id: regionId, npc_id: npcId }, { headers });
      toast(`${res.data.npc}: "${res.data.dialogue}"`);
      if (res.data.ripples?.length > 0) {
        res.data.ripples.forEach((r, i) => {
          setTimeout(() => {
            if (r.detail) toast(r.detail, { icon: '🌀' });
          }, 800 * (i + 1));
        });
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed');
    }
  };

  const switchUniverse = async (uid) => {
    setActiveUniverse(uid);
    setSelectedRegion(null);
    try {
      await axios.post(`${API}/multiverse/travel`, { universe_id: uid }, { headers });
    } catch { /* ignore */ }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <CosmicInlineLoader message="Mapping the multiverse..." />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <CosmicError title={error.title} message={error.message} onRetry={fetchData} />
    </div>
  );

  const universe = data?.universes?.find(u => u.id === activeUniverse) || data?.universes?.[0];
  if (!universe) return null;
  const uColor = universe.color;
  const selRegion = universe.regions.find(r => r.id === selectedRegion);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }} data-testid="multiverse-map-page">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)' }} data-testid="multiverse-back-btn">
          <ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Multiversal Map
          </h1>
          <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
            4 Planes — {data?.total_explorations || 0} explorations
          </p>
        </div>
        {/* Ascendant indicator */}
        <div className="px-2 py-1 rounded-lg text-[7px]"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)', color: '#F59E0B' }}
          data-testid="ascendant-badge">
          <Star size={8} className="inline mr-0.5" />
          {data?.ascendant?.zodiac} — {data?.ascendant?.universe?.charAt(0).toUpperCase() + data?.ascendant?.universe?.slice(1)} ascendant
        </div>
      </div>

      <div className="px-4">
        {/* Universe Selectors */}
        <div className="grid grid-cols-4 gap-2 mb-3" data-testid="universe-selector">
          {data?.universes?.map(u => (
            <UniverseSelector key={u.id} universe={u}
              isActive={u.id === activeUniverse}
              onClick={() => switchUniverse(u.id)} />
          ))}
        </div>

        {/* Universe Map */}
        <div className="rounded-xl overflow-hidden mb-3 relative"
          style={{ background: `${uColor}04`, border: `1px solid ${uColor}12`, height: 280 }}
          data-testid="universe-map">
          {/* Universe label */}
          <div className="absolute top-2 left-3 z-10">
            <p className="text-[9px] font-semibold" style={{ color: uColor }}>{universe.name}</p>
            <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{universe.description.slice(0, 60)}...</p>
          </div>

          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Connection lines */}
            {universe.regions.filter(r => r.discovered).map(r =>
              r.connections?.filter(cid => {
                const target = universe.regions.find(x => x.id === cid);
                return target?.discovered;
              }).map(cid => {
                const target = universe.regions.find(x => x.id === cid);
                return target ? (
                  <line key={`${r.id}-${cid}`}
                    x1={`${r.x}%`} y1={`${r.y}%`}
                    x2={`${target.x}%`} y2={`${target.y}%`}
                    stroke={`${uColor}20`} strokeWidth={0.5} />
                ) : null;
              })
            )}
            {/* Region nodes */}
            {universe.regions.map(r => (
              <RegionNode key={r.id} region={r} color={uColor}
                isActive={r.id === selectedRegion}
                onExplore={exploreRegion}
                onNpcTalk={talkToNpc} />
            ))}
          </svg>

          {exploring && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'transparent' }}>
              <CosmicInlineLoader message="Exploring..." />
            </div>
          )}
        </div>

        {/* Selected Region Detail */}
        <AnimatePresence>
          {selRegion && selRegion.discovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="rounded-xl p-3 mb-3"
              style={{ background: `${uColor}06`, border: `1px solid ${uColor}12` }}
              data-testid="region-detail">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[11px] font-semibold" style={{ color: uColor }}>{selRegion.name}</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{selRegion.description}</p>
                </div>
                {selRegion.type === 'portal' && selRegion.portal_target && (
                  <button onClick={() => switchUniverse(selRegion.portal_target.universe)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[7px]"
                    style={{ background: `${uColor}10`, color: uColor }}
                    data-testid="portal-travel-btn">
                    <Compass size={9} /> Travel through portal
                  </button>
                )}
              </div>
              {/* NPC */}
              {selRegion.npc && (
                <div className="rounded-lg p-2 mb-2 flex items-center gap-2"
                  style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)' }}>
                  <User size={12} style={{ color: '#F59E0B' }} />
                  <div className="flex-1">
                    <p className="text-[9px] font-medium" style={{ color: '#F59E0B' }}>
                      {selRegion.npc.name} <span className="text-[7px] font-normal" style={{ color: 'var(--text-muted)' }}>({selRegion.npc.role})</span>
                    </p>
                    {selRegion.npc.dialogue && (
                      <p className="text-[8px] italic" style={{ color: 'var(--text-primary)' }}>"{selRegion.npc.dialogue}"</p>
                    )}
                  </div>
                  <button onClick={() => talkToNpc(selRegion.id, selRegion.npc.id)}
                    className="px-2 py-1 rounded text-[7px]"
                    style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}
                    data-testid="talk-npc-btn">
                    <MessageCircle size={9} className="inline mr-0.5" /> Talk
                  </button>
                </div>
              )}
              {/* Tools */}
              {selRegion.has_tools && (
                <div className="flex items-center gap-1">
                  <Package size={9} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Tools available in this region</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resonance Bars */}
        <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
          data-testid="resonance-bars">
          <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Universal Resonance
          </p>
          <div className="space-y-1.5">
            {data?.universes?.map(u => {
              const maxRes = Math.max(...data.universes.map(x => x.resonance || 1), 1);
              return (
                <div key={u.id} className="flex items-center gap-2">
                  <span className="text-[8px] w-16 text-right" style={{ color: u.color }}>{u.name.split(' ')[0]}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(2, (u.resonance / maxRes) * 100)}%` }}
                      className="h-full rounded-full"
                      style={{ background: u.color }} />
                  </div>
                  <span className="text-[7px] w-6" style={{ color: 'var(--text-muted)' }}>{u.resonance}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ripple Feed Toggle */}
        <button onClick={() => setShowRipples(!showRipples)}
          className="w-full rounded-xl p-2.5 flex items-center justify-between mb-2"
          style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
          data-testid="ripple-toggle">
          <div className="flex items-center gap-1.5">
            <Zap size={11} style={{ color: '#818CF8' }} />
            <span className="text-[9px] font-medium" style={{ color: '#818CF8' }}>
              Interlocking Ripples
            </span>
          </div>
          <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
            {data?.recent_ripples?.length || 0} recent
          </span>
        </button>

        <AnimatePresence>
          {showRipples && data?.recent_ripples?.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="rounded-xl p-3 mb-3 overflow-hidden"
              style={{ background: 'rgba(129,140,248,0.03)', border: '1px solid rgba(129,140,248,0.08)' }}
              data-testid="ripple-feed">
              <div className="space-y-0.5 divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                {data.recent_ripples.slice().reverse().map((r, i) => (
                  <RippleItem key={r.id || i} ripple={r} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
