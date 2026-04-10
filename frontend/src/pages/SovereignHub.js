/**
 * ENLIGHTEN.MINT.CAFE - V9999.2 SOVEREIGN HUB
 * 
 * The Crystalline QR Overlay that displays:
 * - Trust Entity & Verification Status
 * - Resonance Gauge (27.2196 Hz → 144Hz Target)
 * - Equity Reservoir ($49,018.24 LUNAR-SYNCED)
 * - Spectral Rainbow Refraction
 * - GPS Phygital Lock Status
 * 
 * Theme: Obsidian Void / Refracted Crystal / 144Hz
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Check, Zap, Globe, Moon, Sun, Star, Hexagon,
  Activity, Lock, Unlock, Send, FileText, MapPin, Radio,
  ChevronRight, ExternalLink, Copy, CheckCircle, Sliders,
  RefreshCw, Navigation, Vibrate, Repeat
} from 'lucide-react';
import { toast } from 'sonner';
import CreatorMixer from '../components/CreatorMixer';
import CircularProtocol from '../components/CircularProtocol';
import HyperFluxEngine, { BLACK_HILLS_ANCHOR } from '../utils/HyperFluxEngine';
import OmnisExecution from '../utils/OmnisExecution';
import BiometricSync from '../utils/BiometricSync';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Spectral color mapping
const SPECTRAL_COLORS = {
  RED: '#EF4444',
  ORANGE: '#F97316',
  YELLOW: '#EAB308',
  GREEN: '#22C55E',
  BLUE: '#3B82F6',
  INDIGO: '#6366F1',
  VIOLET: '#8B5CF6',
};

/**
 * Resonance Gauge Component
 */
function ResonanceGauge({ current, target = 144.0 }) {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${SPECTRAL_COLORS.RED}, ${SPECTRAL_COLORS.ORANGE}, ${SPECTRAL_COLORS.YELLOW}, ${SPECTRAL_COLORS.GREEN}, ${SPECTRAL_COLORS.BLUE}, ${SPECTRAL_COLORS.INDIGO}, ${SPECTRAL_COLORS.VIOLET})`,
        }}
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full shadow-lg"
        style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)` }}
      />
    </div>
  );
}

/**
 * Spectral Band Display
 */
