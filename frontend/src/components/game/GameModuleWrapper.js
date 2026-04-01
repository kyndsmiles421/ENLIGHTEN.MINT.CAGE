import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  UNIVERSAL GAME MODULE WRAPPER
//  Provides the full 5-Rule Distortion Compositor
//  as a visual overlay for ANY game module.
//
//  Layer Stack (bottom → top):
//    1. Game content (children)
//    2. HarmonyGlow (element-colored ambient)
//    3. EntropyLayer (blur/flicker from low harmony)
//    4. ElementalTintLayer (element-colored radial tint)
//    5. DecayDistortionLayer (scan lines from staleness)
//    6. FractureLayer (crack lines on destructive cycle)
//    7. MantraRipple (expanding rings on active resonance)
//    8. GrainOverlay (subtle noise)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EL_COLORS = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };

// Rule 1: Entropy — Blur & Flicker based on harmony score
function EntropyLayer({ harmony }) {
  const blur = harmony >= 80 ? 0 : harmony >= 50 ? 0.5 : harmony >= 30 ? 1.5 : 3;
  const flickerOpacity = harmony < 40 ? 0.06 : 0;
  return (
    <>
      {blur > 0 && <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{ backdropFilter: `blur(${blur}px) saturate(${harmony >= 50 ? 1 : 0.7})` }} />}
      {flickerOpacity > 0 && (
        <motion.div className="absolute inset-0 pointer-events-none z-[2]"
          animate={{ opacity: [0, flickerOpacity, 0, flickerOpacity * 0.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'steps(5)' }}
          style={{ background: 'rgba(255,255,255,0.03)' }} />
      )}
    </>
  );
}

// Rule 2: Elemental Tinting — dominant element colors the atmosphere
function ElementalTintLayer({ dominantElement, dominantPercentage }) {
  const intensity = Math.min(0.12, (dominantPercentage - 20) * 0.004);
  if (intensity <= 0) return null;
  const tints = {
    wood: { grad: `rgba(34,197,94,${intensity})`, anim: { x: [0, 3, -3, 0], y: [0, 2, -1, 0] }, dur: 6 },
    fire: { grad: `rgba(239,68,68,${intensity})`, anim: { scale: [1, 1.02, 1] }, dur: 3 },
    water: { grad: `rgba(59,130,246,${intensity})`, anim: { y: [0, -2, 2, 0] }, dur: 8 },
    earth: { grad: `rgba(245,158,11,${intensity})`, anim: { y: [0, 1, 0] }, dur: 10 },
    metal: { grad: `rgba(148,163,184,${intensity})`, anim: { x: [0, 5, 0] }, dur: 5 },
  };
  const t = tints[dominantElement] || tints.water;
  return (
    <motion.div className="absolute inset-0 pointer-events-none z-[3]"
      animate={t.anim} transition={{ duration: t.dur, repeat: Infinity, ease: 'easeInOut' }}
      style={{ background: `radial-gradient(ellipse at 50% 50%, ${t.grad}, transparent 70%)` }} />
  );
}

