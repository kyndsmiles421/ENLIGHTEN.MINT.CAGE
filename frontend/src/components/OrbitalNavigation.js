import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SovereignCrossbar from './SovereignCrossbar';
import NebulaPlayground from './NebulaPlayground';
import SovereignHUD from './SovereignHUD';
import { useAuth } from '../context/AuthContext';

const EXCLUDED_PATHS = ['/', '/auth', '/intro'];

// ━━━ Orbital Navigation System — Crossbar + Spheres + HUD ━━━
export default function OrbitalNavigation() {
  const { token } = useAuth();
  const location = useLocation();
  const [detachedModules, setDetachedModules] = useState([]);
  const [launchVelocities, setLaunchVelocities] = useState({});

  const handleModuleDetach = useCallback((module, launchVelocity) => {
    setDetachedModules(prev => {
      if (prev.some(m => m.id === module.id)) return prev;
      return [...prev, module];
    });
    // Store launch velocity from repulsion sling-shot
    if (launchVelocity) {
      setLaunchVelocities(prev => ({ ...prev, [module.id]: launchVelocity }));
    }
  }, []);

  const handleModuleReattach = useCallback((module) => {
    setDetachedModules(prev => prev.filter(m => m.id !== module.id));
    setLaunchVelocities(prev => { const n = { ...prev }; delete n[module.id]; return n; });
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
      />
      <SovereignHUD />
    </>
  );
}
