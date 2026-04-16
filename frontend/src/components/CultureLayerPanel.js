import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Loader2, ChevronDown, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

function CultureCard({ layer, isActive, onToggle, isLoading }) {
  return (
    <motion.button
      className="w-full text-left p-3 rounded-lg cursor-pointer transition-all"
      style={{
        background: isActive ? `${layer.primary_color}12` : 'rgba(248,250,252,0.02)',
        border: `1px solid ${isActive ? layer.primary_color + '40' : 'rgba(248,250,252,0.06)'}`,
      }}
      onClick={() => onToggle(layer.id)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      data-testid={`culture-layer-${layer.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full"
            style={{ background: layer.primary_color, boxShadow: isActive ? `0 0 8px ${layer.primary_color}60` : 'none' }} />
          <span className="text-xs font-medium" style={{ color: isActive ? layer.primary_color : 'rgba(255,255,255,0.9)' }}>
            {layer.name}
          </span>
        </div>
        {isLoading ? (
          <Loader2 size={10} className="animate-spin" style={{ color: layer.primary_color }} />
        ) : (
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {layer.constellation_count} formations
          </span>
        )}
      </div>
      <p className="text-[9px] mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
        {layer.culture} / {layer.frequency}Hz
      </p>
    </motion.button>
  );
}

function TeachingCard({ teaching, color, index }) {
  return (
    <motion.div
      className="p-2.5 rounded-lg"
      style={{ background: `${color}08`, border: `1px solid ${color}12` }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <p className="text-[9px] leading-relaxed italic" style={{ color: `${color}90`, fontFamily: 'Cormorant Garamond, serif' }}>
        "{teaching}"
      </p>
    </motion.div>
  );
}

// ━━━ Culture Layer Panel — Toggleable overlay for Star Chart ━━━
export default function CultureLayerPanel({ onLayerData }) {
  const { authHeaders } = useAuth();
  const [layers, setLayers] = useState([]);
  const [activeLayers, setActiveLayers] = useState(new Set());
  const [loadedData, setLoadedData] = useState({});
  const [loading, setLoading] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [activeTeachings, setActiveTeachings] = useState(null);

  // Fetch layer metadata
  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    axios.get(`${API}/api/culture-layers/`, { headers: authHeaders })
      .then(res => setLayers(res.data?.layers || []))
      .catch(() => {});
  }, [authHeaders]);

  // Toggle a culture layer
  const toggleLayer = useCallback(async (layerId) => {
    if (activeLayers.has(layerId)) {
      // Deactivate
      setActiveLayers(prev => { const n = new Set(prev); n.delete(layerId); return n; });
      if (onLayerData) onLayerData(layerId, null);
      return;
    }

    // Activate — lazy-load full data if not cached
    if (!loadedData[layerId]) {
      setLoading(prev => ({ ...prev, [layerId]: true }));
      try {
        const res = await axios.get(`${API}/api/culture-layers/${layerId}`, { headers: authHeaders });
        setLoadedData(prev => ({ ...prev, [layerId]: res.data }));
        if (onLayerData) onLayerData(layerId, res.data);
      } catch { return; }
      finally { setLoading(prev => ({ ...prev, [layerId]: false })); }
    } else {
      if (onLayerData) onLayerData(layerId, loadedData[layerId]);
    }

    setActiveLayers(prev => new Set(prev).add(layerId));
  }, [activeLayers, loadedData, authHeaders, onLayerData]);

  if (layers.length === 0) return null;

  return (
    <div className="flex flex-col gap-1" data-testid="culture-layer-panel">
      {/* Toggle button */}
      <motion.button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
        style={{
          background: expanded ? 'rgba(248,250,252,0.06)' : 'rgba(248,250,252,0.03)',
          border: `1px solid rgba(248,250,252,${expanded ? '0.1' : '0.05'})`,
        }}
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.02 }}
        data-testid="culture-layer-toggle"
      >
        <Globe size={11} style={{ color: activeLayers.size > 0 ? '#A78BFA' : 'rgba(255,255,255,0.7)' }} />
        <span className="text-[9px] tracking-wider uppercase"
          style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Cormorant Garamond, serif' }}>
          Culture Layers {activeLayers.size > 0 && `(${activeLayers.size})`}
        </span>
        <ChevronDown size={9} className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'rgba(255,255,255,0.65)' }} />
      </motion.button>

      {/* Layer cards */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="flex flex-col gap-1.5 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {layers.map(layer => (
              <CultureCard
                key={layer.id}
                layer={layer}
                isActive={activeLayers.has(layer.id)}
                onToggle={toggleLayer}
                isLoading={loading[layer.id]}
              />
            ))}

            {/* Teachings for active layers */}
            {Array.from(activeLayers).map(layerId => {
              const data = loadedData[layerId];
              if (!data?.teachings) return null;
              return (
                <div key={`teachings-${layerId}`} className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-1 px-1">
                    <BookOpen size={8} style={{ color: data.accent_color }} />
                    <span className="text-[8px] uppercase tracking-widest" style={{ color: `${data.accent_color}70` }}>
                      {data.culture} Teachings
                    </span>
                  </div>
                  {data.teachings.map((t, i) => (
                    <TeachingCard key={i} teaching={t} color={data.accent_color} index={i} />
                  ))}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
