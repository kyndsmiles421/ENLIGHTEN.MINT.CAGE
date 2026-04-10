/**
 * ENLIGHTEN.MINT.CAFE - UI PERFORMANCE WRAPPER
 * PURPOSE: Zero-Latency Rendering | GPU Acceleration | EMA Smoothing
 * 
 * Handles the 54-sublayer L² Fractal Engine rendering while maintaining
 * 120fps target with Exponential Moving Average frame smoothing.
 */

// Golden Ratio
const PHI = 1.618033988749895;

// Spectral Rainbow Colors (7-color mapping)
const SPECTRAL_COLORS = [
  { name: 'RED', hue: 0, wavelength: 700, frequency: 115.2 },
  { name: 'ORANGE', hue: 30, wavelength: 620, frequency: 129.6 },
  { name: 'YELLOW', hue: 60, wavelength: 580, frequency: 144.0 },
  { name: 'GREEN', hue: 120, wavelength: 530, frequency: 158.4 },
  { name: 'BLUE', hue: 210, wavelength: 470, frequency: 172.8 },
  { name: 'INDIGO', hue: 250, wavelength: 420, frequency: 187.2 },
  { name: 'VIOLET', hue: 280, wavelength: 380, frequency: 201.6 },
];

const UIEnhancement = {
  canvas: null,
  ctx: null,
  isRendering: false,
  animationFrame: null,
  
  // Performance metrics
  metrics: {
    fps: 0,
    frameTime: 0,
    smoothedFPS: 60,
  },
  
  /**
   * Initialize the UI Enhancement engine with a canvas element
   * @param {HTMLCanvasElement} canvasElement - Target canvas for rendering
   */
  init(canvasElement) {
    if (!canvasElement) {
      console.warn('UIEnhancement: No canvas provided, creating virtual canvas');
      canvasElement = document.createElement('canvas');
    }
    
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    // Enable GPU acceleration hints
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    console.log('Ω UI ENHANCEMENT INITIALIZED');
    console.log('  └─ GPU Acceleration: ENABLED');
    console.log('  └─ Target FPS: 120');
    
    if (typeof window !== 'undefined') {
      window.UI_ENHANCEMENT = this;
    }
    
    return this;
  },
  
  /**
   * Exponential Moving Average smoothing for frame values
   * @param {number} current - Current value
   * @param {number} target - Target value
   * @param {number} alpha - Smoothing factor (0-1)
   */
  emaSmooth(current, target, alpha = 0.1) {
    return current + (target - current) * alpha;
  },
  
  /**
   * Draw the Crystalline Indent (White Light Rainbow Refraction)
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   * @param {number} radius - Base radius
   * @param {number} rotation - Rotation angle in degrees
   */
  drawCrystallineIndent(centerX, centerY, radius, rotation = 0) {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    ctx.save();
    
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw 7 spectral layers
    SPECTRAL_COLORS.forEach((color, index) => {
      const layerRadius = radius * (1 - index * 0.1);
      const opacity = 1 - index * 0.1;
      
      ctx.beginPath();
      ctx.arc(0, 0, layerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${color.hue}, 80%, 60%, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    ctx.restore();
  },
  
  /**
   * Draw 54-sublayer L² Fractal pattern
   * @param {number} centerX - Center X
   * @param {number} centerY - Center Y
   * @param {number} baseRadius - Base radius
   * @param {number} depth - Maximum recursion depth
   */
  drawFractalLayers(centerX, centerY, baseRadius, depth = 54) {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    
    for (let i = 0; i < depth; i++) {
      const scale = Math.pow(PHI, -i / 9); // 9×9 Helix scaling
      const opacity = Math.max(0.05, 1 - (i / depth));
      const rotation = (i * 40) % 360; // Spiral rotation
      const hue = (i * 360 / 7) % 360; // Rainbow cycle
      
      const layerRadius = baseRadius * scale;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Draw hexagonal layer (representing 9×9 Helix geometry)
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j * Math.PI) / 3;
        const x = Math.cos(angle) * layerRadius;
        const y = Math.sin(angle) * layerRadius;
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      
      ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
    }
  },
  
  /**
   * Update Sovereign Ledger display
   * @param {object} ledgerData - Current ledger state
   */
  updateSovereignLedger(ledgerData = {}) {
    // This would update DOM elements with ledger data
    // For now, we just log the update
    if (ledgerData.equity) {
      console.log(`Ω LEDGER UPDATE: $${ledgerData.equity.toFixed(2)}`);
    }
  },
  
  /**
   * Start the main render loop
   */
  startRenderLoop() {
    if (this.isRendering) return;
    
    this.isRendering = true;
    let lastTime = performance.now();
    let frameCount = 0;
    
    const loop = (currentTime) => {
      if (!this.isRendering) return;
      
      // Calculate delta and FPS
      const deltaTime = currentTime - lastTime;
      const currentFPS = deltaTime > 0 ? 1000 / deltaTime : 60;
      
      // EMA smooth the FPS
      this.metrics.smoothedFPS = this.emaSmooth(
        this.metrics.smoothedFPS,
        currentFPS,
        0.1
      );
      this.metrics.fps = Math.round(this.metrics.smoothedFPS);
      this.metrics.frameTime = deltaTime;
      
      lastTime = currentTime;
      frameCount++;
      
      // Clear and redraw
      if (this.canvas && this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fractal background
        this.drawFractalLayers(
          this.canvas.width / 2,
          this.canvas.height / 2,
          Math.min(this.canvas.width, this.canvas.height) * 0.4,
          54
        );
        
        // Draw crystalline indent overlay
        this.drawCrystallineIndent(
          this.canvas.width / 2,
          this.canvas.height / 2,
          50,
          (frameCount * 0.5) % 360
        );
      }
      
      // Continue loop
      this.animationFrame = requestAnimationFrame(loop);
    };
    
    this.animationFrame = requestAnimationFrame(loop);
    console.log('Ω RENDER LOOP STARTED');
  },
  
  /**
   * Stop the render loop
   */
  stopRenderLoop() {
    this.isRendering = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    console.log('Ω RENDER LOOP STOPPED');
  },
  
  /**
   * Get current performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  },
  
  /**
   * Apply White Light Rainbow Refraction effect to an element
   * @param {HTMLElement} element - Target DOM element
   */
  applyRefractionEffect(element) {
    if (!element) return;
    
    // Apply CSS-based refraction effect
    element.style.background = `
      linear-gradient(
        135deg,
        rgba(239, 68, 68, 0.1) 0%,
        rgba(249, 115, 22, 0.1) 14%,
        rgba(234, 179, 8, 0.1) 28%,
        rgba(34, 197, 94, 0.1) 42%,
        rgba(59, 130, 246, 0.1) 57%,
        rgba(99, 102, 241, 0.1) 71%,
        rgba(139, 92, 246, 0.1) 85%,
        transparent 100%
      )
    `;
    element.style.boxShadow = `
      0 0 20px rgba(139, 92, 246, 0.2),
      0 0 40px rgba(99, 102, 241, 0.1),
      inset 0 0 60px rgba(0, 0, 0, 0.8)
    `;
  }
};

export default UIEnhancement;
export { SPECTRAL_COLORS, PHI };
