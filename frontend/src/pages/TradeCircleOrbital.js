import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCosmicState } from '../context/CosmicStateContext';
import { OrbitalHubBase } from '../components/OrbitalHubBase';
import { NanoGuide } from '../components/NanoGuide';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowRightLeft, Eye, Heart, Compass, Moon, Gem, Zap, Leaf,
  Package, Wrench, Shield, Sparkles, Star, Crown, User,
  ArrowLeft, X, Loader2, TrendingUp,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CAT_META = {
  readings:  { icon: Eye,         color: '#C084FC' },
  healing:   { icon: Heart,       color: '#FDA4AF' },
  guidance:  { icon: Compass,     color: '#2DD4BF' },
  meditation:{ icon: Moon,        color: '#818CF8' },
  crafted:   { icon: Gem,         color: '#FCD34D' },
  botanical: { icon: Leaf,        color: '#22C55E' },
  frequency_recipe: { icon: Zap,  color: '#EAB308' },
  goods:     { icon: Package,     color: '#FB923C' },
  services:  { icon: Wrench,      color: '#2DD4BF' },
};

function generateTradePlanets(listings, stats, hexBits) {
  const planets = [];

  // Category nodes from actual listings
  const catCounts = {};
  (listings || []).forEach(l => {
    const c = l.category || 'goods';
    catCounts[c] = (catCounts[c] || 0) + 1;
  });
  Object.entries(catCounts).forEach(([cat, count]) => {
    const meta = CAT_META[cat] || { icon: Package, color: '#94A3B8' };
    planets.push({
      id: `cat-${cat}`,
      label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${count})`,
      icon: meta.icon,
      color: meta.color,
      desc: `${count} active listing${count > 1 ? 's' : ''}`,
      data: { type: 'category', category: cat, listings: listings.filter(l => l.category === cat) },
    });
  });

  // Stats node
  if (stats) {
    planets.push({
      id: 'stats',
      label: 'Market Stats',
      icon: TrendingUp,
      color: '#3B82F6',
      desc: `${stats.total_listings || 0} total listings`,
      data: { type: 'stats', stats },
    });
  }

  // Escrow node
  planets.push({
    id: 'escrow',
    label: 'Escrow',
    icon: Shield,
    color: '#818CF8',
    desc: 'Secure trade management',
    data: { type: 'escrow' },
  });

  // Forge node (locked behind bit 4 — recipe created)
  planets.push({
    id: 'forge',
    label: 'Cosmic Forge',
    icon: Gem,
    color: '#D97706',
    desc: 'Craft unique items',
    data: { type: 'forge' },
    requiredBit: 4,
  });

  // Genesis node (locked behind bit 5 — trade completed)
  planets.push({
    id: 'genesis',
    label: 'Genesis Mint',
    icon: Star,
    color: '#FBBF24',
    desc: 'Create origin tokens',
    data: { type: 'genesis' },
    requiredBit: 5,
  });

  // Karma node
  planets.push({
    id: 'karma',
    label: 'Karma',
    icon: Crown,
    color: '#C084FC',
    desc: 'Reputation & trust scores',
    data: { type: 'karma' },
  });

  return planets;
}

function TradeDetailPanel({ planet, onClose }) {
  if (!planet) return null;
  const data = planet.data;
  const Icon = planet.icon;

  return (
    <motion.div
      className="absolute right-4 top-16 z-40 rounded-2xl overflow-hidden overflow-y-auto"
      style={{
        width: 340, maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(0,0,0,0)', backdropFilter: 'none',
        border: '1px solid rgba(248,250,252,0.06)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.1)',
      }}
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      onClick={e => e.stopPropagation()}
      data-testid="trade-orbital-detail-panel"
    >
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: planet.color }} />
          <span className="text-xs font-medium" style={{ color: planet.color }}>{planet.label}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5">
          <X size={14} style={{ color: 'rgba(255,255,255,0.65)' }} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {data?.type === 'category' && (
          <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
            {(data.listings || []).map(l => (
              <div key={l.id} className="flex items-center gap-2 px-2 py-2 rounded-lg"
                style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: planet.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{l.title}</p>
                  <p className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                    Mass: {l.mass || l.gravity_mass || '—'}
                  </p>
                </div>
                <span className="text-[8px] font-mono" style={{ color: planet.color }}>
                  {l.visual_scale ? `${l.visual_scale.toFixed(1)}x` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
        {data?.type === 'stats' && (
          <div className="space-y-2">
            {Object.entries(data.stats).filter(([k]) => k !== '_id').map(([key, val]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-[9px] capitalize" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {typeof val === 'number' ? val : String(val)}
                </span>
              </div>
            ))}
          </div>
        )}
        {data?.type === 'escrow' && (
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Server-side escrow management for secure trades. Navigate to the full Trade Circle for escrow operations.
          </p>
        )}
        {data?.type === 'forge' && (
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Craft unique items by combining frequency recipes. Requires at least one Suanpan export.
          </p>
        )}
        {data?.type === 'genesis' && (
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Mint origin tokens for your crafted items. Requires at least one completed trade.
          </p>
        )}
        {data?.type === 'karma' && (
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Your reputation and trust metrics in the Trade Circle ecosystem.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function TradeCircleOrbital() {
  const navigate = useNavigate();
  const { authHeaders, loading: authLoading, token } = useAuth();
  const { cosmicState, fetchCosmicState } = useCosmicState();

  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const [listRes, statsRes] = await Promise.all([
        axios.get(`${API}/trade-circle/listings`, { headers: authHeaders }),
        axios.get(`${API}/trade-circle/stats`, { headers: authHeaders }),
      ]);
      setListings(listRes.data.listings || []);
      setStats(statsRes.data || null);
    } catch {
      toast.error('Failed to load trade data');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, authLoading, token]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (token) fetchCosmicState(); }, [token, fetchCosmicState]);

  const hexagram = cosmicState?.hexagram;
  const planets = useMemo(() =>
    generateTradePlanets(listings, stats, hexagram?.bits),
    [listings, stats, hexagram]
  );

  const sun = {
    id: 'trade-center',
    label: 'Trade Circle',
    subtitle: `${listings.length} listings`,
    icon: ArrowRightLeft,
    color: '#C084FC',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
        <Loader2 className="animate-spin" size={28} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  return (
    <OrbitalHubBase
      sun={sun} planets={planets}
      onPlanetSelect={setSelectedPlanet}
      onBack={() => navigate('/hub')}
      depth={0} hexagram={hexagram} showSparkline={true}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
          style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
          data-testid="trade-orbital-back">
          <ArrowLeft size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>
        <span className="text-[9px] uppercase tracking-[0.15em]"
          style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>
          Trade Orbital
        </span>
        <NanoGuide guideId="trade-circle" position="top-right" />
      </div>

      {/* Full page link */}
      <div className="absolute bottom-24 right-20 z-30">
        <button onClick={() => navigate('/trade-circle')}
          className="px-3 py-1.5 rounded-full text-[8px] font-medium uppercase tracking-wider"
          style={{
            background: 'rgba(248,250,252,0.04)', color: 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(248,250,252,0.06)',
          }}
          data-testid="switch-to-full-trade">
          Full Trade View
        </button>
      </div>

      <AnimatePresence>
        {selectedPlanet && (
          <TradeDetailPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
        )}
      </AnimatePresence>
    </OrbitalHubBase>
  );
}
