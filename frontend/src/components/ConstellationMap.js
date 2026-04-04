import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMeshNetwork, CONSTELLATION_NODES, CATEGORY_COLORS } from '../context/MeshNetworkContext';
import {
  Wind, Timer, Flame, Hand, Music, Sun, Moon, Eye, BookOpen, Heart,
  Headphones, Radio, Leaf, MessageCircle, Users, Calendar, Compass,
  Crown, Globe, Brain, Sparkles, Star, Zap, X, Maximize2, Minimize2,
} from 'lucide-react';

// Icon mapping
const NODE_ICONS = {
  breathing: Wind, meditation: Timer, yoga: Flame, exercises: Zap,
  mudras: Hand, mantras: Music, affirmations: Sun, oracle: Sparkles,
  'star-chart': Star, numerology: Star, dreams: Moon, forecasts: Eye,
  'cosmic-profile': Compass, journal: BookOpen, mood: Heart,
  soundscapes: Headphones, frequencies: Radio, 'zen-garden': Leaf,
  'light-therapy': Sun, coach: MessageCircle, sovereigns: Crown,
  challenges: Flame, community: Users, blessings: Heart,
  'daily-briefing': Sun, 'daily-ritual': Sparkles, 'cosmic-calendar': Calendar,
};

/**
 * ConstellationMap — A mesh visualization where every node is equal
 * 
 * No central hub. Instead, nodes are arranged in clusters by category,
 * with connection lines showing relationships. The user's current position
 * is highlighted, and connected nodes glow to show available paths.
 * 
 * Features:
 * - Category clusters (Practice, Divination, Sanctuary, Explore, Today)
 * - Connection mesh lines between related nodes
 * - Current position highlighting
 * - Zoom and pan support
 * - Touch-friendly interactions
 */
