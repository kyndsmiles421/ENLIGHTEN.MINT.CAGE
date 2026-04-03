import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SovereignCrossbar from './SovereignCrossbar';
import NebulaPlayground from './NebulaPlayground';
import SovereignHUD from './SovereignHUD';
import BubblePortal from './BubblePortal';
import { useAuth } from '../context/AuthContext';
import { useSovereign } from '../context/SovereignContext';

const EXCLUDED_PATHS = ['/', '/auth', '/intro'];

// ━━━ Orbital Navigation System — Crossbar + Spheres + HUD + Bubble Portal ━━━
export default function OrbitalNavigation() {
  const { token } = useAuth();
  const { gravityMultiplier, bloomMultiplier } = useSovereign();
  const location = useLocation();
  const [detachedModules, setDetachedModules] = useState([]);
  const [launchVelocities, setLaunchVelocities] = useState({});

  // Bubble Portal state
  const [activeBubbles, setActiveBubbles] = useState([]);
  const [bubbleOrigin, setBubbleOrigin] = useState(null);

  const handleModuleDetach = useCallback((module, launchVelocity) => {
    setDetachedModules(prev => {
      if (prev.some(m => m.id === module.id)) return prev;
      return [...prev, module];
    });
    if (launchVelocity) {
      setLaunchVelocities(prev => ({ ...prev, [module.id]: launchVelocity }));
    }
  }, []);

  const handleModuleReattach = useCallback((module) => {
    setDetachedModules(prev => prev.filter(m => m.id !== module.id));
    setLaunchVelocities(prev => { const n = { ...prev }; delete n[module.id]; return n; });
    // Also remove from active bubbles if present
    setActiveBubbles(prev => prev.filter(m => m.id !== module.id));
  }, []);

  // Bubble Burst — double-tap on sphere expands to full-screen portal
  const handleBubbleActivate = useCallback((module, origin) => {
    setBubbleOrigin(origin);
    setActiveBubbles(prev => {
      if (prev.some(m => m.id === module.id)) return prev;
      return [...prev, module];
    });
  }, []);

  const handleCloseBubble = useCallback((module) => {
    setActiveBubbles(prev => prev.filter(m => m.id !== module.id));
  }, []);

  const handleCloseAll = useCallback(() => {
    setActiveBubbles([]);
  }, []);

  if (!token || EXCLUDED_PATHS.includes(location.pathname)) return null;

  return (
    <>
      <SovereignCrossbar
        onModuleDetach={handleModuleDetach}
        detachedModules={detachedModules}
        vacuumActive={false}
      />
      <NebulaPlayground
        detachedModules={detachedModules}
        onModuleReattach={handleModuleReattach}
        launchVelocities={launchVelocities}
        gravityMultiplier={gravityMultiplier}
        bloomMultiplier={bloomMultiplier}
        onBubbleActivate={handleBubbleActivate}
      />
      <SovereignHUD />
      <BubblePortal
        activeBubbles={activeBubbles}
        onCloseBubble={handleCloseBubble}
        onCloseAll={handleCloseAll}
        originPosition={bubbleOrigin}
      />
    </>
  );
}
