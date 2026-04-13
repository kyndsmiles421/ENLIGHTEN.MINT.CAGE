/**
 * ENLIGHTEN.MINT.CAFE - V10013.0 SOVEREIGN HUB — OMNI-EXPANSION
 * 
 * THE OBSIDIAN VOID — Unified Singularity Interface
 * 
 * V10000.3 OMNIS-NEXUS: Nodal Projection | Tiered UI Morphing | Time Usage
 * V10007.0 OMNIS-INTERCONNECT: Master Weaver | Holographic Art Overlay
 * V10010.0 DIRECTOR'S CUT: Multi-Track Timeline | Sovereign Movie
 * V10011.0 OMEGA ARCHITECT: Final 10 Moves | Perplexity Deep Dive
 * V10012.0 SINGULARITY NEXUS: Communications | Quest System
 * V10013.0 OMNI-EXPANSION: Global Nodal Map | World Law Broadcast | Moves 11-20
 * 
 * FEATURES:
 * - Zen-Flow HUD (No buttons for Tier 2+, gesture navigation)
 * - Holographic Art Overlay (54-layer L² Fractal transparency)
 * - GPS Nodal Network auto-injection
 * - Mixer-driven UI morphing
 * - Time-based Knowledge Equity billing
 * - Director Timeline (PowerDirector-style multi-track)
 * - Deep Dive Search (Perplexity-style threaded synthesis)
 * - Global Nodal Map (Refracted Crystal Rainbow world projection)
 * 
 * Theme: Obsidian Void / Refracted Crystal / 144Hz
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Check, Zap, Globe, Moon, Sun, Star, Hexagon,
  Activity, Lock, Unlock, Send, FileText, MapPin, Radio,
  ChevronRight, ExternalLink, Copy, CheckCircle, Sliders,
  RefreshCw, Navigation, Vibrate, Repeat, BookOpen, 
  Paintbrush, Scale, Heart, Triangle, Circle, Film, Search, Map
} from 'lucide-react';
import { toast } from 'sonner';
import CreatorMixer from '../components/CreatorMixer';
import MixerV27 from '../components/MixerV27';
import CircularProtocol from '../components/CircularProtocol';
import AcademyPortal from '../components/AcademyPortal';
import DirectorTimeline from '../components/DirectorTimeline';
import DeepDiveSearch from '../components/DeepDiveSearch';
import GlobalNodalMap from '../components/GlobalNodalMap';
import HyperFluxEngine, { BLACK_HILLS_ANCHOR } from '../utils/HyperFluxEngine';
import OmnisExecution from '../utils/OmnisExecution';
import BiometricSync from '../utils/BiometricSync';
import OmnisInterconnect from '../utils/OmnisInterconnect';
import OmnisNexus from '../utils/OmnisNexus';
import OmnisDirect from '../utils/OmnisDirect';
import OmniExpansion from '../utils/OmniExpansion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// V29.2 GAMIFIED CREDIT SYSTEM — NO USD VALUES
const VOLUNTEER_RATE = 10; // Credits per hour (Fans)
const UNIT_NAME = "Fans";  // Gamified unit name

// Calculate credits from hours worked
const calculateCredits = (hoursWorked) => {
  return hoursWorked * VOLUNTEER_RATE;
};

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

// Gesture mappings for Zen-Flow HUD
const GESTURE_ACTIONS = {
  circle: { action: 'LAW', label: 'Law Library', icon: Scale, color: '#8B5CF6' },
  spiral: { action: 'ART', label: 'Art Academy', icon: Paintbrush, color: '#3B82F6' },
  triangle: { action: 'LOGIC', label: 'Engineering', icon: Triangle, color: '#22C55E' },
  heart: { action: 'WELLNESS', label: 'Wellness', icon: Heart, color: '#F472B6' },
};

/**
 * Holographic Art Overlay Component
 * Projects the 54-layer L² Fractal as a transparent interface
 */
