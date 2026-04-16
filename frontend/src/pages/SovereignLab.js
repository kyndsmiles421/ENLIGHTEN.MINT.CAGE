/**
 * SovereignLab.js — Physics Visualization Laboratory
 * Route: /lab
 * 
 * Interactive showcase of all Sovereign physics engines:
 * - SovereignCore (Unified refraction + stabilization)
 * - StabilizerCanvas (Gold Layer physics)
 * - RefractionEngine (Rainbow split)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ShambhalaToolbar from '../components/ShambhalaToolbar';

export default function SovereignLab() {
  const navigate = useNavigate();
  const [activeEngine, setActiveEngine] = useState(null);
  const [stats, setStats] = useState({ particles: 0, depth: 0 });
  const [shambhalaSettings, setShambhalaSettings] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.SovereignCore) window.SovereignCore.destroy?.();
      if (window.StabilizerCanvas) window.StabilizerCanvas.destroy?.();
      if (window.RefractionEngine) window.RefractionEngine.destroy?.();
    };
  }, []);

  const launchCore = useCallback(() => {
    // Cleanup others
    window.StabilizerCanvas?.destroy?.();
    window.RefractionEngine?.destroy?.();
    
    // Launch SovereignCore and auto-ignite
    window.SovereignCore?.init?.();
    window.SovereignCore?.burst?.(0, 0, 7); // Auto-burst on launch
    setActiveEngine('core');
  }, []);

  const launchStabilizer = useCallback(() => {
    window.SovereignCore?.destroy?.();
    window.RefractionEngine?.destroy?.();
    
    window.StabilizerCanvas?.init?.();
    setActiveEngine('stabilizer');
  }, []);

  const launchRefraction = useCallback(() => {
    window.SovereignCore?.destroy?.();
    window.StabilizerCanvas?.destroy?.();
    
    window.RefractionEngine?.init?.().start?.();
    setActiveEngine('refraction');
  }, []);

  const attestCeremony = useCallback(() => {
    if (window.SovereignCore) {
      const key = window.SovereignCore.attest();
      alert(`Ceremony Attested!\n\nKey: ${key}`);
    }
  }, []);

  const burstParticles = useCallback(() => {
    if (activeEngine === 'core') {
      window.SovereignCore?.burst?.(7);
    } else if (activeEngine === 'refraction') {
      window.RefractionEngine?.burst?.(0, 0, 7);
    }
  }, [activeEngine]);

  const closeAll = useCallback(() => {
    window.SovereignCore?.destroy?.();
    window.StabilizerCanvas?.destroy?.();
    window.RefractionEngine?.destroy?.();
    setActiveEngine(null);
  }, []);

  return (
    <div className="sovereign-lab" data-testid="sovereign-lab">
      {/* Shambhala Master Mixer Toolbar */}
      <ShambhalaToolbar 
        isActive={activeEngine === 'core'} 
        onSettingsChange={setShambhalaSettings}
      />

      {/* Header */}
      <header className="lab-header" style={{ marginTop: activeEngine === 'core' ? '60px' : '0' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>
        <h1>SOVEREIGN PHYSICS LAB</h1>
        <span className="version">V2.88</span>
        <button 
          className="download-btn" 
          onClick={() => {
            const canvas = document.getElementById('sovereignCanvas') || 
                          document.getElementById('coreCanvas') ||
                          document.getElementById('refractionCanvas');
            if (canvas) {
              const link = document.createElement('a');
              link.download = `sovereign-physics-${Date.now()}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
            } else {
              alert('Launch an engine first to capture');
            }
          }}
          data-testid="download-btn"
        >
          ↓ DOWNLOAD
        </button>
      </header>

      {/* Engine Selector */}
      <div className="engine-selector">
        <button 
          className={`engine-btn ${activeEngine === 'core' ? 'active' : ''}`}
          onClick={launchCore}
          data-testid="launch-core"
        >
          <span className="icon">◈</span>
          <span className="label">SOVEREIGN CORE</span>
          <span className="desc">Unified Physics</span>
        </button>

        <button 
          className={`engine-btn ${activeEngine === 'stabilizer' ? 'active' : ''}`}
          onClick={launchStabilizer}
          data-testid="launch-stabilizer"
        >
          <span className="icon">◎</span>
          <span className="label">STABILIZER</span>
          <span className="desc">Gold Layer</span>
        </button>

        <button 
          className={`engine-btn ${activeEngine === 'refraction' ? 'active' : ''}`}
          onClick={launchRefraction}
          data-testid="launch-refraction"
        >
          <span className="icon">◇</span>
          <span className="label">REFRACTION</span>
          <span className="desc">Rainbow Split</span>
        </button>
      </div>

      {/* Controls */}
      {activeEngine && (
        <div className="engine-controls">
          <button className="control-btn burst" onClick={burstParticles}>
            BURST (7)
          </button>
          {activeEngine === 'core' && (
            <button className="control-btn attest" onClick={attestCeremony}>
              ATTEST
            </button>
          )}
          <button className="control-btn close" onClick={closeAll}>
            CLOSE
          </button>
        </div>
      )}

      {/* Info Panel */}
      <div className="info-panel">
        <h3>PHYSICS CONSTANTS</h3>
        <div className="constants">
          <div className="const-item">
            <span className="const-label">R_LIMIT</span>
            <span className="const-value">47.94</span>
          </div>
          <div className="const-item">
            <span className="const-label">GOLD_VISCOSITY</span>
            <span className="const-value">0.05</span>
          </div>
          <div className="const-item">
            <span className="const-label">DAMPING</span>
            <span className="const-value">0.82</span>
          </div>
          <div className="const-item">
            <span className="const-label">K_INVERSE</span>
            <span className="const-value">0.15</span>
          </div>
          <div className="const-item">
            <span className="const-label">GOLDEN_ANGLE</span>
            <span className="const-value">137.508°</span>
          </div>
        </div>
      </div>

      <style>{`
        .sovereign-lab {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          color: white;
          font-family: 'SF Mono', monospace;
          padding: 20px;
        }

        .lab-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
        }

        .lab-header h1 {
          font-size: 24px;
          letter-spacing: 0.2em;
          color: #fbc02d;
          flex: 1;
        }

        .version {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          flex: 1;
        }

        .download-btn {
          background: rgba(0, 255, 204, 0.1);
          border: 1px solid #00FFCC;
          color: #00FFCC;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.1em;
          transition: all 0.2s;
        }

        .download-btn:hover {
          background: rgba(0, 255, 204, 0.2);
          transform: scale(1.05);
        }

        .back-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.6);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.6);
        }

        .engine-selector {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .engine-btn {
          background: rgba(0,0,0,0.15);
          border: 1px solid rgba(251,192,45,0.3);
          padding: 20px 30px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 150px;
        }

        .engine-btn:hover {
          border-color: #fbc02d;
          transform: translateY(-2px);
        }

        .engine-btn.active {
          background: rgba(251,192,45,0.15);
          border-color: #fbc02d;
          box-shadow: 0 0 30px rgba(251,192,45,0.2);
        }

        .engine-btn .icon {
          font-size: 32px;
          color: #fbc02d;
        }

        .engine-btn .label {
          font-size: 14px;
          letter-spacing: 0.1em;
          color: white;
        }

        .engine-btn .desc {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
        }

        .engine-controls {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .control-btn {
          background: rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.6);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.1em;
          transition: all 0.2s;
        }

        .control-btn:hover {
          transform: scale(1.05);
        }

        .control-btn.burst {
          border-color: #00FFCC;
          color: #00FFCC;
        }

        .control-btn.attest {
          border-color: #fbc02d;
          color: #fbc02d;
        }

        .control-btn.close {
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        .info-panel {
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: rgba(0,0,0,0.15);
          border: 1px solid rgba(251,192,45,0.3);
          border-radius: 12px;
          padding: 20px;
          max-width: 250px;
        }

        .info-panel h3 {
          font-size: 11px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.5);
          margin-bottom: 15px;
        }

        .constants {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .const-item {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }

        .const-label {
          color: rgba(255,255,255,0.5);
        }

        .const-value {
          color: #00FFCC;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
