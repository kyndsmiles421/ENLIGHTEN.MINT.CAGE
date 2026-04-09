/**
 * ENLIGHTEN_OS V21.0 - THE OMNI-NEURAL MANIFEST
 * ARCHITECT: Steven Michael | TERMINAL: kyndsmiles@gmail.com
 * MATH: Fibonacci Bloom | Squared & Inverse Ratio Refraction
 * MATERIALS: Obsidian, Selenite End-Points, Gold Rutilation
 */

const ENLIGHTEN_OS = (() => {
    const PHI = 1.61803398875;
    const SCHUMANN = 7.83;
    const VERSION = '21.0';
    const ARCHITECT = 'Steven Michael';
    const TERMINAL = 'kyndsmiles@gmail.com';

    // State management
    let mixerElement = null;
    let novaPulseInterval = null;
    let novaPulseActive = false;

    const TIERS = {
        VAULT:   { freq: 432, scale: Math.pow(PHI, -1), school: 'Pythagorean/Past', color: '#22d3ee' },
        HUB:     { freq: 528, scale: 1,                 school: 'Solfeggio/Present', color: '#c084fc' },
        MANIFEST:{ freq: 963, scale: PHI,               school: 'Sigfield/Future', color: '#D4AF37' }
    };

    return {
        // ═══════════════════════════════════════════════════════════════════
        // MX 13-STEP BOOT PROTOCOL
        // ═══════════════════════════════════════════════════════════════════
        ignite: () => {
            console.log("%c [MX-1] Steven Michael Identity Lock: V-Spelling Active.", "color: #FFD700; font-weight: bold;");
            
            ENLIGHTEN_OS.injectOmniNeuralStyles();
            ENLIGHTEN_OS.deployNeuralSovereignty();
            ENLIGHTEN_OS.initMixingBoard();
            ENLIGHTEN_OS.renderGoldBloom();
            
            document.body.style.animation = `neuralPulse ${1/SCHUMANN}s infinite ease-in-out`;
            
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            console.log(`%c ENLIGHTEN_OS V${VERSION} - THE OMNI-NEURAL MANIFEST`, 'color: #D4AF37; font-weight: bold; font-size: 14px');
            console.log(`%c ARCHITECT: ${ARCHITECT} | TERMINAL: ${TERMINAL}`, 'color: #D4AF37;');
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            console.log("%c [SYSTEM] Omni-Neural Core: ONLINE.", "color: #00ff00");
        },

        // ═══════════════════════════════════════════════════════════════════
        // 1. DEPLOY OBSIDIAN SHIELD & SELENITE SENSORS
        // ═══════════════════════════════════════════════════════════════════
        deployNeuralSovereignty: () => {
            console.log("%c [MX-2] Deploying Neural Sovereignty: Obsidian Shield + Selenite Sensors...", "color: #D4AF37; font-weight: bold;");
            
            const stage = document.getElementById('app-stage');
            if (stage) {
                // Clear previous neural elements
                stage.querySelectorAll('.gold-thread, .selenite-sensor, .fractal-layer').forEach(el => el.remove());
            }

            // Obsidian Z-1500 Shield Deployment
            const bars = document.querySelectorAll('.sovereign-toolbar');
            bars.forEach(bar => {
                bar.style.zIndex = "1500";
                bar.style.background = "rgba(5, 5, 5, 0.99)"; // Obsidian Depth
                bar.style.border = "1px solid #D4AF37"; // Gold Conductivity Border
                bar.style.backdropFilter = "blur(50px) saturate(1.618)";
                bar.style.boxShadow = "0 0 80px #000, inset 0 0 30px rgba(212, 175, 55, 0.05)";
            });

            // Selenite End-Point Sensors (The Nerves)
            if (stage) {
                ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => {
                    const sensor = document.createElement('div');
                    sensor.className = `selenite-sensor ${pos}`;
                    sensor.setAttribute('data-testid', `selenite-sensor-${pos}`);
                    stage.appendChild(sensor);
                });
            }
            
            console.log("%c [MX-3] Selenite End-Point Sensors deployed (Neural Conductivity Active)", "color: #fff;");
        },

        // ═══════════════════════════════════════════════════════════════════
        // 2. RENDER GOLD RUTILATION & FRACTAL BLOOM
        // ═══════════════════════════════════════════════════════════════════
        renderGoldBloom: (depth = 54) => {
            console.log(`%c [MX-4] Rendering ${depth}-Thread Gold Rutilation Bloom...`, "color: #D4AF37; font-weight: bold;");
            
            const stage = document.getElementById('app-stage');
            if (!stage) {
                console.warn('[BLOOM] app-stage not found');
                return;
            }

            // Clear existing gold threads
            stage.querySelectorAll('.gold-thread').forEach(el => el.remove());
            
            // Create bloom container
            const container = document.createElement('div');
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

            for (let i = 1; i <= depth; i++) {
                const thread = document.createElement('div');
                const ratio = i / depth;
                const mathScale = 1 + (Math.pow(ratio, 2) * PHI); // Squared Ratio
                
                thread.className = 'gold-thread';
                thread.setAttribute('data-thread', i);
                thread.style.cssText = `
                    transform: translateZ(${-i * 12}px) scale(${mathScale}) rotate(${i * PHI * 7}deg);
                    opacity: ${(1 / i) * 0.4};
                    filter: hue-rotate(${i * 6.6}deg) saturate(1.8);
                `;
                container.appendChild(thread);
            }

            stage.appendChild(container);
            
            console.log(`%c [BLOOM] ${depth} Gold Rutilation threads deployed`, 'color: #D4AF37');
            
            window.dispatchEvent(new CustomEvent('GOLD_BLOOM', { 
                detail: { threads: depth, version: VERSION } 
            }));
        },

        // Alias for compatibility
        bloom: (depth = 54) => ENLIGHTEN_OS.renderGoldBloom(depth),
        renderFractalBloom: (depth = 54) => ENLIGHTEN_OS.renderGoldBloom(depth),

        // ═══════════════════════════════════════════════════════════════════
        // 3. MASTER UTILITY COMMANDS - INVERSE RATIO REFRACTION
        // ═══════════════════════════════════════════════════════════════════
        tune: (tier, val) => {
            const value = parseFloat(val);
            const shift = (Math.pow(value, 2) * PHI) - (1 / value); // Inverse Ratio Refraction
            document.documentElement.style.setProperty(`--${tier.toLowerCase()}-refraction`, `${shift * 15}deg`);
            
            // Update fader display
            const faderValue = document.querySelector(`[data-tier="${tier}"] .fader-value`);
            if (faderValue) faderValue.textContent = value.toFixed(2);
            
            // Haptic feedback - Gold Conductivity pulse
            if (navigator.vibrate) navigator.vibrate(value * 10);
            
            console.log(`%c [TUNE] ${tier}: ${value.toFixed(2)} | Refraction: ${shift.toFixed(4)}deg`, 'color: #D4AF37');
        },

        // ═══════════════════════════════════════════════════════════════════
        // STEVEN'S MIXING BOARD
        // ═══════════════════════════════════════════════════════════════════
        initMixingBoard: () => {
            const existing = document.getElementById('sovereign-mixer');
            if (existing) existing.remove();
            
            mixerElement = document.createElement('div');
            mixerElement.id = 'sovereign-mixer';
            mixerElement.className = 'omni-neural-mixer';
            mixerElement.setAttribute('data-testid', 'steven-mixer');
            
            mixerElement.innerHTML = `
                <div class="mixer-header-section">
                    <h2 class="mixer-title">STEVEN'S MIXER V${VERSION}</h2>
                    <div class="mixer-meta">${ARCHITECT} | ${TERMINAL}</div>
                    <div class="mixer-subtitle">OMNI-NEURAL MANIFEST</div>
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
                        <button class="master-btn gold-btn" onclick="window.ENLIGHTEN_OS.renderGoldBloom()">GOLD</button>
                    </div>
                    <div class="master-controls-row2">
                        <button class="master-btn rainbow-btn" onclick="window.ENLIGHTEN_OS.renderRainbowCrystal()">RAINBOW</button>
                        <button class="master-btn clear-btn" onclick="window.ENLIGHTEN_OS.clearBloom()">CLEAR</button>
                    </div>
                    <div class="master-controls-row3">
                        <button class="master-btn handshake-btn" onclick="window.ENLIGHTEN_OS.sendLiveAlert('NEURAL', 'Omni-Neural Ping')">HANDSHAKE</button>
                    </div>
                    <div class="schumann-indicator">
                        <span class="gold-icon">Au</span>
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
            window.dispatchEvent(new CustomEvent('MIXER_TOGGLE', { detail: { visible: show } }));
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
            console.log(`%c [NOVA] Neural breath sync active (Schumann: ${SCHUMANN}Hz)`, 'color: #22d3ee');
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
        // SOVEREIGN BLOOM (Visual Feedback)
        // ═══════════════════════════════════════════════════════════════════
        triggerBloom: () => {
            document.body.classList.add('sovereign-bloom');
            if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
            setTimeout(() => document.body.classList.remove('sovereign-bloom'), 1000);
            console.log(`%c [BLOOM] Sovereign Bloom triggered`, 'color: #D4AF37; font-weight: bold');
        },

        // ═══════════════════════════════════════════════════════════════════
        // RAINBOW CRYSTAL (Alternative Visualization)
        // ═══════════════════════════════════════════════════════════════════
        renderRainbowCrystal: (depth = 54) => {
            console.log(`%c [MX-6] Rendering Rainbow Crystal...`, "color: #ff00ff;");
            const stage = document.getElementById('app-stage');
            if (!stage) return;
            
            ENLIGHTEN_OS.clearBloom();
            
            const container = document.createElement('div');
            container.id = 'gold-bloom-container';
            container.className = 'rainbow-crystal-container';
            container.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                height: 80%;
                pointer-events: none;
                perspective: 1500px;
                z-index: 0;
            `;

            for (let i = 1; i <= depth; i++) {
                const layer = document.createElement('div');
                const ratio = i / depth;
                const mathScale = 1 + (Math.pow(ratio, 2) * PHI);
                const hueRotation = i * (360 / depth);

                layer.className = 'gold-thread rainbow-layer';
                layer.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: ${90 - (i * 1.2)}%;
                    height: ${90 - (i * 1.2)}%;
                    transform: translate(-50%, -50%) translateZ(${-i * PHI * 10}px) scale(${mathScale}) rotate(${i * 2}deg);
                    opacity: ${Math.max(0.02, (1 / i) * PHI * 0.5)};
                    filter: hue-rotate(${hueRotation}deg) blur(${(1 - ratio) * 8}px);
                    border: 1px solid rgba(212, 175, 55, ${0.1 + (0.2 * ratio)});
                    border-radius: ${50 - (i * 0.5)}%;
                    background: radial-gradient(circle, transparent 40%, hsla(${hueRotation}, 80%, 60%, ${0.08 * ratio}) 70%, transparent 100%);
                    pointer-events: none;
                `;
                container.appendChild(layer);
            }
            
            stage.appendChild(container);
        },

        clearBloom: () => {
            const container = document.getElementById('gold-bloom-container');
            if (container) container.remove();
        },
        
        // Alias
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
        // CSS INJECTION - OMNI-NEURAL STYLES
        // ═══════════════════════════════════════════════════════════════════
        injectOmniNeuralStyles: () => {
            const styleId = 'enlighten-os-v21-omni-neural';
            if (document.getElementById(styleId)) return;
            
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                :root {
                    --phi: 1.61803398875;
                    --gold-rutilation: #D4AF37;
                    --selenite-white: rgba(230, 240, 255, 0.95);
                    --obsidian-depth: rgba(5, 5, 5, 0.99);
                    --neural-glow: rgba(212, 175, 55, 0.4);
                }

                /* Neural Pulse Animation */
                @keyframes neuralPulse {
                    0%, 100% { filter: brightness(1) saturate(1); }
                    50% { filter: brightness(1.03) saturate(1.02); }
                }

                /* Sovereign Bloom Animation */
                @keyframes sovereignBloom {
                    0% { filter: brightness(1) saturate(1); }
                    50% { filter: brightness(1.4) saturate(1.6); }
                    100% { filter: brightness(1) saturate(1); }
                }
                body.sovereign-bloom { animation: sovereignBloom 1s ease-out; }

                /* ═══ SELENITE END-POINT SENSORS (The Nerves) ═══ */
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
                    0%, 100% { 
                        opacity: 0.5;
                        box-shadow: 0 0 8px var(--selenite-white);
                    }
                    50% { 
                        opacity: 0.85;
                        box-shadow: 
                            0 0 15px var(--selenite-white),
                            0 0 35px rgba(230, 240, 255, 0.5),
                            0 0 60px rgba(212, 175, 55, 0.2);
                    }
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
                        rgba(168, 85, 247, 0.1) 100%
                    );
                    border-radius: 50%;
                    border: 1px solid rgba(212, 175, 55, 0.08);
                    transition: all 1.2s cubic-bezier(0.19, 1, 0.22, 1);
                }

                .gold-bloom-container,
                .rainbow-crystal-container {
                    transform-style: preserve-3d;
                }

                .rainbow-layer {
                    transform-style: preserve-3d;
                    backface-visibility: hidden;
                }

                /* ═══ OMNI-NEURAL MIXER PANEL ═══ */
                .omni-neural-mixer {
                    position: fixed !important;
                    right: 0 !important;
                    top: 15vh;
                    bottom: 22vh;
                    width: calc(100vw / var(--phi) / var(--phi));
                    min-width: 280px;
                    max-width: 380px;
                    background: var(--obsidian-depth) !important;
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
                        inset 0 0 30px rgba(212, 175, 55, 0.02);
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
                .mixer-meta { 
                    font-size: 0.6rem; 
                    color: rgba(255,255,255,0.4); 
                    margin-top: 4px; 
                }
                .mixer-subtitle {
                    font-size: 0.5rem;
                    color: rgba(212, 175, 55, 0.6);
                    letter-spacing: 0.3em;
                    margin-top: 4px;
                }
                .mixer-channels-section { 
                    flex: 1; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 12px; 
                    overflow-y: auto; 
                }
                .mixer-channel-tier { 
                    background: rgba(212, 175, 55, 0.03); 
                    border: 1px solid rgba(212, 175, 55, 0.15); 
                    border-radius: 8px; 
                    padding: 12px; 
                }
                .channel-meta { 
                    display: flex; 
                    align-items: baseline; 
                    gap: 8px; 
                    margin-bottom: 8px; 
                }
                .channel-meta strong { font-size: 0.75rem; letter-spacing: 0.1em; }
                .channel-freq { font-size: 0.6rem; font-family: monospace; opacity: 0.7; }
                .channel-school { font-size: 0.55rem; opacity: 0.5; margin-left: auto; }
                .channel-fader { display: flex; align-items: center; gap: 8px; }
                .tier-fader { 
                    flex: 1; 
                    height: 6px; 
                    appearance: none; 
                    background: rgba(212, 175, 55, 0.15); 
                    border-radius: 3px; 
                    cursor: pointer; 
                }
                .tier-fader::-webkit-slider-thumb { 
                    appearance: none; 
                    width: 16px; 
                    height: 16px; 
                    background: var(--gold-rutilation); 
                    border-radius: 50%; 
                    cursor: pointer; 
                    box-shadow: 0 0 10px var(--gold-rutilation); 
                }
                .fader-value { 
                    font-size: 0.6rem; 
                    font-family: monospace; 
                    color: var(--gold-rutilation); 
                    min-width: 32px; 
                    text-align: right; 
                }
                .mixer-master-section { 
                    border-top: 1px solid rgba(212, 175, 55, 0.3); 
                    padding-top: 1rem; 
                }
                .master-controls, .master-controls-row2, .master-controls-row3 { 
                    display: flex; 
                    gap: 6px; 
                    margin-bottom: 8px; 
                }
                .master-btn { 
                    flex: 1; 
                    padding: 8px 12px; 
                    background: rgba(212, 175, 55, 0.15); 
                    border: 1px solid rgba(212, 175, 55, 0.4); 
                    border-radius: 6px; 
                    color: var(--gold-rutilation); 
                    font-size: 0.6rem; 
                    font-weight: 600; 
                    letter-spacing: 0.1em; 
                    cursor: pointer; 
                    transition: all 0.2s ease; 
                }
                .master-btn:hover { 
                    background: rgba(212, 175, 55, 0.25); 
                    box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); 
                }
                .master-btn.nova-btn { background: rgba(34, 211, 238, 0.15); border-color: rgba(34, 211, 238, 0.4); color: #22d3ee; }
                .master-btn.bloom-btn { background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); color: #a855f7; }
                .master-btn.gold-btn { background: rgba(212, 175, 55, 0.2); border-color: rgba(212, 175, 55, 0.5); color: #D4AF37; }
                .master-btn.rainbow-btn { 
                    background: linear-gradient(90deg, rgba(255,0,0,0.15), rgba(255,165,0,0.15), rgba(0,255,0,0.15), rgba(0,0,255,0.15), rgba(238,130,238,0.15)); 
                    border-color: rgba(255,0,255,0.4); 
                    color: #ff00ff; 
                }
                .master-btn.handshake-btn { background: rgba(0,255,255,0.15); border-color: rgba(0,255,255,0.4); color: #00ffff; }
                .master-btn.clear-btn { background: rgba(255,100,100,0.1); border-color: rgba(255,100,100,0.3); color: #ff6b6b; }
                
                .schumann-indicator { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 8px; 
                    font-size: 0.65rem; 
                    color: var(--gold-rutilation); 
                    opacity: 0.8; 
                }
                .gold-icon {
                    font-weight: bold;
                    color: var(--gold-rutilation);
                    text-shadow: 0 0 8px var(--gold-rutilation);
                }
                .version-tag { 
                    margin-left: 8px; 
                    padding: 2px 6px; 
                    background: rgba(212, 175, 55, 0.2); 
                    border-radius: 4px; 
                    font-size: 0.5rem; 
                    color: var(--gold-rutilation); 
                }
                .mixer-close-btn { 
                    position: absolute; 
                    top: 8px; 
                    right: 8px; 
                    width: 24px; 
                    height: 24px; 
                    background: transparent; 
                    border: 1px solid rgba(212, 175, 55, 0.3); 
                    border-radius: 4px; 
                    color: var(--gold-rutilation); 
                    font-size: 16px; 
                    cursor: pointer; 
                }
                .mixer-close-btn:hover { 
                    background: rgba(255,0,0,0.2); 
                    color: #ff6b6b; 
                }
            `;
            
            document.head.appendChild(style);
            console.log(`%c [MX-7] V${VERSION} Omni-Neural Styles injected`, 'color: #D4AF37');
        },

        // ═══════════════════════════════════════════════════════════════════
        // CLEANUP
        // ═══════════════════════════════════════════════════════════════════
        destroy: () => {
            ENLIGHTEN_OS.stopNovaPulse();
            if (mixerElement) { mixerElement.remove(); mixerElement = null; }
            ENLIGHTEN_OS.clearBloom();
            document.querySelectorAll('.selenite-sensor').forEach(s => s.remove());
            console.log(`%c [SYSTEM] ENLIGHTEN_OS V${VERSION} shutdown`, 'color: #666');
        },

        // Public API
        PHI, SCHUMANN, ARCHITECT, TERMINAL, VERSION, TIERS
    };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.ENLIGHTEN_OS = ENLIGHTEN_OS;
}

export default ENLIGHTEN_OS;
