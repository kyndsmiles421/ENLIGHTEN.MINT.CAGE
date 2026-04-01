import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import useGameController from '../hooks/useGameController';
import GameModuleWrapper from '../components/game/GameModuleWrapper';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import {
  ArrowLeft, Pickaxe, Zap, Star, Gem, ChevronRight,
  Flame, Droplets, Mountain, Sprout, Lock,
  TrendingUp, Award, BookOpen, Battery, RefreshCw
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EL_COLORS = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };
const EL_ICONS = { wood: Sprout, fire: Flame, earth: Mountain, metal: Gem, water: Droplets };
const RARITY_COLORS = { common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6', epic: '#A855F7', legendary: '#FCD34D', mythic: '#EF4444' };

function triggerHaptic(p) { try { navigator.vibrate?.({ strike: [30, 10, 30], discover: [50, 20, 80], legendary: [50, 20, 80, 20, 120] }[p] || [10]); } catch {} }

// ── Energy Bar ──
function EnergyBar({ energy }) {
  const pct = (energy.current / energy.max) * 100;
  const color = pct > 60 ? '#22C55E' : pct > 30 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2 mb-3" data-testid="energy-bar">
      <Battery size={12} style={{ color }} />
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
      <span className="text-[8px] font-bold" style={{ color }}>{energy.current}/{energy.max}</span>
    </div>
  );
}

// ── Depth Layer Button ──
function DepthLayer({ depth, onMine, mining, currentEnergy, biomeColor }) {
  const locked = !depth.unlocked;
  const canAfford = currentEnergy >= depth.energy_cost;
  const disabled = locked || !canAfford || mining;
  const rarityLabel = depth.rarity_boost > 2 ? 'Legendary Zone' : depth.rarity_boost > 1.5 ? 'Rare Zone' : '';

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: depth.depth * 0.05 }}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={() => !disabled && onMine(depth.depth)}
      disabled={disabled}
      className="w-full rounded-xl p-3 mb-2 text-left relative overflow-hidden group"
      style={{
        background: locked ? 'rgba(255,255,255,0.01)' : `${biomeColor}06`,
        border: `1px solid ${locked ? 'rgba(255,255,255,0.03)' : `${biomeColor}12`}`,
        opacity: disabled ? 0.5 : 1,
      }}
      data-testid={`depth-${depth.depth}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {locked ? <Lock size={12} style={{ color: 'var(--text-muted)' }} />
            : <Pickaxe size={12} style={{ color: biomeColor }} />}
          <div>
            <p className="text-[10px] font-medium" style={{ color: locked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
              {depth.name}
            </p>
            <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
              Cost: {depth.energy_cost} energy {rarityLabel && `| ${rarityLabel}`}
            </p>
          </div>
        </div>
        {!locked && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px]"
            style={{
              background: canAfford ? `${biomeColor}08` : 'rgba(239,68,68,0.06)',
              color: canAfford ? biomeColor : '#EF4444'
            }}>
            <Pickaxe size={8} /> {mining ? 'Mining...' : 'Mine'}
          </div>
        )}
      </div>
      {/* Rarity gradient stripe */}
      {!locked && depth.rarity_boost > 1.3 && (
        <motion.div className="absolute bottom-0 left-0 right-0 h-0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: `linear-gradient(90deg, transparent, ${biomeColor}, transparent)` }} />
      )}
    </motion.button>
  );
}

// ── Specimen Discovery Card ──
function SpecimenCard({ specimen, rewards }) {
  const rc = RARITY_COLORS[specimen.actual_rarity] || '#9CA3AF';
  const ElIcon = EL_ICONS[specimen.element] || Gem;
  const isMythic = specimen.actual_rarity === 'mythic';
  const isLegendary = specimen.actual_rarity === 'legendary';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 12 }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: `${rc}06`, border: `1px solid ${rc}15` }}
      data-testid="specimen-card">
      {/* Legendary/Mythic shimmer */}
      {(isLegendary || isMythic) && (
        <motion.div className="absolute inset-0"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${rc}10 50%, transparent 70%)`,
            backgroundSize: '200% 200%',
          }} />
      )}
      <motion.div className="absolute inset-0" animate={{ opacity: [0.02, 0.06, 0.02] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ background: `radial-gradient(circle at 50% 50%, ${rc}20, transparent 70%)` }} />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            animate={isMythic ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${rc}12`, border: `1px solid ${rc}20` }}>
            <Gem size={22} style={{ color: rc }} />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-sm font-bold" style={{ color: rc, fontFamily: 'Cormorant Garamond, serif' }}>
                {specimen.name}
              </p>
              <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase font-bold"
                style={{ background: `${rc}15`, color: rc }}>{specimen.actual_rarity}</span>
            </div>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{specimen.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-2 text-[7px]" style={{ color: 'var(--text-muted)' }}>
          <ElIcon size={8} style={{ color: EL_COLORS[specimen.element] }} />
          <span>{specimen.element}</span>
          <span>|</span>
          <span>Mohs {specimen.mohs}</span>
          <span>|</span>
          <span>Depth {specimen.depth_found}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
            +{rewards.xp} XP
          </span>
          <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6' }}>
            +{rewards.dust} Dust
          </span>
          <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: `${EL_COLORS[specimen.element]}08`, color: EL_COLORS[specimen.element] }}>
            +{rewards.stat_delta} {rewards.stat}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Collection Item ──
function CollectionItem({ item }) {
  const rc = RARITY_COLORS[item.best_rarity] || '#9CA3AF';
  const ElIcon = EL_ICONS[item.element] || Gem;
  return (
    <div className="rounded-xl p-2.5 flex items-center gap-2"
      style={{ background: `${rc}04`, border: `1px solid ${rc}08` }}
      data-testid={`collection-${item.specimen_id}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${rc}10` }}>
        <Gem size={14} style={{ color: rc }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold truncate" style={{ color: rc }}>{item.name}</p>
        <div className="flex items-center gap-1 text-[7px]" style={{ color: 'var(--text-muted)' }}>
          <ElIcon size={7} style={{ color: EL_COLORS[item.element] }} />
          <span>{item.element}</span>
          <span>x{item.count}</span>
        </div>
      </div>
      <span className="text-[6px] px-1 py-0.5 rounded uppercase" style={{ background: `${rc}10`, color: rc }}>
        {item.best_rarity}
      </span>
    </div>
  );
}

// ── Core Stats HUD (shows data from Universal Game Controller) ──
function CoreStatsHUD({ coreStats }) {
  if (!coreStats) return null;
  const lvl = coreStats.level;
  return (
    <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
      data-testid="core-stats-hud">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Award size={10} style={{ color: '#FCD34D' }} />
          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Core Stats</span>
        </div>
        <span className="text-[9px] font-bold" style={{ color: '#818CF8' }}>Lv.{lvl?.level}</span>
      </div>
      {/* XP bar */}
      <div className="w-full h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${lvl?.percentage || 0}%` }}
          className="h-full rounded-full" style={{ background: '#818CF8' }} />
      </div>
      <div className="flex items-center gap-3 text-[7px]" style={{ color: 'var(--text-muted)' }}>
        <span>XP: {lvl?.total_xp}</span>
        <span>Dust: {coreStats.currencies?.cosmic_dust || 0}</span>
        {Object.entries(coreStats.stats || {}).map(([k, v]) => (
          <span key={k} style={{ color: v.color }}>{v.name}: {v.value}</span>
        ))}
      </div>
    </div>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE — Rock Hounding Module
