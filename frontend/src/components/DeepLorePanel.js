/**
 * ENLIGHTEN.MINT.CAFE - V60.0 DEEP LORE PANEL
 * Architecture: Recursive Commonality Display + Cultural Intelligence
 * 
 * This component provides deep multi-layer navigation into constellation mythology.
 * It doesn't stop at the "second layer" — it goes all the way down through:
 * - The Visible (surface)
 * - The Story (middle)
 * - The Lesson (deep)
 * - The Sacred (cross-nodule connections)
 * - Cultural Intelligence (language, tools, inventions)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Star, X, ChevronRight, ChevronDown, BookOpen, Scroll, 
  Sparkles, Eye, Globe, Layers, Link2, Award, Volume2, Pause,
  Compass, Feather, Moon, Sun, Zap, Hammer, Languages, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { CosmicNarrator } from './StarChartAudio';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LAYER_ICONS = {
  surface: Eye,
  middle: BookOpen,
  deep: Sparkles,
  sacred: Feather,
  language: Languages,
  tools: Hammer,
  inventions: Lightbulb,
};

const LAYER_COLORS = {
  surface: '#60A5FA',   // Blue
  middle: '#A78BFA',    // Purple
  deep: '#F472B6',      // Pink
  sacred: '#FBBF24',    // Gold
  language: '#22D3EE',  // Cyan
  tools: '#F97316',     // Orange
  inventions: '#10B981', // Emerald
};

/**
 * Deep Lore Panel - Multi-layer mythology explorer
 */
