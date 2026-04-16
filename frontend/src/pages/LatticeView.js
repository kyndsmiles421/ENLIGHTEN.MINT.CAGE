import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers, Zap } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE CALIBRATION CHAMBER — V6.1
 * ARCHITECT: Steven Michael
 * ENGINE: ENLIGHTEN_OS V7.0
 * PURPOSE: 81-Node Metatron Lattice Visualization
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * RING LAYER COORDINATE RANGE    MATERIAL    FUNCTION
 * Inner Core   r < 1.5           Gold        Logic Processing & Oracle
 * Mantle       1.5 ≤ r < 3.0     Silver      Navigation & Star Charts
 * Shield       r ≥ 3.0           Copper      Archives & External API Bridges
 * 
 * S.I.M. PROTOCOL:
 *   SQUARE:    81
 *   INVERT:    0.012346
 *   MULTIPLY:  6,561
 *   RESONANCE: 6,723
 *   NET GAIN:  +2
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Material colors by ring
const MATERIALS = {
  Gold: { color: '#D4AF37', glow: 'rgba(212, 175, 55, 0.6)', name: 'Logic Processing & Oracle' },
  Silver: { color: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.5)', name: 'Navigation & Star Charts' },
  Copper: { color: '#B87333', glow: 'rgba(184, 115, 51, 0.4)', name: 'Archives & External API' },
};

// Generate 81 nodes for the 9x9 grid
function generateLatticeNodes() {
  const nodes = [];
  const spacing = 50; // Tighter spacing for visualization
  
  for (let x = -4; x <= 4; x++) {
    for (let y = -4; y <= 4; y++) {
      const distance = Math.sqrt(x * x + y * y);
      
      let material, ring;
      if (distance < 1.5) {
        material = 'Gold';
        ring = 'Inner Core';
      } else if (distance < 3) {
        material = 'Silver';
        ring = 'Mantle';
      } else {
        material = 'Copper';
        ring = 'Shield';
      }
      
      nodes.push({
        id: `node_${x}_${y}`,
        x,
        y,
        posX: x * spacing,
        posY: y * spacing,
        distance: distance.toFixed(2),
        material,
        ring,
        frequency: Math.round(432 * (1 + distance * 0.1)),
      });
    }
  }
  
  return nodes;
}