// Rule 3: Decay Distortion — scan lines & corruption from stale practices
function DecayDistortionLayer({ avgFreshness }) {
  const intensity = Math.max(0, (100 - avgFreshness) / 100);
  if (intensity < 0.3) return null;
  const count = Math.min(6, Math.round(intensity * 8));
  return (
    <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden">
      {intensity > 0.5 && (
        <motion.div className="absolute inset-0"
          style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,${intensity * 0.015}) 3px, rgba(255,255,255,${intensity * 0.015}) 4px)` }}
          animate={{ y: [0, -4, 0] }} transition={{ duration: 0.3, repeat: Infinity }} />
      )}
      {[...Array(count)].map((_, i) => (
        <motion.div key={i} className="absolute"
          style={{ width: `${12 + i * 5}px`, height: '2px', background: `rgba(255,255,255,${intensity * 0.08})`, top: `${10 + i * 14}%`, left: `${5 + i * 12}%` }}
          animate={{ x: [0, (i % 2 === 0 ? 6 : -6) * intensity, 0], opacity: [0, intensity * 0.15, 0] }}
          transition={{ duration: 0.15 + Math.random() * 0.3, repeat: Infinity, repeatDelay: 2 + Math.random() * 4 }} />
      ))}
    </div>
  );
}

// Rule 4: Fracture — red crack lines during destructive harmony cycle
function FractureLayer({ cycle, harmony }) {
  if (cycle !== 'destructive' && harmony >= 50) return null;
  const count = cycle === 'destructive' ? 5 : 2;
  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div key={i} className="absolute"
          style={{
            width: `${40 + i * 20}px`, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.06), transparent)',
            top: `${20 + i * 12}%`, left: `${10 + i * 15}%`, transform: `rotate(${15 + i * 30}deg)`,
          }}
          animate={{ opacity: [0, 0.06, 0], scaleX: [0.5, 1, 0.5] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }} />
      ))}
      {cycle === 'destructive' && (
        <>
          <motion.div className="absolute top-2 left-2 w-6 h-6"
            style={{ borderTop: '1px solid rgba(239,68,68,0.08)', borderLeft: '1px solid rgba(239,68,68,0.08)' }}
            animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.div className="absolute bottom-2 right-2 w-6 h-6"
            style={{ borderBottom: '1px solid rgba(239,68,68,0.08)', borderRight: '1px solid rgba(239,68,68,0.08)' }}
            animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
        </>
      )}
    </div>
  );
}

// Rule 5: Mantra Ripple — expanding rings on active resonance (e.g. mining action)
function MantraRipple({ active, color }) {
  if (!active) return null;
  return (
    <motion.div className="absolute inset-0 pointer-events-none z-[10] flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          initial={{ width: 10, height: 10, opacity: 0.5 }}
          animate={{ width: [10, 400], height: [10, 400], opacity: [0.4, 0] }}
          transition={{ duration: 2, delay: i * 0.4, ease: 'easeOut' }}
          style={{ border: `2px solid ${color || '#A855F7'}30`, boxShadow: `0 0 20px ${color || '#A855F7'}15` }} />
      ))}
    </motion.div>
  );
}

// Ambient grain overlay
function GrainOverlay({ opacity }) {
  if (opacity < 0.005) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-[6]"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        mixBlendMode: 'overlay',
      }}
    />
  );
}

// Harmony-based ambient glow (bottom layer)
function HarmonyGlow({ element, intensity }) {
  const color = EL_COLORS[element] || '#A855F7';
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-0"
      animate={{ opacity: [intensity * 0.03, intensity * 0.08, intensity * 0.03] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${color}15, transparent 70%)`,
      }}
    />
  );
}

// Entropy status label for HUD overlay
function EntropyIndicator({ harmony, layerName, layerColor }) {
  const label = harmony >= 80 ? 'Clear' : harmony >= 50 ? 'Shifting' : harmony >= 30 ? 'Blurred' : 'De-Rezzed';
  const color = harmony >= 80 ? '#22C55E' : harmony >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="absolute top-2 right-2 z-[20] flex items-center gap-1.5">
      {layerName && (
        <div className="px-2 py-0.5 rounded-lg text-[7px] font-bold uppercase tracking-wider"
          style={{ background: `${layerColor || '#A855F7'}10`, color: layerColor || '#A855F7', border: `1px solid ${layerColor || '#A855F7'}15` }}
          data-testid="layer-indicator">
          {layerName}
        </div>
      )}
      <div className="px-2 py-0.5 rounded-lg text-[7px] font-bold uppercase tracking-wider"
        style={{ background: `${color}10`, color, border: `1px solid ${color}15` }}
        data-testid="entropy-indicator">
        {label}
      </div>
    </div>
  );
}

