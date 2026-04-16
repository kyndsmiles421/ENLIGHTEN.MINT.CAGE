/**
 * InteractiveMasonry.js — V55.0 Sacred Architecture Builder
 * 
 * Users click-and-lock nodes of Metatron's Cube to build structures.
 * Fibonacci-scaled grid tiles. Resonance Sparks serve as building materials.
 * Integrates with Academy/Masonry modules and the Sovereign Circle.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Sparkles, Lock, Unlock, RotateCcw, Trophy, Gem } from 'lucide-react';
import { PHI, metatronVertices, goldenSpiralPoints } from '../lib/SacredGeometry';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// 13 vertices of Metatron's Cube
const VERTICES = metatronVertices(100);

// Connection lines between all 13 vertices
const CONNECTIONS = [];
for (let i = 0; i < VERTICES.length; i++) {
  for (let j = i + 1; j < VERTICES.length; j++) {
    const dx = VERTICES[i].x - VERTICES[j].x;
    const dy = VERTICES[i].y - VERTICES[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Only include connections within a reasonable distance
    if (dist < 180) {
      CONNECTIONS.push({ from: i, to: j, dist });
    }
  }
}

// Node unlock cost scales with Fibonacci
const FIB_COSTS = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];

/**
 * Interactive Masonry Module
 * @param {string} room - Current room for fetching materials
 * @param {object} authHeaders - Auth headers for API calls
 * @param {string} userId - Current user ID
 */
