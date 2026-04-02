import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMixer } from '../context/MixerContext';
import {
  Music, Map, Triangle, Heart, Waves, HeartHandshake,
  BookOpen, Gamepad2, Wind, Sun, GraduationCap,
  Eye, Star, Orbit, Telescope
} from 'lucide-react';
import MissionControl from '../components/MissionControl';

// ━━━ Orbital Satellite Definitions ━━━
const SATELLITES = [
  // Inner ring — core tools (equator)
  { id: 'mood', label: 'Mood Engine', icon: Heart, path: '/mood', color: '#EC4899', ring: 0, desc: 'Track your emotional frequencies' },
  { id: 'mixer', label: 'Soundscape', icon: Music, path: '/cosmic-mixer', color: '#A78BFA', ring: 0, desc: 'Synthesize healing frequencies' },
  { id: 'map', label: 'Cosmic Map', icon: Map, path: '/cosmic-map', color: '#22C55E', ring: 0, desc: 'Explore the resonance grid' },
  { id: 'breathing', label: 'Breathwork', icon: Wind, path: '/breathing', color: '#60A5FA', ring: 0, desc: 'Guided breathing patterns' },
  { id: 'meditation', label: 'Meditation', icon: Sun, path: '/meditation', color: '#FBBF24', ring: 0, desc: 'Deep stillness practices' },
  { id: 'theory', label: 'Conservatory', icon: GraduationCap, path: '/theory', color: '#2DD4BF', ring: 0, desc: 'Music theory & phonics' },
  // Outer ring — deeper tools (poles)
  { id: 'workshop', label: 'Workshop', icon: Triangle, path: '/workshop', color: '#F59E0B', ring: 1, desc: 'Sacred architecture & physics' },
  { id: 'star-chart', label: 'Star Chart', icon: Star, path: '/star-chart', color: '#818CF8', ring: 1, desc: 'Celestial navigation' },
  { id: 'observatory', label: 'Observatory', icon: Telescope, path: '/observatory', color: '#6366F1', ring: 1, desc: 'Live sky events & data sonification' },
  { id: 'trade', label: 'Trade Circle', icon: HeartHandshake, path: '/trade-circle', color: '#FB923C', ring: 1, desc: 'Exchange resonant assets' },
  { id: 'oracle', label: 'Oracle', icon: Eye, path: '/oracle', color: '#C084FC', ring: 1, desc: 'Divination & insight' },
  { id: 'games', label: 'Games', icon: Gamepad2, path: '/games', color: '#34D399', ring: 1, desc: 'Starseed adventures' },
  { id: 'journal', label: 'Journal', icon: BookOpen, path: '/journal', color: '#FDA4AF', ring: 1, desc: 'Wisdom journal' },
];

