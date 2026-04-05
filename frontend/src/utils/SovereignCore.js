/**
 * SOVEREIGN CORE V2.88 - THE MATTER
 * Location: Rapid City / Black Hills Calibration
 * 
 * Physics:
 * - Gold Layer Induction (viscosity 0.05)
 * - Sovereign Stabilizer (inverse attraction 0.15)
 * - Infinity + 1 Refraction (Vogel-Phyllotaxis 137.508°)
 * - Copper Conduit (heavy-duty thermal grounding)
 */

const SovereignCore = (() => {
  let particles = [];
  let widgets = [];  // External anchor points for Copper Conduit
  let canvas = null;
  let ctx = null;
  let animationId = null;
  let mouse = { x: 0, y: 0 };
  let isRunning = false;

  const CONFIG = {
    R_LIMIT: 47.94,
    GOLD_HONEY: '#fbc02d',
    TEAL_CORE: '#00FFCC',
    COPPER: '#B87333',           // Heavy-duty thermal grounding
    COPPER_TENSION: 0.08,        // Hooke's Law tension
    COPPER_WIDTH: 3,             // Thicker than silver
    VISCOSITY: 0.05,
    GOLDEN_ANGLE: 2.39996,       // 137.508 degrees in radians
    DAMPING: 0.82,
    MAX_PARTICLES: 1000,
    RAINBOW: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NODE CLASS
  // ═══════════════════════════════════════════════════════════════════════════

  class Node {
    constructor(x, y, depth = 0) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.depth = depth;
      this.color = depth === 0 ? CONFIG.TEAL_CORE : CONFIG.RAINBOW[depth % CONFIG.RAINBOW.length];
      this.mass = 1 + (depth * 0.5);
      this.age = 0;
    }

    update(target) {
      this.age++;
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(this.x * this.x + this.y * this.y); // Distance from center

      // 1. GOLD LAYER INDUCTION
      if (dist > CONFIG.R_LIMIT) {
        this.color = CONFIG.GOLD_HONEY;
        this.vx *= CONFIG.VISCOSITY; // 0.05 Honey Drag
        this.vy *= CONFIG.VISCOSITY;
        this.vx -= (this.x / dist) * 2;  // Gentle push toward center
        this.vy -= (this.y / dist) * 2;
      } else {
        // 2. SOVEREIGN STABILIZER (Inverse Attraction)
        this.vx += dx * 0.15;
        this.vy += dy * 0.15;
        this.vx *= CONFIG.DAMPING;
        this.vy *= CONFIG.DAMPING;
      }

      this.x += this.vx;
      this.y += this.vy;

      // 3. INFINITY + 1 REFRACTION
      if (this.depth < 5 && Math.random() > 0.992) {
        return this.refract();
      }
      return null;
    }

    refract() {
      const offspring = [];
      for (let i = 0; i < 7; i++) {
        // Vogel-Phyllotaxis Spiral Split
        const angle = (this.depth * CONFIG.GOLDEN_ANGLE) + (i * (Math.PI / 3.5));
        const n = new Node(this.x, this.y, this.depth + 1);
        n.vx = Math.cos(angle) * 3;
        n.vy = Math.sin(angle) * 3;
        offspring.push(n);
      }
      return offspring;
    }

    draw(ctx, offsetX, offsetY) {
      const size = Math.max(1, 4 - this.depth * 0.5);
      const alpha = Math.max(0.3, 1 - this.age / 500);
      
      ctx.beginPath();
      ctx.arc(this.x + offsetX, this.y + offsetY, size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COPPER CONDUIT (Heavy-Duty Thermal Grounding)
  // ═══════════════════════════════════════════════════════════════════════════

  const CopperConduit = {
    applyTension(coreNode, widgetList, drawCtx, offsetX = 0, offsetY = 0) {
      widgetList.forEach(w => {
        const dx = w.x - coreNode.x;
        const dy = w.y - coreNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          // Heavy Copper Tension (Hooke's Law)
          coreNode.vx += (dx / dist) * CONFIG.COPPER_TENSION * dist * 0.01;
          coreNode.vy += (dy / dist) * CONFIG.COPPER_TENSION * dist * 0.01;
        }

        // Draw the Heavy Conduit
        drawCtx.beginPath();
        drawCtx.moveTo(coreNode.x + offsetX, coreNode.y + offsetY);
        drawCtx.lineTo(w.x + offsetX, w.y + offsetY);
        drawCtx.strokeStyle = CONFIG.COPPER;
        drawCtx.lineWidth = CONFIG.COPPER_WIDTH;
        drawCtx.globalAlpha = 0.4;
        drawCtx.stroke();
        drawCtx.globalAlpha = 1.0;
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE API
  // ═══════════════════════════════════════════════════════════════════════════

  const core = {
    CONFIG,

    // Add widget anchor point for Copper Conduit
    addWidget(x, y, id = null) {
      widgets.push({ x, y, id: id || `widget_${widgets.length}` });
      return this;
    },

    removeWidget(id) {
      widgets = widgets.filter(w => w.id !== id);
      return this;
    },

    clearWidgets() {
      widgets = [];
      return this;
    },

    getWidgets() {
      return [...widgets];
    },

    ignite(x = 0, y = 0) {
      if (particles.length < CONFIG.MAX_PARTICLES) {
        particles.push(new Node(x, y));
      }
      return this;
    },

    burst(x = 0, y = 0, count = 7) {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const n = new Node(x, y, 0);
        n.vx = Math.cos(angle) * 3;
        n.vy = Math.sin(angle) * 3;
        particles.push(n);
      }
      return this;
    },

    getState() {
      return {
        count: particles.length,
        active: particles.filter(p => p.color === CONFIG.GOLD_HONEY).length,
        maxDepth: Math.max(0, ...particles.map(p => p.depth)),
        widgets: widgets.length
      };
    },

    tick(target) {
      let nextGen = [];
      particles.forEach(p => {
        const split = p.update(target);
        if (split) nextGen.push(...split);
      });
      if (nextGen.length > 0) particles.push(...nextGen);
      
      // Cleanup to prevent browser meltdown
      if (particles.length > CONFIG.MAX_PARTICLES) {
        particles.splice(0, 100);
      }
    },

    // Canvas initialization
    init(canvasId = 'sovereignCanvas') {
      canvas = document.getElementById(canvasId);
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = canvasId;
        canvas.width = 600;
        canvas.height = 600;
        canvas.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9992;
          background: rgba(0, 0, 0, 0.95);
          border-radius: 16px;
          border: 1px solid ${CONFIG.GOLD_HONEY};
          cursor: crosshair;
        `;
        document.body.appendChild(canvas);
      }

      ctx = canvas.getContext('2d');
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Mouse tracking
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left - centerX;
        mouse.y = e.clientY - rect.top - centerY;
      });

      // Click to ignite
      canvas.addEventListener('click', () => {
        this.ignite(0, 0);
      });

      // Start with one particle and default widgets
      particles = [];
      widgets = [];
      this.ignite(0, 0);
      
      // Add default widget anchors (hexagonal pattern)
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = CONFIG.R_LIMIT * 0.7;
        this.addWidget(Math.cos(angle) * r, Math.sin(angle) * r, `hex_${i}`);
      }
      
      this.start();
      console.log('[SovereignCore] V2.88 + Copper Conduit Initialized.');
      return this;
    },

    start() {
      if (isRunning) return this;
      isRunning = true;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const loop = () => {
        if (!isRunning) return;

        // Fade trail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw boundary
        ctx.beginPath();
        ctx.arc(centerX, centerY, CONFIG.R_LIMIT, 0, Math.PI * 2);
        ctx.strokeStyle = CONFIG.GOLD_HONEY;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Physics tick
        this.tick(mouse);

        // Draw Copper Conduits to widgets
        if (widgets.length > 0 && particles.length > 0) {
          // Apply copper tension from first particle (core) to all widgets
          const coreParticle = particles[0];
          CopperConduit.applyTension(coreParticle, widgets, ctx, centerX, centerY);
        }

        // Draw particles
        particles.forEach(p => p.draw(ctx, centerX, centerY));

        // Stats
        const state = this.getState();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '11px monospace';
        ctx.fillText(`PARTICLES: ${state.count}`, 10, 20);
        ctx.fillText(`IN GOLD: ${state.active}`, 10, 35);
        ctx.fillText(`MAX DEPTH: ${state.maxDepth}`, 10, 50);
        ctx.fillText(`WIDGETS: ${state.widgets}`, 10, 65);
        ctx.fillText(`R_LIMIT: ${CONFIG.R_LIMIT}`, 10, 80);

        animationId = requestAnimationFrame(loop);
      };

      loop();
      return this;
    },

    stop() {
      isRunning = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      return this;
    },

    clear() {
      particles = [];
      return this;
    },

    destroy() {
      this.stop();
      this.clear();
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvas = null;
      ctx = null;
    },

    // Generate attestation key
    attest() {
      const state = this.getState();
      const value = state.count - 1 + 2; // -1 + 2 = +1 offset
      const hash = btoa(`BLACK_HILLS_${value % 144}`).substring(0, 12);
      const key = `SOV-${value}-${hash.toUpperCase()}`;
      console.log('[SovereignCore] ATTESTED:', key);
      return key;
    }
  };

  return core;
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.SovereignCore = SovereignCore;
}

export default SovereignCore;
