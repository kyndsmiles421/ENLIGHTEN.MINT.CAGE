/**
 * THE ENLIGHTENMENT CAFE: SOVEREIGN CORE V2.88
 * Integration: Refraction, Stabilization, and Black Hills Encryption
 * 
 * Unified system combining:
 * - Gold Layer Physics (viscous induction)
 * - Sovereign Stabilizer (inverse attraction)
 * - Refraction Engine (Vogel-Phyllotaxis split)
 * - Back Side Key Generator (-1 + 2 encryption)
 */

const SovereignCore = (() => {
  let particles = [];
  let isCeremonyActive = false;
  let canvas = null;
  let ctx = null;
  let animationId = null;
  let mouse = { x: 0, y: 0 };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS (Current Representation)
  // ═══════════════════════════════════════════════════════════════════════════

  const CONFIG = {
    R_LIMIT: 47.94,                          // 44% reduced boundary
    GOLD_HONEY: '#fbc02d',                   // Roasted Honey Gold
    TEAL_CORE: '#00FFCC',                    // Sanctuary Teal
    GOLD_VISCOSITY: 0.05,                    // High viscosity at boundary
    DAMPING: 0.82,                           // Internal velocity decay
    K_INVERSE: 0.15,                         // Attraction coefficient
    GOLDEN_ANGLE: 137.508 * (Math.PI / 180), // Vogel-Phyllotaxis
    MAX_DEPTH: 5,                            // Refraction depth limit
    RAINBOW: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SOVEREIGN NODE CLASS
  // ═══════════════════════════════════════════════════════════════════════════

  class SovereignNode {
    constructor(x, y, angle, depth = 0) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * 2;
      this.vy = Math.sin(angle) * 2;
      this.depth = depth;
      this.color = depth === 0 ? CONFIG.TEAL_CORE : CONFIG.RAINBOW[depth % CONFIG.RAINBOW.length];
      this.isHarvested = false;
      this.age = 0;
      this.maxAge = 500 + Math.random() * 300;
    }

    update(target) {
      this.age++;
      if (this.age > this.maxAge) {
        this.isHarvested = true;
        return;
      }

      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(this.x * this.x + this.y * this.y); // Distance from center

      if (dist > CONFIG.R_LIMIT) {
        // GOLD LAYER ENHANCEMENT: Viscous Induction
        this.color = CONFIG.GOLD_HONEY;
        this.vx *= CONFIG.GOLD_VISCOSITY;
        this.vy *= CONFIG.GOLD_VISCOSITY;
        // Gentle push back toward center
        this.vx -= (this.x / dist) * 2;
        this.vy -= (this.y / dist) * 2;
        this.isHarvested = true;
      } else {
        // INTERNAL PHYSICS: Sovereign Stabilizer
        this.vx += dx * CONFIG.K_INVERSE;
        this.vy += dy * CONFIG.K_INVERSE;
        this.vx *= CONFIG.DAMPING;
        this.vy *= CONFIG.DAMPING;

        // REFRACTION TRIGGER: White Light Split (Infinity + 1)
        if (Math.random() > 0.99 && this.depth < CONFIG.MAX_DEPTH && particles.length < 500) {
          this.refract();
        }
      }

      this.x += this.vx;
      this.y += this.vy;
    }

    refract() {
      // Vogel-Phyllotaxis Split (137.508°)
      for (let i = 0; i < 7; i++) {
        const angle = this.depth * CONFIG.GOLDEN_ANGLE + (i * Math.PI / 3.5);
        const newNode = new SovereignNode(this.x, this.y, angle, this.depth + 1);
        particles.push(newNode);
      }
    }

    draw(ctx, offsetX, offsetY) {
      const alpha = Math.max(0.2, 1 - (this.age / this.maxAge));
      const size = Math.max(1, 4 - this.depth * 0.5);
      
      ctx.beginPath();
      ctx.arc(this.x + offsetX, this.y + offsetY, size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BACK SIDE: RAINBOW KEY GENERATOR (-1 + 2 Encryption)
  // ═══════════════════════════════════════════════════════════════════════════

  const generateBackSideKey = (count) => {
    const value = (count - 1 + 2); // Sovereign Logic: -1 + 2 = +1 offset
    const hash = btoa(`BLACK_HILLS_${value % 144}`).substring(0, 12);
    return `SOV-${value}-${hash.toUpperCase()}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  const core = {
    CONFIG,

    // Initialize ceremony with canvas
    initCeremony(canvasId = 'sovereignCanvas') {
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

      // Translate context to center
      ctx.setTransform(1, 0, 0, 1, centerX, centerY);

      // Mouse tracking (relative to center)
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left - centerX;
        mouse.y = e.clientY - rect.top - centerY;
      });

      // Click to ignite new particle
      canvas.addEventListener('click', () => {
        particles.push(new SovereignNode(0, 0, Math.random() * Math.PI * 2, 0));
      });

      // Initialize with one particle
      particles = [new SovereignNode(0, 0, 0, 0)];
      isCeremonyActive = true;

      this.startLoop();
      console.log('[SovereignCore] Ceremony initialized. Click to ignite.');
      return this;
    },

    // Animation loop
    startLoop() {
      const loop = () => {
        if (!isCeremonyActive) return;

        // Clear with slight fade for trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

        // Draw Gold Boundary (dashed)
        ctx.beginPath();
        ctx.arc(0, 0, CONFIG.R_LIMIT, 0, Math.PI * 2);
        ctx.strokeStyle = CONFIG.GOLD_HONEY;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw inner boundary (teal)
        ctx.beginPath();
        ctx.arc(0, 0, CONFIG.R_LIMIT * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Update and filter particles
        particles = particles.filter(p => !p.isHarvested);
        particles.forEach(p => {
          p.update(mouse);
          p.draw(ctx, 0, 0);
        });

        // Draw stats
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '11px monospace';
        ctx.fillText(`PARTICLES: ${particles.length}`, 10, 20);
        ctx.fillText(`MAX DEPTH: ${Math.max(0, ...particles.map(p => p.depth))}`, 10, 35);
        ctx.fillText(`BOUNDARY: ${CONFIG.R_LIMIT}`, 10, 50);
        ctx.fillText(`CLICK TO IGNITE`, 10, canvas.height - 10);
        ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2); // Restore

        animationId = requestAnimationFrame(loop);
      };

      loop();
    },

    // Stop ceremony
    stop() {
      isCeremonyActive = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      console.log('[SovereignCore] Ceremony stopped.');
      return this;
    },

    // Attest and generate key
    attest() {
      const count = particles.length;
      const key = generateBackSideKey(count);
      console.log('[SovereignCore] CEREMONY ATTESTED:', key);
      
      // Visual feedback
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = 'rgba(251, 192, 45, 0.9)';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`ATTESTED: ${key}`, canvas.width / 2 - 80, canvas.height / 2);
        ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
      }

      return key;
    },

    // Get current state
    getState() {
      return {
        particles: particles.length,
        maxDepth: Math.max(0, ...particles.map(p => p.depth)),
        isActive: isCeremonyActive,
        harvestedCount: particles.filter(p => p.isHarvested).length
      };
    },

    // Clear all particles
    clear() {
      particles = [];
      return this;
    },

    // Destroy canvas
    destroy() {
      this.stop();
      this.clear();
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvas = null;
      ctx = null;
    },

    // Ignite burst
    burst(count = 7) {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        particles.push(new SovereignNode(0, 0, angle, 0));
      }
      return this;
    }
  };

  return core;
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.SovereignCore = SovereignCore;
}

export default SovereignCore;
