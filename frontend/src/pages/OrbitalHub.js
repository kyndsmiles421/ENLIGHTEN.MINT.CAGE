import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALL_SATELLITES } from '../components/orbital/constants';
import { CosmicDust } from '../components/orbital/CosmicDust';
import MissionControl from '../components/MissionControl';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ENLIGHTEN.MINT.CAFE HUB — V5.1 "The Great Recovery"
 * ARCHITECT: Steven Michael
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PHYSICS: DISABLED
 * GRAVITY: 0
 * BACK-BOOM: DELETED
 * LAYOUT: FIXED COORDINATES
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══ FIXED LAYOUTS — NO PHYSICS ═══
const LAYOUTS = {
  // LAYOUT 1: THE PENTAGRAM (Fixed Star) - Expanded radius for more items
  star: (count, isMobile) => {
    const radius = isMobile ? 130 : 200; // Larger radius for desktop
    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      positions.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
    return positions;
  },

  // LAYOUT 2: PILLAR (Vertical for Mobile 605)
  pillar: (count, isMobile) => {
    const spacing = isMobile ? 75 : 90;
    const startY = -((count - 1) * spacing) / 2;
    return Array.from({ length: count }, (_, i) => ({
      x: 0,
      y: startY + i * spacing,
    }));
  },

  // LAYOUT 3: ORBIT (Circular ring) - Dual rings for many items
  orbit: (count, isMobile) => {
    const innerRadius = isMobile ? 100 : 140;
    const outerRadius = isMobile ? 170 : 240;
    const innerCount = Math.ceil(count / 2);
    const outerCount = count - innerCount;
    
    const positions = [];
    
    // Inner ring
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2 - Math.PI / 2;
      positions.push({
        x: Math.cos(angle) * innerRadius,
        y: Math.sin(angle) * innerRadius,
      });
    }
    
    // Outer ring
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2 - Math.PI / 2 + Math.PI / outerCount;
      positions.push({
        x: Math.cos(angle) * outerRadius,
        y: Math.sin(angle) * outerRadius,
      });
    }
    
    return positions;
  },
};

// ═══ NODULE SIZE ═══
const NODULE_SIZE = 72;
const CORE_SIZE = 100;

