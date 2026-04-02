import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMixer } from '../context/MixerContext';
import {
  Music, Map, Triangle, Heart, Waves, HeartHandshake,
  BookOpen, Gamepad2, Wind, Sun, GraduationCap,
  Eye, Star, Orbit, Telescope, Cloud, Thermometer, Droplets, Sparkles
} from 'lucide-react';
import MissionControl from '../components/MissionControl';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━ All Satellites ━━━
const ALL_SATELLITES = [
  { id: 'mood', label: 'Mood Engine', icon: Heart, path: '/mood', color: '#EC4899', desc: 'Track your emotional frequencies' },
  { id: 'mixer', label: 'Soundscape', icon: Music, path: '/cosmic-mixer', color: '#A78BFA', desc: 'Synthesize healing frequencies' },
  { id: 'map', label: 'Cosmic Map', icon: Map, path: '/cosmic-map', color: '#22C55E', desc: 'Explore the resonance grid' },
  { id: 'breathing', label: 'Breathwork', icon: Wind, path: '/breathing', color: '#60A5FA', desc: 'Guided breathing patterns' },
  { id: 'meditation', label: 'Meditation', icon: Sun, path: '/meditation', color: '#FBBF24', desc: 'Deep stillness practices' },
  { id: 'theory', label: 'Conservatory', icon: GraduationCap, path: '/theory', color: '#2DD4BF', desc: 'Music theory & phonics' },
  { id: 'workshop', label: 'Workshop', icon: Triangle, path: '/workshop', color: '#F59E0B', desc: 'Sacred architecture & physics' },
  { id: 'star-chart', label: 'Star Chart', icon: Star, path: '/star-chart', color: '#818CF8', desc: 'Celestial navigation' },
  { id: 'observatory', label: 'Observatory', icon: Telescope, path: '/observatory', color: '#6366F1', desc: 'Live sky & data sonification' },
  { id: 'trade', label: 'Trade Circle', icon: HeartHandshake, path: '/trade-circle', color: '#FB923C', desc: 'Exchange resonant assets' },
  { id: 'oracle', label: 'Oracle', icon: Eye, path: '/oracle', color: '#C084FC', desc: 'Divination & insight' },
  { id: 'games', label: 'Games', icon: Gamepad2, path: '/games', color: '#34D399', desc: 'Starseed adventures' },
  { id: 'journal', label: 'Journal', icon: BookOpen, path: '/journal', color: '#FDA4AF', desc: 'Wisdom journal' },
];

// ━━━ Zone Audio ━━━
const ZONE_AUDIO = {
  'star-chart': { hz: 852, type: 'sine', gain: 0.06 },
  'observatory': { hz: 963, type: 'sine', gain: 0.05 },
  'oracle': { hz: 741, type: 'sine', gain: 0.05 },
  'workshop': { hz: 256, type: 'triangle', gain: 0.06 },
  'trade': { hz: 324, type: 'triangle', gain: 0.05 },
  'games': { hz: 396, type: 'triangle', gain: 0.04 },
  'mood': { hz: 528, type: 'sine', gain: 0.05 },
  'breathing': { hz: 432, type: 'sine', gain: 0.06 },
  'meditation': { hz: 639, type: 'sine', gain: 0.05 },
  'mixer': { hz: 369, type: 'sine', gain: 0.05 },
  'theory': { hz: 417, type: 'sine', gain: 0.05 },
  'map': { hz: 285, type: 'triangle', gain: 0.04 },
  'journal': { hz: 396, type: 'sine', gain: 0.04 },
};

// ━━━ Atmospheric Audio Hook ━━━
function useAtmosphericAudio() {
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  const play = useCallback((satId) => {
    const zone = ZONE_AUDIO[satId];
    if (!zone) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (gainRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        const old = oscRef.current;
        setTimeout(() => { try { old?.stop(); } catch {} }, 300);
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = zone.type;
      osc.frequency.value = zone.hz;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(zone.gain, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      oscRef.current = osc;
      gainRef.current = gain;
    } catch {}
  }, []);

  const stop = useCallback(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3);
      const old = oscRef.current;
      setTimeout(() => { try { old?.stop(); } catch {} }, 400);
      oscRef.current = null;
      gainRef.current = null;
    }
  }, []);

  // Collapse sound
  const collapseSound = useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, []);

  return { play, stop, collapseSound };
}