function HolographicOverlay({ opacity = 0.88, active = true }) {
  if (!active) return null;
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity }}
    >
      {/* Flower of Life Pattern */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="holoGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.1)" />
            <stop offset="50%" stopColor="rgba(59,130,246,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <pattern id="flowerPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.3" />
            <circle cx="10" cy="2" r="8" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="0.2" />
            <circle cx="10" cy="18" r="8" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="0.2" />
            <circle cx="3" cy="6" r="8" fill="none" stroke="rgba(59,130,246,0.05)" strokeWidth="0.2" />
            <circle cx="17" cy="6" r="8" fill="none" stroke="rgba(59,130,246,0.05)" strokeWidth="0.2" />
            <circle cx="3" cy="14" r="8" fill="none" stroke="rgba(34,197,94,0.04)" strokeWidth="0.2" />
            <circle cx="17" cy="14" r="8" fill="none" stroke="rgba(34,197,94,0.04)" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#holoGrad)" />
        <rect width="100%" height="100%" fill="url(#flowerPattern)" />
      </svg>
    </div>
  );
}

/**
 * Gesture Canvas Component for Zen-Flow HUD
 * Detects circle, spiral, triangle, and heart gestures
 */
function GestureCanvas({ onGestureDetected, enabled = true }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [gestureHint, setGestureHint] = useState(null);
  
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }, []);
  
  const startDrawing = useCallback((e) => {
    if (!enabled) return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    setPoints([pos]);
  }, [enabled, getPos]);
  
  const draw = useCallback((e) => {
    if (!isDrawing || !enabled) return;
    e.preventDefault();
    const pos = getPos(e);
    setPoints(prev => [...prev, pos]);
    
    // Draw on canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && points.length > 0) {
      ctx.strokeStyle = 'rgba(139,92,246,0.6)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }, [isDrawing, enabled, points, getPos]);
  
  const endDrawing = useCallback(() => {
    if (!isDrawing || points.length < 10) {
      setIsDrawing(false);
      setPoints([]);
      return;
    }
    
    setIsDrawing(false);
    
    // Analyze gesture
    const gesture = analyzeGesture(points);
    
    if (gesture && onGestureDetected) {
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      onGestureDetected(gesture);
      setGestureHint(gesture);
      setTimeout(() => setGestureHint(null), 1500);
    }
    
    // Clear canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setPoints([]);
  }, [isDrawing, points, onGestureDetected]);
  
  // Gesture analysis algorithm
  const analyzeGesture = (pts) => {
    if (pts.length < 10) return null;
    
    // Calculate bounding box
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Calculate centroid
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    
    // Calculate average distance from centroid (for circle detection)
    const avgDist = pts.reduce((s, p) => s + Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2), 0) / pts.length;
    const distVariance = pts.reduce((s, p) => {
      const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
      return s + (d - avgDist) ** 2;
    }, 0) / pts.length;
    
    // Calculate total angle traversed (for spiral detection)
    let totalAngle = 0;
    for (let i = 1; i < pts.length; i++) {
      const a1 = Math.atan2(pts[i - 1].y - cy, pts[i - 1].x - cx);
      const a2 = Math.atan2(pts[i].y - cy, pts[i].x - cx);
      let da = a2 - a1;
      if (da > Math.PI) da -= 2 * Math.PI;
      if (da < -Math.PI) da += 2 * Math.PI;
      totalAngle += da;
    }
    
    // Aspect ratio
    const aspectRatio = width / (height || 1);
    
    // Detect gesture type
    const circleThreshold = avgDist * 0.3;
    const isCircular = Math.sqrt(distVariance) < circleThreshold;
    const isFullRotation = Math.abs(totalAngle) > 5; // ~286 degrees
    const isSpiral = Math.abs(totalAngle) > 8; // Multiple rotations
    
    // Triangle detection (look for 3 corners)
    const corners = detectCorners(pts);
    const isTriangle = corners >= 2 && corners <= 4 && aspectRatio > 0.6 && aspectRatio < 1.5;
    
    // Heart detection (two lobes at top, point at bottom)
    const hasHeartShape = detectHeartShape(pts, cx, cy);
    
    if (hasHeartShape) return 'heart';
    if (isSpiral) return 'spiral';
    if (isCircular && isFullRotation) return 'circle';
    if (isTriangle) return 'triangle';
    
    return null;
  };
  
  const detectCorners = (pts) => {
    let corners = 0;
    const threshold = 0.5; // radians
    
    for (let i = 5; i < pts.length - 5; i++) {
      const v1x = pts[i].x - pts[i - 5].x;
      const v1y = pts[i].y - pts[i - 5].y;
      const v2x = pts[i + 5].x - pts[i].x;
      const v2y = pts[i + 5].y - pts[i].y;
      
      const dot = v1x * v2x + v1y * v2y;
      const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
      const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
      
      if (mag1 > 0 && mag2 > 0) {
        const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
        if (angle > threshold && angle < Math.PI - threshold) {
          corners++;
          // Skip ahead to avoid counting same corner multiple times
          i += 10;
        }
      }
    }
    
    return corners;
  };
  
  const detectHeartShape = (pts, cx, cy) => {
    // Check if there are two "bumps" in the top half and a point at the bottom
    const topPts = pts.filter(p => p.y < cy);
    const bottomPts = pts.filter(p => p.y >= cy);
    
    if (topPts.length < 5 || bottomPts.length < 5) return false;
    
    // Check for two peaks in top half
    const topXs = topPts.map(p => p.x);
    const topXRange = Math.max(...topXs) - Math.min(...topXs);
    
    // Check for convergence at bottom
    const bottomYs = bottomPts.map(p => p.y);
    const lowestY = Math.max(...bottomYs);
    const lowestPts = bottomPts.filter(p => p.y > lowestY - 20);
    const lowestXRange = lowestPts.length > 0 ? 
      Math.max(...lowestPts.map(p => p.x)) - Math.min(...lowestPts.map(p => p.x)) : 0;
    
    return topXRange > lowestXRange * 1.5;
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, []);
  
  if (!enabled) return null;
  
  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-40"
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        data-testid="gesture-canvas"
      />
      
      {/* Gesture hint indicator */}
      <AnimatePresence>
        {gestureHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 
                       px-6 py-4 rounded-2xl backdrop-blur-xl"
            style={{ 
              background: 'rgba(0,0,0,0.8)',
              border: `2px solid ${GESTURE_ACTIONS[gestureHint]?.color || '#8B5CF6'}`,
            }}
          >
            <div className="flex items-center gap-3">
              {GESTURE_ACTIONS[gestureHint] && React.createElement(GESTURE_ACTIONS[gestureHint].icon, {
                size: 24,
                style: { color: GESTURE_ACTIONS[gestureHint].color }
              })}
              <span className="text-white font-medium">
                {GESTURE_ACTIONS[gestureHint]?.label || gestureHint}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Gesture guide (subtle hints at screen edges) */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <div className="absolute top-4 left-4 text-[10px] opacity-30 text-violet-400">
          <Circle size={12} className="inline mr-1" /> Circle → Law
        </div>
        <div className="absolute top-4 right-4 text-[10px] opacity-30 text-blue-400 text-right">
          Spiral → Art <Paintbrush size={12} className="inline ml-1" />
        </div>
        <div className="absolute bottom-4 left-4 text-[10px] opacity-30 text-green-400">
          <Triangle size={12} className="inline mr-1" /> Triangle → Logic
        </div>
        <div className="absolute bottom-4 right-4 text-[10px] opacity-30 text-pink-400 text-right">
          Heart → Wellness <Heart size={12} className="inline ml-1" />
        </div>
      </div>
    </>
  );
}

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
 * V10007.0 — The Obsidian Void with Zen-Flow HUD
 */
