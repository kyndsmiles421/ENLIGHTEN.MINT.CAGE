/**
 * ENLIGHTEN_OS V23.0 - THE BIOLOGICAL SUPER-CORE
 * ARCHITECT: Steven Michael | TERMINAL: kyndsmiles@gmail.com
 * ENHANCEMENTS: 99-Step Recursive Growth | Selenite End-Points | Gold Rutilation | Mycelium Neural Web
 */

const ENLIGHTEN_OS = (() => {
    const PHI = 1.61803398875;
    const SCHUMANN = 7.83;
    const VERSION = '23.0';
    const ARCHITECT = 'Steven Michael';
    const TERMINAL = 'kyndsmiles@gmail.com';

    // State management
    let mixerElement = null;
    let novaPulseInterval = null;
    let novaPulseActive = false;
    let growthComplete = false;

    const TIERS = {
        VAULT:   { freq: 432, scale: Math.pow(PHI, -1), school: 'Pythagorean/Past', color: '#22d3ee' },
        HUB:     { freq: 528, scale: 1,                 school: 'Solfeggio/Present', color: '#c084fc' },
        MANIFEST:{ freq: 963, scale: PHI,               school: 'Sigfield/Future', color: '#D4AF37' }
    };

    return {
        // ═══════════════════════════════════════════════════════════════════
        // THE 99-STEP RECURSIVE BOOT
        // ═══════════════════════════════════════════════════════════════════
        ignite: async () => {
            console.log("%c [MX-1] Identity Lock: Steven Michael. V-Lock Active.", "color: #FFD700; font-weight: bold;");
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            console.log(`%c ENLIGHTEN_OS V${VERSION} - THE BIOLOGICAL SUPER-CORE`, 'color: #D4AF37; font-weight: bold; font-size: 14px');
            console.log(`%c ARCHITECT: ${ARCHITECT} | TERMINAL: ${TERMINAL}`, 'color: #D4AF37;');
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            
            ENLIGHTEN_OS.injectBiologicalStyles();
            ENLIGHTEN_OS.sealObsidianVault();
            ENLIGHTEN_OS.deploySeleniteSensors();
            ENLIGHTEN_OS.initMixingBoard();
            
            // 99-Step Growth Loop
            console.log("%c [MX-2] Initiating 99-Step Recursive Growth Protocol...", "color: #00ff00; font-weight: bold;");
            
            for (let i = 1; i <= 99; i++) {
                if (i <= 21) ENLIGHTEN_OS.spawnMycelium(i);           // Steps 1-21: Hyphae Branching
                if (i > 21 && i <= 75) ENLIGHTEN_OS.renderGoldBloom(i - 21); // Steps 22-75: Rutilated Conductivity
                if (i > 75) ENLIGHTEN_OS.refractCrystal(i);           // Steps 76-99: Prismatic Refraction
                
                if (i % 10 === 0) {
                    console.log(`%c [STEP-${i}] Neural Density: ${(i/99*100).toFixed(1)}%`, "color: #a855f7");
                }
            }

            document.body.style.animation = `neuralPulse ${1/SCHUMANN}s infinite ease-in-out`;
            growthComplete = true;
            
            console.log("%c [SYSTEM] V23.0 Omni-Neural Web: FULLY MANIFESTED.", "color: #00ff00; font-weight: bold;");
            
            window.dispatchEvent(new CustomEvent('BIOLOGICAL_SUPERCORE_READY', { 
                detail: { version: VERSION, steps: 99, architect: ARCHITECT } 
            }));
        },

        // ═══════════════════════════════════════════════════════════════════
        // Material 1: Obsidian Vault Seal (Z-1500)
        // ═══════════════════════════════════════════════════════════════════
        sealObsidianVault: () => {
            console.log("%c [MX-3] Sealing Obsidian Vault (Z-1500)...", "color: #000; background: #D4AF37; font-weight: bold;");
            
            const bars = document.querySelectorAll('.sovereign-toolbar');
            bars.forEach(bar => {
                bar.style.zIndex = "1500";
                bar.style.background = "rgba(0, 0, 0, 0.99)"; // True Obsidian Void
                bar.style.border = "1px solid #D4AF37"; // Gold Rutilation Conductivity
                bar.style.backdropFilter = "blur(50px) saturate(1.618)";
                bar.style.boxShadow = "0 0 80px #000, inset 0 0 40px rgba(212, 175, 55, 0.03)";
            });
        },

        // ═══════════════════════════════════════════════════════════════════
        // Material 2: Selenite End-Point Sensors (Nerve Nodes)
        // ═══════════════════════════════════════════════════════════════════
        deploySeleniteSensors: () => {
            console.log("%c [MX-4] Deploying Selenite End-Point Sensors...", "color: #fff; font-weight: bold;");
            
            const stage = document.getElementById('app-stage');
            if (stage) {
                // Clear previous neural elements only
                stage.querySelectorAll('.selenite-sensor, .mycelium-strand, .gold-thread').forEach(el => el.remove());
            }
            
            if (stage) {
                ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => {
                    const sensor = document.createElement('div');
                    sensor.className = `selenite-sensor ${pos}`;
                    sensor.setAttribute('data-testid', `selenite-sensor-${pos}`);
                    stage.appendChild(sensor);
                });
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // Material 3: Mycelium Hyphae (Biological Web) - Steps 1-21
        // ═══════════════════════════════════════════════════════════════════
        spawnMycelium: (step) => {
            const stage = document.getElementById('app-stage');
            if (!stage) return;
            
            const hypha = document.createElement('div');
            hypha.className = 'mycelium-strand';
            hypha.setAttribute('data-step', step);
            
            const angle = (step / 21) * 360;
            const length = 30 + (step * 3); // Progressive growth
            
            hypha.style.cssText = `
                transform: rotate(${angle}deg) scaleY(${PHI});
                height: ${length}%;
                opacity: ${0.15 + (step * 0.02)};
                animation-delay: ${step * 50}ms;
            `;
            
            stage.appendChild(hypha);
        },

        // ═══════════════════════════════════════════════════════════════════
        // Material 4: Gold Rutilation (54-Layer Conductivity) - Steps 22-75
        // ═══════════════════════════════════════════════════════════════════
        renderGoldBloom: (step) => {
            const stage = document.getElementById('app-stage');
            if (!stage) return;
            
            // Create container if not exists
            let container = document.getElementById('gold-bloom-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'gold-bloom-container';
                container.className = 'gold-bloom-container';
                container.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    perspective: 1500px;
                    z-index: 0;
                `;
                stage.appendChild(container);
            }
            
            const thread = document.createElement('div');
            const ratio = step / 54;
            const mathScale = 1 + (Math.pow(ratio, 2) * PHI); // Squared Ratio

            thread.className = 'gold-thread';
            thread.setAttribute('data-step', step);
            thread.style.cssText = `
                transform: translateZ(${-step * 15}px) scale(${mathScale}) rotate(${step * PHI * 7}deg);
                opacity: ${(1 / step) * 0.5};
                filter: hue-rotate(${step * 6.6}deg) saturate(1.8);
            `;
            
            container.appendChild(thread);
        },

        // ═══════════════════════════════════════════════════════════════════
        // Material 5: Prismatic Refraction - Steps 76-99
        // ═══════════════════════════════════════════════════════════════════
        refractCrystal: (step) => {
            // High-frequency Prismatic Refraction logic for last 24 steps
            const threads = document.querySelectorAll('.gold-thread');
            const targetIndex = Math.floor((step - 75) / 24 * threads.length);
            const thread = threads[targetIndex];
            
            if (thread) {
                const currentFilter = thread.style.filter || '';
                const blurAmount = (step - 75) * 0.15;
                thread.style.filter = currentFilter + ` blur(${blurAmount}px)`;
                thread.style.opacity = parseFloat(thread.style.opacity) * 1.05; // Slight brightness boost
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // TIER TUNING - Inverse Ratio Refraction
        // ═══════════════════════════════════════════════════════════════════
        tune: (tier, val) => {
            const value = parseFloat(val);
            const shift = (Math.pow(value, 2) * PHI) - (1 / value); // Inverse Ratio Refraction
            document.documentElement.style.setProperty(`--${tier.toLowerCase()}-refraction`, `${shift * 15}deg`);
            
            const faderValue = document.querySelector(`[data-tier="${tier}"] .fader-value`);
            if (faderValue) faderValue.textContent = value.toFixed(2);
            
            if (navigator.vibrate) navigator.vibrate(value * 10);
            
            console.log(`%c [TUNE] ${tier}: ${value.toFixed(2)} | Refraction: ${shift.toFixed(4)}deg`, 'color: #D4AF37');
        },

        // ═══════════════════════════════════════════════════════════════════
        // STEVEN'S MIXING BOARD V23.0
        // ═══════════════════════════════════════════════════════════════════
        initMixingBoard: () => {
            const existing = document.getElementById('sovereign-mixer');
            if (existing) existing.remove();
            
            mixerElement = document.createElement('div');
            mixerElement.id = 'sovereign-mixer';
            mixerElement.className = 'biological-mixer';
            mixerElement.setAttribute('data-testid', 'steven-mixer');
            
            mixerElement.innerHTML = `
                <div class="mixer-header-section">
                    <h2 class="mixer-title">STEVEN'S MIXER V${VERSION}</h2>
                    <div class="mixer-meta">${ARCHITECT} | ${TERMINAL}</div>
                    <div class="mixer-subtitle">BIOLOGICAL SUPER-CORE</div>
                </div>
                <div class="mixer-channels-section">
                    ${Object.keys(TIERS).map(key => {
                        const t = TIERS[key];
                        return `
                            <div class="mixer-channel-tier" data-tier="${key}">
                                <div class="channel-meta">
                                    <strong style="color: ${t.color}">${key}</strong>
                                    <span class="channel-freq">[${t.freq}Hz]</span>
                                    <span class="channel-school">${t.school}</span>
                                </div>
                                <div class="channel-fader">
                                    <input type="range" min="0.5" max="2.5" step="0.01" value="${t.scale}" 
                                           class="tier-fader" data-tier="${key}"
                                           oninput="window.ENLIGHTEN_OS.tune('${key}', this.value)">
                                    <span class="fader-value">${t.scale.toFixed(2)}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="mixer-master-section">
                    <div class="master-controls">
                        <button class="master-btn nova-btn" onclick="window.ENLIGHTEN_OS.toggleNovaPulse()">NOVA</button>
                        <button class="master-btn bloom-btn" onclick="window.ENLIGHTEN_OS.triggerBloom()">BLOOM</button>
                        <button class="master-btn mycelium-btn" onclick="window.ENLIGHTEN_OS.regrowMycelium()">MYCELIUM</button>
                    </div>
                    <div class="master-controls-row2">
                        <button class="master-btn gold-btn" onclick="window.ENLIGHTEN_OS.renderFullGoldBloom()">GOLD</button>
                        <button class="master-btn clear-btn" onclick="window.ENLIGHTEN_OS.clearBloom()">CLEAR</button>
                    </div>
                    <div class="master-controls-row3">
                        <button class="master-btn handshake-btn" onclick="window.ENLIGHTEN_OS.sendLiveAlert('BIOLOGICAL', 'Mycelium Network Ping')">HANDSHAKE</button>
                    </div>
                    <div class="schumann-indicator">
                        <span class="bio-icon">DNA</span>
                        <span class="schumann-value">${SCHUMANN}Hz</span>
                        <span class="version-tag">V${VERSION}</span>
                    </div>
                </div>
                <button class="mixer-close-btn" onclick="window.ENLIGHTEN_OS.hideMixer()">x</button>
            `;
            
            mixerElement.style.display = 'none';
            document.body.appendChild(mixerElement);
            console.log(`%c [MX-5] Steven's Mixing Board V${VERSION} initialized`, 'color: #D4AF37');
        },

        toggleMixer: (show) => {
            if (!mixerElement) return;
            if (show === undefined) show = mixerElement.style.display === 'none';
            mixerElement.style.display = show ? 'flex' : 'none';
        },
        showMixer: () => ENLIGHTEN_OS.toggleMixer(true),
        hideMixer: () => ENLIGHTEN_OS.toggleMixer(false),

        // ═══════════════════════════════════════════════════════════════════
        // NOVA PULSE (Neural Breath Sync)
        // ═══════════════════════════════════════════════════════════════════
        startNovaPulse: () => {
            if (novaPulseInterval) clearInterval(novaPulseInterval);
            const stage = document.getElementById('app-stage');
            let opacity = 0.5;
            let inhale = true;

            novaPulseInterval = setInterval(() => {
                opacity = inhale ? opacity + 0.004 : opacity - 0.004;
                if (opacity >= 0.85 || opacity <= 0.45) inhale = !inhale;
                if (stage) {
                    stage.style.opacity = opacity;
                    stage.style.filter = `brightness(${opacity + 0.5})`;
                }
            }, 30);
            
            novaPulseActive = true;
            console.log(`%c [NOVA] Neural breath sync active`, 'color: #22d3ee');
        },

        stopNovaPulse: () => {
            if (novaPulseInterval) {
                clearInterval(novaPulseInterval);
                novaPulseInterval = null;
            }
            const stage = document.getElementById('app-stage');
            if (stage) {
                stage.style.opacity = 1;
                stage.style.filter = 'none';
            }
            novaPulseActive = false;
        },

        toggleNovaPulse: () => {
            if (novaPulseActive) ENLIGHTEN_OS.stopNovaPulse();
            else ENLIGHTEN_OS.startNovaPulse();
            return novaPulseActive;
        },

        // ═══════════════════════════════════════════════════════════════════
        // SOVEREIGN BLOOM
        // ═══════════════════════════════════════════════════════════════════
        triggerBloom: () => {
            document.body.classList.add('sovereign-bloom');
            if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
            setTimeout(() => document.body.classList.remove('sovereign-bloom'), 1000);
            console.log(`%c [BLOOM] Sovereign Bloom triggered`, 'color: #D4AF37; font-weight: bold');
        },

        // ═══════════════════════════════════════════════════════════════════
        // REGROW MYCELIUM (Re-run Steps 1-21)
        // ═══════════════════════════════════════════════════════════════════
        regrowMycelium: () => {
            console.log("%c [MYCELIUM] Regrowing Hyphae Network...", "color: #00ff00;");
            document.querySelectorAll('.mycelium-strand').forEach(el => el.remove());
            for (let i = 1; i <= 21; i++) {
                ENLIGHTEN_OS.spawnMycelium(i);
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // RENDER FULL GOLD BLOOM (Re-run Steps 22-75)
        // ═══════════════════════════════════════════════════════════════════
        renderFullGoldBloom: () => {
            console.log("%c [GOLD] Rendering full 54-layer Gold Rutilation...", "color: #D4AF37;");
            ENLIGHTEN_OS.clearBloom();
            for (let i = 1; i <= 54; i++) {
                ENLIGHTEN_OS.renderGoldBloom(i);
            }
        },

        // Alias
        bloom: () => ENLIGHTEN_OS.renderFullGoldBloom(),
        renderFractalBloom: () => ENLIGHTEN_OS.renderFullGoldBloom(),

        clearBloom: () => {
            const container = document.getElementById('gold-bloom-container');
            if (container) container.remove();
        },

        clearFractalLayers: () => ENLIGHTEN_OS.clearBloom(),

        // ═══════════════════════════════════════════════════════════════════
        // SOVEREIGN HANDSHAKE (Live Communication)
        // ═══════════════════════════════════════════════════════════════════
        sendLiveAlert: async (type, payload) => {
            console.log(`%c [HANDSHAKE] Initiating ${type} for ${ARCHITECT}...`, "color: #D4AF37; font-weight: bold");
            
            try {
                const response = await fetch('/api/sovereign/handshake/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        architect: ARCHITECT,
                        terminal: TERMINAL,
                        frequency: "963Hz",
                        type: type,
                        content: payload,
                        timestamp: new Date().toISOString()
                    })
                });
                
                const result = await response.json();
                if (response.ok) {
                    console.log(`%c [HANDSHAKE] ${type} delivered: ${result.message}`, "color: #00ff00");
                    ENLIGHTEN_OS.triggerBloom();
                }
                return result;
            } catch (error) {
                console.error(`%c [HANDSHAKE] Error: ${error.message}`, "color: #ff0000");
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // CSS INJECTION - BIOLOGICAL SUPER-CORE STYLES
        // ═══════════════════════════════════════════════════════════════════
        injectBiologicalStyles: () => {
            const styleId = 'enlighten-os-v23-biological';
            if (document.getElementById(styleId)) return;
            
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                :root {
                    --phi: 1.61803398875;
                    --gold-rutilation: #D4AF37;
                    --selenite-white: rgba(230, 240, 255, 0.95);
                    --obsidian-void: rgba(0, 0, 0, 0.99);
                    --mycelium-glow: rgba(0, 255, 100, 0.3);
                }

                /* Neural Pulse Animation */
                @keyframes neuralPulse {
                    0%, 100% { filter: brightness(1) saturate(1); }
                    50% { filter: brightness(1.03) saturate(1.02); }
                }

                /* Sovereign Bloom Animation */
                @keyframes sovereignBloom {
                    0% { filter: brightness(1) saturate(1); }
                    50% { filter: brightness(1.5) saturate(1.8); }
                    100% { filter: brightness(1) saturate(1); }
                }
                body.sovereign-bloom { animation: sovereignBloom 1s ease-out; }

                /* ═══ SELENITE END-POINT SENSORS ═══ */
                .selenite-sensor {
                    position: absolute;
                    width: 3px;
                    height: 35%;
                    background: linear-gradient(
                        to bottom,
                        transparent 0%,
                        var(--selenite-white) 15%,
                        rgba(255, 255, 255, 1) 50%,
                        var(--selenite-white) 85%,
                        transparent 100%
                    );
                    box-shadow: 
                        0 0 8px var(--selenite-white),
                        0 0 20px rgba(230, 240, 255, 0.6),
                        0 0 40px rgba(230, 240, 255, 0.3);
                    opacity: 0.7;
                    z-index: 8;
                    pointer-events: none;
                    animation: sensorPulse 4s ease-in-out infinite;
                }

                .selenite-sensor.top-left { top: 0; left: 4%; }
                .selenite-sensor.top-right { top: 0; right: 4%; }
                .selenite-sensor.bottom-left { bottom: 0; left: 4%; }
                .selenite-sensor.bottom-right { bottom: 0; right: 4%; }

                @keyframes sensorPulse {
                    0%, 100% { opacity: 0.5; box-shadow: 0 0 8px var(--selenite-white); }
                    50% { opacity: 0.85; box-shadow: 0 0 15px var(--selenite-white), 0 0 35px rgba(230, 240, 255, 0.5); }
                }

                /* ═══ MYCELIUM HYPHAE STRANDS ═══ */
                .mycelium-strand {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 1px;
                    transform-origin: center top;
                    background: linear-gradient(
                        to bottom,
                        var(--mycelium-glow) 0%,
                        rgba(0, 255, 100, 0.6) 30%,
                        rgba(212, 175, 55, 0.4) 70%,
                        transparent 100%
                    );
                    box-shadow: 0 0 8px var(--mycelium-glow);
                    z-index: 3;
                    pointer-events: none;
                    animation: hyphaGrow 3s ease-out forwards;
                }

                @keyframes hyphaGrow {
                    0% { height: 0; opacity: 0; }
                    50% { opacity: 0.6; }
                    100% { opacity: var(--strand-opacity, 0.4); }
                }

                /* ═══ GOLD RUTILATION THREADS ═══ */
                .gold-thread {
                    position: absolute;
                    inset: 0;
                    mix-blend-mode: screen;
                    background: radial-gradient(
                        circle,
                        transparent 30%,
                        rgba(212, 175, 55, 0.05) 50%,
                        rgba(212, 175, 55, 0.15) 70%,
                        rgba(168, 85, 247, 0.08) 100%
                    );
                    border-radius: 50%;
                    border: 1px solid rgba(212, 175, 55, 0.08);
                    transition: all 1.2s cubic-bezier(0.19, 1, 0.22, 1);
                }

                .gold-bloom-container {
                    transform-style: preserve-3d;
                }

                /* ═══ BIOLOGICAL MIXER PANEL ═══ */
                .biological-mixer {
                    position: fixed !important;
                    right: 0 !important;
                    top: 15vh;
                    bottom: 22vh;
                    width: calc(100vw / var(--phi) / var(--phi));
                    min-width: 280px;
                    max-width: 380px;
                    background: var(--obsidian-void) !important;
                    backdrop-filter: blur(30px);
                    border-left: 2px solid var(--gold-rutilation);
                    z-index: 2147483646 !important;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    box-shadow: 
                        -10px 0 40px rgba(0, 0, 0, 0.8),
                        0 0 60px rgba(212, 175, 55, 0.1),
                        inset 0 0 30px rgba(0, 255, 100, 0.02);
                }

                .mixer-header-section { 
                    text-align: center; 
                    border-bottom: 1px solid var(--gold-rutilation); 
                    padding-bottom: 1rem; 
                }
                .mixer-title { 
                    margin: 0; 
                    font-size: 1rem; 
                    font-weight: 700; 
                    letter-spacing: 0.2em; 
                    color: var(--gold-rutilation); 
                    text-shadow: 0 0 20px var(--gold-rutilation); 
                }
                .mixer-meta { font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
                .mixer-subtitle {
                    font-size: 0.5rem;
                    color: rgba(0, 255, 100, 0.7);
                    letter-spacing: 0.3em;
                    margin-top: 4px;
                }
                .mixer-channels-section { flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
                .mixer-channel-tier { background: rgba(212, 175, 55, 0.03); border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 8px; padding: 12px; }
                .channel-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
                .channel-meta strong { font-size: 0.75rem; letter-spacing: 0.1em; }
                .channel-freq { font-size: 0.6rem; font-family: monospace; opacity: 0.7; }
                .channel-school { font-size: 0.55rem; opacity: 0.5; margin-left: auto; }
                .channel-fader { display: flex; align-items: center; gap: 8px; }
                .tier-fader { flex: 1; height: 6px; appearance: none; background: rgba(212, 175, 55, 0.15); border-radius: 3px; cursor: pointer; }
                .tier-fader::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: var(--gold-rutilation); border-radius: 50%; cursor: pointer; box-shadow: 0 0 10px var(--gold-rutilation); }
                .fader-value { font-size: 0.6rem; font-family: monospace; color: var(--gold-rutilation); min-width: 32px; text-align: right; }
                .mixer-master-section { border-top: 1px solid rgba(212, 175, 55, 0.3); padding-top: 1rem; }
                .master-controls, .master-controls-row2, .master-controls-row3 { display: flex; gap: 6px; margin-bottom: 8px; }
                .master-btn { flex: 1; padding: 8px 12px; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 6px; color: var(--gold-rutilation); font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s ease; }
                .master-btn:hover { background: rgba(212, 175, 55, 0.25); box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); }
                .master-btn.nova-btn { background: rgba(34, 211, 238, 0.15); border-color: rgba(34, 211, 238, 0.4); color: #22d3ee; }
                .master-btn.bloom-btn { background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); color: #a855f7; }
                .master-btn.mycelium-btn { background: rgba(0, 255, 100, 0.15); border-color: rgba(0, 255, 100, 0.4); color: #00ff64; }
                .master-btn.gold-btn { background: rgba(212, 175, 55, 0.2); border-color: rgba(212, 175, 55, 0.5); color: #D4AF37; }
                .master-btn.handshake-btn { background: rgba(0, 255, 255, 0.15); border-color: rgba(0, 255, 255, 0.4); color: #00ffff; }
                .master-btn.clear-btn { background: rgba(255, 100, 100, 0.1); border-color: rgba(255, 100, 100, 0.3); color: #ff6b6b; }
                
                .schumann-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.65rem; color: var(--gold-rutilation); opacity: 0.8; }
                .bio-icon { font-weight: bold; color: #00ff64; text-shadow: 0 0 8px #00ff64; }
                .version-tag { margin-left: 8px; padding: 2px 6px; background: rgba(0, 255, 100, 0.2); border-radius: 4px; font-size: 0.5rem; color: #00ff64; }
                .mixer-close-btn { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: transparent; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 4px; color: var(--gold-rutilation); font-size: 16px; cursor: pointer; }
                .mixer-close-btn:hover { background: rgba(255, 0, 0, 0.2); color: #ff6b6b; }
            `;
            
            document.head.appendChild(style);
            console.log(`%c [MX-6] V${VERSION} Biological Styles injected`, 'color: #00ff64');
        },

        // ═══════════════════════════════════════════════════════════════════
        // CLEANUP
        // ═══════════════════════════════════════════════════════════════════
        destroy: () => {
            ENLIGHTEN_OS.stopNovaPulse();
            if (mixerElement) { mixerElement.remove(); mixerElement = null; }
            ENLIGHTEN_OS.clearBloom();
            document.querySelectorAll('.selenite-sensor, .mycelium-strand').forEach(el => el.remove());
            growthComplete = false;
            console.log(`%c [SYSTEM] ENLIGHTEN_OS V${VERSION} shutdown`, 'color: #666');
        },

        // Public API
        PHI, SCHUMANN, ARCHITECT, TERMINAL, VERSION, TIERS,
        isGrowthComplete: () => growthComplete
    };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.ENLIGHTEN_OS = ENLIGHTEN_OS;
}

export default ENLIGHTEN_OS;