// ━━━ Cosmic Dust ━━━
function CosmicDust() {
  const p = useRef(Array.from({ length: 35 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5, dur: Math.random() * 20 + 15,
    delay: Math.random() * 8, op: Math.random() * 0.2 + 0.05,
  }))).current;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {p.map(d => (
        <motion.div key={d.id} className="absolute rounded-full"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, background: `rgba(192,132,252,${d.op})` }}
          animate={{ x: [0, Math.sin(d.id) * 25, 0], y: [0, Math.cos(d.id) * 18, 0], opacity: [d.op, d.op * 2.5, d.op] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ━━━ Weather Ribbon ━━━
function WeatherRibbon({ weather }) {
  if (!weather || weather.fallback) return null;
  const condIcon = { clear: Sun, cloudy: Cloud, rain: Droplets, snow: Sparkles, thunderstorm: Sparkles, fog: Cloud, wind: Wind, default: Cloud };
  const Icon = condIcon[weather.category] || Cloud;
  return (
    <motion.div
      className="absolute top-4 left-1/2 z-20 flex items-center gap-4 px-5 py-2 rounded-full"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(10,10,18,0.35)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(248,250,252,0.06)',
      }}
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      data-testid="weather-ribbon"
    >
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: 'rgba(248,250,252,0.4)' }} />
        <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.5)' }}>{weather.description}</span>
      </div>
      {weather.temperature_f != null && (
        <div className="flex items-center gap-1">
          <Thermometer size={9} style={{ color: 'rgba(248,250,252,0.3)' }} />
          <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.45)' }}>{weather.temperature_f}°F</span>
        </div>
      )}
      {weather.humidity != null && (
        <div className="flex items-center gap-1">
          <Droplets size={9} style={{ color: 'rgba(248,250,252,0.3)' }} />
          <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.45)' }}>{weather.humidity}%</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Eye size={9} style={{ color: 'rgba(248,250,252,0.3)' }} />
        <span className="text-[8px]" style={{ color: weather.seeing_quality === 'excellent' ? 'rgba(45,212,191,0.6)' : weather.seeing_quality === 'good' ? 'rgba(251,191,36,0.5)' : 'rgba(248,250,252,0.35)' }}>
          {weather.seeing_quality}
        </span>
      </div>
    </motion.div>
  );
}

// ━━━ Dormant Dot (inside Abyss) ━━━
function DormantDot({ sat, index, total, onActivate }) {
  const angle = (index / total) * Math.PI * 2;
  const r = 22 + (index % 3) * 6;
  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: '50%', top: '50%', width: 10, height: 10, marginLeft: -5, marginTop: -5 }}
      animate={{ x, y, scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.7, 0.3] }}
      transition={{ scale: { duration: 3 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 3 + index * 0.4, repeat: Infinity, ease: 'easeInOut' } }}
      onClick={(e) => { e.stopPropagation(); onActivate(sat.id); }}
      title={`Activate ${sat.label}`}
      data-testid={`dormant-${sat.id}`}
    >
      <div className="w-full h-full rounded-full" style={{ background: sat.color, boxShadow: `0 0 6px ${sat.color}40` }} />
    </motion.div>
  );
}

// ━━━ Active Satellite ━━━
function ActiveSatellite({ sat, x, y, isHovered, onHover, onSelect, onDeactivate }) {
  const Icon = sat.icon;
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: '50%', top: '50%', width: 68, height: 68, marginLeft: -34, marginTop: -34 }}
      animate={{ x, y, scale: isHovered ? 1.2 : 1 }}
      transition={{ type: 'spring', stiffness: 60, damping: 20 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => onSelect(sat)}
      onHoverStart={() => onHover(sat.id)}
      onHoverEnd={() => onHover(null)}
      onContextMenu={(e) => { e.preventDefault(); onDeactivate(sat.id); }}
      data-testid={`satellite-${sat.id}`}
    >
      <div className="w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-500"
        style={{
          background: isHovered ? `${sat.color}14` : 'rgba(10,10,18,0.55)',
          border: `1px solid ${isHovered ? sat.color + '50' : sat.color + '12'}`,
          boxShadow: isHovered ? `0 0 28px ${sat.color}20, inset 0 0 12px ${sat.color}08` : 'none',
          backdropFilter: 'blur(10px)',
        }}>
        <Icon size={19} style={{ color: sat.color }} />
        <p className="text-[7px] mt-0.5 font-medium transition-colors duration-300"
          style={{ color: isHovered ? sat.color : 'rgba(248,250,252,0.35)' }}>{sat.label}</p>
      </div>
    </motion.div>
  );
}

