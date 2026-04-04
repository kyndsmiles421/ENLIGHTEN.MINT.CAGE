import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALL_SATELLITES, ZONE_AUDIO } from '../components/orbital/constants';
import { CosmicDust } from '../components/orbital/CosmicDust';
import { useHubAudio } from '../hooks/useHubAudio';
import MissionControl from '../components/MissionControl';

// ═══ STRICT DIMENSIONAL CONSTRAINTS ═══
// Everything is a ratio of ORB_RADIUS (R)
const FIXTURE_SCALE_HIDDEN = 0.15;   // Absorbed inside orb
const FIXTURE_SCALE_ACTIVE = 0.4;    // Extracted and visible
const ORBIT_DISTANCE = 1.6;          // Center-to-center distance from orb
const EXTRACTION_THRESHOLD = 1.2;    // Drag distance to "break free" (interaction buffer)
const ROTATION_SPEED = 0.1;          // Radians per second

function lerp(a, b, t) { return a + (b - a) * t; }

export default function OrbitalHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const audio = useHubAudio();

  const [extractedIds, setExtractedIds] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragProgress, setDragProgress] = useState(0); // 0-1 pull progress
  const [hoveredSat, setHoveredSat] = useState(null);
  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [orbAngle, setOrbAngle] = useState(0);
  const animRef = useRef(null);
  const orbRef = useRef(null);

  // Responsive: R is the orb radius in pixels
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const isMobile = dims.w < 640;
  // R = orb radius — fills a good portion of the screen
  const R = Math.min(dims.w * 0.35, dims.h * 0.28, 240);
  const orbDiameter = R * 2;
  const orbitDistancePx = R * ORBIT_DISTANCE;
  const fixtureActiveSize = R * FIXTURE_SCALE_ACTIVE * 2; // diameter
  const fixtureHiddenSize = R * FIXTURE_SCALE_HIDDEN * 2;
  // Container must hold orb + orbit ring + fixture
  const containerSize = (orbitDistancePx + fixtureActiveSize / 2 + 4) * 2;
  const center = containerSize / 2;

  const extractedSats = ALL_SATELLITES.filter(s => extractedIds.includes(s.id));
  const absorbedSats = ALL_SATELLITES.filter(s => !extractedIds.includes(s.id));

  // Orbital rotation
  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setOrbAngle(prev => prev + ROTATION_SPEED * dt);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // ═══ EXTRACTION: Pull fixture out of orb ═══
  const extractFixture = useCallback((id) => {
    setExtractedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    setDraggingId(null);
    setDragProgress(0);
    if (navigator.vibrate) navigator.vibrate([20, 10, 30]);
    try { audio.playSatellite(id); } catch {}
  }, [audio]);

  // ═══ ABSORPTION: Snap fixture back to (0,0,0) inside orb ═══
  const absorbFixture = useCallback((id) => {
    setExtractedIds(prev => prev.filter(s => s !== id));
    try { audio.collapseSound(); } catch {}
    if (navigator.vibrate) navigator.vibrate([15, 8, 25]);
  }, [audio]);

  // Navigate to module page
  const goToModule = useCallback((sat) => {
    try { audio.stopSatellite(); } catch {}
    navigate(sat.path);
  }, [navigate, audio]);

  const handleHover = useCallback((id) => {
    setHoveredSat(id);
    if (id) { try { audio.playSatellite(id); } catch {} }
    else { try { audio.stopSatellite(); } catch {} }
  }, [audio]);

  // Get orbital position for extracted fixture
  const getOrbitPosition = useCallback((idx, total) => {
    const baseAngle = (idx / Math.max(total, 1)) * Math.PI * 2;
    const angle = baseAngle + orbAngle - Math.PI / 2;
    return {
      x: Math.cos(angle) * orbitDistancePx,
      y: Math.sin(angle) * orbitDistancePx,
    };
  }, [orbAngle, orbitDistancePx]);

  const hoveredData = ALL_SATELLITES.find(s => s.id === hoveredSat);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#06060e', position: 'relative' }}
      data-testid="orbital-hub-page"
    >
      <CosmicDust />

      {/* Title */}
      <motion.div className="absolute top-4 sm:top-6 left-0 right-0 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-sm sm:text-lg font-light tracking-[0.25em] uppercase"
          style={{ color: 'rgba(248,250,252,0.2)', fontFamily: 'Cormorant Garamond, serif' }}>
          The Cosmic Collective
        </h1>
      </motion.div>

      {/* ═══ ORBITAL SYSTEM ═══ */}
      <div className="relative" style={{
        width: containerSize, height: containerSize, zIndex: 2,
        maxWidth: '100vw', maxHeight: 'calc(100vh - 40px)',
      }}>

        {/* Orbit ring guide */}
        {extractedSats.length > 0 && (
          <div className="absolute rounded-full pointer-events-none"
            style={{
              left: center - orbitDistancePx, top: center - orbitDistancePx,
              width: orbitDistancePx * 2, height: orbitDistancePx * 2,
              border: '1px solid rgba(248,250,252,0.035)',
            }}
          />
        )}

        {/* ═══ EXTRACTED FIXTURES — orbiting at 1.6R ═══ */}
        {extractedSats.map((sat, i) => {
          const pos = getOrbitPosition(i, extractedSats.length);
          const isHovered = hoveredSat === sat.id;
          const Icon = sat.icon;
          const size = fixtureActiveSize;

          return (
            <motion.div
              key={sat.id}
              className="absolute cursor-pointer"
              style={{
                left: center - size / 2,
                top: center - size / 2,
                width: size, height: size,
                zIndex: isHovered ? 30 : 20,
              }}
              initial={{ x: 0, y: 0, scale: FIXTURE_SCALE_HIDDEN / FIXTURE_SCALE_ACTIVE, opacity: 0 }}
              animate={{
                x: pos.x, y: pos.y,
                scale: isHovered ? 1.12 : 1,
                opacity: 1,
              }}
              transition={{
                x: { type: 'spring', stiffness: 70, damping: 16 },
                y: { type: 'spring', stiffness: 70, damping: 16 },
                scale: { duration: 0.2 }, opacity: { duration: 0.4 },
              }}
              onHoverStart={() => handleHover(sat.id)}
              onHoverEnd={() => handleHover(null)}
              onClick={(e) => { e.stopPropagation(); goToModule(sat); }}
              data-testid={`satellite-${sat.id}`}
            >
              <div
                className="w-full h-full rounded-full flex flex-col items-center justify-center relative"
                style={{
                  background: isHovered ? `${sat.color}1A` : 'rgba(10,10,18,0.6)',
                  border: `1.5px solid ${isHovered ? sat.color + '55' : sat.color + '20'}`,
                  boxShadow: isHovered
                    ? `0 0 ${R * 0.15}px ${sat.color}30, inset 0 0 ${R * 0.08}px ${sat.color}10`
                    : `0 0 ${R * 0.06}px ${sat.color}10`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Icon size={size * 0.3} style={{ color: sat.color }} />
                <p className="text-center mt-0.5 font-medium leading-tight px-1"
                  style={{
                    fontSize: Math.max(7, size * 0.12),
                    color: isHovered ? sat.color : 'rgba(248,250,252,0.45)',
                  }}>
                  {sat.label}
                </p>
              </div>
              {/* Absorb button (snap back) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.button
                    className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
                    style={{
                      width: size * 0.22, height: size * 0.22,
                      background: 'rgba(10,10,18,0.9)',
                      border: '1px solid rgba(248,250,252,0.2)', zIndex: 35,
                      fontSize: size * 0.12,
                      color: 'rgba(248,250,252,0.6)',
                    }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    onClick={(e) => { e.stopPropagation(); absorbFixture(sat.id); }}
                    data-testid={`snapback-${sat.id}`}
                  >
                    &times;
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Connection lines */}
        <svg className="absolute inset-0 pointer-events-none" width={containerSize} height={containerSize} style={{ zIndex: 5 }}>
          {extractedSats.map((sat, i) => {
            const pos = getOrbitPosition(i, extractedSats.length);
            return (
              <line key={sat.id}
                x1={center} y1={center} x2={center + pos.x} y2={center + pos.y}
                stroke={sat.color} strokeWidth={hoveredSat === sat.id ? 1.5 : 0.5}
                strokeOpacity={hoveredSat === sat.id ? 0.25 : 0.06} strokeDasharray="4 4"
              />
            );
          })}
        </svg>

        {/* ═══ THE CORE ORB (Parent) ═══ */}
        <div
          className="absolute"
          style={{
            left: center - R, top: center - R,
            width: orbDiameter, height: orbDiameter,
            zIndex: 15,
          }}
          ref={orbRef}
        >
          <motion.div
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at 38% 32%, rgba(167,139,250,0.22), rgba(167,139,250,0.06) 55%, rgba(10,10,18,0.95) 85%)`,
              border: '1.5px solid rgba(167,139,250,0.15)',
            }}
            animate={{
              boxShadow: [
                `0 0 ${R * 0.3}px rgba(167,139,250,0.1)`,
                `0 0 ${R * 0.5}px rgba(167,139,250,0.18)`,
                `0 0 ${R * 0.3}px rgba(167,139,250,0.1)`,
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            data-testid="central-orb"
          >
            {/* Inner ring animations */}
            <motion.div className="absolute rounded-full pointer-events-none"
              style={{ inset: R * 0.04, border: '1px solid rgba(167,139,250,0.1)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div className="absolute rounded-full pointer-events-none"
              style={{ inset: R * 0.1, border: '1px dashed rgba(167,139,250,0.05)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />

            {/* ═══ ABSORBED FIXTURES — at (0,0) center, scale 0.15R, alpha lerps on drag ═══ */}
            {absorbedSats.map((sat, i) => {
              const Icon = sat.icon;
              const hiddenDiam = fixtureHiddenSize;
              const isDragging = draggingId === sat.id;
              // Arrange in concentric rings
              const total = absorbedSats.length;
              const ring1 = Math.min(8, total);
              const ring2 = total - ring1;
              let posX = 0, posY = 0;
              if (i < ring1) {
                const angle = (i / ring1) * Math.PI * 2 - Math.PI / 2;
                const innerR = R * 0.55;
                posX = Math.cos(angle) * innerR;
                posY = Math.sin(angle) * innerR;
              } else {
                const i2 = i - ring1;
                const angle = (i2 / Math.max(ring2, 1)) * Math.PI * 2 - Math.PI / 2;
                const innerR = R * 0.25;
                posX = Math.cos(angle) * innerR;
                posY = Math.sin(angle) * innerR;
              }

              return (
                <AbsorbedFixture
                  key={sat.id}
                  sat={sat}
                  posX={posX}
                  posY={posY}
                  index={i}
                  R={R}
                  hiddenDiam={hiddenDiam}
                  isMobile={isMobile}
                  onExtract={extractFixture}
                  onDragStart={() => setDraggingId(sat.id)}
                  onDragEnd={() => { setDraggingId(null); setDragProgress(0); }}
                  onDragProgress={(p) => setDragProgress(p)}
                />
              );
            })}

            {/* Center label — tap opens Mission Control */}
            <div
              className="absolute flex flex-col items-center justify-center cursor-pointer rounded-full"
              style={{
                left: '50%', top: '50%',
                width: R * 0.4, height: R * 0.4,
                marginLeft: -R * 0.2, marginTop: -R * 0.2,
                zIndex: 25,
              }}
              onClick={() => setMissionControlOpen(true)}
              data-testid="mission-control-btn"
            >
              {absorbedSats.length > 0 && (
                <p className="font-medium tracking-[0.1em] uppercase"
                  style={{ fontSize: Math.max(7, R * 0.06), color: 'rgba(167,139,250,0.4)' }}>
                  {absorbedSats.length}
                </p>
              )}
            </div>
          </motion.div>

          <p className="text-center font-medium tracking-[0.12em] uppercase mt-1.5 cursor-pointer"
            style={{ fontSize: Math.max(7, R * 0.05), color: 'rgba(167,139,250,0.28)' }}
            onClick={() => setMissionControlOpen(true)}
            data-testid="mission-control-label"
          >
            Mission Control
          </p>
        </div>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-30 px-4"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <p className="text-sm font-medium" style={{ color: hoveredData.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {hoveredData.label}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>{hoveredData.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      {!hoveredData && (
        <motion.p className="absolute bottom-3 text-center z-10 pointer-events-none px-4"
          style={{ fontSize: Math.max(6, R * 0.035), color: 'rgba(248,250,252,0.08)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          tap a module to pull it out &middot; tap orbiting module to enter
        </motion.p>
      )}

      <MissionControl isOpen={missionControlOpen} onClose={() => setMissionControlOpen(false)} />
    </div>
  );
}

// ═══ ABSORBED FIXTURE — sits at (0,0) inside orb, pull to extract ═══
function AbsorbedFixture({ sat, posX, posY, index, R, hiddenDiam, isMobile, onExtract, onDragStart, onDragEnd, onDragProgress }) {
  const Icon = sat.icon;
  const [pullT, setPullT] = useState(0); // 0 = fully absorbed, 1 = breaking free
  const dragStartRef = useRef(null);
  const thresholdPx = R * EXTRACTION_THRESHOLD;

  // Visual interpolation based on pull progress
  const currentScale = lerp(1, FIXTURE_SCALE_ACTIVE / FIXTURE_SCALE_HIDDEN, pullT);
  const currentAlpha = lerp(0.5, 1, pullT);
  const currentSize = hiddenDiam * currentScale;
  const glowIntensity = pullT * 0.3;

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    onDragStart();
  }, [onDragStart]);

  const handlePointerMove = useCallback((e) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const t = Math.min(dist / thresholdPx, 1.0);
    setPullT(t);
    onDragProgress(t);
  }, [thresholdPx, onDragProgress]);

  const handlePointerUp = useCallback((e) => {
    e.stopPropagation();
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > thresholdPx) {
      // Extracted! Break free
      onExtract(sat.id);
    } else if (dist < 8) {
      // Simple tap — also extract
      onExtract(sat.id);
    }
    dragStartRef.current = null;
    setPullT(0);
    onDragEnd();
  }, [thresholdPx, sat.id, onExtract, onDragEnd]);

  const handlePointerLeave = useCallback(() => {
    if (dragStartRef.current) {
      dragStartRef.current = null;
      setPullT(0);
      onDragEnd();
    }
  }, [onDragEnd]);

  return (
    <motion.div
      className="absolute rounded-full flex flex-col items-center justify-center cursor-pointer select-none touch-none"
      style={{
        left: '50%', top: '50%',
        width: currentSize, height: currentSize,
        marginLeft: -currentSize / 2,
        marginTop: -currentSize / 2,
        zIndex: 20 + (pullT > 0 ? 5 : 0),
        opacity: currentAlpha,
        background: pullT > 0.5 ? `${sat.color}18` : `${sat.color}08`,
        border: `1px solid ${sat.color}${pullT > 0.5 ? '40' : '20'}`,
        boxShadow: glowIntensity > 0.05 ? `0 0 ${R * glowIntensity}px ${sat.color}30` : 'none',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: 1, opacity: currentAlpha, x: posX, y: posY }}
      transition={{ type: 'spring', stiffness: 100, damping: 12, delay: index * 0.025 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      data-testid={`dormant-${sat.id}`}
    >
      <Icon size={Math.max(10, currentSize * 0.32)} style={{ color: sat.color }} />
      <p className="text-center leading-tight mt-0.5 px-0.5 font-medium"
        style={{
          fontSize: Math.max(5, currentSize * 0.14),
          color: `${sat.color}${pullT > 0.3 ? 'DD' : '99'}`,
        }}>
        {sat.label}
      </p>
    </motion.div>
  );
}
