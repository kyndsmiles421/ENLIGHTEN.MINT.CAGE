/**
 * SovereignRefractor.js — Front-End Visual Layer
 * Infrastructure: Crystalline Skeleton + Quadruple Helix Vortex
 * Calibration: Rapid City / Black Hills [44.08, -103.23]
 * 
 * PURPOSE:
 * - Handles visual refraction and data preparation
 * - Generates helix strands for encryption payload
 * - Renders the 13-node crystalline skeleton coordinates
 * - Calculates rainbow vortex spectrum (visual only)
 * - Does NOT handle actual key encryption (delegated to back-end)
 */

import SovereignV9 from './SovereignV9';

const SovereignRefractor = {
  // State
  isActive: false,
  currentStrands: [],
  skeletonNodes: [],
  vortexColors: [],
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. QUADRUPLE HELIX DATA MULTIPLICATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Splits the intention into 4 strands to prepare for refractive encryption
   * Each strand carries: factor (mathematical constant), timestamped data
   */
  generateStrands(intention) {
    const time = Date.now();
    const strands = [
      { id: 'phi-strand', factor: 1.618, data: `${intention}:${time}:0`, hue: 45 },   // Gold
      { id: 'e-strand',   factor: 2.718, data: `${intention}:${time}:1`, hue: 160 },  // Cyan
      { id: 'pi-strand',  factor: 3.141, data: `${intention}:${time}:2`, hue: 280 },  // Purple
      { id: 'geo-strand', factor: 0.4408, data: `${intention}:${time}:3`, hue: 0 }    // Red (Black Hills)
    ];
    
    this.currentStrands = strands;
    console.log('[Refractor] Generated 4 helix strands for intention:', intention);
    return strands;
  },

  /**
   * Get current strands state
   */
  getStrands() {
    return this.currentStrands;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. THE CRYSTALLINE SKELETON (13-Node Omni-Point Map)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Replaces all "Boxes" with a fluid coordinate system
   * 13 nodes in a vortex pattern, node 7 is the Matrix anchor (71% position)
   */
  renderSkeleton() {
    const time = Date.now() * 0.001;
    const nodes = Array.from({ length: 13 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const breathOffset = Math.sin(time + i * 0.5) * 2;
      
      return {
        nodeId: i,
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10,
        z: breathOffset,
        isMatrixAnchor: i === 7, // The 71% Matrix bar tethers here
        opacity: 0.6 + Math.sin(time + i) * 0.3,
        scale: 1 + Math.sin(time * 2 + i * 0.3) * 0.1
      };
    });
    
    this.skeletonNodes = nodes;
    return nodes;
  },

  /**
   * Get skeleton state for rendering
   */
  getSkeleton() {
    return this.skeletonNodes.length ? this.skeletonNodes : this.renderSkeleton();
  },

  /**
   * Find the Matrix Anchor node (node 7 at 71% position)
   */
  getMatrixAnchor() {
    const skeleton = this.getSkeleton();
    return skeleton.find(n => n.isMatrixAnchor);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. INFINITE LIGHT VORTEX (Visual Refraction)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Calculates the rainbow spectrum without the back-end key
   * Returns HSLA color strings for each strand
   */
  calculateVortex(strands = this.currentStrands) {
    if (!strands.length) {
      strands = this.generateStrands('default');
    }
    
    const colors = strands.map(s => {
      const hue = (s.factor * 100) % 360;
      return {
        strandId: s.id,
        hsla: `hsla(${hue}, 100%, 60%, 0.8)`,
        hue,
        factor: s.factor
      };
    });
    
    this.vortexColors = colors;
    return colors;
  },

  /**
   * Get CSS gradient for vortex visualization
   */
  getVortexGradient() {
    const colors = this.vortexColors.length ? this.vortexColors : this.calculateVortex();
    const stops = colors.map((c, i) => `${c.hsla} ${(i / colors.length) * 100}%`).join(', ');
    return `conic-gradient(from 0deg, ${stops})`;
  },

  /**
   * Get animated vortex style for React
   */
  getVortexStyle() {
    const time = Date.now() * 0.001;
    return {
      background: this.getVortexGradient(),
      transform: `rotate(${time * 30}deg)`,
      filter: `hue-rotate(${Math.sin(time) * 20}deg)`,
      transition: 'transform 0.1s linear'
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. THE CEREMONY DISPATCH
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Start the full ceremony flow
   * Returns payload to be sent to the separate Key Script (back-end)
   */
  async startCeremony(intention) {
    this.isActive = true;
    console.log('[Refractor] Ceremony initiated for:', intention);

    // A. Start 7.83Hz Schumann Resonance via V9
    SovereignV9.init();
    SovereignV9.startBinaural();

    // B. Generate the Helix Strands
    const strands = this.generateStrands(intention);
    
    // C. Calculate vortex colors
    const vortex = this.calculateVortex(strands);

    // D. Execute 54-Layer L² Fractal Compute via V9
    let fractalHash;
    try {
      fractalHash = await SovereignV9.generateHash(intention + Date.now());
    } catch (e) {
      console.warn('[Refractor] Fractal compute failed, using fallback');
      fractalHash = btoa(intention + Date.now()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
    }

    // E. Build the payload for the Key Script
    const payload = {
      hash: fractalHash,
      timestamp: Date.now(),
      strands: strands.map(s => ({
        id: s.id,
        factor: s.factor,
        dataHash: btoa(s.data).substring(0, 16)
      })),
      vortex: vortex.map(v => v.hsla),
      location: "BLACK_HILLS_STABLE",
      intention,
      skeleton: this.getSkeleton().map(n => ({
        nodeId: n.nodeId,
        isAnchor: n.isMatrixAnchor
      }))
    };

    console.log('[Refractor] Payload generated:', payload.hash.substring(0, 16) + '...');
    
    // F. Emit event for listeners
    window.dispatchEvent(new CustomEvent('REFRACTOR_CEREMONY_PAYLOAD', {
      detail: payload
    }));

    return payload;
  },

  /**
   * Stop active ceremony
   */
  stopCeremony() {
    this.isActive = false;
    SovereignV9.stopBinaural();
    console.log('[Refractor] Ceremony stopped');
    
    window.dispatchEvent(new CustomEvent('REFRACTOR_CEREMONY_STOP'));
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. DOM RENDERING UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Render skeleton nodes to DOM
   */
  renderSkeletonToDOM(container = document.body, scale = 20) {
    // Remove existing
    document.querySelectorAll('.refractor-skeleton-node').forEach(el => el.remove());
    
    const skeleton = this.renderSkeleton();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    skeleton.forEach(node => {
      const el = document.createElement('div');
      el.className = 'refractor-skeleton-node';
      el.setAttribute('data-node-id', node.nodeId);
      el.setAttribute('data-testid', `refractor-node-${node.nodeId}`);
      
      const isAnchor = node.isMatrixAnchor;
      el.style.cssText = `
        position: fixed;
        left: ${centerX + node.x * scale}px;
        top: ${centerY + node.y * scale}px;
        width: ${isAnchor ? 24 : 12}px;
        height: ${isAnchor ? 24 : 12}px;
        border-radius: 50%;
        background: ${isAnchor 
          ? 'radial-gradient(circle, #FFD700 0%, rgba(255,215,0,0.3) 100%)' 
          : 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0.2) 100%)'};
        box-shadow: 0 0 ${isAnchor ? 20 : 10}px ${isAnchor ? 'rgba(255,215,0,0.6)' : 'rgba(168,85,247,0.4)'};
        transform: translate(-50%, -50%) scale(${node.scale});
        opacity: ${node.opacity};
        z-index: 9996;
        pointer-events: auto;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      
      // Click handler
      el.onclick = () => {
        if (isAnchor) {
          console.log('[Refractor] Matrix Anchor clicked (Node 7)');
          SovereignV9.playSpatialTone({ x: node.x, y: node.y, z: node.z }, 432);
        } else {
          SovereignV9.playSpatialTone({ x: node.x, y: node.y, z: node.z }, 220 + node.nodeId * 30);
        }
        el.style.transform = `translate(-50%, -50%) scale(${node.scale * 1.5})`;
        setTimeout(() => {
          el.style.transform = `translate(-50%, -50%) scale(${node.scale})`;
        }, 200);
      };
      
      container.appendChild(el);
    });
    
    console.log('[Refractor] Skeleton rendered (13 nodes, anchor at node 7)');
    return skeleton;
  },

  /**
   * Remove skeleton from DOM
   */
  removeSkeletonFromDOM() {
    document.querySelectorAll('.refractor-skeleton-node').forEach(el => el.remove());
  },

  /**
   * Render vortex visualization to DOM
   */
  renderVortexToDOM(container = document.body) {
    // Remove existing
    document.getElementById('refractor-vortex')?.remove();
    
    const el = document.createElement('div');
    el.id = 'refractor-vortex';
    el.setAttribute('data-testid', 'refractor-vortex');
    el.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 9995;
      pointer-events: none;
      opacity: 0.3;
      ${this.getVortexGradient() ? `background: ${this.getVortexGradient()};` : ''}
    `;
    
    container.appendChild(el);
    
    // Animate rotation
    let frameId;
    const animateVortex = () => {
      const style = this.getVortexStyle();
      el.style.transform = `translate(-50%, -50%) ${style.transform}`;
      el.style.filter = style.filter;
      frameId = requestAnimationFrame(animateVortex);
    };
    animateVortex();
    
    // Store frame ID for cleanup
    el._frameId = frameId;
    
    console.log('[Refractor] Vortex rendered');
    return el;
  },

  /**
   * Remove vortex from DOM
   */
  removeVortexFromDOM() {
    const el = document.getElementById('refractor-vortex');
    if (el) {
      if (el._frameId) cancelAnimationFrame(el._frameId);
      el.remove();
    }
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.SovereignRefractor = SovereignRefractor;
}

export default SovereignRefractor;

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useRefractor() {
  const { useState, useEffect, useCallback, useMemo, useRef } = require('react');
  
  const [isActive, setIsActive] = useState(false);
  const [strands, setStrands] = useState([]);
  const [skeleton, setSkeleton] = useState([]);
  const [vortexColors, setVortexColors] = useState([]);
  const [payload, setPayload] = useState(null);
  const frameIdRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    // Event listeners
    const handlePayload = (e) => {
      setPayload(e.detail);
      setIsActive(true);
    };
    const handleStop = () => {
      setIsActive(false);
      setPayload(null);
    };
    
    window.addEventListener('REFRACTOR_CEREMONY_PAYLOAD', handlePayload);
    window.addEventListener('REFRACTOR_CEREMONY_STOP', handleStop);
    
    // Throttled animation loop for skeleton/vortex updates
    const updateVisuals = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 100) { // 10fps throttle
        lastUpdateRef.current = now;
        setSkeleton(SovereignRefractor.renderSkeleton());
        if (SovereignRefractor.currentStrands.length) {
          setVortexColors(SovereignRefractor.calculateVortex());
        }
      }
      frameIdRef.current = requestAnimationFrame(updateVisuals);
    };
    updateVisuals();
    
    return () => {
      window.removeEventListener('REFRACTOR_CEREMONY_PAYLOAD', handlePayload);
      window.removeEventListener('REFRACTOR_CEREMONY_STOP', handleStop);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  const startCeremony = useCallback(async (intention) => {
    const result = await SovereignRefractor.startCeremony(intention);
    setStrands(SovereignRefractor.currentStrands);
    setVortexColors(SovereignRefractor.vortexColors);
    return result;
  }, []);

  const stopCeremony = useCallback(() => {
    SovereignRefractor.stopCeremony();
  }, []);

  const renderSkeleton = useCallback(() => SovereignRefractor.renderSkeletonToDOM(), []);
  const removeSkeleton = useCallback(() => SovereignRefractor.removeSkeletonFromDOM(), []);
  const renderVortex = useCallback(() => SovereignRefractor.renderVortexToDOM(), []);
  const removeVortex = useCallback(() => SovereignRefractor.removeVortexFromDOM(), []);

  return useMemo(() => ({
    isActive,
    strands,
    skeleton,
    vortexColors,
    payload,
    matrixAnchor: skeleton.find(n => n.isMatrixAnchor),
    vortexGradient: SovereignRefractor.getVortexGradient(),
    startCeremony,
    stopCeremony,
    renderSkeleton,
    removeSkeleton,
    renderVortex,
    removeVortex,
    refractor: SovereignRefractor
  }), [isActive, strands, skeleton, vortexColors, payload, startCeremony, stopCeremony, renderSkeleton, removeSkeleton, renderVortex, removeVortex]);
}
