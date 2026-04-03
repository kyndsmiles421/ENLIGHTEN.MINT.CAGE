import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SovereignCrossbar from './SovereignCrossbar';
import NebulaPlayground from './NebulaPlayground';
import BubblePortal from './BubblePortal';
import { useAuth } from '../context/AuthContext';
import { useSovereign } from '../context/SovereignContext';
import { usePhonicResonance, usePredictiveSonicTug, ROUTE_FREQUENCIES } from '../hooks/usePhonicResonance';
import { useOrganicAudio } from '../hooks/useOrganicAudio';

const EXCLUDED_PATHS = ['/', '/auth', '/intro'];

// Phonic Resonance — ambient Web Audio wrapper (renders nothing)
function PhonicResonanceProvider({ enabled }) {
  usePhonicResonance(enabled, 0.025);
  return null;
}

// Organic Audio — route-based instrument textures (renders nothing)
function OrganicAudioProvider({ enabled }) {
  const location = useLocation();
  const { playAmbientForRoute, getInstrument } = useOrganicAudio(enabled);
  const lastRouteRef = React.useRef('');

  useEffect(() => {
    if (!enabled) return;
    const routeKey = location.pathname.replace('/', '').split('/')[0] || 'hub';
    if (routeKey === lastRouteRef.current) return;
    lastRouteRef.current = routeKey;

    const instrument = getInstrument(routeKey);
    if (instrument === 'synth') return; // Handled by PhonicResonance

    // Delay organic voice to layer after Solfeggio crossfade
    const timer = setTimeout(() => {
      const freq = ROUTE_FREQUENCIES[`/${routeKey}`] || ROUTE_FREQUENCIES.default || 432;
      playAmbientForRoute(routeKey, freq);
    }, 2500); // 2.5s after route change (after Solfeggio settles)

    return () => clearTimeout(timer);
  }, [location.pathname, enabled, playAmbientForRoute, getInstrument]);

  return null;
}

// Predictive Sonic Tug — cross-fade toward destination frequency
function SonicTugProvider({ enabled }) {
  usePredictiveSonicTug();
  return null;
}

// ━━━ Orbital Navigation System — Crossbar + Spheres + HUD + Bubble Portal + Phonic Resonance ━━━
export default function OrbitalNavigation() {
  const { token } = useAuth();
  const { gravityMultiplier, bloomMultiplier, masteryTier } = useSovereign();
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
    <div data-testid="orbital-navigation">
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
        masteryTier={masteryTier}
      />
      <BubblePortal
        activeBubbles={activeBubbles}
        onCloseBubble={handleCloseBubble}
        onCloseAll={handleCloseAll}
        originPosition={bubbleOrigin}
        masteryTier={masteryTier}
      />
      <PhonicResonanceProvider enabled={!!token} />
      <OrganicAudioProvider enabled={!!token} />
    </div>
  );
}
