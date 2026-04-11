import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMixer } from '../context/MixerContext';
import { Telescope, Moon, Orbit as OrbitIcon, Star, Sparkles, Volume2, Radio, ChevronRight, Clock, Zap } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Orrery — mini solar system SVG
function Orrery({ planets, selectedPlanet, onSelect }) {
  const cw = 340, ch = 340, cx = cw / 2, cy = ch / 2;
  const orbits = [32, 48, 64, 82, 110, 140, 168, 195];
  const angleRef = useRef(0);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let raf;
    const tick = () => {
      angleRef.current += 0.003;
      forceUpdate(v => v + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg viewBox={`0 0 ${cw} ${ch}`} className="w-full" style={{ maxHeight: 340 }}>
      {/* Orbit tracks */}
      {orbits.map((r, i) => (
        <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(248,250,252,0.03)" strokeWidth="0.5" />
      ))}
      {/* Sun */}
      <circle cx={cx} cy={cy} r={8} fill="#FBBF24" opacity="0.7" />
      <circle cx={cx} cy={cy} r={12} fill="none" stroke="#FBBF2420" strokeWidth="1" />
      {/* Planets */}
      {planets.map((p, i) => {
        const r = orbits[i] || 195;
        const speed = 1 / (p.distance_au || 1);
        const angle = angleRef.current * speed * 3;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        const isSel = selectedPlanet?.name === p.name;
        return (
          <g key={p.name} onClick={() => onSelect(p)} className="cursor-pointer">
            <circle cx={px} cy={py} r={isSel ? 7 : 5} fill={p.color} opacity={isSel ? 0.9 : 0.6} />
            {isSel && <circle cx={px} cy={py} r={10} fill="none" stroke={p.color} strokeWidth="1" opacity="0.4" />}
            <text x={px} y={py - 9} fill={p.color} fontSize="6" textAnchor="middle" opacity="0.7">
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Moon phase SVG
function MoonPhaseSVG({ illumination, phase }) {
  const r = 28;
  const d = r * 2;
  // Simplified crescent rendering
  const shadow = illumination / 100;
  const isWaxing = phase.includes('Waxing') || phase === 'Full Moon';

  return (
    <svg viewBox={`0 0 ${d + 4} ${d + 4}`} width={60} height={60}>
      {/* Dark side */}
      <circle cx={r + 2} cy={r + 2} r={r} fill="#1a1a2e" />
      {/* Lit side */}
      <circle cx={r + 2} cy={r + 2} r={r} fill="#F5F5DC"
        opacity={shadow * 0.8}
        clipPath={isWaxing ? undefined : undefined}
      />
      {/* Overlay for crescent */}
      {illumination < 95 && (
        <ellipse cx={r + 2 + (isWaxing ? -1 : 1) * (1 - shadow) * r * 0.8} cy={r + 2}
          rx={r * (1 - shadow)} ry={r}
          fill="#1a1a2e" opacity={0.85} />
      )}
      {/* Crater hints */}
      <circle cx={r - 4} cy={r - 2} r={3} fill="rgba(0,0,0,0.1)" />
      <circle cx={r + 8} cy={r + 6} r={4} fill="rgba(0,0,0,0.08)" />
    </svg>
  );
}

// Star card with light-time info
function StarCard({ star, isSelected, onSelect, onSonify }) {
  return (
    <motion.div
      className="glass-card p-3 rounded-xl cursor-pointer transition-all"
      style={{
        border: isSelected ? `2px solid ${star.color}` : '1px solid rgba(248,250,252,0.06)',
        background: isSelected ? `${star.color}06` : undefined,
      }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(star)}
      data-testid={`star-${star.name.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: star.color, boxShadow: `0 0 8px ${star.color}40` }} />
          <div>
            <p className="text-[10px] font-medium" style={{ color: star.color }}>{star.name}</p>
            <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{star.constellation}</p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onSonify(star); }}
          className="p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
          data-testid={`sonify-${star.name.toLowerCase().replace(/\s/g, '-')}`}
          title="Sonify this star">
          <Volume2 size={10} style={{ color: star.color }} />
        </button>
      </div>
      {isSelected && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-1">
          <div className="flex justify-between text-[8px]">
            <span style={{ color: 'var(--text-muted)' }}>Distance</span>
            <span style={{ color: 'var(--text-primary)' }}>{star.distance_ly} light-years</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span style={{ color: 'var(--text-muted)' }}>Light departed</span>
            <span style={{ color: '#FBBF24' }}>Year {star.light_departed_year}</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span style={{ color: 'var(--text-muted)' }}>Temperature</span>
            <span style={{ color: star.color }}>{star.temp_k?.toLocaleString()}K</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span style={{ color: 'var(--text-muted)' }}>Sonified frequency</span>
            <span className="font-mono" style={{ color: '#2DD4BF' }}>{star.sonified_hz}Hz</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span style={{ color: 'var(--text-muted)' }}>Magnitude</span>
            <span style={{ color: 'var(--text-primary)' }}>{star.magnitude}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Observatory() {
  const { authHeaders } = useAuth();
  const { toggleFreq } = useMixer();
  const [tab, setTab] = useState('orrery');
  const [planets, setPlanets] = useState([]);
  const [stars, setStars] = useState([]);
  const [events, setEvents] = useState([]);
  const [moon, setMoon] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedStar, setSelectedStar] = useState(null);
  const [sonifyResult, setSonifyResult] = useState(null);

  // Audio context for sonification
  const audioCtxRef = useRef(null);

  useEffect(() => {
    // Observatory is now public - fetch data without auth requirement
    // Auth headers are optional for personalization
    const headers = authHeaders?.Authorization ? authHeaders : {};
    
    axios.get(`${API}/observatory/planets`, { headers })
      .then(r => { 
        setPlanets(r.data.planets); 
        if (r.data.planets && r.data.planets.length > 2) {
          setSelectedPlanet(r.data.planets[2]); // Default to Earth
        }
      })
      .catch((err) => console.warn('Observatory planets fetch failed:', err?.response?.status));
    
    axios.get(`${API}/observatory/stars`, { headers })
      .then(r => setStars(r.data.stars))
      .catch((err) => console.warn('Observatory stars fetch failed:', err?.response?.status));
    
    axios.get(`${API}/observatory/events`, { headers })
      .then(r => { setEvents(r.data.events); setMoon(r.data.moon); })
      .catch((err) => console.warn('Observatory events fetch failed:', err?.response?.status));
  }, [authHeaders]);

  const playSonification = useCallback((hz, color) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = hz;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2);
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, []);

  const handleSonify = useCallback(async (obj, type) => {
    if (!authHeaders) return;
    try {
      const r = await axios.post(`${API}/observatory/sonify`, { type, name: obj.name || obj.Name }, { headers: authHeaders });
      setSonifyResult(r.data);
      playSonification(r.data.frequency_hz, r.data.color);
    } catch (e) {
      console.error('Sonify error:', e);
    }
  }, [authHeaders, playSonification]);

  const TABS = [
    { id: 'orrery', label: 'Orrery', icon: OrbitIcon },
    { id: 'stars', label: 'Deep Sky', icon: Star },
    { id: 'events', label: 'Live Events', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid="observatory-page">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight"
            style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            The Observatory
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Celestial Mechanics, Data Sonification & Live Sky Events
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(129,140,248,0.08)' : 'rgba(248,250,252,0.03)',
                color: tab === t.id ? '#818CF8' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid rgba(129,140,248,0.15)' : '1px solid transparent',
              }}
              data-testid={`observatory-tab-${t.id}`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>

        {/* Orrery Tab — Solar System */}
        {tab === 'orrery' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Interactive Orrery */}
              <div className="glass-card p-4 rounded-2xl" style={{ border: '1px solid rgba(248,250,252,0.06)' }}>
                <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Interactive Orrery — Click a planet to sonify
                </p>
                <Orrery planets={planets} selectedPlanet={selectedPlanet} onSelect={(p) => { setSelectedPlanet(p); handleSonify(p, 'planet'); }} />
              </div>

              {/* Planet Detail + Sonification */}
              <div className="glass-card p-5 rounded-2xl space-y-3" style={{ border: selectedPlanet ? `1px solid ${selectedPlanet.color}15` : '1px solid rgba(248,250,252,0.06)' }}>
                {selectedPlanet ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full" style={{ background: `radial-gradient(circle, ${selectedPlanet.color}60, ${selectedPlanet.color}20)` }} />
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: selectedPlanet.color, fontFamily: 'Cormorant Garamond, serif' }}>
                          {selectedPlanet.name}
                        </h3>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{selectedPlanet.desc}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'EM Frequency', value: `${selectedPlanet.hz}Hz`, color: '#2DD4BF', icon: Radio },
                        { label: 'Orbital Speed', value: `${selectedPlanet.orbital_speed_km_s} km/s`, color: '#A78BFA', icon: Zap },
                        { label: 'Distance', value: `${selectedPlanet.distance_au} AU`, color: '#FBBF24', icon: OrbitIcon },
                        { label: 'Light Time', value: `${selectedPlanet.light_time_minutes} min`, color: '#60A5FA', icon: Clock },
                      ].map(m => (
                        <div key={m.label} className="px-3 py-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)' }}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <m.icon size={8} style={{ color: m.color }} />
                            <p className="text-[7px] uppercase" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                          </div>
                          <p className="text-xs font-mono" style={{ color: m.color }}>{m.value}</p>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => handleSonify(selectedPlanet, 'planet')}
                      className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-medium transition-all"
                      style={{
                        background: `${selectedPlanet.color}08`,
                        color: selectedPlanet.color,
                        border: `1px solid ${selectedPlanet.color}15`,
                      }}
                      data-testid="sonify-planet-btn">
                      <Volume2 size={12} /> Play {selectedPlanet.name}'s Frequency ({selectedPlanet.hz}Hz)
                    </button>

                    {/* Sonification result */}
                    <AnimatePresence>
                      {sonifyResult && sonifyResult.name === selectedPlanet.name && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
                          className="px-3 py-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)' }}
                          data-testid="sonify-result">
                          <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: '#2DD4BF' }}>Sonification Data</p>
                          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            Harmonics: {sonifyResult.harmonics?.map(h => `${h}Hz`).join(', ')}
                          </p>
                          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            Character: {sonifyResult.character} | Rhythm: {sonifyResult.orbital_rhythm_bpm} BPM
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <p className="text-[10px] text-center py-8" style={{ color: 'var(--text-muted)' }}>Select a planet from the orrery</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Deep Sky Tab — Stars */}
        {tab === 'stars' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Notable Stars — Tap to explore, speaker to sonify
                </p>
                {stars.map(s => (
                  <StarCard key={s.name} star={s}
                    isSelected={selectedStar?.name === s.name}
                    onSelect={setSelectedStar}
                    onSonify={(st) => handleSonify(st, 'star')}
                  />
                ))}
              </div>

              {/* Light-Time Explorer */}
              <div className="glass-card p-5 rounded-2xl space-y-4" style={{ border: '1px solid rgba(248,250,252,0.06)' }}>
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Light-Time Explorer
                </h3>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  Every photon you see from a star is ancient light. Here's how old:
                </p>
                <div className="space-y-1.5">
                  {stars.slice(0, 6).map(s => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-[9px] w-24" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(100, (Math.log10(s.distance_ly + 1) / Math.log10(1000)) * 100)}%`,
                          background: s.color,
                        }} />
                      </div>
                      <span className="text-[8px] font-mono w-16 text-right" style={{ color: '#FBBF24' }}>
                        {s.distance_ly < 100 ? `${s.distance_ly} ly` : `${s.distance_ly} ly`}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedStar && (
                  <div className="pt-3 border-t" style={{ borderColor: 'rgba(248,250,252,0.06)' }}>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      The light you see from <strong style={{ color: selectedStar.color }}>{selectedStar.name}</strong> left
                      that star in approximately <strong style={{ color: '#FBBF24' }}>year {selectedStar.light_departed_year}</strong>.
                      Its surface temperature of <strong>{selectedStar.temp_k?.toLocaleString()}K</strong> translates
                      to a sonified frequency of <strong style={{ color: '#2DD4BF' }}>{selectedStar.sonified_hz}Hz</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Events Tab */}
        {tab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Moon Phase */}
              {moon && (
                <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(248,250,252,0.06)' }}
                  data-testid="moon-phase-card">
                  <div className="flex items-center gap-4">
                    <MoonPhaseSVG illumination={moon.illumination} phase={moon.phase} />
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                        {moon.phase}
                      </h3>
                      <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {moon.illumination}% illuminated | Day {moon.age_days} of cycle
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              <div className="glass-card p-5 rounded-2xl space-y-3" style={{ border: '1px solid rgba(248,250,252,0.06)' }}
                data-testid="celestial-events-card">
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Upcoming Celestial Events
                </h3>
                <div className="space-y-2">
                  {events.map((evt, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                      style={{ background: evt.active ? `${evt.color}08` : 'rgba(248,250,252,0.02)', border: evt.active ? `1px solid ${evt.color}20` : '1px solid transparent' }}
                      data-testid={`event-${i}`}>
                      <div className="w-2 h-2 rounded-full" style={{ background: evt.color, boxShadow: evt.active ? `0 0 8px ${evt.color}40` : 'none' }} />
                      <div className="flex-1">
                        <p className="text-[10px] font-medium" style={{ color: evt.active ? evt.color : 'var(--text-primary)' }}>
                          {evt.name} {evt.active && <span className="text-[7px] px-1.5 py-0.5 rounded-full ml-1" style={{ background: `${evt.color}15`, color: evt.color }}>ACTIVE</span>}
                        </p>
                        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                          {evt.type === 'meteor_shower' ? `Peak rate: ~${evt.peak_rate}/hr` : evt.type.replace('_', ' ')} | {evt.days_until === 0 ? 'Tonight' : `in ${evt.days_until} days`}
                        </p>
                      </div>
                      <ChevronRight size={10} style={{ color: 'var(--text-muted)' }} />
                    </div>
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
