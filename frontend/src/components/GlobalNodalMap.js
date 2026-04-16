/**
 * ENLIGHTEN.MINT.CAFE - V10013.0 GLOBAL NODAL MAP
 * 
 * Refracted Crystal Rainbow world map visualization
 * Shows all nodal anchors with activation status
 * 
 * Features:
 * - Mercator-Phi Hybrid projection
 * - Animated node connections
 * - Real-time status indicators
 * - GPS-anchored quest triggers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Globe, MapPin, Zap, Radio, Activity, 
  ChevronRight, X, Navigation, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Node type icons and colors
const NODE_TYPES = {
  PRIMARY_ANCHOR: { icon: Zap, label: 'Primary Anchor' },
  ACADEMY_NODE: { icon: Activity, label: 'Academy' },
  HUB_NODE: { icon: Radio, label: 'Hub' },
  WELLNESS_ZONE: { icon: Sparkles, label: 'Wellness' },
  LAW_NODE: { icon: Navigation, label: 'Law' },
  TECH_NODE: { icon: Zap, label: 'Tech' },
  WISDOM_NODE: { icon: Globe, label: 'Wisdom' },
};

// Convert lat/lng to SVG coordinates (simplified Mercator)
function geoToSvg(lat, lng, width, height) {
  const x = ((lng + 180) / 360) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = (height / 2) - (mercN * height) / (2 * Math.PI);
  return { x, y };
}

/**
 * Single Node Component
 */
