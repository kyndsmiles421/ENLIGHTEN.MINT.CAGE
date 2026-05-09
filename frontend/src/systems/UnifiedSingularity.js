/**
 * ENLIGHTEN.MINT.CAFE - THE UNIFIED SINGULARITY
 * Architecture: Crystalline Core + Volumetric Matrix + Fibonacci Orbit + SVG Tethers
 * 
 * The Ultimate Hub Experience.
 */

const UnifiedSingularity = (() => {
  // --- 1. GLOBAL IDENTITY & CONFIG ---
  const CONFIG = {
    name: "ENLIGHTEN.MINT.CAFE",
    phi: 137.508,
    colors: {
      mint: "#00ffc3",
      gold: "#fbc02d",
      roast: "#0a0a0f",
      purple: "#9c27b0",
      cream: "#f8f5f0"
    },
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
    matrixDensity: 80, // Number of 3D Matrix rain strings
    universeRotationSpeed: 80, // Seconds per full rotation
    baseRadius: 180,
  };

  let audioCtx = null;
  let isInitialized = false;

  // --- 2. THE VISUAL FOUNDATION ---
  const injectStyles = () => {
    if (document.getElementById('unified-singularity-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'unified-singularity-styles';
    style.textContent = `
      #stage-master {
        position: relative;
        width: 100vw;
        height: 100vh;
        background: ${CONFIG.colors.roast};
        perspective: 1500px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform-style: preserve-3d;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
      }

      /* Brand Header */
      #brand-title {
        position: absolute;
        top: 25px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 1.4rem;
        font-weight: 900;
        letter-spacing: 0.35em;
        background: linear-gradient(-45deg, ${CONFIG.colors.mint}, ${CONFIG.colors.gold}, ${CONFIG.colors.purple}, ${CONFIG.colors.mint});
        background-size: 400% 400%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: brand-flow 15s ease infinite;
        z-index: 3000;
        pointer-events: none;
      }

      @keyframes brand-flow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* The Spinning Universe */
      #orbital-universe {
        position: absolute;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        animation: rotate-universe ${CONFIG.universeRotationSpeed}s linear infinite;
      }

      @keyframes rotate-universe {
        from { transform: rotateY(0deg); }
        to { transform: rotateY(360deg); }
      }

      /* The 3D Matrix Rain Strips */
      .matrix-rain {
        position: absolute;
        top: 50%;
        left: 50%;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: ${CONFIG.colors.mint};
        opacity: 0.25;
        pointer-events: none;
        writing-mode: vertical-rl;
        text-orientation: upright;
        letter-spacing: 3px;
        mask-image: linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%);
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%);
        animation: matrix-fall var(--speed) linear infinite;
        text-shadow: 0 0 8px ${CONFIG.colors.mint};
      }

      @keyframes matrix-fall {
        from { transform: translate3d(var(--x), -150%, var(--z)) rotateY(var(--ry)); }
        to { transform: translate3d(var(--x), 150%, var(--z)) rotateY(var(--ry)); }
      }

      /* The Central Crystal Core */
      #crystal-anchor {
        position: absolute;
        z-index: 1000;
        transform-style: preserve-3d;
        cursor: pointer;
        transition: transform 0.3s ease;
        animation: crystal-hover 4s ease-in-out infinite;
      }

      @keyframes crystal-hover {
        0%, 100% { transform: translateY(0) rotateY(0deg); }
        50% { transform: translateY(-10px) rotateY(180deg); }
      }

      #crystal-anchor:hover {
        transform: scale(1.15) !important;
      }

      .crystal-glow {
        position: absolute;
        width: 120px;
        height: 120px;
        left: -60px;
        top: -10px;
        border-radius: 50%;
        background: radial-gradient(circle, ${CONFIG.colors.mint}50 0%, transparent 70%);
        filter: blur(20px);
        animation: glow-pulse 3s ease-in-out infinite alternate;
      }

      @keyframes glow-pulse {
        from { transform: scale(0.8); opacity: 0.4; }
        to { transform: scale(1.3); opacity: 0.7; }
      }

      .crystal-face {
        position: absolute;
        width: 50px;
        height: 120px;
        left: -25px;
        top: -60px;
        background: linear-gradient(to bottom, ${CONFIG.colors.mint}, ${CONFIG.colors.gold});
        clip-path: polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%);
        opacity: 0.75;
        mix-blend-mode: screen;
        border: 1px solid rgba(255,255,255,0.4);
        box-shadow: 0 0 30px ${CONFIG.colors.mint}60;
        backface-visibility: hidden;
      }

      .crystal-face:nth-child(2) { transform: rotateY(60deg) translateZ(25px); }
      .crystal-face:nth-child(3) { transform: rotateY(120deg) translateZ(25px); }
      .crystal-face:nth-child(4) { transform: rotateY(180deg) translateZ(25px); }
      .crystal-face:nth-child(5) { transform: rotateY(240deg) translateZ(25px); }
      .crystal-face:nth-child(6) { transform: rotateY(300deg) translateZ(25px); }
      .crystal-face:nth-child(7) { transform: translateZ(25px); }

      /* Interactive Nodules */
      .orbital-nodule {
        position: absolute;
        left: 50%;
        top: 50%;
        transform-style: preserve-3d;
        cursor: pointer;
        z-index: 2000;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .orbital-nodule:hover {
        z-index: 2500;
      }

      .orbital-nodule:hover .nodule-core {
        transform: scale(1.2);
        box-shadow: 0 0 40px var(--nodule-color);
        border-color: var(--nodule-color);
      }

      .nodule-vibration {
        position: absolute;
        width: 140px;
        height: 140px;
        left: -70px;
        top: -70px;
        border-radius: 50%;
        mix-blend-mode: screen;
        filter: blur(18px);
        opacity: 0.4;
        animation: aura-pulse var(--pulse-speed, 3s) infinite alternate;
        pointer-events: none;
      }

      @keyframes aura-pulse {
        from { transform: scale(1); opacity: 0.25; }
        to { transform: scale(1.5); opacity: 0.5; }
      }

      .nodule-core {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid var(--nodule-color, white);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(10, 10, 15, 0.85);
        font-size: 22px;
        box-shadow: 0 0 20px var(--nodule-color, rgba(0,255,195,0.4));
        backdrop-filter: blur(10px);
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
      }

      .nodule-core .icon {
        font-size: 20px;
      }

      .nodule-core .label {
        font-size: 7px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--nodule-color, ${CONFIG.colors.mint});
        margin-top: 2px;
      }

      /* SVG Tethers (Connecting Core to Nodules) */
      #tether-layer {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 500;
      }

      #tether-layer line {
        stroke: ${CONFIG.colors.mint};
        stroke-width: 0.5;
        opacity: 0.15;
        stroke-dasharray: 4, 8;
        animation: tether-flow 2s linear infinite;
      }

      @keyframes tether-flow {
        from { stroke-dashoffset: 0; }
        to { stroke-dashoffset: -24; }
      }

      .bloom {
        animation: bloom-out 0.8s ease-out forwards !important;
      }

      @keyframes bloom-out {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
      }

      /* Status Bar */
      #status-bar {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 25px;
        background: rgba(10, 10, 15, 0.85);
        border: 1px solid ${CONFIG.colors.mint}40;
        border-radius: 30px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2em;
        color: ${CONFIG.colors.mint};
        backdrop-filter: blur(12px);
        z-index: 3000;
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      #status-bar.visible {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  };

  // --- 3. AUDIO ENGINE ---
  const playResonance = async (freq, duration = 1.2) => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);

    // Haptic
    if (navigator.vibrate) {
      try { navigator.vibrate([30, 20, 30]); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    }
  };

  // --- 4. BUILD VOLUMETRIC MATRIX ---
  const buildMatrix = (container) => {
    const chars = "01☯⬡🌿✨ENLIGHTENMINTCAFE";

    for (let i = 0; i < CONFIG.matrixDensity; i++) {
      const strip = document.createElement('div');
      strip.className = 'matrix-rain';

      // Spherical distribution
      const radius = 250 + Math.random() * 350;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const ry = (theta * 180) / Math.PI;

      strip.style.setProperty('--x', `${x}px`);
      strip.style.setProperty('--z', `${z}px`);
      strip.style.setProperty('--ry', `${ry}deg`);
      strip.style.setProperty('--speed', `${3 + Math.random() * 5}s`);

      // Random character string
      const text = Array.from({ length: 15 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('\n');
      strip.innerText = text;

      container.appendChild(strip);
    }
  };

  // --- 5. BUILD CRYSTAL CORE ---
  const buildCrystal = (stage) => {
    const crystal = document.createElement('div');
    crystal.id = 'crystal-anchor';

    // Inner glow
    const glow = document.createElement('div');
    glow.className = 'crystal-glow';
    crystal.appendChild(glow);

    // 6 faces
    for (let i = 0; i < 6; i++) {
      const face = document.createElement('div');
      face.className = 'crystal-face';
      crystal.appendChild(face);
    }

    crystal.onclick = async () => {
      await playResonance(528);
      showStatus('☕ SOURCE RESONATING · 528Hz');
      window.dispatchEvent(new CustomEvent('crystal-activate'));
      console.log("💎 ENLIGHTEN.MINT.CAFE: Source Crystal Activated");
    };

    stage.appendChild(crystal);
  };

  // --- 6. BUILD NODULES & TETHERS ---
  const buildNodules = (universe, stage) => {
    // SVG for tethers
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "tether-layer";
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    stage.appendChild(svg);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    CONFIG.nodules.forEach((n, i) => {
      const nodule = document.createElement('div');
      nodule.className = 'orbital-nodule';
      nodule.style.setProperty('--nodule-color', n.color);
      nodule.dataset.id = n.id;

      // Fibonacci spiral position
      const r = CONFIG.baseRadius + (i * 35);
      const theta = i * CONFIG.phi * (Math.PI / 180);
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const z = Math.sin(i * 0.8) * 40;

      nodule.innerHTML = `
        <div class="nodule-vibration" style="
          background: radial-gradient(circle, ${n.color}60 0%, transparent 70%);
          --pulse-speed: ${2.5 + (i % 4)}s;
        "></div>
        <div class="nodule-core">
          <span class="icon">${n.icon}</span>
          <span class="label">${n.label}</span>
        </div>
      `;

      nodule.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`;

      // Tether line
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', centerX + x);
      line.setAttribute('y2', centerY + y);
      svg.appendChild(line);

      // Click handler
      nodule.onclick = async (e) => {
        e.stopPropagation();
        await playResonance(n.freq);
        showStatus(`${n.label} · ${n.freq}Hz`);

        // Bloom effect
        const core = nodule.querySelector('.nodule-core');
        core.classList.add('bloom');
        setTimeout(() => core.classList.remove('bloom'), 800);

        // Dispatch navigation event
        window.dispatchEvent(new CustomEvent('nodule-activate', {
          detail: { id: n.id, path: n.path, freq: n.freq, label: n.label }
        }));

        console.log(`☕ ${n.label} @ ${n.freq}Hz`);
      };

      universe.appendChild(nodule);
    });
  };

  // --- 7. STATUS BAR ---
  const showStatus = (text) => {
    const bar = document.getElementById('status-bar');
    if (!bar) return;
    bar.textContent = text;
    bar.classList.add('visible');
    setTimeout(() => bar.classList.remove('visible'), 2500);
  };

  // --- 8. INITIALIZE ---
  const init = (containerId = 'stage-master') => {
    if (isInitialized) return;

    injectStyles();

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`[ENLIGHTEN.MINT.CAFE] Container "${containerId}" not found`);
      return;
    }

    // Build DOM
    container.innerHTML = `
      <div id="brand-title">${CONFIG.name}</div>
      <div id="orbital-universe"></div>
      <div id="status-bar"></div>
    `;

    const universe = document.getElementById('orbital-universe');
    
    // Build layers
    buildMatrix(universe);
    buildCrystal(container);
    buildNodules(universe, container);

    // Pause rotation on hover
    container.addEventListener('mouseenter', () => {
      universe.style.animationPlayState = 'paused';
    });
    container.addEventListener('mouseleave', () => {
      universe.style.animationPlayState = 'running';
    });

    // Handle resize
    window.addEventListener('resize', () => {
      const svg = document.getElementById('tether-layer');
      if (svg) {
        svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
      }
    });

    isInitialized = true;
    console.log("☕ ENLIGHTEN.MINT.CAFE: Unified Singularity Aligned.");
  };

  // --- 9. PUBLIC API ---
  return {
    init,
    playResonance,
    showStatus,
    getConfig: () => ({ ...CONFIG }),
    destroy: () => {
      if (audioCtx) audioCtx.close();
      isInitialized = false;
    }
  };
})();

// Global access
if (typeof window !== 'undefined') {
  window.UnifiedSingularity = UnifiedSingularity;
}

export default UnifiedSingularity;
