import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag, CheckCircle, Wrench, Circle, Gauge,
  Flower2, Cloud, FlaskConical, Scroll, HeartPulse,
  Lock, Sparkles
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ITEM_ICONS = {
  wrench: Wrench, circle: Circle, gauge: Gauge, flower: Flower2,
  cloud: Cloud, flask: FlaskConical, scroll: Scroll, heart_pulse: HeartPulse,
};

const RARITY_COLORS = {
  common: '#94A3B8',
  uncommon: '#2DD4BF',
  rare: '#8B5CF6',
  legendary: '#FBBF24',
};

const CATEGORY_LABELS = {
  ebike_parts: 'E-Bike Parts',
  yoga_equipment: 'Yoga Equipment',
  ui_skin: 'UI Skins',
};

export default function CircularEconomyPanel() {
  const { authHeaders } = useAuth();
  const [items, setItems] = useState([]);
  const [balances, setBalances] = useState({ kinetic_dust: 0, science_resonance: 0 });
  const [purchasing, setPurchasing] = useState(null);
  const [filterCat, setFilterCat] = useState('all');

  const fetchShop = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/science-history/economy/shop`, { headers: authHeaders });
      setItems(res.data.items || []);
      setBalances(res.data.balances || { kinetic_dust: 0, science_resonance: 0 });
    } catch (e) { console.error('Shop fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { fetchShop(); }, [fetchShop]);

  const handlePurchase = async (itemId) => {
    setPurchasing(itemId);
    try {
      await axios.post(`${API}/science-history/economy/purchase`,
        { item_id: itemId }, { headers: authHeaders }
      );
      fetchShop();
    } catch (e) {
      alert(e.response?.data?.detail || 'Purchase failed');
    }
    setPurchasing(null);
  };

  const categories = ['all', ...new Set(items.map(i => i.category))];
  const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat);

  return (
    <div className="space-y-3" data-testid="circular-economy-panel">
      <div className="flex items-center gap-2 mb-1">
        <ShoppingBag size={11} style={{ color: '#8B5CF6' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#8B5CF6' }}>
          Circular Economy — Marketplace
        </span>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.08)' }}>
          <p className="text-[12px] font-mono" style={{ color: '#10B981' }}>{balances.kinetic_dust}</p>
          <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Kinetic Dust</p>
        </div>
        <div className="text-center p-2.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)' }}>
          <p className="text-[12px] font-mono" style={{ color: '#F59E0B' }}>{balances.science_resonance}</p>
          <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Science Resonance</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => (
          <button key={cat}
            onClick={() => setFilterCat(cat)}
            className="px-2 py-0.5 rounded-full text-[7px] uppercase tracking-wider transition-all"
            style={{
              background: filterCat === cat ? 'rgba(139,92,246,0.1)' : 'rgba(248,250,252,0.03)',
              color: filterCat === cat ? '#8B5CF6' : 'var(--text-muted)',
              border: `1px solid ${filterCat === cat ? 'rgba(139,92,246,0.2)' : 'rgba(248,250,252,0.05)'}`,
            }}
            data-testid={`filter-${cat}`}
          >
            {cat === 'all' ? 'All' : (CATEGORY_LABELS[cat] || cat)}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filtered.map(item => {
          const Icon = ITEM_ICONS[item.icon] || Sparkles;
          const rarityColor = RARITY_COLORS[item.rarity] || '#94A3B8';
          const cost = item.currency === 'kinetic_dust' ? item.cost_dust : item.cost_resonance;
          const currLabel = item.currency === 'kinetic_dust' ? 'Kinetic Dust' : 'Science Res';
          const canAfford = item.currency === 'kinetic_dust'
            ? balances.kinetic_dust >= item.cost_dust
            : balances.science_resonance >= item.cost_resonance;

          return (
            <motion.div key={item.id}
              whileHover={{ scale: item.owned ? 1 : 1.005 }}
              className="rounded-lg p-3"
              style={{
                background: item.owned ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)',
                border: `1px solid ${item.owned ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}`,
              }}
              data-testid={`shop-item-${item.id}`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${rarityColor}10`, border: `1px solid ${rarityColor}20` }}>
                  <Icon size={14} style={{ color: rarityColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium" style={{ color: item.owned ? '#2DD4BF' : 'var(--text-primary)' }}>
                      {item.name}
                    </span>
                    <span className="text-[6px] uppercase px-1 py-0.5 rounded-full" style={{ background: `${rarityColor}12`, color: rarityColor }}>
                      {item.rarity}
                    </span>
                  </div>
                  <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[7px] uppercase" style={{ color: 'var(--text-muted)' }}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    <span className="text-[8px] font-mono" style={{ color: canAfford ? '#2DD4BF' : '#EF4444' }}>
                      {cost} {currLabel}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {item.owned ? (
                    <span className="text-[8px] px-2 py-1 rounded-md flex items-center gap-1"
                      style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF' }}>
                      <CheckCircle size={8} /> Owned
                    </span>
                  ) : canAfford ? (
                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={purchasing === item.id}
                      className="text-[8px] px-2.5 py-1 rounded-md transition-all"
                      style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.15)' }}
                      data-testid={`buy-${item.id}`}
                    >
                      {purchasing === item.id ? 'Acquiring...' : 'Acquire'}
                    </button>
                  ) : (
                    <span className="text-[8px] px-2 py-1 rounded-md flex items-center gap-1"
                      style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-muted)' }}>
                      <Lock size={8} /> Locked
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
