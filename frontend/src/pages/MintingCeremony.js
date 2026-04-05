/**
 * MintingCeremony.js — Fractal Seed Minting Interface
 * 
 * Full visualization of the 54-layer L² Fractal Engine minting process.
 * Shows the SeedVisualizer growing as each layer computes.
 * 
 * Route: /mint
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeedVisualizer, SeedVisualizerMini, useAnimatedLayerCount } from '../components/SeedVisualizer';
import SovereignStreamline from '../utils/SovereignStreamlineV4';

export default function MintingCeremony() {
  const navigate = useNavigate();
  const [isMinting, setIsMinting] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [mintResult, setMintResult] = useState(null);
  const [seedInput, setSeedInput] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Animated layer count for smooth visualization
  const displayLayer = useAnimatedLayerCount(currentLayer, 500);

  const toggleAudio = useCallback(() => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    SovereignStreamline.setAudioEnabled(newState);
  }, [audioEnabled]);

  const startMinting = useCallback(async () => {
    if (!seedInput.trim()) return;

    setIsMinting(true);
    setCurrentLayer(0);
    setMintResult(null);

    // Subscribe to progress updates (includes audio tones)
    const unsubProgress = SovereignStreamline.on('mint-progress', (progress) => {
      setCurrentLayer(progress.layer);
    });

    try {
      // Use v4 mintSeed with spatial audio
      const result = await SovereignStreamline.mintSeed(seedInput, 54);
      
      setMintResult(result);
      setCurrentLayer(54);
    } catch (e) {
      console.error('Minting failed:', e);
    } finally {
      setIsMinting(false);
      unsubProgress();
    }
  }, [seedInput]);

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
            <div className="result-badge">✓ SEED MINTED</div>
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
                <span className="metric-value">{mintResult.metrics?.computeTime || 0}ms</span>
                <span className="metric-label">COMPUTE</span>
              </div>
              <div className="metric">
                <span className="metric-value">{mintResult.metrics?.entropyScore || 0}</span>
                <span className="metric-label">ENTROPY</span>
              </div>
            </div>
            <div className="result-actions">
              <button className="action-btn attest" onClick={() => {
                SovereignStreamline.trigger('ATTEST', 'SEED-MINT', {
                  description: `Minted seed: ${seedInput}`,
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

      {/* Mini visualizers showing history */}
      {SovereignStreamline.getMintedSeeds().length > 0 && (
        <div className="history-section">
          <h3>PREVIOUS SEEDS</h3>
          <div className="history-list">
            {SovereignStreamline.getMintedSeeds().slice(-5).map((seed, i) => (
              <div key={i} className="history-item">
                <SeedVisualizerMini layerCount={54} total={54} size={40} />
                <span className="history-hash">{seed.hash?.slice(0, 16)}...</span>
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
          border: 1px solid rgba(255,255,255,0.2);
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
          border: 1px solid rgba(255,255,255,0.2);
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
          color: rgba(255,255,255,0.3);
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
          margin-bottom: 20px;
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
          border: 1px solid rgba(255,255,255,0.2);
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
          color: rgba(255,255,255,0.3);
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
      `}</style>
    </div>
  );
}
