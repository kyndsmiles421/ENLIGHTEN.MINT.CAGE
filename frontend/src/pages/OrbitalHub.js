import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALL_SATELLITES, ZONE_AUDIO } from '../components/orbital/constants';
import { CosmicDust } from '../components/orbital/CosmicDust';
import { useHubAudio } from '../hooks/useHubAudio';
import { X } from 'lucide-react';
import MissionControl from '../components/MissionControl';

export default function OrbitalHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const audio = useHubAudio();

  // Which satellites are currently "ejected" (active in orbit)
  const [activeSatIds, setActiveSatIds] = useState([]);
  const [hoveredSat, setHoveredSat] = useState(null);
  const [frozenSat, setFrozenSat] = useState(null);
  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [orbAngle, setOrbAngle] = useState(0);

  const animRef = useRef(null);
  const containerRef = useRef(null);

  // Responsive sizing
  const [dims, setDims] = useState({ w: 800, h: 600 });
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const isMobile = dims.w < 640;
  const containerSize = Math.min(dims.w - 32, dims.h - 80, 680);
  const center = containerSize / 2;
  const orbRadius = containerSize * 0.38;
  const orbSize = isMobile ? 120 : 160;

  // Derived
  const activeSats = ALL_SATELLITES.filter(s => activeSatIds.includes(s.id));
  const dormantSats = ALL_SATELLITES.filter(s => !activeSatIds.includes(s.id));

  // Simple sin/cos orbital rotation
  useEffect(() => {
    const SPEED = 0.15; // radians per second
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setOrbAngle(prev => prev + SPEED * dt);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // Eject satellite from central sphere to orbit
  const ejectSatellite = useCallback((id) => {
    setActiveSatIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    if (navigator.vibrate) navigator.vibrate([20, 10, 30]);
    try { audio.playSatellite(id); } catch {}
  }, [audio]);

  // Snap satellite back into central sphere
  const snapBack = useCallback((id) => {
    setActiveSatIds(prev => prev.filter(s => s !== id));
    if (frozenSat === id) setFrozenSat(null);
    try { audio.collapseSound(); } catch {}
    if (navigator.vibrate) navigator.vibrate([15, 8, 25]);
  }, [frozenSat, audio]);

  // Navigate to the satellite's page
  const goToModule = useCallback((sat) => {
    try { audio.stopSatellite(); } catch {}
    navigate(sat.path);
  }, [navigate, audio]);

  // Freeze/unfreeze orbital velocity for a satellite
  const toggleFreeze = useCallback((id) => {
    setFrozenSat(prev => prev === id ? null : id);
  }, []);

  const handleHover = useCallback((id) => {
    setHoveredSat(id);
    if (id) { try { audio.playSatellite(id); } catch {} }
    else { try { audio.stopSatellite(); } catch {} }
  }, [audio]);

  // Calculate position for each active satellite on its fixed orbital plane
  const getSatPosition = useCallback((satId, idx, total) => {
    const baseAngle = (idx / Math.max(total, 1)) * Math.PI * 2;
    const isFrozen = frozenSat === satId;
    const angle = baseAngle + (isFrozen ? 0 : orbAngle) - Math.PI / 2;
    const x = Math.cos(angle) * orbRadius;
    const y = Math.sin(angle) * orbRadius;
    return { x, y };
  }, [orbAngle, orbRadius, frozenSat]);

  const hoveredData = ALL_SATELLITES.find(s => s.id === hoveredSat);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: '#06060e', position: 'relative' }}
      data-testid="orbital-hub-page"
    >
      <CosmicDust />

      {/* Title */}
      <motion.div className="absolute top-6 left-0 right-0 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-base sm:text-lg font-light tracking-[0.25em] uppercase"
          style={{ color: 'rgba(248,250,252,0.2)', fontFamily: 'Cormorant Garamond, serif' }}>
          The Cosmic Collective
        </h1>
        {user && (
          <p className="text-[9px] mt-1" style={{ color: 'rgba(248,250,252,0.12)' }}>
            {user.name || 'Traveler'}
          </p>
        )}
      </motion.div>

      {/* Orbital Container — fully contained */}
      <div
        ref={containerRef}
        className="relative"
        style={{ width: containerSize, height: containerSize, zIndex: 2 }}
      >
        {/* Orbit ring guide */}
        <div className="absolute rounded-full pointer-events-none"
          style={{
            left: center - orbRadius, top: center - orbRadius,
            width: orbRadius * 2, height: orbRadius * 2,
            border: activeSats.length > 0 ? '1px solid rgba(248,250,252,0.04)' : 'none',
            transition: 'border-color 0.5s',
          }}
        />

        {/* Active Satellites — orbiting on fixed planes */}
        {activeSats.map((sat, i) => {
          const pos = getSatPosition(sat.id, i, activeSats.length);
          const isHovered = hoveredSat === sat.id;
          const isFrozen = frozenSat === sat.id;
          const Icon = sat.icon;
          const satSize = isMobile ? 56 : 68;

          return (
            <motion.div
              key={sat.id}
              className="absolute"
              style={{
                left: center - satSize / 2,
                top: center - satSize / 2,
                width: satSize,
                height: satSize,
                zIndex: isHovered ? 25 : isFrozen ? 22 : 10,
              }}
              initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
              animate={{
                x: pos.x,
                y: pos.y,
                scale: isHovered ? 1.2 : 1,
                opacity: 1,
              }}
              transition={{
                x: { type: 'spring', stiffness: 80, damping: 18 },
                y: { type: 'spring', stiffness: 80, damping: 18 },
                scale: { duration: 0.2 },
                opacity: { duration: 0.4 },
              }}
              onHoverStart={() => handleHover(sat.id)}
              onHoverEnd={() => handleHover(null)}
              data-testid={`satellite-${sat.id}`}
            >
              {/* Satellite body */}
              <div
                className="w-full h-full rounded-full flex flex-col items-center justify-center cursor-pointer relative"
                style={{
                  background: isHovered ? `${sat.color}18` : isFrozen ? `${sat.color}12` : 'rgba(10,10,18,0.6)',
                  border: `1px solid ${isHovered ? sat.color + '55' : isFrozen ? sat.color + '30' : sat.color + '18'}`,
                  boxShadow: isHovered
                    ? `0 0 30px ${sat.color}25, inset 0 0 14px ${sat.color}0A`
                    : isFrozen
                    ? `0 0 20px ${sat.color}15`
                    : `0 0 10px ${sat.color}08`,
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                }}
                onClick={(e) => { e.stopPropagation(); goToModule(sat); }}
              >
                <Icon size={isMobile ? 16 : 18} style={{ color: sat.color }} />
                <p className="text-[6px] sm:text-[7px] mt-0.5 font-medium"
                  style={{ color: isHovered || isFrozen ? sat.color : 'rgba(248,250,252,0.35)' }}>
                  {sat.label}
                </p>
                {isFrozen && (
                  <p className="text-[4px] font-mono tracking-wider uppercase"
                    style={{ color: `${sat.color}60` }}>held</p>
                )}
              </div>

              {/* Snap-back button — visible on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.button
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(10,10,18,0.9)',
                      border: '1px solid rgba(248,250,252,0.15)',
                      zIndex: 30,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); snapBack(sat.id); }}
                    data-testid={`snapback-${sat.id}`}
                  >
                    <X size={8} style={{ color: 'rgba(248,250,252,0.5)' }} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Freeze toggle on right-click */}
              <div
                className="absolute inset-0"
                onContextMenu={(e) => { e.preventDefault(); toggleFreeze(sat.id); }}
                style={{ pointerEvents: 'none' }}
              />
            </motion.div>
          );
        })}

        {/* Connection lines from center to active satellites */}
        <svg className="absolute inset-0 pointer-events-none" width={containerSize} height={containerSize} style={{ zIndex: 5 }}>
          {activeSats.map((sat, i) => {
            const pos = getSatPosition(sat.id, i, activeSats.length);
            const isHov = hoveredSat === sat.id;
            return (
              <line key={sat.id}
                x1={center} y1={center}
                x2={center + pos.x} y2={center + pos.y}
                stroke={sat.color}
                strokeWidth={isHov ? 1.5 : 0.5}
                strokeOpacity={isHov ? 0.3 : 0.08}
                strokeDasharray={isHov ? 'none' : '4 4'}
              />
            );
          })}
        </svg>

        {/* ═══ CENTRAL MISSION CONTROL SPHERE ═══ */}
        <div
          className="absolute"
          style={{
            left: center - orbSize / 2,
            top: center - orbSize / 2,
            width: orbSize,
            height: orbSize,
            zIndex: 15,
          }}
        >
          <motion.div
            className="w-full h-full rounded-full relative cursor-pointer overflow-hidden"
            style={{
              background: `radial-gradient(circle at 38% 32%, rgba(167,139,250,0.3), rgba(167,139,250,0.08) 55%, rgba(10,10,18,0.92) 85%)`,
              border: '1.5px solid rgba(167,139,250,0.2)',
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(167,139,250,0.12)',
                '0 0 60px rgba(167,139,250,0.2)',
                '0 0 40px rgba(167,139,250,0.12)',
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => setMissionControlOpen(true)}
            data-testid="central-orb"
          >
            {/* Inner ring animations */}
            <motion.div className="absolute rounded-full"
              style={{ inset: 6, border: '1px solid rgba(167,139,250,0.15)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div className="absolute rounded-full"
              style={{ inset: 14, border: '1px dashed rgba(167,139,250,0.08)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />

            {/* Dormant satellites inside the sphere — sub-objects */}
            {dormantSats.map((sat, i) => {
              const Icon = sat.icon;
              const angle = (i / Math.max(dormantSats.length, 1)) * Math.PI * 2;
              const innerR = (orbSize / 2) * 0.55;
              const dx = Math.cos(angle) * innerR;
              const dy = Math.sin(angle) * innerR;

              return (
                <motion.div
                  key={sat.id}
                  className="absolute rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
                    marginLeft: isMobile ? -12 : -14,
                    marginTop: isMobile ? -12 : -14,
                    zIndex: 20,
                  }}
                  initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 0.7,
                    x: dx,
                    y: dy,
                  }}
                  whileHover={{ scale: 1.5, opacity: 1 }}
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 12, delay: i * 0.03 }}
                  onClick={(e) => { e.stopPropagation(); ejectSatellite(sat.id); }}
                  data-testid={`dormant-${sat.id}`}
                >
                  <Icon size={isMobile ? 10 : 13} style={{ color: sat.color }} />
                </motion.div>
              );
            })}

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {dormantSats.length > 0 && (
                <>
                  <p className="text-[6px] sm:text-[7px] font-medium tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(167,139,250,0.45)' }}>
                    {dormantSats.length} modules
                  </p>
                  <p className="text-[5px] mt-0.5"
                    style={{ color: 'rgba(248,250,252,0.15)' }}>
                    click to eject
                  </p>
                </>
              )}
              {dormantSats.length === 0 && (
                <p className="text-[7px] font-medium tracking-[0.15em] uppercase"
                  style={{ color: 'rgba(167,139,250,0.4)' }}>
                  control
                </p>
              )}
            </div>
          </motion.div>

          {/* Label below orb */}
          <p className="text-center text-[7px] sm:text-[8px] font-medium tracking-[0.15em] uppercase mt-1.5"
            style={{ color: 'rgba(167,139,250,0.35)' }}>
            Mission Control
          </p>
        </div>
      </div>

      {/* Hover tooltip — contained at bottom */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-30 px-4"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <p className="text-sm font-medium" style={{ color: hoveredData.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {hoveredData.label}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>{hoveredData.desc}</p>
            {ZONE_AUDIO[hoveredData.id] && (
              <p className="text-[7px] mt-0.5 font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                {ZONE_AUDIO[hoveredData.id].hz}Hz &middot; click to enter &middot; hover X to snap back
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      {!hoveredData && (
        <motion.p className="absolute bottom-4 left-0 right-0 text-center text-[7px] sm:text-[8px] tracking-[0.12em] uppercase z-10 pointer-events-none px-4"
          style={{ color: 'rgba(248,250,252,0.1)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          Click modules in the sphere to pull them into orbit &middot; Click an orbiting module to enter
        </motion.p>
      )}

      <MissionControl isOpen={missionControlOpen} onClose={() => setMissionControlOpen(false)} />
    </div>
  );
}
