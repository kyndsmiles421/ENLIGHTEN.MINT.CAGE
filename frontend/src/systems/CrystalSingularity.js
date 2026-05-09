/**
 * ENLIGHTEN.MINT.CAFE - THE CRYSTAL SINGULARITY
 * One Script. One Core. Total Intertanglement.
 * 
 * Features:
 * - 3D Rotating Crystal Core
 * - Matrix Rain Background
 * - Fibonacci Orbital Nodules
 * - Spatial Audio + Haptics
 * - Fluid Particle Physics
 */

const EnlightenMintCafe = (() => {
  // --- 1. CONFIGURATION & IDENTITY ---
  const CONFIG = {
    name: "ENLIGHTEN.MINT.CAFE",
    nodules: [
      { id: 'oracle', label: 'ORACLE', icon: '⬡', freq: 432, color: '#00ffc3', path: '/oracle' },
      { id: 'tarot', label: 'TAROT', icon: '🔮', freq: 528, color: '#fbc02d', path: '/tarot' },
      { id: 'matrix', label: 'MATRIX', icon: '🕸️', freq: 639, color: '#9c27b0', path: '/tesseract' },
      { id: 'iching', label: 'I CHING', icon: '☯', freq: 741, color: '#4caf50', path: '/iching' },
      { id: 'stars', label: 'STARS', icon: '✨', freq: 852, color: '#3b82f6', path: '/stars' },
      { id: 'sanctuary', label: 'SANCTUARY', icon: '🌿', freq: 963, color: '#f8f5f0', path: '/sanctuary' },
      { id: 'mood', label: 'MOOD', icon: '💜', freq: 396, color: '#e91e63', path: '/mood' },
      { id: 'harmonics', label: 'HARMONICS', icon: '🎵', freq: 417, color: '#ff5722', path: '/harmonics' },
    ],
    phi: 137.508,
    mint: "#00ffc3",
    gold: "#fbc02d",
    purple: "#9c27b0",
    roast: "#0a0a0f",
    cream: "#f8f5f0",
    baseRadius: 200,
    crystalRotationSpeed: 0.5,
    orbitalSpeed: 0.02,
  };

  // State
  let audioCtx = null;
  let masterGain = null;
  let particles = [];
  let matrixCtx = null;
  let fluidCtx = null;
  let crystalAngle = 0;
  let orbitalAngle = 0;
  let animationFrame = null;
  let isPaused = false;
  let isInitialized = false;
  let activeNodule = null;

  // --- 2. AUDIO ENGINE ---
  const initAudio = async () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  };

  const triggerResonance = async (freq, duration = 1.5) => {
    if (!audioCtx) await initAudio();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    // Create oscillator with smooth envelope
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // ADSR envelope
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);

    // Haptic feedback
    if (navigator.vibrate) {
      const pattern = [30 + Math.floor(freq / 20), 20, 15];
      try { navigator.vibrate(pattern); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    }
  };

  // Play chord (multiple frequencies)
  const triggerChord = async (freqs, duration = 2) => {
    for (const freq of freqs) {
      triggerResonance(freq, duration);
    }
  };

  // --- 3. CSS INJECTION (The "Anti-Box" Foundation) ---
  const injectStyles = () => {
    if (document.getElementById('crystal-singularity-styles')) return;

    const style = document.createElement('style');
    style.id = 'crystal-singularity-styles';
    style.textContent = `
      :root {
        --mint: ${CONFIG.mint};
        --gold: ${CONFIG.gold};
        --purple: ${CONFIG.purple};
        --roast: ${CONFIG.roast};
        --cream: ${CONFIG.cream};
      }

      #stage-master {
        position: relative;
        width: 100vw;
        height: 100vh;
        background: var(--roast);
        perspective: 1200px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
      }

      /* Layer 1: Matrix Background (Non-Blocking) */
      #matrix-canvas {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.15;
        z-index: 1;
      }

      /* Layer 2: Fluid Particles */
      #fluid-canvas {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
        mix-blend-mode: screen;
      }

      /* Layer 3: Brand Header */
      #brand-header {
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 1.3rem;
        font-weight: 900;
        letter-spacing: 0.3em;
        background: linear-gradient(-45deg, var(--mint), var(--gold), var(--purple), var(--mint));
        background-size: 400% 400%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: identity-flow 15s ease infinite;
        z-index: 200;
        pointer-events: none;
      }

      @keyframes identity-flow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* Layer 4: The Crystal Core */
      #crystal-core {
        position: absolute;
        width: 80px;
        height: 140px;
        transform-style: preserve-3d;
        z-index: 100;
        cursor: pointer;
        transition: transform 0.3s ease;
      }

      #crystal-core:hover {
        transform: scale(1.1);
      }

      .crystal-face {
        position: absolute;
        width: 60px;
        height: 140px;
        background: linear-gradient(to bottom, var(--mint), var(--gold));
        clip-path: polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%);
        opacity: 0.6;
        mix-blend-mode: screen;
        border: 1px solid rgba(255,255,255,0.3);
        backface-visibility: hidden;
      }

      .crystal-face:nth-child(1) { transform: translateZ(20px); }
      .crystal-face:nth-child(2) { transform: rotateY(60deg) translateZ(20px); }
      .crystal-face:nth-child(3) { transform: rotateY(120deg) translateZ(20px); }
      .crystal-face:nth-child(4) { transform: rotateY(180deg) translateZ(20px); }
      .crystal-face:nth-child(5) { transform: rotateY(240deg) translateZ(20px); }
      .crystal-face:nth-child(6) { transform: rotateY(300deg) translateZ(20px); }

      .crystal-inner-glow {
        position: absolute;
        width: 100px;
        height: 100px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(circle, var(--mint) 0%, transparent 70%);
        filter: blur(15px);
        opacity: 0.5;
        animation: crystal-pulse 3s ease-in-out infinite alternate;
      }

      @keyframes crystal-pulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
        100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.6; }
      }

      /* Layer 5: Orbital Stage */
      #orbital-stage {
        position: absolute;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        z-index: 50;
      }

      /* Layer 6: The Nodules */
      .orbital-nodule {
        position: absolute;
        left: 50%;
        top: 50%;
        transform-style: preserve-3d;
        cursor: pointer;
        pointer-events: auto;
        z-index: 60;
        transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      .orbital-nodule:hover {
        z-index: 150;
      }

      .orbital-nodule:hover .nodule-core {
        border-color: var(--nodule-color);
        box-shadow: 0 0 40px var(--nodule-color);
        transform: scale(1.15);
      }

      .nodule-vibration {
        position: absolute;
        width: 150px;
        height: 150px;
        left: -75px;
        top: -75px;
        border-radius: 50%;
        mix-blend-mode: screen;
        filter: blur(20px);
        animation: vibration-pulse var(--pulse-speed, 4s) ease-in-out infinite alternate;
        pointer-events: none;
      }

      @keyframes vibration-pulse {
        0% { transform: scale(1); opacity: 0.3; }
        100% { transform: scale(1.5); opacity: 0.6; }
      }

      .nodule-core {
        width: 60px;
        height: 60px;
        background: rgba(10, 10, 15, 0.85);
        border: 2px solid var(--nodule-color, rgba(255,255,255,0.3));
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        backdrop-filter: blur(12px);
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
        transform: translate(-50%, -50%);
      }

      .nodule-core .icon {
        font-size: 20px;
      }

      .nodule-core .label {
        font-size: 7px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(248, 250, 252, 0.6);
        margin-top: 2px;
      }

      .nodule-active {
        z-index: 200 !important;
      }

      .nodule-active .nodule-core {
        transform: translate(-50%, -50%) scale(1.8) !important;
        box-shadow: 0 0 60px var(--nodule-color) !important;
      }

      /* Status Display */
      #status-display {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 20px;
        background: rgba(10, 10, 15, 0.8);
        border: 1px solid var(--mint);
        border-radius: 30px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.15em;
        color: var(--mint);
        backdrop-filter: blur(10px);
        z-index: 200;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      #status-display.visible {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  };

  // --- 4. MATRIX RAIN ---
  const initMatrix = (canvas) => {
    matrixCtx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01☯⬡🌿✨ENLIGHTENMINTCAFE";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      matrixCtx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      matrixCtx.fillRect(0, 0, canvas.width, canvas.height);

      matrixCtx.fillStyle = CONFIG.mint + '30';
      matrixCtx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        matrixCtx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    setInterval(draw, 50);
  };

  // --- 5. FLUID PARTICLES ---
  const initFluid = (canvas) => {
    fluidCtx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const spawnParticles = (x, y, color = CONFIG.mint, count = 30) => {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
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
      p.life -= 0.012;
      p.vx *= 0.96;
      p.vy *= 0.96;

      fluidCtx.beginPath();
      fluidCtx.arc(p.x, p.y, p.life * p.size, 0, Math.PI * 2);
      fluidCtx.fillStyle = p.color;
      fluidCtx.globalAlpha = p.life * 0.7;
      fluidCtx.fill();

      if (p.life <= 0) particles.splice(i, 1);
    }
  };

  // --- 6. FIBONACCI POSITIONING ---
  const calculatePosition = (index, total, radius = CONFIG.baseRadius) => {
    const r = Math.sqrt(index + 1) * (radius / Math.sqrt(total));
    const theta = (index * CONFIG.phi + orbitalAngle * (180 / Math.PI)) % 360;
    const rad = (theta * Math.PI) / 180;

    return {
      x: r * Math.cos(rad),
      y: r * Math.sin(rad),
      z: Math.sin(index * 0.5) * 50,
      rotation: theta,
    };
  };

  // --- 7. CRYSTAL CORE ---
  const createCrystal = () => {
    const crystal = document.createElement('div');
    crystal.id = 'crystal-core';
    crystal.innerHTML = `
      <div class="crystal-inner-glow"></div>
      <div class="crystal-face"></div>
      <div class="crystal-face"></div>
      <div class="crystal-face"></div>
      <div class="crystal-face"></div>
      <div class="crystal-face"></div>
      <div class="crystal-face"></div>
    `;

    crystal.addEventListener('click', async () => {
      await triggerChord([432, 528, 639], 2);
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, CONFIG.mint, 50);
      window.dispatchEvent(new CustomEvent('crystal-core-click'));
    });

    return crystal;
  };

  // --- 8. NODULE FACTORY ---
  const createNodule = (data, index, total) => {
    const nodule = document.createElement('div');
    nodule.className = 'orbital-nodule';
    nodule.dataset.id = data.id;
    nodule.style.setProperty('--nodule-color', data.color);

    nodule.innerHTML = `
      <div class="nodule-vibration" style="
        background: radial-gradient(circle, ${data.color}50 0%, transparent 70%);
        --pulse-speed: ${3 + (index % 4)}s;
      "></div>
      <div class="nodule-core">
        <span class="icon">${data.icon}</span>
        <span class="label">${data.label}</span>
      </div>
    `;

    nodule.addEventListener('click', async (e) => {
      e.stopPropagation();

      // Audio + Haptic
      await triggerResonance(data.freq);

      // Particles
      const rect = nodule.getBoundingClientRect();
      spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, data.color, 40);

      // Activate
      if (activeNodule) activeNodule.classList.remove('nodule-active');
      nodule.classList.add('nodule-active');
      activeNodule = nodule;

      // Show status
      showStatus(`${data.label} · ${data.freq}Hz`);

      // Dispatch navigation event
      window.dispatchEvent(new CustomEvent('nodule-activate', {
        detail: { id: data.id, path: data.path, freq: data.freq, label: data.label }
      }));

      console.log(`[ENLIGHTEN.MINT.CAFE] ${data.label} @ ${data.freq}Hz`);
    });

    return nodule;
  };

  // --- 9. STATUS DISPLAY ---
  const showStatus = (text) => {
    const status = document.getElementById('status-display');
    if (!status) return;
    status.textContent = text;
    status.classList.add('visible');
    setTimeout(() => status.classList.remove('visible'), 2000);
  };

  // --- 10. ANIMATION LOOP ---
  const animate = () => {
    if (!isPaused) {
      // Rotate crystal
      crystalAngle += CONFIG.crystalRotationSpeed;
      const crystal = document.getElementById('crystal-core');
      if (crystal) {
        crystal.style.transform = `rotateY(${crystalAngle}deg) rotateX(${Math.sin(crystalAngle * 0.01) * 10}deg)`;
      }

      // Update orbital positions
      orbitalAngle += CONFIG.orbitalSpeed;
      const stage = document.getElementById('orbital-stage');
      if (stage) {
        const nodules = stage.querySelectorAll('.orbital-nodule');
        nodules.forEach((nodule, index) => {
          const pos = calculatePosition(index, nodules.length);
          nodule.style.transform = `translate(-50%, -50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`;
          nodule.style.zIndex = Math.round(pos.z + 100);
        });
      }
    }

    updateFluid();
    animationFrame = requestAnimationFrame(animate);
  };

  // --- 11. INITIALIZATION ---
  const init = (containerId = 'stage-master') => {
    if (isInitialized) return;

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`[ENLIGHTEN.MINT.CAFE] Container "${containerId}" not found`);
      return;
    }

    // Inject styles
    injectStyles();

    // Build DOM structure
    container.innerHTML = `
      <canvas id="matrix-canvas"></canvas>
      <canvas id="fluid-canvas"></canvas>
      <div id="brand-header">${CONFIG.name}</div>
      <div id="orbital-stage"></div>
      <div id="status-display"></div>
    `;

    // Add crystal to center
    container.appendChild(createCrystal());

    // Initialize canvas layers
    initMatrix(document.getElementById('matrix-canvas'));
    initFluid(document.getElementById('fluid-canvas'));

    // Populate nodules
    const stage = document.getElementById('orbital-stage');
    CONFIG.nodules.forEach((data, i) => {
      const nodule = createNodule(data, i, CONFIG.nodules.length);
      const pos = calculatePosition(i, CONFIG.nodules.length);
      nodule.style.transform = `translate(-50%, -50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`;
      stage.appendChild(nodule);
    });

    // Pause on hover
    container.addEventListener('mouseenter', () => { isPaused = true; });
    container.addEventListener('mouseleave', () => { isPaused = false; });

    // Handle resize
    window.addEventListener('resize', () => {
      const matrix = document.getElementById('matrix-canvas');
      const fluid = document.getElementById('fluid-canvas');
      if (matrix) { matrix.width = window.innerWidth; matrix.height = window.innerHeight; }
      if (fluid) { fluid.width = window.innerWidth; fluid.height = window.innerHeight; }
    });

    // Start animation
    animate();

    isInitialized = true;
    console.log(`[ENLIGHTEN.MINT.CAFE] Crystal Singularity initialized`);
  };

  // --- 12. PUBLIC API ---
  return {
    init,
    triggerResonance,
    triggerChord,
    spawnParticles,
    showStatus,
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

// Global access
if (typeof window !== 'undefined') {
  window.EnlightenMintCafe = EnlightenMintCafe;
}

export default EnlightenMintCafe;
