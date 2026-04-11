/**
 * ENLIGHTEN.MINT.CAFE - AR WELLNESS PORTAL PAGE
 * ARPortalPage.js
 * 
 * THE PHYGITAL GATEWAY
 * 
 * This page provides the full WebXR AR Portal experience with:
 * - GPS-based Wellness Zone detection
 * - Three Sacred Nodes mapping (Keystone, Rapid City, Black Elk)
 * - AR crystal manifestation when within resonance radius
 * - Navigation guidance to nearest node
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import WebXRPortalSync, { ARPortalTrigger } from '../components/WebXRPortalSync';
import { 
  ArrowLeft, MapPin, Navigation, Hexagon, Sparkles,
  Loader2, Globe, Compass, Radio, Wifi, WifiOff
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Zone type colors
const ZONE_COLORS = {
  GATEWAY: { bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.3)', text: '#60A5FA' },
  ADVOCACY: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22C55E' },
  RESONANCE: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', text: '#8B5CF6' },
};

/**
 * Zone Card Component
 */
function ZoneCard({ zone, userPosition, onNavigate, onARActivate }) {
  const [distance, setDistance] = useState(null);
  const colors = ZONE_COLORS[zone.type] || ZONE_COLORS.RESONANCE;
  
  // Calculate distance if user position available
  useEffect(() => {
    if (userPosition) {
      // Haversine approximation
      const R = 6371000; // Earth radius in meters
      const dLat = (zone.coordinates.lat - userPosition.lat) * Math.PI / 180;
      const dLon = (zone.coordinates.lon - userPosition.lon) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userPosition.lat * Math.PI / 180) * Math.cos(zone.coordinates.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      setDistance(R * c);
    }
  }, [zone, userPosition]);
  
  const isInRange = distance !== null && distance <= 50; // 50m resonance radius
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl relative overflow-hidden"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
      data-testid={`zone-card-${zone.zone_id}`}
    >
      {/* In-range indicator */}
      {isInRange && (
        <div className="absolute top-2 right-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.border }}
        >
          <Hexagon size={18} style={{ color: colors.text }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white">{zone.name}</h3>
          <p className="text-[9px] uppercase tracking-wider" style={{ color: colors.text }}>
            {zone.type} NODE
          </p>
        </div>
      </div>
      
      {/* Utility */}
      <p className="text-[10px] text-white/60 mb-3">{zone.utility}</p>
      
      {/* Coordinates */}
      <div className="flex items-center gap-2 text-[9px] text-white/40 mb-3">
        <MapPin size={10} />
        <span>{zone.coordinates.lat.toFixed(4)}°N, {Math.abs(zone.coordinates.lon).toFixed(4)}°W</span>
      </div>
      
      {/* Distance & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {distance !== null && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: isInRange ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                color: isInRange ? '#22C55E' : 'rgba(255,255,255,0.5)',
              }}
            >
              {distance < 1000 ? `${distance.toFixed(0)}m` : `${(distance/1000).toFixed(1)}km`}
            </span>
          )}
          <span className="text-[9px] text-white/30">
            {zone.resonance_frequency}Hz
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(zone.zone_id)}
            className="p-1.5 rounded-lg transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            title="Navigate"
          >
            <Navigation size={12} className="text-white/60" />
          </button>
          
          {isInRange && (
            <ARPortalTrigger 
              zoneId={zone.zone_id} 
              zoneName={zone.name}
              onActivate={onARActivate}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Main AR Portal Page
 */
export default function ARPortalPage() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showARPanel, setShowARPanel] = useState(false);
  
  // Load zones
  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await axios.get(`${API}/wellness-zones`);
        if (res.data.status === 'success') {
          setZones(res.data.data.zones);
        }
      } catch (err) {
        console.error('Failed to load zones:', err);
        toast.error('Failed to load Wellness Zones');
      } finally {
        setLoading(false);
      }
    };
    
    loadZones();
  }, []);
  
  // GPS tracking
  useEffect(() => {
    let watchId = null;
    
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setGpsEnabled(true);
        },
        (error) => {
          console.warn('GPS error:', error);
          setGpsEnabled(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  
  // Navigate to zone
  const handleNavigate = async (zoneId) => {
    if (!userPosition) {
      toast.error('GPS required for navigation');
      return;
    }
    
    try {
      const res = await axios.post(`${API}/wellness-zones/navigate`, {
        lat: userPosition.lat,
        lon: userPosition.lon,
        target_zone: zoneId,
      });
      
      if (res.data.status === 'success') {
        const nav = res.data.navigation;
        toast.info(`Navigate to ${nav.target.name}`, {
          description: `${nav.navigation.distance_km}km ${nav.navigation.cardinal_direction} • ~${nav.navigation.eta_walking_min} min walk`,
        });
      }
    } catch (err) {
      toast.error('Navigation failed');
    }
  };
  
  // Activate AR for zone
  const handleARActivate = (zoneId) => {
    setSelectedZone(zoneId);
    setShowARPanel(true);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <Loader2 className="animate-spin text-purple-400" size={24} />
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen pb-24"
      style={{ background: '#000000', paddingTop: '70px' }}
      data-testid="ar-portal-page"
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ 
          background: 'rgba(10,10,15,0.88)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid rgba(255,255,255,0.04)' 
        }}
      >
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <ArrowLeft size={16} className="text-white/60" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-light text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            AR Wellness Portal
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-white/40">
            Phygital Gateway • Black Hills Network
          </p>
        </div>
        <div className="flex items-center gap-2">
          {gpsEnabled ? (
            <Wifi size={14} className="text-green-400" />
          ) : (
            <WifiOff size={14} className="text-red-400" />
          )}
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* GPS Status */}
        {userPosition && (
          <div 
            className="mb-6 p-3 rounded-xl flex items-center gap-3"
            style={{ 
              background: 'rgba(34, 197, 94, 0.08)', 
              border: '1px solid rgba(34, 197, 94, 0.2)' 
            }}
          >
            <Radio size={16} className="text-green-400" />
            <div>
              <p className="text-xs text-green-300">GPS Active</p>
              <p className="text-[9px] text-white/50">
                {userPosition.lat.toFixed(4)}°N, {Math.abs(userPosition.lon).toFixed(4)}°W
              </p>
            </div>
          </div>
        )}
        
        {/* Intro */}
        <div className="mb-6 text-center">
          <Globe size={40} className="mx-auto mb-3 text-purple-400/60" />
          <h2 className="text-lg font-light text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            The Three Sacred Nodes
          </h2>
          <p className="text-xs text-white/50">
            Enter a Wellness Zone to manifest the Sovereign Prism in AR space.
            <br />
            The crystal will rise from the earth when you enter the 50-meter resonance field.
          </p>
        </div>
        
        {/* Zone Cards */}
        <div className="space-y-4 mb-8">
          {zones.map((zone, i) => (
            <ZoneCard
              key={zone.zone_id}
              zone={zone}
              userPosition={userPosition}
              onNavigate={handleNavigate}
              onARActivate={handleARActivate}
            />
          ))}
        </div>
        
        {/* AR Control Panel */}
        {showARPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-40"
          >
            <WebXRPortalSync
              onZoneEnter={(trigger) => {
                toast.success(`Entering ${trigger.zone}`, {
                  description: 'AR Portal activating...',
                });
              }}
              onARSessionStart={(config) => {
                console.log('AR Session started:', config);
              }}
              onARSessionEnd={() => {
                setShowARPanel(false);
                setSelectedZone(null);
              }}
              autoActivate={false}
            />
            
            <button
              onClick={() => setShowARPanel(false)}
              className="w-full mt-2 py-2 rounded-lg text-[10px] text-white/40 hover:text-white/60 transition-colors"
            >
              Minimize
            </button>
          </motion.div>
        )}
        
        {/* Launch AR Button (when not showing panel) */}
        {!showARPanel && (
          <div className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto">
            <button
              onClick={() => setShowARPanel(true)}
              className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.3))',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                color: '#C4B5FD',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)',
              }}
              data-testid="open-ar-panel-btn"
            >
              <Sparkles size={16} />
              Open AR Portal Controls
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