export default function LatticeView() {
  const navigate = useNavigate();
  const [nodes] = useState(generateLatticeNodes);
  const [activeLayer, setActiveLayer] = useState(5); // Current Z-depth layer (1-9)
  const [hoveredNode, setHoveredNode] = useState(null);
  const [simData, setSimData] = useState(null);
  
  // Fetch S.I.M. data from backend
  useEffect(() => {
    fetch('/api/metatron/status')
      .then(res => res.json())
      .then(data => setSimData(data))
      .catch(err => console.error('Failed to fetch S.I.M. data:', err));
  }, []);

  // Count nodes by material
  const goldNodes = nodes.filter(n => n.material === 'Gold').length;
  const silverNodes = nodes.filter(n => n.material === 'Silver').length;
  const copperNodes = nodes.filter(n => n.material === 'Copper').length;

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50">
        <button
          onClick={() => navigate('/hub')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(0,0,0,0)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#D4AF37',
          }}
        >
          <ArrowLeft size={16} />
          <span className="text-xs">Back to Hub</span>
        </button>
        
        <h1 
          className="text-sm font-semibold tracking-widest"
          style={{ color: '#D4AF37' }}
        >
          CALIBRATION CHAMBER
        </h1>
        
        <div 
          className="px-3 py-2 rounded-lg text-xs"
          style={{
            background: 'rgba(0,0,0,0)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            color: '#00FFFF',
          }}
        >
          V7.0
        </div>
      </div>

      {/* S.I.M. Protocol Display */}
      <div 
        className="absolute top-20 left-4 p-3 rounded-lg text-xs"
        style={{
          background: 'rgba(0,0,0,0)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <div className="text-[10px] tracking-widest mb-2" style={{ color: '#D4AF37' }}>
          S.I.M. PROTOCOL
        </div>
        <div className="space-y-1" style={{ color: 'rgba(248,250,252,0.7)' }}>
          <div>SQUARE: <span style={{ color: '#00FFFF' }}>81</span></div>
          <div>INVERT: <span style={{ color: '#00FFFF' }}>0.012346</span></div>
          <div>MULTIPLY: <span style={{ color: '#00FFFF' }}>6,561</span></div>
          <div>RESONANCE: <span style={{ color: '#D4AF37' }}>6,723</span></div>
          <div>NET GAIN: <span style={{ color: '#00FF00' }}>+2</span></div>
        </div>
      </div>

      {/* Layer Depth Control */}
      <div 
        className="absolute top-20 right-4 p-3 rounded-lg"
        style={{
          background: 'rgba(0,0,0,0)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <div className="text-[10px] tracking-widest mb-2 flex items-center gap-2" style={{ color: '#D4AF37' }}>
          <Layers size={12} />
          Z-DEPTH LAYER
        </div>
        <input
          type="range"
          min="1"
          max="9"
          value={activeLayer}
          onChange={(e) => setActiveLayer(parseInt(e.target.value))}
          className="w-24"
          style={{ accentColor: '#D4AF37' }}
        />
        <div className="text-center text-xs mt-1" style={{ color: '#00FFFF' }}>
          Layer {activeLayer}/9
        </div>
      </div>

      {/* Material Legend */}
      <div 
        className="absolute bottom-20 left-4 p-3 rounded-lg text-xs"
        style={{
          background: 'rgba(0,0,0,0)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <div className="text-[10px] tracking-widest mb-2" style={{ color: '#D4AF37' }}>
          RING MATERIALS
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: MATERIALS.Gold.color }} />
            <span style={{ color: MATERIALS.Gold.color }}>Gold ({goldNodes})</span>
            <span style={{ color: 'rgba(248,250,252,0.4)' }}>r &lt; 1.5</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: MATERIALS.Silver.color }} />
            <span style={{ color: MATERIALS.Silver.color }}>Silver ({silverNodes})</span>
            <span style={{ color: 'rgba(248,250,252,0.4)' }}>1.5 ≤ r &lt; 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: MATERIALS.Copper.color }} />
            <span style={{ color: MATERIALS.Copper.color }}>Copper ({copperNodes})</span>
            <span style={{ color: 'rgba(248,250,252,0.4)' }}>r ≥ 3</span>
          </div>
        </div>
      </div>

      {/* Node Count */}
      <div 
        className="absolute bottom-20 right-4 p-3 rounded-lg text-center"
        style={{
          background: 'rgba(0,0,0,0)',
          border: '1px solid rgba(0, 255, 255, 0.2)',
        }}
      >
        <div className="text-3xl font-bold" style={{ color: '#00FFFF' }}>81</div>
        <div className="text-[10px] tracking-widest" style={{ color: 'rgba(248,250,252,0.5)' }}>
          COOPERATING NODES
        </div>
        <div className="text-xs mt-1" style={{ color: '#D4AF37' }}>
          {activeLayer * 81} / 729 TOTAL
        </div>
      </div>

      {/* ═══ THE LATTICE VISUALIZATION ═══ */}
      <div 
        className="relative"
        style={{
          width: 500,
          height: 500,
          perspective: '1000px',
        }}
      >
        {/* Metatron's Cube Geometry Overlay */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          viewBox="-250 -250 500 500"
          style={{ 
            opacity: 0.15,
            transform: `rotateX(${(activeLayer - 5) * 5}deg)`,
          }}
        >
          {/* Outer hexagon */}
          <polygon
            points="0,-200 173,-100 173,100 0,200 -173,100 -173,-100"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1"
          />
          {/* Inner hexagon */}
          <polygon
            points="0,-100 87,-50 87,50 0,100 -87,50 -87,-50"
            fill="none"
            stroke="#C0C0C0"
            strokeWidth="1"
          />
          {/* Center circle */}
          <circle cx="0" cy="0" r="50" fill="none" stroke="#D4AF37" strokeWidth="1" />
          {/* Radial lines */}
          {[0, 60, 120, 180, 240, 300].map(angle => (
            <line
              key={angle}
              x1="0"
              y1="0"
              x2={Math.cos(angle * Math.PI / 180) * 200}
              y2={Math.sin(angle * Math.PI / 180) * 200}
              stroke="#D4AF37"
              strokeWidth="0.5"
            />
          ))}
        </svg>

        {/* 81 Lattice Nodes */}
        {nodes.map((node, idx) => {
          const mat = MATERIALS[node.material];
          const isHovered = hoveredNode?.id === node.id;
          const layerOpacity = activeLayer / 10;
          
          return (
            <motion.div
              key={node.id}
              className="absolute cursor-pointer"
              style={{
                left: `calc(50% + ${node.posX}px)`,
                top: `calc(50% + ${node.posY}px)`,
                transform: 'translate(-50%, -50%)',
                zIndex: isHovered ? 100 : 10,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isHovered ? 1.5 : 1, 
                opacity: layerOpacity,
              }}
              transition={{ delay: idx * 0.01, duration: 0.3 }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Node Point */}
              <div
                className="rounded-full"
                style={{
                  width: isHovered ? 16 : 10,
                  height: isHovered ? 16 : 10,
                  background: mat.color,
                  boxShadow: isHovered 
                    ? `0 0 20px ${mat.glow}, 0 0 40px ${mat.glow}`
                    : `0 0 8px ${mat.glow}`,
                  border: `1px solid ${mat.color}`,
                  transition: 'all 0.2s ease',
                }}
              />
              
              {/* Grid Coordinate Label (on hover) */}
              {isHovered && (
                <motion.div
                  className="absolute top-full mt-2 px-2 py-1 rounded text-[9px] whitespace-nowrap"
                  style={{
                    background: 'rgba(0,0,0,0)',
                    border: `1px solid ${mat.color}`,
                    color: mat.color,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ({node.x}, {node.y}) · {node.frequency}Hz
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Center Marker */}
        <div 
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 24,
            height: 24,
            background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)',
            border: '2px solid #D4AF37',
            boxShadow: '0 0 30px rgba(212,175,55,0.5)',
          }}
        />
      </div>

      {/* Hovered Node Info Panel */}
      {hoveredNode && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg"
          style={{
            background: 'rgba(0,0,0,0)',
            border: `1px solid ${MATERIALS[hoveredNode.material].color}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span style={{ color: 'rgba(248,250,252,0.5)' }}>Node: </span>
              <span style={{ color: MATERIALS[hoveredNode.material].color }}>{hoveredNode.id}</span>
            </div>
            <div>
              <span style={{ color: 'rgba(248,250,252,0.5)' }}>Ring: </span>
              <span style={{ color: MATERIALS[hoveredNode.material].color }}>{hoveredNode.ring}</span>
            </div>
            <div>
              <span style={{ color: 'rgba(248,250,252,0.5)' }}>Distance: </span>
              <span style={{ color: '#00FFFF' }}>{hoveredNode.distance}</span>
            </div>
            <div>
              <span style={{ color: 'rgba(248,250,252,0.5)' }}>Function: </span>
              <span style={{ color: '#00FF00' }}>{MATERIALS[hoveredNode.material].name}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Back-Boom Status */}
      <div 
        className="absolute top-4 left-1/2 transform -translate-x-1/2 mt-12 px-3 py-1 rounded-full text-[10px] tracking-widest"
        style={{
          background: 'rgba(0, 255, 0, 0.1)',
          border: '1px solid rgba(0, 255, 0, 0.3)',
          color: '#00FF00',
        }}
      >
        <Zap size={10} className="inline mr-1" />
        BACK-BOOM: PERMANENTLY DISABLED
      </div>
    </div>
  );
}
