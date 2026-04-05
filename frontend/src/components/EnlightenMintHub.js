/**
 * ENLIGHTEN.MINT.CAFE - React Integration Component
 * Wraps the unified system for use in React applications.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EnlightenMintSystem from '../systems/EnlightenMintSystem';

const EnlightenMintHub = ({ 
  onNoduleClick,
  onCoreClick,
  className = '',
}) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const systemInitialized = useRef(false);

  // Handle navigation events from the system
  const handleNavigate = useCallback((e) => {
    const { id, path, freq } = e.detail;
    
    if (onNoduleClick) {
      onNoduleClick({ id, path, freq });
    } else if (path) {
      navigate(path);
    }
  }, [navigate, onNoduleClick]);

  const handleCoreClick = useCallback(() => {
    if (onCoreClick) {
      onCoreClick();
    }
  }, [onCoreClick]);

  useEffect(() => {
    if (systemInitialized.current) return;
    
    // Set up container
    if (containerRef.current) {
      containerRef.current.id = 'master-hub';
    }

    // Initialize the system
    EnlightenMintSystem.init('master-hub');
    systemInitialized.current = true;

    // Listen for events
    window.addEventListener('enlighten-navigate', handleNavigate);
    window.addEventListener('enlighten-core-click', handleCoreClick);

    return () => {
      window.removeEventListener('enlighten-navigate', handleNavigate);
      window.removeEventListener('enlighten-core-click', handleCoreClick);
      EnlightenMintSystem.destroy();
      systemInitialized.current = false;
    };
  }, [handleNavigate, handleCoreClick]);

  return (
    <div 
      ref={containerRef}
      className={`enlighten-mint-hub ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
      }}
    />
  );
};

// Hook for external control
export const useEnlightenMint = () => {
  return {
    triggerResonance: (freq) => EnlightenMintSystem.triggerResonance(freq),
    spawnParticles: (x, y, color, count) => EnlightenMintSystem.spawnParticles(x, y, color, count),
    pause: () => EnlightenMintSystem.pause(),
    resume: () => EnlightenMintSystem.resume(),
    getConfig: () => EnlightenMintSystem.getConfig(),
  };
};

export default EnlightenMintHub;