export default function SovereignHub() {
  const { token, authHeaders, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onePrint, setOnePrint] = useState(null);
  const [spectralBands, setSpectralBands] = useState(null);
  const [trustData, setTrustData] = useState(null);
  const [gaiaAnchors, setGaiaAnchors] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showPurposeStatement, setShowPurposeStatement] = useState(false);
  const [purposeStatement, setPurposeStatement] = useState(null);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [physicsMixerOpen, setPhysicsMixerOpen] = useState(false);
  const [gpsLockStatus, setGpsLockStatus] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [biometricActive, setBiometricActive] = useState(false);
  const [singularityEngaged, setSingularityEngaged] = useState(false);
  const [circularProtocolOpen, setCircularProtocolOpen] = useState(false);
  const [academyOpen, setAcademyOpen] = useState(false);
  const [userResonance, setUserResonance] = useState(36);
  
  // V10007.0 New States
  const [userTier, setUserTier] = useState(2); // Default to Architect for gesture nav
  const [zenFlowEnabled, setZenFlowEnabled] = useState(false); // V29.1: Disabled by default to prevent UI blocking
  const [holographicOpacity, setHolographicOpacity] = useState(0.88);
  const [interconnectStatus, setInterconnectStatus] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  
  // V10010.0 / V10011.0 Director's Cut States
  const [directorTimelineOpen, setDirectorTimelineOpen] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [omegaSealed, setOmegaSealed] = useState(false);
  
  // V10013.0 Omni-Expansion States
  const [globalMapOpen, setGlobalMapOpen] = useState(false);
  const [expansionStatus, setExpansionStatus] = useState(null);
  
  // Initialize V10000.0 Singularity on mount
  useEffect(() => {
    // Initialize core engines
    HyperFluxEngine.init();
    OmnisExecution.init();
    BiometricSync.init();
    
    // V10007.0 Initialize Omnis-Interconnect
    OmnisInterconnect.init();
    OmnisNexus.init();
    
    // V10010.0 Initialize Omnis-Direct (Director + Omega)
    OmnisDirect.init();
    
    // V10013.0 Initialize Omni-Expansion
    OmniExpansion.init();
    
    // Engage the Singularity
    const engageSingularity = async () => {
      const status = await OmnisExecution.checkPulse();
      if (status.status === 'ACTIVE') {
        OmnisExecution.engageFractalEngine();
        setSingularityEngaged(true);
        console.log('Ω V10013.0 OMNI-EXPANSION ENGAGED');
        
        // Execute unified singularity handshake
        const interconnect = OmnisInterconnect.executeSingularity();
        setInterconnectStatus(interconnect);
      }
    };
    
    engageSingularity();
    
    // Fetch expansion status
    const fetchExpansionStatus = async () => {
      try {
        const res = await axios.get(`${API}/omnis/expansion/status`);
        setExpansionStatus(res.data);
      } catch (e) {
        console.log('Expansion status fetch skipped');
      }
    };
    
    fetchExpansionStatus();
    
    // Fetch interconnect status
    const fetchInterconnectStatus = async () => {
      try {
        const res = await axios.get(`${API}/omnis/interconnect/status`);
        setInterconnectStatus(res.data);
        if (res.data.mixer_control) {
          setUserTier(res.data.mixer_control.tier_level || 2);
          setHolographicOpacity(res.data.mixer_control.holographic_opacity || 0.88);
        }
      } catch (err) {
        console.log('Interconnect status fetch skipped (using local)');
      }
    };
    
    fetchInterconnectStatus();
    
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
      
      // V10000.3: Start learning session
      try {
        await axios.post(`${API}/omnis/nexus/session/start?node_id=BLACK_HILLS_PRIMARY`);
        setSessionActive(true);
      } catch (e) {
        console.log('Session tracking skipped');
      }
      
      toast.success('DEMO: GPS Lock Verified — 144Hz ARRIVAL PULSE', {
        description: 'Simulated presence at the exact anchor point',
      });
    } catch (err) {
      toast.error('Demo GPS lock failed');
    }
  }, []);
  
  // V10007.0 Gesture Handler
  const handleGestureDetected = useCallback(async (gesture) => {
    console.log(`Ω GESTURE DETECTED: ${gesture}`);
    
    // Call backend gesture handler
    try {
      const res = await axios.post(`${API}/omnis/interconnect/gesture?gesture=${gesture}`);
      console.log('Gesture response:', res.data);
    } catch (e) {
      console.log('Gesture API call skipped');
    }
    
    // Handle gesture actions locally
    const action = GESTURE_ACTIONS[gesture];
    if (!action) return;
    
    setActiveModule(gesture);
    
    switch (gesture) {
      case 'circle':
        // Open Law Library (part of Academy)
        setAcademyOpen(true);
        toast.success('Law Library Accessed', { description: 'Circle gesture recognized' });
        break;
      case 'spiral':
        // Open Art Academy (part of Academy)
        setAcademyOpen(true);
        toast.success('Art Academy Accessed', { description: 'Phi spiral recognized' });
        break;
      case 'triangle':
        // Open Engineering/Logic module (Creator Mixer has engineering controls)
        setMixerOpen(true);
        toast.success('Engineering Module Accessed', { description: 'Triangle gesture recognized' });
        break;
      case 'heart':
        // Open Wellness (Circular Protocol has P2P wellness trades)
        setCircularProtocolOpen(true);
        toast.success('Wellness Portal Accessed', { description: 'Heart gesture recognized' });
        break;
      default:
        break;
    }
    
    // Clear active module after animation
    setTimeout(() => setActiveModule(null), 2000);
  }, []);
  
  // Toggle Zen-Flow mode
  const toggleZenFlow = useCallback(() => {
    setZenFlowEnabled(prev => {
      const newState = !prev;
      toast.info(newState ? 'Zen-Flow HUD Enabled' : 'Standard Navigation Restored', {
        description: newState ? 'Draw gestures to navigate' : 'Button navigation active',
      });
      return newState;
    });
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
      className="min-h-screen p-4 md:p-8 relative"
      style={{ background: '#000000' }}
      data-testid="sovereign-hub"
    >
      {/* V10007.0 Holographic Art Overlay */}
      <HolographicOverlay 
        opacity={holographicOpacity * 0.3} 
        active={userTier >= 1 && singularityEngaged} 
      />
      
      {/* V10007.0 Gesture Canvas for Zen-Flow HUD */}
      <GestureCanvas 
        onGestureDetected={handleGestureDetected}
        enabled={zenFlowEnabled && userTier >= 2}
      />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-20"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          V10013.0 • Omni-Expansion • {userTier >= 2 ? 'Director Mode' : 'Standard Mode'}
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
          ENLIGHTEN.MINT.CAFE
        </h1>
      </motion.div>

      {/* ═══ FUNCTIONAL NAVIGATION — 7 Pillars, Color Coded, Every Button Goes Somewhere ═══ */}
      <div className="max-w-xl mx-auto mb-8 px-2">
        {[
          { title: 'Practice', color: '#D8B4FE', items: [
            { label: 'Breathwork', route: '/breathing' }, { label: 'Meditation', route: '/meditation' },
            { label: 'Yoga', route: '/yoga' }, { label: 'Mudras', route: '/mudras' },
            { label: 'Mantras', route: '/mantras' }, { label: 'Light Therapy', route: '/light-therapy' },
          ]},
          { title: 'Divination', color: '#E879F9', items: [
            { label: 'Oracle & Tarot', route: '/oracle' }, { label: 'Akashic Records', route: '/akashic-records' },
            { label: 'Star Chart', route: '/star-chart' }, { label: 'Numerology', route: '/numerology' },
            { label: 'Dream Journal', route: '/dreams' }, { label: 'Mayan Astrology', route: '/mayan' },
          ]},
          { title: 'Sanctuary', color: '#2DD4BF', items: [
            { label: 'Zen Garden', route: '/zen-garden' }, { label: 'Soundscapes', route: '/soundscapes' },
            { label: 'Music Lounge', route: '/music-lounge' }, { label: 'Frequencies', route: '/frequencies' },
            { label: 'VR Sanctuary', route: '/vr' }, { label: 'Journaling', route: '/journal' },
          ]},
          { title: 'Nourish & Heal', color: '#22C55E', items: [
            { label: 'Nourishment', route: '/nourishment' }, { label: 'Aromatherapy', route: '/aromatherapy' },
            { label: 'Herbology', route: '/herbology' }, { label: 'Elixirs', route: '/elixirs' },
            { label: 'Acupressure', route: '/acupressure' }, { label: 'Reiki', route: '/reiki' },
          ]},
          { title: 'Explore', color: '#FB923C', items: [
            { label: 'Encyclopedia', route: '/encyclopedia' }, { label: 'Reading List', route: '/reading-list' },
            { label: 'Creation Stories', route: '/creation-stories' }, { label: 'Teachings', route: '/teachings' },
            { label: 'Community', route: '/community' }, { label: 'Blessings', route: '/blessings' },
          ]},
          { title: 'Sage AI Coach', color: '#38BDF8', items: [
            { label: 'Voice Conversations', route: '/coach' }, { label: 'Spiritual Guidance', route: '/coach' },
            { label: 'Crystals & Stones', route: '/crystals' }, { label: 'Personalized Wisdom', route: '/coach' },
          ]},
          { title: 'Sovereign Council', color: '#C084FC', items: [
            { label: 'Council Advisors', route: '/sovereigns' }, { label: 'Economy & Dust', route: '/economy' },
            { label: 'Academy', route: '/academy' }, { label: 'Trade Circle', route: '/trade-circle' },
            { label: 'Crystal Skins', route: '/crystal-skins' }, { label: 'Archives', route: '/archives' },
          ]},
        ].map((group) => (
          <div key={group.title} className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 px-1" style={{ color: group.color }}>{group.title}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className="py-2.5 px-2 rounded-lg text-[11px] text-left transition-all active:scale-95"
                  style={{ background: `${group.color}08`, border: `1px solid ${group.color}18`, color: 'rgba(248,250,252,0.7)' }}
                  data-testid={`nav-${item.label.toLowerCase().replace(/[\s&]/g, '-')}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons - Hidden in Zen-Flow mode for Tier 2+ */}
      <AnimatePresence>
        {(!zenFlowEnabled || userTier < 2) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-xl mx-auto space-y-3 relative z-20"
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
            
            <button
              onClick={() => setAcademyOpen(true)}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#C4B5FD',
              }}
              data-testid="open-academy-portal"
            >
              <BookOpen size={14} />
              The Great Library
              <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Zen-Flow Gesture Guide (shown when buttons hidden) */}
      <AnimatePresence>
        {zenFlowEnabled && userTier >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto text-center py-8 relative z-20"
          >
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Draw a gesture to navigate
            </p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(GESTURE_ACTIONS).map(([key, { label, icon: Icon, color }]) => (
                <div 
                  key={key}
                  className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                  style={{
                    background: activeModule === key ? `${color}20` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeModule === key ? color : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <Icon size={20} style={{ color }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {label}
                  </span>
                  <span className="text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-xl mx-auto mt-12 text-center relative z-20">
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          SINGULARITY KERNEL V30.3 • Obsidian Shield Active
        </p>
        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          V10013.0 OMNI-EXPANSION | {expansionStatus?.nodal_map?.active_nodes || 3}/{expansionStatus?.nodal_map?.total_nodes || 7} Nodes Active
        </p>
        <p className="text-[10px] mt-1" style={{ color: 'rgba(34,197,94,0.4)' }}>
          {sessionActive ? 'Learning Session Active' : 'NEXUS LIVE — GLOBAL EXPANSION MODE'}
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

      {/* Academy Portal - The Great Library */}
      <AcademyPortal 
        isOpen={academyOpen} 
        onClose={() => setAcademyOpen(false)}
        userResonance={userResonance}
      />
      
      {/* V10010.0 Director Timeline */}
      <DirectorTimeline 
        isOpen={directorTimelineOpen} 
        onClose={() => setDirectorTimelineOpen(false)}
      />
      
      {/* V10010.0 Deep Dive Search */}
      <DeepDiveSearch 
        isOpen={deepDiveOpen} 
        onClose={() => setDeepDiveOpen(false)}
      />
      
      {/* V10013.0 Global Nodal Map */}
      <GlobalNodalMap 
        isOpen={globalMapOpen} 
        onClose={() => setGlobalMapOpen(false)}
      />
      
      {/* V27.0 Physics Mixer - Crystal & Math License Interface */}
      {physicsMixerOpen && (
        <MixerV27 
          userId={user?.email || 'default_user'}
          onClose={() => setPhysicsMixerOpen(false)}
        />
      )}
    </div>
  );
}
