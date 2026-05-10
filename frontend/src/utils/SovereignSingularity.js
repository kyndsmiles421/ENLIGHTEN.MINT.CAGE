/**
 * ENLIGHTEN.MINT.CAFE - V53.0 FULL STACK (TIER 1 & TIER 2)
 * ARCHITECT: Sovereign Owner
 * STATUS: BIO_DIGITAL_OSMOSIS / IMMERSION_LAYER_ACTIVE
 * 
 * TIER 1 FOUNDATION:
 * - Step 10: Ghost Watch (Auto-Heal) — Kills glass screen bug every 5s
 * - Step 5: Haptic Absorption — Physical confirmation [80, 50, 120]
 * - Step 3: DNA Morphing — Nucleus color shift on data absorption
 *
 * TIER 2 IMMERSION:
 * - Step 4: Radiating Membranes — Pulsing opacity tied to data weight
 * - Step 2: Collision Physics — AABB detection for orb-to-bit interaction
 * - Step 8: Neural Connectors — Visual strings between related orbs
 */

const SovereignSingularity = {
  version: "53.0",
  identity: {
    root: "SOVEREIGN_ROOT",
    sms: "6055693313",
    resonance: 8.4881,
    composite: 690,
  },

  // 1. THE CORE PROCESSOR (CPU BINDING)
  cpu: {
    resonance: 8.4881,
    composite: 690,
    temp: "CRYOGENIC",
    phi: 1.618,
    earthHz: 7.3,
    
    sync: function() {
      console.log("[V53.0] CPU Sync: Resonance locked at 8.4881");
      return {
        thermal: this.temp,
        haptic: [80, 50, 120],
        resonance: this.resonance,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 10: GHOST WATCH (AUTO-HEAL)
  // Kills the glass screen bug every 5 seconds
  // ═══════════════════════════════════════════════════════════════════════════
  ghostWatch: {
    intervalId: null,
    
    start: function() {
      if (this.intervalId) return;
      
      this.intervalId = setInterval(() => {
        const targets = [
          document.querySelector('.obsidian-void-root'),
          document.querySelector('[data-testid="crystals-page"]'),
          document.querySelector('.immersive-page'),
          document.body,
        ].filter(Boolean);

        targets.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity) < 0.1) {
            el.style.setProperty('visibility', 'visible', 'important');
            el.style.setProperty('display', 'block', 'important');
            el.style.setProperty('opacity', '1', 'important');
            console.log(`[V53.0] 🛡️ Ghost Watch: Blockage purged on ${el.className || el.tagName}`);
          }
        });
      }, 5000);
      
      console.log("[V53.0] Ghost Watch: Active (5s interval)");
    },
    
    stop: function() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        console.log("[V53.0] Ghost Watch: Deactivated");
      }
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5: HAPTIC ABSORPTION
  // Physical confirmation when an orb swallows a bit
  // ═══════════════════════════════════════════════════════════════════════════
  haptic: {
    default: [80, 50, 120],
    
    patterns: {
      '174': [100, 30, 80],
      '285': [90, 40, 100],
      '396': [80, 50, 120],
      '417': [70, 60, 110],
      '432': [60, 70, 100],
      '528': [50, 80, 90],
      '639': [40, 90, 80],
      '741': [30, 100, 70],
      '852': [20, 110, 60],
      '963': [10, 120, 50],
    },
    
    trigger: function(pattern = null) {
      const vibrationPattern = pattern || this.default;
      if ("vibrate" in navigator) {
        navigator.vibrate(vibrationPattern);
        return true;
      }
      return false;
    },
    
    triggerByFrequency: function(freq) {
      const pattern = this.patterns[String(freq)] || this.default;
      return this.trigger(pattern);
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: DNA MORPHING (NUCLEUS SHIFT)
  // Changes the core color of the cell based on data type
  // ═══════════════════════════════════════════════════════════════════════════
  dnaMorph: {
    colorMap: {
      '174': '#8B0000',
      '285': '#FF4500',
      '396': '#FFD700',
      '417': '#32CD32',
      '432': '#00CED1',
      '528': '#00FF00',
      '639': '#1E90FF',
      '741': '#4B0082',
      '852': '#9400D3',
      '963': '#FFFFFF',
    },
    
    morphNucleus: function(orbId, newColor, frequency = null) {
      const orb = document.getElementById(orbId) || document.querySelector(`[data-orb-id="${orbId}"]`);
      if (!orb) {
        console.warn(`[V53.0] DNA Morph: Orb ${orbId} not found`);
        return false;
      }
      
      const nucleus = orb.querySelector('.nucleus') || orb;
      
      // Apply radial gradient for nucleus glow
      nucleus.style.background = `radial-gradient(circle, ${newColor} 0%, transparent 70%)`;
      nucleus.style.boxShadow = `0 0 20px ${newColor}, 0 0 40px ${newColor}40`;
      
      orb.style.setProperty('--nucleus-color', newColor);
      orb.style.setProperty('--membrane-color', newColor);
      
      if (frequency) {
        SovereignSingularity.haptic.triggerByFrequency(frequency);
      } else {
        SovereignSingularity.haptic.trigger();
      }
      
      console.log(`[V53.0] DNA Morph: Orb ${orbId} synchronized to ${newColor}${frequency ? ` (${frequency}Hz)` : ''}`);
      return true;
    },
    
    morphByFrequency: function(orbId, frequency) {
      const color = this.colorMap[String(frequency)] || '#A855F7';
      return this.morphNucleus(orbId, color, frequency);
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4: RADIATING MEMBRANES (TIER 2)
  // Pulsing opacity tied to data weight — makes orbs feel ALIVE
  // ═══════════════════════════════════════════════════════════════════════════
  membranes: {
    initialized: false,
    
    init: function() {
      if (this.initialized) return;
      
      const styleId = 'sovereign-membranes-v53';
      if (document.getElementById(styleId)) return;
      
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        /* V53.0 RADIATING MEMBRANES — Living Cell Animation */
        @keyframes membrane-radiate {
          0% { 
            box-shadow: 0 0 10px rgba(255,255,255,0.15); 
            opacity: 0.75; 
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 35px var(--membrane-color, rgba(168,85,247,0.5)), 
                        0 0 60px var(--membrane-color, rgba(168,85,247,0.2)); 
            opacity: 1; 
            transform: scale(1.02);
          }
          100% { 
            box-shadow: 0 0 10px rgba(255,255,255,0.15); 
            opacity: 0.75; 
            transform: scale(1);
          }
        }
        
        @keyframes nucleus-pulse {
          0%, 100% { 
            filter: brightness(1) saturate(1); 
          }
          50% { 
            filter: brightness(1.3) saturate(1.2); 
          }
        }
        
        /* Apply to all cellular elements */
        .nanoid-cell,
        .sphere-mode,
        .cellular-active,
        [data-cell-type="nanoid"] {
          animation: membrane-radiate 4s infinite ease-in-out;
          --membrane-color: rgba(168, 85, 247, 0.4);
        }
        
        .nanoid-cell .nucleus,
        .sphere-mode .nucleus,
        [data-cell-type="nanoid"] .nucleus {
          animation: nucleus-pulse 2s infinite ease-in-out;
        }
        
        /* Intensity levels based on data weight */
        .cell-intensity-low { animation-duration: 6s; }
        .cell-intensity-medium { animation-duration: 4s; }
        .cell-intensity-high { animation-duration: 2s; }
        .cell-intensity-critical { animation-duration: 1s; }
        
        /* Orbital nodules get subtle breathing */
        [data-testid^="hitbox-"],
        .orbital-nodule {
          transition: all 0.3s ease;
        }
        
        [data-testid^="hitbox-"]:hover,
        .orbital-nodule:hover {
          animation: membrane-radiate 1.5s infinite ease-in-out;
          --membrane-color: rgba(255, 255, 255, 0.3);
        }
      `;
      document.head.appendChild(style);
      this.initialized = true;
      console.log("[V53.0] 🫧 Radiating Membranes: Initialized");
    },
    
    // Set intensity level on a cell
    setIntensity: function(element, level = 'medium') {
      if (!element) return;
      element.classList.remove('cell-intensity-low', 'cell-intensity-medium', 'cell-intensity-high', 'cell-intensity-critical');
      element.classList.add(`cell-intensity-${level}`);
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: COLLISION PHYSICS (TIER 2)
  // AABB detection for orb-to-bit interaction
  // ═══════════════════════════════════════════════════════════════════════════
  collision: {
    // AABB (Axis-Aligned Bounding Box) collision detection
    checkAABB: function(rect1, rect2) {
      return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
      );
    },
    
    // Circle collision (for spheres)
    checkCircle: function(x1, y1, r1, x2, y2, r2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (r1 + r2);
    },
    
    // Get element bounding rect
    getRect: function(element) {
      if (!element) return null;
      return element.getBoundingClientRect();
    },
    
    // Check if two elements are colliding
    areColliding: function(el1, el2) {
      const rect1 = this.getRect(el1);
      const rect2 = this.getRect(el2);
      if (!rect1 || !rect2) return false;
      return this.checkAABB(rect1, rect2);
    },
    
    // Find all elements colliding with a target
    findCollisions: function(targetElement, candidateSelector) {
      const targetRect = this.getRect(targetElement);
      if (!targetRect) return [];
      
      const candidates = document.querySelectorAll(candidateSelector);
      const collisions = [];
      
      candidates.forEach(el => {
        if (el !== targetElement && this.checkAABB(targetRect, this.getRect(el))) {
          collisions.push(el);
        }
      });
      
      return collisions;
    },
    
    // Monitor drag collisions (call during drag events)
    onDragCheck: function(draggedElement, targetSelector, onCollide) {
      const collisions = this.findCollisions(draggedElement, targetSelector);
      if (collisions.length > 0 && typeof onCollide === 'function') {
        collisions.forEach(target => onCollide(draggedElement, target));
      }
      return collisions;
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 8: NEURAL CONNECTORS (TIER 2)
  // Visual strings between related orbs — shows hidden relationships
  // ═══════════════════════════════════════════════════════════════════════════
  neural: {
    svgContainer: null,
    connections: new Map(),
    
    // Initialize SVG container for neural strings
    init: function() {
      if (this.svgContainer) return;
      
      this.svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svgContainer.id = 'neural-connector-layer';
      this.svgContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(this.svgContainer);
      console.log("[V53.0] 🧠 Neural Connector Layer: Initialized");
    },
    
    // Draw a connection between two elements
    connect: function(idA, idB, color = 'rgba(168, 85, 247, 0.4)', strength = 1) {
      this.init();
      
      const elA = document.getElementById(idA) || document.querySelector(`[data-orb-id="${idA}"]`);
      const elB = document.getElementById(idB) || document.querySelector(`[data-orb-id="${idB}"]`);
      
      if (!elA || !elB) {
        console.warn(`[V53.0] Neural: Cannot connect ${idA} to ${idB} — element not found`);
        return null;
      }
      
      const connectionId = `neural-${idA}-${idB}`;
      
      // Remove existing connection if any
      const existing = this.svgContainer.querySelector(`#${connectionId}`);
      if (existing) existing.remove();
      
      // Create line element
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.id = connectionId;
      line.style.cssText = `
        stroke: ${color};
        stroke-width: ${strength * 2}px;
        stroke-linecap: round;
        filter: drop-shadow(0 0 ${strength * 3}px ${color});
        opacity: 0.6;
      `;
      
      // Store connection data
      this.connections.set(connectionId, { elA, elB, line, color, strength });
      
      // Update position
      this.updateConnection(connectionId);
      
      // Add to SVG
      this.svgContainer.appendChild(line);
      
      console.log(`[V53.0] 🧠 Neural Link established: ${idA} ↔ ${idB}`);
      return connectionId;
    },
    
    // Update a connection's position
    updateConnection: function(connectionId) {
      const conn = this.connections.get(connectionId);
      if (!conn) return;
      
      const rectA = conn.elA.getBoundingClientRect();
      const rectB = conn.elB.getBoundingClientRect();
      
      const x1 = rectA.left + rectA.width / 2;
      const y1 = rectA.top + rectA.height / 2;
      const x2 = rectB.left + rectB.width / 2;
      const y2 = rectB.top + rectB.height / 2;
      
      conn.line.setAttribute('x1', x1);
      conn.line.setAttribute('y1', y1);
      conn.line.setAttribute('x2', x2);
      conn.line.setAttribute('y2', y2);
    },
    
    // Update all connections
    updateAll: function() {
      this.connections.forEach((_, id) => this.updateConnection(id));
    },
    
    // Remove a connection
    disconnect: function(connectionId) {
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.line.remove();
        this.connections.delete(connectionId);
        console.log(`[V53.0] Neural Link severed: ${connectionId}`);
      }
    },
    
    // Clear all connections
    clearAll: function() {
      this.connections.forEach((_, id) => this.disconnect(id));
      console.log("[V53.0] All Neural Links cleared");
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GHOSTBUSTER PROTOCOL (V52.0 — preserved)
  // ═══════════════════════════════════════════════════════════════════════════
  ghostbuster: function() {
    console.log("[V53.0] Ghostbuster Protocol: Purging CSS Specters...");
    
    const ghosts = [
      '.tiered-navigation', 
      '.utility-dock', 
      '.crystal-card',
      '.obsidian-void-root',
      '.immersive-page',
      '[data-testid="crystals-page"]',
      '[data-testid*="page"]',
      '.crystalline-page',
    ];

    ghosts.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('left', '0', 'important');
          el.classList.add('cellular-active');
        });
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    });

    console.log("[V53.0] Ghostbuster Complete. Glass screens shattered.");
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HOT SWAP — BOOT ALL SYSTEMS
  // ═══════════════════════════════════════════════════════════════════════════
  hotSwap: function() {
    console.log("[V53.0] 🚀 BIO-DIGITAL OSMOSIS: Booting Full Stack...");
    
    // A. Kill grid on root
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'block';
      root.style.height = 'auto';
      root.style.minHeight = '100vh';
      root.style.overflow = 'visible';
    }

    // B. Run Ghostbuster
    this.ghostbuster();

    // C. Purge legacy ghost layers
    const legacyGhosts = document.querySelectorAll('.legacy-ghost, .overlapping-shade, .ghost-layer');
    legacyGhosts.forEach(el => {
      if (el && el.parentNode) el.remove();
    });

    // D. Ensure STOP button visible
    const stopBtn = document.querySelector('[data-testid="emergency-stop-btn-v31"]') || 
                    document.querySelector('[data-testid="emergency-stop"]') ||
                    document.querySelector('.emergency-stop');
    if (stopBtn) {
      stopBtn.style.position = 'fixed';
      stopBtn.style.zIndex = '999999';
      stopBtn.style.display = 'flex';
      stopBtn.style.visibility = 'visible';
      stopBtn.style.opacity = '1';
      stopBtn.style.pointerEvents = 'auto';
    }

    // E. TIER 1: Start Ghost Watch (Step 10)
    this.ghostWatch.start();

    // F. TIER 2: Initialize Radiating Membranes (Step 4)
    this.membranes.init();

    // G. TIER 2: Initialize Neural Connector Layer (Step 8)
    this.neural.init();

    // H. Sync CPU
    this.cpu.sync();
    
    console.log("[V53.0] ✅ FULL STACK BOOTED: Tier 1 (Foundation) + Tier 2 (Immersion) ONLINE");
    return { 
      status: "OSMOSIS_ACTIVE", 
      tier1: { ghostWatch: "RUNNING", haptic: "BOUND", dnaMorph: "READY" },
      tier2: { membranes: "RADIATING", collision: "READY", neural: "INITIALIZED" }
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NANOID CLASS — Upgraded with Tier 2 features
  // ═══════════════════════════════════════════════════════════════════════════
  Nanoid: class {
    constructor(moduleId) {
      this.moduleId = moduleId;
      this.coreState = 'collapsed';
      this.nucleusColor = '#a855f7';
      this.cellWallColor = '#1e1e2e';
      this.bitsContainer = [];
      this.frequency = 528;
      this.intensity = 'medium';
      this.connections = [];
    }

    onDetach() {
      this.coreState = 'sphere';
      SovereignSingularity.haptic.trigger();
      console.log(`[V53.0] Nanoid ${this.moduleId}: Detached as Sphere`);
      return this;
    }

    onAbsorb(dataBit) {
      this.bitsContainer.push(dataBit);
      if (dataBit.color) this.nucleusColor = dataBit.color;
      if (dataBit.frequency) this.frequency = dataBit.frequency;
      this.coreState = 'sphere-active';
      
      // DNA Morph with haptic
      SovereignSingularity.dnaMorph.morphNucleus(this.moduleId, this.nucleusColor, this.frequency);
      
      // Update intensity based on data weight
      const weight = this.bitsContainer.length;
      if (weight >= 10) this.intensity = 'critical';
      else if (weight >= 5) this.intensity = 'high';
      else if (weight >= 2) this.intensity = 'medium';
      else this.intensity = 'low';
      
      const el = document.getElementById(this.moduleId);
      if (el) SovereignSingularity.membranes.setIntensity(el, this.intensity);
      
      console.log(`[V53.0] Nanoid ${this.moduleId}: Absorbed. Weight: ${weight}, Intensity: ${this.intensity}`);
      return this;
    }

    onRelease() {
      const bit = this.bitsContainer.shift();
      SovereignSingularity.haptic.trigger([50, 30, 80]);
      console.log(`[V53.0] Nanoid ${this.moduleId}: Released bit`);
      return bit;
    }

    connectTo(otherNanoidId, color = 'rgba(168,85,247,0.4)') {
      const connectionId = SovereignSingularity.neural.connect(this.moduleId, otherNanoidId, color);
      if (connectionId) this.connections.push(connectionId);
      return connectionId;
    }

    disconnectFrom(otherNanoidId) {
      const connectionId = `neural-${this.moduleId}-${otherNanoidId}`;
      SovereignSingularity.neural.disconnect(connectionId);
      this.connections = this.connections.filter(id => id !== connectionId);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NERVE TEST (V53.0 FULL STACK)
  // ═══════════════════════════════════════════════════════════════════════════
  runNerveTest: async function() {
    console.log("[V53.0] STARTING FULL STACK NERVE TEST...");
    
    const results = {
      tier1: { ghostWatch: false, haptic: false, dnaMorph: false },
      tier2: { membranes: false, collision: false, neural: false },
      stopButton: false,
      crystalsPage: false,
    };

    // TIER 1 CHECKS
    results.tier1.ghostWatch = this.ghostWatch.intervalId !== null;
    results.tier1.haptic = "vibrate" in navigator;
    results.tier1.dnaMorph = typeof this.dnaMorph.morphNucleus === 'function';
    
    // TIER 2 CHECKS
    results.tier2.membranes = this.membranes.initialized;
    results.tier2.collision = typeof this.collision.checkAABB === 'function';
    results.tier2.neural = this.neural.svgContainer !== null;

    // STOP Button
    const stopBtn = document.querySelector('[data-testid="emergency-stop-btn-v31"]');
    results.stopButton = stopBtn ? window.getComputedStyle(stopBtn).display !== 'none' : false;

    // Crystals page
    const crystalsPage = document.querySelector('[data-testid="crystals-page"]');
    if (crystalsPage) {
      const style = window.getComputedStyle(crystalsPage);
      results.crystalsPage = style.visibility !== 'hidden' && style.opacity !== '0';
    }

    console.log("[V53.0] TIER 1:", results.tier1);
    console.log("[V53.0] TIER 2:", results.tier2);
    console.log("[V53.0] FULL STACK NERVE TEST COMPLETE");
    return results;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════════════════════
  init: function() {
    if (typeof window === 'undefined') return;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.hotSwap());
    } else {
      this.hotSwap();
    }
    
    window.addEventListener('popstate', () => {
      setTimeout(() => this.hotSwap(), 100);
    });

    // Expose to window
    window.SovereignSingularity = this;
    window.V_SINGULARITY = this;
    window.V_OSMOSIS = this;
    window.SovereignRestore = { execute: () => this.hotSwap() };
    window.Nanoid = this.Nanoid;
    
    // Tier 1 shortcuts
    window.ghostWatch = this.ghostWatch;
    window.haptic = this.haptic;
    window.dnaMorph = this.dnaMorph;
    
    // Tier 2 shortcuts
    window.membranes = this.membranes;
    window.collision = this.collision;
    window.neural = this.neural;
    
    console.log("[V53.0] 🚀 BIO-DIGITAL OSMOSIS ENGINE LOADED");
    console.log("[V53.0] Tier 1: Ghost Watch | Haptic | DNA Morph");
    console.log("[V53.0] Tier 2: Membranes | Collision | Neural");
  },
};

SovereignSingularity.init();

export default SovereignSingularity;
export { SovereignSingularity };