export default function ConstellationMap({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentNode, meshHistory, getConnections } = useMeshNetwork();
  const containerRef = useRef(null);
  
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Motion values for pan/zoom
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  // Organize nodes by category
  const clusters = useMemo(() => {
    const grouped = {};
    Object.values(CONSTELLATION_NODES).forEach(node => {
      if (!grouped[node.category]) {
        grouped[node.category] = [];
      }
      grouped[node.category].push(node);
    });
    return grouped;
  }, []);

  // Calculate node positions in a cluster layout
  const nodePositions = useMemo(() => {
    const positions = {};
    const categories = Object.keys(clusters);
    const categoryCount = categories.length;
    
    // Arrange categories in a pentagon formation
    const centerX = 50;
    const centerY = 50;
    const clusterRadius = 32;
    
    categories.forEach((category, catIndex) => {
      const catAngle = (catIndex / categoryCount) * Math.PI * 2 - Math.PI / 2;
      const catX = centerX + Math.cos(catAngle) * clusterRadius;
      const catY = centerY + Math.sin(catAngle) * clusterRadius;
      
      const nodes = clusters[category];
      const nodeCount = nodes.length;
      const nodeRadius = Math.min(12, 20 / Math.sqrt(nodeCount));
      
      nodes.forEach((node, nodeIndex) => {
        const nodeAngle = (nodeIndex / nodeCount) * Math.PI * 2 - Math.PI / 2;
        const offsetX = Math.cos(nodeAngle) * nodeRadius;
        const offsetY = Math.sin(nodeAngle) * nodeRadius;
        
        positions[node.id] = {
          x: catX + offsetX,
          y: catY + offsetY,
          category,
        };
      });
    });
    
    return positions;
  }, [clusters]);

  // Get connection lines
  const connectionLines = useMemo(() => {
    const lines = [];
    const drawn = new Set();
    
    Object.values(CONSTELLATION_NODES).forEach(node => {
      const from = nodePositions[node.id];
      if (!from) return;
      
      node.connections.forEach(connId => {
        const to = nodePositions[connId];
        if (!to) return;
        
        // Avoid duplicate lines
        const lineKey = [node.id, connId].sort().join('-');
        if (drawn.has(lineKey)) return;
        drawn.add(lineKey);
        
        const isCrossCategory = from.category !== to.category;
        const isCurrentConnection = node.id === currentNode || connId === currentNode;
        const isHoveredConnection = node.id === hoveredNode || connId === hoveredNode;
        
        lines.push({
          key: lineKey,
          from: { x: from.x, y: from.y },
          to: { x: to.x, y: to.y },
          isCrossCategory,
          isActive: isCurrentConnection || isHoveredConnection,
          fromColor: CONSTELLATION_NODES[node.id]?.color,
          toColor: CONSTELLATION_NODES[connId]?.color,
        });
      });
    });
    
    return lines;
  }, [nodePositions, currentNode, hoveredNode]);

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    navigate(node.path);
    onClose?.();
  }, [navigate, onClose]);

  // Reset view
  const resetView = useCallback(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
  }, [x, y, scale]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[9998] ${isFullscreen ? '' : 'p-4 md:p-8'}`}
        style={{ background: 'rgba(5,5,12,0.95)' }}
        data-testid="constellation-map"
      >
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}>
              <Globe size={14} style={{ color: '#818CF8' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#818CF8' }}>Constellation Map</h2>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {Object.keys(CONSTELLATION_NODES).length} nodes • {connectionLines.length} connections
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Category Legend */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium capitalize transition-all"
              style={{
                background: selectedCategory === category ? `${color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedCategory === category ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
                color: selectedCategory === category ? color : 'rgba(255,255,255,0.5)',
              }}>
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              {category}
            </button>
          ))}
        </div>

        {/* Main Canvas */}
        <motion.div
          ref={containerRef}
          className="absolute inset-0"
          style={{ x: springX, y: springY }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Gradient definitions for connection lines */}
              {connectionLines.map(line => (
                <linearGradient key={`grad-${line.key}`} id={`gradient-${line.key}`}
                  x1={`${line.from.x}%`} y1={`${line.from.y}%`}
                  x2={`${line.to.x}%`} y2={`${line.to.y}%`}>
                  <stop offset="0%" stopColor={line.fromColor} stopOpacity={line.isActive ? 0.6 : 0.15} />
                  <stop offset="100%" stopColor={line.toColor} stopOpacity={line.isActive ? 0.6 : 0.15} />
                </linearGradient>
              ))}

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connection Lines */}
            <g className="connection-lines">
              {connectionLines.map(line => (
                <motion.line
                  key={line.key}
                  x1={`${line.from.x}%`}
                  y1={`${line.from.y}%`}
                  x2={`${line.to.x}%`}
                  y2={`${line.to.y}%`}
                  stroke={`url(#gradient-${line.key})`}
                  strokeWidth={line.isActive ? 0.15 : 0.06}
                  strokeDasharray={line.isCrossCategory ? '0.5 0.3' : 'none'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: Math.random() * 0.5 }}
                />
              ))}
            </g>

            {/* Nodes */}
            {Object.values(CONSTELLATION_NODES).map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              const Icon = NODE_ICONS[node.id] || Sparkles;
              const isCurrent = node.id === currentNode;
              const isHovered = node.id === hoveredNode;
              const isConnected = currentNode && CONSTELLATION_NODES[currentNode]?.connections.includes(node.id);
              const isInSelectedCategory = !selectedCategory || node.category === selectedCategory;
              const isInHistory = meshHistory.includes(node.id);
              
              const nodeOpacity = isInSelectedCategory ? 1 : 0.2;
              const nodeScale = isCurrent ? 1.3 : isHovered ? 1.15 : 1;
              
              return (
                <motion.g
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer', opacity: nodeOpacity }}
                  initial={{ scale: 0 }}
                  animate={{ scale: nodeScale }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: Math.random() * 0.3 }}
                >
                  {/* Outer glow for current/connected nodes */}
                  {(isCurrent || isConnected) && (
                    <motion.circle
                      cx={`${pos.x}%`}
                      cy={`${pos.y}%`}
                      r="2.5"
                      fill="none"
                      stroke={node.color}
                      strokeWidth="0.05"
                      opacity={0.3}
                      animate={{ r: [2.5, 3.5, 2.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  
                  {/* Node background */}
                  <circle
                    cx={`${pos.x}%`}
                    cy={`${pos.y}%`}
                    r={isCurrent ? '2' : '1.5'}
                    fill={`${node.color}20`}
                    stroke={node.color}
                    strokeWidth={isCurrent ? '0.15' : '0.08'}
                    filter={isCurrent ? 'url(#glow)' : 'none'}
                  />
                  
                  {/* History indicator */}
                  {isInHistory && !isCurrent && (
                    <circle
                      cx={`${pos.x}%`}
                      cy={`${pos.y}%`}
                      r="1.8"
                      fill="none"
                      stroke={node.color}
                      strokeWidth="0.03"
                      strokeDasharray="0.2 0.2"
                      opacity={0.4}
                    />
                  )}

                  {/* Label */}
                  <text
                    x={`${pos.x}%`}
                    y={`${pos.y + 3}%`}
                    textAnchor="middle"
                    fill={isHovered || isCurrent ? node.color : 'rgba(255,255,255,0.4)'}
                    fontSize="0.9"
                    fontWeight={isCurrent ? '600' : '400'}
                  >
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </motion.div>

        {/* Hovered Node Details */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl z-20"
              style={{
                background: 'rgba(20,20,30,0.95)',
                border: `1px solid ${CONSTELLATION_NODES[hoveredNode]?.color}30`,
                boxShadow: `0 8px 32px ${CONSTELLATION_NODES[hoveredNode]?.color}10`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: `${CONSTELLATION_NODES[hoveredNode]?.color}15`,
                    border: `1px solid ${CONSTELLATION_NODES[hoveredNode]?.color}25`,
                  }}>
                  {(() => {
                    const Icon = NODE_ICONS[hoveredNode] || Sparkles;
                    return <Icon size={18} style={{ color: CONSTELLATION_NODES[hoveredNode]?.color }} />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: CONSTELLATION_NODES[hoveredNode]?.color }}>
                    {CONSTELLATION_NODES[hoveredNode]?.label}
                  </p>
                  <p className="text-[10px] capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {CONSTELLATION_NODES[hoveredNode]?.category} • {CONSTELLATION_NODES[hoveredNode]?.connections.length} connections
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
