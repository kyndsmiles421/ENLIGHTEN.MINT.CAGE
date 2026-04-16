import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Globe, MapPin, Eye, Sparkles, Users, Zap, ChevronRight,
  Atom, Ghost, Target, AlertTriangle, Radio
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RARITY_COLORS = {
  common: '#94A3B8',
  uncommon: '#2DD4BF',
  rare: '#8B5CF6',
  legendary: '#FBBF24',
};

function HotspotDot({ spot, maxCount }) {
  const intensity = Math.min(spot.collapse_count / Math.max(maxCount, 1), 1);
  const color = RARITY_COLORS[spot.dominant_rarity] || '#8B5CF6';
  const size = 8 + intensity * 20;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1, opacity: [0.5, 1, 0.5] }}
      transition={{ opacity: { duration: 3, repeat: Infinity }, scale: { duration: 0.5 } }}
      className="absolute rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `${color}30`,
        border: `1px solid ${color}50`,
        boxShadow: `0 0 ${size}px ${color}20`,
        left: `${((spot.lng + 180) / 360) * 100}%`,
        top: `${((90 - spot.lat) / 180) * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
      title={`${spot.collapse_count} collapses | ${spot.dominant_rarity}`}
      data-testid={`shadow-hotspot-${spot.lat}-${spot.lng}`}
    />
  );
}

export default function CollectiveShadowMap() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [hotspots, setHotspots] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/dimensions/collective-shadow-map`, { headers: authHeaders });
      setHotspots(res.data.hotspots || []);
      setGlobalStats(res.data.global_stats || {});
      setDescription(res.data.map_description || '');
    } catch (e) { console.error('Shadow map fetch failed', e); }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Globe size={28} style={{ color: '#8B5CF6' }} />
        </motion.div>
      </div>
    );
  }

  const maxCount = Math.max(...hotspots.map(h => h.collapse_count), 1);

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-2xl mx-auto space-y-5" data-testid="collective-shadow-map-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Collective Shadow Map
        </h1>
        <p className="text-[10px] max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      </motion.div>

      {/* Global Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Shadows Collapsed', value: globalStats.total_collapsed || 0, color: '#EF4444', icon: Eye },
          { label: 'Dust Liberated', value: globalStats.total_dust || 0, color: '#2DD4BF', icon: Sparkles },
          { label: 'Observers', value: globalStats.player_count || 0, color: '#8B5CF6', icon: Users },
        ].map(s => (
          <div key={s.label} className="text-center p-2.5 rounded-xl"
            style={{ background: `${s.color}04`, border: `1px solid ${s.color}08` }}>
            <s.icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-sm font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {s.value}
            </p>
            <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* World map visualization */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="rounded-xl overflow-hidden relative"
        style={{
          background: 'rgba(0,0,0,0)',
          border: '1px solid rgba(139,92,246,0.1)',
          height: '280px',
        }}
        data-testid="shadow-world-map"
      >
        {/* Grid lines */}
        {[...Array(7)].map((_, i) => (
          <div key={`h${i}`} className="absolute left-0 right-0 h-px"
            style={{ top: `${(i + 1) * 12.5}%`, background: 'rgba(139,92,246,0.05)' }} />
        ))}
        {[...Array(11)].map((_, i) => (
          <div key={`v${i}`} className="absolute top-0 bottom-0 w-px"
            style={{ left: `${(i + 1) * 8.33}%`, background: 'rgba(139,92,246,0.05)' }} />
        ))}

        {/* Hotspot dots */}
        {hotspots.map((spot, i) => (
          <HotspotDot key={i} spot={spot} maxCount={maxCount} />
        ))}

        {/* Overlay text when empty */}
        {hotspots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Ghost size={28} style={{ color: 'rgba(139,92,246,0.3)' }} className="mx-auto" />
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                No shadow collapses recorded yet
              </p>
              <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                Be the first to observe and map the Collective Unconscious
              </p>
            </div>
          </div>
        )}

        {/* Map label */}
        <div className="absolute bottom-2 left-2">
          <span className="text-[7px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0)', color: 'var(--text-muted)', border: '1px solid rgba(248,250,252,0.06)' }}>
            <Globe size={7} className="inline mr-1" />
            {hotspots.length} active regions
          </span>
        </div>
      </motion.div>

      {/* Rarity legend */}
      <div className="flex items-center justify-center gap-3">
        {Object.entries(RARITY_COLORS).map(([rarity, color]) => (
          <span key={rarity} className="text-[8px] flex items-center gap-1" style={{ color }}>
            <div className="w-2 h-2 rounded-full" style={{ background: `${color}40`, border: `1px solid ${color}` }} />
            {rarity}
          </span>
        ))}
      </div>

      {/* Hotspot list */}
      {hotspots.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <MapPin size={11} style={{ color: '#EF4444' }} />
            <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
              Active Shadow Regions
            </span>
          </div>
          {hotspots.slice(0, 8).map((spot, i) => {
            const color = RARITY_COLORS[spot.dominant_rarity] || '#8B5CF6';
            return (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: `${color}04`, border: `1px solid ${color}08` }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                    {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}
                  </p>
                </div>
                <span className="text-[8px]" style={{ color }}>{spot.collapse_count} collapses</span>
                <span className="text-[8px]" style={{ color: '#2DD4BF' }}>+{spot.total_dust} dust</span>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <button onClick={() => navigate('/quantum-field')}
        className="w-full py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.12)' }}
        data-testid="observe-cta"
      >
        <Eye size={12} /> Observe Shadow Sprites <ChevronRight size={10} />
      </button>
    </div>
  );
}
