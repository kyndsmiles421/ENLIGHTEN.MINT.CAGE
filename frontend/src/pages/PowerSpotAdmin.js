import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Crown, MapPin, Zap, Power, Trash2, Edit3, Save,
  Navigation, Radio, ChevronDown, ChevronUp, Plus, Locate, LocateOff
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const pinIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;border-radius:50%;background:radial-gradient(circle,#FBBF24 0%,rgba(251,191,36,0.4) 60%,transparent 100%);border:2px solid #FBBF24;box-shadow:0 0 20px rgba(251,191,36,0.6)"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const draftIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:rgba(239,68,68,0.6);border:2px dashed #EF4444;box-shadow:0 0 12px rgba(239,68,68,0.3)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 16);
  }, [center, map]);
  return null;
}

export default function PowerSpotAdmin() {
  const { authHeaders } = useAuth();
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [draftPin, setDraftPin] = useState(null);
  const [creating, setCreating] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);

  // Create form
  const [formName, setFormName] = useState('Enlightenment Cafe');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMult, setFormMult] = useState('5.0');
  const [formRadius, setFormRadius] = useState('100');
  const [formHours, setFormHours] = useState('');

  const [editing, setEditing] = useState(null);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMult, setEditMult] = useState('');

  // Live tracking
  const [trackingSpotId, setTrackingSpotId] = useState(null);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const lastPosRef = useRef(null);

  const fetchSpots = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/cosmic-map/power-spots?include_all=true`, { headers: authHeaders });
      setSpots(res.data.power_spots || []);
    } catch (e) { console.error('Spots fetch failed', e); }
  }, [authHeaders]);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/cosmic-map/broadcasts/active`, { headers: authHeaders });
      setBroadcasts(res.data.broadcasts || []);
    } catch (e) { console.error('Broadcasts fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { fetchSpots(); fetchBroadcasts(); }, [fetchSpots, fetchBroadcasts]);

  const handleMapClick = (pos) => {
    setDraftPin(pos);
    setFormLat(pos.lat.toFixed(6));
    setFormLng(pos.lng.toFixed(6));
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!formLat || !formLng || !formName) return;
    setCreating(true);
    try {
      await axios.post(`${API}/cosmic-map/power-spots`, {
        name: formName,
        lat: parseFloat(formLat),
        lng: parseFloat(formLng),
        description: formDesc || 'Legendary Power Spot',
        reward_multiplier: parseFloat(formMult) || 5.0,
        harvest_radius_meters: parseInt(formRadius) || 100,
        active: true,
        active_hours: formHours || null,
      }, { headers: authHeaders });
      setDraftPin(null);
      setShowCreate(false);
      fetchSpots();
    } catch (e) { alert(e.response?.data?.detail || 'Create failed'); }
    setCreating(false);
  };

  const handleUpdate = async (spotId) => {
    const updates = {};
    if (editLat) updates.lat = parseFloat(editLat);
    if (editLng) updates.lng = parseFloat(editLng);
    if (editDesc) updates.description = editDesc;
    if (editMult) updates.reward_multiplier = parseFloat(editMult);
    try {
      await axios.put(`${API}/cosmic-map/power-spots/${spotId}`, updates, { headers: authHeaders });
      setEditing(null);
      fetchSpots();
    } catch (e) { alert(e.response?.data?.detail || 'Update failed'); }
  };

  const handleDelete = async (spotId) => {
    if (!window.confirm('Delete this Power Spot?')) return;
    try {
      await axios.delete(`${API}/cosmic-map/power-spots/${spotId}`, { headers: authHeaders });
      fetchSpots();
    } catch (e) { alert(e.response?.data?.detail || 'Delete failed'); }
  };

  const handleGoLive = async (spotId, goLive) => {
    try {
      await axios.post(`${API}/cosmic-map/power-spots/${spotId}/go-live`, { go_live: goLive }, { headers: authHeaders });
      fetchSpots();
      fetchBroadcasts();
    } catch (e) { alert(e.response?.data?.detail || 'Toggle failed'); }
  };

  const startEdit = (spot) => {
    setEditing(spot.id);
    setEditLat(spot.lat.toString());
    setEditLng(spot.lng.toString());
    setEditDesc(spot.description || '');
    setEditMult(spot.reward_multiplier?.toString() || '5');
  };

  // ━━━ Live Tracking ━━━
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    lastPosRef.current = null;
  }, []);

  const handleToggleTracking = async (spot) => {
    const enabling = !spot.live_tracking;
    try {
      await axios.post(`${API}/cosmic-map/power-spots/${spot.id}/live-tracking`, { enabled: enabling }, { headers: authHeaders });

      if (enabling) {
        setTrackingSpotId(spot.id);
        // Start watching GPS
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => { lastPosRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000 }
        );
        // Send pings every 10 seconds
        intervalRef.current = setInterval(async () => {
          if (!lastPosRef.current) return;
          try {
            await axios.put(
              `${API}/cosmic-map/power-spots/${spot.id}/update-location`,
              lastPosRef.current,
              { headers: authHeaders }
            );
            fetchSpots();
          } catch (e) { console.error('Location ping failed', e); }
        }, 10000);
      } else {
        stopTracking();
        setTrackingSpotId(null);
      }
      fetchSpots();
    } catch (e) { alert(e.response?.data?.detail || 'Tracking toggle failed'); }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  const defaultCenter = spots.length > 0
    ? { lat: spots[0].lat, lng: spots[0].lng }
    : { lat: 44.0805, lng: -103.231 };

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-3xl mx-auto space-y-4" data-testid="power-spot-admin">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide flex items-center justify-center gap-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          <Crown size={18} style={{ color: '#FBBF24' }} /> Power Spot Admin
        </h1>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Deploy, move, and broadcast your legendary nodes
        </p>
      </motion.div>

      {/* Active Broadcasts */}
      {broadcasts.length > 0 && (
        <div className="rounded-xl p-3"
          style={{ background: 'rgba(251,191,36,0.05)', backdropFilter: 'none', border: '1px solid rgba(251,191,36,0.1)' }}
          data-testid="active-broadcasts">
          <p className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: '#FBBF24' }}>
            <Radio size={8} className="inline mr-1" /> Active Broadcasts
          </p>
          {broadcasts.map((b, i) => (
            <p key={i} className="text-[8px] py-0.5" style={{ color: 'var(--text-muted)' }}>
              {b.message} — {new Date(b.created_at).toLocaleTimeString()}
            </p>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden" style={{ height: 350, border: '1px solid rgba(248,250,252,0.06)' }}>
        <MapContainer
          center={[mapCenter?.lat || defaultCenter.lat, mapCenter?.lng || defaultCenter.lng]}
          zoom={14}
          className="w-full h-full"
          style={{ background: '#0a0a14' }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="CARTO" />
          <MapClickHandler onMapClick={handleMapClick} />
          {mapCenter && <FlyTo center={mapCenter} />}

          {/* Existing spots */}
          {spots.map(spot => (
            <React.Fragment key={spot.id}>
              <Circle
                center={[spot.lat, spot.lng]}
                radius={spot.harvest_radius_meters || 100}
                pathOptions={{ color: '#FBBF24', fillColor: '#FBBF24', fillOpacity: 0.06, weight: 2, opacity: 0.5, dashArray: '8 4' }}
              />
              <Marker position={[spot.lat, spot.lng]} icon={pinIcon}
                eventHandlers={{ click: () => setSelectedSpot(spot) }} />
            </React.Fragment>
          ))}

          {/* Draft pin */}
          {draftPin && (
            <Marker position={[draftPin.lat, draftPin.lng]} icon={draftIcon} />
          )}
        </MapContainer>
      </div>
      <p className="text-[7px] text-center" style={{ color: 'var(--text-muted)' }}>
        Click anywhere on the map to drop a pin for a new Power Spot
      </p>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(15,15,25,0.6)', backdropFilter: 'none', border: '1px solid rgba(251,191,36,0.1)' }}
            data-testid="create-spot-form">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: '#FBBF24' }}>
                <Plus size={10} /> New Power Spot
              </span>
              <button onClick={() => { setShowCreate(false); setDraftPin(null); }} className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[7px] uppercase tracking-widest block mb-0.5" style={{ color: 'var(--text-muted)' }}>Name</label>
                <input value={formName} onChange={e => setFormName(e.target.value)}
                  className="w-full px-2 py-1.5 rounded text-[9px] outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                  data-testid="spot-name-input" />
              </div>
              <div>
                <label className="text-[7px] uppercase tracking-widest block mb-0.5" style={{ color: 'var(--text-muted)' }}>Description</label>
                <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Legendary Power Spot"
                  className="w-full px-2 py-1.5 rounded text-[9px] outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[7px] uppercase tracking-widest block mb-0.5" style={{ color: '#FBBF24' }}>Latitude (6 decimals)</label>
                <input value={formLat} onChange={e => setFormLat(e.target.value)} type="text"
                  className="w-full px-2 py-1.5 rounded text-[9px] font-mono outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(251,191,36,0.15)', color: '#FBBF24' }}
                  data-testid="spot-lat-input" />
              </div>
              <div>
                <label className="text-[7px] uppercase tracking-widest block mb-0.5" style={{ color: '#FBBF24' }}>Longitude (6 decimals)</label>
                <input value={formLng} onChange={e => setFormLng(e.target.value)} type="text"
                  className="w-full px-2 py-1.5 rounded text-[9px] font-mono outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(251,191,36,0.15)', color: '#FBBF24' }}
                  data-testid="spot-lng-input" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[7px] uppercase tracking-widest block mb-0.5" style={{ color: 'var(--text-muted)' }}>Multiplier</label>
                <input value={formMult} onChange={e => setFormMult(e.target.value)} type="text"
                  className="w-full px-2 py-1.5 rounded text-[9px] outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-[7px] uppercase tracking-widest block mb-0.5" style={{ color: 'var(--text-muted)' }}>Radius (m)</label>
                <input value={formRadius} onChange={e => setFormRadius(e.target.value)} type="text"
                  className="w-full px-2 py-1.5 rounded text-[9px] outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-[7px] uppercase tracking-widest block mb-0.5" style={{ color: 'var(--text-muted)' }}>Hours (opt)</label>
                <input value={formHours} onChange={e => setFormHours(e.target.value)} placeholder="08:00-18:00"
                  className="w-full px-2 py-1.5 rounded text-[9px] outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <button onClick={handleCreate} disabled={creating}
              className="w-full py-2 rounded-lg text-[9px] font-medium flex items-center justify-center gap-1 transition-all"
              style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}
              data-testid="deploy-spot-btn">
              <Crown size={10} /> {creating ? 'Deploying...' : 'Deploy Power Spot'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Spots List */}
      <div className="space-y-2">
        <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Deployed Spots ({spots.length})
        </p>

        {spots.map(spot => (
          <div key={spot.id} className="rounded-xl p-3"
            style={{
              background: 'rgba(15,15,25,0.6)',
              backdropFilter: 'none',
              border: `1px solid rgba(251,191,36,${spot.active ? '0.12' : '0.04'})`,
              borderLeft: `2px solid ${spot.active ? 'rgba(251,191,36,0.4)' : 'rgba(248,250,252,0.08)'}`,
            }}
            data-testid={`admin-spot-${spot.id}`}>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={12} style={{ color: spot.active ? '#FBBF24' : 'var(--text-muted)' }} />
              <span className="text-[10px] font-medium flex-1" style={{ color: spot.active ? '#FBBF24' : 'var(--text-muted)' }}>
                {spot.name}
              </span>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full`}
                style={{
                  background: spot.active ? 'rgba(45,212,191,0.08)' : 'rgba(239,68,68,0.08)',
                  color: spot.active ? '#2DD4BF' : '#EF4444',
                }}>
                {spot.active ? 'LIVE' : 'OFFLINE'}
              </span>
              {spot.live_tracking && (
                <span className="text-[7px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }}>
                  GPS
                </span>
              )}
            </div>

            {editing === spot.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Lat</label>
                    <input value={editLat} onChange={e => setEditLat(e.target.value)}
                      className="w-full px-2 py-1 rounded text-[8px] font-mono outline-none"
                      style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(251,191,36,0.15)', color: '#FBBF24' }}
                      data-testid="edit-lat-input" />
                  </div>
                  <div>
                    <label className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Lng</label>
                    <input value={editLng} onChange={e => setEditLng(e.target.value)}
                      className="w-full px-2 py-1 rounded text-[8px] font-mono outline-none"
                      style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(251,191,36,0.15)', color: '#FBBF24' }}
                      data-testid="edit-lng-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description"
                    className="px-2 py-1 rounded text-[8px] outline-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }} />
                  <input value={editMult} onChange={e => setEditMult(e.target.value)} placeholder="Multiplier"
                    className="px-2 py-1 rounded text-[8px] outline-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }} />
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleUpdate(spot.id)}
                    className="flex-1 py-1 rounded text-[8px] flex items-center justify-center gap-1"
                    style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}
                    data-testid="save-spot-btn"><Save size={8} /> Save</button>
                  <button onClick={() => setEditing(null)}
                    className="px-3 py-1 rounded text-[8px]"
                    style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center p-1.5 rounded" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <p className="text-[8px] font-mono" style={{ color: '#FBBF24' }}>{spot.lat.toFixed(6)}</p>
                    <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Lat</p>
                  </div>
                  <div className="text-center p-1.5 rounded" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <p className="text-[8px] font-mono" style={{ color: '#FBBF24' }}>{spot.lng.toFixed(6)}</p>
                    <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Lng</p>
                  </div>
                  <div className="text-center p-1.5 rounded" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <p className="text-[8px] font-mono" style={{ color: '#F59E0B' }}>{spot.reward_multiplier}x</p>
                    <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>Multiplier</p>
                  </div>
                </div>
                {spot.description && (
                  <p className="text-[7px] mb-2" style={{ color: 'var(--text-muted)' }}>{spot.description}</p>
                )}

                {/* Live tracking indicator */}
                {spot.live_tracking && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md"
                    style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}
                    data-testid={`tracking-active-${spot.id}`}>
                    <Locate size={8} style={{ color: '#22C55E' }} />
                    <span className="text-[7px]" style={{ color: '#22C55E' }}>GPS Tracking Active</span>
                    {spot.last_location_update && (
                      <span className="text-[6px] ml-auto" style={{ color: 'rgba(34,197,94,0.6)' }}>
                        Updated {new Date(spot.last_location_update).toLocaleTimeString()}
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-1.5">
                  <button onClick={() => handleGoLive(spot.id, !spot.active)}
                    className="flex-1 py-1.5 rounded-md text-[8px] flex items-center justify-center gap-1 transition-all"
                    style={{
                      background: spot.active ? 'rgba(239,68,68,0.08)' : 'rgba(45,212,191,0.08)',
                      color: spot.active ? '#EF4444' : '#2DD4BF',
                      border: `1px solid ${spot.active ? 'rgba(239,68,68,0.15)' : 'rgba(45,212,191,0.15)'}`,
                    }}
                    data-testid={`go-live-${spot.id}`}>
                    <Power size={9} /> {spot.active ? 'Go Offline' : 'Go Live'}
                  </button>
                  <button onClick={() => handleToggleTracking(spot)}
                    className="px-3 py-1.5 rounded-md text-[8px] flex items-center gap-1 transition-all"
                    style={{
                      background: spot.live_tracking ? 'rgba(34,197,94,0.1)' : 'rgba(248,250,252,0.04)',
                      color: spot.live_tracking ? '#22C55E' : 'var(--text-muted)',
                      border: spot.live_tracking ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                    }}
                    data-testid={`track-${spot.id}`}>
                    {spot.live_tracking ? <LocateOff size={8} /> : <Locate size={8} />}
                    {spot.live_tracking ? 'Stop' : 'Track'}
                  </button>
                  <button onClick={() => startEdit(spot)}
                    className="px-3 py-1.5 rounded-md text-[8px] flex items-center gap-1"
                    style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}
                    data-testid={`edit-${spot.id}`}>
                    <Edit3 size={8} /> Edit
                  </button>
                  <button onClick={() => { setMapCenter({ lat: spot.lat, lng: spot.lng }); }}
                    className="px-2 py-1.5 rounded-md text-[8px]"
                    style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>
                    <Navigation size={8} />
                  </button>
                  <button onClick={() => handleDelete(spot.id)}
                    className="px-2 py-1.5 rounded-md text-[8px]"
                    style={{ background: 'rgba(239,68,68,0.05)', color: '#EF4444' }}
                    data-testid={`delete-${spot.id}`}>
                    <Trash2 size={8} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {spots.length === 0 && (
          <div className="text-center py-6 rounded-xl"
            style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.04)' }}>
            <Crown size={20} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
            <p className="text-[9px] mt-2" style={{ color: 'var(--text-muted)' }}>
              No Power Spots deployed yet. Click on the map to drop your first pin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
