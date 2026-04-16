import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSensory } from '../context/SensoryContext';
import { Leaf, ArrowRightLeft, BookOpen, Star, Orbit } from 'lucide-react';

const ORBITAL_PAGES = [
  { path: '/botany-orbital', label: 'Botany', icon: Leaf, color: '#22C55E' },
  { path: '/trade-orbital', label: 'Trade', icon: ArrowRightLeft, color: '#C084FC' },
  { path: '/codex-orbital', label: 'Codex', icon: BookOpen, color: '#A78BFA' },
  { path: '/hub', label: 'Hub', icon: Orbit, color: '#818CF8' },
  { path: '/starchart', label: 'Stars', icon: Star, color: '#FBBF24' },
];

/**
 * OrbitalTransitionPortal — Smooth wormhole effect between orbital pages.
 * Renders a persistent nav ring at the bottom of orbital pages.
 * Click a destination → wormhole zoom transition → navigate.
 */
export function OrbitalTransitionPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playSingingBowl } = useSensory();
  const [transitioning, setTransitioning] = useState(null);

  const currentPath = location.pathname;

  const handleTransition = useCallback((target) => {
    if (target.path === currentPath || transitioning) return;
    setTransitioning(target.path);
    playSingingBowl(528); // Transition tone

    // Delay navigation for wormhole animation
    setTimeout(() => {
      navigate(target.path);
      setTimeout(() => setTransitioning(null), 300);
    }, 600);
  }, [currentPath, navigate, transitioning, playSingingBowl]);

  return (
    <>
      {/* Wormhole overlay during transition */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: '#06060e' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Wormhole rings */}
            {[0, 1, 2, 3, 4].map(i => {
              const target = ORBITAL_PAGES.find(p => p.path === transitioning);
              const color = target?.color || '#A78BFA';
              return (
                <motion.div key={i}
                  className="absolute rounded-full"
                  style={{
                    border: `1px solid ${color}`,
                    opacity: 0.15 - i * 0.02,
                  }}
                  initial={{ width: 20, height: 20, opacity: 0 }}
                  animate={{
                    width: [20, 600 + i * 100],
                    height: [20, 600 + i * 100],
                    opacity: [0.3 - i * 0.05, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.08,
                    ease: 'easeOut',
                  }}
                />
              );
            })}
            {/* Center label */}
            <motion.p
              className="text-[11px] uppercase tracking-[0.3em] font-light z-10"
              style={{
                color: ORBITAL_PAGES.find(p => p.path === transitioning)?.color || '#A78BFA',
                fontFamily: 'Cormorant Garamond, serif',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
            >
              {ORBITAL_PAGES.find(p => p.path === transitioning)?.label || 'Traversing'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation ring */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1"
        data-testid="orbital-transition-portal">
        {ORBITAL_PAGES.map(page => {
          const isCurrent = currentPath === page.path;
          const Icon = page.icon;
          return (
            <motion.button
              key={page.path}
              onClick={() => handleTransition(page)}
              className="relative flex items-center gap-1 rounded-full transition-all"
              style={{
                padding: isCurrent ? '5px 12px' : '5px 8px',
                background: isCurrent ? `${page.color}12` : 'rgba(0,0,0,0)',
                border: `1px solid ${isCurrent ? page.color + '30' : 'rgba(248,250,252,0.04)'}`,
                backdropFilter: 'blur(12px)',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`portal-${page.label.toLowerCase()}`}
            >
              <Icon size={11} style={{ color: isCurrent ? page.color : 'rgba(248,250,252,0.25)' }} />
              {isCurrent && (
                <motion.span
                  className="text-[7px] uppercase tracking-wider font-medium"
                  style={{ color: page.color }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                >
                  {page.label}
                </motion.span>
              )}
              {isCurrent && (
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 w-1 h-1 rounded-full -translate-x-1/2"
                  style={{ background: page.color, boxShadow: `0 0 4px ${page.color}` }}
                  layoutId="portal-indicator"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </>
  );
}
