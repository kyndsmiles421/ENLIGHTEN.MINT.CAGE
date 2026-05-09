import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { CosmicInlineLoader } from '../CosmicFeedback';
import CrystalPortrait from './CrystalPortrait';
import {
  Pickaxe, Zap, Star, Gem, ChevronRight, ChevronDown,
  Flame, Droplets, Mountain, Sprout, Lock,
  TrendingUp, Award, BookOpen, Battery, RefreshCw,
  Crown, Sparkles, Clock, ShoppingBag, X, Info
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EL_COLORS = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };
const EL_ICONS = { wood: Sprout, fire: Flame, earth: Mountain, metal: Gem, water: Droplets };
const RARITY_COLORS = { common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6', epic: '#A855F7', legendary: '#FCD34D', mythic: '#EF4444' };

export function triggerHaptic(p) { try { navigator.vibrate?.({ strike: [30, 10, 30], discover: [50, 20, 80], legendary: [50, 20, 80, 20, 120] }[p] || [10]); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } }

export { EL_COLORS, EL_ICONS, RARITY_COLORS };

// ── Energy Bar ──
export function EnergyBar({ energy }) {
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
export function DepthLayer({ depth, onMine, mining, currentEnergy, biomeColor }) {
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
        touchAction: 'manipulation',
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
// V68.38 — Real crystal portrait + expandable info sheet. No more generic gems.
export function SpecimenCard({ specimen, rewards, layer }) {
  const rc = RARITY_COLORS[specimen.actual_rarity] || '#9CA3AF';
  const ElIcon = EL_ICONS[specimen.element] || Gem;
  const isMythic = specimen.actual_rarity === 'mythic';
  const isLegendary = specimen.actual_rarity === 'legendary';
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 12 }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: `${rc}06`, border: `1px solid ${rc}15` }}
      data-testid="specimen-card">
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
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${rc}10`, border: `1px solid ${rc}22` }}>
            <CrystalPortrait specimen={specimen} size={52} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <p className="text-sm font-bold" style={{ color: rc, fontFamily: 'Cormorant Garamond, serif' }}>
                {specimen.name}
              </p>
              <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider"
                style={{ background: `${rc}15`, color: rc }}>{specimen.actual_rarity}</span>
            </div>
            <p className="text-[9px] leading-snug" style={{ color: 'var(--text-muted)' }}>{specimen.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-2 text-[7px] flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <ElIcon size={8} style={{ color: EL_COLORS[specimen.element] }} />
          <span>{specimen.element}</span>
          <span>|</span>
          <span>Mohs {specimen.mohs}</span>
          <span>|</span>
          <span>Depth {specimen.depth_found}</span>
          {layer && (
            <>
              <span>|</span>
              <span style={{ color: '#A855F7' }}>{layer.name}</span>
              {layer.loot_multiplier > 1 && <span style={{ color: '#FCD34D' }}>{layer.loot_multiplier}x</span>}
            </>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
            +{rewards.xp} XP
          </span>
          <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6' }}>
            +{rewards.dust} Dust
          </span>
          <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: `${EL_COLORS[specimen.element]}08`, color: EL_COLORS[specimen.element] }}>
            +{rewards.stat_delta} {rewards.stat}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="ml-auto flex items-center gap-1 text-[8px] px-2 py-0.5 rounded-lg uppercase tracking-wider transition-colors"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}
            data-testid="specimen-info-toggle"
          >
            <Info size={9} />
            {expanded ? 'Hide' : 'Learn'}
            {expanded ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
              data-testid="specimen-info-sheet"
            >
              <div className="mt-3 pt-3 border-t" style={{ borderColor: `${rc}18` }}>
                <div className="grid grid-cols-2 gap-2 text-[9px]" style={{ color: 'var(--text-primary)' }}>
                  <div>
                    <div className="uppercase tracking-wider text-[7px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Element</div>
                    <div style={{ color: EL_COLORS[specimen.element] }}>{specimen.element}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[7px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Hardness (Mohs)</div>
                    <div>{specimen.mohs} / 10</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[7px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Stat bonus</div>
                    <div style={{ color: rc }}>+{specimen.stat_value ?? rewards.stat_delta} {specimen.stat ?? rewards.stat}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[7px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Depth found</div>
                    <div>Depth {specimen.depth_found}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[7px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Dust value</div>
                    <div style={{ color: '#A78BFA' }}>{specimen.dust_value ?? rewards.dust}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[7px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Layer</div>
                    <div style={{ color: '#A855F7' }}>{specimen.layer_name ?? layer?.name ?? 'Terrestrial'}</div>
                  </div>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
                  {specimen.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Collection Item ──
export function CollectionItem({ item }) {
  const rc = RARITY_COLORS[item.best_rarity] || '#9CA3AF';
  const ElIcon = EL_ICONS[item.element] || Gem;
  // Build a specimen-shaped payload so CrystalPortrait can render the same
  // deterministic silhouette used on the discovery card.
  const specimenShape = {
    id: item.specimen_id || item.name,
    name: item.name,
    element: item.element,
    actual_rarity: item.best_rarity,
  };
  return (
    <div className="rounded-xl p-2.5 flex items-center gap-2"
      style={{ background: `${rc}04`, border: `1px solid ${rc}08` }}
      data-testid={`collection-${item.specimen_id}`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${rc}0C`, border: `1px solid ${rc}14` }}>
        <CrystalPortrait specimen={specimenShape} size={32} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold truncate" style={{ color: rc }}>{item.name}</p>
        <div className="flex items-center gap-1 text-[7px]" style={{ color: 'var(--text-muted)' }}>
          <ElIcon size={7} style={{ color: EL_COLORS[item.element] }} />
          <span>{item.element}</span>
          <span>x{item.count}</span>
          {item.polished && <span style={{ color: '#22C55E' }}>Polished</span>}
        </div>
      </div>
      <span className="text-[6px] px-1 py-0.5 rounded uppercase" style={{ background: `${rc}10`, color: rc }}>
        {item.best_rarity}
      </span>
    </div>
  );
}

