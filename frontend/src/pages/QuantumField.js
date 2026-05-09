import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Eye, Zap, Atom, MapPin, Radio, Shield, Sparkles,
  Ghost, Target, AlertTriangle, Trophy, Compass,
  Link2, Users, ChevronRight, Lock
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RARITY_STYLES = {
  common:    { color: '#94A3B8', bg: '#94A3B808', border: '#94A3B812', label: 'Common' },
  uncommon:  { color: '#2DD4BF', bg: '#2DD4BF08', border: '#2DD4BF12', label: 'Uncommon' },
  rare:      { color: '#8B5CF6', bg: '#8B5CF608', border: '#8B5CF612', label: 'Rare' },
  legendary: { color: '#FBBF24', bg: '#FBBF2408', border: '#FBBF2412', label: 'Legendary' },
};

const SHADOW_ICONS = {
  echo: Radio,
  fragment: AlertTriangle,
  archetype: Ghost,
  doppelganger: Target,
};

function SpriteCard({ sprite, onObserve, observing }) {
  const rarity = RARITY_STYLES[sprite.rarity] || RARITY_STYLES.common;
  const Icon = SHADOW_ICONS[sprite.type] || Ghost;
  const collapsed = sprite.state === 'collapsed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-3 relative overflow-hidden"
      style={{
        background: collapsed ? 'rgba(248,250,252,0.01)' : rarity.bg,
        border: `1px solid ${collapsed ? 'rgba(248,250,252,0.04)' : rarity.border}`,
        opacity: collapsed ? 0.5 : 1,
      }}
      data-testid={`sprite-${sprite.sprite_id}`}
    >
      {/* Superposition shimmer */}
      {!collapsed && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.02, 0.08, 0.02] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ background: `radial-gradient(ellipse at 30% 50%, ${rarity.color}10 0%, transparent 70%)` }}
        />
      )}

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: collapsed ? 'rgba(248,250,252,0.02)' : `${rarity.color}08`,
            border: `1px solid ${collapsed ? 'rgba(248,250,252,0.04)' : `${rarity.color}15`}`,
          }}>
          {collapsed ? (
            <Shield size={14} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Icon size={14} style={{ color: rarity.color }} />
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-medium truncate"
              style={{ color: collapsed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
              {sprite.name}
            </h3>
            <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0"
              style={{ background: rarity.bg, color: rarity.color, border: `1px solid ${rarity.border}` }}>
              {rarity.label}
            </span>
          </div>

          <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {collapsed ? 'Wave function collapsed — integrated' : sprite.description}
          </p>

          {!collapsed && (
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[8px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={7} /> {sprite.distance_m}m
              </span>
              <span className="text-[8px] flex items-center gap-0.5" style={{ color: '#2DD4BF' }}>
                <Sparkles size={7} /> {sprite.dust_range[0]}-{sprite.dust_range[1]} dust
              </span>
              <span className="text-[8px] flex items-center gap-0.5" style={{ color: '#F472B6' }}>
                <Zap size={7} /> +{sprite.xp} XP
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        {!collapsed && (
          <button
            onClick={() => onObserve(sprite)}
            disabled={sprite.distance_m > 50 || observing}
            className="shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-medium flex items-center gap-1 transition-all hover:scale-[1.03] disabled:opacity-30"
            style={{
              background: sprite.distance_m <= 50 ? `${rarity.color}10` : 'rgba(248,250,252,0.02)',
              color: sprite.distance_m <= 50 ? rarity.color : 'var(--text-muted)',
              border: `1px solid ${sprite.distance_m <= 50 ? `${rarity.color}20` : 'rgba(248,250,252,0.04)'}`,
            }}
            data-testid={`observe-${sprite.sprite_id}`}
          >
            <Eye size={10} /> {sprite.distance_m <= 50 ? 'Observe' : 'Too far'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CollapseModal({ result, onClose }) {
  if (!result) return null;
  const rarity = RARITY_STYLES[result.sprite?.rarity] || RARITY_STYLES.common;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full flex flex-col p-4"
      style={{ background: 'rgba(2,2,8,0.9)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="w-full max-w-sm rounded-xl p-5 text-center space-y-3"
        style={{ background: 'rgba(0,0,0,0)', border: `1px solid ${rarity.color}20` }}
        onClick={e => e.stopPropagation()}
        data-testid="collapse-modal"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: 2 }}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ background: `${rarity.color}10`, border: `2px solid ${rarity.color}25` }}
        >
          <Eye size={24} style={{ color: rarity.color }} />
        </motion.div>

        <h2 className="text-sm font-light" style={{ color: rarity.color, fontFamily: 'Cormorant Garamond, serif' }}>
          Wave Function Collapsed
        </h2>

        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {result.message}
        </p>

        {/* Integration prompt */}
        <div className="rounded-lg p-3" style={{ background: `${rarity.color}04`, border: `1px solid ${rarity.color}08` }}>
          <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: rarity.color }}>Integration Prompt</p>
          <p className="text-[10px] italic" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            "{result.sprite?.integration_prompt}"
          </p>
        </div>

        {/* Rewards */}
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <p className="text-lg font-light" style={{ color: '#2DD4BF', fontFamily: 'Cormorant Garamond, serif' }}>
              +{result.rewards?.dust}
            </p>
            <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Dust</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-light" style={{ color: '#F472B6', fontFamily: 'Cormorant Garamond, serif' }}>
              +{result.rewards?.xp}
            </p>
            <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>XP</p>
          </div>
        </div>

        <button onClick={onClose}
          className="w-full py-2 rounded-lg text-[10px] transition-all hover:scale-[1.01]"
          style={{ background: `${rarity.color}08`, color: rarity.color, border: `1px solid ${rarity.color}15` }}>
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}

function EntanglementPanel({ entanglements }) {
  if (!entanglements || entanglements.length === 0) return null;
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(192,132,252,0.03)', border: '1px solid rgba(192,132,252,0.06)' }}
      data-testid="entanglement-panel">
      <div className="flex items-center gap-2 mb-2">
        <Link2 size={11} style={{ color: '#C084FC' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#C084FC' }}>
          Quantum Bonds ({entanglements.length}/3)
        </span>
      </div>
      {entanglements.map(e => (
        <div key={e.bond_id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg mb-1"
          style={{ background: 'rgba(248,250,252,0.02)' }}>
          <Users size={9} style={{ color: '#C084FC' }} />
          <span className="text-[9px] flex-1" style={{ color: 'var(--text-secondary)' }}>{e.partner_name}</span>
          <span className="text-[7px] capitalize" style={{ color: 'var(--text-muted)' }}>
            {e.partner_layer?.replace('_', ' ')}
          </span>
        </div>
      ))}
    </div>
  );
}

function ShadowHistory({ history }) {
  if (!history) return null;
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.04)' }}
      data-testid="shadow-history">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy size={11} style={{ color: '#FBBF24' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Collapsed Shadows
          </span>
        </div>
        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{history.total_collapsed} total</span>
      </div>
      <div className="flex gap-2 mb-2">
        {Object.entries(history.by_rarity || {}).map(([r, count]) => {
          const style = RARITY_STYLES[r] || RARITY_STYLES.common;
          return (
            <span key={r} className="text-[8px] px-1.5 py-0.5 rounded-full"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
              {r}: {count}
            </span>
          );
        })}
      </div>
      <div className="flex gap-3">
        <span className="text-[8px]" style={{ color: '#2DD4BF' }}>
          <Sparkles size={7} className="inline" /> {history.total_dust} dust earned
        </span>
        <span className="text-[8px]" style={{ color: '#F472B6' }}>
          <Zap size={7} className="inline" /> {history.total_xp} XP earned
        </span>
      </div>
    </div>
  );
}

export default function QuantumField() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('quantum', 8); }, []);

  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [sprites, setSprites] = useState([]);
  const [superpositionCount, setSuperpositionCount] = useState(0);
  const [history, setHistory] = useState(null);
  const [entanglements, setEntanglements] = useState([]);
  const [collapseResult, setCollapseResult] = useState(null);
  const [observing, setObserving] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);

  // Get GPS position
  const requestGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      // Fallback to default coords for demo (Black Hills)
      setUserPos({ lat: 44.0805, lng: -103.2310 });
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      pos => { setGeoError(null); setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      () => {
        setGeoError('Location access denied');
        setUserPos({ lat: 44.0805, lng: -103.2310 });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => { requestGeo(); }, [requestGeo]);

  const fetchData = useCallback(async () => {
    if (!userPos) return;
    try {
      const [spritesRes, histRes, entRes] = await Promise.all([
        axios.get(`${API}/quantum/shadows/nearby?lat=${userPos.lat}&lng=${userPos.lng}`, { headers: authHeaders }),
        axios.get(`${API}/quantum/shadows/history`, { headers: authHeaders }),
        axios.get(`${API}/quantum/entanglements`, { headers: authHeaders }),
      ]);
      setSprites(spritesRes.data.sprites || []);
      setSuperpositionCount(spritesRes.data.total_in_superposition || 0);
      setHistory(histRes.data);
      setEntanglements(entRes.data.entanglements || []);
    } catch (e) {
      console.error('Quantum field fetch failed', e);
    }
    setLoading(false);
  }, [authHeaders, userPos]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleObserve = async (sprite) => {
    if (!userPos) return;
    setObserving(true);
    try {
      const res = await axios.post(`${API}/quantum/shadows/observe`, {
        sprite_id: sprite.sprite_id,
        lat: userPos.lat,
        lng: userPos.lng,
      }, { headers: authHeaders });
      setCollapseResult(res.data);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.detail || 'Observation failed');
    }
    setObserving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Ghost size={28} style={{ color: '#EF4444' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-2xl mx-auto space-y-5" data-testid="quantum-field-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Quantum Field
        </h1>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Shadow Sprites in Superposition — Observe to Collapse
        </p>
      </motion.div>

      {/* GPS Status */}
      <div className="flex items-center gap-2 justify-center flex-wrap">
        <Compass size={10} style={{ color: geoError ? '#EF4444' : '#2DD4BF' }} />
        <span className="text-[8px]" style={{ color: geoError ? '#EF4444' : 'var(--text-muted)' }}>
          {geoError ? `${geoError} (demo coords: Black Hills 44.08, -103.23)` : `${userPos?.lat.toFixed(4)}, ${userPos?.lng.toFixed(4)}`}
        </span>
        {geoError && (
          <button
            type="button"
            onClick={requestGeo}
            data-testid="quantum-retry-geo"
            className="text-[8px] px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(45,212,191,0.10)',
              color: '#2DD4BF',
              border: '1px solid rgba(45,212,191,0.25)',
              cursor: 'pointer',
            }}
          >
            Enable Location
          </button>
        )}
      </div>

      {/* Superposition counter */}
      <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.06)' }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
            <Atom size={14} style={{ color: '#EF4444' }} />
          </motion.div>
          <span className="text-lg font-light" style={{ color: '#EF4444', fontFamily: 'Cormorant Garamond, serif' }}>
            {superpositionCount}
          </span>
        </div>
        <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Shadows in Superposition
        </p>
        <p className="text-[7px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Get within 50m to observe and collapse the wave function
        </p>
      </div>

      {/* Sprites */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye size={11} style={{ color: '#EF4444' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Shadow Sprites
          </span>
        </div>
        {sprites.length === 0 ? (
          <p className="text-[10px] text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No shadow sprites detected in this quantum field
          </p>
        ) : (
          sprites.map(sprite => (
            <SpriteCard key={sprite.sprite_id} sprite={sprite} onObserve={handleObserve} observing={observing} />
          ))
        )}
      </div>

      {/* Entanglement Bonds */}
      <EntanglementPanel entanglements={entanglements} />

      {/* Shadow History */}
      <ShadowHistory history={history} />

      {/* Navigate to Planetary Depths */}
      <button
        onClick={() => navigate('/planetary-depths')}
        className="w-full py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(217,119,6,0.06)', color: '#D97706', border: '1px solid rgba(217,119,6,0.12)' }}
        data-testid="planetary-depths-cta"
      >
        <Compass size={12} /> Explore Planetary Depths <ChevronRight size={10} />
      </button>

      {/* Collapse result modal */}
      <AnimatePresence>
        {collapseResult && (
          <CollapseModal result={collapseResult} onClose={() => setCollapseResult(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
