/**
 * ENLIGHTEN.MINT.CAFE - UNIFIED SINGULARITY React Wrapper
 * Complete hub experience with volumetric matrix, crystal core, and Fibonacci nodules.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedSingularity from '../systems/UnifiedSingularity';

const UnifiedSingularityHub = ({ 
  onNoduleActivate,
  onCrystalActivate,
  className = '',
}) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const initialized = useRef(false);

  const navigatingRef = useRef(false);

  const handleNoduleActivate = useCallback((e) => {
    const { id, path, freq, label } = e.detail;
    
    if (onNoduleActivate) {
      onNoduleActivate({ id, path, freq, label });
    } else if (path) {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      setTimeout(() => {
        navigate(path);
        navigatingRef.current = false;
      }, 200);
    }
  }, [navigate, onNoduleActivate]);

  const handleCrystalActivate = useCallback(() => {
    if (onCrystalActivate) {
      onCrystalActivate();
    }
  }, [onCrystalActivate]);

  useEffect(() => {
    if (initialized.current) return;

    if (containerRef.current) {
      containerRef.current.id = 'stage-master';
    }

    UnifiedSingularity.init('stage-master');
    initialized.current = true;

    window.addEventListener('nodule-activate', handleNoduleActivate);
    window.addEventListener('crystal-activate', handleCrystalActivate);

    return () => {
      window.removeEventListener('nodule-activate', handleNoduleActivate);
      window.removeEventListener('crystal-activate', handleCrystalActivate);
      UnifiedSingularity.destroy();
      initialized.current = false;
    };
  }, [handleNoduleActivate, handleCrystalActivate]);

  return (
    <div 
      ref={containerRef}
      className={`unified-singularity-hub ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
      }}
    />
  );
};

export const useUnifiedSingularity = () => ({
  playResonance: (freq, duration) => UnifiedSingularity.playResonance(freq, duration),
  showStatus: (text) => UnifiedSingularity.showStatus(text),
  getConfig: () => UnifiedSingularity.getConfig(),
});

export default UnifiedSingularityHub;