export default function OrbitalHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ═══ STATE ═══
  const [layoutMode, setLayoutMode] = useState('star'); // 'star' | 'pillar' | 'orbit'
  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-select pillar layout on mobile
  useEffect(() => {
    if (isMobile) {
      setLayoutMode('pillar');
    }
  }, [isMobile]);

  // Get fixed positions for current layout
  const positions = LAYOUTS[layoutMode](ALL_SATELLITES.length, isMobile);

  // ═══ NODULE TAP → NAVIGATE ═══
  const handleNoduleTap = useCallback((sat) => {
    // Immediate navigation - no physics, no extraction
    setSelectedId(sat.id);
    
    // Brief visual feedback then navigate
    setTimeout(() => {
      navigate(sat.path);
    }, 150);
  }, [navigate]);

  // ═══ CORE TAP → MISSION CONTROL ═══
  const handleCoreTap = useCallback(() => {
    setMissionControlOpen(true);
  }, []);

  // ═══ LAYOUT CYCLE ═══
  const cycleLayout = useCallback(() => {
    const modes = ['star', 'pillar', 'orbit'];
    const currentIdx = modes.indexOf(layoutMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    setLayoutMode(modes[nextIdx]);
  }, [layoutMode]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#000000', position: 'relative' }}
      data-testid="orbital-hub-page"
    >
      {/* Obsidian Void Background */}
      <CosmicDust />

      {/* Title */}
      <motion.div 
        className="absolute top-4 sm:top-6 left-0 right-0 text-center pointer-events-none"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        style={{ zIndex: 100 }}
      >
        <h1 
          className="brand-logo-large"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.2em',
            color: 'rgba(212, 175, 55, 0.8)',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
          }}
        >
          ENLIGHTEN.MINT.CAFE
        </h1>
      </motion.div>

      {/* Layout Switcher */}
      <motion.button
        className="absolute top-16 right-4 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(10,10,18,0.8)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          color: 'rgba(212, 175, 55, 0.7)',
          fontSize: 10,
          letterSpacing: '0.1em',
          zIndex: 9999,
        }}
        onClick={cycleLayout}
        whileTap={{ scale: 0.95 }}
        data-testid="layout-switcher"
      >
        {layoutMode.toUpperCase()}
      </motion.button>

      {/* ═══ HUB CONTAINER ═══ */}
      <div 
        className="relative flex items-center justify-center"
        style={{
          width: '100%',
          height: isMobile ? '70vh' : '60vh',
          maxWidth: 500,
        }}
      >
        {/* ═══ CENTRAL CRYSTAL CORE ═══ */}
        <motion.div
          className="absolute cursor-pointer"
          style={{
            width: CORE_SIZE,
            height: CORE_SIZE,
            zIndex: 50,
          }}
          onClick={handleCoreTap}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="central-orb"
        >
          {/* Core Visual - Diamond Refraction */}
          <div
            className="w-full h-full rounded-full relative"
            style={{
              background: `radial-gradient(circle at 30% 30%, 
                rgba(0, 255, 255, 0.15) 0%, 
                rgba(212, 175, 55, 0.1) 30%,
                rgba(0, 0, 0, 0.9) 70%)`,
              border: '2px solid rgba(0, 255, 255, 0.3)',
              boxShadow: `
                0 0 30px rgba(0, 255, 255, 0.2),
                0 0 60px rgba(212, 175, 55, 0.1),
                inset 0 0 30px rgba(0, 255, 255, 0.1)
              `,
            }}
          >
            {/* Metatron's Cube Hint */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23d4af37' stroke-width='0.3' opacity='0.3'/%3E%3Ccircle cx='50' cy='50' r='25' fill='none' stroke='%2300ffff' stroke-width='0.3' opacity='0.3'/%3E%3C/svg%3E") center/contain no-repeat`,
                animation: 'spin 30s linear infinite',
              }}
            />
            
            {/* Core Label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                style={{ 
                  color: 'rgba(0, 255, 255, 0.6)', 
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                }}
              >
                MENU
              </span>
            </div>
          </div>
          
          {/* Pulsing Glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(0, 255, 255, 0.2)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* ═══ SOVEREIGN NODULES — FIXED POSITIONS ═══ */}
        {ALL_SATELLITES.map((sat, idx) => {
          const pos = positions[idx];
          const Icon = sat.icon;
          const isSelected = selectedId === sat.id;

          return (
            <motion.div
              key={sat.id}
              className="absolute cursor-pointer"
              style={{
                width: NODULE_SIZE,
                height: NODULE_SIZE,
                // FIXED POSITION — NO PHYSICS
                left: `calc(50% + ${pos.x}px - ${NODULE_SIZE / 2}px)`,
                top: `calc(50% + ${pos.y}px - ${NODULE_SIZE / 2}px)`,
                zIndex: 9999, // ABSOLUTE FRONT
                touchAction: 'manipulation',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: isSelected ? 1.15 : 1,
              }}
              transition={{ 
                delay: idx * 0.08,
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              onClick={() => handleNoduleTap(sat)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`satellite-${sat.id}`}
            >
              {/* Nodule Container */}
              <div
                className="w-full h-full rounded-full flex flex-col items-center justify-center relative"
                style={{
                  background: isSelected 
                    ? `${sat.color}30`
                    : 'rgba(10, 10, 18, 0.85)',
                  // INSET GLOW — Light stays INSIDE the button boundaries
                  border: `2px solid ${sat.color}`,
                  boxShadow: isSelected
                    ? `0 0 20px ${sat.color}60, inset 0 0 15px ${sat.color}30`
                    : `inset 0 0 10px ${sat.color}20`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Icon */}
                <Icon 
                  size={NODULE_SIZE * 0.35} 
                  style={{ color: sat.color }} 
                />
                
                {/* Label */}
                <span
                  className="text-center font-medium mt-1"
                  style={{
                    fontSize: 9,
                    color: sat.color,
                    letterSpacing: '0.05em',
                    maxWidth: NODULE_SIZE - 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sat.label}
                </span>
              </div>

              {/* Iridescent Touch Feedback Ring */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: `1px solid ${sat.color}`,
                }}
                initial={{ scale: 1, opacity: 0 }}
                whileTap={{
                  scale: 1.4,
                  opacity: [0, 0.8, 0],
                  transition: { duration: 0.3 },
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <motion.p 
        className="absolute bottom-4 text-center pointer-events-none px-4"
        style={{ 
          fontSize: 10, 
          color: 'rgba(212, 175, 55, 0.3)',
          letterSpacing: '0.1em',
          zIndex: 100,
        }}
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1 }}
      >
        tap any module to enter • tap center for menu
      </motion.p>

      {/* Mission Control Modal */}
      <MissionControl 
        isOpen={missionControlOpen} 
        onClose={() => setMissionControlOpen(false)} 
      />

      {/* CSS Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
