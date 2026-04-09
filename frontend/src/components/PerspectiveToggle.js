/**
 * PerspectiveToggle.js — Frequency Engine UI Component
 * Allows users to switch between INTENSE, CALM, ZENITH, and VOID perspectives
 */

import React, { useState, useEffect } from 'react';
import ENLIGHTEN_SYSTEM from '../utils/SovereignMasterController';

const PERSPECTIVES = [
  { mode: 'INTENSE', color: '#FF0000', label: 'Intense' },
  { mode: 'CALM', color: '#22d3ee', label: 'Calm' },
  { mode: 'ZENITH', color: '#FFD700', label: 'Zenith' },
  { mode: 'VOID', color: '#FFFFFF', label: 'Void' },
];

export default function PerspectiveToggle() {
  const [currentPerspective, setCurrentPerspective] = useState(
    () => localStorage.getItem('cafe_perspective') || 'VOID'
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Listen for perspective shifts from other sources
    const handleShift = (e) => {
      setCurrentPerspective(e.detail.mode);
    };
    window.addEventListener('PERSPECTIVE_SHIFT', handleShift);
    return () => window.removeEventListener('PERSPECTIVE_SHIFT', handleShift);
  }, []);

  const handleToggle = (mode) => {
    ENLIGHTEN_SYSTEM.toggle(mode);
    setCurrentPerspective(mode);
    setIsExpanded(false);
  };

  const currentConfig = PERSPECTIVES.find(p => p.mode === currentPerspective);

  return (
    <div 
      className="perspective-toggle"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      data-testid="perspective-toggle"
    >
      {isExpanded ? (
        // Expanded: Show all options
        PERSPECTIVES.map(({ mode, color, label }) => (
          <button
            key={mode}
            className={`perspective-btn ${currentPerspective === mode ? 'active' : ''}`}
            data-mode={mode}
            onClick={() => handleToggle(mode)}
            title={label}
            style={{ background: color }}
            data-testid={`perspective-btn-${mode.toLowerCase()}`}
          />
        ))
      ) : (
        // Collapsed: Show only current
        <button
          className="perspective-btn active"
          data-mode={currentPerspective}
          onClick={() => setIsExpanded(true)}
          title={`Current: ${currentConfig?.label}`}
          style={{ background: currentConfig?.color }}
          data-testid="perspective-btn-current"
        />
      )}
    </div>
  );
}
