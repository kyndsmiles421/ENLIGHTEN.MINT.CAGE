/**
 * ENLIGHTEN.MINT.CAFE - ADVANCED RESONANCE ENGINE
 * 
 * Integrates: Haptics, Spatial Audio, and Fluid Dynamics
 * Creates a multi-sensory experience tied to the nodule system.
 */

class ResonanceEngine {
  constructor() {
    this.audioCtx = null;
    this.pannerNodes = new Map(); // Stores 3D audio positions
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.isInitialized = false;
    this.masterGain = null;
    this.listenerPosition = { x: 0, y: 0, z: 0 };
  }

  // Initialize audio context (must be called after user interaction)
  async init() {
    if (this.isInitialized) return;
    
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain node
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
      
      // Set up listener position (user's ears)
      if (this.audioCtx.listener.positionX) {
        this.audioCtx.listener.positionX.setValueAtTime(0, this.audioCtx.currentTime);
        this.audioCtx.listener.positionY.setValueAtTime(0, this.audioCtx.currentTime);
        this.audioCtx.listener.positionZ.setValueAtTime(0, this.audioCtx.currentTime);
      }
      
      this.isInitialized = true;
      console.log('[ResonanceEngine] Initialized');
    } catch (err) {
      console.warn('[ResonanceEngine] Audio init failed:', err);
    }
  }

  // 1. SPATIAL AUDIO: Places a Solfeggio tone in 3D space
  initSpatialNode(id, frequency, x, y, z) {
    if (!this.audioCtx) return null;
    
    // Remove existing node if present
    if (this.pannerNodes.has(id)) {
      this.destroyNode(id);
    }

    const oscillator = this.audioCtx.createOscillator();
    const panner = this.audioCtx.createPanner();
    const gainNode = this.audioCtx.createGain();

    // Set 3D spatial properties (HRTF = Head Related Transfer Function)
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;

    // Position in 3D space (normalized from pixel coords)
    panner.positionX.setValueAtTime(x / 100, this.audioCtx.currentTime);
    panner.positionY.setValueAtTime(y / 100, this.audioCtx.currentTime);
    panner.positionZ.setValueAtTime(z / 100, this.audioCtx.currentTime);

    // Solfeggio sine wave
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime); // Start silent

    // Connect: oscillator -> gain -> panner -> master
    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.masterGain);

    oscillator.start();
    
    this.pannerNodes.set(id, { oscillator, panner, gainNode, frequency });
    console.log(`[ResonanceEngine] Spatial node "${id}" at ${frequency}Hz`);
    
    return { oscillator, panner, gainNode };
  }

  // Update spatial node position (for animated nodules)
  updateNodePosition(id, x, y, z) {
    const node = this.pannerNodes.get(id);
    if (!node || !this.audioCtx) return;

    const { panner } = node;
    panner.positionX.setTargetAtTime(x / 100, this.audioCtx.currentTime, 0.1);
    panner.positionY.setTargetAtTime(y / 100, this.audioCtx.currentTime, 0.1);
    panner.positionZ.setTargetAtTime(z / 100, this.audioCtx.currentTime, 0.1);
  }

  // 2. HAPTIC FEEDBACK: Pulsing the physical device
  triggerHapticPulse(frequency = 528) {
    if (!("vibrate" in navigator)) return;

    // Higher frequencies = shorter, sharper pulses
    const duration = Math.max(10, 200 - (frequency / 5));
    
    try {
      navigator.vibrate([duration, 50, duration / 2]);
    } catch (err) {
      // Vibration not allowed without user gesture
    }
  }

  // Haptic pattern based on karma/resonance level
  triggerKarmaHaptic(karmaLevel) {
    if (!("vibrate" in navigator)) return;
    
    // More karma = more complex haptic pattern
    const pulses = Math.min(5, Math.floor(karmaLevel / 1000));
    const pattern = [];
    
    for (let i = 0; i < pulses; i++) {
      pattern.push(50 + i * 20); // Increasing pulse duration
      pattern.push(30); // Gap
    }
    
    try {
      navigator.vibrate(pattern);
    } catch (err) {}
  }

  // 3. FLUID DYNAMICS: The "Cream Foam" Particle System
  initFluidCanvas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('[ResonanceEngine] Fluid container not found:', containerId);
      return;
    }

    // Check if canvas already exists
    const existing = container.querySelector('.fluid-layer');
    if (existing) {
      this.canvas = existing;
      this.ctx = this.canvas.getContext('2d');
      return;
    }

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fluid-layer';
    this.canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 50;
      mix-blend-mode: screen;
    `;
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animateParticles();
    
    console.log('[ResonanceEngine] Fluid canvas initialized');
  }

  // Spawn karma fluid particles (visual feedback for deeds/donations)
  spawnKarmaFluid(x, y, color = '#00ffc3', count = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color: color,
        size: Math.random() * 3 + 2,
      });
    }
  }

  // Spawn resonance ripple (for frequency activation)
  spawnResonanceRipple(x, y, frequency) {
    const colors = {
      432: '#22c55e', // Earth - green
      528: '#00ffc3', // Love - mint
      639: '#3b82f6', // Connection - blue
      741: '#9c27b0', // Awakening - purple
      852: '#6366f1', // Intuition - indigo
      963: '#fbc02d', // Divine - gold
    };
    
    const color = colors[frequency] || '#00ffc3';
    
    // Create expanding ring particles
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const speed = 2 + Math.random() * 2;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: color,
        size: 3,
        isRipple: true,
      });
    }
  }

  animateParticles() {
    if (!this.ctx || !this.canvas) {
      requestAnimationFrame(() => this.animateParticles());
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.isRipple ? 0.015 : 0.01;
      p.vx *= 0.98; // Viscosity
      p.vy *= 0.98;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.life * p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life * 0.7;
      this.ctx.fill();

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(() => this.animateParticles());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // 4. NODULE INTERACTION BRIDGE
  async activateNodule(id, freq, x, y) {
    // Ensure audio context is initialized
    if (!this.isInitialized) {
      await this.init();
    }
    
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }

    // Multi-sensory activation
    this.triggerHapticPulse(freq);
    this.spawnKarmaFluid(x, y);
    this.spawnResonanceRipple(x, y, freq);

    // Activate spatial audio
    const node = this.pannerNodes.get(id);
    if (node && this.audioCtx) {
      node.gainNode.gain.setTargetAtTime(0.1, this.audioCtx.currentTime, 0.1);
      setTimeout(() => {
        node.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.5);
      }, 1000);
    }
    
    console.log(`[ResonanceEngine] Activated nodule "${id}" at ${freq}Hz`);
  }

  // 5. SOLFEGGIO PRESET TONES
  playSolfeggioTone(frequency, duration = 2000) {
    if (!this.audioCtx) return;
    
    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
    
    // Fade in/out envelope
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + duration / 1000);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + duration / 1000);
    
    this.triggerHapticPulse(frequency);
  }

  // 6. CLEANUP
  destroyNode(id) {
    const node = this.pannerNodes.get(id);
    if (node) {
      try {
        node.oscillator.stop();
        node.oscillator.disconnect();
        node.gainNode.disconnect();
        node.panner.disconnect();
      } catch (err) {}
      this.pannerNodes.delete(id);
    }
  }

  destroy() {
    this.pannerNodes.forEach((_, id) => this.destroyNode(id));
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    if (this.canvas) {
      this.canvas.remove();
    }
    this.particles = [];
    this.isInitialized = false;
  }

  // Get current state
  getState() {
    return {
      isInitialized: this.isInitialized,
      activeNodes: Array.from(this.pannerNodes.keys()),
      particleCount: this.particles.length,
      audioState: this.audioCtx?.state || 'uninitialized',
    };
  }
}

// Singleton instance
export const engine = new ResonanceEngine();

// React hook for using the engine
export const useResonanceEngine = () => {
  return {
    init: () => engine.init(),
    activateNodule: (id, freq, x, y) => engine.activateNodule(id, freq, x, y),
    initSpatialNode: (id, freq, x, y, z) => engine.initSpatialNode(id, freq, x, y, z),
    updateNodePosition: (id, x, y, z) => engine.updateNodePosition(id, x, y, z),
    playSolfeggioTone: (freq, duration) => engine.playSolfeggioTone(freq, duration),
    spawnKarmaFluid: (x, y, color, count) => engine.spawnKarmaFluid(x, y, color, count),
    spawnResonanceRipple: (x, y, freq) => engine.spawnResonanceRipple(x, y, freq),
    triggerHapticPulse: (freq) => engine.triggerHapticPulse(freq),
    triggerKarmaHaptic: (level) => engine.triggerKarmaHaptic(level),
    initFluidCanvas: (id) => engine.initFluidCanvas(id),
    destroy: () => engine.destroy(),
    getState: () => engine.getState(),
    engine,
  };
};

export default ResonanceEngine;
