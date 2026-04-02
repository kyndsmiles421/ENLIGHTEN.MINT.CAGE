import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Zap, Leaf, Star, Navigation, RefreshCw,
  ChevronUp, X, Clock, Sparkles
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Custom Leaflet icons
const createNodeIcon = (color, type) => {
  const svgMap = {
    kinetic: `<circle cx="12" cy="12" r="5" fill="${color}" opacity="0.3"/><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>`,
    botanical: `<circle cx="12" cy="12" r="5" fill="${color}" opacity="0.3"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3c1.5 0 3 1 3.5 2.5C16 9 17 10.5 17 12c0 2.8-2.2 5-5 5s-5-2.2-5-5c0-1.5 1-3 1.5-4.5C9 6 10.5 5 12 5z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>`,
    star_anchor: `<circle cx="12" cy="12" r="5" fill="${color}" opacity="0.3"/><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>`,
  };

  return L.divIcon({
    html: `<svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${svgMap[type] || svgMap.kinetic}</svg>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const userIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#FBBF24;border:3px solid rgba(15,15,25,0.8);box-shadow:0 0 12px rgba(251,191,36,0.5)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function RecenterButton({ center }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(center, 15)}
      className="absolute top-3 right-3 z-[1000] w-8 h-8 rounded-lg flex items-center justify-center"
      style={{
        background: 'rgba(15,15,25,0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(251,191,36,0.15)',
      }}
      data-testid="recenter-btn"
    >
      <Navigation size={12} style={{ color: '#FBBF24' }} />
    </button>
  );
}

const RARITY_GLOW = {
  common: 'rgba(148,163,184,0.15)',
  uncommon: 'rgba(45,212,191,0.2)',
  rare: 'rgba(139,92,246,0.25)',
};

export default function CosmicMap() {
  const { authHeaders } = useAuth();
  const [userPos, setUserPos] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [harvesting, setHarvesting] = useState(false);
  const [harvestResult, setHarvestResult] = useState(null);
  const [decayStatus, setDecayStatus] = useState(null);
  const [harvestHistory, setHarvestHistory] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [loading, setLoading] = useState(true);
  const watchRef = useRef(null);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      // Use NYC fallback
      setUserPos({ lat: 40.7128, lng: -74.006 });
      setLoading(false);
      return;
    }

    const success = (pos) => {
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGeoError(null);
      setLoading(false);
    };
    const error = () => {
      setGeoError('Location access denied — using default');
      setUserPos({ lat: 40.7128, lng: -74.006 });
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
    watchRef.current = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true, maximumAge: 10000,
    });

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  // Fetch nodes when position available
  const fetchNodes = useCallback(async () => {
    if (!userPos) return;
    try {
      const res = await axios.post(`${API}/cosmic-map/nodes`, {
        lat: userPos.lat, lng: userPos.lng, radius_km: 1.0,
      }, { headers: authHeaders });
      setNodes(res.data.nodes || []);
    } catch (e) { console.error('Nodes fetch failed', e); }
  }, [userPos, authHeaders]);

  const fetchDecay = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/cosmic-map/decay-status`, { headers: authHeaders });
      setDecayStatus(res.data);
    } catch (e) { console.error('Decay fetch failed', e); }
  }, [authHeaders]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/cosmic-map/harvest-history`, { headers: authHeaders });
      setHarvestHistory(res.data);
    } catch (e) { console.error('History fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { if (userPos) { fetchNodes(); fetchDecay(); fetchHistory(); } }, [userPos, fetchNodes, fetchDecay, fetchHistory]);

  const handleHarvest = async (node) => {
    if (!userPos) return;
    setHarvesting(true);
    try {
      const res = await axios.post(`${API}/cosmic-map/harvest`, {
        node_id: node.id,
        user_lat: userPos.lat,
        user_lng: userPos.lng,
      }, { headers: authHeaders });
      setHarvestResult(res.data);
      fetchNodes();
      fetchHistory();
      fetchDecay();
    } catch (e) {
      setHarvestResult({ success: false, message: e.response?.data?.detail || 'Harvest failed' });
    }
    setHarvesting(false);
  };

  const calcDistance = (node) => {
    if (!userPos) return Infinity;
    const dlat = node.lat - userPos.lat;
    const dlng = node.lng - userPos.lng;
    return Math.sqrt((dlat * 111320) ** 2 + (dlng * 111320 * Math.cos(userPos.lat * Math.PI / 180)) ** 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Navigation size={24} style={{ color: '#FBBF24' }} />
        </motion.div>
        <p className="text-[10px] ml-3" style={{ color: 'var(--text-muted)' }}>Locating you in the cosmos...</p>
      </div>
    );
  }

  const center = userPos || { lat: 40.7128, lng: -74.006 };

  return (
    <div className="min-h-screen relative" data-testid="cosmic-map-page">
      {/* Map fills viewport */}
      <div className="absolute inset-0 pt-14">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          className="w-full h-full"
          style={{ background: '#0a0a14' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <RecenterButton center={[center.lat, center.lng]} />

          {/* User position */}
          <Marker position={[center.lat, center.lng]} icon={userIcon}>
            <Popup className="cosmic-popup">
              <span style={{ color: '#FBBF24', fontSize: '11px' }}>You are here</span>
            </Popup>
          </Marker>

          {/* Nodes */}
          {nodes.map(node => (
            <React.Fragment key={node.id}>
              <Circle
                center={[node.lat, node.lng]}
                radius={node.harvest_radius_meters}
                pathOptions={{
                  color: node.color,
                  fillColor: node.color,
                  fillOpacity: node.harvested ? 0.03 : 0.08,
                  weight: node.harvested ? 0.5 : 1,
                  opacity: node.harvested ? 0.2 : 0.4,
                }}
              />
              <Marker
                position={[node.lat, node.lng]}
                icon={createNodeIcon(node.harvested ? '#555' : node.color, node.type)}
                eventHandlers={{ click: () => setSelectedNode(node) }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* Overlay HUD */}
      <div className="absolute top-16 left-3 right-3 z-[1000] pointer-events-none">
        {/* Decay warning */}
        {decayStatus?.at_risk && (
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: decayStatus.pulse_speed || 1.5, repeat: Infinity }}
            className="mb-2 px-3 py-1.5 rounded-lg pointer-events-auto"
            style={{
              background: 'rgba(239,68,68,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            data-testid="decay-warning"
          >
            <p className="text-[8px] text-center" style={{ color: '#EF4444' }}>
              Resonance Decay: {decayStatus.days_inactive.toFixed(1)} days inactive — engage to stop the leak
            </p>
          </motion.div>
        )}

        {/* Compass bar */}
        <div className="rounded-xl px-3 py-2 pointer-events-auto"
          style={{
            background: 'rgba(15,15,25,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(248,250,252,0.06)',
          }}
          data-testid="map-hud"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <MapPin size={10} style={{ color: '#FBBF24' }} />
              <span className="text-[8px] font-mono" style={{ color: '#FBBF24' }}>
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <Zap size={8} style={{ color: '#F59E0B' }} />
              <span className="text-[8px]" style={{ color: '#F59E0B' }}>
                {nodes.filter(n => n.type === 'kinetic' && !n.harvested).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Leaf size={8} style={{ color: '#2DD4BF' }} />
              <span className="text-[8px]" style={{ color: '#2DD4BF' }}>
                {nodes.filter(n => n.type === 'botanical' && !n.harvested).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={8} style={{ color: '#8B5CF6' }} />
              <span className="text-[8px]" style={{ color: '#8B5CF6' }}>
                {nodes.filter(n => n.type === 'star_anchor' && !n.harvested).length}
              </span>
            </div>
            <button onClick={() => { fetchNodes(); fetchDecay(); }}
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(248,250,252,0.04)' }}
              data-testid="refresh-nodes-btn"
            >
              <RefreshCw size={9} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Today's harvest summary */}
          {harvestHistory && harvestHistory.today_count > 0 && (
            <div className="flex items-center gap-2 mt-1.5 pt-1.5" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
              <span className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Today</span>
              <span className="text-[7px] font-mono" style={{ color: '#F59E0B' }}>
                +{harvestHistory.today_rewards.kinetic_dust} Dust
              </span>
              <span className="text-[7px] font-mono" style={{ color: '#2DD4BF' }}>
                +{harvestHistory.today_rewards.science_resonance} Res
              </span>
              <span className="text-[7px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                {harvestHistory.today_count} harvests
              </span>
            </div>
          )}
        </div>
        {geoError && (
          <p className="text-[7px] mt-1 text-center" style={{ color: 'rgba(239,68,68,0.7)' }}>{geoError}</p>
        )}
      </div>

      {/* Node detail slide-up panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-[1001] rounded-t-2xl px-4 pt-4 pb-8"
            style={{
              background: 'rgba(15,15,25,0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderTop: `2px solid ${selectedNode.color}40`,
            }}
            data-testid="node-detail-panel"
          >
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setSelectedNode(null); setHarvestResult(null); }}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(248,250,252,0.05)' }}
                data-testid="close-node-panel">
                <X size={10} style={{ color: 'var(--text-muted)' }} />
              </button>
              <ChevronUp size={10} style={{ color: selectedNode.color }} />
              <span className="text-[10px] font-medium" style={{ color: selectedNode.color }}>
                {selectedNode.name}
              </span>
              <span className="text-[7px] uppercase px-1.5 py-0.5 rounded-full ml-auto"
                style={{
                  background: RARITY_GLOW[selectedNode.rarity] || 'rgba(148,163,184,0.1)',
                  color: selectedNode.color,
                }}>
                {selectedNode.rarity}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-lg" style={{ background: `${selectedNode.color}08`, border: `1px solid ${selectedNode.color}15` }}>
                <p className="text-[10px] font-mono" style={{ color: selectedNode.color }}>+{selectedNode.reward_amount}</p>
                <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  {selectedNode.reward_type.replace('_', ' ')}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-primary)' }}>{Math.round(calcDistance(selectedNode))}m</p>
                <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Distance</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-primary)' }}>{selectedNode.harvest_radius_meters}m</p>
                <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Range</p>
              </div>
            </div>

            {selectedNode.harvested ? (
              <div className="text-center py-2 rounded-lg" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
                <p className="text-[9px] flex items-center justify-center gap-1" style={{ color: '#2DD4BF' }}>
                  <Sparkles size={10} /> Already harvested today
                </p>
              </div>
            ) : calcDistance(selectedNode) <= selectedNode.harvest_radius_meters ? (
              <button
                onClick={() => handleHarvest(selectedNode)}
                disabled={harvesting}
                className="w-full py-2.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                style={{
                  background: `${selectedNode.color}15`,
                  color: selectedNode.color,
                  border: `1px solid ${selectedNode.color}25`,
                }}
                data-testid="harvest-btn"
              >
                {harvesting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <RefreshCw size={12} />
                  </motion.div>
                ) : (
                  <Zap size={12} />
                )}
                {harvesting ? 'Harvesting...' : 'Harvest Node'}
              </button>
            ) : (
              <div className="text-center py-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  Move within {selectedNode.harvest_radius_meters}m to harvest ({Math.round(calcDistance(selectedNode))}m away)
                </p>
              </div>
            )}

            {/* Harvest result */}
            {harvestResult && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-2.5 rounded-lg"
                style={{
                  background: harvestResult.success ? 'rgba(45,212,191,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${harvestResult.success ? 'rgba(45,212,191,0.15)' : 'rgba(239,68,68,0.15)'}`,
                }}
                data-testid="harvest-result"
              >
                <p className="text-[9px]" style={{ color: harvestResult.success ? '#2DD4BF' : '#EF4444' }}>
                  {harvestResult.message}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