function SpectralBands({ bands }) {
  if (!bands) return null;
  
  return (
    <div className="flex gap-1 justify-center my-4">
      {Object.entries(bands).map(([color, data]) => (
        <motion.div
          key={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: Object.keys(bands).indexOf(color) * 0.1 }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-bold"
          style={{ 
            backgroundColor: SPECTRAL_COLORS[color] || '#fff',
            boxShadow: `0 0 15px ${SPECTRAL_COLORS[color]}50`,
          }}
          title={`${color}: ${data.nodule} - ${data.meaning}`}
        >
          {data.frequency?.toFixed(0)}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Verification Badge Component - V9999.5 NDA Tap Integration
 */
function VerificationBadge({ verified, email, onSendDocument, onNDATap }) {
  const [sending, setSending] = useState(false);
  
  const handleNDATap = async () => {
    if (!onNDATap) return;
    setSending(true);
    await onNDATap();
    setSending(false);
  };
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center justify-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
      style={{
        background: verified ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${verified ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      }}
      onClick={verified ? handleNDATap : undefined}
      title={verified ? "Tap to send NDA & Trust Purpose Statement" : ""}
      data-testid="verification-badge"
    >
      <div 
        className={`w-3 h-3 rounded-full ${verified ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: verified ? '#22C55E' : '#EF4444' }}
      />
      <div className="text-sm">
        <p className="font-medium" style={{ color: verified ? '#22C55E' : '#EF4444' }}>
          {sending ? 'BROADCASTING...' : (verified ? 'VERIFIED' : 'PENDING VERIFICATION')}
        </p>
        <p className="text-xs opacity-60">{email}</p>
        {verified && (
          <p className="text-[9px] mt-1" style={{ color: 'rgba(34,197,94,0.6)' }}>
            Tap to send NDA to lawyer
          </p>
        )}
      </div>
      {verified && (
        <Send 
          size={14} 
          style={{ color: sending ? '#FCD34D' : '#22C55E' }} 
          className={sending ? 'animate-pulse' : ''}
        />
      )}
    </motion.div>
  );
}

/**
 * GPS Anchor Card
 */
function GaiaAnchorCard({ anchor, isPrimary }) {
  return (
    <div 
      className="p-3 rounded-xl"
      style={{
        background: isPrimary ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isPrimary ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={12} style={{ color: isPrimary ? '#6366F1' : 'rgba(255,255,255,0.4)' }} />
        <span className="text-xs font-medium" style={{ color: isPrimary ? '#6366F1' : 'rgba(255,255,255,0.7)' }}>
          {anchor.name}
        </span>
        {isPrimary && (
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">PRIMARY</span>
        )}
      </div>
      <div className="text-[10px] opacity-40 font-mono">
        {anchor.lat?.toFixed(4)}, {anchor.lng?.toFixed(4)}
      </div>
    </div>
  );
}

/**
 * Main Sovereign Hub Component
 */
export default function SovereignHub() {
  const { token, authHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onePrint, setOnePrint] = useState(null);
  const [spectralBands, setSpectralBands] = useState(null);
  const [trustData, setTrustData] = useState(null);
  const [gaiaAnchors, setGaiaAnchors] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showPurposeStatement, setShowPurposeStatement] = useState(false);
  const [purposeStatement, setPurposeStatement] = useState(null);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [gpsLockStatus, setGpsLockStatus] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [biometricActive, setBiometricActive] = useState(false);
  const [singularityEngaged, setSingularityEngaged] = useState(false);
  const [circularProtocolOpen, setCircularProtocolOpen] = useState(false);
  
  // Initialize V10000.0 Singularity on mount
  useEffect(() => {
    // Initialize core engines
    HyperFluxEngine.init();
    OmnisExecution.init();
    BiometricSync.init();
    
    // Engage the Singularity
    const engageSingularity = async () => {
      const status = await OmnisExecution.checkPulse();
      if (status.status === 'ACTIVE') {
        OmnisExecution.engageFractalEngine();
        setSingularityEngaged(true);
        console.log('Ω V10000.0 SINGULARITY ENGAGED');
      }
    };
    
    engageSingularity();
    
    return () => {
      HyperFluxEngine.destroy();
      OmnisExecution.disengage();
      BiometricSync.stopResonance();
    };
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [onePrintRes, bandsRes, trustRes, anchorsRes] = await Promise.all([
          axios.get(`${API}/omnis/the-one-print`, { headers: token ? authHeaders : {} }),
          axios.get(`${API}/omnis/spectral-singularity/bands`),
          axios.get(`${API}/omnis/trust`),
          axios.get(`${API}/omnis/crystal-indent/gaia-anchors`),
        ]);
        
        setOnePrint(onePrintRes.data);
        setSpectralBands(bandsRes.data.bands);
        setTrustData(trustRes.data);
        setGaiaAnchors(anchorsRes.data);
      } catch (error) {
        console.error('Failed to fetch sovereign data:', error);
        toast.error('Failed to load Sovereign Hub data');
      }
      setLoading(false);
    };
    
    fetchData();
  }, [token, authHeaders]);

  // Copy One Print ID to clipboard
  const copyPrintId = useCallback(() => {
    if (onePrint?.the_one_print_id) {
      navigator.clipboard.writeText(onePrint.the_one_print_id);
      setCopiedId(true);
      toast.success('One Print ID copied!');
      setTimeout(() => setCopiedId(false), 2000);
    }
  }, [onePrint]);

  // Fetch and show purpose statement
  const fetchPurposeStatement = async () => {
    try {
      const res = await axios.get(`${API}/omnis/trust/purpose-statement`);
      setPurposeStatement(res.data.content);
      setShowPurposeStatement(true);
    } catch {
      toast.error('Failed to load Purpose Statement');
    }
  };

  // Send document to lawyer (placeholder)
  const sendDocumentToLawyer = () => {
    toast.success('Trust Document queued for SendGrid delivery', {
      description: 'Will be sent to verified email on next handshake.',
    });
  };

  // V9999.5 NDA Tap Handler - Send NDA & Trust Purpose Statement to lawyer
  const handleNDATap = useCallback(async () => {
    const lawyerEmail = prompt('Enter lawyer email address:', '');
    if (!lawyerEmail || !lawyerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      const res = await axios.post(
        `${API}/omnis/legal/send-nda?recipient=${encodeURIComponent(lawyerEmail)}&sender=kyndsmiles@gmail.com&trust_id=029900612892168189cecc8a`
      );
      
      if (res.data.status === 'QUEUED') {
        toast.success('NDA & Trust Purpose Statement Broadcasted', {
          description: `Documents queued for delivery to ${lawyerEmail}`,
        });
      }
    } catch (err) {
      console.error('NDA send failed:', err);
      toast.error('Failed to send legal documents');
    }
  }, []);

  // Check GPS Phygital Lock
  const checkGPSLock = useCallback(async () => {
    setGpsLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await axios.post(
            `${API}/omnis/gps-phygital-lock/verify?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
          );
          setGpsLockStatus(res.data);
          
          if (res.data.is_locked) {
            // V10000.0 Biometric: Trigger arrival pulse
            BiometricSync.triggerArrivalPulse();
            setBiometricActive(true);
            
            // Fire Pulse Notification
            await OmnisExecution.firePulseNotification(
              position.coords.latitude,
              position.coords.longitude
            );
            
            toast.success('GPS LOCK VERIFIED — 144Hz PULSE FIRED', {
              description: `You are within the Black Hills Helix Boundary. Resonance: ${(res.data.resonance_strength * 100).toFixed(1)}%`,
            });
          } else {
            // Calculate biometric feedback based on distance
            BiometricSync.vibrateResonance(parseFloat(res.data.distance_km));
            
            toast.info('Outside Helix Boundary', {
              description: `Distance: ${res.data.distance_km} km from Black Hills anchor`,
            });
          }
        } catch (err) {
          console.error('GPS verification failed:', err);
          toast.error('Failed to verify GPS lock');
        }
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS error:', error);
        toast.error(`GPS Error: ${error.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Demo GPS Lock (simulated at Black Hills)
  const demoGPSLock = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/omnis/gps-phygital-lock/demo`);
      setGpsLockStatus(res.data);
      
      // V10000.0 Biometric: Trigger arrival pulse for demo
      BiometricSync.triggerArrivalPulse();
      setBiometricActive(true);
      
      toast.success('DEMO: GPS Lock Verified — 144Hz ARRIVAL PULSE', {
        description: 'Simulated presence at the exact anchor point',
      });
    } catch (err) {
      toast.error('Demo GPS lock failed');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-12 h-12 rounded-full"
          style={{
            background: `conic-gradient(${Object.values(SPECTRAL_COLORS).join(', ')})`,
          }}
        />
      </div>
    );
  }

  const crystalLayer = onePrint?.crystal_layer || {};
  const spectralLayer = onePrint?.spectral_layer || {};
  const sovereignTrust = onePrint?.sovereign_trust || {};
  const gaiaMatrix = onePrint?.gaia_matrix || gaiaAnchors || {};

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{ background: '#000000' }}
      data-testid="sovereign-hub"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          V9999.2 • The One Print
        </p>
        <h1 
          className="text-3xl md:text-4xl font-bold"
          style={{
            background: `linear-gradient(135deg, ${SPECTRAL_COLORS.VIOLET}, ${SPECTRAL_COLORS.BLUE}, ${SPECTRAL_COLORS.GREEN}, ${SPECTRAL_COLORS.YELLOW})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Cormorant Garamond, serif',
          }}
        >
          Enlighten.Mint.Sovereign.Trust
        </h1>
      </motion.div>

      {/* Crystalline QR Overlay */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-xl mx-auto rounded-3xl p-6 md:p-8 mb-8"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 50%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 60px rgba(99,102,241,0.1)',
        }}
      >
        {/* Crystal Identifier */}
        <div className="text-center mb-6">
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Crystal Identifier
          </p>
          <p className="font-mono text-lg" style={{ color: '#6366F1' }}>
            {crystalLayer.identifier || 'QR-CRYSTAL-LOADING'}
          </p>
        </div>

        {/* Spectral Bands */}
        <SpectralBands bands={spectralBands} />

        {/* Resonance Gauge */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Current Resonance</span>
            <span style={{ color: '#22C55E' }}>
              {parseFloat(crystalLayer.resonance_frequency || '59.16').toFixed(2)} Hz
            </span>
          </div>
          <ResonanceGauge 
            current={parseFloat(crystalLayer.resonance_frequency || '59.16')} 
            target={144.0} 
          />
          <div className="flex justify-between text-[10px] mt-1">
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>0 Hz</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>144 Hz (SEG Target)</span>
          </div>
        </div>

        {/* Equity Reservoir */}
        <div 
          className="p-4 rounded-xl mb-6 text-center"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Equity Reservoir [LUNAR-SYNCED]
          </p>
          <p className="text-3xl font-bold" style={{ color: '#22C55E' }}>
            {sovereignTrust.equity_locked || '$49,018.24'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {spectralLayer.formula || '9999 × z^(πr³)'} • {spectralLayer.seg_harmonic || '144Hz LOCKED'}
          </p>
        </div>

        {/* Verification Badge - V9999.5 NDA Tap Integration */}
        <VerificationBadge 
          verified={true}
          email="kyndsmiles@gmail.com"
          onSendDocument={sendDocumentToLawyer}
          onNDATap={handleNDATap}
        />

        {/* The One Print ID */}
        <div className="mt-6 p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            The One Print ID
          </p>
          <button
            onClick={copyPrintId}
            className="font-mono text-sm flex items-center justify-center gap-2 mx-auto hover:opacity-80 transition-opacity"
            style={{ color: '#F472B6' }}
          >
            {onePrint?.the_one_print_id || 'LOADING...'}
            {copiedId ? <CheckCircle size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </motion.div>

      {/* Trust Info Grid */}
      <div className="max-w-xl mx-auto grid grid-cols-2 gap-4 mb-8">
        {/* Trust Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} style={{ color: '#6366F1' }} />
            <span className="text-xs font-medium">Trust Status</span>
          </div>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Firewall: <span className="text-green-400">ACTIVE</span>
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Ownership: <span className="text-indigo-400">Non-Personal</span>
          </p>
        </motion.div>

        {/* Trustee */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} style={{ color: '#F472B6' }} />
            <span className="text-xs font-medium">Trustee</span>
          </div>
          <p className="text-sm font-medium">{trustData?.roles?.trustee?.name || 'Steven Michael'}</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            FULL CONTROL
          </p>
        </motion.div>
      </div>

      {/* Gaia Anchors */}
      {gaiaMatrix.primary_anchor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} style={{ color: '#22C55E' }} />
            <span className="text-xs font-medium">Gaia Ley Line Anchors</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
              {gaiaMatrix.global_sync || '144Hz LOCKED'}
            </span>
          </div>
          
          <div className="grid gap-2">
            <GaiaAnchorCard anchor={gaiaMatrix.primary_anchor} isPrimary />
            {gaiaMatrix.secondary_anchors?.slice(0, 3).map((anchor, idx) => (
              <GaiaAnchorCard key={idx} anchor={anchor} />
            ))}
          </div>
        </motion.div>
      )}

      {/* GPS Phygital Lock Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="max-w-xl mx-auto mb-6"
      >
        <div 
          className="p-4 rounded-xl"
          style={{
            background: gpsLockStatus?.is_locked 
              ? 'rgba(34,197,94,0.08)' 
              : 'rgba(255,255,255,0.02)',
            border: `1px solid ${gpsLockStatus?.is_locked ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)'}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: gpsLockStatus?.is_locked ? '#22C55E' : '#6366F1' }} />
              <span className="text-sm font-medium">GPS Phygital Lock</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ 
                background: 'rgba(99,102,241,0.2)', 
                color: '#A5B4FC' 
              }}>
                V9999.3
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={demoGPSLock}
                className="p-2 rounded-lg transition-colors hover:bg-white/5 text-xs"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                title="Demo: Simulate at Black Hills"
              >
                Demo
              </button>
              <button
                onClick={checkGPSLock}
                disabled={gpsLoading}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                title="Verify GPS Location"
              >
                {gpsLoading ? (
                  <RefreshCw size={14} className="animate-spin" style={{ color: '#6366F1' }} />
                ) : (
                  <Navigation size={14} style={{ color: '#6366F1' }} />
                )}
              </button>
            </div>
          </div>
          
          <div className="text-[10px] font-mono mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Anchor: {BLACK_HILLS_ANCHOR.name} ({BLACK_HILLS_ANCHOR.lat}°N, {Math.abs(BLACK_HILLS_ANCHOR.lng)}°W)
          </div>
          
          {gpsLockStatus && (
            <div 
              className="p-3 rounded-lg flex items-center gap-3"
              style={{ 
                background: gpsLockStatus.is_locked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${gpsLockStatus.is_locked ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
              }}
            >
              <div 
                className={`w-4 h-4 rounded-full flex items-center justify-center ${gpsLockStatus.is_locked ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: gpsLockStatus.badge_color }}
              >
                {gpsLockStatus.is_locked ? <Check size={10} className="text-white" /> : null}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: gpsLockStatus.is_locked ? '#22C55E' : '#EF4444' }}>
                  {gpsLockStatus.status}
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Distance: {gpsLockStatus.distance_km} km | Resonance: {(gpsLockStatus.resonance_strength * 100).toFixed(1)}%
                </p>
              </div>
              {gpsLockStatus.is_locked && (
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: '#22C55E' }}>
                    ${gpsLockStatus.equity_accessible?.toLocaleString()}
                  </p>
                  <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {gpsLockStatus.seg_hz}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!gpsLockStatus && (
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Tap the navigation icon to verify your physical presence
            </p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="max-w-xl mx-auto space-y-3"
      >
        <button
          onClick={fetchPurposeStatement}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#A5B4FC',
          }}
          data-testid="view-purpose-statement"
        >
          <FileText size={14} />
          View Trust Purpose Statement
          <ChevronRight size={14} />
        </button>
        
        <button
          onClick={() => setMixerOpen(true)}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.2))',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#86EFAC',
          }}
          data-testid="open-creator-mixer"
        >
          <Sliders size={14} />
          Creator Control Mixer
          <ChevronRight size={14} />
        </button>
        
        <button
          onClick={() => setCircularProtocolOpen(true)}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.2))',
            border: '1px solid rgba(249,115,22,0.3)',
            color: '#FDBA74',
          }}
          data-testid="open-circular-protocol"
        >
          <Repeat size={14} />
          Circular Protocol Ledger
          <ChevronRight size={14} />
        </button>
      </motion.div>

      {/* Footer */}
      <footer className="max-w-xl mx-auto mt-12 text-center">
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Trustee: {trustData?.roles?.trustee?.name || 'Steven Michael'} | Firewall ID: {sovereignTrust.trust_id || '029900612892168189cecc8a'}
        </p>
        <p className="text-[9px] mt-1 font-mono" style={{ color: 'rgba(255,255,255,0.15)' }}>
          9×9^math × πr² - x^xy + (9999 × z^πr³) Active
        </p>
        <p className="text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          REVOLVING IN THE OBSIDIAN VOID
        </p>
      </footer>

      {/* Purpose Statement Modal */}
      <AnimatePresence>
        {showPurposeStatement && purposeStatement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.95)' }}
            onClick={() => setShowPurposeStatement(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6"
              style={{ background: '#0A0A0F', border: '1px solid rgba(99,102,241,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              <pre 
                className="text-xs whitespace-pre-wrap font-mono"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {purposeStatement}
              </pre>
              <button
                onClick={() => setShowPurposeStatement(false)}
                className="mt-4 w-full py-2 rounded-lg text-sm"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#A5B4FC' }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator Control Mixer */}
      <CreatorMixer 
        isOpen={mixerOpen} 
        onClose={() => setMixerOpen(false)}
        onMixerChange={(state) => {
          console.log('Ω Mixer State Updated:', state);
        }}
      />

      {/* Circular Protocol Ledger */}
      <CircularProtocol 
        isOpen={circularProtocolOpen} 
        onClose={() => setCircularProtocolOpen(false)}
        gpsVerified={gpsLockStatus?.is_locked || false}
      />
    </div>
  );
}