function NodalPoint({ node, width, height, onSelect, isSelected }) {
  const { x, y } = geoToSvg(node.lat, node.lng, width, height);
  const NodeIcon = NODE_TYPES[node.type]?.icon || MapPin;
  const isActive = node.status === 'ACTIVE' || node.isActive;
  
  return (
    <g 
      transform={`translate(${x}, ${y})`}
      onClick={() => onSelect(node)}
      style={{ cursor: 'pointer' }}
    >
      {/* Pulse ring for active nodes */}
      {isActive && (
        <motion.circle
          r={20}
          fill="none"
          stroke={node.color}
          strokeWidth={1}
          initial={{ r: 8, opacity: 0.8 }}
          animate={{ r: 25, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {/* Connection line to center (Black Hills) */}
      {node.id !== 'black_hills_primary' && isActive && (
        <motion.line
          x1={0}
          y1={0}
          x2={geoToSvg(44.0805, -103.2310, width, height).x - x}
          y2={geoToSvg(44.0805, -103.2310, width, height).y - y}
          stroke={node.color}
          strokeWidth={0.5}
          strokeOpacity={0.3}
          strokeDasharray="4,4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
      )}
      
      {/* Node circle */}
      <motion.circle
        r={isSelected ? 12 : 8}
        fill={isActive ? node.color : 'rgba(255,255,255,0.1)'}
        stroke={isSelected ? '#fff' : node.color}
        strokeWidth={isSelected ? 2 : 1}
        whileHover={{ scale: 1.3 }}
        transition={{ type: 'spring', stiffness: 300 }}
      />
      
      {/* Status indicator */}
      {isActive && (
        <circle
          r={3}
          fill="#22C55E"
          cx={6}
          cy={-6}
        />
      )}
    </g>
  );
}

/**
 * Main Global Nodal Map Component
 */
export default function GlobalNodalMap({ isOpen, onClose }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expansionStatus, setExpansionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const mapWidth = 800;
  const mapHeight = 450;

  useEffect(() => {
    if (isOpen) {
      fetchExpansionStatus();
    }
  }, [isOpen]);

  const fetchExpansionStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/omnis/expansion/status`);
      setExpansionStatus(res.data);
      if (res.data.nodes) {
        setNodes(res.data.nodes);
      }
    } catch (err) {
      // Use default nodes if API not available
      setNodes([
        { id: 'black_hills_primary', name: 'Black Hills Singularity Core', lat: 44.0805, lng: -103.2310, color: '#22C55E', type: 'PRIMARY_ANCHOR', status: 'ACTIVE' },
        { id: 'masonry_school', name: 'Masonry School Node', lat: 43.8, lng: -103.5, color: '#8B5CF6', type: 'ACADEMY_NODE', status: 'ACTIVE' },
        { id: 'rapid_city_core', name: 'Rapid City Resonance Hub', lat: 44.0805, lng: -103.2310, color: '#3B82F6', type: 'HUB_NODE', status: 'ACTIVE' },
        { id: 'kona_hawaii', name: 'Kona Hawaii Wellness Anchor', lat: 19.6400, lng: -155.9969, color: '#F472B6', type: 'WELLNESS_ZONE', status: 'PENDING' },
        { id: 'geneva_jurisdiction', name: 'Geneva International Law Node', lat: 46.2044, lng: 6.1432, color: '#F59E0B', type: 'LAW_NODE', status: 'PENDING' },
        { id: 'tokyo_tech', name: 'Tokyo Engineering Nexus', lat: 35.6762, lng: 139.6503, color: '#EF4444', type: 'TECH_NODE', status: 'PLANNED' },
        { id: 'cairo_ancient', name: 'Cairo Ancient Wisdom Portal', lat: 29.9792, lng: 31.1342, color: '#D97706', type: 'WISDOM_NODE', status: 'PLANNED' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activateNode = async (nodeId) => {
    try {
      const res = await axios.post(`${API}/omnis/expansion/node/activate?node_id=${nodeId}`);
      if (res.data.node) {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'ACTIVE', isActive: true } : n));
        toast.success('Node Activated', { description: res.data.message });
      }
    } catch (err) {
      toast.error('Failed to activate node');
    }
  };

  const launchQuest = async (nodeId) => {
    try {
      const res = await axios.post(`${API}/omnis/nexus/quest/launch?node_id=${nodeId.toUpperCase()}`);
      toast.success('Quest Launched', { description: res.data.quest?.objective });
    } catch (err) {
      toast.info('Quest system ready', { description: 'Navigate to the node location to begin' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full flex flex-col p-4"
        style={{ background: 'transparent' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
          data-testid="close-nodal-map"
        >
          <X size={20} className="text-white/50" />
        </button>

        <div className="w-full max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <Globe size={24} className="text-green-400" />
              Global Nodal Network
            </h2>
            <p className="text-sm text-white/40 mt-2">
              V10013.0 Omni-Expansion • Refracted Crystal Rainbow Projection
            </p>
          </motion.div>

          {/* Map Container */}
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{ 
              background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.05) 0%, rgba(0,0,0,0.15) 70%)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            {/* SVG Map */}
            <svg 
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-auto"
              style={{ minHeight: '400px' }}
            >
              {/* Grid lines */}
              <defs>
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                </pattern>
                
                {/* Gradient for connections */}
                <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              
              <rect width={mapWidth} height={mapHeight} fill="url(#mapGrid)" />
              
              {/* Simplified continent outlines */}
              <g stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none">
                {/* North America */}
                <path d="M 80,100 Q 120,80 180,90 L 200,120 L 180,180 L 140,200 L 100,180 Z" />
                {/* South America */}
                <path d="M 150,220 L 180,250 L 170,320 L 140,340 L 120,300 L 130,250 Z" />
                {/* Europe */}
                <path d="M 380,100 L 420,90 L 460,100 L 450,140 L 400,150 L 380,130 Z" />
                {/* Africa */}
                <path d="M 400,180 L 450,170 L 480,220 L 460,300 L 420,320 L 390,280 L 400,220 Z" />
                {/* Asia */}
                <path d="M 480,80 L 580,60 L 680,100 L 700,180 L 620,200 L 520,170 L 480,130 Z" />
                {/* Australia */}
                <path d="M 640,280 L 700,270 L 720,310 L 680,340 L 640,320 Z" />
              </g>

              {/* Node points */}
              {nodes.map((node) => (
                <NodalPoint
                  key={node.id}
                  node={node}
                  width={mapWidth}
                  height={mapHeight}
                  onSelect={setSelectedNode}
                  isSelected={selectedNode?.id === node.id}
                />
              ))}

              {/* Legend */}
              <g transform={`translate(20, ${mapHeight - 80})`}>
                <text x="0" y="0" fill="rgba(255,255,255,0.4)" fontSize="10">Node Status:</text>
                <circle cx="10" cy="15" r="5" fill="#22C55E" />
                <text x="20" y="18" fill="rgba(255,255,255,0.3)" fontSize="9">Active</text>
                <circle cx="70" cy="15" r="5" fill="rgba(255,255,255,0.3)" />
                <text x="80" y="18" fill="rgba(255,255,255,0.3)" fontSize="9">Pending</text>
                <circle cx="140" cy="15" r="5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" />
                <text x="150" y="18" fill="rgba(255,255,255,0.3)" fontSize="9">Planned</text>
              </g>
            </svg>

            {/* Node count badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs"
                 style={{ background: 'rgba(34,197,94,0.2)', color: '#86EFAC' }}>
              {nodes.filter(n => n.status === 'ACTIVE' || n.isActive).length}/{nodes.length} Active
            </div>
          </div>

          {/* Selected Node Panel */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 p-4 rounded-xl"
                style={{
                  background: `${selectedNode.color}10`,
                  border: `1px solid ${selectedNode.color}40`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <MapPin size={16} style={{ color: selectedNode.color }} />
                      {selectedNode.name}
                    </h3>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedNode.lat.toFixed(4)}°N, {Math.abs(selectedNode.lng).toFixed(4)}°{selectedNode.lng < 0 ? 'W' : 'E'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] uppercase"
                        style={{ 
                          background: `${selectedNode.color}20`,
                          color: selectedNode.color,
                        }}
                      >
                        {NODE_TYPES[selectedNode.type]?.label || selectedNode.type}
                      </span>
                      <span 
                        className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                          selectedNode.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                          selectedNode.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-white/10 text-white/40'
                        }`}
                      >
                        {selectedNode.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedNode.status !== 'ACTIVE' && (
                      <button
                        onClick={() => activateNode(selectedNode.id)}
                        className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all hover:scale-105"
                        style={{
                          background: `${selectedNode.color}20`,
                          border: `1px solid ${selectedNode.color}40`,
                          color: selectedNode.color,
                        }}
                      >
                        <Zap size={14} />
                        Activate
                      </button>
                    )}
                    
                    <button
                      onClick={() => launchQuest(selectedNode.id)}
                      className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all hover:scale-105"
                      style={{
                        background: 'rgba(139,92,246,0.2)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#C4B5FD',
                      }}
                    >
                      <Navigation size={14} />
                      Launch Quest
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