export function DeepLorePanel({ 
  cultureId, 
  constellationId, 
  cultureColor = '#DC2626',
  onClose,
  onNavigateConstellation,
}) {
  const { token, authHeaders } = useAuth();
  const [deepLore, setDeepLore] = useState(null);
  const [culturalIntel, setCulturalIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLayer, setExpandedLayer] = useState('middle'); // Start with the story
  const [creditAwarded, setCreditAwarded] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [showCulturalIntel, setShowCulturalIntel] = useState(false);

  useEffect(() => {
    if (!cultureId || !constellationId) return;
    
    setLoading(true);
    
    // Fetch both deep lore and cultural intelligence in parallel
    Promise.all([
      axios.get(`${API}/omnis/deep-lore/${cultureId}/${constellationId}`, {
        headers: token ? authHeaders : {}
      }),
      axios.get(`${API}/omnis/cultural-intelligence/${cultureId}?constellation_id=${constellationId}`)
    ])
      .then(([loreRes, intelRes]) => {
        setDeepLore(loreRes.data);
        setCulturalIntel(intelRes.data);
      })
      .catch(() => toast.error('Failed to load deep lore'))
      .finally(() => setLoading(false));
  }, [cultureId, constellationId, token, authHeaders]);

  const awardCredit = async () => {
    if (!token || creditAwarded) return;
    
    try {
      await axios.post(
        `${API}/omnis/award-learning?constellation_id=${constellationId}&culture_id=${cultureId}`,
        {},
        { headers: authHeaders }
      );
      setCreditAwarded(true);
      toast.success('Learning credit awarded!', {
        description: 'Your exploration has been converted to trade credits.',
      });
    } catch {
      toast.error('Could not award credit');
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-20 right-4 w-[420px] max-w-[90vw] rounded-2xl z-30 p-6"
        style={{ 
          background: 'rgba(0,0,0,0)', 
          border: `1px solid ${cultureColor}25`,
          backdropFilter: 'none',
        }}
      >
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" 
            style={{ borderColor: `${cultureColor}40`, borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>Descending into deep lore...</span>
        </div>
      </motion.div>
    );
  }

  if (!deepLore) return null;

  const { constellation, mythology, layers, cross_nodule_connections, related_constellations } = deepLore;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-20 right-4 w-[420px] max-w-[90vw] max-h-[80vh] overflow-hidden rounded-2xl z-30"
      style={{ 
        background: 'rgba(0,0,0,0)', 
        border: `1px solid ${cultureColor}25`,
        backdropFilter: 'none',
        boxShadow: `0 0 40px ${cultureColor}10`,
      }}
      data-testid="deep-lore-panel"
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-5 pt-5 pb-4"
        style={{ background: 'rgba(0,0,0,0)', borderBottom: `1px solid ${cultureColor}15` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${cultureColor}15`, border: `1px solid ${cultureColor}30` }}
            >
              <Star size={18} style={{ color: cultureColor }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: cultureColor }}>
                {constellation.culture} • Deep Lore
              </p>
              <p className="text-lg font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
                {constellation.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            data-testid="close-deep-lore"
          >
            <X size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>
        
        {/* Mythology figure badge */}
        <div className="mt-3 flex items-center gap-2">
          <Feather size={12} style={{ color: cultureColor }} />
          <span className="text-sm font-medium" style={{ color: 'rgba(248,250,252,0.8)' }}>
            {mythology.figure}
          </span>
          {mythology.deity && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>•</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {mythology.deity}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto px-5 pb-5" style={{ maxHeight: 'calc(80vh - 140px)' }}>
        
        {/* Depth Layers - The "goes deep down" navigation */}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <Layers size={10} className="inline mr-1" /> Depth Layers
          </p>
          
          {Object.entries(layers).map(([layerKey, layer]) => {
            const isExpanded = expandedLayer === layerKey;
            const LayerIcon = LAYER_ICONS[layerKey] || Star;
            const layerColor = LAYER_COLORS[layerKey] || cultureColor;
            
            return (
              <div 
                key={layerKey}
                className="rounded-xl overflow-hidden transition-all"
                style={{ 
                  background: isExpanded ? `${layerColor}08` : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${isExpanded ? `${layerColor}25` : 'rgba(248,250,252,0.05)'}`,
                }}
              >
                <button
                  onClick={() => setExpandedLayer(isExpanded ? null : layerKey)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                  data-testid={`layer-${layerKey}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${layerColor}12` }}
                    >
                      <LayerIcon size={14} style={{ color: layerColor }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: isExpanded ? '#F8FAFC' : 'rgba(255,255,255,0.85)' }}>
                      {layer.name}
                    </span>
                  </div>
                  <ChevronRight 
                    size={14} 
                    style={{ 
                      color: 'rgba(255,255,255,0.65)',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }} 
                  />
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4"
                    >
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.85)', fontFamily: layerKey === 'deep' ? 'Cormorant Garamond, serif' : 'inherit' }}
                      >
                        {layer.description}
                      </p>
                      
                      {/* Narration for story/lesson layers */}
                      {(layerKey === 'middle' || layerKey === 'deep') && token && (
                        <div className="mt-3">
                          <CosmicNarrator 
                            text={layer.description} 
                            constellationName={constellation.name}
                            color={layerColor}
                            authHeaders={authHeaders}
                            token={token}
                            compact
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Cross-Nodule Connections */}
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <Link2 size={10} className="inline mr-1" /> Cross-Nodule Connections
          </p>
          
          <div className="space-y-2">
            {Object.entries(cross_nodule_connections).map(([nodule, data]) => (
              <div 
                key={nodule}
                className="p-3 rounded-xl"
                style={{ 
                  background: 'rgba(248,250,252,0.02)',
                  border: '1px solid rgba(248,250,252,0.05)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: cultureColor }}>
                    The {nodule}
                  </span>
                  <ChevronRight size={10} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {data.connection}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {data.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* V55.1 Cultural Intelligence Section */}
        {culturalIntel && (
          <div className="mt-6">
            <button
              onClick={() => setShowCulturalIntel(!showCulturalIntel)}
              className="w-full flex items-center justify-between"
            >
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: LAYER_COLORS.language }}>
                <Languages size={10} className="inline mr-1" /> Cultural Intelligence
              </p>
              <ChevronRight 
                size={12} 
                style={{ 
                  color: LAYER_COLORS.language,
                  transform: showCulturalIntel ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }} 
              />
            </button>
            
            <AnimatePresence>
              {showCulturalIntel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-4"
                >
                  {/* Language Terms */}
                  <div 
                    className="p-3 rounded-xl"
                    style={{ background: `${LAYER_COLORS.language}08`, border: `1px solid ${LAYER_COLORS.language}20` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Languages size={12} style={{ color: LAYER_COLORS.language }} />
                      <span className="text-xs font-medium" style={{ color: LAYER_COLORS.language }}>
                        {culturalIntel.language} Terms
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(culturalIntel.terms || {}).slice(0, 6).map(([key, term]) => (
                        <div 
                          key={key}
                          className="px-2 py-1 rounded text-[10px]"
                          style={{ background: `${LAYER_COLORS.language}15`, color: 'rgba(255,255,255,0.9)' }}
                        >
                          <span style={{ color: LAYER_COLORS.language }}>{term}</span>
                          <span className="opacity-50 ml-1">({key})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tools */}
                  <div 
                    className="p-3 rounded-xl"
                    style={{ background: `${LAYER_COLORS.tools}08`, border: `1px solid ${LAYER_COLORS.tools}20` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Hammer size={12} style={{ color: LAYER_COLORS.tools }} />
                      <span className="text-xs font-medium" style={{ color: LAYER_COLORS.tools }}>
                        Traditional Tools
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(culturalIntel.tools || []).map((tool, idx) => (
                        <div 
                          key={idx}
                          className="px-2 py-1 rounded text-[10px]"
                          style={{ background: `${LAYER_COLORS.tools}15`, color: 'rgba(255,255,255,0.9)' }}
                        >
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inventions */}
                  <div 
                    className="p-3 rounded-xl"
                    style={{ background: `${LAYER_COLORS.inventions}08`, border: `1px solid ${LAYER_COLORS.inventions}20` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={12} style={{ color: LAYER_COLORS.inventions }} />
                      <span className="text-xs font-medium" style={{ color: LAYER_COLORS.inventions }}>
                        Inventions & Discoveries
                      </span>
                    </div>
                    <div className="space-y-1">
                      {(culturalIntel.inventions || []).map((inv, idx) => (
                        <div 
                          key={idx}
                          className="text-xs"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                        >
                          • {inv}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Geometry */}
                  <div 
                    className="p-3 rounded-xl text-center"
                    style={{ background: `${cultureColor}10`, border: `1px solid ${cultureColor}20` }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Geometric Foundation
                    </p>
                    <p className="text-sm font-medium" style={{ color: cultureColor }}>
                      {culturalIntel.geometry}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Related Constellations */}
        {related_constellations.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
              <Compass size={10} className="inline mr-1" /> Related Constellations
            </p>
            
            <div className="flex flex-wrap gap-2">
              {related_constellations.map((rel) => (
                <button
                  key={`${rel.culture_id}-${rel.id}`}
                  onClick={() => onNavigateConstellation && onNavigateConstellation(rel.culture_id, rel.id)}
                  className="px-3 py-2 rounded-lg text-xs transition-all hover:scale-105"
                  style={{ 
                    background: 'rgba(248,250,252,0.03)',
                    border: '1px solid rgba(248,250,252,0.08)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                  data-testid={`related-${rel.id}`}
                >
                  <span className="font-medium">{rel.name}</span>
                  <span className="ml-1 opacity-50">• {rel.culture}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stars in this constellation */}
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <Star size={10} className="inline mr-1" /> Stars ({constellation.stars?.length || 0})
          </p>
          
          <div className="flex flex-wrap gap-2">
            {(constellation.stars || []).map((star, idx) => (
              <div 
                key={idx}
                className="px-2 py-1 rounded text-[10px]"
                style={{ 
                  background: `${cultureColor}10`,
                  border: `1px solid ${cultureColor}20`,
                  color: cultureColor,
                }}
              >
                {star.name} <span className="opacity-50">(mag {star.mag})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Award Learning Credit Button */}
        {token && !creditAwarded && (
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(248,250,252,0.05)' }}>
            <button
              onClick={awardCredit}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${cultureColor}20, ${cultureColor}10)`,
                border: `1px solid ${cultureColor}30`,
                color: cultureColor,
              }}
              data-testid="award-credit-btn"
            >
              <Award size={14} />
              Claim Learning Credit (2.5 Fans)
            </button>
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
              15 minutes of deep exploration → 10 Fans/hr rate
            </p>
          </div>
        )}

        {creditAwarded && (
          <div 
            className="mt-6 p-3 rounded-xl text-center"
            style={{ background: `${cultureColor}10`, border: `1px solid ${cultureColor}20` }}
          >
            <Sparkles size={14} style={{ color: cultureColor }} className="inline mr-2" />
            <span className="text-xs" style={{ color: cultureColor }}>Learning credit awarded!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Culture Selector with Lakota as foundational
 */
export function CultureSelector({ 
  cultures, 
  activeCulture, 
  onSelect, 
  cultureColor = '#818CF8',
  loading = false,
}) {
  const foundational = cultures.find(c => c.is_foundational);
  const orbitals = cultures.filter(c => !c.is_foundational);

  return (
    <div 
      className="absolute top-32 left-4 w-80 max-w-[85vw] max-h-[70vh] overflow-y-auto rounded-2xl z-20"
      style={{ 
        background: 'rgba(0,0,0,0)', 
        border: '1px solid rgba(248,250,252,0.08)',
        backdropFilter: 'none',
      }}
      data-testid="culture-selector"
    >
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <Globe size={10} className="inline mr-1" /> 21 World Sky Systems
        </p>

        {/* Foundational Culture (Lakota) */}
        {foundational && (
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: foundational.color }}>
              <Feather size={9} className="inline mr-1" /> Foundational Layer
            </p>
            <button
              onClick={() => onSelect(foundational.id)}
              className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
              style={{
                background: activeCulture === foundational.id ? `${foundational.color}15` : 'rgba(248,250,252,0.02)',
                border: `1px solid ${activeCulture === foundational.id ? `${foundational.color}40` : 'rgba(248,250,252,0.06)'}`,
                boxShadow: activeCulture === foundational.id ? `0 0 20px ${foundational.color}10` : 'none',
              }}
              data-testid={`culture-${foundational.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: foundational.color }}>
                  {foundational.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${foundational.color}20`, color: foundational.color }}>
                  {foundational.constellation_count} constellations
                </span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Black Hills (He Sapa) • Sacred Mirror
              </p>
            </button>
          </div>
        )}

        {/* Orbital Cultures */}
        <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Orbital Systems ({orbitals.length})
        </p>
        <div className="space-y-1.5">
          {orbitals.map(culture => (
            <button
              key={culture.id}
              onClick={() => onSelect(culture.id)}
              className="w-full p-2.5 rounded-lg text-left transition-all hover:bg-white/5"
              style={{
                background: activeCulture === culture.id ? `${culture.color}12` : 'transparent',
                border: `1px solid ${activeCulture === culture.id ? `${culture.color}30` : 'transparent'}`,
              }}
              data-testid={`culture-${culture.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: activeCulture === culture.id ? culture.color : 'rgba(255,255,255,0.85)' }}>
                  {culture.name}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {culture.constellation_count}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Clear Selection */}
        {activeCulture && (
          <button
            onClick={() => onSelect(null)}
            className="w-full mt-4 py-2 rounded-lg text-xs"
            style={{ 
              background: 'rgba(248,250,252,0.03)',
              border: '1px solid rgba(248,250,252,0.06)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <X size={10} className="inline mr-1" /> Clear Culture Filter
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Commonality Groups Display
 */
export function CommonalityDisplay({ syncData }) {
  if (!syncData) return null;

  const groups = [
    { key: 'COSMOS', name: 'The Cosmos', icon: Star, color: '#818CF8' },
    { key: 'CRAFT', name: 'The Craft', icon: Zap, color: '#F472B6' },
    { key: 'HARVEST', name: 'The Harvest', icon: Sun, color: '#22C55E' },
    { key: 'EXCHANGE', name: 'The Exchange', icon: Award, color: '#FBBF24' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {groups.map(({ key, name, icon: Icon, color }) => {
        const data = syncData.interconnected_data?.[key];
        if (!data) return null;

        return (
          <div
            key={key}
            className="p-3 rounded-xl"
            style={{
              background: `${color}08`,
              border: `1px solid ${color}20`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs font-medium" style={{ color }}>{name}</span>
            </div>
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {key === 'COSMOS' && `${data.culture_name} • ${data.constellation_count} constellations`}
              {key === 'CRAFT' && `${data.lessons_completed} lessons • ${data.credit_yield}hr yield`}
              {key === 'HARVEST' && `${data.body_vitality} • ${data.herbal_logic}`}
              {key === 'EXCHANGE' && `$${data.balance?.toFixed(2) || '0.00'} balance`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DeepLorePanel;