// Layer-specific ambient tint overlay
function LayerTintOverlay({ layerColor, entropy }) {
  if (!layerColor || entropy <= 0) return null;
  return (
    <motion.div className="absolute inset-0 pointer-events-none z-[7]"
      animate={{ opacity: [entropy * 0.03, entropy * 0.08, entropy * 0.03] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${layerColor}12, transparent 70%)`,
      }}
    />
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN WRAPPER — Composites all 5 rules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function GameModuleWrapper({
  children,
  harmonyScore = 50,
  dominantElement = 'earth',
  dominantPercentage = 20,
  harmonyCycle = 'neutral',
  decayActivity = null,
  mantraActive = false,
  mantraColor = '#A855F7',
  moduleName = 'unknown',
  showEntropyIndicator = true,
  // Layer system
  layerData = null,
  activeLayer = 'terrestrial',
  // Visual directives from The Brain (Scenario Generator)
  visualDirectives = null,
  biomeContext = null,
}) {
  // Compute avg freshness from decay activity
  const avgFreshness = useMemo(() => {
    if (!decayActivity) return 100;
    const vals = Object.values(decayActivity);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 100;
  }, [decayActivity]);

  // Layer entropy amplifies grain/blur
  const layerEntropy = layerData?.entropy || 0;
  const grainOpacity = useMemo(() => {
    // If Brain provides a directive, use it; otherwise compute
    if (visualDirectives?.grain) return visualDirectives.grain;
    const base = Math.max(0.01, (100 - harmonyScore) / 500);
    return base + layerEntropy * 0.06;
  }, [harmonyScore, layerEntropy, visualDirectives]);

  // Effective harmony — Void/Astral layers reduce effective clarity
  const effectiveHarmony = useMemo(() => {
    if (activeLayer === 'nexus') return Math.max(harmonyScore, 80);
    return Math.max(0, harmonyScore - layerEntropy * 30);
  }, [harmonyScore, layerEntropy, activeLayer]);

  const layerColor = layerData?.color || null;

  // Biome-driven tint (from Dream Realms active biome)
  const biomeTint = biomeContext?.color_primary || null;

  return (
    <div className="relative min-h-screen overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
      data-testid={`game-module-${moduleName}`}>

      {/* Layer 0: Harmony Glow */}
      <HarmonyGlow element={dominantElement} intensity={harmonyScore / 100} />

      {/* Layer 1: Game Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Layer 2-7: Distortion Compositor overlay (The Skin) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[30]"
        data-testid="distortion-compositor">
        {/* Rule 1: Entropy blur/flicker */}
        <EntropyLayer harmony={effectiveHarmony} />
        {/* Rule 2: Element tinting from Nexus state */}
        <ElementalTintLayer dominantElement={dominantElement} dominantPercentage={dominantPercentage} />
        {/* Rule 3: Decay distortion from stale practices */}
        <DecayDistortionLayer avgFreshness={avgFreshness} />
        {/* Rule 4: Fracture lines on destructive cycle */}
        <FractureLayer cycle={harmonyCycle} harmony={effectiveHarmony} />
        {/* Rule 5: Layer-specific tint overlay */}
        <LayerTintOverlay layerColor={layerColor} entropy={layerEntropy} />
        {/* Biome tint from active Dream Realm */}
        {biomeTint && <LayerTintOverlay layerColor={biomeTint} entropy={0.3} />}
        {/* Mantra ripple on game action */}
        <AnimatePresence>
          {mantraActive && <MantraRipple active={mantraActive} color={mantraColor} />}
        </AnimatePresence>
        {/* Ambient grain */}
        <GrainOverlay opacity={grainOpacity} />
      </div>

      {/* HUD Layer: Layer + Entropy indicators */}
      {showEntropyIndicator && (
        <EntropyIndicator
          harmony={effectiveHarmony}
          layerName={layerData?.name}
          layerColor={layerColor}
        />
      )}
    </div>
  );
}
