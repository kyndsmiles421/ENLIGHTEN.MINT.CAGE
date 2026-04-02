import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMixer } from '../context/MixerContext';
import axios from 'axios';

import MissionControl from '../components/MissionControl';
import { ALL_SATELLITES, ZONE_AUDIO } from '../components/orbital/constants';
import { CosmicDust } from '../components/orbital/CosmicDust';
import { WeatherRibbon } from '../components/orbital/WeatherRibbon';
import { ActiveSatellite } from '../components/orbital/ActiveSatellite';
import { ConnectionLines } from '../components/orbital/ConnectionLines';
import { CentralOrb } from '../components/orbital/CentralOrb';
import { GravityField } from '../components/orbital/GravityField';
import { useHubAudio } from '../hooks/useHubAudio';
import { useGravityManager } from '../hooks/useGravityManager';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
  const [ambienceActive, setAmbienceActive] = useState(false);
  const [gravityNodes, setGravityNodes] = useState([]);
  const [tidalPoint, setTidalPoint] = useState(null);

  const animRef = useRef(null);
  const longPressRef = useRef(null);
  const lastTapRef = useRef(0);

  const audio = useHubAudio();
  const pulseColor = activeFrequencies?.length > 0 ? '#A78BFA' : '#2DD4BF';

  // ━━━ Derived data (computed early for gravity) ━━━
  const activeSats = ALL_SATELLITES.filter(s => activeSatIds.includes(s.id));
  const dormantSats = ALL_SATELLITES.filter(s => !activeSatIds.includes(s.id));
  const containerSize = 620;
  const center = containerSize / 2;
  const baseOrbitRadius = Math.min(200, 120 + activeSats.length * 12);
  const orbitRadius = abyssOpen ? Math.min(280, baseOrbitRadius * 1.35) : baseOrbitRadius;

  const positions = activeSats.map((_, i) => {
    const a = (i / activeSats.length) * Math.PI * 2 + orbitAngle;
    return { x: Math.cos(a) * orbitRadius, y: Math.sin(a) * orbitRadius };
  });

  const satPositions = activeSats.map((sat, i) => ({
    x: positions[i]?.x || 0,
    y: positions[i]?.y || 0,
    color: sat.color,
  }));

  const { meshNodes, calculateDamping, calculateStiffness } = useGravityManager(gravityNodes, satPositions);

  // ━━━ Load preferences + weather + gravity ━━━
  useEffect(() => {
    if (!authHeaders) return;
    axios.get(`${API}/hub/preferences`, { headers: authHeaders })
      .then(r => setActiveSatIds(r.data.active_satellites))
      .catch(() => {});

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

    axios.get(`${API}/gravity/nodes`, { headers: authHeaders })
      .then(r => setGravityNodes(r.data.nodes || []))
      .catch(() => {});
  }, [authHeaders]);

  // ━━━ Orbital rotation ━━━
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

  // ━━━ Persistence ━━━
  const savePrefs = useCallback((ids) => {
    if (!authHeaders) return;
    axios.post(`${API}/hub/preferences`, { active_satellites: ids }, { headers: authHeaders }).catch(() => {});
  }, [authHeaders]);

  // ━━━ Weather ambience ━━━
  const tryStartAmbience = useCallback(() => {
    if (weather && !ambienceActive) {
      audio.startAmbience(weather);
      setAmbienceActive(true);
    }
  }, [weather, ambienceActive, audio]);

  // ━━━ Satellite actions ━━━
  const activateSat = useCallback((id) => {
    setActiveSatIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      savePrefs(next);
      return next;
    });
    setAbyssOpen(false);
    if (navigator.vibrate) navigator.vibrate([30, 20, 50]);
    tryStartAmbience();
  }, [savePrefs, tryStartAmbience]);

  const deactivateSat = useCallback((id) => {
    setActiveSatIds(prev => {
      const next = prev.filter(s => s !== id);
      savePrefs(next);
      return next;
    });
    audio.collapseSound();
  }, [savePrefs, audio]);

  const zenReset = useCallback(() => {
    setActiveSatIds([]);
    savePrefs([]);
    audio.collapseSound();
    setAbyssOpen(false);
    if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
  }, [savePrefs, audio]);

  const handleSelect = useCallback((sat) => { audio.stopSatellite(); audio.stopHarmonicChord(); setTidalPoint(null); navigate(sat.path); }, [navigate, audio]);

  const handleHover = useCallback((id) => {
    setHoveredSat(id);
    if (id) {
      audio.playSatellite(id);
      tryStartAmbience();
      // Create tidal point at satellite position
      const satIdx = activeSats.findIndex(s => s.id === id);
      if (satIdx >= 0 && positions[satIdx]) {
        setTidalPoint({ x: positions[satIdx].x, y: positions[satIdx].y, mass: 0.6 });
        // Check proximity to gravity nodes for harmonic chord
        const satData = ALL_SATELLITES.find(s => s.id === id);
        const satHz = ZONE_AUDIO[id]?.hz;
        if (satHz && gravityNodes.length > 0) {
          const nx = (positions[satIdx].x / 310) * 5;
          const ny = (positions[satIdx].y / 310) * 5;
          let closestNode = null;
          let closestDist = Infinity;
          for (const gn of gravityNodes) {
            const gnx = Math.cos((gravityNodes.indexOf(gn) / gravityNodes.length) * Math.PI * 2) * 4;
            const gny = Math.sin((gravityNodes.indexOf(gn) / gravityNodes.length) * Math.PI * 2) * 4;
            const d = Math.sqrt((nx - gnx) ** 2 + (ny - gny) ** 2);
            if (d < closestDist) { closestDist = d; closestNode = gn; }
          }
          if (closestNode && closestDist < 3) {
            audio.playHarmonicChord(satHz, closestNode.frequency);
          }
        }
      }
    } else {
      audio.stopSatellite();
      audio.stopHarmonicChord();
      setTidalPoint(null);
    }
  }, [audio, tryStartAmbience, activeSats, positions, gravityNodes]);

  // ━━━ Central orb gestures ━━━
  const handleOrbDown = useCallback(() => {
    tryStartAmbience();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
      zenReset();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    longPressRef.current = setTimeout(() => {
      setAbyssOpen(prev => !prev);
      longPressRef.current = null;
    }, 500);
  }, [zenReset, tryStartAmbience]);

  const handleOrbUp = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
      if (!abyssOpen) setMissionControlOpen(true);
      else { setAbyssOpen(false); audio.collapseSound(); }
    }
  }, [abyssOpen, audio]);

  const hoveredData = ALL_SATELLITES.find(s => s.id === hoveredSat);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#06060e' }}
      data-testid="orbital-hub-page">

      {/* WebGL Gravity Field — deepest layer */}
      <GravityField nodes={meshNodes} tidalPoint={tidalPoint} />

      {/* Cosmic dust overlay */}
      <CosmicDust />
      <WeatherRibbon weather={weather} ambienceActive={ambienceActive} />

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
      <div className="relative" style={{ width: containerSize, height: containerSize, zIndex: 2 }}>
        {/* Orbit ring */}
        <motion.div className="absolute rounded-full"
          style={{ left: center - orbitRadius, top: center - orbitRadius, width: orbitRadius * 2, height: orbitRadius * 2, border: '1px solid rgba(248,250,252,0.025)' }}
          animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }} />

        <ConnectionLines positions={positions} hoveredSat={hoveredSat} activeSats={activeSats} cx={center} cy={center} dimmed={abyssOpen} />

        {/* Active satellites with gravity-responsive physics */}
        {activeSats.map((sat, i) => {
          const pos = positions[i];
          const gDamping = calculateDamping(pos.x, pos.y);
          const gStiffness = calculateStiffness(pos.x, pos.y);
          return (
            <ActiveSatellite key={sat.id} sat={sat}
              x={pos.x} y={pos.y}
              isHovered={hoveredSat === sat.id}
              onHover={handleHover} onSelect={handleSelect} onDeactivate={deactivateSat}
              dimmed={abyssOpen}
              gravityDamping={gDamping}
              gravityStiffness={gStiffness}
            />
          );
        })}

        {/* Central Orb */}
        <div className="absolute" style={{ left: center - 65, top: center - 65, zIndex: 15 }}
          onMouseDown={handleOrbDown} onMouseUp={handleOrbUp}
          onTouchStart={handleOrbDown} onTouchEnd={handleOrbUp}>
          <CentralOrb
            pulseColor={pulseColor}
            abyssOpen={abyssOpen}
            dormantSats={dormantSats}
            onActivate={activateSat}
            dormantCount={dormantSats.length}
            weatherCategory={weather?.category}
          />
        </div>
      </div>

      {/* Abyss backdrop */}
      <AnimatePresence>
        {abyssOpen && (
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: 5 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setAbyssOpen(false); audio.collapseSound(); }}
            data-testid="abyss-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none z-30"
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
      <motion.p className="absolute bottom-8 text-[8px] tracking-[0.15em] uppercase z-10"
        style={{ color: 'rgba(248,250,252,0.12)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        Tap orb for Mission Control &middot; Long-press to reveal the Abyss &middot; Double-tap for Zen Reset
      </motion.p>

      <MissionControl isOpen={missionControlOpen} onClose={() => setMissionControlOpen(false)} />
    </div>
  );
}
