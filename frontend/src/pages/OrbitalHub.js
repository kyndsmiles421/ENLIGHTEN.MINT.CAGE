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
import { GravityField } from '../components/orbital/GravityField';
import { useHubAudio } from '../hooks/useHubAudio';
import { CosmicSparkline } from '../components/CosmicSparkline';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrbitalHub() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const { activeFrequencies } = useMixer();

  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [hoveredSat, setHoveredSat] = useState(null);
  const [weather, setWeather] = useState(null);
  const [ambienceActive, setAmbienceActive] = useState(false);

  const audio = useHubAudio();
  const pulseColor = activeFrequencies?.length > 0 ? '#A78BFA' : '#2DD4BF';

  // Load weather
  useEffect(() => {
    if (!authHeaders) return;
    const fetchWeather = (lat = 44.08, lon = -103.23) => {
      axios.get(`${API}/weather/current?lat=${lat}&lon=${lon}`, { headers: authHeaders })
        .then(r => setWeather(r.data)).catch(() => {});
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude.toFixed(2), pos.coords.longitude.toFixed(2)),
        () => fetchWeather());
    } else fetchWeather();
  }, [authHeaders]);

  const tryStartAmbience = useCallback(() => {
    if (weather && !ambienceActive) { audio.startAmbience(weather); setAmbienceActive(true); }
  }, [weather, ambienceActive, audio]);

  const handleSelect = useCallback((sat) => {
    audio.stopSatellite();
    audio.stopHarmonicChord();
    navigate(sat.path);
  }, [navigate, audio]);

  const handleHover = useCallback((id) => {
    setHoveredSat(id);
    if (id) {
      audio.playSatellite(id);
      tryStartAmbience();
    } else {
      audio.stopSatellite();
      audio.stopHarmonicChord();
    }
  }, [audio, tryStartAmbience]);

  const hoveredData = ALL_SATELLITES.find(s => s.id === hoveredSat);

  // Orbital ring layout for all satellites
  const containerSize = 660;
  const center = containerSize / 2;
  const orbitRadius = 240;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#06060e' }}
      data-testid="orbital-hub-page">

      <GravityField nodes={[]} tidalPoint={null} />
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

      {/* Cosmic Sparkline */}
      <div className="absolute top-16 right-6 z-10">
        <CosmicSparkline />
      </div>

      {/* Orbital System */}
      <div className="relative" style={{ width: containerSize, height: containerSize, zIndex: 2 }}>

        {/* Orbit ring visual */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ left: center - orbitRadius, top: center - orbitRadius, width: orbitRadius * 2, height: orbitRadius * 2,
            border: '1px solid rgba(248,250,252,0.03)' }} />

        {/* Inner ring visual */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ left: center - orbitRadius * 0.6, top: center - orbitRadius * 0.6, width: orbitRadius * 1.2, height: orbitRadius * 1.2,
            border: '1px dashed rgba(248,250,252,0.02)' }} />

        {/* ALL satellites on the ring */}
        {ALL_SATELLITES.map((sat, i) => {
          const angle = (i / ALL_SATELLITES.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * orbitRadius;
          const y = Math.sin(angle) * orbitRadius;
          const isHovered = hoveredSat === sat.id;
          const Icon = sat.icon;

          return (
            <motion.div
              key={sat.id}
              className="absolute cursor-pointer"
              style={{
                left: center - 36 + x,
                top: center - 36 + y,
                width: 72,
                height: 72,
                zIndex: isHovered ? 20 : 10,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isHovered ? 1.25 : 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: i * 0.04 }}
              onClick={(e) => { e.stopPropagation(); handleSelect(sat); }}
              onHoverStart={() => handleHover(sat.id)}
              onHoverEnd={() => handleHover(null)}
              data-testid={`satellite-${sat.id}`}
            >
              <div className="w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-300"
                style={{
                  background: isHovered ? `${sat.color}18` : 'rgba(10,10,18,0.55)',
                  border: `1px solid ${isHovered ? sat.color + '50' : sat.color + '15'}`,
                  boxShadow: isHovered ? `0 0 28px ${sat.color}25, inset 0 0 12px ${sat.color}08` : `0 0 12px ${sat.color}08`,
                  backdropFilter: 'blur(10px)',
                }}>
                <Icon size={19} style={{ color: sat.color }} />
                <p className="text-[7px] mt-0.5 font-medium transition-colors duration-300"
                  style={{ color: isHovered ? sat.color : 'rgba(248,250,252,0.4)' }}>{sat.label}</p>
              </div>
            </motion.div>
          );
        })}

        {/* Connection lines from center to hovered satellite */}
        {hoveredSat && (() => {
          const idx = ALL_SATELLITES.findIndex(s => s.id === hoveredSat);
          if (idx < 0) return null;
          const angle = (idx / ALL_SATELLITES.length) * Math.PI * 2 - Math.PI / 2;
          const x2 = Math.cos(angle) * orbitRadius;
          const y2 = Math.sin(angle) * orbitRadius;
          const sat = ALL_SATELLITES[idx];
          return (
            <svg className="absolute inset-0 pointer-events-none" width={containerSize} height={containerSize} style={{ zIndex: 5 }}>
              <line x1={center} y1={center} x2={center + x2} y2={center + y2}
                stroke={sat.color} strokeWidth="1" strokeOpacity="0.2" />
            </svg>
          );
        })()}

        {/* Central Orb — opens Mission Control */}
        <motion.div
          className="absolute cursor-pointer"
          style={{
            left: center - 55,
            top: center - 55,
            width: 110,
            height: 110,
            zIndex: 15,
          }}
          onClick={() => setMissionControlOpen(true)}
          data-testid="central-orb"
        >
          <motion.div
            className="w-full h-full rounded-full flex items-center justify-center"
            animate={{
              boxShadow: [`0 0 40px ${pulseColor}15`, `0 0 60px ${pulseColor}25`, `0 0 40px ${pulseColor}15`],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: `radial-gradient(circle at 38% 32%, ${pulseColor}35, ${pulseColor}10 55%, rgba(10,10,18,0.92) 85%)`,
              border: `1.5px solid ${pulseColor}25`,
            }}
          >
            <motion.div
              className="absolute rounded-full"
              style={{ inset: 6, border: `1px solid ${pulseColor}18` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{ inset: 14, border: `1px dashed ${pulseColor}10` }}
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
          <div className="absolute text-center w-full" style={{ bottom: -20 }}>
            <p className="text-[8px] font-medium tracking-[0.2em] uppercase" style={{ color: `${pulseColor}60` }}>
              Mission Control
            </p>
          </div>
        </motion.div>
      </div>

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
                {ZONE_AUDIO[hoveredData.id].hz}Hz
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      <motion.p className="absolute bottom-8 text-[8px] tracking-[0.15em] uppercase z-10"
        style={{ color: 'rgba(248,250,252,0.12)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        Click any module to enter &middot; Center orb for Mission Control
      </motion.p>

      <MissionControl isOpen={missionControlOpen} onClose={() => setMissionControlOpen(false)} />
    </div>
  );
}