export default function InteractiveMasonry({ room = 'default', authHeaders = {}, userId = '' }) {
  const [lockedNodes, setLockedNodes] = useState(() => {
    try {
      const saved = localStorage.getItem('emcafe_masonry_nodes');
      return saved ? JSON.parse(saved) : [0]; // Center node always unlocked
    } catch { return [0]; }
  });
  const [materials, setMaterials] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [structures, setStructures] = useState([]);
  const [showReset, setShowReset] = useState(false);

  // Fetch materials from Masonry API
  const fetchMaterials = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/masonry/materials/${room}`);
      const data = await res.json();
      setMaterials(data.total || 0);
    } catch {}
  }, [room]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  // Save progress
  useEffect(() => {
    try { localStorage.setItem('emcafe_masonry_nodes', JSON.stringify(lockedNodes)); } catch {}
  }, [lockedNodes]);

  // Unlock a node
  const unlockNode = (index) => {
    if (lockedNodes.includes(index)) return;
    const cost = FIB_COSTS[lockedNodes.length] || 1;
    if (materials < cost) {
      toast.error(`Need ${cost} Resonance Sparks (have ${materials})`);
      return;
    }
    // Check adjacency — must connect to an already-locked node
    const isAdjacent = CONNECTIONS.some(c =>
      (c.from === index && lockedNodes.includes(c.to)) ||
      (c.to === index && lockedNodes.includes(c.from))
    );
    if (!isAdjacent && lockedNodes.length > 0) {
      toast.error('Must connect to an existing node');
      return;
    }
    setLockedNodes(prev => [...prev, index]);
    setMaterials(prev => prev - cost);
    toast.success(`Node ${index} locked! (-${cost} sparks)`);

    // Check for completed shapes
    checkStructures([...lockedNodes, index]);

    if (typeof window.__workAccrue === 'function') {
      window.__workAccrue('masonry_build', cost * 5);
    }
  };

  // Check if triangles or other sacred shapes are formed
  const checkStructures = (nodes) => {
    const newStructures = [];
    // Check triangles (3 connected nodes)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const ab = CONNECTIONS.some(c => (c.from === nodes[i] && c.to === nodes[j]) || (c.to === nodes[i] && c.from === nodes[j]));
          const bc = CONNECTIONS.some(c => (c.from === nodes[j] && c.to === nodes[k]) || (c.to === nodes[j] && c.from === nodes[k]));
          const ac = CONNECTIONS.some(c => (c.from === nodes[i] && c.to === nodes[k]) || (c.to === nodes[i] && c.from === nodes[k]));
          if (ab && bc && ac) {
            newStructures.push({ type: 'triangle', nodes: [nodes[i], nodes[j], nodes[k]] });
          }
        }
      }
    }
    setStructures(newStructures);
  };

  useEffect(() => { checkStructures(lockedNodes); }, []); // eslint-disable-line

  const reset = () => {
    setLockedNodes([0]);
    setStructures([]);
    setShowReset(false);
    localStorage.removeItem('emcafe_masonry_nodes');
    toast.success('Masonry reset — center node preserved');
  };

  const completionPct = Math.round((lockedNodes.length / 13) * 100);
  const nextCost = FIB_COSTS[lockedNodes.length] || 0;

  return (
    <div className="relative" data-testid="interactive-masonry">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Hammer size={14} style={{ color: '#FBBF24' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#FBBF24' }}>
              Sacred Masonry
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Build Metatron's Cube — {lockedNodes.length}/13 nodes locked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Sparks</span>
            <p className="text-xs font-mono" style={{ color: '#C084FC' }}>{materials}</p>
          </div>
          <button onClick={() => setShowReset(true)} className="p-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            data-testid="masonry-reset-btn">
            <RotateCcw size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>
      </div>

      {/* Metatron's Cube SVG — Interactive */}
      <div className="relative mx-auto mb-4" style={{ width: 280, height: 280 }}>
        <svg viewBox="-160 -160 320 320" width="280" height="280" data-testid="masonry-cube-svg">
          {/* Connection lines */}
          {CONNECTIONS.map((c, i) => {
            const fromLocked = lockedNodes.includes(c.from);
            const toLocked = lockedNodes.includes(c.to);
            const bothLocked = fromLocked && toLocked;
            return (
              <line
                key={`conn-${i}`}
                x1={VERTICES[c.from].x} y1={VERTICES[c.from].y}
                x2={VERTICES[c.to].x} y2={VERTICES[c.to].y}
                stroke={bothLocked ? '#FBBF24' : 'rgba(255,255,255,0.06)'}
                strokeWidth={bothLocked ? 1.2 : 0.4}
                opacity={bothLocked ? 0.6 : 0.3}
              />
            );
          })}

          {/* Completed triangles — filled */}
          {structures.map((s, i) => {
            if (s.type === 'triangle') {
              const pts = s.nodes.map(n => `${VERTICES[n].x},${VERTICES[n].y}`).join(' ');
              return (
                <polygon key={`struct-${i}`} points={pts}
                  fill="rgba(251,191,36,0.04)" stroke="#FBBF24" strokeWidth="0.5" opacity="0.5" />
              );
            }
            return null;
          })}

          {/* Vertex nodes */}
          {VERTICES.map((v, i) => {
            const isLocked = lockedNodes.includes(i);
            const isCenter = i === 0;
            const isAdjacent = !isLocked && CONNECTIONS.some(c =>
              (c.from === i && lockedNodes.includes(c.to)) ||
              (c.to === i && lockedNodes.includes(c.from))
            );
            const nodeColor = isCenter ? '#FBBF24' : isLocked ? '#C084FC' : isAdjacent ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
            const nodeRadius = isCenter ? 12 : isLocked ? 10 : isAdjacent ? 8 : 6;

            return (
              <g key={`node-${i}`}
                onClick={() => !isLocked && unlockNode(i)}
                style={{ cursor: isLocked ? 'default' : isAdjacent ? 'pointer' : 'not-allowed' }}
                data-testid={`masonry-node-${i}`}
              >
                {/* Glow for locked nodes */}
                {isLocked && (
                  <circle cx={v.x} cy={v.y} r={nodeRadius + 6} fill={`${nodeColor}10`}>
                    <animate attributeName="r" values={`${nodeRadius + 4};${nodeRadius + 8};${nodeRadius + 4}`}
                      dur="3s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Pulse for adjacent unlockable */}
                {isAdjacent && !isLocked && (
                  <circle cx={v.x} cy={v.y} r={nodeRadius + 4} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5">
                    <animate attributeName="r" values={`${nodeRadius + 2};${nodeRadius + 6};${nodeRadius + 2}`}
                      dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Main node circle */}
                <circle cx={v.x} cy={v.y} r={nodeRadius}
                  fill={isLocked ? `${nodeColor}30` : 'rgba(255,255,255,0.02)'}
                  stroke={nodeColor} strokeWidth={isLocked ? 1.5 : 0.5}
                />
                {/* Icon */}
                {isLocked ? (
                  <text x={v.x} y={v.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize="8" fill={nodeColor} fontWeight="bold">
                    {i}
                  </text>
                ) : isAdjacent ? (
                  <text x={v.x} y={v.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize="7" fill="rgba(255,255,255,0.4)">
                    +
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Cube Completion
          </span>
          <span className="text-[10px] font-mono" style={{ color: '#FBBF24' }}>{completionPct}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg, #C084FC, #FBBF24)' }} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Triangles</p>
          <p className="text-sm font-mono" style={{ color: '#FBBF24' }}>{structures.length}</p>
        </div>
        <div className="flex-1 rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Next Cost</p>
          <p className="text-sm font-mono" style={{ color: '#C084FC' }}>{nextCost} <span className="text-[7px]">sparks</span></p>
        </div>
        <div className="flex-1 rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>XP Earned</p>
          <p className="text-sm font-mono" style={{ color: '#2DD4BF' }}>{lockedNodes.length * 50}</p>
        </div>
      </div>

      {/* Completion reward */}
      {completionPct === 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="mt-4 rounded-xl p-4 text-center" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <Trophy size={20} style={{ color: '#FBBF24', margin: '0 auto 8px' }} />
          <p className="text-xs font-semibold" style={{ color: '#FBBF24' }}>Metatron's Cube Complete</p>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            You have built the sacred architecture. Master Mason achieved.
          </p>
        </motion.div>
      )}

      {/* Reset confirmation */}
      <AnimatePresence>
        {showReset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
            <div className="text-center p-6">
              <p className="text-sm mb-4" style={{ color: '#F8FAFC' }}>Reset your Masonry progress?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={reset} className="px-4 py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  Reset
                </button>
                <button onClick={() => setShowReset(false)} className="px-4 py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