// ── Active Pass Banner ──
export function ActivePassBanner({ pass: passInfo, layerColor }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!passInfo) return;
    const update = () => {
      const exp = new Date(passInfo.expires_at);
      const now = new Date();
      const diff = exp - now;
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [passInfo]);

  if (!passInfo) return null;

  const color = layerColor || '#A855F7';
  return (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-2.5 mb-3 flex items-center gap-2.5"
      style={{ background: `${color}08`, border: `1px solid ${color}15` }}
      data-testid="active-pass-banner">
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${color}15` }}>
        <Crown size={14} style={{ color }} />
      </motion.div>
      <div className="flex-1">
        <p className="text-[9px] font-bold" style={{ color }}>{passInfo.pass_name} Active</p>
        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
          Mining in {passInfo.target_layer.charAt(0).toUpperCase() + passInfo.target_layer.slice(1)} layer
        </p>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
        style={{ background: `${color}10` }}>
        <Clock size={8} style={{ color }} />
        <span className="text-[9px] font-mono font-bold" style={{ color }}>{timeLeft}</span>
      </div>
    </motion.div>
  );
}

// ── Nexus Pass Shop ──
export function NexusPassShop({ headers, onPurchased, currentDust }) {
  const [passes, setPasses] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const fetchPasses = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/game-core/passes`, { headers });
      setPasses(res.data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [headers]);

  useEffect(() => { if (showShop) fetchPasses(); }, [showShop, fetchPasses]);

  const purchase = async (passId) => {
    setPurchasing(true);
    try {
      const res = await axios.post(`${API}/game-core/passes/purchase`, { pass_id: passId }, { headers });
      toast(`${res.data.pass.name} activated! Mining in ${res.data.pass.target_layer} for ${res.data.pass.duration_minutes} minutes.`);
      onPurchased?.();
      setShowShop(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Purchase failed');
    }
    setPurchasing(false);
  };

  const PASS_ICONS = { astral_pass: Sparkles, void_pass: Flame, nexus_pass: Crown };

  return (
    <>
      <button onClick={() => setShowShop(true)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-medium mb-4"
        style={{ background: 'rgba(252,211,77,0.04)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.08)', touchAction: 'manipulation' }}
        data-testid="open-pass-shop">
        <Crown size={10} /> Nexus Passes
      </button>

      <AnimatePresence>
        {showShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowShop(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-5"
              style={{ background: 'var(--bg-primary)', border: '1px solid rgba(252,211,77,0.1)' }}
              data-testid="pass-shop-modal">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown size={16} style={{ color: '#FCD34D' }} />
                  <h2 className="text-base font-bold" style={{ color: '#FCD34D', fontFamily: 'Cormorant Garamond, serif' }}>
                    Nexus Passes
                  </h2>
                </div>
                <button onClick={() => setShowShop(false)} className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <X size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              <p className="text-[9px] mb-1" style={{ color: 'var(--text-muted)' }}>
                Temporarily unlock higher universe layers for enhanced loot and XP.
              </p>
              <p className="text-[9px] mb-4 flex items-center gap-1" style={{ color: '#FCD34D' }}>
                <Gem size={8} /> Your Dust: {passes?.cosmic_dust ?? currentDust}
              </p>

              {!passes ? (
                <CosmicInlineLoader message="Loading passes..." />
              ) : passes.active_pass ? (
                <div className="text-center py-6">
                  <Crown size={24} className="mx-auto mb-2" style={{ color: '#FCD34D' }} />
                  <p className="text-[10px]" style={{ color: '#FCD34D' }}>Pass already active.</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Wait for it to expire before buying another.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {passes.available_passes.map(p => {
                    const PIcon = PASS_ICONS[p.id] || Sparkles;
                    const layerDef = { astral: { color: '#3B82F6', mult: '1.7x' }, void: { color: '#EF4444', mult: '2.5x' }, nexus: { color: '#FCD34D', mult: '3.0x' } };
                    const ld = layerDef[p.target_layer] || { color: '#A855F7', mult: '?' };
                    return (
                      <div key={p.id} className="rounded-xl p-3.5 relative overflow-hidden"
                        style={{ background: `${ld.color}04`, border: `1px solid ${ld.color}10` }}>
                        <motion.div className="absolute inset-0"
                          animate={{ opacity: [0.01, 0.03, 0.01] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          style={{ background: `radial-gradient(circle at 50% 50%, ${ld.color}15, transparent 70%)` }} />
                        <div className="relative z-10 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${ld.color}10`, border: `1px solid ${ld.color}20` }}>
                            <PIcon size={18} style={{ color: ld.color }} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: ld.color, fontFamily: 'Cormorant Garamond, serif' }}>
                              {p.name}
                            </p>
                            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-[7px]" style={{ color: 'var(--text-muted)' }}>
                              <span>{p.duration_minutes} min</span>
                              <span>{ld.mult} loot</span>
                            </div>
                          </div>
                          <button onClick={() => purchase(p.id)} disabled={!p.can_afford || purchasing}
                            className="px-3 py-2 rounded-xl text-[9px] font-bold"
                            style={{
                              background: p.can_afford ? `${ld.color}15` : 'rgba(255,255,255,0.03)',
                              color: p.can_afford ? ld.color : 'var(--text-muted)',
                              border: `1px solid ${p.can_afford ? `${ld.color}20` : 'rgba(255,255,255,0.04)'}`,
                              opacity: purchasing ? 0.5 : 1,
                              touchAction: 'manipulation',
                            }}
                            data-testid={`buy-${p.id}`}>
                            <div className="flex items-center gap-1">
                              <Gem size={8} /> {p.cost_dust}
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Core Stats HUD ──
export function CoreStatsHUD({ coreStats }) {
  if (!coreStats) return null;
  const { layer_data, dominant_element, dominant_percentage, harmony_score } = coreStats;
  const elColor = EL_COLORS[dominant_element] || '#A855F7';
  const ElIcon = EL_ICONS[dominant_element] || Star;

  return (
    <div className="rounded-xl p-2.5 mb-3 flex items-center gap-2" data-testid="core-stats-hud"
      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-1.5">
        <Zap size={10} style={{ color: '#FCD34D' }} />
        <span className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Core Stats</span>
      </div>
      <div className="flex-1 flex items-center justify-end gap-3 text-[7px]" style={{ color: 'var(--text-muted)' }}>
        {layer_data && (
          <span className="flex items-center gap-1" style={{ color: layer_data.color || '#A855F7' }}>
            <TrendingUp size={7} /> Lv.{layer_data.layer_number || 1}
          </span>
        )}
        <span className="flex items-center gap-1" style={{ color: elColor }}>
          <ElIcon size={7} /> {dominant_element} {dominant_percentage}%
        </span>
        <span className="flex items-center gap-1">
          <Award size={7} style={{ color: '#22C55E' }} /> {harmony_score}
        </span>
      </div>
    </div>
  );
}