// ━━━ Cosmic Dust Particles ━━━
function CosmicDust() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.05,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(192,132,252,${p.opacity})`,
          }}
          animate={{
            x: [0, Math.sin(p.id) * 30, 0],
            y: [0, Math.cos(p.id) * 20, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ━━━ Connection Lines SVG ━━━
function ConnectionLines({ innerPositions, outerPositions, hoveredSat, centerX, centerY }) {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      {/* Inner ring connections */}
      {innerPositions.map((pos, i) => {
        const isHovered = hoveredSat === SATELLITES.filter(s => s.ring === 0)[i]?.id;
        return (
          <line key={`inner-${i}`}
            x1={centerX} y1={centerY}
            x2={centerX + pos.x} y2={centerY + pos.y}
            stroke={isHovered ? SATELLITES.filter(s => s.ring === 0)[i]?.color : 'rgba(248,250,252,0.03)'}
            strokeWidth={isHovered ? 1.5 : 0.5}
            strokeDasharray={isHovered ? 'none' : '4,8'}
            style={{ transition: 'all 0.5s ease' }}
          />
        );
      })}
      {/* Outer ring connections */}
      {outerPositions.map((pos, i) => {
        const isHovered = hoveredSat === SATELLITES.filter(s => s.ring === 1)[i]?.id;
        return (
          <line key={`outer-${i}`}
            x1={centerX} y1={centerY}
            x2={centerX + pos.x} y2={centerY + pos.y}
            stroke={isHovered ? SATELLITES.filter(s => s.ring === 1)[i]?.color : 'rgba(248,250,252,0.02)'}
            strokeWidth={isHovered ? 1 : 0.3}
            strokeDasharray={isHovered ? 'none' : '2,12'}
            style={{ transition: 'all 0.5s ease' }}
          />
        );
      })}
    </svg>
  );
}

// ━━━ Central Orb ━━━
function CentralOrb({ onClick, pulseColor }) {
  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      data-testid="central-orb"
      style={{ width: 130, height: 130 }}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            `0 0 40px ${pulseColor}15, 0 0 80px ${pulseColor}08`,
            `0 0 60px ${pulseColor}25, 0 0 120px ${pulseColor}12`,
            `0 0 40px ${pulseColor}15, 0 0 80px ${pulseColor}08`,
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Rotating ring */}
      <motion.div className="absolute rounded-full"
        style={{ inset: 6, border: `1px solid ${pulseColor}18` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      {/* Counter-rotating inner ring */}
      <motion.div className="absolute rounded-full"
        style={{ inset: 14, border: `1px dashed ${pulseColor}10` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      {/* Core */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          inset: 22,
          background: `radial-gradient(circle at 38% 32%, ${pulseColor}35, ${pulseColor}10 55%, rgba(10,10,18,0.92) 85%)`,
          border: `1.5px solid ${pulseColor}25`,
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Orbit size={30} style={{ color: pulseColor, opacity: 0.6 }} />
      </motion.div>
      {/* Label */}
      <p className="absolute text-center w-full text-[8px] font-medium tracking-[0.2em] uppercase"
        style={{ bottom: -20, color: `${pulseColor}60` }}>
        Mission Control
      </p>
    </motion.div>
  );
}

// ━━━ Satellite ━━━
function Satellite({ sat, x, y, isHovered, onHover, onSelect }) {
  const Icon = sat.icon;
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: '50%', top: '50%', width: 68, height: 68, marginLeft: -34, marginTop: -34 }}
      animate={{ x, y, scale: isHovered ? 1.22 : 1 }}
      transition={{ type: 'spring', stiffness: 60, damping: 20 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => onSelect(sat)}
      onHoverStart={() => onHover(sat.id)}
      onHoverEnd={() => onHover(null)}
      data-testid={`satellite-${sat.id}`}
    >
      <div className="w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-500"
        style={{
          background: isHovered ? `${sat.color}14` : 'rgba(10,10,18,0.55)',
          border: `1px solid ${isHovered ? sat.color + '50' : sat.color + '12'}`,
          boxShadow: isHovered ? `0 0 28px ${sat.color}20, inset 0 0 12px ${sat.color}08` : 'none',
          backdropFilter: 'blur(10px)',
        }}>
        <Icon size={19} style={{ color: sat.color, transition: 'all 0.3s' }} />
        <p className="text-[7px] mt-0.5 font-medium transition-colors duration-300"
          style={{ color: isHovered ? sat.color : 'rgba(248,250,252,0.35)' }}>
          {sat.label}
        </p>
      </div>
    </motion.div>
  );
}

// ━━━ Atmospheric Audio Cue Zones ━━━
const ZONE_AUDIO = {
  // Celestial zone — high, shimmering sine waves
  'star-chart': { hz: 852, type: 'sine', gain: 0.06, zone: 'celestial' },
  'observatory': { hz: 963, type: 'sine', gain: 0.05, zone: 'celestial' },
  'oracle': { hz: 741, type: 'sine', gain: 0.05, zone: 'celestial' },
  // Earth zone — lower, grounded tones
  'workshop': { hz: 256, type: 'triangle', gain: 0.06, zone: 'earth' },
  'trade': { hz: 324, type: 'triangle', gain: 0.05, zone: 'earth' },
  'games': { hz: 396, type: 'triangle', gain: 0.04, zone: 'earth' },
  // Heart zone — warm, mid frequencies
  'mood': { hz: 528, type: 'sine', gain: 0.05, zone: 'heart' },
  'breathing': { hz: 432, type: 'sine', gain: 0.06, zone: 'heart' },
  'meditation': { hz: 639, type: 'sine', gain: 0.05, zone: 'heart' },
  // Creative zone
  'mixer': { hz: 369, type: 'sine', gain: 0.05, zone: 'creative' },
  'theory': { hz: 417, type: 'sine', gain: 0.05, zone: 'creative' },
  'map': { hz: 285, type: 'triangle', gain: 0.04, zone: 'earth' },
  'journal': { hz: 396, type: 'sine', gain: 0.04, zone: 'heart' },
};

function useAtmosphericAudio() {
  const ctxRef = useRef(null);
  const activeOscRef = useRef(null);
  const activeGainRef = useRef(null);

  const play = useCallback((satId) => {
    const zone = ZONE_AUDIO[satId];
    if (!zone) return;

    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;

      // Fade out previous
      if (activeGainRef.current) {
        activeGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        const oldOsc = activeOscRef.current;
        setTimeout(() => { try { oldOsc?.stop(); } catch {} }, 400);
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = zone.type;
      osc.frequency.value = zone.hz;

      // Soft fade in
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(zone.gain, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);

      activeOscRef.current = osc;
      activeGainRef.current = gain;
    } catch {}
  }, []);

  const stop = useCallback(() => {
    if (activeGainRef.current && ctxRef.current) {
      activeGainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.4);
      const oldOsc = activeOscRef.current;
      setTimeout(() => { try { oldOsc?.stop(); } catch {} }, 500);
      activeOscRef.current = null;
      activeGainRef.current = null;
    }
  }, []);

  return { play, stop };
}

// ━━━ Main Orbital Hub ━━━
export default function OrbitalHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeFrequencies } = useMixer();
  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [hoveredSat, setHoveredSat] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const animRef = useRef(null);
  const { play: playAtmo, stop: stopAtmo } = useAtmosphericAudio();

  const pulseColor = activeFrequencies?.length > 0 ? '#A78BFA' : '#2DD4BF';

  // Continuous slow orbital rotation
  useEffect(() => {
    let last = performance.now();
    const animate = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setOrbitAngle(prev => prev + dt * 0.06);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleSelect = useCallback((sat) => { stopAtmo(); navigate(sat.path); }, [navigate, stopAtmo]);

  const handleHover = useCallback((satId) => {
    setHoveredSat(satId);
    if (satId) playAtmo(satId);
    else stopAtmo();
  }, [playAtmo, stopAtmo]);

  const innerSats = SATELLITES.filter(s => s.ring === 0);
  const outerSats = SATELLITES.filter(s => s.ring === 1);

  // Calculate positions
  const innerR = 160;
  const outerR = 245;
  const innerPositions = innerSats.map((_, i) => {
    const a = (i / innerSats.length) * Math.PI * 2 + orbitAngle;
    return { x: Math.cos(a) * innerR, y: Math.sin(a) * innerR };
  });
  const outerPositions = outerSats.map((_, i) => {
    const a = (i / outerSats.length) * Math.PI * 2 + Math.PI / outerSats.length + orbitAngle * 0.55;
    return { x: Math.cos(a) * outerR, y: Math.sin(a) * outerR };
  });

  const hoveredData = SATELLITES.find(s => s.id === hoveredSat);
  const containerSize = 620;
  const center = containerSize / 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      data-testid="orbital-hub-page">

      <CosmicDust />

      {/* Title */}
      <motion.div className="absolute top-8 left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h1 className="text-lg font-light tracking-[0.25em] uppercase"
          style={{ color: 'rgba(248,250,252,0.25)', fontFamily: 'Cormorant Garamond, serif' }}>
          The Cosmic Collective
        </h1>
        {user && (
          <p className="text-[9px] mt-1.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
            Welcome back, {user.name || 'Traveler'}
          </p>
        )}
      </motion.div>

      {/* Orbital System */}
      <div className="relative" style={{ width: containerSize, height: containerSize }}>
        {/* Orbit track rings */}
        <motion.div className="absolute rounded-full"
          style={{ left: center - innerR, top: center - innerR, width: innerR * 2, height: innerR * 2, border: '1px solid rgba(248,250,252,0.03)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div className="absolute rounded-full"
          style={{ left: center - outerR, top: center - outerR, width: outerR * 2, height: outerR * 2, border: '1px solid rgba(248,250,252,0.02)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
        />

        {/* Connection lines */}
        <ConnectionLines
          innerPositions={innerPositions}
          outerPositions={outerPositions}
          hoveredSat={hoveredSat}
          centerX={center}
          centerY={center}
        />

        {/* Inner satellites */}
        {innerSats.map((sat, i) => (
          <Satellite key={sat.id} sat={sat}
            x={innerPositions[i].x} y={innerPositions[i].y}
            isHovered={hoveredSat === sat.id}
            onHover={handleHover} onSelect={handleSelect}
          />
        ))}

        {/* Outer satellites */}
        {outerSats.map((sat, i) => (
          <Satellite key={sat.id} sat={sat}
            x={outerPositions[i].x} y={outerPositions[i].y}
            isHovered={hoveredSat === sat.id}
            onHover={handleHover} onSelect={handleSelect}
          />
        ))}

        {/* Central Orb */}
        <div className="absolute" style={{ left: center - 65, top: center - 65 }}>
          <CentralOrb onClick={() => setMissionControlOpen(true)} pulseColor={pulseColor} />
        </div>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <p className="text-sm font-medium" style={{ color: hoveredData.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {hoveredData.label}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
              {hoveredData.desc}
            </p>
            {ZONE_AUDIO[hoveredData.id] && (
              <p className="text-[8px] mt-0.5 font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {ZONE_AUDIO[hoveredData.id].hz}Hz &middot; {ZONE_AUDIO[hoveredData.id].zone}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      <motion.p className="absolute bottom-8 text-[8px] tracking-[0.15em] uppercase"
        style={{ color: 'rgba(248,250,252,0.12)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        Click the orb for Mission Control &middot; Click a satellite to enter
      </motion.p>

      <MissionControl isOpen={missionControlOpen} onClose={() => setMissionControlOpen(false)} />
    </div>
  );
}