//  Plugs into Universal Game Controller via hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function RockHounding() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const headers = authHeaders;

  // Universal Game Controller Hook — provides Nexus state, distortions, commitReward
  const controller = useGameController('rock_hounding');

  const [mine, setMine] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mining, setMining] = useState(false);
  const [lastFind, setLastFind] = useState(null);
  const [tab, setTab] = useState('mine');

  const fetchMine = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/rock-hounding/mine`, { headers });
      setMine(res.data);
      setError(null);
    } catch (err) { setError(getCosmicErrorMessage(err)); }
    setLoading(false);
  }, [headers]);

  const fetchCollection = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/rock-hounding/collection`, { headers });
      setCollection(res.data);
    } catch {}
  }, [headers]);

  useEffect(() => { fetchMine(); }, [fetchMine]);
  useEffect(() => { if (tab === 'collection') fetchCollection(); }, [tab, fetchCollection]);

  const doMine = async (depth) => {
    setMining(true);
    triggerHaptic('strike');
    try {
      const res = await axios.post(`${API}/rock-hounding/mine-action`, { depth }, { headers });
      const { specimen, rewards } = res.data;
      setLastFind({ specimen, rewards });

      // Refresh controller state (Nexus + Core stats update)
      controller.refreshState();

      if (['legendary', 'mythic'].includes(specimen.actual_rarity)) {
        triggerHaptic('legendary');
        toast(`${specimen.actual_rarity.toUpperCase()}! ${specimen.name}!`);
      } else {
        triggerHaptic('discover');
        toast(`Found ${specimen.name}! +${rewards.xp} XP`);
      }
      fetchMine();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Mining failed');
    }
    setMining(false);
  };

  const resetMine = async () => {
    try {
      const res = await axios.post(`${API}/rock-hounding/reset-mine`, {}, { headers });
      setMine(res.data.mine);
      setLastFind(null);
      toast('New mine opened!');
      controller.refreshState();
    } catch (err) { toast.error('Failed to open new mine'); }
  };

  if (loading || controller.loading) return (
    <GameModuleWrapper distortions={{ blur: 0, grainOpacity: 0, glitchIntensity: 0, saturation: 1 }}
      dominantElement="earth" harmonyScore={50} moduleName="rock_hounding">
      <div className="min-h-screen flex items-center justify-center">
        <CosmicInlineLoader message="Opening the mine..." />
      </div>
    </GameModuleWrapper>
  );

  if (error) return (
    <GameModuleWrapper distortions={{ blur: 0, grainOpacity: 0, glitchIntensity: 0, saturation: 1 }}
      dominantElement="earth" harmonyScore={50} moduleName="rock_hounding">
      <div className="min-h-screen flex items-center justify-center">
        <CosmicError title={error.title} message={error.message} onRetry={fetchMine} />
      </div>
    </GameModuleWrapper>
  );

  const biome = mine?.biome || {};
  const depths = mine?.depths || [];
  const energy = mine?.energy_info || { current: 0, max: 20 };
  // Use Nexus-driven element color (falls back to biome color)
  const biomeColor = EL_COLORS[biome.element] || biome.color || '#F59E0B';
  const BiomeIcon = EL_ICONS[biome.element] || Mountain;

  return (
    <GameModuleWrapper
      distortions={controller.distortions}
      dominantElement={controller.dominantElement}
      harmonyScore={controller.harmonyScore}
      moduleName="rock_hounding">

      <div className="pb-24" data-testid="rock-hounding-page">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)' }} data-testid="rh-back-btn">
            <ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Rock Hounding
            </h1>
            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              Discover minerals. Feed the Nexus. Build your collection.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => navigate('/nexus')} className="text-[8px] px-2 py-1 rounded-lg"
              style={{ background: `${biomeColor}06`, color: biomeColor, border: `1px solid ${biomeColor}10` }}
              data-testid="rh-nexus-link">Nexus</button>
            <button onClick={() => navigate('/rpg')} className="text-[8px] px-2 py-1 rounded-lg"
              style={{ background: 'rgba(129,140,248,0.06)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.1)' }}
              data-testid="rh-rpg-link">RPG</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-2 mb-4" data-testid="rh-tabs">
          {[
            { id: 'mine', label: 'Mine', icon: Pickaxe },
            { id: 'collection', label: 'Collection', icon: Gem },
            { id: 'catalog', label: 'Catalog', icon: BookOpen },
          ].map(t => {
            const TIcon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium"
                style={{
                  background: tab === t.id ? `${biomeColor}12` : 'rgba(255,255,255,0.02)',
                  color: tab === t.id ? biomeColor : 'var(--text-muted)',
                  border: `1px solid ${tab === t.id ? `${biomeColor}20` : 'rgba(255,255,255,0.04)'}`,
                }}
                data-testid={`tab-${t.id}`}><TIcon size={10} /> {t.label}</button>
            );
          })}
        </div>

        <div className="px-4">
          {/* Core Stats HUD — from Universal Game Controller */}
          <CoreStatsHUD coreStats={controller.coreStats} />

          {tab === 'mine' && (
            <>
              {/* Biome Card — colored by Nexus element state */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 mb-4 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${biome.ambient || '#1a1a2e'}E0, ${biomeColor}08)`,
                  border: `1px solid ${biomeColor}15`,
                }}
                data-testid="biome-card">
                {/* Ambient pulse from harmony */}
                <motion.div className="absolute inset-0"
                  animate={{ opacity: [0.02, 0.05, 0.02] }}
                  transition={{ duration: controller.distortions.pulseSpeed || 4, repeat: Infinity }}
                  style={{ background: `radial-gradient(circle at 30% 30%, ${biomeColor}15, transparent 60%)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${biomeColor}10`, border: `1px solid ${biomeColor}20` }}>
                      <BiomeIcon size={18} style={{ color: biomeColor }} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold" style={{ color: biomeColor, fontFamily: 'Cormorant Garamond, serif' }}>
                        {biome.name || 'Mine'}
                      </h2>
                      <p className="text-[7px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {biome.element} biome | {biome.atmosphere}
                      </p>
                    </div>
                    {/* Harmony badge */}
                    <div className="text-center">
                      <p className="text-[7px] uppercase" style={{ color: 'var(--text-muted)' }}>Harmony</p>
                      <p className="text-sm font-bold" style={{ color: controller.harmonyScore > 50 ? '#22C55E' : '#F59E0B' }}>
                        {controller.harmonyScore}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] italic mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {biome.description}
                  </p>
                  <div className="flex items-center gap-3 text-[7px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Mined: {mine?.total_mines || 0}</span>
                    <span>Found: {mine?.specimens_found?.length || 0}</span>
                    <span>Dominant: {controller.dominantElement}</span>
                    {controller.deficientElement && (
                      <span style={{ color: EL_COLORS[controller.deficientElement] }}>
                        Feed: {controller.deficientElement}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Energy */}
              <EnergyBar energy={energy} />

              {/* Last Find */}
              <AnimatePresence>
                {lastFind && (
                  <motion.div className="mb-4" exit={{ opacity: 0, y: -10 }}>
                    <p className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Last Discovery</p>
                    <SpecimenCard specimen={lastFind.specimen} rewards={lastFind.rewards} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Depth Layers */}
              <div className="mb-4">
                <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Mine Depths
                </p>
                {depths.map(d => (
                  <DepthLayer key={d.depth} depth={d} onMine={doMine} mining={mining}
                    currentEnergy={energy.current} biomeColor={biomeColor} />
                ))}
              </div>

              {/* Reset mine */}
              <button onClick={resetMine}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-medium mb-4"
                style={{ background: 'rgba(59,130,246,0.04)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.08)' }}
                data-testid="reset-mine-btn">
                <RefreshCw size={10} /> New Mine (Reset Biome)
              </button>
            </>
          )}

          {/* Collection tab */}
          {tab === 'collection' && (
            <CollectionTab collection={collection} fetchCollection={fetchCollection} />
          )}

          {/* Catalog tab */}
          {tab === 'catalog' && (
            <CatalogTab headers={headers} />
          )}
        </div>
      </div>
    </GameModuleWrapper>
  );
}

function CollectionTab({ collection, fetchCollection }) {
  useEffect(() => { if (!collection) fetchCollection(); }, [collection, fetchCollection]);

  if (!collection) return <CosmicInlineLoader message="Loading collection..." />;

  return (
    <div data-testid="collection-tab">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Gem size={11} style={{ color: '#F59E0B' }} />
          <p className="text-[9px] font-semibold" style={{ color: '#F59E0B' }}>
            Collection ({collection.total_discovered}/{collection.total_possible})
          </p>
        </div>
        <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
          {collection.completion}% Complete
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${collection.completion}%` }}
          className="h-full rounded-full" style={{ background: '#F59E0B' }} />
      </div>
      {/* By element */}
      {Object.entries(collection.by_element || {}).map(([element, items]) => (
        <div key={element} className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            {React.createElement(EL_ICONS[element] || Gem, { size: 10, style: { color: EL_COLORS[element] } })}
            <p className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: EL_COLORS[element] }}>
              {element} ({items.length})
            </p>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {items.map(item => <CollectionItem key={item.specimen_id} item={item} />)}
          </div>
        </div>
      ))}
      {collection.total_discovered === 0 && (
        <div className="text-center py-12">
          <Pickaxe size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Start mining to build your collection!</p>
        </div>
      )}
    </div>
  );
}

