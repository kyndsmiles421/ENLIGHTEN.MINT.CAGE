import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import {
  ArrowLeft, Star, Shield, Heart, Eye, Brain, Swords, Flame,
  Loader2, Sparkles, Gem, ChevronRight, ChevronDown, Lock,
  Unlock, Globe, Diamond, Moon, Sun, Compass, Zap, Crown,
  Hammer, Package, Check, X, Plus, Minus, Wand2, Orbit,
  CircleDot, Infinity
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STAT_COLORS = { wisdom: '#A855F7', courage: '#EF4444', compassion: '#EC4899', intuition: '#38BDF8', resilience: '#F59E0B' };
const STAT_LABELS = { wisdom: 'WIS', courage: 'CRG', compassion: 'CMP', intuition: 'INT', resilience: 'RES' };
const STAT_ICONS = { wisdom: Brain, courage: Swords, compassion: Heart, intuition: Eye, resilience: Shield };

const RARITY_STYLES = {
  common: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.08)', label: 'Common' },
  rare: { color: '#38BDF8', bg: 'rgba(56,189,248,0.08)', label: 'Rare' },
  epic: { color: '#A855F7', bg: 'rgba(168,85,247,0.08)', label: 'Epic' },
  legendary: { color: '#FCD34D', bg: 'rgba(252,211,77,0.08)', label: 'Legendary' },
};

const REALM_ICONS = { sun: Sun, moon: Moon, diamond: Diamond, orbit: Orbit };
const ITEM_ICONS = {
  sword: Swords, shield: Shield, circle: CircleDot, star: Star, flame: Flame,
  compass: Compass, infinity: Infinity, eye: Eye, heart: Heart, crown: Crown,
  diamond: Diamond, zap: Zap, hexagon: Gem, droplet: Gem, sparkles: Sparkles,
  moon: Moon, atom: Gem, book: Gem,
};

/* ─── Multiverse Star Map Canvas ─── */
function MultiverseMap({ realms, onRealmClick, reduceParticles }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceParticles) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3, a: Math.random(),
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.a += (Math.random() - 0.5) * 0.02;
        s.a = Math.max(0.1, Math.min(1, s.a));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a * 0.4})`;
        ctx.fill();
      });

      // Draw portal connections
      const positions = [
        { x: W * 0.2, y: H * 0.35 },
        { x: W * 0.5, y: H * 0.25 },
        { x: W * 0.8, y: H * 0.35 },
        { x: W * 0.5, y: H * 0.7 },
      ];
      for (let i = 0; i < positions.length - 1; i++) {
        const a = positions[i], b = positions[i + 1];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [reduceParticles]);

  return (
    <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden mb-6"
      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex items-center justify-around h-full px-4">
        {realms.map((realm, i) => {
          const RealmIcon = REALM_ICONS[realm.icon] || Globe;
          return (
            <motion.button key={realm.id}
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
              onClick={() => onRealmClick(realm)}
              className="flex flex-col items-center gap-2 group"
              data-testid={`realm-map-${realm.id}`}>
              <motion.div
                animate={realm.unlocked ? { boxShadow: [`0 0 15px ${realm.color}20`, `0 0 25px ${realm.color}40`, `0 0 15px ${realm.color}20`] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  background: realm.unlocked ? `linear-gradient(135deg, ${realm.color}25, ${realm.color}10)` : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${realm.unlocked ? `${realm.color}50` : 'rgba(255,255,255,0.08)'}`,
                }}>
                {realm.unlocked ? (
                  <RealmIcon size={20} style={{ color: realm.color }} />
                ) : (
                  <Lock size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                )}
              </motion.div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-center max-w-[80px]"
                style={{ color: realm.unlocked ? realm.color : 'var(--text-muted)', opacity: realm.unlocked ? 1 : 0.5 }}>
                {realm.name.replace('The ', '')}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Gem Card ─── */
