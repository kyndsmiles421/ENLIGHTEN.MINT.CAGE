import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  MapPin, Mountain, Droplets, Flame, Wind, Sparkles,
  Navigation, RefreshCw, Clock, Gem, Coins, AlertTriangle,
  ChevronDown, ChevronUp, Zap, Globe, Crosshair, History
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = {
  earth: Mountain,
  water: Droplets,
  fire: Flame,
  air: Wind,
  ether: Sparkles,
};

const TIER_STYLES = {
  common:    { bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)', label: 'Common', color: '#94A3B8' },
  uncommon:  { bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.15)', label: 'Uncommon', color: '#22C55E' },
  rare:      { bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.15)', label: 'Rare', color: '#8B5CF6' },
  legendary: { bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.15)', label: 'Legendary', color: '#FBBF24' },
};

function formatDistance(m) {
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function BearingArrow({ bearing, color }) {
  return (
    <div className="w-5 h-5 flex items-center justify-center" style={{ transform: `rotate(${bearing}deg)` }}>
      <Navigation size={12} style={{ color }} />
    </div>
  );
}

function HotspotCard({ hotspot, onCollect, collecting }) {
  const [expanded, setExpanded] = useState(false);
  const ElIcon = ELEMENT_ICONS[hotspot.element] || Sparkles;
  const tierStyle = TIER_STYLES[hotspot.tier] || TIER_STYLES.common;
  const elemData = hotspot.element_data || {};
  const canCollect = hotspot.in_range && !hotspot.on_cooldown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: tierStyle.bg,
        border: `1px solid ${tierStyle.border}`,
      }}
      data-testid={`hotspot-card-${hotspot.id}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3"
        data-testid={`hotspot-header-${hotspot.id}`}
      >
        {/* Element icon */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: `${elemData.color || tierStyle.color}12`,
            border: `1px solid ${elemData.color || tierStyle.color}25`,
            boxShadow: hotspot.in_range ? `0 0 12px ${elemData.color || tierStyle.color}20` : 'none',
          }}>
          <ElIcon size={15} style={{ color: elemData.color || tierStyle.color }} />
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium truncate" style={{
              color: 'var(--text-primary)',
              fontFamily: 'Cormorant Garamond, serif',
            }}>
              {hotspot.name}
            </h3>
            {hotspot.dynamic && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0"
                style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.15)' }}>
                Dynamic
              </span>
            )}
            {!hotspot.dynamic && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0"
                style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.15)' }}>
                Sacred Site
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px]" style={{ color: tierStyle.color }}>{tierStyle.label}</span>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>&middot;</span>
            <span className="text-[9px] capitalize" style={{ color: elemData.color || 'var(--text-muted)' }}>{hotspot.element}</span>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>&middot;</span>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{elemData.frequency}Hz</span>
          </div>
        </div>

        {/* Distance + direction */}
        <div className="text-right shrink-0 flex items-center gap-1.5">
          <BearingArrow bearing={hotspot.bearing || 0} color={elemData.color || '#94A3B8'} />
          <div>
            <p className="text-xs font-medium" style={{
              color: hotspot.in_range ? '#22C55E' : 'var(--text-secondary)',
            }}>
              {formatDistance(hotspot.distance_m)}
            </p>
            {hotspot.in_range && (
              <p className="text-[7px] uppercase tracking-widest" style={{ color: '#22C55E' }}>In Range</p>
            )}
          </div>
          {expanded ? <ChevronUp size={12} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {/* Lore */}
              <p className="text-[10px] italic leading-relaxed" style={{
                color: 'var(--text-secondary)',
                fontFamily: 'Cormorant Garamond, serif',
              }}>
                "{hotspot.lore}"
              </p>

              {/* Cooldown info */}
              {hotspot.on_cooldown && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                  style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.12)' }}>
                  <Clock size={10} style={{ color: '#FB923C' }} />
                  <span className="text-[9px]" style={{ color: '#FB923C' }}>
                    Cooldown — available {new Date(hotspot.cooldown_until).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Rewards hint */}
              <div className="flex items-center gap-3">
                <span className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Potential:</span>
                <span className="text-[9px] flex items-center gap-1" style={{ color: '#2DD4BF' }}>
                  <Coins size={9} /> Dust
                </span>
                <span className="text-[9px] flex items-center gap-1" style={{ color: '#FBBF24' }}>
                  <Sparkles size={9} /> XP
                </span>
                <span className="text-[9px] flex items-center gap-1" style={{ color: '#D97706' }}>
                  <Gem size={9} /> Gem ({Math.round((hotspot.tier === 'legendary' ? 85 : hotspot.tier === 'rare' ? 50 : hotspot.tier === 'uncommon' ? 25 : 10))}%)
                </span>
              </div>

              {/* Collect button */}
              {canCollect ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCollect(hotspot)}
                  disabled={collecting}
                  className="w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${elemData.color || tierStyle.color}15, ${elemData.color || tierStyle.color}08)`,
                    color: elemData.color || tierStyle.color,
                    border: `1px solid ${elemData.color || tierStyle.color}25`,
                    boxShadow: `0 0 15px ${elemData.color || tierStyle.color}10`,
                  }}
                  data-testid={`collect-hotspot-${hotspot.id}`}
                >
                  <Zap size={12} />
                  {collecting ? 'Channeling...' : 'Channel Energy'}
                </motion.button>
              ) : !hotspot.in_range ? (
                <div className="flex items-center gap-2 py-1.5">
                  <MapPin size={10} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    Move within 300m to channel this node
                  </span>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CollectionHistory({ authHeaders }) {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/hotspots/history`, { headers: authHeaders })
      .then(r => {
        setHistory(r.data.history || []);
        setTotal(r.data.total_collections || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authHeaders]);

  if (loading) return null;
  if (history.length === 0) return (
    <div className="text-center py-6">
      <History size={18} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No collections yet. Find a hotspot nearby!</p>
    </div>
  );

  return (
    <div className="space-y-2" data-testid="collection-history">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
          Collection Log ({total} total)
        </span>
      </div>
      {history.slice(-10).reverse().map((h, i) => {
        const ElIcon = ELEMENT_ICONS[h.element] || Sparkles;
        return (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg"
            style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
            <ElIcon size={12} style={{ color: TIER_STYLES[h.tier]?.color || '#94A3B8' }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] truncate" style={{ color: 'var(--text-primary)' }}>{h.hotspot_name}</p>
              <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                +{h.dust} Dust &middot; +{h.xp} XP
                {h.gem && <span style={{ color: '#D97706' }}> &middot; {h.gem.name}</span>}
              </p>
            </div>
            <span className="text-[8px] shrink-0" style={{ color: 'var(--text-muted)' }}>
              {new Date(h.timestamp).toLocaleDateString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function GPSRadar() {
  const { authHeaders } = useAuth();
  const { position, error, loading: geoLoading, permissionState, requestPosition } = useGeolocation();
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [refreshInfo, setRefreshInfo] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [collectRadius, setCollectRadius] = useState(300);

  const fetchHotspots = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/hotspots/nearby`, {
        params: { lat, lng, radius: 50000 },
        headers: authHeaders,
      });
      setHotspots(res.data.hotspots || []);
      setCollectRadius(res.data.collect_radius_m || 300);
      setRefreshInfo({
        dynamic_refresh_hours: res.data.dynamic_refresh_hours,
        total: res.data.total_nearby,
      });
    } catch {
      toast.error('Failed to load nearby hotspots');
    }
    setLoading(false);
  }, [authHeaders]);

  // Fetch hotspots when position updates
  useEffect(() => {
    if (position) fetchHotspots(position.lat, position.lng);
  }, [position, fetchHotspots]);

  const handleCollect = async (hotspot) => {
    if (!position) return;
    setCollecting(true);
    try {
      const res = await axios.post(`${API}/hotspots/collect`, {
        hotspot_id: hotspot.id,
        lat: position.lat,
        lng: position.lng,
      }, { headers: authHeaders });

      const r = res.data.rewards;
      let msg = `+${r.dust} Dust, +${r.xp} XP`;
      if (r.gem) msg += ` and a ${r.gem.name}!`;

      toast.success(`${res.data.hotspot} channeled!`, { description: msg, duration: 5000 });

      // Refresh hotspot list
      fetchHotspots(position.lat, position.lng);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Collection failed');
    }
    setCollecting(false);
  };

  const inRange = hotspots.filter(h => h.in_range);
  const outOfRange = hotspots.filter(h => !h.in_range);

  return (
    <div className="space-y-4" data-testid="gps-radar-panel">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Globe size={18} style={{ color: '#2DD4BF' }} />
          <h2 className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            Energy Hotspots
          </h2>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Sacred sites and dynamic nodes pulse with collectible energy
        </p>
      </div>

      {/* Location status */}
      {!position && (
        <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}>
          {permissionState === 'denied' ? (
            <>
              <AlertTriangle size={20} className="mx-auto mb-2" style={{ color: '#FB923C' }} />
              <p className="text-xs mb-1" style={{ color: '#FB923C' }}>Location Permission Denied</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Enable location in your browser settings to discover nearby hotspots.
              </p>
            </>
          ) : (
            <>
              <Crosshair size={20} className="mx-auto mb-3" style={{ color: '#2DD4BF' }} />
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                Allow location access to discover energy nodes near you
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={requestPosition}
                disabled={geoLoading}
                className="px-5 py-2 rounded-lg text-sm font-medium mx-auto"
                style={{
                  background: 'rgba(45,212,191,0.1)',
                  color: '#2DD4BF',
                  border: '1px solid rgba(45,212,191,0.2)',
                }}
                data-testid="enable-location-btn"
              >
                <MapPin size={12} className="inline mr-1.5" />
                {geoLoading ? 'Locating...' : 'Enable Location'}
              </motion.button>
            </>
          )}
          {error && (
            <p className="text-[10px] mt-2" style={{ color: '#EF4444' }}>{error}</p>
          )}
        </div>
      )}

      {/* Active radar */}
      {position && (
        <>
          {/* Position info + refresh */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22C55E' }} />
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                {position.accuracy && ` (${Math.round(position.accuracy)}m acc)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 rounded-lg transition-all"
                style={{ background: showHistory ? 'rgba(251,191,36,0.08)' : 'transparent', color: showHistory ? '#FBBF24' : 'var(--text-muted)' }}
                data-testid="toggle-history-btn">
                <History size={13} />
              </button>
              <button onClick={requestPosition}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                style={{ color: 'var(--text-muted)' }}
                data-testid="refresh-location-btn">
                <RefreshCw size={13} className={geoLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.08)' }}>
              <p className="text-sm font-light" style={{ color: '#22C55E', fontFamily: 'Cormorant Garamond, serif' }}>{inRange.length}</p>
              <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>In Range</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
              <p className="text-sm font-light" style={{ color: '#8B5CF6', fontFamily: 'Cormorant Garamond, serif' }}>{outOfRange.length}</p>
              <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Nearby</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
              <p className="text-sm font-light" style={{ color: '#2DD4BF', fontFamily: 'Cormorant Garamond, serif' }}>{collectRadius}m</p>
              <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Collect Radius</p>
            </div>
          </div>

          {/* History toggle */}
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <CollectionHistory authHeaders={authHeaders} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(45,212,191,0.2)', borderTopColor: '#2DD4BF' }} />
            </div>
          )}

          {/* In-range hotspots */}
          {!loading && inRange.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5"
                style={{ color: '#22C55E' }}>
                <Zap size={10} /> Within Channeling Range
              </p>
              {inRange.map(h => (
                <HotspotCard key={h.id} hotspot={h} onCollect={handleCollect} collecting={collecting} />
              ))}
            </div>
          )}

          {/* Out-of-range hotspots */}
          {!loading && outOfRange.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}>
                <MapPin size={10} /> Nearby Nodes
              </p>
              {outOfRange.map(h => (
                <HotspotCard key={h.id} hotspot={h} onCollect={handleCollect} collecting={collecting} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && hotspots.length === 0 && (
            <div className="text-center py-10">
              <Globe size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No hotspots detected in this area</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Dynamic nodes spawn within 2km of your position every {refreshInfo?.dynamic_refresh_hours || 4} hours
              </p>
            </div>
          )}

          {/* Info footer */}
          {refreshInfo && (
            <div className="rounded-lg p-3" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
              <div className="space-y-1.5">
                <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                  <Globe size={8} className="inline mr-1" style={{ color: '#2DD4BF' }} />
                  <strong>Dynamic Nodes</strong> spawn within 2km of you and refresh every {refreshInfo.dynamic_refresh_hours}h.
                </p>
                <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin size={8} className="inline mr-1" style={{ color: '#FBBF24' }} />
                  <strong>Sacred Sites</strong> are permanent landmarks at real-world locations.
                </p>
                <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                  <Gem size={8} className="inline mr-1" style={{ color: '#D97706' }} />
                  <strong>Rewards</strong> include Cosmic Dust, XP, and raw gems for the Refinement Lab.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
