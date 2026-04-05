/**
 * ENLIGHTENMENT CAFE: REFRACTION ENGINE V2
 * Logic: White Light -> Rainbow Split -> Exponential Growth (Infinity + 1)
 * 
 * Physics:
 * - White particles start at origin
 * - Gold Layer (dist > 47.94): Viscous damping + color shift
 * - Inside: 2% chance to split 1→7 (Rainbow Refraction)
 * - Max depth: 5 (prevents infinite recursion)
 */

const RefractionEngine = (() => {
  let particles = [];
  let isRunning = false;
  let animationId = null;
  let canvas = null;
  let ctx = null;
  let center = { x: 0, y: 0 };

  const RAINBOW = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
  const GOLD_HONEY = '#fbc02d';
  const R_LIMIT = 47.94;
  const MAX_DEPTH = 5;
  const SPLIT_CHANCE = 0.98; // 2% chance per frame
  const MAX_PARTICLES = 1000; // Safety limit

  // ═══════════════════════════════════════════════════════════════════════════
  // PARTICLE CLASS
  // ═══════════════════════════════════════════════════════════════════════════

  class Particle {
    constructor(x, y, angle, depth = 0) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * 5;
      this.vy = Math.sin(angle) * 5;
      this.depth = depth;
      this.color = depth === 0 ? '#FFFFFF' : RAINBOW[depth % RAINBOW.length];
      this.active = true;
      this.age = 0;
      this.maxAge = 300 + Math.random() * 200; // Particle lifespan
    }

    update() {
      this.age++;
      if (this.age > this.maxAge) {
        this.active = false;
        return;
      }

      const dist = Math.sqrt(this.x ** 2 + this.y ** 2);

      if (dist > R_LIMIT) {
        // GOLD LAYER: Viscous damping (0.05) + Color shift
        this.color = GOLD_HONEY;
        this.vx *= 0.05;
        this.vy *= 0.05;
        this.vx -= (this.x / dist) * 2; // Gentle push back
        this.vy -= (this.y / dist) * 2;
      } else {
        // INSIDE: Normal damping
        this.vx *= 0.82;
        this.vy *= 0.82;

        // Multiplication Trigger (The "Infinity" Split)
        if (Math.random() > SPLIT_CHANCE && this.depth < MAX_DEPTH && particles.length < MAX_PARTICLES) {
          this.multiply();
        }
      }

      this.x += this.vx;
      this.y += this.vy;
    }

    multiply() {
      // Split 1 into 7 (Rainbow Refraction)
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2 + Math.random() * 0.5;
        const newParticle = new Particle(this.x, this.y, angle, this.depth + 1);
        newParticle.color = RAINBOW[i];
        particles.push(newParticle);
      }
      this.active = false; // Original "White Light" dissolves into the rainbow
    }

    draw(ctx, offsetX, offsetY) {
      const alpha = Math.max(0.1, 1 - (this.age / this.maxAge));
      const size = Math.max(1, 3 - this.depth * 0.4);
      
      ctx.beginPath();
      ctx.arc(this.x + offsetX, this.y + offsetY, size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  const engine = {
    // Initialize with canvas
    init(canvasId = 'refractionCanvas') {
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
          z-index: 9991;
          pointer-events: auto;
          background: rgba(0, 0, 0, 0.95);
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        `;
        document.body.appendChild(canvas);
      }
      ctx = canvas.getContext('2d');
      center = { x: canvas.width / 2, y: canvas.height / 2 };
      
      // Click to ignite
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - center.x;
        const y = e.clientY - rect.top - center.y;
        this.ignite(x, y);
      });
      
      return this;
    },

    // Ignite new white light particle
    ignite(x = 0, y = 0, angle = Math.random() * Math.PI * 2) {
      if (particles.length < MAX_PARTICLES) {
        particles.push(new Particle(x, y, angle, 0));
        console.log(`[Refraction] Ignited at (${x.toFixed(1)}, ${y.toFixed(1)}). Particles: ${particles.length}`);
      }
      return this;
    },

    // Burst ignition (multiple particles)
    burst(x = 0, y = 0, count = 7) {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        this.ignite(x, y, angle);
      }
      return this;
    },

    // Update all particles
    update() {
      particles = particles.filter(p => p.active);
      particles.forEach(p => p.update());
    },

    // Render to canvas
    render() {
      if (!ctx) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw boundary
      ctx.beginPath();
      ctx.arc(center.x, center.y, R_LIMIT, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 192, 45, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw particles
      particles.forEach(p => p.draw(ctx, center.x, center.y));

      // Draw stats
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px monospace';
      ctx.fillText(`PARTICLES: ${particles.length}`, 10, 20);
      ctx.fillText(`MAX DEPTH: ${Math.max(0, ...particles.map(p => p.depth))}`, 10, 35);
      ctx.fillText(`CLICK TO IGNITE`, 10, canvas.height - 10);
    },

    // Animation loop
    loop() {
      this.update();
      this.render();
      animationId = requestAnimationFrame(() => this.loop());
    },

    // Start engine
    start() {
      if (!isRunning) {
        isRunning = true;
        this.loop();
        console.log('[Refraction] Engine started');
      }
      return this;
    },

    // Stop engine
    stop() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      isRunning = false;
      console.log('[Refraction] Engine stopped');
      return this;
    },

    // Clear all particles
    clear() {
      particles = [];
      return this;
    },

    // Get particle count
    getCount() {
      return particles.length;
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
    }
  };

  return engine;
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.RefractionEngine = RefractionEngine;
}

export default RefractionEngine;