function GemCard({ gem, compact, onClick }) {
  const rarity = RARITY_STYLES[gem.rarity] || RARITY_STYLES.common;
  const GemIcon = ITEM_ICONS[gem.icon] || Gem;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all border"
      style={{ background: `${gem.color}06`, borderColor: `${gem.color}15` }}
      data-testid={`gem-${gem.instance_id || gem.id}`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${gem.color}12`, border: `1px solid ${gem.color}20` }}>
        <GemIcon size={16} style={{ color: gem.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium truncate" style={{ color: gem.color }}>{gem.name}</p>
          <span className="text-[7px] px-1 py-0 rounded-full uppercase font-bold"
            style={{ background: rarity.bg, color: rarity.color }}>
            {rarity.label}
          </span>
        </div>
        {!compact && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {Object.entries(gem.stat_bonus || {}).map(([stat, val]) => (
              <span key={stat} className="text-[8px]" style={{ color: STAT_COLORS[stat] }}>
                +{val} {STAT_LABELS[stat]}
              </span>
            ))}
          </div>
        )}
      </div>
      {gem.type && (
        <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase font-bold flex-shrink-0"
          style={{ background: `${gem.color}08`, color: gem.color }}>
          {gem.type}
        </span>
      )}
    </motion.button>
  );
}

/* ─── Equipment Card ─── */
function EquipCard({ item, equipped, sets, onEquip, onSelect }) {
  const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
  const ItemIcon = ITEM_ICONS[item.icon] || Shield;
  const setDef = item.set_id ? sets?.[item.set_id] : null;
  const socketCount = item.gem_sockets || 0;
  const socketed = item.socketed_gems?.length || 0;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-xl p-4 border transition-all cursor-pointer"
      style={{
        background: equipped ? `${item.color}08` : 'rgba(255,255,255,0.02)',
        borderColor: equipped ? `${item.color}25` : 'rgba(255,255,255,0.05)',
      }}
      onClick={() => onSelect?.(item)}
      data-testid={`equip-${item.instance_id}`}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}>
          <ItemIcon size={20} style={{ color: item.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-medium truncate" style={{ color: item.color }}>{item.name}</p>
            <span className="text-[7px] px-1 py-0 rounded-full uppercase font-bold"
              style={{ background: rarity.bg, color: rarity.color }}>{rarity.label}</span>
          </div>
          <p className="text-[9px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {item.slot?.toUpperCase()} {setDef ? `| ${setDef.name} Set` : ''}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(item.stat_bonus || {}).map(([stat, val]) => (
              <span key={stat} className="text-[8px] px-1.5 py-0.5 rounded-full"
                style={{ background: `${STAT_COLORS[stat]}10`, color: STAT_COLORS[stat] }}>
                +{val} {STAT_LABELS[stat]}
              </span>
            ))}
          </div>
          {socketCount > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {Array.from({ length: socketCount }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: i < socketed ? `${item.socketed_gems[i]?.socket_bonus ? '#A855F7' : '#9CA3AF'}15` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${i < socketed ? '#A855F720' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {i < socketed ? <Gem size={7} style={{ color: '#A855F7' }} /> : <Plus size={6} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />}
                </div>
              ))}
              <span className="text-[7px] ml-1" style={{ color: 'var(--text-muted)' }}>
                {socketed}/{socketCount} sockets
              </span>
            </div>
          )}
          {item.enchantments?.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Sparkles size={8} style={{ color: '#C084FC' }} />
              <span className="text-[7px]" style={{ color: '#C084FC' }}>
                {item.enchantments.map(e => e.name).join(', ')}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {equipped ? (
            <span className="text-[8px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>Equipped</span>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onEquip?.(item); }}
              className="text-[8px] px-2 py-0.5 rounded-full font-medium transition-all hover:scale-105"
              style={{ background: `${item.color}10`, color: item.color, border: `1px solid ${item.color}15` }}
              data-testid={`equip-btn-${item.instance_id}`}>
              Equip
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Realm Detail Panel ─── */
function RealmDetailPanel({ realm, onExplore, exploring, onClose }) {
  if (!realm) return null;
  const RealmIcon = REALM_ICONS[realm.icon] || Globe;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${realm.color}08, rgba(0,0,0,0.1))`, border: `1px solid ${realm.color}20` }}
      data-testid={`realm-detail-${realm.id}`}>
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ background: `radial-gradient(ellipse at 30% 30%, ${realm.color}, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${realm.color}15`, border: `1px solid ${realm.color}25` }}>
              <RealmIcon size={22} style={{ color: realm.color }} />
            </div>
            <div>
              <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: realm.color }}>
                {realm.name}
              </h3>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {realm.subtitle} | {realm.difficulty}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:scale-110 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <p className="text-sm leading-relaxed mb-4" style={{ color: '#D4D0DC', fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
          {realm.lore}
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-[8px] px-2 py-1 rounded-full" style={{ background: `${realm.color}08`, color: realm.color }}>
            Element: {realm.element}
          </span>
          <span className="text-[8px] px-2 py-1 rounded-full" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
            Lvl {realm.level_req}+
          </span>
          <span className="text-[8px] px-2 py-1 rounded-full" style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>
            Boss: {realm.boss}
          </span>
        </div>

        {!realm.unlocked && (
          <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Lock size={14} style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{realm.portal_description}</p>
          </div>
        )}

        {realm.unlocked && (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            animate={!exploring ? {
              boxShadow: [`0 0 15px ${realm.color}10`, `0 0 30px ${realm.color}20`, `0 0 15px ${realm.color}10`]
            } : {}}
            transition={!exploring ? { duration: 2.5, repeat: Infinity } : {}}
            onClick={onExplore} disabled={exploring}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${realm.color}20, ${realm.color}10)`,
              border: `1px solid ${realm.color}30`, color: realm.color,
              opacity: exploring ? 0.5 : 1,
            }}
            data-testid={`explore-${realm.id}`}>
            {exploring ? <Loader2 size={14} className="animate-spin" /> : <Compass size={14} />}
            {exploring ? 'Exploring...' : 'Explore This Realm'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Crafting Panel ─── */
function CraftingPanel({ recipes, enchantOptions, gems, equipment, originId, authHeaders, onCrafted }) {
  const [crafting, setCrafting] = useState(null);
  const [loading, setLoading] = useState(false);

  const canCraft = (recipe) => {
    for (const mat of recipe.materials) {
      const available = gems.filter(g => g.id === mat.id);
      if (available.length < mat.qty) return false;
    }
    return true;
  };

  const doCraft = async (recipe) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/worlds/craft`, {
        origin_id: originId, recipe_id: recipe.id,
      }, { headers: authHeaders });
      toast.success(`Crafted ${res.data.crafted.name}!`);
      onCrafted?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Crafting failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="crafting-panel">
      <div className="flex items-center gap-2 mb-4">
        <Hammer size={12} style={{ color: '#F59E0B' }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#F59E0B' }}>Forge & Craft</span>
      </div>
      <div className="space-y-2">
        {recipes.map(recipe => {
          const craftable = canCraft(recipe);
          return (
            <div key={recipe.id} className="rounded-xl p-3 border"
              style={{ background: craftable ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.02)', borderColor: craftable ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)' }}
              data-testid={`recipe-${recipe.id}`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium" style={{ color: craftable ? '#F59E0B' : 'var(--text-muted)' }}>{recipe.name}</p>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>Lvl {recipe.level_req}</span>
              </div>
              <p className="text-[9px] mb-2" style={{ color: 'var(--text-secondary)' }}>{recipe.description}</p>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {recipe.materials.map((mat, i) => {
                  const has = gems.filter(g => g.id === mat.id).length;
                  return (
                    <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full"
                      style={{ background: has >= mat.qty ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)', color: has >= mat.qty ? '#4ADE80' : '#EF4444' }}>
                      {mat.id.replace(/-/g, ' ')} {has}/{mat.qty}
                    </span>
                  );
                })}
              </div>
              {craftable && (
                <button onClick={() => doCraft(recipe)} disabled={loading}
                  className="text-[9px] px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}
                  data-testid={`craft-btn-${recipe.id}`}>
                  {loading ? 'Crafting...' : 'Craft'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Exploration Result Modal ─── */
function ExplorationResult({ result, onClose }) {
  if (!result) return null;
  const hasDiscoveries = result.discoveries.length > 0;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full flex flex-col"
      style={{ background: 'transparent', backdropFilter: 'none'}}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.3, opacity: 0, rotateY: -20 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ type: 'spring', duration: 0.8, bounce: 0.3 }}
        className="rounded-2xl p-8 text-center max-w-sm mx-4 relative overflow-hidden"
        style={{ background: 'rgba(16,14,28,0.97)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
        data-testid="exploration-result">
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: hasDiscoveries ? 'radial-gradient(ellipse at 50% 20%, rgba(192,132,252,0.06), transparent 60%)' : 'none' }} />

        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-[10px] font-bold uppercase tracking-[0.3em] mb-5 relative"
          style={{ color: '#C084FC', textShadow: '0 0 15px rgba(192,132,252,0.3)' }}>
          Exploration Report
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-5">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: 'rgba(252,211,77,0.1)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.15)' }}>
            +{result.xp_gained} XP
          </motion.span>
          {result.leveled_up && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
              className="text-xs px-3 py-1.5 rounded-lg font-bold"
              style={{ background: 'rgba(252,211,77,0.12)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.2)',
                boxShadow: '0 0 20px rgba(252,211,77,0.15)' }}>
              Level Up! Lvl {result.new_level}
            </motion.span>
          )}
        </motion.div>

        {result.encounter && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="rounded-xl p-3 mb-4" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)' }}>
            <p className="text-xs" style={{ color: '#EF4444', textShadow: '0 0 8px rgba(220,38,38,0.2)' }}>
              Encountered: {result.encounter}
            </p>
          </motion.div>
        )}

        {hasDiscoveries ? (
          <div className="space-y-3 mb-5">
            {result.discoveries.map((d, i) => {
              const item = d.item;
              const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
              const Icon = ITEM_ICONS[item.icon] || Gem;
              return (
                <motion.div key={i}
                  initial={{ scale: 0.3, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.2, type: 'spring', bounce: 0.4 }}
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{ background: `${item.color}08`, border: `1px solid ${item.color}18`,
                    boxShadow: `0 0 25px ${item.color}08` }}>
                  <div className="absolute inset-0 opacity-[0.03]"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${item.color}, transparent 60%)` }} />
                  <div className="relative flex items-center gap-2 justify-center mb-2">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}>
                      <Icon size={18} style={{ color: item.color }} />
                    </motion.div>
                    <span className="text-sm font-medium" style={{ color: item.color, textShadow: `0 0 10px ${item.color}30` }}>
                      {item.name}
                    </span>
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase font-bold"
                      style={{ background: rarity.bg, color: rarity.color }}>{rarity.label}</span>
                  </div>
                  <p className="text-[10px] relative" style={{ color: '#C8C5D0' }}>{item.desc}</p>
                  <span className="text-[8px] uppercase font-bold tracking-wider mt-1 inline-block relative"
                    style={{ color: d.type === 'gem' ? '#A855F7' : '#F59E0B' }}>
                    {d.type === 'gem' ? 'Gem Found' : 'Equipment Found'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-xs mb-5" style={{ color: '#9896A3' }}>
            No rare discoveries this time. The cosmos rewards persistence.
          </motion.p>
        )}

        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          onClick={onClose}
          className="px-8 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
          data-testid="exploration-close">
          Continue Exploring
        </motion.button>
      </motion.div>
    </motion.div>
  );
}


/* ═══════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════ */
export default function StarseedWorlds() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('starseed_worlds', 8); }, []);

  const { user, authHeaders, loading: authLoading } = useAuth();
  const { reduceParticles } = useSensory();
  const navigate = useNavigate();

  const [realms, setRealms] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [activeOrigin, setActiveOrigin] = useState(null);
  const [selectedRealm, setSelectedRealm] = useState(null);
  const [tab, setTab] = useState('realms'); // realms | gems | equipment | crafting
  const [gems, setGems] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [equippedGear, setEquippedGear] = useState({});
  const [sets, setSets] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [enchantOptions, setEnchantOptions] = useState([]);
  const [exploring, setExploring] = useState(false);
  const [explorationResult, setExplorationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    const load = async () => {
      try {
        const [realmsRes, charsRes, recipesRes] = await Promise.all([
          axios.get(`${API}/starseed/worlds/realms`, { headers: authHeaders }),
          axios.get(`${API}/starseed/my-characters`, { headers: authHeaders }),
          axios.get(`${API}/starseed/worlds/crafting-recipes`, { headers: authHeaders }),
        ]);
        setRealms(realmsRes.data.realms);
        setCharacters(charsRes.data.characters);
        setRecipes(recipesRes.data.recipes);
        setEnchantOptions(recipesRes.data.enchant_options);

        if (charsRes.data.characters.length > 0) {
          setActiveOrigin(charsRes.data.characters[0].origin_id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authHeaders]);

  // Load character-specific data when origin changes
  useEffect(() => {
    if (!activeOrigin || !authHeaders?.Authorization) return;
    const loadCharData = async () => {
      try {
        const [gemsRes, equipRes] = await Promise.all([
          axios.get(`${API}/starseed/worlds/gems/${activeOrigin}`, { headers: authHeaders }),
          axios.get(`${API}/starseed/worlds/equipment/${activeOrigin}`, { headers: authHeaders }),
        ]);
        setGems(gemsRes.data.gems);
        setEquipment(equipRes.data.equipment);
        setEquippedGear(equipRes.data.equipped || {});
        setSets(equipRes.data.sets || {});
      } catch (err) {
        console.error(err);
      }
    };
    loadCharData();
  }, [activeOrigin, authHeaders]);

  const refreshData = useCallback(async () => {
    if (!activeOrigin || !authHeaders?.Authorization) return;
    try {
      const [gemsRes, equipRes, realmsRes] = await Promise.all([
        axios.get(`${API}/starseed/worlds/gems/${activeOrigin}`, { headers: authHeaders }),
        axios.get(`${API}/starseed/worlds/equipment/${activeOrigin}`, { headers: authHeaders }),
        axios.get(`${API}/starseed/worlds/realms`, { headers: authHeaders }),
      ]);
      setGems(gemsRes.data.gems);
      setEquipment(equipRes.data.equipment);
      setEquippedGear(equipRes.data.equipped || {});
      setRealms(realmsRes.data.realms);
    } catch (err) {
      console.error(err);
    }
  }, [activeOrigin, authHeaders]);

  const exploreRealm = useCallback(async () => {
    if (!selectedRealm || !activeOrigin || exploring) return;
    setExploring(true);
    try {
      const res = await axios.post(`${API}/starseed/worlds/explore`, {
        realm_id: selectedRealm.id, origin_id: activeOrigin,
      }, { headers: authHeaders });
      setExplorationResult(res.data);
      refreshData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Exploration failed');
    } finally {
      setExploring(false);
    }
  }, [selectedRealm, activeOrigin, exploring, authHeaders, refreshData]);

  const equipGear = useCallback(async (item) => {
    try {
      const res = await axios.post(`${API}/starseed/worlds/equip-gear`, {
        origin_id: activeOrigin, instance_id: item.instance_id, slot: item.slot,
      }, { headers: authHeaders });
      setEquippedGear(res.data.equipped);
      toast.success(`Equipped ${item.name}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to equip');
    }
  }, [activeOrigin, authHeaders]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  const ORIGIN_COLORS = {
    pleiadian: '#818CF8', sirian: '#38BDF8', arcturian: '#A855F7',
    lyran: '#F59E0B', andromedan: '#0EA5E9', orion: '#DC2626',
  };

  const tabs = [
    { id: 'realms', label: 'Realms', icon: Globe, color: '#C084FC' },
    { id: 'gems', label: 'Gems', icon: Gem, color: '#A855F7' },
    { id: 'equipment', label: 'Equipment', icon: Shield, color: '#38BDF8' },
    { id: 'crafting', label: 'Crafting', icon: Hammer, color: '#F59E0B' },
  ];

  const gemsByType = {
    elemental: gems.filter(g => g.type === 'elemental'),
    starseed: gems.filter(g => g.type === 'starseed'),
    cosmic: gems.filter(g => g.type === 'cosmic'),
  };

  const EQUIPMENT_SLOTS = ['weapon', 'armor', 'accessory', 'talisman'];

  const equipBySlot = {};
  EQUIPMENT_SLOTS.forEach(slot => {
    equipBySlot[slot] = equipment.filter(e => e.slot === slot);
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={() => navigate('/starseed-adventure')} className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="worlds-back">
          <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            The Multiverse
          </h1>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Realms, Gems, Equipment & Crafting
          </p>
        </div>

        {/* Character Selector */}
        {characters.length > 0 && (
          <div className="flex items-center gap-1">
            {characters.map(ch => (
              <button key={ch.origin_id} onClick={() => setActiveOrigin(ch.origin_id)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: activeOrigin === ch.origin_id ? `${ORIGIN_COLORS[ch.origin_id]}20` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${activeOrigin === ch.origin_id ? ORIGIN_COLORS[ch.origin_id] : 'rgba(255,255,255,0.08)'}`,
                }}
                data-testid={`char-select-${ch.origin_id}`}>
                <Star size={10} style={{ color: ORIGIN_COLORS[ch.origin_id] || '#fff' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {tabs.map(t => {
            const TabIcon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: active ? `${t.color}12` : 'transparent',
                  color: active ? t.color : 'var(--text-muted)',
                  border: active ? `1px solid ${t.color}20` : '1px solid transparent',
                }}
                data-testid={`tab-${t.id}`}>
                <TabIcon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ─── REALMS TAB ─── */}
        {tab === 'realms' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MultiverseMap realms={realms} onRealmClick={setSelectedRealm} reduceParticles={reduceParticles} />

            <AnimatePresence mode="wait">
              {selectedRealm ? (
                <RealmDetailPanel key={selectedRealm.id} realm={selectedRealm}
                  onExplore={exploreRealm} exploring={exploring}
                  onClose={() => setSelectedRealm(null)} />
              ) : (
                <motion.div key="realm-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
                    All Realms
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {realms.map((realm, i) => {
                      const RealmIcon = REALM_ICONS[realm.icon] || Globe;
                      return (
                        <motion.button key={realm.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                          onClick={() => setSelectedRealm(realm)}
                          className="rounded-xl p-4 text-left border transition-all hover:scale-[1.01] relative overflow-hidden group"
                          style={{
                            background: realm.unlocked ? `linear-gradient(135deg, ${realm.color}06, rgba(0,0,0,0.3))` : 'rgba(255,255,255,0.02)',
                            borderColor: realm.unlocked ? `${realm.color}15` : 'rgba(255,255,255,0.05)',
                          }}
                          data-testid={`realm-card-${realm.id}`}>
                          {realm.unlocked && (
                            <div className="absolute inset-0 opacity-[0.03]"
                              style={{ background: `radial-gradient(ellipse at 20% 50%, ${realm.color}, transparent 60%)` }} />
                          )}
                          <div className="relative flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${realm.color}12`, border: `1px solid ${realm.color}20` }}>
                              {realm.unlocked ? <RealmIcon size={18} style={{ color: realm.color }} /> : <Lock size={14} style={{ color: 'var(--text-muted)' }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ color: realm.unlocked ? realm.color : 'var(--text-muted)' }}>{realm.name}</p>
                              <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{realm.subtitle} | {realm.difficulty}</p>
                            </div>
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: realm.color }} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── GEMS TAB ─── */}
        {tab === 'gems' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gem size={12} style={{ color: '#A855F7' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#A855F7' }}>
                  Gem Collection ({gems.length})
                </span>
              </div>
            </div>

            {gems.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Gem size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No gems yet. Explore realms to discover cosmic gems!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(gemsByType).map(([type, typeGems]) => {
                  if (typeGems.length === 0) return null;
                  const typeColors = { elemental: '#9CA3AF', starseed: '#38BDF8', cosmic: '#FCD34D' };
                  return (
                    <div key={type}>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: typeColors[type] || '#fff' }}>
                        {type} ({typeGems.length})
                      </p>
                      <div className="space-y-1.5">
                        {typeGems.map((gem, i) => (
                          <GemCard key={gem.instance_id || i} gem={gem} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── EQUIPMENT TAB ─── */}
        {tab === 'equipment' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={12} style={{ color: '#38BDF8' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#38BDF8' }}>
                Equipment ({equipment.length})
              </span>
            </div>

            {equipment.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Shield size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No equipment yet. Explore realms or craft gear!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {EQUIPMENT_SLOTS.map(slot => {
                  const slotItems = equipBySlot[slot] || [];
                  if (slotItems.length === 0) return null;
                  const slotColors = { weapon: '#EF4444', armor: '#38BDF8', accessory: '#A855F7', talisman: '#F59E0B' };
                  return (
                    <div key={slot}>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: slotColors[slot] }}>
                        {slot} ({slotItems.length})
                      </p>
                      <div className="space-y-2">
                        {slotItems.map(item => (
                          <EquipCard key={item.instance_id} item={item}
                            equipped={equippedGear[slot] === item.instance_id}
                            sets={sets} onEquip={equipGear} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── CRAFTING TAB ─── */}
        {tab === 'crafting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CraftingPanel recipes={recipes} enchantOptions={enchantOptions}
              gems={gems} equipment={equipment} originId={activeOrigin}
              authHeaders={authHeaders} onCrafted={refreshData} />
          </motion.div>
        )}
      </div>

      {/* Exploration Result Overlay */}
      <AnimatePresence>
        {explorationResult && (
          <ExplorationResult result={explorationResult} onClose={() => setExplorationResult(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
