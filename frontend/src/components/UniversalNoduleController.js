/**
 * UNIVERSAL NODULE CONTROLLER — React Wrapper
 * 
 * Bridges the vanilla JS NoduleMissionControl with React.
 * Handles lifecycle, events, and state synchronization.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import NoduleMissionControl from '../utils/NoduleMissionControl';
import { useHarmonicResonance } from '../utils/HarmonicResonance';
import { useNavigate } from 'react-router-dom';

const UniversalNoduleController = ({
  nodules = [],
  totalNodules = 12,
  baseRadius = 280,
  autoRotate = true,
  rotationSpeed = 0.1,
  onNoduleClick,
  className = '',
}) => {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const navigate = useNavigate();
  const { resonance, frequencyData } = useHarmonicResonance();

  // Handle nodule clicks
  const handleNoduleClick = useCallback((e) => {
    const detail = e.detail;
    if (onNoduleClick) {
      onNoduleClick(detail);
    } else if (detail.path) {
      navigate(detail.path);
    }
  }, [onNoduleClick, navigate]);

  // Initialize controller
  useEffect(() => {
    if (!containerRef.current) return;

    // Generate unique ID for container
    const containerId = `unc-${Math.random().toString(36).substr(2, 9)}`;
    containerRef.current.id = containerId;

    // Prepare nodule data
    const noduleData = nodules.length > 0 ? nodules : undefined;

    // Initialize
    controllerRef.current = NoduleMissionControl.init(containerId, {
      totalNodules: nodules.length || totalNodules,
      baseRadius,
      autoRotate,
      rotationSpeed,
      nodules: noduleData,
    });

    // Listen for nodule clicks
    containerRef.current.addEventListener('nodule-click', handleNoduleClick);
    containerRef.current.addEventListener('core-click', () => {
      console.log('[UNC React]: Core clicked');
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('nodule-click', handleNoduleClick);
      }
      if (controllerRef.current) {
        controllerRef.current.destroy();
      }
    };
  }, [nodules, totalNodules, baseRadius, autoRotate, rotationSpeed, handleNoduleClick]);

  // Sync resonance with controller
  useEffect(() => {
    if (resonance && frequencyData) {
      NoduleMissionControl.setResonance(resonance, frequencyData.name);
    } else {
      NoduleMissionControl.setResonance(null, null);
    }
  }, [resonance, frequencyData]);

  return (
    <div 
      ref={containerRef}
      className={`unc-react-wrapper ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
      }}
    />
  );
};

export default UniversalNoduleController;
