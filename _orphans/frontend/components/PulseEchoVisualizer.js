import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeshNetwork } from '../context/MeshNetworkContext';

/**
 * PulseEchoVisualizer — Renders visual ripples across the mesh
 * 
 * When a task completes in one node, a "pulse echo" travels through
 * the mesh to connected nodes. This component renders those echoes
 * as subtle shimmer effects at the edges of the screen.
 * 
 * The intensity and color of each echo is determined by:
 * - Distance from source (fades with each hop)
 * - Sympathy weight (learned connections are brighter)
 */
export default function PulseEchoVisualizer() {
  const { activeEchoes, CONSTELLATION_NODES } = useMeshNetwork();
  
  if (!activeEchoes || activeEchoes.length === 0) return null;

  // Group echoes by hop for layered rendering
  const echosByHop = activeEchoes.reduce((acc, echo) => {
    const hop = echo.hop || 0;
    if (!acc[hop]) acc[hop] = [];
    acc[hop].push(echo);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 pointer-events-none z-[9985]" data-testid="pulse-echo-visualizer">
      <AnimatePresence>
        {Object.entries(echosByHop).map(([hop, echoes]) => (
          <EchoLayer key={`hop-${hop}`} echoes={echoes} hop={parseInt(hop)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * EchoLayer — Renders all echoes at a specific "hop" distance
 */
function EchoLayer({ echoes, hop }) {
  return (
    <>
      {echoes.map(echo => (
        <EchoRipple key={echo.id} echo={echo} />
      ))}
    </>
  );
}

/**
 * EchoRipple — Individual ripple animation
 */
function EchoRipple({ echo }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  // Calculate position based on target node category
  useEffect(() => {
    const node = echo.targetId;
    // Position based on category clusters
    const positions = {
      practice: { x: 15, y: 40 },
      divination: { x: 85, y: 30 },
      sanctuary: { x: 50, y: 80 },
      explore: { x: 75, y: 60 },
      today: { x: 25, y: 20 },
    };
    
    const { CONSTELLATION_NODES } = require('../context/MeshNetworkContext');
    const targetNode = CONSTELLATION_NODES[node];
    if (targetNode) {
      const pos = positions[targetNode.category] || { x: 50, y: 50 };
      // Add some randomness
      setPosition({
        x: pos.x + (Math.random() - 0.5) * 20,
        y: pos.y + (Math.random() - 0.5) * 20,
      });
    }
  }, [echo.targetId]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, echo.intensity * 0.6, 0],
        scale: [0.5, 2, 3],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.5,
        delay: echo.delay / 1000,
        ease: 'easeOut',
      }}
      className="absolute rounded-full"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: 80 + (echo.hop * 20),
        height: 80 + (echo.hop * 20),
        background: `radial-gradient(circle, ${echo.sourceColor}40 0%, ${echo.sourceColor}10 50%, transparent 70%)`,
        transform: 'translate(-50%, -50%)',
        filter: 'blur(8px)',
      }}
    />
  );
}

/**
 * EdgeShimmer — Renders a shimmer effect at screen edges
 * Used when an echo reaches a node the user might navigate to
 */
export function EdgeShimmer({ side = 'right', color = '#818CF8', intensity = 0.5 }) {
  const sideStyles = {
    top: { top: 0, left: '10%', right: '10%', height: '4px' },
    bottom: { bottom: 0, left: '10%', right: '10%', height: '4px' },
    left: { left: 0, top: '10%', bottom: '10%', width: '4px' },
    right: { right: 0, top: '10%', bottom: '10%', width: '4px' },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0, intensity, 0],
        scaleX: side === 'top' || side === 'bottom' ? [0.5, 1, 0.5] : 1,
        scaleY: side === 'left' || side === 'right' ? [0.5, 1, 0.5] : 1,
      }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="fixed"
      style={{
        ...sideStyles[side],
        background: `linear-gradient(${side === 'top' || side === 'bottom' ? 'to right' : 'to bottom'}, 
          transparent, ${color}, transparent)`,
        filter: 'blur(2px)',
      }}
    />
  );
}

/**
 * usePulseEchoListener — Hook for modules to react to incoming echoes
 */
export function usePulseEchoListener(nodeId, onEcho) {
  const { subscribeToPulses, PULSE_TYPES } = useMeshNetwork();

  useEffect(() => {
    const unsubscribe = subscribeToPulses(nodeId, (pulse) => {
      if (pulse.type === PULSE_TYPES.PULSE_ECHO) {
        onEcho?.(pulse);
      }
    });
    return unsubscribe;
  }, [nodeId, onEcho, subscribeToPulses, PULSE_TYPES]);
}

/**
 * NodeShimmer — Component to wrap a node and add shimmer on echo
 */
export function NodeShimmer({ nodeId, children }) {
  const [shimmerActive, setShimmerActive] = useState(false);
  const [shimmerColor, setShimmerColor] = useState('#818CF8');

  usePulseEchoListener(nodeId, (pulse) => {
    setShimmerColor(pulse.color || '#818CF8');
    setShimmerActive(true);
    setTimeout(() => setShimmerActive(false), 1500);
  });

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {shimmerActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${shimmerColor}30 0%, transparent 70%)`,
              filter: 'blur(4px)',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
