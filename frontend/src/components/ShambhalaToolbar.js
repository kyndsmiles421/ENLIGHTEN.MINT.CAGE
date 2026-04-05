/**
 * SHAMBHALA MASTER MIXER TOOLBAR
 * Logic: Global Physics Override
 * Location: Top of SovereignLab / Floating control panel
 */

import React, { useState, useCallback, useEffect } from 'react';

const ShambhalaToolbar = ({ onSettingsChange, isActive = false }) => {
  const [settings, setSettings] = useState({
    goldViscosity: 0.05,
    silverTension: 0.005,
    copperConduction: 0.08,
    rainbowFlow: true,
    silverWebVisible: true
  });

  const [status, setStatus] = useState('SHAMBHALA_FLOW_ACTIVE');

  // Propagate settings to parent/global
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    // Update global SovereignCore if available
    if (window.SovereignCore?.CONFIG) {
      window.SovereignCore.CONFIG.VISCOSITY = settings.goldViscosity;
      window.SovereignCore.CONFIG.TENSION = settings.copperConduction;
    }
  }, [settings, onSettingsChange]);

  const updateGold = useCallback((value) => {
    const val = parseFloat(value);
    setSettings(prev => ({ ...prev, goldViscosity: val }));
    setStatus(`GOLD_VISCOSITY → ${val.toFixed(3)}`);
  }, []);

  const toggleSilver = useCallback(() => {
    setSettings(prev => {
      const newVal = !prev.silverWebVisible;
      setStatus(newVal ? 'SILVER_WEB_ENABLED' : 'SILVER_WEB_DISABLED');
      return { ...prev, silverWebVisible: newVal };
    });
  }, []);

  const updateCopper = useCallback((value) => {
    const val = parseFloat(value);
    setSettings(prev => ({ ...prev, copperConduction: val }));
    setStatus(`COPPER_CONDUCTION → ${val.toFixed(3)}`);
  }, []);

  const igniteCopper = useCallback(() => {
    // Reset conduits - burst particles from center
    if (window.SovereignCore) {
      window.SovereignCore.clear?.();
      window.SovereignCore.burst?.(7);
      setStatus('CONDUITS_RESET → 7 PARTICLES');
    }
  }, []);

  const toggleRainbow = useCallback(() => {
    setSettings(prev => {
      const newVal = !prev.rainbowFlow;
      setStatus(newVal ? 'RAINBOW_FLOW_ACTIVE' : 'RAINBOW_FLOW_PAUSED');
      return { ...prev, rainbowFlow: newVal };
    });
  }, []);

  if (!isActive) return null;

  return (
    <div id="shambhala-toolbar" data-testid="shambhala-toolbar" style={styles.toolbar}>
      {/* Gold Control */}
      <div style={styles.controlGroup}>
        <label style={styles.label}>
          <span style={{ color: '#fbc02d' }}>◆</span> GOLD (Boundary)
        </label>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={settings.goldViscosity}
          onChange={(e) => updateGold(e.target.value)}
          style={styles.slider}
          data-testid="gold-slider"
        />
        <span style={styles.value}>{settings.goldViscosity.toFixed(2)}</span>
      </div>

      {/* Silver Control */}
      <div style={styles.controlGroup}>
        <label style={styles.label}>
          <span style={{ color: '#C0C0C0' }}>◇</span> SILVER (Web)
        </label>
        <button
          onClick={toggleSilver}
          style={{
            ...styles.toggleBtn,
            background: settings.silverWebVisible ? 'rgba(192,192,192,0.3)' : 'transparent'
          }}
          data-testid="silver-toggle"
        >
          {settings.silverWebVisible ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Copper Control */}
      <div style={styles.controlGroup}>
        <label style={styles.label}>
          <span style={{ color: '#B87333' }}>●</span> COPPER (Ground)
        </label>
        <input
          type="range"
          min="0"
          max="0.2"
          step="0.005"
          value={settings.copperConduction}
          onChange={(e) => updateCopper(e.target.value)}
          style={styles.slider}
          data-testid="copper-slider"
        />
        <span style={styles.value}>{settings.copperConduction.toFixed(3)}</span>
        <button
          onClick={igniteCopper}
          style={styles.resetBtn}
          data-testid="reset-conduits"
        >
          RESET
        </button>
      </div>

      {/* Rainbow Flow */}
      <div style={styles.controlGroup}>
        <label style={styles.label}>
          <span style={{ color: '#ff6b6b' }}>⬡</span> RAINBOW
        </label>
        <button
          onClick={toggleRainbow}
          style={{
            ...styles.toggleBtn,
            background: settings.rainbowFlow 
              ? 'linear-gradient(90deg, #ff6b6b, #fbc02d, #00ff88, #00ffcc, #6b6bff)' 
              : 'transparent'
          }}
          data-testid="rainbow-toggle"
        >
          {settings.rainbowFlow ? 'FLOW' : 'PAUSE'}
        </button>
      </div>

      {/* Status Display */}
      <div style={styles.statusDisplay} data-testid="shambhala-status">
        STATUS: {status}
      </div>
    </div>
  );
};

const styles = {
  toolbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '50px',
    borderBottom: '3px solid #fbc02d',
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 9999,
    fontFamily: "'SF Mono', monospace",
    fontSize: '11px',
    backdropFilter: 'blur(10px)'
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  slider: {
    width: '80px',
    height: '4px',
    appearance: 'none',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '2px',
    cursor: 'pointer'
  },
  value: {
    color: '#00FFCC',
    minWidth: '45px',
    textAlign: 'right'
  },
  toggleBtn: {
    padding: '4px 12px',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '10px',
    letterSpacing: '0.1em',
    transition: 'all 0.2s'
  },
  resetBtn: {
    padding: '4px 10px',
    border: '1px solid #B87333',
    borderRadius: '4px',
    background: 'rgba(184,115,51,0.2)',
    color: '#B87333',
    cursor: 'pointer',
    fontSize: '10px',
    letterSpacing: '0.05em'
  },
  statusDisplay: {
    color: '#00FFCC',
    letterSpacing: '0.1em',
    padding: '6px 12px',
    border: '1px solid rgba(0,255,204,0.3)',
    borderRadius: '4px',
    background: 'rgba(0,255,204,0.05)'
  }
};

export default ShambhalaToolbar;
