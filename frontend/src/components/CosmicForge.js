import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Hammer, Key, Eye, Cpu, Zap, Sparkles, Flame,
  Lock, Package, ShoppingBag, Play, ChevronRight,
  Star, Shield, Gem, Wind, Mountain, Droplets
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RARITY_COLORS = {
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

const RARITY_BG = {
  common: 'rgba(156,163,175,0.06)',
  uncommon: 'rgba(34,197,94,0.06)',
  rare: 'rgba(59,130,246,0.06)',
  epic: 'rgba(168,85,247,0.06)',
  legendary: 'rgba(245,158,11,0.06)',
};

const TYPE_ICONS = {
  resonator_key: Key,
  focus_lens: Eye,
  resource_harvester: Cpu,
  passive_buff: Shield,
  active_mantra: Zap,
  skill_bottle: Gem,
};

function ForgeItemCard({ item, onUse, onList }) {
  const rColor = RARITY_COLORS[item.rarity] || '#9CA3AF';
  const rBg = RARITY_BG[item.rarity] || 'rgba(156,163,175,0.06)';
  const Icon = TYPE_ICONS[item.type] || Package;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-3 relative overflow-hidden"
      style={{ background: rBg, border: `1px solid ${rColor}20` }}
      data-testid={`forge-item-${item.id}`}
    >
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${rColor}10, transparent)` }} />

      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${rColor}15`, border: `1px solid ${rColor}20` }}>
          <Icon size={16} style={{ color: rColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
            <span className="text-[8px] px-1 py-0.5 rounded uppercase font-bold tracking-wider"
              style={{ background: `${rColor}15`, color: rColor }}>
              {item.rarity}
            </span>
          </div>
          <p className="text-[9px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>{item.description}</p>

          {/* Properties */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(item.properties || {}).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-[8px] px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                {k.replace(/_/g, ' ')}: <span style={{ color: rColor }}>{typeof v === 'number' ? v : String(v)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 mt-2.5">
        {!item.listed && onUse && (
          <button
            onClick={() => onUse(item)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors hover:brightness-110"
            style={{ background: `${rColor}15`, color: rColor, border: `1px solid ${rColor}20` }}
            data-testid={`use-item-${item.id}`}
          >
            <Play size={9} /> Use
          </button>
        )}
        {!item.listed && onList && (
          <button
            onClick={() => onList(item)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors hover:brightness-110"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}
            data-testid={`list-item-${item.id}`}
          >
            <ShoppingBag size={9} /> Sell
          </button>
        )}
        {item.listed && (
          <span className="text-[9px] px-2 py-1 rounded-lg italic"
            style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
            Listed for {item.base_price} Credits
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ForgeSection({ title, description, items, types, consciousnessLevel, onForge, forging, category }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          {category === 'tool' ? <Hammer size={14} style={{ color: '#D97706' }} /> : <Sparkles size={14} style={{ color: '#6366F1' }} />}
          {title}
        </h3>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>

      {/* Forge Buttons */}
      <div className="grid grid-cols-1 gap-2">
        {types.map(t => {
          const locked = consciousnessLevel < t.min_level;
          const Icon = TYPE_ICONS[t.id] || Package;
          return (
            <button
              key={t.id}
              onClick={() => !locked && onForge(t.id, category)}
              disabled={locked || forging}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group"
              style={{
                background: locked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${locked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
                opacity: locked ? 0.5 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
              }}
              data-testid={`forge-btn-${t.id}`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: locked ? 'rgba(255,255,255,0.02)' : `${RARITY_COLORS.rare}10` }}>
                {locked ? <Lock size={12} style={{ color: 'var(--text-muted)' }} /> : <Icon size={14} style={{ color: RARITY_COLORS.rare }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium" style={{ color: locked ? 'var(--text-muted)' : 'var(--text-primary)' }}>{t.name}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {locked ? `Requires Level ${t.min_level}` : t.description}
                </p>
              </div>
              {!locked && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                  {category === 'tool' ? '25 Dust' : '3 Credits'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CosmicForge() {
  const { authHeaders } = useAuth();
  const [tab, setTab] = useState('tools');
  const [toolTypes, setToolTypes] = useState([]);
  const [skillTypes, setSkillTypes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [consciousnessLevel, setConsciousnessLevel] = useState(1);
  const [forging, setForging] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [toolsRes, skillsRes, invRes] = await Promise.all([
        axios.get(`${API}/forge/tools/types`, { headers: authHeaders }),
        axios.get(`${API}/forge/skills/types`, { headers: authHeaders }),
        axios.get(`${API}/forge/inventory`, { headers: authHeaders }),
      ]);
      setToolTypes(toolsRes.data.tools || []);
      setSkillTypes(skillsRes.data.skills || []);
      setConsciousnessLevel(toolsRes.data.consciousness_level || 1);
      setInventory(invRes.data.items || []);
    } catch {}
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleForge = async (type, category) => {
    setForging(true);
    try {
      const endpoint = category === 'tool' ? '/forge/tools/create' : '/forge/skills/generate';
      const res = await axios.post(`${API}${endpoint}`, { type, context: 'Forged in the Cosmic Forge' }, { headers: authHeaders });
      const item = res.data.item;
      toast.success(`Forged: ${item.name}`, { description: `${item.rarity} ${item.type.replace(/_/g, ' ')} — +${res.data.consciousness_xp_gained || res.data.consciousness_xp_gained} XP` });
      setInventory(prev => [item, ...prev]);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Forge failed');
    }
    setForging(false);
  };

  const handleUse = async (item) => {
    try {
      const res = await axios.post(`${API}/forge/use`, { item_id: item.id }, { headers: authHeaders });
      toast.success(`Used: ${item.name}`, { description: JSON.stringify(res.data.effect).slice(0, 80) });
      setInventory(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Use failed');
    }
  };

  const handleList = async (item) => {
    try {
      await axios.post(`${API}/forge/list`, { item_id: item.id }, { headers: authHeaders });
      toast.success(`Listed: ${item.name} for ${item.base_price} Credits`);
      setInventory(prev => prev.map(i => i.id === item.id ? { ...i, listed: true } : i));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Listing failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }} />
        ))}
      </div>
    );
  }

  const tools = inventory.filter(i => i.category === 'tool');
  const skills = inventory.filter(i => i.category === 'skill');

  return (
    <div className="space-y-4" data-testid="cosmic-forge">
      {/* Tab Switch */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {[
          { id: 'tools', label: 'Tool Forge', icon: Hammer, color: '#D97706' },
          { id: 'skills', label: 'Skill Gen', icon: Sparkles, color: '#6366F1' },
          { id: 'inventory', label: 'Inventory', icon: Package, color: '#22C55E' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all"
            style={{
              background: tab === t.id ? `${t.color}12` : 'transparent',
              color: tab === t.id ? t.color : 'var(--text-muted)',
              border: tab === t.id ? `1px solid ${t.color}25` : '1px solid transparent',
            }}
            data-testid={`forge-tab-${t.id}`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'tools' && (
          <motion.div key="tools" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ForgeSection
              title="Tool Forge"
              description="Forge functional hardware from quest milestones. Requires Level 3+ Consciousness."
              items={tools}
              types={toolTypes}
              consciousnessLevel={consciousnessLevel}
              onForge={handleForge}
              forging={forging}
              category="tool"
            />
          </motion.div>
        )}

        {tab === 'skills' && (
          <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ForgeSection
              title="Skill Generator"
              description="Generate skills from interaction patterns. Requires Level 4+ Consciousness."
              items={skills}
              types={skillTypes}
              consciousnessLevel={consciousnessLevel}
              onForge={handleForge}
              forging={forging}
              category="skill"
            />
          </motion.div>
        )}

        {tab === 'inventory' && (
          <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                Your Forge ({inventory.length} items)
              </p>
              <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                {tools.length} Tools · {skills.length} Skills
              </span>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-8">
                <Package size={24} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>No items yet. Forge some tools or generate skills!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {inventory.map(item => (
                  <ForgeItemCard key={item.id} item={item} onUse={handleUse} onList={handleList} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
