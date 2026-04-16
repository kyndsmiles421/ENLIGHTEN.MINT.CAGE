/**
 * MintingCeremony.js — Fractal Seed Minting Interface
 * 
 * Full visualization of the 54-layer L² Fractal Engine minting process.
 * Shows the SeedVisualizer growing as each layer computes.
 * Integrates V9 Quadruple Helix Rainbow Key encryption.
 * 
 * Route: /mint
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeedVisualizer, SeedVisualizerMini, useAnimatedLayerCount } from '../components/SeedVisualizer';
import SovereignStreamline, { useSovereignV7 } from '../utils/SovereignStreamlineV7';
import SovereignV9, { useSovereignV9 } from '../utils/SovereignV9';

export default function MintingCeremony() {
  const navigate = useNavigate();
  const [isMinting, setIsMinting] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [mintResult, setMintResult] = useState(null);
  const [seedInput, setSeedInput] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [useV9Mode, setUseV9Mode] = useState(true); // Enable V9 Crystalline mode by default
  
  // Use the V7 hook for base state management
  const { geoLock, ledger, startBinaural, stopBinaural, vectorState } = useSovereignV7();
  
  // Use V9 hook for Crystalline features
  const { 
    isLocked: isGoldenLocked, 
    masterProgress, 
    helixStrands,
    triggerCeremony: triggerV9Ceremony,
    renderSkeleton,
    removeSkeleton
  } = useSovereignV9();

  // Animated layer count for smooth visualization
  const displayLayer = useAnimatedLayerCount(currentLayer, 500);
  
  // Initialize touch points on mount (for Omni-Point interaction)
  useEffect(() => {
    // Check GPS geolock status
    SovereignStreamline.checkGeoLock();
    
    // Render crystalline skeleton if V9 mode
    if (useV9Mode) {
      renderSkeleton();
    }
    
    return () => {
      // Cleanup
      SovereignStreamline.removeTouchPoints?.();
      removeSkeleton();
    };
  }, [useV9Mode, renderSkeleton, removeSkeleton]);

  const toggleAudio = useCallback(() => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    // V7: Use binaural start/stop instead of setAudioEnabled
    if (newState) {
      startBinaural();
    } else {
      stopBinaural();
    }
  }, [audioEnabled, startBinaural, stopBinaural]);

  const startMinting = useCallback(async () => {
    if (!seedInput.trim()) return;

    setIsMinting(true);
    setCurrentLayer(0);
    setMintResult(null);

    // Subscribe to progress updates (V7)
    const unsubProgress = SovereignStreamline.on('ceremony-progress', (progress) => {
      setCurrentLayer(progress.layer);
    });

    try {
      let result;
      
      if (useV9Mode) {
        // V9 CRYSTALLINE MODE: Rainbow Key + Quadruple Helix
        console.log('[MintingCeremony] Using V9 Crystalline Mode');
        
        // First, run V7 ceremony for the 54-layer fractal
        const v7Result = await SovereignStreamline.startCeremony(seedInput, { 
          binaural: audioEnabled,
          depth: 54 
        });
        
        // Then, apply V9 Rainbow Key encryption
        const rainbowKey = await SovereignV9.generateRainbowKey(v7Result.hash);
        
        result = {
          ...v7Result,
          rainbowKey,
          encryption: 'QUAD_HELIX_REFRACTIVE',
          goldenLock: isGoldenLocked,
          masterProgress
        };
      } else {
        // Standard V7 ceremony
        result = await SovereignStreamline.startCeremony(seedInput, { 
          binaural: audioEnabled,
          depth: 54 
        });
      }
      
      setMintResult(result);
      setCurrentLayer(54);
    } catch (e) {
      console.error('Minting failed:', e);
    } finally {
      setIsMinting(false);
      unsubProgress();
    }
  }, [seedInput, audioEnabled, useV9Mode, isGoldenLocked, masterProgress]);

  const resetCeremony = useCallback(() => {
    setCurrentLayer(0);
    setMintResult(null);
    setSeedInput('');
  }, []);

  return (
    <div className="minting-ceremony">
      <div className="ceremony-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>
        <h1>SEED MINTING CEREMONY</h1>
        <div className="header-subtitle">L² FRACTAL ENGINE • 54 SUBLAYERS</div>
        <button 
          className={`audio-toggle ${audioEnabled ? 'enabled' : 'disabled'}`}
          onClick={toggleAudio}
          title={audioEnabled ? 'Mute ritual audio' : 'Enable ritual audio'}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="ceremony-main">
        {/* Visualizer */}
        <div className="visualizer-container">
          <SeedVisualizer 
            layerCount={displayLayer}
            active={isMinting || mintResult}
            total={54}
            size={300}
          />
        </div>

        {/* Input Section */}
        {!mintResult && (
          <div className="input-section">
            <label className="seed-label">SEED INTENTION</label>
            <input
              type="text"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="Enter your cosmic seed..."
              className="seed-input"
              disabled={isMinting}
            />
            <button 
              className="mint-btn"
              onClick={startMinting}
              disabled={isMinting || !seedInput.trim()}
            >
              {isMinting ? 'MINTING...' : 'BEGIN CEREMONY'}
            </button>
          </div>
        )}

        {/* Result Section */}
        {mintResult && (
          <div className="result-section">
            <div className="result-badge">
              {mintResult.encryption === 'QUAD_HELIX_REFRACTIVE' ? '✧ CRYSTALLIZED' : '✓ SEED MINTED'}
            </div>
            
            {/* Show Golden Lock status (V9) */}
            {mintResult.goldenLock && (
              <div className="geolock-badge golden">
                🏔️ BLACK HILLS GOLDEN LOCK ACTIVE
              </div>
            )}
            
            {/* Show GeoLock status (V7) */}
            {!mintResult.goldenLock && geoLock && geoLock !== 'UNKNOWN' && (
              <div className={`geolock-badge ${geoLock === 'GOLDEN_LOCK_ACTIVE' ? 'golden' : ''}`}>
                {geoLock === 'GOLDEN_LOCK_ACTIVE' ? '🏔️ BLACK HILLS CALIBRATED' : '🌍 STANDARD PHASE'}
              </div>
            )}
            
            {/* Rainbow Key (V9 Crystalline) */}
            {mintResult.rainbowKey && (
              <div className="result-rainbow">
                <label>RAINBOW KEY</label>
                <code className="rainbow-key">{mintResult.rainbowKey}</code>
                <div className="helix-indicator">
                  {helixStrands.map((strand, i) => (
                    <div 
                      key={strand.id} 
                      className="helix-strand" 
                      style={{ 
                        background: strand.color,
                        transform: `rotate(${strand.rotation}deg)`,
                        opacity: 0.5 + strand.refractiveIndex * 0.3
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="result-hash">
              <label>FRACTAL HASH</label>
              <code>{mintResult.hash}</code>
            </div>
            <div className="result-metrics">
              <div className="metric">
                <span className="metric-value">{mintResult.layers}</span>
                <span className="metric-label">LAYERS</span>
              </div>
              <div className="metric">
                <span className="metric-value">{mintResult.metrics?.computeTime || mintResult.metrics?.computeTimeMs || 0}ms</span>
                <span className="metric-label">COMPUTE</span>
              </div>
              <div className="metric">
                <span className="metric-value">{mintResult.metrics?.entropyScore || mintResult.metrics?.entropy || 0}</span>
                <span className="metric-label">ENTROPY</span>
              </div>
            </div>
            
            {/* Master Architect Progress */}
            {masterProgress && (
              <div className="master-progress">
                <div className="progress-label">
                  MASTER ARCHITECT: {masterProgress.current}/{masterProgress.required}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${masterProgress.percentage}%` }}
                  />
                </div>
                {masterProgress.isMaster && (
                  <div className="master-badge">✧ TIER UNLOCKED</div>
                )}
              </div>
            )}
            <div className="result-actions">
              <button className="action-btn attest" onClick={() => {
                SovereignStreamline.dispatch('center', 'WITNESS', {
                  intention: `Minted seed: ${seedInput}`,
                  hash: mintResult.hash
                });
              }}>
                ATTEST DEED
              </button>
              <button className="action-btn reset" onClick={resetCeremony}>
                MINT ANOTHER
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mini visualizers showing history from V7 ledger */}
      {ledger && ledger.length > 0 && (
        <div className="history-section">
          <h3>SOVEREIGN LEDGER</h3>
          <div className="history-list">
            {ledger.slice(0, 5).map((entry, i) => (
              <div key={i} className="history-item">
                <SeedVisualizerMini layerCount={54} total={54} size={40} />
                <span className="history-hash">{entry.hash?.slice(0, 16)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .minting-ceremony {
          min-height: 100vh;
          background: #000;
          color: white;
          padding: 20px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .ceremony-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .back-btn {
          position: absolute;
          left: 20px;
          top: 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.6);
          color: white;
          padding: 8px 16px;
          font-size: 11px;
          cursor: pointer;
          letter-spacing: 0.1em;
        }

        .back-btn:hover {
          border-color: #00FFC2;
          color: #00FFC2;
        }

        .audio-toggle {
          position: absolute;
          right: 20px;
          top: 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.6);
          padding: 8px 12px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .audio-toggle.enabled {
          border-color: #00FFC2;
        }

        .audio-toggle.disabled {
          border-color: rgba(255,255,255,0.1);
          opacity: 0.5;
        }

        .audio-toggle:hover {
          border-color: #A855F7;
        }

        .ceremony-header h1 {
          font-size: 18px;
          letter-spacing: 0.3em;
          font-weight: 300;
          margin: 0;
          color: #FFD700;
        }

        .header-subtitle {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.4);
          margin-top: 8px;
        }

        .ceremony-main {
          max-width: 400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .visualizer-container {
          display: flex;
          justify-content: center;
        }

        .input-section {
          width: 100%;
          text-align: center;
        }

        .seed-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.5);
          margin-bottom: 10px;
        }

        .seed-input {
          width: 100%;
          padding: 15px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-size: 14px;
          text-align: center;
          outline: none;
          transition: border-color 0.3s;
        }

        .seed-input:focus {
          border-color: #A855F7;
        }

        .seed-input::placeholder {
          color: rgba(255,255,255,0.65);
        }

        .mint-btn {
          margin-top: 20px;
          padding: 15px 40px;
          background: transparent;
          border: 2px solid #A855F7;
          color: #A855F7;
          font-size: 12px;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: all 0.3s;
        }

        .mint-btn:hover:not(:disabled) {
          background: rgba(168, 85, 247, 0.2);
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
        }

        .mint-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .result-section {
          text-align: center;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(0, 255, 194, 0.1);
          border: 1px solid #00FFC2;
          color: #00FFC2;
          font-size: 12px;
          letter-spacing: 0.2em;
          margin-bottom: 10px;
        }

        .geolock-badge {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
          font-size: 10px;
          letter-spacing: 0.15em;
          margin-bottom: 20px;
        }

        .geolock-badge.golden {
          background: rgba(255, 215, 0, 0.15);
          border-color: #FFD700;
          color: #FFD700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .result-hash {
          margin-bottom: 25px;
        }

        .result-hash label {
          display: block;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        .result-hash code {
          display: block;
          font-size: 10px;
          color: #00FFC2;
          background: rgba(0, 255, 194, 0.1);
          padding: 10px;
          word-break: break-all;
          font-family: monospace;
        }

        .result-metrics {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 25px;
        }

        .metric {
          text-align: center;
        }

        .metric-value {
          display: block;
          font-size: 24px;
          font-weight: 300;
          color: #FFD700;
        }

        .metric-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.4);
        }

        .result-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .action-btn {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.6);
          color: white;
          font-size: 10px;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: all 0.3s;
        }

        .action-btn.attest {
          border-color: #A855F7;
          color: #A855F7;
        }

        .action-btn.attest:hover {
          background: rgba(168, 85, 247, 0.2);
        }

        .action-btn.reset:hover {
          border-color: #00FFC2;
          color: #00FFC2;
        }

        .history-section {
          margin-top: 60px;
          text-align: center;
        }

        .history-section h3 {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.65);
          margin-bottom: 20px;
        }

        .history-list {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .history-hash {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          font-family: monospace;
        }

        /* V9 Crystalline Styles */
        .result-rainbow {
          margin-bottom: 20px;
          text-align: center;
        }

        .result-rainbow label {
          display: block;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(255,215,0,0.6);
          margin-bottom: 8px;
        }

        .rainbow-key {
          display: block;
          font-size: 12px;
          color: #FFD700;
          background: linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(0,255,194,0.15) 100%);
          padding: 12px;
          word-break: break-all;
          font-family: monospace;
          border: 1px solid rgba(255,215,0,0.3);
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .helix-indicator {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
        }

        .helix-strand {
          width: 6px;
          height: 24px;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .master-progress {
          margin-top: 20px;
          text-align: center;
        }

        .progress-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
        }

        .progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin: 0 auto;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #A855F7, #FFD700);
          transition: width 0.5s ease;
        }

        .master-badge {
          margin-top: 8px;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #FFD700;
          text-shadow: 0 0 10px rgba(255,215,0,0.5);
        }
      `}</style>
    </div>
  );
}
