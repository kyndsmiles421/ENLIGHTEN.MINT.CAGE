/**
 * ENLIGHTEN.MINT.CAFE - CRYSTAL SINGULARITY React Component
 * The ultimate unified hub experience.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EnlightenMintCafe from '../systems/CrystalSingularity';

const CrystalSingularityHub = ({ 
  onNoduleActivate,
  onCoreClick,
  className = '',
}) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const initialized = useRef(false);

  // Handle nodule activation
  const handleNoduleActivate = useCallback((e) => {
    const { id, path, freq, label } = e.detail;
    
    if (onNoduleActivate) {
      onNoduleActivate({ id, path, freq, label });
    } else if (path) {
      // Delay navigation for visual effect
      setTimeout(() => navigate(path), 500);
    }
  }, [navigate, onNoduleActivate]);

  // Handle crystal core click
  const handleCoreClick = useCallback(() => {
    if (onCoreClick) {
      onCoreClick();
    }
  }, [onCoreClick]);

  useEffect(() => {
    if (initialized.current) return;

    // Set container ID
    if (containerRef.current) {
      containerRef.current.id = 'stage-master';
    }

    // Initialize the system
    EnlightenMintCafe.init('stage-master');
    initialized.current = true;

    // Listen for events
    window.addEventListener('nodule-activate', handleNoduleActivate);
    window.addEventListener('crystal-core-click', handleCoreClick);

    return () => {
      window.removeEventListener('nodule-activate', handleNoduleActivate);
      window.removeEventListener('crystal-core-click', handleCoreClick);
      EnlightenMintCafe.destroy();
      initialized.current = false;
    };
  }, [handleNoduleActivate, handleCoreClick]);

  return (
    <div 
      ref={containerRef}
      className={`crystal-singularity-hub ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
      }}
    />
  );
};

// Hook for external control
export const useCrystalSingularity = () => {
  return {
    triggerResonance: (freq, duration) => EnlightenMintCafe.triggerResonance(freq, duration),
    triggerChord: (freqs, duration) => EnlightenMintCafe.triggerChord(freqs, duration),
    spawnParticles: (x, y, color, count) => EnlightenMintCafe.spawnParticles(x, y, color, count),
    showStatus: (text) => EnlightenMintCafe.showStatus(text),
    pause: () => EnlightenMintCafe.pause(),
    resume: () => EnlightenMintCafe.resume(),
    getConfig: () => EnlightenMintCafe.getConfig(),
  };
};

export default CrystalSingularityHub;