// ━━━ SVG Lines ━━━
function ConnectionLines({ positions, hoveredSat, activeSats, cx, cy }) {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      {positions.map((pos, i) => {
        const sat = activeSats[i];
        if (!sat) return null;
        const isH = hoveredSat === sat.id;
        return (
          <line key={sat.id} x1={cx} y1={cy} x2={cx + pos.x} y2={cy + pos.y}
            stroke={isH ? sat.color : 'rgba(248,250,252,0.025)'}
            strokeWidth={isH ? 1.5 : 0.4}
            strokeDasharray={isH ? 'none' : '3,10'}
            style={{ transition: 'all 0.5s ease' }} />
        );
      })}
    </svg>
  );
}

// ━━━ Central Orb with Abyss ━━━
function CentralOrb({ onClick, pulseColor, abyssOpen, dormantSats, onActivate, dormantCount }) {
  return (
    <motion.div className="relative cursor-pointer" onClick={onClick}
      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
      data-testid="central-orb" style={{ width: 130, height: 130 }}>
      {/* Outer glow */}
      <motion.div className="absolute inset-0 rounded-full"
        animate={{ boxShadow: [`0 0 40px ${pulseColor}15`, `0 0 60px ${pulseColor}25`, `0 0 40px ${pulseColor}15`] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Rings */}
      <motion.div className="absolute rounded-full" style={{ inset: 6, border: `1px solid ${pulseColor}18` }}
        animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute rounded-full" style={{ inset: 14, border: `1px dashed ${pulseColor}10` }}
        animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />
      {/* Core */}
      <motion.div className="absolute rounded-full flex items-center justify-center overflow-hidden"
        style={{ inset: 22, background: `radial-gradient(circle at 38% 32%, ${pulseColor}35, ${pulseColor}10 55%, rgba(10,10,18,0.92) 85%)`, border: `1.5px solid ${pulseColor}25` }}
        animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        {/* Dormant dots inside */}
        <AnimatePresence>
          {abyssOpen && dormantSats.map((sat, i) => (
            <DormantDot key={sat.id} sat={sat} index={i} total={dormantSats.length} onActivate={onActivate} />
          ))}
        </AnimatePresence>
        {!abyssOpen && <Orbit size={30} style={{ color: pulseColor, opacity: 0.6 }} />}
      </motion.div>
      {/* Label + count */}
      <div className="absolute text-center w-full" style={{ bottom: -22 }}>
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase" style={{ color: `${pulseColor}60` }}>
          {abyssOpen ? 'Select to Activate' : 'Mission Control'}
        </p>
        {dormantCount > 0 && !abyssOpen && (
          <p className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
            {dormantCount} dormant
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ━━━ Main Orbital Hub ━━━
export default function OrbitalHub() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const { activeFrequencies } = useMixer();
  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [abyssOpen, setAbyssOpen] = useState(false);
  const [hoveredSat, setHoveredSat] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [activeSatIds, setActiveSatIds] = useState(['mood', 'mixer', 'map', 'breathing', 'meditation', 'theory']);
  const [weather, setWeather] = useState(null);
  const animRef = useRef(null);
  const longPressRef = useRef(null);
  const { play: playAtmo, stop: stopAtmo, collapseSound } = useAtmosphericAudio();

  const pulseColor = activeFrequencies?.length > 0 ? '#A78BFA' : '#2DD4BF';

  // Load preferences + weather
  useEffect(() => {
    if (!authHeaders) return;
    axios.get(`${API}/hub/preferences`, { headers: authHeaders })
      .then(r => setActiveSatIds(r.data.active_satellites))
      .catch(() => {});
    // Weather — use browser geolocation or default to Rapid City
    const fetchWeather = (lat = 44.08, lon = -103.23) => {
      axios.get(`${API}/weather/current?lat=${lat}&lon=${lon}`, { headers: authHeaders })
        .then(r => setWeather(r.data))
        .catch(() => {});
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude.toFixed(2), pos.coords.longitude.toFixed(2)),
        () => fetchWeather()
      );
    } else {
      fetchWeather();
    }
  }, [authHeaders]);

  // Orbital rotation
  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      setOrbitAngle(prev => prev + (now - last) / 1000 * 0.06);
      last = now;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // Persist active list
  const savePrefs = useCallback((ids) => {
    if (!authHeaders) return;
    axios.post(`${API}/hub/preferences`, { active_satellites: ids }, { headers: authHeaders }).catch(() => {});
  }, [authHeaders]);

  const activateSat = useCallback((id) => {
    setActiveSatIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      savePrefs(next);
      return next;
    });
    setAbyssOpen(false);
  }, [savePrefs]);

  const deactivateSat = useCallback((id) => {
    setActiveSatIds(prev => {
      const next = prev.filter(s => s !== id);
      savePrefs(next);
      return next;
    });
    collapseSound();
  }, [savePrefs, collapseSound]);

  const handleSelect = useCallback((sat) => { stopAtmo(); navigate(sat.path); }, [navigate, stopAtmo]);
  const handleHover = useCallback((id) => { setHoveredSat(id); if (id) playAtmo(id); else stopAtmo(); }, [playAtmo, stopAtmo]);

  // Central orb: short press = Mission Control, long press = Abyss toggle
  const handleOrbDown = useCallback(() => {
    longPressRef.current = setTimeout(() => {
      setAbyssOpen(prev => !prev);
      longPressRef.current = null;
    }, 500);
  }, []);

  const handleOrbUp = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
      if (!abyssOpen) setMissionControlOpen(true);
      else { setAbyssOpen(false); collapseSound(); }
    }
  }, [abyssOpen, collapseSound]);

  // Derived data
  const activeSats = ALL_SATELLITES.filter(s => activeSatIds.includes(s.id));
  const dormantSats = ALL_SATELLITES.filter(s => !activeSatIds.includes(s.id));
  const containerSize = 620;
  const center = containerSize / 2;
  const orbitRadius = Math.min(200, 120 + activeSats.length * 12);

  const positions = activeSats.map((_, i) => {
    const a = (i / activeSats.length) * Math.PI * 2 + orbitAngle;
    return { x: Math.cos(a) * orbitRadius, y: Math.sin(a) * orbitRadius };
  });

  const hoveredData = ALL_SATELLITES.find(s => s.id === hoveredSat);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      data-testid="orbital-hub-page">
      <CosmicDust />
      <WeatherRibbon weather={weather} />

      {/* Title */}
      <motion.div className="absolute top-14 left-0 right-0 text-center z-10"
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
        {/* Orbit ring */}
        <motion.div className="absolute rounded-full"
          style={{ left: center - orbitRadius, top: center - orbitRadius, width: orbitRadius * 2, height: orbitRadius * 2, border: '1px solid rgba(248,250,252,0.025)' }}
          animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }} />

        <ConnectionLines positions={positions} hoveredSat={hoveredSat} activeSats={activeSats} cx={center} cy={center} />

        {/* Active satellites */}
        {activeSats.map((sat, i) => (
          <ActiveSatellite key={sat.id} sat={sat}
            x={positions[i].x} y={positions[i].y}
            isHovered={hoveredSat === sat.id}
            onHover={handleHover} onSelect={handleSelect} onDeactivate={deactivateSat}
          />
        ))}

        {/* Central Orb */}
        <div className="absolute" style={{ left: center - 65, top: center - 65 }}
          onMouseDown={handleOrbDown} onMouseUp={handleOrbUp}
          onTouchStart={handleOrbDown} onTouchEnd={handleOrbUp}>
          <CentralOrb
            onClick={() => {}}
            pulseColor={pulseColor}
            abyssOpen={abyssOpen}
            dormantSats={dormantSats}
            onActivate={activateSat}
            dormantCount={dormantSats.length}
          />
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
            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>{hoveredData.desc}</p>
            {ZONE_AUDIO[hoveredData.id] && (
              <p className="text-[8px] mt-0.5 font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {ZONE_AUDIO[hoveredData.id].hz}Hz &middot; Right-click to return to Abyss
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      <motion.p className="absolute bottom-8 text-[8px] tracking-[0.15em] uppercase"
        style={{ color: 'rgba(248,250,252,0.12)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        Tap orb for Mission Control &middot; Long-press to reveal the Abyss &middot; Right-click satellite to return it
      </motion.p>

      <MissionControl isOpen={missionControlOpen} onClose={() => setMissionControlOpen(false)} />
    </div>
  );
}
