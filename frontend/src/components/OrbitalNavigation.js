import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SovereignCrossbar from './SovereignCrossbar';
import NebulaPlayground from './NebulaPlayground';
import SovereignHUD from './SovereignHUD';
import { useAuth } from '../context/AuthContext';

// Pages where the crossbar should NOT appear
const EXCLUDED_PATHS = ['/', '/auth', '/intro'];

// ━━━ Orbital Navigation System — Crossbar + Spheres + HUD ━━━
export default function OrbitalNavigation() {
  const { token } = useAuth();
  const location = useLocation();
  const [detachedModules, setDetachedModules] = useState([]);

  const handleModuleDetach = useCallback((module) => {
    setDetachedModules(prev => {
      if (prev.some(m => m.id === module.id)) return prev;
      return [...prev, module];
    });
  }, []);

  const handleModuleReattach = useCallback((module) => {
    setDetachedModules(prev => prev.filter(m => m.id !== module.id));
  }, []);

  // Only show for authenticated users on non-excluded pages
  if (!token || EXCLUDED_PATHS.includes(location.pathname)) return null;

  return (
    <>
      <SovereignCrossbar
        onModuleDetach={handleModuleDetach}
        detachedModules={detachedModules}
      />
      <NebulaPlayground
        detachedModules={detachedModules}
        onModuleReattach={handleModuleReattach}
      />
      <SovereignHUD />
    </>
  );
}
