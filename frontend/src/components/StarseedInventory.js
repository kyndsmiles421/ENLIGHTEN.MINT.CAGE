import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Star, Shield, Heart, Eye, Brain, Swords, Flame,
  Loader2, Sparkles, Package, ChevronRight, Check,
  Crown, Gem, Wand2, User
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RARITY_STYLES = {
  common:    { color: '#9CA3AF', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.15)', label: 'Common' },
  rare:      { color: '#38BDF8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.15)', label: 'Rare' },
  epic:      { color: '#A855F7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.15)', label: 'Epic' },
  legendary: { color: '#FCD34D', bg: 'rgba(252,211,77,0.08)', border: 'rgba(252,211,77,0.2)', label: 'Legendary' },
};

const ITEM_ICONS = {
  crystal: Gem, shield: Shield, eye: Eye, flame: Flame,
  star: Star, key: Wand2, crown: Crown, heart: Heart, sword: Swords,
};

const STAT_LABELS = { wisdom: 'WIS', courage: 'CRG', compassion: 'CMP', intuition: 'INT', resilience: 'RES' };
const STAT_COLORS = { wisdom: '#A855F7', courage: '#EF4444', compassion: '#EC4899', intuition: '#38BDF8', resilience: '#F59E0B' };

/* ─── Inventory Panel ─── */
export function InventoryPanel({ originId, authHeaders, compact }) {
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState(false);

  useEffect(() => {
    if (!originId) return;
    axios.get(`${API}/starseed/inventory/${originId}`, { headers: authHeaders })
      .then(r => {
        setInventory(r.data.inventory || []);
        setEquipped(r.data.equipped || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [originId, authHeaders]);

  const toggleEquip = useCallback(async (itemId) => {
    if (equipping) return;
    setEquipping(true);
    try {
      const res = await axios.post(`${API}/starseed/inventory/equip`, {
        origin_id: originId, item_id: itemId,
      }, { headers: authHeaders });
      setEquipped(res.data.equipped || []);
      toast.success(res.data.equipped.includes(itemId) ? 'Item equipped!' : 'Item unequipped');
    } catch {
      toast.error('Could not equip item');
    } finally {
      setEquipping(false);
    }
  }, [originId, authHeaders, equipping]);

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="animate-spin" size={16} style={{ color: '#C084FC' }} /></div>;
  if (inventory.length === 0) {
    return (
      <div className="text-center py-6" data-testid="inventory-empty">
        <Package size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No loot yet. Defeat bosses to earn cosmic artifacts!</p>
      </div>
    );
  }

  return (
    <div data-testid="inventory-panel">
      {/* Equipped slots */}
      <div className="flex items-center gap-2 mb-3">
        <Package size={11} style={{ color: '#FCD34D' }} />
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#FCD34D' }}>
          Equipped ({equipped.length}/3)
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[0, 1, 2].map(slot => {
          const eqId = equipped[slot];
          const item = eqId ? inventory.find(i => i.id === eqId) : null;
          const rarity = item ? RARITY_STYLES[item.rarity] || RARITY_STYLES.common : null;
          const ItemIcon = item ? (ITEM_ICONS[item.icon] || Gem) : Package;

          return (
            <div key={slot} className="rounded-xl p-3 text-center border transition-all"
              style={{
                background: item ? rarity.bg : 'rgba(255,255,255,0.02)',
                borderColor: item ? rarity.border : 'rgba(255,255,255,0.05)',
                minHeight: compact ? 60 : 80,
              }}
              data-testid={`equip-slot-${slot}`}>
              {item ? (
                <>
                  <ItemIcon size={compact ? 16 : 20} className="mx-auto mb-1" style={{ color: item.color || rarity.color }} />
                  <p className="text-[9px] font-medium truncate" style={{ color: item.color || rarity.color }}>{item.name}</p>
                  <p className="text-[7px]" style={{ color: rarity.color }}>{rarity.label}</p>
                </>
              ) : (
                <>
                  <ItemIcon size={compact ? 14 : 18} className="mx-auto mb-1" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>Empty</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Total equip bonus */}
      {equipped.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {Object.entries(
            equipped.reduce((acc, eqId) => {
              const item = inventory.find(i => i.id === eqId);
              if (item) {
                Object.entries(item.stat_bonus || {}).forEach(([s, v]) => {
                  acc[s] = (acc[s] || 0) + v;
                });
              }
              return acc;
            }, {})
          ).map(([stat, val]) => (
            <span key={stat} className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: `${STAT_COLORS[stat] || '#fff'}12`, color: STAT_COLORS[stat] || '#fff' }}>
              +{val} {STAT_LABELS[stat] || stat}
            </span>
          ))}
        </div>
      )}

      {/* Full inventory */}
      <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        Inventory ({inventory.length})
      </p>
      <div className="space-y-1.5">
        {inventory.map((item, i) => {
          const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
          const ItemIcon = ITEM_ICONS[item.icon] || Gem;
          const isEquipped = equipped.includes(item.id);

          return (
            <motion.button key={item.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => toggleEquip(item.id)}
              className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all hover:scale-[1.01] group border"
              style={{
                background: isEquipped ? `${item.color || rarity.color}10` : 'rgba(255,255,255,0.02)',
                borderColor: isEquipped ? `${item.color || rarity.color}25` : 'rgba(255,255,255,0.04)',
              }}
              data-testid={`inventory-item-${item.id}`}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color || rarity.color}12`, border: `1px solid ${item.color || rarity.color}20` }}>
                <ItemIcon size={16} style={{ color: item.color || rarity.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium truncate" style={{ color: item.color || rarity.color }}>{item.name}</p>
                  <span className="text-[7px] px-1 py-0 rounded-full uppercase font-bold"
                    style={{ background: rarity.bg, color: rarity.color, border: `1px solid ${rarity.border}` }}>
                    {rarity.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {Object.entries(item.stat_bonus || {}).map(([stat, val]) => (
                    <span key={stat} className="text-[8px]" style={{ color: STAT_COLORS[stat] || '#fff' }}>
                      +{val} {STAT_LABELS[stat] || stat}
                    </span>
                  ))}
                </div>
              </div>
              {isEquipped ? (
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${item.color || '#4ADE80'}20` }}>
                  <Check size={10} style={{ color: '#4ADE80' }} />
                </div>
              ) : (
                <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                  Equip
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Loot Drop Reveal ─── */
export function LootDropReveal({ loot, onClose }) {
  if (!loot) return null;
  const rarity = RARITY_STYLES[loot.rarity] || RARITY_STYLES.common;
  const ItemIcon = ITEM_ICONS[loot.icon] || Gem;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full flex flex-col"
      style={{ background: 'transparent', backdropFilter: 'none'}}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}
        className="rounded-2xl p-8 text-center max-w-xs mx-4 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${loot.color || rarity.color}10, rgba(0,0,0,0.15))`, border: `2px solid ${loot.color || rarity.color}30` }}
        onClick={e => e.stopPropagation()}
        data-testid="loot-drop-reveal">
        {/* Glow */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ background: `radial-gradient(circle, ${loot.color || rarity.color}, transparent 70%)` }} />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: rarity.color }}>
            {rarity.label} Loot Drop
          </p>
          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${loot.color || rarity.color}15`, border: `2px solid ${loot.color || rarity.color}30`, boxShadow: `0 0 40px ${loot.color || rarity.color}20` }}>
            <ItemIcon size={36} style={{ color: loot.color || rarity.color }} />
          </motion.div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: loot.color || rarity.color }}>
            {loot.name}
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{loot.desc}</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            {Object.entries(loot.stat_bonus || {}).map(([stat, val]) => (
              <span key={stat} className="text-[9px] px-2 py-1 rounded-full font-bold"
                style={{ background: `${STAT_COLORS[stat] || '#fff'}12`, color: STAT_COLORS[stat] || '#fff' }}>
                +{val} {STAT_LABELS[stat] || stat}
              </span>
            ))}
          </div>
          <button onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
            style={{ background: `${loot.color || rarity.color}15`, border: `1px solid ${loot.color || rarity.color}25`, color: loot.color || rarity.color }}
            data-testid="loot-close-btn">
            Collect
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Avatar Generator ─── */
export function AvatarGenerator({ originId, authHeaders, onAvatarGenerated }) {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!originId) return;
    // V1.0.8 — Skip fetch when there's no auth header. The previous
    // version fired GET /api/starseed/avatar/:id with empty headers
    // for guest/trial users, producing a stream of silent 401s in the
    // network tab. Now we render the placeholder avatar and exit.
    if (!authHeaders || !authHeaders.Authorization) {
      setLoading(false);
      return;
    }
    axios.get(`${API}/starseed/avatar/${originId}`, { headers: authHeaders })
      .then(r => {
        if (r.data.avatar_base64) setAvatar(`data:image/png;base64,${r.data.avatar_base64}`);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [originId, authHeaders]);

  const generateAvatar = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/starseed/avatar/generate`, {
        origin_id: originId,
        description: description.trim(),
      }, { headers: authHeaders });
      if (res.data.avatar_base64) {
        const url = `data:image/png;base64,${res.data.avatar_base64}`;
        setAvatar(url);
        onAvatarGenerated?.(url);
        toast.success('Avatar generated!');
      }
    } catch (err) {
      toast.error('Avatar generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div data-testid="avatar-generator">
      <div className="flex items-center gap-2 mb-3">
        <User size={11} style={{ color: '#C084FC' }} />
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#C084FC' }}>Avatar</span>
      </div>

      {/* Current Avatar */}
      <div className="flex items-start gap-4 mb-3">
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          data-testid="avatar-preview">
          {loading ? (
            <Loader2 className="animate-spin" size={16} style={{ color: 'var(--text-muted)' }} />
          ) : avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={28} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          )}
        </div>
        <div className="flex-1">
          <input type="text" placeholder="Describe your character's look..." maxLength={200}
            value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs mb-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
            data-testid="avatar-description-input" />
          <button onClick={generateAvatar} disabled={generating}
            className="px-4 py-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1.5 transition-all hover:scale-105"
            style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC', opacity: generating ? 0.5 : 1 }}
            data-testid="generate-avatar-btn">
            {generating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
            {generating ? 'Generating...' : description.trim() ? 'Generate Custom' : 'Generate Default'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Avatar Display (small) ─── */
export function AvatarBadge({ originId, authHeaders, size = 32, className = '' }) {
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (!originId) return;
    // V1.0.8 — Skip fetch when there's no auth header (guest/trial).
    if (!authHeaders || !authHeaders.Authorization) return;
    axios.get(`${API}/starseed/avatar/${originId}`, { headers: authHeaders })
      .then(r => { if (r.data.avatar_base64) setAvatar(`data:image/png;base64,${r.data.avatar_base64}`); })
      .catch(() => {});
  }, [originId, authHeaders]);

  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      data-testid="avatar-badge">
      {avatar ? (
        <img src={avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        <User size={size * 0.45} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
      )}
    </div>
  );
}
