/**
 * ENLIGHTEN_OS V27.0 - RAINBOW REFRACTION RESTORATION
 * ARCHITECT: Steven Michael | TERMINAL: kyndsmiles@gmail.com
 * COMMAND: REVERT_TO_STABLE_REFRACTION
 * OBJECTIVE: Remove Obsidian Overlays / Restore Rainbow Refraction
 * SEED: KMMDDZREGGUKH2KUTPSPMRW1
 */

const ENLIGHTEN_OS = (() => {
    const PHI = 1.61803398875;
    const SCHUMANN = 7.83;
    const VERSION = '27.0';
    const ARCHITECT = 'Steven Michael';
    const TERMINAL = 'kyndsmiles@gmail.com';
    const OMEGA_SEED = 'KMMDDZREGGUKH2KUTPSPMRW1';
    
    const CONFIG = {
        seed: OMEGA_SEED,
        freq: "963Hz",
        layers: { active: 1500, spectral: -1 }
    };

    // State
    let mixerElement = null;
    let novaPulseInterval = null;
    let novaPulseActive = false;
    let refractionLayer = null;

    const TIERS = {
        VAULT:   { freq: 432, scale: Math.pow(PHI, -1), school: 'Pythagorean/Past', color: '#22d3ee' },
        HUB:     { freq: 528, scale: 1,                 school: 'Solfeggio/Present', color: '#c084fc' },
        MANIFEST:{ freq: 963, scale: PHI,               school: 'Sigfield/Future', color: '#D4AF37' }
    };

    const calculateRefraction = (val) => (Math.pow(val, 2) * PHI) - (1 / val);

    return {
        // ═══════════════════════════════════════════════════════════════════
        // BOOT - RAINBOW REFRACTION CORE
        // ═══════════════════════════════════════════════════════════════════
        boot: () => {
            console.log("%c [MX-1] BOOT SEQUENCE: Steven Michael Authenticated.", "color: #FFD700; font-weight: bold; font-size: 14px;");
            console.log(`%c OMEGA SEED: ${OMEGA_SEED}`, "color: #E5E4E2;");
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            console.log(`%c ENLIGHTEN_OS V${VERSION} - RAINBOW REFRACTION RESTORATION`, 'color: #D4AF37; font-weight: bold; font-size: 14px');
            console.log(`%c ARCHITECT: ${ARCHITECT} | TERMINAL: ${TERMINAL}`, 'color: #D4AF37;');
            console.log('%c ═══════════════════════════════════════════════════════════', 'color: #D4AF37');
            
            ENLIGHTEN_OS.injectRefractionStyles();
            ENLIGHTEN_OS.applyRainbowRefraction();
            ENLIGHTEN_OS.initMixingBoard();
            
            console.log("%c [OS] V27.0 Manifested. Rainbow Refraction Active.", "color: #D4AF37");
        },

        ignite: () => ENLIGHTEN_OS.boot(),

        // ═══════════════════════════════════════════════════════════════════
        // RAINBOW REFRACTION - Prismatic Crystal (NO OBSIDIAN)
        // ═══════════════════════════════════════════════════════════════════
        applyRainbowRefraction: () => {
            console.log("%c [MX-2] Applying Rainbow Refraction...", "color: #E5E4E2; font-weight: bold;");
            
            // TERMINATE all obsidian overlays and legacy elements
            const toRemove = document.querySelectorAll(`
                .mycelium-strand, .selenite-sensor, .gold-thread, .expansion-strand,
                #gold-bloom-container, .oracle-radial-overlay, .sovereign-shield-overlay,
                #herkimer-lattice, #obsidian-overlay, .static-grid-overlay,
                .gravity-physics-element, .obsidian-mask
            `);
            toRemove.forEach(el => el.remove());
            console.log(`%c [TERMINATE] Removed ${toRemove.length} obsidian/legacy elements`, "color: #ff6b6b;");

            // Remove existing refraction layer
            const existingLayer = document.getElementById('rainbow-refraction-layer');
            if (existingLayer) existingLayer.remove();

            // Create Deep Infinite Space + Rainbow Refraction
            refractionLayer = document.createElement('div');
            refractionLayer.id = 'rainbow-refraction-layer';
            refractionLayer.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: -1;
                pointer-events: none;
                background: radial-gradient(ellipse at center,
                    rgba(15, 10, 30, 1) 0%,
                    rgba(5, 5, 20, 1) 40%,
                    rgba(0, 0, 10, 1) 100%
                );
                overflow: hidden;
            `;
            
            // Prismatic Rainbow Rays (7 colors of refraction)
            const rainbowColors = [
                { color: 'rgba(255, 0, 0, 0.15)', angle: 0 },      // Red
                { color: 'rgba(255, 127, 0, 0.12)', angle: 51 },   // Orange
                { color: 'rgba(255, 255, 0, 0.10)', angle: 102 },  // Yellow
                { color: 'rgba(0, 255, 0, 0.12)', angle: 153 },    // Green
                { color: 'rgba(0, 127, 255, 0.15)', angle: 204 },  // Blue
                { color: 'rgba(75, 0, 130, 0.12)', angle: 255 },   // Indigo
                { color: 'rgba(148, 0, 211, 0.10)', angle: 306 },  // Violet
            ];

            rainbowColors.forEach((ray, i) => {
                const beam = document.createElement('div');
                beam.className = 'refraction-ray';
                beam.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 2px;
                    height: 300vh;
                    background: linear-gradient(to bottom,
                        transparent 0%,
                        ${ray.color} 30%,
                        ${ray.color.replace('0.1', '0.3')} 50%,
                        ${ray.color} 70%,
                        transparent 100%
                    );
                    transform: translate(-50%, -50%) rotate(${ray.angle}deg);
                    animation: refractionPulse 8s ease-in-out ${i * 0.5}s infinite;
                    filter: blur(1px);
                `;
                refractionLayer.appendChild(beam);
            });

            // Crystal Core Glow
            const crystalCore = document.createElement('div');
            crystalCore.className = 'crystal-core-glow';
            crystalCore.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                height: 300px;
                background: radial-gradient(circle,
                    rgba(255, 255, 255, 0.05) 0%,
                    rgba(212, 175, 55, 0.03) 30%,
                    transparent 70%
                );
                border-radius: 50%;
                animation: crystalBreathe 6s ease-in-out infinite;
            `;
            refractionLayer.appendChild(crystalCore);

            // Distant Stars
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.className = 'distant-star';
                star.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 2 + 1}px;
                    height: ${Math.random() * 2 + 1}px;
                    background: white;
                    border-radius: 50%;
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    opacity: ${Math.random() * 0.5 + 0.2};
                    animation: starTwinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
                `;
                refractionLayer.appendChild(star);
            }
            
            document.body.insertBefore(refractionLayer, document.body.firstChild);
            
            console.log("%c [MX-3] Rainbow Refraction deployed - Deep Infinite Space active", "color: #D4AF37;");
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
        // STEVEN'S MIXING BOARD V26.8
        // ═══════════════════════════════════════════════════════════════════
        initMixingBoard: () => {
            const existing = document.getElementById('sovereign-mixer');
            if (existing) existing.remove();
            
            mixerElement = document.createElement('div');
            mixerElement.id = 'sovereign-mixer';
            mixerElement.className = 'herkimer-mixer';
            mixerElement.setAttribute('data-testid', 'steven-mixer');
            
            mixerElement.innerHTML = `
                <div class="mixer-header-section">
                    <h2 class="mixer-title">STEVEN'S MIXER V${VERSION}</h2>
                    <div class="mixer-meta">${ARCHITECT} | ${TERMINAL}</div>
                    <div class="mixer-subtitle">RAINBOW REFRACTION</div>
                    <div class="mixer-seed">${OMEGA_SEED.substring(0, 12)}...</div>
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
                        <button class="master-btn refract-btn" onclick="window.ENLIGHTEN_OS.applyRainbowRefraction()">REFRACT</button>
                    </div>
                    <div class="master-controls-row2">
                        <button class="master-btn handshake-btn" onclick="window.ENLIGHTEN_OS.sendLiveAlert('RAINBOW', 'V27.0 Prismatic Transmission')">HANDSHAKE</button>
                    </div>
                    <div class="schumann-indicator">
                        <span class="crystal-icon">PRISM</span>
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
        // NOVA PULSE
        // ═══════════════════════════════════════════════════════════════════
        startNovaPulse: () => {
            if (novaPulseInterval) clearInterval(novaPulseInterval);
            let brightness = 1;
            let increasing = true;
            novaPulseInterval = setInterval(() => {
                brightness = increasing ? brightness + 0.003 : brightness - 0.003;
                if (brightness >= 1.08 || brightness <= 0.95) increasing = !increasing;
                if (refractionLayer) {
                    refractionLayer.style.filter = `brightness(${brightness})`;
                }
            }, 30);
            novaPulseActive = true;
        },

        stopNovaPulse: () => {
            if (novaPulseInterval) { clearInterval(novaPulseInterval); novaPulseInterval = null; }
            if (refractionLayer) refractionLayer.style.filter = 'none';
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
                        frequency: CONFIG.freq,
                        type: type,
                        content: payload,
                        seed: OMEGA_SEED,
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
        // CSS INJECTION - RAINBOW REFRACTION STYLES
        // ═══════════════════════════════════════════════════════════════════
        injectRefractionStyles: () => {
            const styleId = 'enlighten-os-v270-rainbow';
            if (document.getElementById(styleId)) return;
            
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                :root {
                    --phi: 1.61803398875;
                    --gold-rutilation: #D4AF37;
                    --platinum-clarity: #E5E4E2;
                    --deep-space: rgba(5, 5, 20, 0.98);
                }

                /* Rainbow Refraction Pulse */
                @keyframes refractionPulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }

                /* Crystal Core Breathe */
                @keyframes crystalBreathe {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
                }

                /* Star Twinkle */
                @keyframes starTwinkle {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.8; }
                }

                /* Sovereign Bloom */
                @keyframes sovereignBloom {
                    0% { filter: brightness(1) saturate(1); }
                    50% { filter: brightness(1.4) saturate(1.6); }
                    100% { filter: brightness(1) saturate(1); }
                }
                body.sovereign-bloom { animation: sovereignBloom 1s ease-out; }

                /* Rainbow Refraction Layer */
                #rainbow-refraction-layer {
                    background: radial-gradient(ellipse at center,
                        rgba(15, 10, 30, 1) 0%,
                        rgba(5, 5, 20, 1) 40%,
                        rgba(0, 0, 10, 1) 100%
                    ) !important;
                }

                .refraction-ray {
                    mix-blend-mode: screen;
                }

                /* Mixer Panel */
                .herkimer-mixer {
                    position: fixed !important;
                    right: 0 !important;
                    top: 15vh;
                    bottom: 22vh;
                    width: calc(100vw / var(--phi) / var(--phi));
                    min-width: 280px;
                    max-width: 380px;
                    background: var(--deep-space) !important;
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
                .mixer-subtitle { font-size: 0.5rem; color: var(--platinum-clarity); letter-spacing: 0.3em; margin-top: 4px; }
                .mixer-seed { font-size: 0.4rem; font-family: monospace; color: rgba(212,175,55,0.4); margin-top: 2px; }
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
                .master-controls, .master-controls-row2 { display: flex; gap: 6px; margin-bottom: 8px; }
                .master-btn { flex: 1; padding: 8px 12px; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); border-radius: 6px; color: var(--gold-rutilation); font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s ease; }
                .master-btn:hover { background: rgba(212,175,55,0.25); box-shadow: 0 0 15px rgba(212,175,55,0.4); }
                .master-btn.nova-btn { background: rgba(34,211,238,0.15); border-color: rgba(34,211,238,0.4); color: #22d3ee; }
                .master-btn.bloom-btn { background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.4); color: #a855f7; }
                .master-btn.refract-btn { background: linear-gradient(135deg, rgba(255,0,0,0.1), rgba(255,127,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,127,255,0.1), rgba(75,0,130,0.1), rgba(148,0,211,0.1)); border-color: rgba(255,255,255,0.3); color: #fff; }
                .master-btn.handshake-btn { background: rgba(0,255,255,0.15); border-color: rgba(0,255,255,0.4); color: #00ffff; }
                .schumann-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.65rem; color: var(--gold-rutilation); opacity: 0.8; }
                .crystal-icon { font-weight: bold; background: linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 0.6rem; }
                .version-tag { margin-left: 8px; padding: 2px 6px; background: rgba(229,228,226,0.2); border-radius: 4px; font-size: 0.5rem; color: var(--platinum-clarity); }
                .mixer-close-btn { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: transparent; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; color: var(--gold-rutilation); font-size: 16px; cursor: pointer; }
                .mixer-close-btn:hover { background: rgba(255,0,0,0.2); color: #ff6b6b; }
            `;
            
            document.head.appendChild(style);
            console.log(`%c [STYLES] V${VERSION} Rainbow Refraction Styles injected`, 'color: #E5E4E2');
        },

        // ═══════════════════════════════════════════════════════════════════
        // CLEANUP
        // ═══════════════════════════════════════════════════════════════════
        destroy: () => {
            ENLIGHTEN_OS.stopNovaPulse();
            if (mixerElement) { mixerElement.remove(); mixerElement = null; }
            if (refractionLayer) { refractionLayer.remove(); refractionLayer = null; }
        },

        // Public API
        PHI, SCHUMANN, ARCHITECT, TERMINAL, VERSION, TIERS, OMEGA_SEED, CONFIG
    };
})();

if (typeof window !== 'undefined') {
    window.ENLIGHTEN_OS = ENLIGHTEN_OS;
}

export default ENLIGHTEN_OS;
