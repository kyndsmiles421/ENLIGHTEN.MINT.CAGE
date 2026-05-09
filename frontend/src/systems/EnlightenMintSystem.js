/**
 * ENLIGHTEN.MINT.CAFE - UNIFIED RESONANCE SYSTEM
 * Core: Fibonacci Spiral | Matrix Background | Fluid Physics | Spatial Audio
 * ONE SCRIPT TO RULE THE HUB.
 */

const EnlightenMintSystem = (() => {
  // 1. GLOBAL CONFIGURATION
  const CONFIG = {
    name: "ENLIGHTEN.MINT.CAFE",
    nodules: [
      { id: 'oracle', label: 'ORACLE', icon: '⬡', freq: 432, color: '#00ffc3', path: '/oracle' },
      { id: 'tarot', label: 'TAROT', icon: '🔮', freq: 528, color: '#fbc02d', path: '/tarot' },
      { id: 'matrix', label: 'MATRIX', icon: '🕸️', freq: 639, color: '#9c27b0', path: '/tesseract' },
      { id: 'iching', label: 'I CHING', icon: '☯', freq: 741, color: '#4caf50', path: '/iching' },
      { id: 'stars', label: 'STARS', icon: '✨', freq: 852, color: '#2196f3', path: '/stars' },
      { id: 'legacy', label: 'SANCTUARY', icon: '🌿', freq: 963, color: '#f8f5f0', path: '/sanctuary' },
      { id: 'mood', label: 'MOOD', icon: '💜', freq: 396, color: '#e91e63', path: '/mood' },
      { id: 'harmonics', label: 'HARMONICS', icon: '🎵', freq: 417, color: '#ff5722', path: '/harmonics' },
    ],
    matrixChars: "010101ENLIGHTENMINTCAFE☯⬡🌿✨",
    phi: 137.508, // Golden angle
    baseRadius: 280,
    perspective: 1200,
    rotationSpeed: 0.05,
  };

  // State
  let audioCtx = null;
  let masterGain = null;
  let particles = [];
  let matrixCtx = null;
  let fluidCtx = null;
  let animationFrame = null;
  let rotationAngle = 0;
  let isPaused = false;
  let isInitialized = false;

  // 2. THE RESONANCE ENGINE (Audio & Haptics)
  const initAudio = async () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  };

  const triggerResonance = async (freq, duration = 1) => {
    if (!audioCtx) await initAudio();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
    
    // Haptic feedback
    if (navigator.vibrate) {
      const pulse = Math.max(20, 100 - freq / 10);
      try { navigator.vibrate([pulse, 30, pulse / 2]); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    }
  };

  // 3. THE MATRIX LAYER
  const initMatrix = (canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    matrixCtx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(1);
    
    const drawMatrix = () => {
      matrixCtx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      matrixCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      matrixCtx.fillStyle = '#00ffc320';
      matrixCtx.font = '15px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const char = CONFIG.matrixChars[Math.floor(Math.random() * CONFIG.matrixChars.length)];
        matrixCtx.fillText(char, i * 20, drops[i] * 20);
        
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    setInterval(drawMatrix, 50);
  };

  // 4. THE FLUID PHYSICS LAYER
  const initFluid = (canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    fluidCtx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const spawnParticles = (x, y, color = '#00ffc3', count = 25) => {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  };

  const updateFluid = () => {
    if (!fluidCtx) return;
    
    const canvas = fluidCtx.canvas;
    fluidCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.015;
      p.vx *= 0.97;
      p.vy *= 0.97;
      
      fluidCtx.beginPath();
      fluidCtx.arc(p.x, p.y, p.life * p.size, 0, Math.PI * 2);
      fluidCtx.fillStyle = p.color;
      fluidCtx.globalAlpha = p.life * 0.8;
      fluidCtx.fill();
      
      if (p.life <= 0) particles.splice(i, 1);
    }
  };

  // 5. FIBONACCI SPIRAL POSITIONING
  const calculatePosition = (index, total, radius = CONFIG.baseRadius) => {
    const r = Math.sqrt(index + 1) * (radius / Math.sqrt(total));
    const theta = index * CONFIG.phi;
    const rad = (theta * Math.PI) / 180;
    
    return {
      x: r * Math.cos(rad),
      y: r * Math.sin(rad),
      z: (index / total) * 100 - 50,
      rotation: theta,
    };
  };

  // 6. NODULE FACTORY
  const createNodule = (data, index, total) => {
    const pos = calculatePosition(index, total);
    const nodule = document.createElement('div');
    nodule.className = 'universal-nodule';
    nodule.dataset.id = data.id;
    nodule.dataset.freq = data.freq;
    
    nodule.innerHTML = `
      <div class="nodule-vibration" style="
        background: radial-gradient(circle, ${data.color}60 0%, transparent 70%);
        --pulse-speed: ${2 + (index % 4)}s;
      "></div>
      <div class="nodule-core" style="--nodule-color: ${data.color}">
        <span class="icon">${data.icon}</span>
        <span class="label">${data.label}</span>
      </div>
    `;
    
    nodule.style.cssText = `
      position: absolute;
      left: 50%; top: 50%;
      transform: translate(-50%, -50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px);
      transform-style: preserve-3d;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: ${Math.round(pos.z + 100)};
    `;
    
    // Interaction
    nodule.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      // Audio + Haptic
      await triggerResonance(data.freq);
      
      // Visual particles
      const rect = nodule.getBoundingClientRect();
      spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, data.color);
      
      // Bloom effect
      nodule.classList.add('bloom-active');
      setTimeout(() => nodule.classList.remove('bloom-active'), 800);
      
      // Dispatch event for React/router integration
      window.dispatchEvent(new CustomEvent('enlighten-navigate', { 
        detail: { id: data.id, path: data.path, freq: data.freq } 
      }));
      
      console.log(`[ENLIGHTEN.MINT.CAFE] Activated: ${data.label} @ ${data.freq}Hz`);
    });
    
    nodule.addEventListener('mouseenter', () => {
      nodule.style.filter = 'brightness(1.3)';
    });
    
    nodule.addEventListener('mouseleave', () => {
      nodule.style.filter = 'brightness(1)';
    });
    
    return nodule;
  };

  // 7. CENTRAL BRAND CORE
  const createBrandCore = () => {
    const core = document.createElement('div');
    core.className = 'brand-core';
    core.innerHTML = `
      <div class="core-glow"></div>
      <div class="core-content">
        <span class="brand-mark">☕</span>
        <span class="brand-name">ENLIGHTEN</span>
      </div>
    `;
    
    core.addEventListener('click', () => {
      triggerResonance(528);
      window.dispatchEvent(new CustomEvent('enlighten-core-click'));
    });
    
    return core;
  };

  // 8. ANIMATION LOOP
  const animate = () => {
    if (!isPaused) {
      rotationAngle += CONFIG.rotationSpeed;
      
      const stage = document.getElementById('nodule-stage');
      if (stage) {
        stage.style.transform = `rotateY(${rotationAngle}deg)`;
      }
    }
    
    updateFluid();
    animationFrame = requestAnimationFrame(animate);
  };

  // 9. MAIN INITIALIZATION
  const init = (containerId = 'master-hub') => {
    if (isInitialized) return;
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`[ENLIGHTEN.MINT.CAFE] Container "${containerId}" not found`);
      return;
    }
    
    // Inject styles
    injectStyles();
    
    // Build structure
    container.innerHTML = `
      <canvas id="matrix-bg"></canvas>
      <canvas id="fluid-canvas"></canvas>
      <div id="nodule-stage"></div>
      <div id="brand-header">${CONFIG.name}</div>
    `;
    
    // Initialize layers
    initMatrix('matrix-bg');
    initFluid('fluid-canvas');
    
    // Populate stage
    const stage = document.getElementById('nodule-stage');
    CONFIG.nodules.forEach((data, i) => {
      stage.appendChild(createNodule(data, i, CONFIG.nodules.length));
    });
    stage.appendChild(createBrandCore());
    
    // Pause on hover
    container.addEventListener('mouseenter', () => { isPaused = true; });
    container.addEventListener('mouseleave', () => { isPaused = false; });
    
    // Handle resize
    window.addEventListener('resize', () => {
      const matrix = document.getElementById('matrix-bg');
      const fluid = document.getElementById('fluid-canvas');
      if (matrix) { matrix.width = window.innerWidth; matrix.height = window.innerHeight; }
      if (fluid) { fluid.width = window.innerWidth; fluid.height = window.innerHeight; }
    });
    
    // Start animation
    animate();
    
    isInitialized = true;
    console.log(`[ENLIGHTEN.MINT.CAFE] System initialized with ${CONFIG.nodules.length} nodules`);
  };

  // 10. STYLE INJECTION
  const injectStyles = () => {
    if (document.getElementById('enlighten-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'enlighten-styles';
    style.textContent = `
      :root {
        --mint: #00ffc3;
        --gold: #fbc02d;
        --purple: #9c27b0;
        --roast: #0a0a0f;
        --cream: #f8f5f0;
      }
      
      #master-hub {
        position: relative;
        width: 100vw;
        height: 100vh;
        background: var(--roast);
        perspective: ${CONFIG.perspective}px;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
      }
      
      #matrix-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.15;
        z-index: 1;
      }
      
      #fluid-canvas {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
        mix-blend-mode: screen;
      }
      
      #nodule-stage {
        position: absolute;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      #brand-header {
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 1.2rem;
        font-weight: 900;
        letter-spacing: 0.25em;
        background: linear-gradient(-45deg, var(--mint), var(--gold), var(--purple), var(--mint));
        background-size: 400% 400%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: identity-flow 15s ease infinite;
        z-index: 100;
        pointer-events: none;
      }
      
      @keyframes identity-flow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .universal-nodule {
        backface-visibility: hidden;
      }
      
      .nodule-vibration {
        position: absolute;
        width: 120px;
        height: 120px;
        left: -60px;
        top: -60px;
        border-radius: 50%;
        mix-blend-mode: screen;
        filter: blur(10px);
        animation: pulse var(--pulse-speed, 4s) ease-in-out infinite alternate;
        pointer-events: none;
        z-index: -1;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(1.4); opacity: 0.7; }
      }
      
      .nodule-core {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: rgba(10, 10, 15, 0.85);
        border: 1px solid var(--nodule-color, rgba(255,255,255,0.2));
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
        transform: translate(-50%, -50%);
        position: relative;
        left: 50%;
        top: 50%;
      }
      
      .nodule-core:hover {
        border-color: var(--nodule-color);
        box-shadow: 0 0 30px var(--nodule-color);
      }
      
      .nodule-core .icon {
        font-size: 22px;
      }
      
      .nodule-core .label {
        font-size: 7px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(248, 250, 252, 0.6);
        margin-top: 3px;
      }
      
      .bloom-active {
        animation: bloom 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      @keyframes bloom {
        0% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.5); filter: brightness(1.5); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      
      .brand-core {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 100;
        cursor: pointer;
      }
      
      .brand-core .core-glow {
        position: absolute;
        width: 150px;
        height: 150px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(circle, var(--mint) 0%, transparent 70%);
        opacity: 0.3;
        filter: blur(20px);
        animation: core-breathe 4s ease-in-out infinite alternate;
      }
      
      @keyframes core-breathe {
        0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.2; }
        100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
      }
      
      .brand-core .core-content {
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: rgba(10, 10, 15, 0.95);
        border: 2px solid var(--mint);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .brand-core:hover .core-content {
        box-shadow: 0 0 40px var(--mint);
      }
      
      .brand-core .brand-mark {
        font-size: 28px;
      }
      
      .brand-core .brand-name {
        font-size: 8px;
        font-weight: 900;
        letter-spacing: 0.2em;
        color: var(--mint);
        margin-top: 4px;
      }
    `;
    document.head.appendChild(style);
  };

  // 11. PUBLIC API
  return {
    init,
    triggerResonance,
    spawnParticles,
    getConfig: () => ({ ...CONFIG }),
    pause: () => { isPaused = true; },
    resume: () => { isPaused = false; },
    destroy: () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (audioCtx) audioCtx.close();
      particles = [];
      isInitialized = false;
    },
  };
})();

// Auto-attach to window for global access
if (typeof window !== 'undefined') {
  window.EnlightenMintSystem = EnlightenMintSystem;
}

// ES Module export
export default EnlightenMintSystem;
