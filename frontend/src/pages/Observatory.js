import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Star, Sparkles, Volume2, VolumeX, Radio, Clock, Zap, ChevronRight, Telescope, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useChaosOscillator, chaosGlow } from '../lib/ChaosEngine';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ── Planet Visual Profiles ──────────────────────────────── */
const PLANET_VISUALS = {
  Mercury: { bg: '#4A4A4A', accent: '#B8B8B8', glow: 'rgba(184,184,184,0.15)', desc: 'Scorched cratered world closest to the Sun', chaos: 1.8,
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/1024px-Mercury_in_true_color.jpg' },
  Venus:   { bg: '#C4A35A', accent: '#F5D78E', glow: 'rgba(245,215,142,0.2)', desc: 'Shrouded in sulfuric clouds, 900°F surface', chaos: 1.3,
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/PIA23791-Venus-NewlyProcessedView-20200608.png/1024px-PIA23791-Venus-NewlyProcessedView-20200608.png' },
  Earth:   { bg: '#1E6B4E', accent: '#4FC3F7', glow: 'rgba(79,195,247,0.2)', desc: 'Our home, the pale blue dot', chaos: 1.0,
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1024px-The_Blue_Marble_%28remastered%29.jpg' },
  Mars:    { bg: '#8B3A2A', accent: '#E57C5B', glow: 'rgba(229,124,91,0.2)', desc: 'The red planet, iron-oxide dust storms', chaos: 1.2,
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png/1024px-Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png' },
  Jupiter: { bg: '#8B6914', accent: '#D4A843', glow: 'rgba(212,168,67,0.2)', desc: 'Great Red Spot, king of the gas giants', chaos: 0.8,
    img: 'https://images.unsplash.com/photo-1768032504914-dc0f699db615?w=1200&q=80' },
  Saturn:  { bg: '#C4A35A', accent: '#E8D48B', glow: 'rgba(232,212,139,0.18)', desc: 'Golden rings of ice and rock', chaos: 0.6,
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1024px-Saturn_during_Equinox.jpg' },
  Uranus:  { bg: '#2F6B6B', accent: '#69D2D2', glow: 'rgba(105,210,210,0.15)', desc: 'Ice giant tilted on its side', chaos: 1.5,
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Uranus_Voyager2_color_calibrated.png/1024px-Uranus_Voyager2_color_calibrated.png' },
  Neptune: { bg: '#1B3A6B', accent: '#5B7FE5', glow: 'rgba(91,127,229,0.2)', desc: 'Supersonic winds, deep blue methane', chaos: 1.618,
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Neptune_Voyager2_color_calibrated.png/1024px-Neptune_Voyager2_color_calibrated.png' },
};

const DEEP_SKY_BG = 'https://images.unsplash.com/photo-1735213005665-f5b93d0795fe?w=1200&q=80';

/* ── Atmospheric Particles (chaos-synced) ────────────────── */
function AtmosphericParticles({ color, count = 30 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      dur: 6 + Math.random() * 10,
      delay: Math.random() * 5,
      drift: -15 + Math.random() * 30,
    })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {particles.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: color, opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0], y: [0, p.drift], x: [0, p.drift * 0.3] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ── Orrery — Animated Solar System SVG ──────────────────── */
function Orrery({ planets, selectedPlanet, onSelect }) {
  const cw = 380, ch = 320, cx = cw / 2, cy = ch / 2;
  const orbits = [28, 42, 58, 76, 105, 135, 160, 185];
  const angleRef = useRef(0);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let raf;
    const tick = () => { angleRef.current += 0.003; forceUpdate(v => v + 1); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg viewBox={`0 0 ${cw} ${ch}`} className="w-full" style={{ maxHeight: 320 }}>
      <defs>
        {planets.map((p, i) => (
          <radialGradient key={`g${p.name}`} id={`planet-glow-${i}`}>
            <stop offset="0%" stopColor={p.color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {/* Orbit tracks with subtle glow */}
      {orbits.map((r, i) => (
        <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill="none"
          stroke={selectedPlanet && planets[i]?.name === selectedPlanet.name ? `${planets[i]?.color || '#fff'}40` : 'rgba(248,250,252,0.04)'}
          strokeWidth={selectedPlanet && planets[i]?.name === selectedPlanet.name ? 1.5 : 0.5}
          strokeDasharray={selectedPlanet && planets[i]?.name === selectedPlanet.name ? '' : '2 4'} />
      ))}
      {/* Sun with corona */}
      <circle cx={cx} cy={cy} r={16} fill="url(#sun-corona)" opacity="0.3" />
      <circle cx={cx} cy={cy} r={8} fill="#FBBF24" opacity="0.85" />
      <circle cx={cx} cy={cy} r={6} fill="#FDE68A" opacity="0.4" />
      <radialGradient id="sun-corona"><stop offset="0%" stopColor="#FBBF24" stopOpacity="0.5" /><stop offset="100%" stopColor="#FBBF24" stopOpacity="0" /></radialGradient>
      {/* Planets */}
      {planets.map((p, i) => {
        const r = orbits[i] || 185;
        const speed = 1 / (p.distance_au || 1);
        const angle = angleRef.current * speed * 3;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r * 0.7;
        const isSel = selectedPlanet?.name === p.name;
        const sz = isSel ? 8 : 4 + Math.min(4, (p.radius_earth || 1) * 0.8);
        return (
          <g key={p.name} onClick={() => onSelect(p)} className="cursor-pointer">
            {isSel && <circle cx={px} cy={py} r={sz + 12} fill={`url(#planet-glow-${i})`} />}
            <circle cx={px} cy={py} r={sz} fill={p.color} opacity={isSel ? 1 : 0.7}
              stroke={isSel ? '#fff' : 'none'} strokeWidth={isSel ? 1 : 0} />
            <text x={px} y={py - sz - 4} fill={isSel ? '#fff' : `${p.color}AA`}
              fontSize={isSel ? '8' : '6'} textAnchor="middle" fontWeight={isSel ? 'bold' : 'normal'}>
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Moon Phase SVG ──────────────────────────────────────── */
function MoonPhaseSVG({ illumination, phase }) {
  const r = 32;
  const shadow = illumination / 100;
  const isWaxing = phase.includes('Waxing') || phase === 'Full Moon';
  return (
    <svg viewBox={`0 0 ${r * 2 + 4} ${r * 2 + 4}`} width={70} height={70}>
      <circle cx={r + 2} cy={r + 2} r={r} fill="#1a1a2e" />
      <circle cx={r + 2} cy={r + 2} r={r} fill="#F5F5DC" opacity={shadow * 0.85} />
      {illumination < 95 && (
        <ellipse cx={r + 2 + (isWaxing ? -1 : 1) * (1 - shadow) * r * 0.8} cy={r + 2}
          rx={r * (1 - shadow)} ry={r} fill="#1a1a2e" opacity={0.9} />
      )}
      <circle cx={r - 4} cy={r - 2} r={3} fill="rgba(0,0,0,0.12)" />
      <circle cx={r + 8} cy={r + 6} r={4} fill="rgba(0,0,0,0.1)" />
    </svg>
  );
}

/* ── Star Card (Expandable) ──────────────────────────────── */
function StarCard({ star, isSelected, onSelect, isPlaying, onToggleSound }) {
  return (
    <motion.div layout
      onClick={() => onSelect(star)}
      className="w-full text-left p-3 rounded-xl transition-all cursor-pointer"
      style={{
        background: isSelected ? `${star.color}0A` : 'rgba(248,250,252,0.02)',
        border: isSelected ? `1px solid ${star.color}30` : '1px solid rgba(248,250,252,0.06)',
      }}
      data-testid={`star-${star.name.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between">        <div className="flex items-center gap-2.5">
          <motion.div className="w-3 h-3 rounded-full"
            animate={isPlaying ? { boxShadow: [`0 0 6px ${star.color}`, `0 0 20px ${star.color}`, `0 0 6px ${star.color}`] } : {}}
            transition={isPlaying ? { duration: 2, repeat: Infinity } : {}}
            style={{ background: star.color, boxShadow: `0 0 8px ${star.color}40` }} />
          <div>
            <p className="text-[11px] font-medium" style={{ color: isSelected ? star.color : 'rgba(255,255,255,0.9)' }}>{star.name}</p>
            <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{star.constellation} · {star.distance_ly} ly</p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleSound(star); }}
          className="p-1.5 rounded-lg transition-all"
          style={{ background: isPlaying ? `${star.color}15` : 'transparent' }}
          data-testid={`sonify-${star.name.toLowerCase().replace(/\s/g, '-')}`}>
          {isPlaying ? <Volume2 size={12} style={{ color: star.color }} /> : <VolumeX size={12} style={{ color: 'rgba(255,255,255,0.6)' }} />}
        </button>
      </div>
      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 pt-2.5 space-y-1.5" style={{ borderTop: `1px solid ${star.color}15` }}>
            <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              The light you see from <strong style={{ color: star.color }}>{star.name}</strong> left
              in <strong style={{ color: '#FBBF24' }}>year {star.light_departed_year}</strong>.
              Surface: <strong>{star.temp_k?.toLocaleString()}K</strong>. Sonified: <strong style={{ color: '#2DD4BF' }}>{star.sonified_hz}Hz</strong>.
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {[{ l: 'Distance', v: `${star.distance_ly} ly`, c: '#FBBF24' },
                { l: 'Temperature', v: `${star.temp_k?.toLocaleString()}K`, c: star.color },
                { l: 'Magnitude', v: `${star.magnitude}`, c: '#A78BFA' }].map(m => (
                <div key={m.l} className="px-2 py-1 rounded-lg text-center" style={{ background: 'rgba(248,250,252,0.03)' }}>
                  <p className="text-[6px] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>{m.l}</p>
                  <p className="text-[9px] font-mono" style={{ color: m.c }}>{m.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main Observatory ────────────────────────────────────── */
export default function Observatory() {
  const { authHeaders, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orrery');
  const [planets, setPlanets] = useState([]);
  const [stars, setStars] = useState([]);
  const [events, setEvents] = useState([]);
  const [moon, setMoon] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedStar, setSelectedStar] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [constellations, setConstellations] = useState([]);
  const [selectedConstellation, setSelectedConstellation] = useState(null);
  const audio = useChaosOscillator({ chaosCoeff: 1.0, driftRange: 5, chaosEnabled: true });

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 10); }, []);

  // Immersion timer — earn 1 Spark per minute of active Observatory use
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      axios.post(`${API}/sparks/immersion`, { seconds: 60, zone: 'observatory' }, { headers: authHeaders }).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [token, authHeaders]);

  useEffect(() => {
    const headers = authHeaders?.Authorization ? authHeaders : {};
    axios.get(`${API}/observatory/planets`, { headers }).then(r => {
      setPlanets(r.data.planets);
      if (r.data.planets?.length > 2) setSelectedPlanet(r.data.planets[2]);
    }).catch(() => {});
    axios.get(`${API}/observatory/stars`, { headers }).then(r => setStars(r.data.stars)).catch(() => {});
    axios.get(`${API}/observatory/events`, { headers }).then(r => { setEvents(r.data.events); setMoon(r.data.moon); }).catch(() => {});
    axios.get(`${API}/observatory/constellations`, { headers }).then(r => setConstellations(r.data?.constellations || [])).catch(() => {});
  }, [authHeaders]);

  const planetVisual = selectedPlanet ? (PLANET_VISUALS[selectedPlanet.name] || { bg: '#333', accent: selectedPlanet.color, glow: `${selectedPlanet.color}20` }) : null;
  const isPlanetPlaying = audio.activeName === selectedPlanet?.name;

  // Determine immersive background
  const immBg = useMemo(() => {
    if (tab === 'orrery' && selectedPlanet && planetVisual) {
      return { color: planetVisual.accent, bg: planetVisual.bg, glow: planetVisual.glow };
    }
    if (tab === 'stars' && selectedStar) {
      return { color: selectedStar.color, bg: `${selectedStar.color}10`, glow: `${selectedStar.color}20` };
    }
    return { color: '#818CF8', bg: '#0a0a12', glow: 'rgba(129,140,248,0.05)' };
  }, [tab, selectedPlanet, planetVisual, selectedStar]);

  const TABS = [
    { id: 'orrery', label: 'Orrery', icon: Radio },
    { id: 'stars', label: 'Deep Sky', icon: Star },
    { id: 'constellations', label: 'Constellations', icon: Map },
    { id: 'events', label: 'Live Events', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#06060C' }}
      data-testid="observatory-page">

      {/* ── Immersive Background: Full-bleed planetary imagery ── */}
      {/* Planet image layer */}
      <AnimatePresence mode="wait">
        {tab === 'orrery' && planetVisual?.img && (
          <motion.div key={`planet-bg-${selectedPlanet?.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            style={{ zIndex: 0, backgroundImage: `url(${planetVisual.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        {tab === 'stars' && (
          <motion.div key="deep-sky-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            style={{ zIndex: 0, backgroundImage: `url(${DEEP_SKY_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
      </AnimatePresence>
      {/* Dark vignette overlay to keep text readable */}
      <div className="absolute inset-0" style={{ zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)' }} />
      {/* Color glow layer (chaos-synced) */}
      <motion.div className="absolute inset-0"
        animate={{ background: `radial-gradient(ellipse at 50% 30%, ${immBg.glow} 0%, transparent 70%)` }}
        transition={{ duration: 1.5 }} style={{ zIndex: 0 }} />
      <motion.div className="absolute inset-0"
        animate={{ background: `radial-gradient(ellipse at 30% 70%, ${immBg.color}08 0%, transparent 60%)` }}
        transition={{ duration: 2 }} style={{ zIndex: 0 }} />
      {(audio.activeName) && (
        <motion.div className="absolute inset-0"
          style={{ zIndex: 0, opacity: chaosGlow(audio.chaosState), background: `radial-gradient(ellipse at 50% 50%, ${immBg.color}18 0%, transparent 50%)`, transition: 'opacity 0.15s ease-out' }} />
      )}
      <AtmosphericParticles color={immBg.color} count={audio.activeName ? 50 : 20} />

      {/* ── Content ── */}
      <div className="relative z-10 px-4 py-6 sm:px-8 max-w-3xl mx-auto">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: immBg.color }}>
            <Star size={10} className="inline mr-1" /> The Observatory
          </p>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight"
            style={{ color: 'rgba(248,250,252,0.9)', fontFamily: 'Cormorant Garamond, serif' }}>
            {tab === 'orrery' && selectedPlanet ? selectedPlanet.name : tab === 'stars' && selectedStar ? selectedStar.name : 'Celestial Portal'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {tab === 'orrery' && selectedPlanet ? planetVisual?.desc || selectedPlanet.desc : 'Celestial Mechanics, Data Sonification & Live Sky Events'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: tab === t.id ? `${immBg.color}12` : 'rgba(248,250,252,0.03)',
                color: tab === t.id ? immBg.color : 'rgba(255,255,255,0.65)',
                border: `1px solid ${tab === t.id ? `${immBg.color}25` : 'rgba(248,250,252,0.06)'}`,
              }}
              data-testid={`observatory-tab-${t.id}`}>
              <t.icon size={11} /> {t.label}
            </button>
          ))}
        </div>

        {/* ═══ ORRERY TAB ═══ */}
        {tab === 'orrery' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'transparent', border: `1px solid ${immBg.color}15`, backdropFilter: 'none'}}>
              <div className="px-3 pt-2">
                <p className="text-[7px] uppercase tracking-widest" style={{ color: `${immBg.color}66` }}>
                  Interactive Orrery — Tap a planet to immerse
                </p>
              </div>
              <Orrery planets={planets} selectedPlanet={selectedPlanet}
                onSelect={(p) => setSelectedPlanet(p)} />
            </div>

            {/* Planet Detail Panel */}
            <AnimatePresence mode="wait">
              {selectedPlanet && (
                <motion.div key={selectedPlanet.name}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl p-5 space-y-4"
                  style={{ background: `rgba(0,0,0,0.15)`, border: `1px solid ${selectedPlanet.color}20`, backdropFilter: 'none'}}>
                  <div className="flex items-center gap-4">
                    <motion.div className="w-14 h-14 rounded-full flex-shrink-0"
                      animate={isPlanetPlaying ? { boxShadow: [`0 0 15px ${selectedPlanet.color}30`, `0 0 40px ${selectedPlanet.color}50`, `0 0 15px ${selectedPlanet.color}30`] } : {}}
                      transition={isPlanetPlaying ? { duration: 3, repeat: Infinity } : {}}
                      style={{ background: `radial-gradient(circle at 35% 35%, ${selectedPlanet.color}90, ${selectedPlanet.color}30)`, boxShadow: `0 0 20px ${selectedPlanet.color}25` }} />
                    <div className="flex-1">
                      <h3 className="text-lg font-light" style={{ color: selectedPlanet.color, fontFamily: 'Cormorant Garamond, serif' }}>
                        {selectedPlanet.name}
                      </h3>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {planetVisual?.desc || selectedPlanet.desc}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'EM Frequency', value: `${selectedPlanet.hz}Hz`, color: '#2DD4BF', icon: Radio },
                      { label: 'Orbital Speed', value: `${selectedPlanet.orbital_speed_km_s} km/s`, color: '#A78BFA', icon: Zap },
                      { label: 'Distance', value: `${selectedPlanet.distance_au} AU`, color: '#FBBF24', icon: Star },
                      { label: 'Light Time', value: `${selectedPlanet.light_time_minutes} min`, color: '#60A5FA', icon: Clock },
                    ].map(m => (
                      <div key={m.label} className="px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)' }}>
                        <div className="flex items-center gap-1 mb-0.5">
                          <m.icon size={8} style={{ color: m.color }} />
                          <p className="text-[7px] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>{m.label}</p>
                        </div>
                        <p className="text-xs font-mono" style={{ color: m.color }}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Toggle Sonification Button */}
                  <button onClick={() => audio.toggle(selectedPlanet.hz, selectedPlanet.name, planetVisual?.chaos || 1.0)}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-medium transition-all active:scale-[0.97]"
                    style={{
                      background: isPlanetPlaying ? `${selectedPlanet.color}20` : `${selectedPlanet.color}08`,
                      color: selectedPlanet.color,
                      border: `1px solid ${isPlanetPlaying ? `${selectedPlanet.color}50` : `${selectedPlanet.color}20`}`,
                      boxShadow: isPlanetPlaying ? `0 0 30px ${selectedPlanet.color}15` : 'none',
                    }}
                    data-testid="sonify-planet-btn">
                    {isPlanetPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    {isPlanetPlaying ? `${selectedPlanet.name}'s Frequency Active — ${selectedPlanet.hz}Hz` : `Activate ${selectedPlanet.name}'s Frequency (${selectedPlanet.hz}Hz)`}
                  </button>

                  {isPlanetPlaying && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-3">
                      {[1, 0.5, 1.5].map((h, i) => (
                        <motion.div key={i} className="w-1 rounded-full"
                          animate={{ height: [8, 20 + i * 6, 8] }}
                          transition={{ duration: 1.2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ background: selectedPlanet.color }} />
                      ))}
                      <span className="text-[9px] ml-2 font-mono" style={{ color: `${selectedPlanet.color}88` }}>
                        {selectedPlanet.hz}Hz + {(selectedPlanet.hz / 2).toFixed(1)}Hz + {(selectedPlanet.hz * 1.5).toFixed(1)}Hz
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ DEEP SKY TAB ═══ */}
        {tab === 'stars' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Tap to explore — Toggle speaker to immerse in frequency
                </p>
                {stars.map(s => (
                  <StarCard key={s.name} star={s}
                    isSelected={selectedStar?.name === s.name}
                    onSelect={setSelectedStar}
                    isPlaying={audio.activeName === s.name}
                    onToggleSound={(st) => audio.toggle(st.sonified_hz, st.name, 1.618)}
                  />
                ))}
              </div>

              {/* Light-Time Explorer */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${selectedStar ? `${selectedStar.color}15` : 'rgba(248,250,252,0.06)'}` }}>
                <h3 className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Light-Time Explorer
                </h3>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Every photon you see from a star is ancient light:
                </p>
                <div className="space-y-2">
                  {stars.slice(0, 8).map(s => (
                    <div key={s.name} className="flex items-center gap-2">
                      <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
                        animate={audio.activeName === s.name ? { scale: [1, 1.4, 1] } : {}}
                        transition={audio.activeName === s.name ? { duration: 1.5, repeat: Infinity } : {}}
                        style={{ background: s.color }} />
                      <span className="text-[9px] w-20 truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.name}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (Math.log10(s.distance_ly + 1) / Math.log10(1000)) * 100)}%` }}
                          transition={{ duration: 1, delay: 0.1 }}
                          style={{ background: `linear-gradient(90deg, ${s.color}CC, ${s.color}44)` }} />
                      </div>
                      <span className="text-[8px] font-mono w-14 text-right" style={{ color: '#FBBF24' }}>{s.distance_ly} ly</span>
                    </div>
                  ))}
                </div>

                {selectedStar && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="pt-3" style={{ borderTop: `1px solid ${selectedStar.color}15` }}>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      Light from <strong style={{ color: selectedStar.color }}>{selectedStar.name}</strong> departed
                      in <strong style={{ color: '#FBBF24' }}>year {selectedStar.light_departed_year}</strong>.
                      Surface temperature: <strong>{selectedStar.temp_k?.toLocaleString()}K</strong>.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ CONSTELLATIONS TAB ═══ */}
        {tab === 'constellations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-[8px] uppercase tracking-widest text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
              20 Major Western Constellations — Tap to explore mythology & deep-sky objects
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {constellations.map(c => {
                const isOpen = selectedConstellation?.id === c.id;
                return (
                  <motion.button key={c.id} layout
                    onClick={() => {
                      setSelectedConstellation(isOpen ? null : c);
                      if (!isOpen && token) {
                        axios.post(`${API}/sparks/earn`, { action: 'constellation_identify', context: c.id }, { headers: authHeaders }).catch(() => {});
                      }
                    }}
                    className="w-full text-left rounded-2xl overflow-hidden transition-all"
                    style={{
                      background: isOpen ? `${c.color}08` : 'rgba(0,0,0,0.25)',
                      border: `1px solid ${isOpen ? `${c.color}30` : 'rgba(248,250,252,0.06)'}`,
                    }}
                    data-testid={`constellation-${c.id}`}>
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${c.color}15`, border: `1px solid ${c.color}25` }}>
                        <Star size={14} style={{ color: c.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium" style={{ color: 'rgba(248,250,252,0.9)' }}>{c.name}</span>
                          <span className="text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{ background: `${c.color}12`, color: `${c.color}99` }}>{c.season}</span>
                        </div>
                        <p className="text-[8px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {c.bright_stars?.slice(0, 3).join(', ')}
                        </p>
                      </div>
                      <ChevronRight size={12} style={{
                        color: 'rgba(248,250,252,0.15)',
                        transform: isOpen ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s'
                      }} />
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${c.color}15` }}>
                          {/* Mythology */}
                          <div className="pt-3">
                            <h4 className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: c.color }}>Mythology</h4>
                            <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                              {c.mythology}
                            </p>
                          </div>

                          {/* Bright Stars */}
                          <div>
                            <h4 className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: c.color }}>Bright Stars</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {c.bright_stars?.map(s => (
                                <span key={s} className="px-2 py-1 rounded-lg text-[8px]"
                                  style={{ background: `${c.color}08`, border: `1px solid ${c.color}15`, color: 'rgba(255,255,255,0.7)' }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Deep Sky Objects */}
                          {c.deep_sky?.length > 0 && (
                            <div>
                              <h4 className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: '#FBBF24' }}>
                                <Telescope size={10} className="inline mr-1" />Deep Sky Objects
                              </h4>
                              <div className="space-y-1">
                                {c.deep_sky.map(obj => (
                                  <div key={obj} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                                    style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)' }}>
                                    <Sparkles size={8} style={{ color: '#FBBF24', flexShrink: 0 }} />
                                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{obj}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex gap-3 pt-1">
                            <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              Area: <span style={{ color: c.color }}>{c.area_sq_deg}°²</span>
                            </div>
                            <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              Latin: <span style={{ color: 'rgba(255,255,255,0.55)' }}>{c.latin}</span>
                            </div>
                            <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              Best: <span style={{ color: 'rgba(255,255,255,0.55)' }}>{c.best_viewing}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* Link to Star Chart */}
            <div className="pt-4 text-center">
              <button onClick={() => navigate('/star-chart')}
                className="px-5 py-2.5 rounded-xl text-xs active:scale-95 transition-all"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA' }}
                data-testid="link-star-chart">
                <Map size={12} className="inline mr-2" />
                Open Star Chart — Sky View
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══ LIVE EVENTS TAB ═══ */}
        {tab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {moon && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(248,250,252,0.06)' }}
                  data-testid="moon-phase-card">
                  <div className="flex items-center gap-4">
                    <MoonPhaseSVG illumination={moon.illumination} phase={moon.phase} />
                    <div>
                      <h3 className="text-sm font-light" style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif' }}>
                        {moon.phase}
                      </h3>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {moon.illumination}% illuminated · Day {moon.age_days} of cycle
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(248,250,252,0.06)' }}
                data-testid="celestial-events-card">
                <h3 className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Upcoming Celestial Events
                </h3>
                <div className="space-y-2">
                  {events.map((evt, i) => (
                    <motion.button key={i} layout
                      onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
                      style={{
                        background: expandedEvent === i ? `${evt.color}10` : evt.active ? `${evt.color}06` : 'rgba(248,250,252,0.02)',
                        border: `1px solid ${expandedEvent === i ? `${evt.color}30` : evt.active ? `${evt.color}15` : 'transparent'}`,
                      }}
                      data-testid={`event-${i}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: evt.color, boxShadow: evt.active ? `0 0 8px ${evt.color}40` : 'none' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium" style={{ color: evt.active ? evt.color : 'rgba(255,255,255,0.85)' }}>
                            {evt.name}
                            {evt.active && <span className="text-[7px] px-1.5 py-0.5 rounded-full ml-1" style={{ background: `${evt.color}15`, color: evt.color }}>ACTIVE</span>}
                          </p>
                          <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {evt.type === 'meteor_shower' ? `Peak: ~${evt.peak_rate}/hr` : evt.type.replace('_', ' ')} · {evt.days_until === 0 ? 'Tonight' : `in ${evt.days_until} days`}
                          </p>
                        </div>
                        <ChevronRight size={10} style={{ color: 'rgba(248,250,252,0.15)', transform: expandedEvent === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                      <AnimatePresence>
                        {expandedEvent === i && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pt-2 space-y-1.5" style={{ borderTop: `1px solid ${evt.color}15` }}>
                            <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                              {evt.type === 'meteor_shower' ? `The ${evt.name} peaks at ~${evt.peak_rate} meteors/hr. Best after midnight, dark skies.`
                                : evt.type === 'solstice' ? `${evt.name} — longest/shortest day. Powerful for meditation and intention.`
                                : evt.type === 'equinox' ? `${evt.name} — equal day and night. Perfect celestial balance.`
                                : `${evt.name} — a celestial alignment for inner reflection.`}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px]" style={{ background: `${evt.color}08`, color: evt.color }}>
                                <Clock size={8} /> {evt.days_until === 0 ? 'Tonight' : `${evt.days_until}d`}
                              </div>
                              {evt.peak_rate && <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px]" style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24' }}>
                                <Zap size={8} /> {evt.peak_rate}/hr
                              </div>}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
