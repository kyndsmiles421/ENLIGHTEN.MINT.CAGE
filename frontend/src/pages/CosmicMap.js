import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  MapPin, Zap, Leaf, Star, Navigation, RefreshCw,
  ChevronUp, X, Sparkles, Crown, Layers, Globe, Moon
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━━ Custom Leaflet Icons ━━━━
const createNodeIcon = (color, type) => {
  const svgMap = {
    kinetic: `<circle cx="12" cy="12" r="5" fill="${color}" opacity="0.3"/><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>`,
    botanical: `<circle cx="12" cy="12" r="5" fill="${color}" opacity="0.3"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3c1.5 0 3 1 3.5 2.5C16 9 17 10.5 17 12c0 2.8-2.2 5-5 5s-5-2.2-5-5c0-1.5 1-3 1.5-4.5C9 6 10.5 5 12 5z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>`,
    star_anchor: `<circle cx="12" cy="12" r="5" fill="${color}" opacity="0.3"/><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>`,
    power_spot: `<circle cx="12" cy="12" r="8" fill="${color}" opacity="0.15"/><circle cx="12" cy="12" r="4" fill="${color}" opacity="0.4"/><path d="M12 2l1.5 3.5L17 7l-3 2.5.5 4L12 11.5 9.5 13.5l.5-4L7 7l3.5-1.5z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>`,
  };
  return L.divIcon({
    html: `<svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${svgMap[type] || svgMap.kinetic}</svg>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const powerSpotIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;border-radius:50%;background:radial-gradient(circle,#FBBF24 0%,rgba(251,191,36,0.3) 60%,transparent 100%);border:2px solid #FBBF24;box-shadow:0 0 20px rgba(251,191,36,0.5),0 0 40px rgba(251,191,36,0.2);animation:pulse 2s infinite"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

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
      style={{ background: 'rgba(15,15,25,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(251,191,36,0.15)' }}
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
  legendary: 'rgba(251,191,36,0.3)',
};

// ━━━━ Celestial Star Chart (replaces map in celestial layer) ━━━━
function CelestialChart({ nodes, onSelect, selectedId }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Deep space background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    // Star field
    const rng = { seed: 42, next() { this.seed = (this.seed * 16807) % 2147483647; return this.seed / 2147483647; } };
    for (let i = 0; i < 200; i++) {
      const x = rng.next() * w;
      const y = rng.next() * h;
      const size = rng.next() * 1.5;
      const opacity = 0.2 + rng.next() * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248,250,252,${opacity})`;
      ctx.fill();
    }

    // Grid lines (sacred geometry feel)
    ctx.strokeStyle = 'rgba(139,92,246,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const y = (i / 6) * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // RA/Dec labels
    ctx.fillStyle = 'rgba(139,92,246,0.15)';
    ctx.font = '8px monospace';
    for (let i = 0; i <= 24; i += 6) {
      ctx.fillText(`${i}h`, (i / 24) * w + 2, h - 3);
    }

    // Draw constellation nodes
    nodes.forEach(node => {
      const x = node.chart_x * w;
      const y = (1 - node.chart_y) * h;
      const isSelected = selectedId === node.id;
      const isHarvested = node.harvested;

      // Glow ring
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, isSelected ? 25 : 15);
      gradient.addColorStop(0, isHarvested ? 'rgba(45,212,191,0.15)' : `${node.color}30`);
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 25 : 15, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core star
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isHarvested ? '#2DD4BF' : node.color;
      ctx.fill();
      if (isSelected) {
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = isHarvested ? 'rgba(45,212,191,0.5)' : `${node.color}90`;
      ctx.font = '7px sans-serif';
      ctx.fillText(node.name, x + 8, y + 3);

      // Frequency
      ctx.fillStyle = `${node.color}50`;
      ctx.font = '6px monospace';
      ctx.fillText(`${node.frequency}Hz`, x + 8, y + 12);
    });
  }, [nodes, selectedId]);

  useEffect(() => { draw(); }, [draw]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    for (const node of nodes) {
      const nx = node.chart_x * canvas.width;
      const ny = (1 - node.chart_y) * canvas.height;
      const dist = Math.sqrt((x * scaleX - nx) ** 2 + (y * scaleY - ny) ** 2);
      if (dist < 20) {
        onSelect(node);
        return;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="w-full h-full cursor-crosshair"
      onClick={handleClick}
      style={{ background: '#050510' }}
      data-testid="celestial-chart"
    />
  );
}


// ━━━━ MAIN COMPONENT ━━━━
export default function CosmicMap() {
  const { authHeaders } = useAuth();
  const [userPos, setUserPos] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [powerSpots, setPowerSpots] = useState([]);
  const [celestialNodes, setCelestialNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [harvesting, setHarvesting] = useState(false);
  const [harvestResult, setHarvestResult] = useState(null);
  const [decayStatus, setDecayStatus] = useState(null);
  const [harvestHistory, setHarvestHistory] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [layer, setLayer] = useState('ground'); // ground | celestial
  const [aligning, setAligning] = useState(false);
  const [celestialDecay, setCelestialDecay] = useState(null);
  const watchRef = useRef(null);
  const notifiedSpotsRef = useRef(new Set());

  const PROXIMITY_RADIUS = 500; // meters

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      setUserPos({ lat: 40.7128, lng: -74.006 });
      setLoading(false);
      return;
    }
    const success = (pos) => { setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoError(null); setLoading(false); };
    const error = () => { setGeoError('Location access denied — using default'); setUserPos({ lat: 40.7128, lng: -74.006 }); setLoading(false); };
    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
    watchRef.current = navigator.geolocation.watchPosition(success, error, { enableHighAccuracy: true, maximumAge: 10000 });
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  const fetchGroundData = useCallback(async () => {
    if (!userPos) return;
    try {
      const [nodesRes, spotsRes, histRes, decayRes] = await Promise.all([
        axios.post(`${API}/cosmic-map/nodes`, { lat: userPos.lat, lng: userPos.lng, radius_km: 1.0 }, { headers: authHeaders }),
        axios.get(`${API}/cosmic-map/power-spots`, { headers: authHeaders }),
        axios.get(`${API}/cosmic-map/harvest-history`, { headers: authHeaders }),
        axios.get(`${API}/cosmic-map/decay-status`, { headers: authHeaders }),
      ]);
      setNodes(nodesRes.data.nodes || []);
      setPowerSpots(spotsRes.data.power_spots || []);
      setHarvestHistory(histRes.data);
      setDecayStatus(decayRes.data);
    } catch (e) { console.error('Ground data fetch failed', e); }
  }, [userPos, authHeaders]);

  const fetchCelestialData = useCallback(async () => {
    try {
      const [nodesRes, decayRes] = await Promise.all([
        axios.get(`${API}/cosmic-map/celestial/nodes`, { headers: authHeaders }),
        axios.get(`${API}/cosmic-map/celestial/decay-status`, { headers: authHeaders }),
      ]);
      setCelestialNodes(nodesRes.data.nodes || []);
      setCelestialDecay(decayRes.data);
    } catch (e) { console.error('Celestial fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => {
    if (userPos) fetchGroundData();
    fetchCelestialData();
  }, [userPos, fetchGroundData, fetchCelestialData]);

  // Proximity notification for Power Spots
  useEffect(() => {
    if (!userPos || !powerSpots.length) return;
    powerSpots.forEach(spot => {
      if (notifiedSpotsRef.current.has(spot.id)) return;
      const dlat = spot.lat - userPos.lat;
      const dlng = spot.lng - userPos.lng;
      const dist = Math.sqrt(
        (dlat * 111320) ** 2 + (dlng * 111320 * Math.cos(userPos.lat * Math.PI / 180)) ** 2
      );
      if (dist <= PROXIMITY_RADIUS) {
        notifiedSpotsRef.current.add(spot.id);
        toast(spot.name, {
          description: `${spot.reward_multiplier}x Legendary Power Spot — ${Math.round(dist)}m away`,
          icon: '👑',
          duration: 6000,
          style: {
            background: 'rgba(10,10,18,0.95)',
            border: '1px solid rgba(251,191,36,0.25)',
            color: '#FBBF24',
          },
        });
      }
    });
  }, [userPos, powerSpots]);

  // Harvest ground nodes / power spots
  const handleHarvest = async (node) => {
    if (!userPos) return;
    setHarvesting(true);
    try {
      let res;
      if (node.type === 'power_spot') {
        res = await axios.post(`${API}/cosmic-map/power-spots/harvest`, {
          spot_id: node.id, user_lat: userPos.lat, user_lng: userPos.lng,
        }, { headers: authHeaders });
      } else {
        res = await axios.post(`${API}/cosmic-map/harvest`, {
          node_id: node.id, user_lat: userPos.lat, user_lng: userPos.lng,
        }, { headers: authHeaders });
      }
      setHarvestResult(res.data);
      fetchGroundData();
    } catch (e) {
      setHarvestResult({ success: false, message: e.response?.data?.detail || 'Harvest failed' });
    }
    setHarvesting(false);
  };

  // Celestial alignment
  const handleCelestialAlign = async (node) => {
    setAligning(true);
    try {
      // Simulate alignment accuracy (in real AR this would be camera-based)
      const accuracy = 0.65 + Math.random() * 0.35;
      const res = await axios.post(`${API}/cosmic-map/celestial/align`, {
        node_id: node.id, alignment_accuracy: accuracy,
      }, { headers: authHeaders });
      setHarvestResult(res.data);
      fetchCelestialData();
    } catch (e) {
      setHarvestResult({ success: false, message: e.response?.data?.detail || 'Alignment failed' });
    }
    setAligning(false);
  };

  const calcDistance = (node) => {
    if (!userPos || !node.lat) return Infinity;
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
  const allGroundNodes = [...nodes, ...powerSpots];

  return (
    <div className="min-h-screen relative" data-testid="cosmic-map-page">
      {/* Map / Chart area */}
      <div className="absolute inset-0 pt-14">
        {layer === 'ground' ? (
          <MapContainer center={[center.lat, center.lng]} zoom={15} className="w-full h-full" style={{ background: '#0a0a14' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            <RecenterButton center={[center.lat, center.lng]} />
            <Marker position={[center.lat, center.lng]} icon={userIcon}><Popup><span style={{ color: '#FBBF24', fontSize: '11px' }}>You are here</span></Popup></Marker>

            {/* Regular nodes */}
            {nodes.map(node => (
              <React.Fragment key={node.id}>
                <Circle center={[node.lat, node.lng]} radius={node.harvest_radius_meters}
                  pathOptions={{ color: node.color, fillColor: node.color, fillOpacity: node.harvested ? 0.03 : 0.08, weight: node.harvested ? 0.5 : 1, opacity: node.harvested ? 0.2 : 0.4 }} />
                <Marker position={[node.lat, node.lng]} icon={createNodeIcon(node.harvested ? '#555' : node.color, node.type)}
                  eventHandlers={{ click: () => { setSelectedNode(node); setHarvestResult(null); } }} />
              </React.Fragment>
            ))}

            {/* Power Spots */}
            {powerSpots.map(spot => (
              <React.Fragment key={spot.id}>
                <Circle center={[spot.lat, spot.lng]} radius={spot.harvest_radius_meters}
                  pathOptions={{ color: '#FBBF24', fillColor: '#FBBF24', fillOpacity: 0.06, weight: 2, opacity: 0.5, dashArray: '8 4' }} />
                <Marker position={[spot.lat, spot.lng]} icon={powerSpotIcon}
                  eventHandlers={{ click: () => { setSelectedNode(spot); setHarvestResult(null); } }} />
              </React.Fragment>
            ))}
          </MapContainer>
        ) : (
          <div className="w-full h-full">
            <CelestialChart
              nodes={celestialNodes}
              onSelect={(n) => { setSelectedNode(n); setHarvestResult(null); }}
              selectedId={selectedNode?.id}
            />
          </div>
        )}
      </div>

      {/* HUD Overlay */}
      <div className="absolute top-16 left-3 right-3 z-[1000] pointer-events-none">
        {/* Decay warnings */}
        {layer === 'ground' && decayStatus?.at_risk && (
          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: decayStatus.pulse_speed || 1.5, repeat: Infinity }}
            className="mb-2 px-3 py-1.5 rounded-lg pointer-events-auto"
            style={{ background: 'rgba(239,68,68,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(239,68,68,0.2)' }}
            data-testid="decay-warning">
            <p className="text-[8px] text-center" style={{ color: '#EF4444' }}>
              Resonance Decay: {decayStatus.days_inactive?.toFixed(1)}d inactive
            </p>
          </motion.div>
        )}
        {layer === 'celestial' && celestialDecay?.quadratic_decay_active && (
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: celestialDecay.pulse_speed || 1, repeat: Infinity }}
            className="mb-2 px-3 py-1.5 rounded-lg pointer-events-auto"
            style={{ background: 'rgba(139,92,246,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(139,92,246,0.2)' }}
            data-testid="celestial-decay-warning">
            <p className="text-[8px] text-center" style={{ color: '#A78BFA' }}>
              Celestial Decay (t²): {celestialDecay.days_inactive?.toFixed(1)}d — {(celestialDecay.decay_factor * 100).toFixed(1)}% retained
            </p>
          </motion.div>
        )}

        {/* Main HUD */}
        <div className="rounded-xl px-3 py-2 pointer-events-auto"
          style={{
            background: layer === 'ground' ? 'rgba(15,15,25,0.7)' : 'rgba(5,5,16,0.85)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${layer === 'ground' ? 'rgba(248,250,252,0.06)' : 'rgba(139,92,246,0.12)'}`,
          }}
          data-testid="map-hud">
          <div className="flex items-center gap-3">
            {/* Layer toggle */}
            <button onClick={() => { setLayer(l => l === 'ground' ? 'celestial' : 'ground'); setSelectedNode(null); setHarvestResult(null); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[7px] uppercase tracking-widest transition-all"
              style={{
                background: layer === 'celestial' ? 'rgba(139,92,246,0.12)' : 'rgba(245,158,11,0.08)',
                color: layer === 'celestial' ? '#A78BFA' : '#F59E0B',
                border: `1px solid ${layer === 'celestial' ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.15)'}`,
              }}
              data-testid="layer-toggle">
              {layer === 'ground' ? <Globe size={9} /> : <Moon size={9} />}
              {layer === 'ground' ? 'Ground' : 'Celestial'}
            </button>

            <div className="flex items-center gap-1">
              <MapPin size={10} style={{ color: '#FBBF24' }} />
              <span className="text-[8px] font-mono" style={{ color: '#FBBF24' }}>
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex-1" />

            {layer === 'ground' ? (
              <>
                <div className="flex items-center gap-1">
                  <Zap size={8} style={{ color: '#F59E0B' }} />
                  <span className="text-[8px]" style={{ color: '#F59E0B' }}>{nodes.filter(n => n.type === 'kinetic' && !n.harvested).length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Leaf size={8} style={{ color: '#2DD4BF' }} />
                  <span className="text-[8px]" style={{ color: '#2DD4BF' }}>{nodes.filter(n => n.type === 'botanical' && !n.harvested).length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={8} style={{ color: '#8B5CF6' }} />
                  <span className="text-[8px]" style={{ color: '#8B5CF6' }}>{nodes.filter(n => n.type === 'star_anchor' && !n.harvested).length}</span>
                </div>
                {powerSpots.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Crown size={8} style={{ color: '#FBBF24' }} />
                    <span className="text-[8px]" style={{ color: '#FBBF24' }}>{powerSpots.filter(s => !s.harvested).length}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Star size={8} style={{ color: '#A78BFA' }} />
                <span className="text-[8px]" style={{ color: '#A78BFA' }}>
                  {celestialNodes.filter(n => !n.harvested).length} / {celestialNodes.length}
                </span>
              </div>
            )}

            <button onClick={() => { layer === 'ground' ? fetchGroundData() : fetchCelestialData(); }}
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(248,250,252,0.04)' }}
              data-testid="refresh-nodes-btn">
              <RefreshCw size={9} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Today's harvest summary */}
          {harvestHistory && harvestHistory.today_count > 0 && layer === 'ground' && (
            <div className="flex items-center gap-2 mt-1.5 pt-1.5" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
              <span className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Today</span>
              <span className="text-[7px] font-mono" style={{ color: '#F59E0B' }}>+{harvestHistory.today_rewards.kinetic_dust} Dust</span>
              <span className="text-[7px] font-mono" style={{ color: '#2DD4BF' }}>+{harvestHistory.today_rewards.science_resonance} Res</span>
              <span className="text-[7px] ml-auto" style={{ color: 'var(--text-muted)' }}>{harvestHistory.today_count} harvests</span>
            </div>
          )}
        </div>
        {geoError && <p className="text-[7px] mt-1 text-center" style={{ color: 'rgba(239,68,68,0.7)' }}>{geoError}</p>}
      </div>

      {/* Node Detail Slide-up Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-[1001] rounded-t-2xl px-4 pt-4 pb-8"
            style={{
              background: layer === 'celestial' ? 'rgba(5,5,16,0.92)' : 'rgba(15,15,25,0.85)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              borderTop: `2px solid ${(selectedNode.color || '#FBBF24')}40`,
            }}
            data-testid="node-detail-panel">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setSelectedNode(null); setHarvestResult(null); }}
                className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(248,250,252,0.05)' }}
                data-testid="close-node-panel"><X size={10} style={{ color: 'var(--text-muted)' }} /></button>
              <ChevronUp size={10} style={{ color: selectedNode.color }} />
              <span className="text-[10px] font-medium" style={{ color: selectedNode.color }}>{selectedNode.name}</span>
              {selectedNode.type === 'power_spot' && <Crown size={10} style={{ color: '#FBBF24' }} />}
              <span className="text-[7px] uppercase px-1.5 py-0.5 rounded-full ml-auto"
                style={{ background: RARITY_GLOW[selectedNode.rarity] || 'rgba(148,163,184,0.1)', color: selectedNode.color }}>
                {selectedNode.rarity}
              </span>
            </div>

            {/* Description for celestial / power spots */}
            {selectedNode.description && (
              <p className="text-[8px] mb-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{selectedNode.description}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-lg" style={{ background: `${selectedNode.color}08`, border: `1px solid ${selectedNode.color}15` }}>
                <p className="text-[10px] font-mono" style={{ color: selectedNode.color }}>
                  +{selectedNode.reward_amount}{selectedNode.type === 'power_spot' ? ` (${selectedNode.reward_multiplier}x)` : ''}
                </p>
                <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>{(selectedNode.reward_type || '').replace('_', ' ')}</p>
              </div>
              {selectedNode.type === 'celestial' ? (
                <>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <p className="text-[10px] font-mono" style={{ color: '#A78BFA' }}>{selectedNode.frequency}Hz</p>
                    <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Frequency</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-primary)' }}>{selectedNode.constellation}</p>
                    <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Constellation</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-primary)' }}>{Math.round(calcDistance(selectedNode))}m</p>
                    <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Distance</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-primary)' }}>{selectedNode.harvest_radius_meters}m</p>
                    <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Range</p>
                  </div>
                </>
              )}
            </div>

            {/* Action button */}
            {selectedNode.type === 'celestial' ? (
              selectedNode.harvested ? (
                <div className="text-center py-2 rounded-lg" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
                  <p className="text-[9px] flex items-center justify-center gap-1" style={{ color: '#2DD4BF' }}><Sparkles size={10} /> Aligned today</p>
                </div>
              ) : (
                <button onClick={() => handleCelestialAlign(selectedNode)} disabled={aligning}
                  className="w-full py-2.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  style={{ background: `${selectedNode.color}15`, color: selectedNode.color, border: `1px solid ${selectedNode.color}25` }}
                  data-testid="align-btn">
                  {aligning ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCw size={12} /></motion.div> : <Star size={12} />}
                  {aligning ? 'Aligning...' : `Align with ${selectedNode.name}`}
                </button>
              )
            ) : selectedNode.harvested ? (
              <div className="text-center py-2 rounded-lg" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
                <p className="text-[9px] flex items-center justify-center gap-1" style={{ color: '#2DD4BF' }}><Sparkles size={10} /> Already harvested today</p>
              </div>
            ) : calcDistance(selectedNode) <= (selectedNode.harvest_radius_meters || 50) ? (
              <button onClick={() => handleHarvest(selectedNode)} disabled={harvesting}
                className="w-full py-2.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                style={{ background: `${selectedNode.color}15`, color: selectedNode.color, border: `1px solid ${selectedNode.color}25` }}
                data-testid="harvest-btn">
                {harvesting ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCw size={12} /></motion.div> : <Zap size={12} />}
                {harvesting ? 'Harvesting...' : selectedNode.type === 'power_spot' ? 'Harvest Power Spot' : 'Harvest Node'}
              </button>
            ) : (
              <div className="text-center py-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  Move within {selectedNode.harvest_radius_meters || 50}m ({Math.round(calcDistance(selectedNode))}m away)
                </p>
              </div>
            )}

            {/* Result */}
            {harvestResult && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-2.5 rounded-lg"
                style={{
                  background: harvestResult.success ? 'rgba(45,212,191,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${harvestResult.success ? 'rgba(45,212,191,0.15)' : 'rgba(239,68,68,0.15)'}`,
                }}
                data-testid="harvest-result">
                <p className="text-[9px]" style={{ color: harvestResult.success ? '#2DD4BF' : '#EF4444' }}>{harvestResult.message}</p>
                {harvestResult.accuracy && (
                  <p className="text-[8px] mt-0.5" style={{ color: '#A78BFA' }}>Accuracy: {harvestResult.accuracy}%</p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
