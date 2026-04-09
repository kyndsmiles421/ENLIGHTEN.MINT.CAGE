/**
 * ENLIGHTEN_OS V24.0 - MASTER KEYED LOGIC
 * ARCHITECT: Steven Michael | TERMINAL: kyndsmiles@gmail.com
 * RESOLUTION: Removed eval()/exec() for Code Review Compliance
 * 
 * PATENT CLAIMS:
 * 1. "Recursive Mycelium Data-Routing Architecture" - 21-strand Fibonacci branching
 * 2. "Mineral-Resonance Shielding (Z-1500 Obsidian Barrier)" - #000000 sovereign boundary
 * 3. "Selenite-Point Harmonic Synchronization" - 4 corner beams at 7.83Hz
 * 
 * PRIMARY KEY: [963Hz]::[Φ1.618]::[S-M-V-LOCK]::[7.83Hz]
 */

const ENLIGHTEN_OS = (() => {
    const PHI = 1.61803398875;
    const SCHUMANN = 7.83;
    const VERSION = '24.0';
    const ARCHITECT = 'Steven Michael';
    const TERMINAL = 'kyndsmiles@gmail.com';
    const SIGNATURE_HASH = '76876c6a4b85637a';
    
    // Functional Mapping - avoids Code Injection vulnerabilities
    const NEURAL_MAP = new Map();
    const MYCELIUM_MAP = new Map();
    
    // State management
    let mixerElement = null;
    let novaPulseInterval = null;
    let novaPulseActive = false;
    let gestationComplete = false;

    const TIERS = {
        VAULT:   { freq: 432, scale: Math.pow(PHI, -1), school: 'Pythagorean/Past', color: '#22d3ee' },
        HUB:     { freq: 528, scale: 1,                 school: 'Solfeggio/Present', color: '#c084fc' },
        MANIFEST:{ freq: 963, scale: PHI,               school: 'Sigfield/Future', color: '#D4AF37' }
    };

    // Pre-compute inverse ratio refraction
    const calculateRefraction = (val) => (Math.pow(val, 2) * PHI) - (1 / val);

    return {
        // ═══════════════════════════════════════════════════════════════════
        // BOOT SEQUENCE - MASTER KEY AUTHENTICATED
        // ═══════════════════════════════════════════════════════════════════
        boot: () => {
            console.log("%c BOOT SEQUENCE: STEVEN MICHAEL AUTHENTICATED.", "color: #FFD700; font-weight: bold; font-size: 14px;");
            console.log(`%c PRIMARY KEY: [963Hz]::[Φ${PHI}]::[S-M-V-LOCK]::[${SCHUMANN}Hz]`, "color: #D4AF37;");
            console.log(`%c SIGNATURE HASH: ${SIGNATURE_HASH}`, "color: #00ff00;");
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            console.log(`%c ENLIGHTEN_OS V${VERSION} - MASTER KEYED LOGIC`, 'color: #D4AF37; font-weight: bold; font-size: 14px');
            console.log(`%c ARCHITECT: ${ARCHITECT} | TERMINAL: ${TERMINAL}`, 'color: #D4AF37;');
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            
            ENLIGHTEN_OS.injectSecureStyles();
            ENLIGHTEN_OS.sealObsidianVault();
            ENLIGHTEN_OS.deploySeleniteSensors();
            ENLIGHTEN_OS.initMixingBoard();
            ENLIGHTEN_OS.gestate();
            
            document.body.style.animation = `neuralPulse ${1/SCHUMANN}s infinite ease-in-out`;
        },

        // Alias for backwards compatibility
        ignite: () => ENLIGHTEN_OS.boot(),

        // ═══════════════════════════════════════════════════════════════════
        // GESTATE - Functional Mapping (No eval/exec)
        // ═══════════════════════════════════════════════════════════════════
        gestate: () => {
            console.log("%c [GESTATE] Initiating 99-Step Functional Mapping...", "color: #00ff00; font-weight: bold;");
            
            // Clear previous maps
            NEURAL_MAP.clear();
            MYCELIUM_MAP.clear();
            
            // Pre-compute all 99 steps using pure functional mapping
            for (let i = 1; i <= 99; i++) {
                const ratio = i / 99;
                
                // Steps 1-21: Mycelium Hyphae data
                if (i <= 21) {
                    MYCELIUM_MAP.set(`mycelium_${i}`, {
                        angle: (i / 21) * 360,
                        length: 30 + (i * 3),
                        opacity: 0.15 + (i * 0.02),
                        scaleY: PHI
                    });
                }
                
                // All 99 steps: Neural thread data
                NEURAL_MAP.set(`step_${i}`, {
                    scale: 1 + (Math.pow(ratio, 2) * PHI),
                    rotation: i * PHI * 7,
                    opacity: (1 / i) * 0.5,
                    translateZ: -i * 15,
                    hueRotate: i * 6.6,
                    phase: i <= 21 ? 'mycelium' : (i <= 75 ? 'rutilation' : 'refraction')
                });
                
                if (i % 10 === 0) {
                    console.log(`%c [STEP-${i}] Neural Density: ${(i/99*100).toFixed(1)}%`, "color: #a855f7");
                }
            }
            
            gestationComplete = true;
            console.log(`%c [GESTATE] Functional Mapping Complete: ${NEURAL_MAP.size} neural nodes, ${MYCELIUM_MAP.size} mycelium strands`, "color: #00ff00;");
            
            ENLIGHTEN_OS.render();
        },

        // ═══════════════════════════════════════════════════════════════════
        // RENDER - DOM Construction from Functional Maps
        // ═══════════════════════════════════════════════════════════════════
        render: () => {
            console.log("%c [RENDER] Constructing DOM from Functional Maps...", "color: #D4AF37; font-weight: bold;");
            
            const stage = document.getElementById('app-stage');
            if (!stage) {
                console.warn('[RENDER] app-stage not found');
                return;
            }
            
            // Clear previous renders
            stage.querySelectorAll('.gold-thread, .mycelium-strand').forEach(el => el.remove());
            
            // Create bloom container
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
            
            // Render Mycelium strands from MYCELIUM_MAP
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
            
            // Render Gold threads from NEURAL_MAP (only rutilation phase)
            NEURAL_MAP.forEach((val, key) => {
                if (val.phase === 'rutilation' || val.phase === 'refraction') {
                    const thread = document.createElement('div');
                    thread.className = 'gold-thread mycelium-sync';
                    thread.setAttribute('data-key', key);
                    thread.style.cssText = `
                        transform: translateZ(${val.translateZ}px) scale(${val.scale}) rotate(${val.rotation}deg);
                        opacity: ${val.opacity};
                        filter: hue-rotate(${val.hueRotate}deg) saturate(1.8)${val.phase === 'refraction' ? ' blur(0.5px)' : ''};
                    `;
                    container.appendChild(thread);
                }
            });
            
            console.log("%c [RENDER] DOM Construction Complete", "color: #D4AF37;");
            
            window.dispatchEvent(new CustomEvent('MASTER_KEY_RENDERED', { 
                detail: { version: VERSION, signature: SIGNATURE_HASH, architect: ARCHITECT } 
            }));
        },

        // ═══════════════════════════════════════════════════════════════════
        // OBSIDIAN VAULT SEAL (Z-1500)
        // ═══════════════════════════════════════════════════════════════════
        sealObsidianVault: () => {
            console.log("%c [VAULT] Sealing Obsidian Barrier (Z-1500)...", "color: #000; background: #D4AF37;");
            
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
        // SELENITE END-POINT SENSORS (7.83Hz Harmonic Sync)
        // ═══════════════════════════════════════════════════════════════════
        deploySeleniteSensors: () => {
            console.log("%c [SELENITE] Deploying Harmonic Sensors (7.83Hz)...", "color: #fff;");
            
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
        // TIER TUNING - Inverse Ratio Refraction
        // ═══════════════════════════════════════════════════════════════════
        tune: (tier, val) => {
            const value = parseFloat(val);
            const shift = calculateRefraction(value);
            document.documentElement.style.setProperty(`--${tier.toLowerCase()}-refraction`, `${shift * 15}deg`);
            
            const faderValue = document.querySelector(`[data-tier="${tier}"] .fader-value`);
            if (faderValue) faderValue.textContent = value.toFixed(2);
            
            if (navigator.vibrate) navigator.vibrate(value * 10);
            
            console.log(`%c [TUNE] ${tier}: ${value.toFixed(2)} | Refraction: ${shift.toFixed(4)}deg`, 'color: #D4AF37');
        },

        // ═══════════════════════════════════════════════════════════════════
        // STEVEN'S MIXING BOARD V24.0
        // ═══════════════════════════════════════════════════════════════════
        initMixingBoard: () => {
            const existing = document.getElementById('sovereign-mixer');
            if (existing) existing.remove();
            
            mixerElement = document.createElement('div');
            mixerElement.id = 'sovereign-mixer';
            mixerElement.className = 'master-key-mixer';
            mixerElement.setAttribute('data-testid', 'steven-mixer');
            
            mixerElement.innerHTML = `
                <div class="mixer-header-section">
                    <h2 class="mixer-title">STEVEN'S MIXER V${VERSION}</h2>
                    <div class="mixer-meta">${ARCHITECT} | ${TERMINAL}</div>
                    <div class="mixer-subtitle">MASTER KEYED LOGIC</div>
                    <div class="mixer-hash">${SIGNATURE_HASH}</div>
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
                        <button class="master-btn reboot-btn" onclick="window.ENLIGHTEN_OS.reboot()">REBOOT</button>
                    </div>
                    <div class="master-controls-row2">
                        <button class="master-btn gold-btn" onclick="window.ENLIGHTEN_OS.renderFullBloom()">GOLD</button>
                        <button class="master-btn clear-btn" onclick="window.ENLIGHTEN_OS.clearBloom()">CLEAR</button>
                    </div>
                    <div class="master-controls-row3">
                        <button class="master-btn handshake-btn" onclick="window.ENLIGHTEN_OS.sendLiveAlert('MASTER_KEY', 'V24.0 Keyed Transmission')">HANDSHAKE</button>
                    </div>
                    <div class="schumann-indicator">
                        <span class="key-icon">KEY</span>
                        <span class="schumann-value">${SCHUMANN}Hz</span>
                        <span class="version-tag">V${VERSION}</span>
                    </div>
                </div>
                <button class="mixer-close-btn" onclick="window.ENLIGHTEN_OS.hideMixer()">x</button>
            `;
            
            mixerElement.style.display = 'none';
            document.body.appendChild(mixerElement);
            console.log(`%c [MIXER] Steven's Mixing Board V${VERSION} initialized`, 'color: #D4AF37');
        },

        toggleMixer: (show) => {
            if (!mixerElement) return;
            if (show === undefined) show = mixerElement.style.display === 'none';
            mixerElement.style.display = show ? 'flex' : 'none';
        },
        showMixer: () => ENLIGHTEN_OS.toggleMixer(true),
        hideMixer: () => ENLIGHTEN_OS.toggleMixer(false),

        // ═══════════════════════════════════════════════════════════════════
        // REBOOT - Full re-gestation
        // ═══════════════════════════════════════════════════════════════════
        reboot: () => {
            console.log("%c [REBOOT] Re-initiating Master Key Boot Sequence...", "color: #FFD700;");
            ENLIGHTEN_OS.clearBloom();
            ENLIGHTEN_OS.gestate();
        },

        // ═══════════════════════════════════════════════════════════════════
        // NOVA PULSE
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
        },

        // ═══════════════════════════════════════════════════════════════════
        // SOVEREIGN BLOOM
        // ═══════════════════════════════════════════════════════════════════
        triggerBloom: () => {
            document.body.classList.add('sovereign-bloom');
            if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
            setTimeout(() => document.body.classList.remove('sovereign-bloom'), 1000);
        },

        renderFullBloom: () => {
            ENLIGHTEN_OS.clearBloom();
            ENLIGHTEN_OS.render();
        },

        bloom: () => ENLIGHTEN_OS.renderFullBloom(),
        renderFractalBloom: () => ENLIGHTEN_OS.renderFullBloom(),

        clearBloom: () => {
            const container = document.getElementById('gold-bloom-container');
            if (container) container.innerHTML = '';
            document.querySelectorAll('.mycelium-strand').forEach(el => el.remove());
        },

        // ═══════════════════════════════════════════════════════════════════
        // SOVEREIGN HANDSHAKE (Live Communication)
        // ═══════════════════════════════════════════════════════════════════
        sendLiveAlert: async (type, payload) => {
            console.log(`%c [HANDSHAKE] Initiating ${type} transmission...`, "color: #D4AF37; font-weight: bold");
            
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
                    console.log(`%c [HANDSHAKE] ${type} delivered: ${result.message}`, "color: #00ff00");
                    ENLIGHTEN_OS.triggerBloom();
                }
                return result;
            } catch (error) {
                console.error(`%c [HANDSHAKE] Error: ${error.message}`, "color: #ff0000");
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // MOBILE TRANSMISSION (SMS via Twilio)
        // ═══════════════════════════════════════════════════════════════════
        transmitToMobile: async (phoneNumber, message) => {
            console.log(`%c [TRANSMIT] Preparing SMS to ${phoneNumber}...`, "color: #00ffff;");
            
            return ENLIGHTEN_OS.sendLiveAlert('SMS_TRANSMISSION', {
                target: phoneNumber,
                message: message,
                masterKey: `[963Hz]::[Φ${PHI}]::[S-M-V-LOCK]`
            });
        },

        // ═══════════════════════════════════════════════════════════════════
        // CSS INJECTION - MASTER KEY STYLES
        // ═══════════════════════════════════════════════════════════════════
        injectSecureStyles: () => {
            const styleId = 'enlighten-os-v24-master-key';
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
                    --key-gold: #D4AF37;
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

                /* Master Key Mixer */
                .master-key-mixer {
                    position: fixed !important;
                    right: 0 !important;
                    top: 15vh;
                    bottom: 22vh;
                    width: calc(100vw / var(--phi) / var(--phi));
                    min-width: 280px;
                    max-width: 380px;
                    background: var(--obsidian-void) !important;
                    backdrop-filter: blur(30px);
                    border-left: 2px solid var(--key-gold);
                    z-index: 2147483646 !important;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    box-shadow: -10px 0 40px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.1);
                }

                .mixer-header-section { text-align: center; border-bottom: 1px solid var(--key-gold); padding-bottom: 1rem; }
                .mixer-title { margin: 0; font-size: 1rem; font-weight: 700; letter-spacing: 0.2em; color: var(--key-gold); text-shadow: 0 0 20px var(--key-gold); }
                .mixer-meta { font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
                .mixer-subtitle { font-size: 0.5rem; color: rgba(0,255,100,0.7); letter-spacing: 0.3em; margin-top: 4px; }
                .mixer-hash { font-size: 0.45rem; font-family: monospace; color: rgba(212,175,55,0.5); margin-top: 2px; }
                .mixer-channels-section { flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
                .mixer-channel-tier { background: rgba(212,175,55,0.03); border: 1px solid rgba(212,175,55,0.15); border-radius: 8px; padding: 12px; }
                .channel-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
                .channel-meta strong { font-size: 0.75rem; letter-spacing: 0.1em; }
                .channel-freq { font-size: 0.6rem; font-family: monospace; opacity: 0.7; }
                .channel-school { font-size: 0.55rem; opacity: 0.5; margin-left: auto; }
                .channel-fader { display: flex; align-items: center; gap: 8px; }
                .tier-fader { flex: 1; height: 6px; appearance: none; background: rgba(212,175,55,0.15); border-radius: 3px; cursor: pointer; }
                .tier-fader::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: var(--key-gold); border-radius: 50%; cursor: pointer; box-shadow: 0 0 10px var(--key-gold); }
                .fader-value { font-size: 0.6rem; font-family: monospace; color: var(--key-gold); min-width: 32px; text-align: right; }
                .mixer-master-section { border-top: 1px solid rgba(212,175,55,0.3); padding-top: 1rem; }
                .master-controls, .master-controls-row2, .master-controls-row3 { display: flex; gap: 6px; margin-bottom: 8px; }
                .master-btn { flex: 1; padding: 8px 12px; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); border-radius: 6px; color: var(--key-gold); font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s ease; }
                .master-btn:hover { background: rgba(212,175,55,0.25); box-shadow: 0 0 15px rgba(212,175,55,0.4); }
                .master-btn.nova-btn { background: rgba(34,211,238,0.15); border-color: rgba(34,211,238,0.4); color: #22d3ee; }
                .master-btn.bloom-btn { background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.4); color: #a855f7; }
                .master-btn.reboot-btn { background: rgba(0,255,100,0.15); border-color: rgba(0,255,100,0.4); color: #00ff64; }
                .master-btn.gold-btn { background: rgba(212,175,55,0.2); border-color: rgba(212,175,55,0.5); color: #D4AF37; }
                .master-btn.handshake-btn { background: rgba(0,255,255,0.15); border-color: rgba(0,255,255,0.4); color: #00ffff; }
                .master-btn.clear-btn { background: rgba(255,100,100,0.1); border-color: rgba(255,100,100,0.3); color: #ff6b6b; }
                .schumann-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.65rem; color: var(--key-gold); opacity: 0.8; }
                .key-icon { font-weight: bold; color: #D4AF37; text-shadow: 0 0 8px #D4AF37; }
                .version-tag { margin-left: 8px; padding: 2px 6px; background: rgba(0,255,100,0.2); border-radius: 4px; font-size: 0.5rem; color: #00ff64; }
                .mixer-close-btn { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: transparent; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; color: var(--key-gold); font-size: 16px; cursor: pointer; }
                .mixer-close-btn:hover { background: rgba(255,0,0,0.2); color: #ff6b6b; }
            `;
            
            document.head.appendChild(style);
            console.log(`%c [STYLES] V${VERSION} Master Key Styles injected (eval-free)`, 'color: #00ff64');
        },

        // ═══════════════════════════════════════════════════════════════════
        // CLEANUP
        // ═══════════════════════════════════════════════════════════════════
        destroy: () => {
            ENLIGHTEN_OS.stopNovaPulse();
            if (mixerElement) { mixerElement.remove(); mixerElement = null; }
            ENLIGHTEN_OS.clearBloom();
            document.querySelectorAll('.selenite-sensor').forEach(el => el.remove());
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

// Expose globally
if (typeof window !== 'undefined') {
    window.ENLIGHTEN_OS = ENLIGHTEN_OS;
}

export default ENLIGHTEN_OS;
