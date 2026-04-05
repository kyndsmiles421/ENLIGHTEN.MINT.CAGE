/**
 * SOVEREIGN CORE V2.88 - COPPER CONDUIT EDITION
 * Logic: Hooke's Law Tension (#B87333) + Gold Viscosity (#fbc02d)
 * Location: Rapid City / Black Hills Calibration
 */

const SovereignCore = (() => {
  let particles = [];
  let widgets = []; // Hexagonal Anchors
  let canvas = null;
  let ctx = null;
  let animationId = null;
  let mouse = { x: 0, y: 0 };
  let isRunning = false;

  const CONFIG = {
    R_LIMIT: 47.94,
    COPPER: '#B87333',
    GOLD_HONEY: '#fbc02d',
    TEAL: '#00FFCC',
    TENSION: 0.08,      // Copper Spring Constant
    VISCOSITY: 0.05,    // Gold Induction
    DAMPING: 0.82,
    MAX_PARTICLES: 500
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE 6 HEXAGONAL ANCHORS AT 70% OF R_LIMIT
  // ═══════════════════════════════════════════════════════════════════════════

  const initWidgets = () => {
    widgets = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      widgets.push({
        x: Math.cos(angle) * (CONFIG.R_LIMIT * 0.7),
        y: Math.sin(angle) * (CONFIG.R_LIMIT * 0.7),
        id: `hex_${i}`
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PARTICLE CLASS
  // ═══════════════════════════════════════════════════════════════════════════

  class Particle {
    constructor(x, y, depth = 0) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.color = CONFIG.TEAL;
      this.depth = depth;
    }

    update(mouseTarget) {
      const dx = mouseTarget.x - this.x;
      const dy = mouseTarget.y - this.y;
      const distFromCenter = Math.sqrt(this.x * this.x + this.y * this.y);

      // 1. COPPER TENSION (Thermal Grounding to Widgets)
      widgets.forEach(w => {
        const wdx = w.x - this.x;
        const wdy = w.y - this.y;
        this.vx += wdx * CONFIG.TENSION;
        this.vy += wdy * CONFIG.TENSION;
      });

      // 2. GOLD BOUNDARY (Induction)
      if (distFromCenter > CONFIG.R_LIMIT) {
        this.color = CONFIG.GOLD_HONEY;
        this.vx *= CONFIG.VISCOSITY;
        this.vy *= CONFIG.VISCOSITY;
        // Gentle push back
        this.vx -= (this.x / distFromCenter) * 2;
        this.vy -= (this.y / distFromCenter) * 2;
      } else {
        this.color = CONFIG.TEAL;
        this.vx += dx * 0.15; // Attraction to Mouse
        this.vy += dy * 0.15;
        this.vx *= CONFIG.DAMPING;
        this.vy *= CONFIG.DAMPING;
      }

      this.x += this.vx;
      this.y += this.vy;
    }

    draw(ctx, offsetX, offsetY) {
      ctx.beginPath();
      ctx.arc(this.x + offsetX, this.y + offsetY, 4, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE API
  // ═══════════════════════════════════════════════════════════════════════════

  const core = {
    CONFIG,

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
        if (particles.length < CONFIG.MAX_PARTICLES) {
          particles.push(new Particle(0, 0));
        }
      });

      // Initialize widgets and first particle
      initWidgets();
      particles = [new Particle(0, 0)];

      this.start();
      console.log('[SovereignCore] V2.88 Copper Conduit Edition Initialized.');
      return this;
    },

    tick(mouseTarget) {
      particles.forEach(p => p.update(mouseTarget));
    },

    getStats() {
      return {
        particles: particles.length,
        widgets: widgets.length,
        inGold: particles.filter(p => p.color === CONFIG.GOLD_HONEY).length
      };
    },

    drawConduits(drawCtx, offsetX = 0, offsetY = 0) {
      if (particles.length === 0) return;
      
      widgets.forEach(w => {
        drawCtx.beginPath();
        drawCtx.moveTo(particles[0].x + offsetX, particles[0].y + offsetY);
        drawCtx.lineTo(w.x + offsetX, w.y + offsetY);
        drawCtx.strokeStyle = CONFIG.COPPER;
        drawCtx.lineWidth = 3;
        drawCtx.globalAlpha = 0.4;
        drawCtx.stroke();
        drawCtx.globalAlpha = 1.0;
      });
    },

    drawWidgets(drawCtx, offsetX = 0, offsetY = 0) {
      widgets.forEach(w => {
        drawCtx.beginPath();
        drawCtx.arc(w.x + offsetX, w.y + offsetY, 5, 0, Math.PI * 2);
        drawCtx.fillStyle = CONFIG.COPPER;
        drawCtx.globalAlpha = 0.6;
        drawCtx.fill();
        drawCtx.globalAlpha = 1.0;
      });
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

        // Draw gold boundary
        ctx.beginPath();
        ctx.arc(centerX, centerY, CONFIG.R_LIMIT, 0, Math.PI * 2);
        ctx.strokeStyle = CONFIG.GOLD_HONEY;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Physics tick
        this.tick(mouse);

        // Draw copper conduits
        this.drawConduits(ctx, centerX, centerY);

        // Draw widgets (anchors)
        this.drawWidgets(ctx, centerX, centerY);

        // Draw particles
        particles.forEach(p => p.draw(ctx, centerX, centerY));

        // Stats
        const stats = this.getStats();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '11px monospace';
        ctx.fillText(`PARTICLES: ${stats.particles}`, 10, 20);
        ctx.fillText(`WIDGETS: ${stats.widgets}`, 10, 35);
        ctx.fillText(`IN GOLD: ${stats.inGold}`, 10, 50);
        ctx.fillText(`R_LIMIT: ${CONFIG.R_LIMIT}`, 10, 65);
        ctx.fillText(`TENSION: ${CONFIG.TENSION}`, 10, 80);

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

    burst(count = 7) {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const p = new Particle(0, 0);
        p.vx = Math.cos(angle) * 3;
        p.vy = Math.sin(angle) * 3;
        particles.push(p);
      }
      return this;
    },

    destroy() {
      this.stop();
      this.clear();
      widgets = [];
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvas = null;
      ctx = null;
    },

    attest() {
      const count = particles.length;
      const value = count - 1 + 2;
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
