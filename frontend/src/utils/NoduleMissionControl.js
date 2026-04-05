/**
 * THE UNIVERSAL NODULE CONTROLLER (UNC)
 * Architecture: Fibonacci Spiral + Interlocking Aura + 3D Projection
 * 
 * A vanilla JS implementation for direct DOM manipulation.
 * Can be used alongside React or in pure HTML contexts.
 * 
 * Usage: NoduleMissionControl.init('container-id', options)
 */

const NoduleMissionControl = (() => {
  // 1. Default Configuration Constants
  const DEFAULT_CONFIG = {
    totalNodules: 12,
    baseRadius: 280,
    goldenAngle: 137.508, // Golden angle in degrees
    perspective: "1200px",
    rotationSpeed: 0.1, // Degrees per frame
    autoRotate: true,
    colors: ["#fbc02d", "#9c27b0", "#4caf50", "#2196f3", "#e91e63", "#ff5722"],
    symbols: ["👁️", "🌙", "⬡", "⭐", "⚛️", "🕸️", "🔮", "☀️", "🎴", "☯️", "💜", "🌟"],
    labels: ["Oracle", "Moon", "Matrix", "Stars", "Core", "Web", "Crystal", "Sun", "Tarot", "I Ching", "Mood", "Light"],
  };

  let config = { ...DEFAULT_CONFIG };
  let rotationAngle = 0;
  let animationId = null;
  let isPaused = false;
  let stage = null;

  // 2. Inject Required CSS into Head (only once)
  const injectStyles = () => {
    if (document.getElementById('unc-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'unc-styles';
    style.textContent = `
      .unc-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at center, #0a0a12 0%, #000 100%);
        overflow: hidden;
      }

      .unc-stage {
        transform-style: preserve-3d;
        width: 100%;
        height: 100%;
        position: relative;
      }

      .universal-nodule {
        position: absolute;
        left: 50%;
        top: 50%;
        transform-style: preserve-3d;
        cursor: pointer;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .universal-nodule:hover {
        filter: brightness(1.3);
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
        animation: unc-pulse var(--pulse-speed, 4s) ease-in-out infinite alternate;
        pointer-events: none;
        z-index: -1;
      }

      @keyframes unc-pulse {
        0% { transform: scale(1); opacity: 0.4; filter: blur(10px) hue-rotate(0deg); }
        100% { transform: scale(1.4); opacity: 0.8; filter: blur(12px) hue-rotate(15deg); }
      }

      .nodule-core {
        width: 60px;
        height: 60px;
        background: rgba(10, 10, 18, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        color: white;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
        backface-visibility: hidden;
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
        transform: translate(-50%, -50%);
        position: relative;
        left: 50%;
        top: 50%;
      }

      .universal-nodule:hover .nodule-core {
        border-color: var(--nodule-color, rgba(255, 255, 255, 0.5));
        box-shadow: 0 0 30px var(--nodule-color, rgba(255, 255, 255, 0.3));
      }

      .nodule-core .symbol {
        font-size: 20px;
      }

      .nodule-core .label {
        font-size: 7px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(248, 250, 252, 0.5);
        margin-top: 2px;
      }

      .bloom-effect {
        transform: translate(-50%, -50%) scale(3) !important;
        opacity: 0 !important;
        z-index: 1000 !important;
        transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      }

      .unc-center-core {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 100;
      }

      .unc-center-core .core-glow {
        position: absolute;
        width: 150px;
        height: 150px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, transparent 70%);
        filter: blur(20px);
        animation: unc-core-breath 4s ease-in-out infinite alternate;
      }

      @keyframes unc-core-breath {
        from { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
        to { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
      }

      .unc-center-core .core-display {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(10, 10, 18, 0.95);
        border: 2px solid rgba(167, 139, 250, 0.4);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .unc-center-core .core-display:hover {
        border-color: rgba(167, 139, 250, 0.8);
        box-shadow: 0 0 30px rgba(167, 139, 250, 0.4);
      }

      .unc-center-core .hz-value {
        font-size: 20px;
        font-weight: 700;
        color: rgba(248, 250, 252, 0.9);
        font-family: 'JetBrains Mono', monospace;
      }

      .unc-center-core .hz-label {
        font-size: 8px;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: rgba(167, 139, 250, 0.7);
        text-transform: uppercase;
      }
    `;
    document.head.appendChild(style);
  };

  // 3. The Core Factory: Creates a Nodule with all properties
  const createNodule = (index, customData = null) => {
    const nodule = document.createElement('div');
    nodule.className = 'universal-nodule';

    // Fibonacci Math for positioning
    const r = Math.sqrt(index + 1) * (config.baseRadius / Math.sqrt(config.totalNodules));
    const theta = index * config.goldenAngle;
    const x = r * Math.cos((theta * Math.PI) / 180);
    const y = r * Math.sin((theta * Math.PI) / 180);
    const z = (index / config.totalNodules) * 100 - 50; // Depth tilt

    // Assign Properties
    const color = customData?.color || config.colors[index % config.colors.length];
    const symbol = customData?.icon || config.symbols[index % config.symbols.length];
    const label = customData?.label || config.labels[index % config.labels.length];
    const pulseSpeed = customData?.pulse || `${3 + (index % 3)}s`;

    // Inject HTML Structure (Aura + Content)
    nodule.innerHTML = `
      <div class="nodule-vibration" style="background: radial-gradient(circle, ${color} 0%, transparent 70%); --pulse-speed: ${pulseSpeed}"></div>
      <div class="nodule-core" style="--nodule-color: ${color}">
        <span class="symbol">${symbol}</span>
        <span class="label">${label}</span>
      </div>
    `;

    // Apply Initial 3D Transform
    nodule.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`;
    nodule.style.setProperty('--nodule-color', color);
    nodule.dataset.index = index;
    nodule.dataset.label = label;

    // Store position data
    nodule._uncData = { x, y, z, r, theta, index, color, symbol, label };

    // Interaction Logic
    nodule.onclick = (e) => {
      e.stopPropagation();
      console.log(`[UNC]: Nodule ${index} (${label}) triggered.`);
      
      // Dispatch custom event for external listeners
      nodule.dispatchEvent(new CustomEvent('nodule-click', {
        bubbles: true,
        detail: { index, label, color, symbol, ...nodule._uncData },
      }));

      // Bloom effect
      nodule.classList.add('bloom-effect');
      setTimeout(() => nodule.classList.remove('bloom-effect'), 800);

      // Execute callback if provided
      if (customData?.onClick) {
        customData.onClick({ index, label, color, symbol });
      }
    };

    return nodule;
  };

  // 4. Create center core element
  const createCenterCore = () => {
    const core = document.createElement('div');
    core.className = 'unc-center-core';
    core.innerHTML = `
      <div class="core-glow"></div>
      <div class="core-display">
        <span class="hz-value">∞</span>
        <span class="hz-label">FREE</span>
      </div>
    `;

    core.querySelector('.core-display').onclick = () => {
      console.log('[UNC]: Center core clicked');
      core.dispatchEvent(new CustomEvent('core-click', { bubbles: true }));
    };

    return core;
  };

  // 5. Animation loop
  const animate = () => {
    if (!isPaused && config.autoRotate && stage) {
      rotationAngle += config.rotationSpeed;
      stage.style.transform = `rotateY(${rotationAngle}deg)`;
    }
    animationId = requestAnimationFrame(animate);
  };

  // 6. Initialize the Stage
  const init = (containerId, options = {}) => {
    // Merge options with defaults
    config = { ...DEFAULT_CONFIG, ...options };

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`[UNC]: Container '${containerId}' not found`);
      return null;
    }

    // Inject styles
    injectStyles();

    // Setup container
    container.className = 'unc-container';
    container.style.perspective = config.perspective;
    container.innerHTML = '<div class="unc-stage"></div>';

    stage = container.querySelector('.unc-stage');

    // Create nodules
    const nodules = options.nodules || [];
    const count = nodules.length || config.totalNodules;

    for (let i = 0; i < count; i++) {
      stage.appendChild(createNodule(i, nodules[i]));
    }

    // Add center core
    stage.appendChild(createCenterCore());

    // Pause on hover
    container.addEventListener('mouseenter', () => { isPaused = true; });
    container.addEventListener('mouseleave', () => { isPaused = false; });

    // Start animation
    if (animationId) cancelAnimationFrame(animationId);
    animate();

    console.log(`[UNC]: Initialized with ${count} nodules`);

    return {
      container,
      stage,
      pause: () => { isPaused = true; },
      resume: () => { isPaused = false; },
      setRotation: (angle) => { rotationAngle = angle; },
      destroy: () => {
        if (animationId) cancelAnimationFrame(animationId);
        container.innerHTML = '';
      },
    };
  };

  // 7. Update resonance display
  const setResonance = (hz, name) => {
    const core = document.querySelector('.unc-center-core');
    if (!core) return;

    const hzValue = core.querySelector('.hz-value');
    const hzLabel = core.querySelector('.hz-label');

    if (hzValue) hzValue.textContent = hz || '∞';
    if (hzLabel) hzLabel.textContent = name || 'FREE';
  };

  return { 
    init, 
    setResonance,
    getConfig: () => ({ ...config }),
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NoduleMissionControl;
}

// Also attach to window for direct script usage
if (typeof window !== 'undefined') {
  window.NoduleMissionControl = NoduleMissionControl;
}

export default NoduleMissionControl;