function CatalogTab({ headers }) {
  const [catalog, setCatalog] = useState(null);
  useEffect(() => {
    axios.get(`${API}/rock-hounding/catalog`, { headers }).then(r => setCatalog(r.data)).catch(() => {});
  }, [headers]);

  if (!catalog) return <CosmicInlineLoader message="Loading catalog..." />;

  const elements = ['wood', 'fire', 'earth', 'metal', 'water'];

  return (
    <div data-testid="catalog-tab">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <BookOpen size={11} style={{ color: '#A855F7' }} />
          <p className="text-[9px] font-semibold" style={{ color: '#A855F7' }}>
            Specimen Catalog ({catalog.discovered}/{catalog.total})
          </p>
        </div>
      </div>
      {elements.map(el => {
        const elItems = catalog.catalog.filter(c => c.element === el);
        if (elItems.length === 0) return null;
        return (
          <div key={el} className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              {React.createElement(EL_ICONS[el] || Gem, { size: 10, style: { color: EL_COLORS[el] } })}
              <p className="text-[8px] font-semibold uppercase" style={{ color: EL_COLORS[el] }}>{el}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {elItems.map(item => (
                <div key={item.id} className="rounded-lg p-2"
                  style={{
                    background: item.discovered ? `${RARITY_COLORS[item.rarity_base]}04` : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${item.discovered ? `${RARITY_COLORS[item.rarity_base]}10` : 'rgba(255,255,255,0.03)'}`,
                    opacity: item.discovered ? 1 : 0.5,
                  }}>
                  <p className="text-[9px] font-medium" style={{
                    color: item.discovered ? RARITY_COLORS[item.rarity_base] : 'var(--text-muted)'
                  }}>
                    {item.name}
                  </p>
                  <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    {item.rarity_base} {item.mohs ? `| Mohs ${item.mohs}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
