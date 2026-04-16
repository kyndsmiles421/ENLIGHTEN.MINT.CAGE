/**
 * RecursiveDivePage.js — The RDive-36 Interface
 * 
 * PROOF OF INFINITE SCALABILITY
 * 
 * Full-page experience for navigating the 36-bit recursive coordinate space.
 * Features:
 * - 9×9 Lattice Grid with Zoom-Snatch transitions
 * - Ghost layers of parent coordinates
 * - Crystalline Seed minting
 * - Haptic frequency scaling (60Hz → 15Hz)
 * - 36-bit address display
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, Gem, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecursiveLattice from '../components/RecursiveLattice';

export default function RecursiveDivePage() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [mintedSeeds, setMintedSeeds] = useState([]);
  const [showSeeds, setShowSeeds] = useState(false);
  
  // Load seeds from localStorage
  React.useEffect(() => {
    try {
      const seeds = JSON.parse(localStorage.getItem('cosmic_seeds') || '[]');
      setMintedSeeds(seeds);
    } catch {}
  }, []);
  
  const handleSeedMinted = useCallback((seed) => {
    setMintedSeeds(prev => [...prev, seed]);
  }, []);
  
  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1520 50%, #0f0a15 100%)',
      }}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{
              background: 'rgba(0,0,0,0.1)',
              color: 'rgba(255,255,255,0.7)',
              backdropFilter: 'none',
            }}
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            {/* Seeds button */}
            <button
              onClick={() => setShowSeeds(!showSeeds)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style={{
                background: showSeeds ? 'rgba(255,215,0,0.2)' : 'rgba(0,0,0,0.1)',
                color: showSeeds ? '#FFD700' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'none',
                border: `1px solid ${showSeeds ? 'rgba(255,215,0,0.3)' : 'transparent'}`,
              }}
            >
              <Gem size={14} />
              <span className="text-sm">{mintedSeeds.length}</span>
            </button>
            
            {/* Info button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-lg transition-all"
              style={{
                background: showInfo ? 'rgba(100,149,237,0.2)' : 'rgba(0,0,0,0.1)',
                color: showInfo ? '#6495ED' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'none',
              }}
            >
              <Info size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="fixed top-20 right-4 z-40 w-80 p-4 rounded-xl"
            style={{
              background: 'transparent',
              backdropFilter: 'none',
              border: '1px solid rgba(100,149,237,0.3)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 className="text-sm font-bold text-white mb-3">RDive-36 Protocol</h3>
            
            <div className="space-y-3 text-xs text-gray-300">
              <div>
                <div className="text-blue-400 font-medium mb-1">Geometry of Data</div>
                <p>Each 9×9 lattice cell is a portal to a deeper 9×9 grid. Total states = 9^(2n) where n = depth.</p>
              </div>
              
              <div>
                <div className="text-green-400 font-medium mb-1">Navigation</div>
                <p>• Tap to select a cell<br/>• Double-tap to DIVE deeper<br/>• Surface button to go up</p>
              </div>
              
              <div>
                <div className="text-yellow-400 font-medium mb-1">Crystalline Seeds</div>
                <p>Mint your unique 36-bit coordinate as a digital artifact. Each seed captures your journey path.</p>
              </div>
              
              <div>
                <div className="text-purple-400 font-medium mb-1">Haptic Anchoring</div>
                <p>Frequency drops 9Hz per level (60→51→42→33). Deeper = heavier sensation.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Seeds Panel */}
      <AnimatePresence>
        {showSeeds && mintedSeeds.length > 0 && (
          <motion.div
            className="fixed top-20 right-4 z-40 w-80 max-h-[60vh] overflow-y-auto p-4 rounded-xl"
            style={{
              background: 'transparent',
              backdropFilter: 'none',
              border: '1px solid rgba(255,215,0,0.3)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Gem size={14} />
              Crystalline Seeds
            </h3>
            
            <div className="space-y-2">
              {mintedSeeds.slice(-10).reverse().map((seed, index) => (
                <div
                  key={seed.seedId}
                  className="p-2 rounded-lg text-xs"
                  style={{
                    background: 'rgba(255,215,0,0.1)',
                    border: '1px solid rgba(255,215,0,0.2)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-yellow-400 font-mono text-[10px]">
                      {seed.seedId}
                    </span>
                    <span className="text-gray-500 text-[9px]">
                      L{seed.depth}
                    </span>
                  </div>
                  <div className="text-gray-400 text-[9px] truncate">
                    {seed.address}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="pt-24 pb-8 px-4">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 
            className="text-2xl font-light tracking-widest mb-2"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            RECURSIVE DIVE
          </h1>
          <p 
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            36-Bit Coordinate Navigator
          </p>
        </div>
        
        {/* Lattice */}
        <RecursiveLattice onSeedMinted={handleSeedMinted} />
        
        {/* Stats Footer */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 px-4 py-2 rounded-full text-[10px]"
            style={{
              background: 'rgba(0,0,0,0.1)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <span>Max Depth: 6</span>
            <span>•</span>
            <span>Max States: 68.7B</span>
            <span>•</span>
            <span>Seeds: {mintedSeeds.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
