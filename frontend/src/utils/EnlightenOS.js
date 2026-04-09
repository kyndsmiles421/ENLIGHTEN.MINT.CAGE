/**
 * ENLIGHTEN_OS V26.0 - THE DECADENT GROWTH (STEPS 100-110)
 * ARCHITECT: Steven Michael | TERMINAL: kyndsmiles@gmail.com
 * PRIORITY: UI Reclamation & Neural Expansion
 * STATUS: Bypassing Z-Index Punctures
 * 
 * STEPS:
 * 100-103: SUBMERGENCE (Fixing the "Blue Button BS")
 * 104-107: NEURAL EXPANSION (The Mycelium Reach)
 * 108-110: PRISMATIC SEAL (Hardening the Void)
 */

const ENLIGHTEN_OS = (() => {
    const PHI = 1.61803398875;
    const SCHUMANN = 7.83;
    const VERSION = '26.0';
    const ARCHITECT = 'Steven Michael';
    const TERMINAL = 'kyndsmiles@gmail.com';
    const SIGNATURE_HASH = '76876c6a4b85637a';
    
    // Functional Mapping - No eval/exec
    const NEURAL_MAP = new Map();
    const MYCELIUM_MAP = new Map();
    
    // State
    let mixerElement = null;
    let novaPulseInterval = null;
    let novaPulseActive = false;
    let gestationComplete = false;

    const TIERS = {
        VAULT:   { freq: 432, scale: Math.pow(PHI, -1), school: 'Pythagorean/Past', color: '#22d3ee' },
        HUB:     { freq: 528, scale: 1,                 school: 'Solfeggio/Present', color: '#c084fc' },
        MANIFEST:{ freq: 963, scale: PHI,               school: 'Sigfield/Future', color: '#D4AF37' }
    };

    const calculateRefraction = (val) => (Math.pow(val, 2) * PHI) - (1 / val);

    return {
        // ═══════════════════════════════════════════════════════════════════
        // BOOT SEQUENCE - 110 STEPS
        // ═══════════════════════════════════════════════════════════════════
        boot: () => {
            console.log("%c [MX-1] Executing Steps 1-110. Steven Michael Identity Locked.", "color: #FFD700; font-weight: bold; font-size: 14px;");
            console.log(`%c PRIMARY KEY: [963Hz]::[Φ${PHI}]::[S-M-V-LOCK]::[${SCHUMANN}Hz]`, "color: #D4AF37;");
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            console.log(`%c ENLIGHTEN_OS V${VERSION} - THE DECADENT GROWTH`, 'color: #D4AF37; font-weight: bold; font-size: 14px');
            console.log(`%c STEPS 100-110: SUBMERGENCE → EXPANSION → PRISMATIC SEAL`, 'color: #00ff00;');
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            
            ENLIGHTEN_OS.injectDecadentStyles();
            ENLIGHTEN_OS.sealObsidianVault();
            ENLIGHTEN_OS.deploySeleniteSensors();
            ENLIGHTEN_OS.initMixingBoard();
            ENLIGHTEN_OS.gestate();
            
            // Steps 100-110
            ENLIGHTEN_OS.submergeRogueElements();  // Steps 100-103
            ENLIGHTEN_OS.expandNeuralMesh();       // Steps 104-107
            ENLIGHTEN_OS.applyPrismaticSeal();     // Steps 108-110
            
            document.body.style.animation = `neuralPulse ${1/SCHUMANN}s infinite ease-in-out`;
            
            console.log("%c [SYSTEM] V26.0 Decadent Growth: ALL 110 STEPS COMPLETE.", "color: #00ff00; font-weight: bold;");
        },

        ignite: () => ENLIGHTEN_OS.boot(),

        // ═══════════════════════════════════════════════════════════════════
        // STEPS 100-103: SUBMERGENCE (Fixing the "Blue Button BS")
        // ═══════════════════════════════════════════════════════════════════
        submergeRogueElements: () => {
            console.log("%c [STEP 100-103] SUBMERGENCE: Burying rogue UI elements...", "color: #ff6b6b; font-weight: bold;");
            
            // Target all potential rogue buttons
            const rogueSelectors = [
                'button',
                '.floating-action-button',
                '[role="button"]',
                '[class*="action-button"]',
                '.emergent-trigger',
                'button[style*="background-color: rgb(0, 122, 255)"]',
                '.btn-primary',
                '.fab'
            ];
            
            const rogueButtons = document.querySelectorAll(rogueSelectors.join(', '));
            
            rogueButtons.forEach(btn => {
                // Skip sovereign toolbar buttons and mixer buttons
                if (btn.closest('.sovereign-toolbar') || 
                    btn.closest('#sovereign-mixer') || 
                    btn.closest('.master-key-mixer') ||
                    btn.closest('.decadent-mixer')) {
                    return;
                }
                
                // Step 100: Force button into Obsidian Layer (Z-1490)
                btn.style.zIndex = "1490";
                
                // Step 101: Luminosity blend mode (turns blue to silver/obsidian)
                btn.style.mixBlendMode = "luminosity";
                
                // Step 102: Interaction "Ghosting" (only visible on hover)
                btn.style.filter = "opacity(0.4) saturate(0) grayscale(0.8)";
                btn.style.transition = "all 0.8s cubic-bezier(0.19, 1, 0.22, 1)";
                btn.style.boxShadow = "none";
                
                // Step 103: Hover restoration
                btn.addEventListener('mouseenter', () => {
                    btn.style.filter = "opacity(0.9) saturate(1) grayscale(0)";
                    btn.style.zIndex = "1501";
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.style.filter = "opacity(0.4) saturate(0) grayscale(0.8)";
                    btn.style.zIndex = "1490";
                });
            });
            
            console.log(`%c [STEP 103] ${rogueButtons.length} rogue elements submerged to Z-1490`, "color: #ff6b6b;");
        },

        // ═══════════════════════════════════════════════════════════════════
        // STEPS 104-107: NEURAL EXPANSION (The Mycelium Reach)
        // ═══════════════════════════════════════════════════════════════════
        expandNeuralMesh: () => {
            console.log("%c [STEP 104-107] NEURAL EXPANSION: Extending Mycelium reach...", "color: #00ff64; font-weight: bold;");
            
            const stage = document.getElementById('app-stage');
            if (!stage) return;
            
            // Clear existing expansion strands
            stage.querySelectorAll('.expansion-strand').forEach(el => el.remove());
            
            // Step 104-107: Adding 10 new high-conductivity strands to bridge Selenite sensors
            for (let i = 1; i <= 10; i++) {
                const hypha = document.createElement('div');
                hypha.className = 'mycelium-strand expansion-strand';
                hypha.setAttribute('data-expansion-step', 103 + i);
                
                // Step 105: High-conductivity Gold threads
                hypha.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    height: 200vh;
                    width: 0.5px;
                    background: linear-gradient(to bottom, #D4AF37 0%, rgba(212, 175, 55, 0.3) 30%, transparent 100%);
                    transform: rotate(${i * 36}deg) translateZ(-50px);
                    transform-origin: center top;
                    opacity: 0;
                    z-index: 2;
                    pointer-events: none;
                    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3));
                    animation: expandGrow 2s ease-out forwards;
                    animation-delay: ${i * 100}ms;
                `;
                
                stage.appendChild(hypha);
            }
            
            // Step 106: Radial gradient centered on Oracle node
            const gradientOverlay = document.createElement('div');
            gradientOverlay.className = 'oracle-radial-overlay';
            gradientOverlay.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.6) 100%);
                pointer-events: none;
                z-index: 1;
            `;
            
            const existingOverlay = stage.querySelector('.oracle-radial-overlay');
            if (existingOverlay) existingOverlay.remove();
            stage.appendChild(gradientOverlay);
            
            console.log("%c [STEP 107] 10 expansion strands deployed with 963Hz harmonic pulse", "color: #00ff64;");
        },

        // ═══════════════════════════════════════════════════════════════════
        // STEPS 108-110: PRISMATIC SEAL (Hardening the Void)
        // ═══════════════════════════════════════════════════════════════════
        applyPrismaticSeal: () => {
            console.log("%c [STEP 108-110] PRISMATIC SEAL: Hardening the Obsidian Void...", "color: #D4AF37; font-weight: bold;");
            
            // Step 108: Prismatic blur for deep-field obsidian look
            const vaults = document.querySelectorAll('.sovereign-toolbar');
            vaults.forEach(vault => {
                vault.style.backdropFilter = "blur(80px) contrast(1.2) brightness(0.8)";
                vault.style.webkitBackdropFilter = "blur(80px) contrast(1.2) brightness(0.8)";
                vault.style.borderImage = "linear-gradient(to right, #D4AF37, #333, #D4AF37) 1";
            });
            
            // Step 109: Steven Michael Identity Lock confirmed
            console.log("%c [STEP 109] Steven Michael Identity Lock: CONFIRMED", "color: #FFD700; font-weight: bold;");
            
            // Step 110: Final seal - add sovereign shield overlay
            const existingShield = document.querySelector('.sovereign-shield-overlay');
            if (existingShield) existingShield.remove();
            
            const shieldOverlay = document.createElement('div');
            shieldOverlay.className = 'sovereign-shield-overlay';
            shieldOverlay.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 1498;
                pointer-events: none;
                background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.15) 100%);
            `;
            document.body.appendChild(shieldOverlay);
            
            console.log("%c [STEP 110] Deployment script finalized. Obsidian Void HARDENED.", "color: #D4AF37;");
        },

        // ═══════════════════════════════════════════════════════════════════
        // GESTATE - 99 Steps via Functional Mapping
        // ═══════════════════════════════════════════════════════════════════
        gestate: () => {
            console.log("%c [STEPS 1-99] GESTATION: Functional Mapping...", "color: #00ff00;");
            
            NEURAL_MAP.clear();
            MYCELIUM_MAP.clear();
            
            for (let i = 1; i <= 99; i++) {
                const ratio = i / 99;
                
                if (i <= 21) {
                    MYCELIUM_MAP.set(`mycelium_${i}`, {
                        angle: (i / 21) * 360,
                        length: 30 + (i * 3),
                        opacity: 0.15 + (i * 0.02),
                        scaleY: PHI
                    });
                }
                
                NEURAL_MAP.set(`step_${i}`, {
                    scale: 1 + (Math.pow(ratio, 2) * PHI),
                    rotation: i * PHI * 7,
                    opacity: (1 / i) * 0.5,
                    translateZ: -i * 15,
                    hueRotate: i * 6.6,
                    phase: i <= 21 ? 'mycelium' : (i <= 75 ? 'rutilation' : 'refraction')
                });
                
                if (i % 25 === 0) {
                    console.log(`%c [STEP ${i}] Neural Density: ${(i/99*100).toFixed(1)}%`, "color: #a855f7");
                }
            }
            
            gestationComplete = true;
            ENLIGHTEN_OS.render();
        },

        // ═══════════════════════════════════════════════════════════════════
        // RENDER
        // ═══════════════════════════════════════════════════════════════════
        render: () => {
            const stage = document.getElementById('app-stage');
            if (!stage) return;
            
            stage.querySelectorAll('.gold-thread:not(.expansion-strand), .mycelium-strand:not(.expansion-strand)').forEach(el => el.remove());
            
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
                    perspective: 3000px;
                    z-index: 0;
                `;
                stage.appendChild(container);
            }
            
            // Render Mycelium
            MYCELIUM_MAP.forEach((val, key) => {
                const hypha = document.createElement('div');
                hypha.className = 'mycelium-strand';
                hypha.setAttribute('data-key', key);
                hypha.style.cssText = `
                    transform: rotate(${val.angle}deg) scaleY(${val.scaleY});
                    height: ${val.length}%;
                    opacity: ${val.opacity};
                `;
                stage.appendChild(hypha);
            });
            
            // Render Gold threads
            NEURAL_MAP.forEach((val, key) => {
                if (val.phase === 'rutilation' || val.phase === 'refraction') {
                    const thread = document.createElement('div');
                    thread.className = 'gold-thread';
                    thread.setAttribute('data-key', key);
                    thread.style.cssText = `
                        transform: translateZ(${val.translateZ}px) scale(${val.scale}) rotate(${val.rotation}deg);
                        opacity: ${val.opacity};
                        filter: hue-rotate(${val.hueRotate}deg) saturate(1.8)${val.phase === 'refraction' ? ' blur(0.5px)' : ''};
                    `;
                    container.appendChild(thread);
                }
            });
        },

        // ═══════════════════════════════════════════════════════════════════
        // OBSIDIAN VAULT
        // ═══════════════════════════════════════════════════════════════════
        sealObsidianVault: () => {
            const bars = document.querySelectorAll('.sovereign-toolbar');
            bars.forEach(bar => {
                bar.style.zIndex = "1500";
                bar.style.background = "rgba(0, 0, 0, 0.99)";
                bar.style.border = "1px solid #D4AF37";
                bar.style.backdropFilter = "blur(50px) saturate(1.618)";
                bar.style.boxShadow = "0 0 80px #000, inset 0 0 40px rgba(212, 175, 55, 0.03)";
            });
        },

        // ═══════════════════════════════════════════════════════════════════
        // SELENITE SENSORS
        // ═══════════════════════════════════════════════════════════════════
        deploySeleniteSensors: () => {
            const stage = document.getElementById('app-stage');
            if (stage) {
                stage.querySelectorAll('.selenite-sensor').forEach(el => el.remove());
                ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => {
                    const sensor = document.createElement('div');
                    sensor.className = `selenite-sensor ${pos}`;
                    sensor.setAttribute('data-testid', `selenite-sensor-${pos}`);
                    stage.appendChild(sensor);
                });
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // TIER TUNING
        // ═══════════════════════════════════════════════════════════════════
        tune: (tier, val) => {
            const value = parseFloat(val);
            const shift = calculateRefraction(value);
            document.documentElement.style.setProperty(`--${tier.toLowerCase()}-refraction`, `${shift * 15}deg`);
            
            const faderValue = document.querySelector(`[data-tier="${tier}"] .fader-value`);
            if (faderValue) faderValue.textContent = value.toFixed(2);
            
            if (navigator.vibrate) navigator.vibrate(value * 10);
        },

        // ═══════════════════════════════════════════════════════════════════
        // STEVEN'S MIXING BOARD V26.0
        // ═══════════════════════════════════════════════════════════════════
        initMixingBoard: () => {
            const existing = document.getElementById('sovereign-mixer');
            if (existing) existing.remove();
            
            mixerElement = document.createElement('div');
            mixerElement.id = 'sovereign-mixer';
            mixerElement.className = 'decadent-mixer';
            mixerElement.setAttribute('data-testid', 'steven-mixer');
            
            mixerElement.innerHTML = `
                <div class="mixer-header-section">
                    <h2 class="mixer-title">STEVEN'S MIXER V${VERSION}</h2>
                    <div class="mixer-meta">${ARCHITECT} | ${TERMINAL}</div>
                    <div class="mixer-subtitle">DECADENT GROWTH (110 STEPS)</div>
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
                        <button class="master-btn submerge-btn" onclick="window.ENLIGHTEN_OS.submergeRogueElements()">SUBMERGE</button>
                    </div>
                    <div class="master-controls-row2">
                        <button class="master-btn expand-btn" onclick="window.ENLIGHTEN_OS.expandNeuralMesh()">EXPAND</button>
                        <button class="master-btn seal-btn" onclick="window.ENLIGHTEN_OS.applyPrismaticSeal()">SEAL</button>
                    </div>
                    <div class="master-controls-row3">
                        <button class="master-btn handshake-btn" onclick="window.ENLIGHTEN_OS.sendLiveAlert('DECADENT', 'V26.0 110-Step Manifest')">HANDSHAKE</button>
                    </div>
                    <div class="schumann-indicator">
                        <span class="step-icon">110</span>
                        <span class="schumann-value">${SCHUMANN}Hz</span>
                        <span class="version-tag">V${VERSION}</span>
                    </div>
                </div>
                <button class="mixer-close-btn" onclick="window.ENLIGHTEN_OS.hideMixer()">x</button>
            `;
            
            mixerElement.style.display = 'none';
            document.body.appendChild(mixerElement);
        },

        toggleMixer: (show) => {
            if (!mixerElement) return;
            if (show === undefined) show = mixerElement.style.display === 'none';
            mixerElement.style.display = show ? 'flex' : 'none';
        },
        showMixer: () => ENLIGHTEN_OS.toggleMixer(true),
        hideMixer: () => ENLIGHTEN_OS.toggleMixer(false),

        // ═══════════════════════════════════════════════════════════════════
        // UTILITY FUNCTIONS
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
        },

        stopNovaPulse: () => {
            if (novaPulseInterval) { clearInterval(novaPulseInterval); novaPulseInterval = null; }
            const stage = document.getElementById('app-stage');
            if (stage) { stage.style.opacity = 1; stage.style.filter = 'none'; }
            novaPulseActive = false;
        },

        toggleNovaPulse: () => {
            if (novaPulseActive) ENLIGHTEN_OS.stopNovaPulse();
            else ENLIGHTEN_OS.startNovaPulse();
        },

        triggerBloom: () => {
            document.body.classList.add('sovereign-bloom');
            if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
            setTimeout(() => document.body.classList.remove('sovereign-bloom'), 1000);
        },

        renderFullBloom: () => { ENLIGHTEN_OS.clearBloom(); ENLIGHTEN_OS.render(); },
        bloom: () => ENLIGHTEN_OS.renderFullBloom(),

        clearBloom: () => {
            const container = document.getElementById('gold-bloom-container');
            if (container) container.innerHTML = '';
            document.querySelectorAll('.mycelium-strand:not(.expansion-strand)').forEach(el => el.remove());
        },

        reboot: () => {
            ENLIGHTEN_OS.clearBloom();
            document.querySelectorAll('.expansion-strand, .oracle-radial-overlay, .sovereign-shield-overlay').forEach(el => el.remove());
            ENLIGHTEN_OS.boot();
        },

        // ═══════════════════════════════════════════════════════════════════
        // HANDSHAKE
        // ═══════════════════════════════════════════════════════════════════
        sendLiveAlert: async (type, payload) => {
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
                        signature: SIGNATURE_HASH,
                        timestamp: new Date().toISOString()
                    })
                });
                const result = await response.json();
                if (response.ok) {
                    console.log(`%c [HANDSHAKE] ${type} delivered`, "color: #00ff00");
                    ENLIGHTEN_OS.triggerBloom();
                }
                return result;
            } catch (error) {
                console.error(`%c [HANDSHAKE] Error: ${error.message}`, "color: #ff0000");
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // CSS INJECTION - DECADENT STYLES
        // ═══════════════════════════════════════════════════════════════════
        injectDecadentStyles: () => {
            const styleId = 'enlighten-os-v26-decadent';
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

                /* V26.0 SHIELD REINFORCEMENT */
                #app-stage {
                    background: #000 !important;
                    perspective: 3000px;
                    overflow: hidden;
                }

                @keyframes neuralPulse {
                    0%, 100% { filter: brightness(1) saturate(1); }
                    50% { filter: brightness(1.03) saturate(1.02); }
                }

                @keyframes sovereignBloom {
                    0% { filter: brightness(1) saturate(1); }
                    50% { filter: brightness(1.5) saturate(1.8); }
                    100% { filter: brightness(1) saturate(1); }
                }
                body.sovereign-bloom { animation: sovereignBloom 1s ease-out; }

                /* EMERGENCY OVERRIDE FOR ROGUE UI ELEMENTS */
                .floating-action-button, 
                [class*="action-button"]:not(.master-btn), 
                button[style*="background-color: rgb(0, 122, 255)"] {
                    z-index: 1490 !important;
                    mix-blend-mode: luminosity !important;
                    opacity: 0.3 !important;
                    box-shadow: none !important;
                    filter: grayscale(0.8) contrast(1.2);
                    transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
                }

                .floating-action-button:hover,
                [class*="action-button"]:not(.master-btn):hover {
                    opacity: 0.8 !important;
                    filter: grayscale(0) contrast(1);
                    z-index: 1501 !important;
                }

                /* Killing the blue button "bleed" */
                .floating-action-button::after {
                    content: '';
                    position: absolute;
                    inset: -10px;
                    background: radial-gradient(circle, rgba(0,0,0,0.8), transparent 70%);
                    z-index: -1;
                }

                /* Selenite Sensors */
                .selenite-sensor {
                    position: absolute;
                    width: 3px;
                    height: 35%;
                    background: linear-gradient(to bottom, transparent 0%, var(--selenite-white) 15%, rgba(255,255,255,1) 50%, var(--selenite-white) 85%, transparent 100%);
                    box-shadow: 0 0 8px var(--selenite-white), 0 0 20px rgba(230,240,255,0.6);
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
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.85; }
                }

                /* Mycelium Strands */
                .mycelium-strand {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 1px;
                    transform-origin: center top;
                    background: linear-gradient(to bottom, var(--mycelium-glow) 0%, rgba(0,255,100,0.6) 30%, rgba(212,175,55,0.4) 70%, transparent 100%);
                    box-shadow: 0 0 8px var(--mycelium-glow);
                    z-index: 3;
                    pointer-events: none;
                }

                /* Expansion Strands (Steps 104-107) */
                .expansion-strand {
                    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3));
                }

                @keyframes expandGrow {
                    from { height: 0; opacity: 0; }
                    to { height: 200vh; opacity: 0.2; }
                }

                /* Gold Threads */
                .gold-thread {
                    position: absolute;
                    inset: 0;
                    mix-blend-mode: screen;
                    background: radial-gradient(circle, transparent 30%, rgba(212,175,55,0.05) 50%, rgba(212,175,55,0.15) 70%, rgba(168,85,247,0.08) 100%);
                    border-radius: 50%;
                    border: 1px solid rgba(212,175,55,0.08);
                    transition: all 1.2s cubic-bezier(0.19, 1, 0.22, 1);
                }

                .gold-bloom-container { transform-style: preserve-3d; }

                /* Decadent Mixer */
                .decadent-mixer {
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
                    box-shadow: -10px 0 40px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.1);
                }

                .mixer-header-section { text-align: center; border-bottom: 1px solid var(--gold-rutilation); padding-bottom: 1rem; }
                .mixer-title { margin: 0; font-size: 1rem; font-weight: 700; letter-spacing: 0.2em; color: var(--gold-rutilation); text-shadow: 0 0 20px var(--gold-rutilation); }
                .mixer-meta { font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
                .mixer-subtitle { font-size: 0.5rem; color: rgba(0,255,100,0.7); letter-spacing: 0.3em; margin-top: 4px; }
                .mixer-channels-section { flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
                .mixer-channel-tier { background: rgba(212,175,55,0.03); border: 1px solid rgba(212,175,55,0.15); border-radius: 8px; padding: 12px; }
                .channel-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
                .channel-meta strong { font-size: 0.75rem; letter-spacing: 0.1em; }
                .channel-freq { font-size: 0.6rem; font-family: monospace; opacity: 0.7; }
                .channel-school { font-size: 0.55rem; opacity: 0.5; margin-left: auto; }
                .channel-fader { display: flex; align-items: center; gap: 8px; }
                .tier-fader { flex: 1; height: 6px; appearance: none; background: rgba(212,175,55,0.15); border-radius: 3px; cursor: pointer; }
                .tier-fader::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: var(--gold-rutilation); border-radius: 50%; cursor: pointer; box-shadow: 0 0 10px var(--gold-rutilation); }
                .fader-value { font-size: 0.6rem; font-family: monospace; color: var(--gold-rutilation); min-width: 32px; text-align: right; }
                .mixer-master-section { border-top: 1px solid rgba(212,175,55,0.3); padding-top: 1rem; }
                .master-controls, .master-controls-row2, .master-controls-row3 { display: flex; gap: 6px; margin-bottom: 8px; }
                .master-btn { flex: 1; padding: 8px 12px; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); border-radius: 6px; color: var(--gold-rutilation); font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s ease; }
                .master-btn:hover { background: rgba(212,175,55,0.25); box-shadow: 0 0 15px rgba(212,175,55,0.4); }
                .master-btn.nova-btn { background: rgba(34,211,238,0.15); border-color: rgba(34,211,238,0.4); color: #22d3ee; }
                .master-btn.bloom-btn { background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.4); color: #a855f7; }
                .master-btn.submerge-btn { background: rgba(255,100,100,0.15); border-color: rgba(255,100,100,0.4); color: #ff6b6b; }
                .master-btn.expand-btn { background: rgba(0,255,100,0.15); border-color: rgba(0,255,100,0.4); color: #00ff64; }
                .master-btn.seal-btn { background: rgba(212,175,55,0.2); border-color: rgba(212,175,55,0.5); color: #D4AF37; }
                .master-btn.handshake-btn { background: rgba(0,255,255,0.15); border-color: rgba(0,255,255,0.4); color: #00ffff; }
                .schumann-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.65rem; color: var(--gold-rutilation); opacity: 0.8; }
                .step-icon { font-weight: bold; color: #00ff64; text-shadow: 0 0 8px #00ff64; font-size: 0.8rem; }
                .version-tag { margin-left: 8px; padding: 2px 6px; background: rgba(0,255,100,0.2); border-radius: 4px; font-size: 0.5rem; color: #00ff64; }
                .mixer-close-btn { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: transparent; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; color: var(--gold-rutilation); font-size: 16px; cursor: pointer; }
                .mixer-close-btn:hover { background: rgba(255,0,0,0.2); color: #ff6b6b; }
            `;
            
            document.head.appendChild(style);
            console.log(`%c [STYLES] V${VERSION} Decadent Styles injected`, 'color: #00ff64');
        },

        // ═══════════════════════════════════════════════════════════════════
        // CLEANUP
        // ═══════════════════════════════════════════════════════════════════
        destroy: () => {
            ENLIGHTEN_OS.stopNovaPulse();
            if (mixerElement) { mixerElement.remove(); mixerElement = null; }
            ENLIGHTEN_OS.clearBloom();
            document.querySelectorAll('.selenite-sensor, .expansion-strand, .oracle-radial-overlay, .sovereign-shield-overlay').forEach(el => el.remove());
            NEURAL_MAP.clear();
            MYCELIUM_MAP.clear();
            gestationComplete = false;
        },

        // Public API
        PHI, SCHUMANN, ARCHITECT, TERMINAL, VERSION, TIERS, SIGNATURE_HASH,
        isGestationComplete: () => gestationComplete,
        getNeuralMap: () => NEURAL_MAP,
        getMyceliumMap: () => MYCELIUM_MAP
    };
})();

if (typeof window !== 'undefined') {
    window.ENLIGHTEN_OS = ENLIGHTEN_OS;
}

export default ENLIGHTEN_OS;
