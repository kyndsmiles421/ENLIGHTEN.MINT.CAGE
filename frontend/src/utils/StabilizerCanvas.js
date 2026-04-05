/**
 * STABILIZER CORE V2 - CANVAS PHYSICS MODULE
 * Visual representation of the inverse attraction / edge repulsion system
 */

const StabilizerCanvas = {
  canvas: null,
  ctx: null,
  animationId: null,
  
  config: {
    K_INVERSE: 0.15,    // Attraction strength
    R_LIMIT: 47.94,     // Tightened boundary (44% reduction)
    F_REPULSE: 400,     // Edge push force
    DAMPING: 0.82,      // Velocity decay
    BUFFER: 10,         // 1cm equivalent (approximate)
    
    // GOLD LAYER
    GOLD_HONEY: '#fbc02d',      // Roasted Honey Gold
    GOLD_VISCOSITY: 0.05,       // High viscosity at boundary
    GOLD_PUSH: 2                // Gentle repulsion force
  },

  core: { x: 0, y: 0, vx: 0, vy: 0, color: '#00FFCC', inGoldLayer: false },
  target: { x: 0, y: 0 },
  center: { x: 0, y: 0 },

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════════════════════
  
  init(canvasId = 'coreCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      // Create canvas if not exists
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.width = 600;
      this.canvas.height = 600;
      this.canvas.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9990;
        pointer-events: auto;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 12px;
        border: 1px solid rgba(255, 215, 0, 0.3);
      `;
      document.body.appendChild(this.canvas);
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.core = { x: this.center.x, y: this.center.y, vx: 0, vy: 0 };
    this.target = { x: this.center.x, y: this.center.y };
    
    // Mouse tracking
    this.canvas.addEventListener('mousemove', (e) => {
      this.target.x = e.offsetX;
      this.target.y = e.offsetY;
    });
    
    this.start();
    return this;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHYSICS UPDATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  updatePhysics() {
    // 1. CALCULATE ATTRACTION (Hooke's Law)
    const dx = this.target.x - this.core.x;
    const dy = this.target.y - this.core.y;
    
    this.core.vx += dx * this.config.K_INVERSE;
    this.core.vy += dy * this.config.K_INVERSE;

    // 2. CALCULATE BOUNDARY (Distance from center)
    const distFromCenter = Math.sqrt(
      (this.core.x - this.center.x) ** 2 + 
      (this.core.y - this.center.y) ** 2
    );
    
    // 3. GOLD LAYER ENHANCEMENT
    if (distFromCenter > this.config.R_LIMIT) {
      this.core.inGoldLayer = true;
      
      // A. CONDUCTIVITY: High viscosity slowdown
      this.core.vx *= this.config.GOLD_VISCOSITY;
      this.core.vy *= this.config.GOLD_VISCOSITY;
      
      // B. REFRACTION: Change color to Gold
      this.core.color = this.config.GOLD_HONEY;
      
      // C. GENTLE PUSH: Soft repulsion back to center
      const nx = (this.center.x - this.core.x) / distFromCenter;
      const ny = (this.center.y - this.core.y) / distFromCenter;
      this.core.vx += nx * this.config.GOLD_PUSH;
      this.core.vy += ny * this.config.GOLD_PUSH;
    } else {
      // Return to normal state when inside boundary
      this.core.inGoldLayer = false;
      this.core.color = '#00FFCC'; // Sanctuary Teal
      
      // Normal damping
      this.core.vx *= this.config.DAMPING;
      this.core.vy *= this.config.DAMPING;
    }
    
    this.core.x += this.core.vx;
    this.core.y += this.core.vy;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAW
  // ═══════════════════════════════════════════════════════════════════════════
  
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Grid (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < this.canvas.width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(this.canvas.width, i);
      ctx.stroke();
    }
    
    // Draw Gold Layer Zone
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.config.R_LIMIT, 0, Math.PI * 2);
    if (this.core.inGoldLayer) {
      ctx.fillStyle = 'rgba(251, 192, 45, 0.1)'; // Gold glow when active
      ctx.fill();
    }
    ctx.strokeStyle = this.core.inGoldLayer ? this.config.GOLD_HONEY : 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = this.core.inGoldLayer ? 3 : 2;
    ctx.stroke();
    
    // Draw Hexagonal Boundary
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const x = this.center.x + Math.cos(angle) * this.config.R_LIMIT;
      const y = this.center.y + Math.sin(angle) * this.config.R_LIMIT;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw Buffer Zone (1cm)
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.config.R_LIMIT + this.config.BUFFER, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw Target
    ctx.beginPath();
    ctx.arc(this.target.x, this.target.y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw Connection Line
    ctx.beginPath();
    ctx.moveTo(this.core.x, this.core.y);
    ctx.lineTo(this.target.x, this.target.y);
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw Core Object
    const gradient = ctx.createRadialGradient(
      this.core.x, this.core.y, 0,
      this.core.x, this.core.y, 12
    );
    gradient.addColorStop(0, this.core.color);
    gradient.addColorStop(1, this.core.color.replace(')', ', 0)').replace('rgb', 'rgba'));
    
    ctx.beginPath();
    ctx.arc(this.core.x, this.core.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.core.x, this.core.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = this.core.color;
    ctx.fill();
    
    // Draw Stats
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.fillText(`VEL: ${Math.sqrt(this.core.vx**2 + this.core.vy**2).toFixed(2)}`, 10, 20);
    ctx.fillText(`DIST: ${Math.sqrt((this.core.x - this.center.x)**2 + (this.core.y - this.center.y)**2).toFixed(2)}`, 10, 35);
    ctx.fillText(`LIMIT: ${this.config.R_LIMIT}`, 10, 50);
    ctx.fillText(`GOLD: ${this.core.inGoldLayer ? 'ACTIVE' : 'OFF'}`, 10, 65);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATION LOOP
  // ═══════════════════════════════════════════════════════════════════════════
  
  loop() {
    this.updatePhysics();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  },

  start() {
    if (!this.animationId) {
      this.loop();
    }
  },

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },

  destroy() {
    this.stop();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.StabilizerCanvas = StabilizerCanvas;
}

export default StabilizerCanvas;
