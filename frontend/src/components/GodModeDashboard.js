import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Activity, Users, Package, TrendingUp, Gem, Sparkles,
  ShoppingBag, Zap, Crown, Eye, BarChart3, RefreshCw,
  Lock, Hammer, Star, Shield
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RARITY_COLORS = {
  common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6',
  epic: '#A855F7', legendary: '#F59E0B',
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-xl p-3 relative overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}12` }}>
      <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${color}08, transparent)` }} />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={12} style={{ color }} />
        </div>
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function GodModeDashboard() {
  const { authHeaders } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/forge/god-mode/economy`, { headers: authHeaders });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Access denied');
    }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-white/3" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
        <Lock size={20} className="mx-auto mb-2" style={{ color: '#EF4444' }} />
        <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>
        <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>Reach Level 5 or become a Founding Architect to unlock God Mode</p>
      </div>
    );
  }

  if (!data) return null;
  const { economy, asset_distribution, consciousness_distribution, recent_trades, recent_forges } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4" data-testid="god-mode-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(255,251,235,0.08))', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Eye size={14} style={{ color: '#FBBF24' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#FBBF24' }}>God Mode</h3>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Real-time economy feed</p>
          </div>
        </div>
        <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" data-testid="god-mode-refresh">
          <RefreshCw size={12} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Economy Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard icon={Users} label="Users" value={economy.total_users} color="#3B82F6" />
        <StatCard icon={Crown} label="Architects" value={`${economy.founding_architects}/${144}`} sub={`${economy.architect_slots_remaining} slots left`} color="#FBBF24" />
        <StatCard icon={Package} label="Forge Items" value={economy.total_forge_items} sub={`${economy.total_genesis_items} Genesis`} color="#A855F7" />
        <StatCard icon={ShoppingBag} label="Marketplace" value={economy.total_marketplace_assets} sub={`${economy.total_listings} listings`} color="#22C55E" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Asset Distribution */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
            <BarChart3 size={9} className="inline mr-1" />Asset Distribution
          </p>
          {Object.entries(asset_distribution).length === 0 ? (
            <p className="text-[10px] py-2" style={{ color: 'var(--text-muted)' }}>No assets yet</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(asset_distribution).map(([type, info]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-[10px] capitalize" style={{ color: 'var(--text-secondary)' }}>{type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{info.purchases} sold</span>
                    <span className="text-[10px] font-medium" style={{ color: '#C084FC' }}>{info.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consciousness Distribution */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
            <Sparkles size={9} className="inline mr-1" />Consciousness Levels
          </p>
          {Object.entries(consciousness_distribution).length === 0 ? (
            <p className="text-[10px] py-2" style={{ color: 'var(--text-muted)' }}>No data</p>
          ) : (
            <div className="space-y-1.5">
              {['1','2','3','4','5'].map(lvl => {
                const count = consciousness_distribution[lvl] || 0;
                const names = { '1': 'Physical', '2': 'Emotional', '3': 'Mental', '4': 'Intuitive', '5': 'Pure Consciousness' };
                const colors = { '1': '#D97706', '2': '#F472B6', '3': '#94A3B8', '4': '#8B5CF6', '5': '#FBBF24' };
                return (
                  <div key={lvl} className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: colors[lvl] }}>L{lvl} {names[lvl]}</span>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Forge Activity */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
          <Hammer size={9} className="inline mr-1" />Recent Forge Activity
        </p>
        {(recent_forges || []).length === 0 ? (
          <p className="text-[10px] py-2" style={{ color: 'var(--text-muted)' }}>No forge activity yet</p>
        ) : (
          <div className="space-y-1">
            {recent_forges.slice(0, 8).map((item, i) => {
              const rColor = RARITY_COLORS[item.rarity] || '#9CA3AF';
              return (
                <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex items-center gap-2">
                    {item.is_genesis && <Star size={9} style={{ color: '#FBBF24' }} />}
                    <span className="text-[10px] truncate max-w-[180px]" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span className="text-[8px] px-1 py-0.5 rounded uppercase" style={{ background: `${rColor}12`, color: rColor }}>{item.rarity}</span>
                  </div>
                  <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{item.category}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Broker Trades */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
          <TrendingUp size={9} className="inline mr-1" />Recent Broker Trades
        </p>
        {(recent_trades || []).length === 0 ? (
          <p className="text-[10px] py-2" style={{ color: 'var(--text-muted)' }}>No broker trades yet</p>
        ) : (
          <div className="space-y-1">
            {recent_trades.slice(0, 6).map((trade, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{trade.pack_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px]" style={{ color: '#22C55E' }}>${trade.amount_usd}</span>
                  <span className="text-[9px]" style={{ color: '#FBBF24' }}>+{trade.credits_granted}CR</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
