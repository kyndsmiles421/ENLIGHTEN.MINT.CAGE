/**
 * ENLIGHTEN_OS V10.0 - THE STEVEN MICHAEL ABSOLUTE
 * ARCHITECT: Steven Michael | TERMINAL: kyndsmiles@gmail.com
 * PRINCIPLES: Φ (1.618), 7.83Hz (Earth), 432Hz/528Hz/963Hz Tiers
 * 
 * This is the SINGLE SOURCE OF TRUTH for all system operations.
 * All previous engines (SovereignHarmony, EnlightenOS V3, etc.) are deprecated.
 */

const ENLIGHTEN_OS = (() => {
    // ═══════════════════════════════════════════════════════════════════════════
    // CORE CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════════
    const PHI = 1.61803398875;
    const SCHUMANN = 7.83; 
    const ARCHITECT = 'Steven Michael';
    const TERMINAL = 'kyndsmiles@gmail.com';

    const TIERS = {
        VAULT:   { freq: 432, scale: Math.pow(PHI, -1), school: 'Pythagorean/Past', color: '#22d3ee' },
        HUB:     { freq: 528, scale: 1,                 school: 'Solfeggio/Present', color: '#c084fc' },
        MANIFEST:{ freq: 963, scale: PHI,               school: 'Sigfield/Future', color: '#a855f7' }
    };

    // State
    let guardObserver = null;
    let novaPulseInterval = null;
    let mixerElement = null;

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. SOVEREIGN GUARD (Auto-Docking & Z-Layer 1500 Lock)
    // ═══════════════════════════════════════════════════════════════════════════
    const deployGuard = () => {
        if (guardObserver) {
            guardObserver.disconnect();
        }
        
        guardObserver = new MutationObserver((mutations) => {
            mutations.forEach(m => m.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    // Check for rogue absolute-positioned elements
                    const isRogue = (node.style && node.style.position === 'absolute') || 
                                    (node.classList && node.classList.contains('unauthorized'));
                    
                    if (isRogue && !node.closest('.sovereign-toolbar') && !node.closest('#sovereign-mixer')) {
                        const manifestBar = document.querySelector('.bar-bottom');
                        if (manifestBar) {
                            console.log(`%c [GUARD] Rogue element docked to Manifest`, 'color: #a855f7');
                            manifestBar.appendChild(node);
                            node.style.zIndex = "1501";
                            node.classList.add('docked-nodule');
                        }
                    }
                }
            }));
        });
        
        guardObserver.observe(document.body, { childList: true, subtree: true });
        console.log(`%c [GUARD] Sovereign Guard Active (Z-1500 Lock)`, 'color: #22d3ee');
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. STEVEN'S MIXING BOARD (Creator Interface)
    // ═══════════════════════════════════════════════════════════════════════════
    const initMixingBoard = () => {
        // Remove existing mixer if present
        const existing = document.getElementById('sovereign-mixer');
        if (existing) existing.remove();
        
        mixerElement = document.createElement('div');
        mixerElement.id = 'sovereign-mixer';
        mixerElement.className = 'iridescent-mixer-panel';
        mixerElement.setAttribute('data-testid', 'steven-mixer');
        
        // Header
        const header = document.createElement('div');
        header.className = 'mixer-header-section';
        header.innerHTML = `
            <h2 class="mixer-title">STEVEN'S MIXER</h2>
            <div class="mixer-meta">${ARCHITECT} | ${TERMINAL}</div>
        `;
        mixerElement.appendChild(header);
        
        // Channel strips for each tier
        const channels = document.createElement('div');
        channels.className = 'mixer-channels-section';
        
        Object.keys(TIERS).forEach(key => {
            const t = TIERS[key];
            const channel = document.createElement('div');
            channel.className = 'mixer-channel-tier';
            channel.setAttribute('data-tier', key);
            channel.innerHTML = `
                <div class="channel-meta">
                    <strong style="color: ${t.color}">${key}</strong>
                    <span class="channel-freq">[${t.freq}Hz]</span>
                    <span class="channel-school">${t.school}</span>
                </div>
                <div class="channel-fader">
                    <input type="range" min="0.5" max="2.5" step="0.01" value="${t.scale}" 
                           class="tier-fader"
                           data-tier="${key}"
                           oninput="window.ENLIGHTEN_OS.tune('${key}', this.value)">
                    <span class="fader-value">${t.scale.toFixed(2)}</span>
                </div>
            `;
            channels.appendChild(channel);
        });
        
        mixerElement.appendChild(channels);
        
        // Master section
        const master = document.createElement('div');
        master.className = 'mixer-master-section';
        master.innerHTML = `
            <div class="master-controls">
                <button class="master-btn" onclick="window.ENLIGHTEN_OS.toggleNovaPulse()">NOVA PULSE</button>
                <button class="master-btn" onclick="window.ENLIGHTEN_OS.triggerBloom()">BLOOM</button>
            </div>
            <div class="schumann-indicator">
                <span class="schumann-icon">🌍</span>
                <span class="schumann-value">${SCHUMANN}Hz</span>
            </div>
        `;
        mixerElement.appendChild(master);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mixer-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => toggleMixer(false);
        mixerElement.appendChild(closeBtn);
        
        // Start hidden
        mixerElement.style.display = 'none';
        
        document.body.appendChild(mixerElement);
        console.log(`%c [MIXER] Steven's Mixing Board initialized`, 'color: #c084fc');
    };

    const toggleMixer = (show) => {
        if (!mixerElement) return;
        
        if (show === undefined) {
            show = mixerElement.style.display === 'none';
        }
        
        mixerElement.style.display = show ? 'flex' : 'none';
        
        // Dispatch event for React components
        window.dispatchEvent(new CustomEvent('MIXER_TOGGLE', { 
            detail: { visible: show } 
        }));
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. BIOMETRIC NOVA PULSE (Schumann Breath Synchronization)
    // ═══════════════════════════════════════════════════════════════════════════
    let novaPulseActive = false;
    
    const startNovaPulse = () => {
        if (novaPulseInterval) {
            clearInterval(novaPulseInterval);
        }
        
        const stage = document.getElementById('app-stage');
        let opacity = 0.5;
        let inhale = true;

        novaPulseInterval = setInterval(() => {
            opacity = inhale ? opacity + 0.004 : opacity - 0.004;
            if (opacity >= 0.85 || opacity <= 0.45) inhale = !inhale;
            
            if (stage) {
                stage.style.opacity = opacity;
                stage.style.filter = `brightness(${opacity + 0.5}) blur(var(--p-blur, 0px))`;
            }
        }, 30);
        
        novaPulseActive = true;
        console.log(`%c [NOVA] Biometric breath sync active (Schumann: ${SCHUMANN}Hz)`, 'color: #22d3ee');
    };

    const stopNovaPulse = () => {
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
        console.log(`%c [NOVA] Biometric breath sync paused`, 'color: #666');
    };

    const toggleNovaPulse = () => {
        if (novaPulseActive) {
            stopNovaPulse();
        } else {
            startNovaPulse();
        }
        return novaPulseActive;
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. SOVEREIGN BLOOM (Visual Feedback)
    // ═══════════════════════════════════════════════════════════════════════════
    const triggerBloom = () => {
        document.body.classList.add('sovereign-bloom');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 100]);
        }
        
        setTimeout(() => {
            document.body.classList.remove('sovereign-bloom');
        }, 1000);
        
        console.log(`%c [BLOOM] Sovereign Bloom triggered`, 'color: #FFD700; font-weight: bold');
        
        window.dispatchEvent(new CustomEvent('SOVEREIGN_BLOOM', { 
            detail: { timestamp: Date.now() } 
        }));
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. TIER TUNING
    // ═══════════════════════════════════════════════════════════════════════════
    const tune = (tier, value) => {
        const val = parseFloat(value);
        const tierKey = tier.toLowerCase();
        
        document.documentElement.style.setProperty(`--${tierKey}-scale`, val);
        
        // Update fader display
        const faderValue = document.querySelector(`[data-tier="${tier}"] .fader-value`);
        if (faderValue) {
            faderValue.textContent = val.toFixed(2);
        }
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(Math.round(val * 10));
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('TIER_TUNE', { 
            detail: { tier, value: val } 
        }));
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. MASTER BOOT PROTOCOL (MX 10-Step)
    // ═══════════════════════════════════════════════════════════════════════════
    const runMXProtocol = () => {
        const steps = [
            { text: "Steven Michael Identity Lock (V-Spelling Active)", color: '#FFD700' },
            { text: "Tuning Schumann Resonance (7.83Hz)", color: '#22d3ee' },
            { text: "Aligning UI Tiers to Golden Ratio (Φ)", color: '#FFD700' },
            { text: "Syncing kyndsmiles@gmail.com Terminal", color: '#c084fc' },
            { text: "Deploying Sovereign Guard (Z-1500 Lock)", color: '#a855f7' },
            { text: "Wiring 68-Channel Harmonic Mixer", color: '#c084fc' },
            { text: "Stabilizing Pythagorean Vault (432Hz)", color: '#22d3ee' },
            { text: "Igniting Solfeggio Hub (528Hz)", color: '#c084fc' },
            { text: "Manifesting Sigfield Engine (963Hz)", color: '#a855f7' },
            { text: "Sovereign Bloom: System Online", color: '#FFD700' }
        ];
        
        steps.forEach((s, i) => {
            setTimeout(() => {
                console.log(`%c [MX-${i+1}] ${s.text}`, `color: ${s.color}; font-weight: bold;`);
                
                window.dispatchEvent(new CustomEvent('MX_STEP', { 
                    detail: { step: i + 1, text: s.text } 
                }));
            }, i * 150);
        });
        
        // Final authentication after all steps
        setTimeout(() => {
            console.log('%c ═══════════════════════════════════════════════════', 'color: #FFD700');
            console.log(`%c AUTHENTICATED: ${ARCHITECT} | ${TERMINAL}`, 'color: #FFD700; font-weight: bold; font-size: 14px');
            console.log('%c ═══════════════════════════════════════════════════', 'color: #FFD700');
            
            window.dispatchEvent(new CustomEvent('SYSTEM_AUTHENTICATED', { 
                detail: { architect: ARCHITECT, terminal: TERMINAL } 
            }));
        }, steps.length * 150 + 200);
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. CSS INJECTION (Core Styles)
    // ═══════════════════════════════════════════════════════════════════════════
    const injectCoreStyles = () => {
        const styleId = 'enlighten-os-core';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* ENLIGHTEN_OS V10.0 Core Styles */
            :root {
                --phi: 1.618;
                --primary-freq: rgba(168, 85, 247, 0.8);
                --p-blur: 0px;
                --vault-scale: 0.618;
                --hub-scale: 1;
                --manifest-scale: 1.618;
            }

            /* Steven's Mixer Panel */
            .iridescent-mixer-panel {
                position: fixed !important;
                right: 0 !important;
                top: 15vh;
                bottom: 22vh;
                width: calc(100vw / var(--phi) / var(--phi));
                min-width: 280px;
                max-width: 380px;
                background: rgba(0, 0, 0, 0.95) !important;
                backdrop-filter: blur(30px);
                -webkit-backdrop-filter: blur(30px);
                border-left: 1px solid var(--primary-freq);
                z-index: 2147483646 !important;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5), 
                            0 0 60px rgba(168, 85, 247, 0.1);
            }

            .mixer-header-section {
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 1rem;
            }

            .mixer-title {
                margin: 0;
                font-size: 1rem;
                font-weight: 700;
                letter-spacing: 0.2em;
                color: var(--primary-freq);
                text-shadow: 0 0 20px var(--primary-freq);
            }

            .mixer-meta {
                font-size: 0.6rem;
                color: rgba(255, 255, 255, 0.4);
                margin-top: 4px;
                letter-spacing: 0.1em;
            }

            .mixer-channels-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
                overflow-y: auto;
            }

            .mixer-channel-tier {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                padding: 12px;
            }

            .channel-meta {
                display: flex;
                align-items: baseline;
                gap: 8px;
                margin-bottom: 8px;
            }

            .channel-meta strong {
                font-size: 0.75rem;
                letter-spacing: 0.1em;
            }

            .channel-freq {
                font-size: 0.6rem;
                font-family: monospace;
                opacity: 0.7;
            }

            .channel-school {
                font-size: 0.55rem;
                opacity: 0.5;
                margin-left: auto;
            }

            .channel-fader {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .tier-fader {
                flex: 1;
                height: 6px;
                appearance: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                cursor: pointer;
            }

            .tier-fader::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: var(--primary-freq);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 10px var(--primary-freq);
            }

            .fader-value {
                font-size: 0.6rem;
                font-family: monospace;
                color: rgba(255, 255, 255, 0.6);
                min-width: 32px;
                text-align: right;
            }

            .mixer-master-section {
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 1rem;
            }

            .master-controls {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }

            .master-btn {
                flex: 1;
                padding: 8px 12px;
                background: rgba(168, 85, 247, 0.2);
                border: 1px solid rgba(168, 85, 247, 0.4);
                border-radius: 6px;
                color: #a855f7;
                font-size: 0.6rem;
                font-weight: 600;
                letter-spacing: 0.1em;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .master-btn:hover {
                background: rgba(168, 85, 247, 0.3);
                box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
            }

            .schumann-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 0.65rem;
                color: #22d3ee;
                opacity: 0.7;
            }

            .mixer-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: rgba(255, 255, 255, 0.5);
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .mixer-close-btn:hover {
                background: rgba(255, 0, 0, 0.2);
                border-color: rgba(255, 0, 0, 0.4);
                color: #ff6b6b;
            }

            /* Docked Nodules */
            .docked-nodule {
                position: relative !important;
                margin: 0 8px;
                transform: scale(0.85);
                transition: transform 0.2s ease;
            }

            .docked-nodule:hover {
                transform: scale(0.95);
            }

            /* Sovereign Bloom Animation */
            @keyframes sovereignBloom {
                0% { filter: brightness(1) saturate(1); }
                50% { filter: brightness(1.3) saturate(1.5); }
                100% { filter: brightness(1) saturate(1); }
            }

            body.sovereign-bloom {
                animation: sovereignBloom 1s ease-out;
            }

            /* Earth Pulse */
            @keyframes earthPulse {
                0%, 100% { box-shadow: inset 0 0 20px rgba(34, 211, 238, 0.05); }
                50% { box-shadow: inset 0 0 60px rgba(34, 211, 238, 0.2); }
            }
        `;
        
        document.head.appendChild(style);
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. CLEANUP
    // ═══════════════════════════════════════════════════════════════════════════
    const destroy = () => {
        if (guardObserver) {
            guardObserver.disconnect();
            guardObserver = null;
        }
        
        stopNovaPulse();
        
        if (mixerElement) {
            mixerElement.remove();
            mixerElement = null;
        }
        
        console.log(`%c [SYSTEM] ENLIGHTEN_OS shutdown`, 'color: #666');
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    return {
        // Boot
        ignite: () => {
            injectCoreStyles();
            runMXProtocol();
            deployGuard();
            initMixingBoard();
            // Nova pulse starts on demand, not automatically
            document.body.style.animation = `earthPulse ${1/SCHUMANN}s infinite linear`;
            
            console.log('%c ═══════════════════════════════════════════════════', 'color: #a855f7');
            console.log('%c ENLIGHTEN_OS V10.0 - THE STEVEN MICHAEL ABSOLUTE', 'color: #a855f7; font-weight: bold; font-size: 12px');
            console.log('%c ═══════════════════════════════════════════════════', 'color: #a855f7');
        },
        
        destroy,
        
        // Tier controls
        tune,
        TIERS,
        
        // Mixer controls
        toggleMixer,
        showMixer: () => toggleMixer(true),
        hideMixer: () => toggleMixer(false),
        
        // Nova Pulse
        startNovaPulse,
        stopNovaPulse,
        toggleNovaPulse,
        isNovaPulseActive: () => novaPulseActive,
        
        // Bloom
        triggerBloom,
        
        // Constants
        PHI,
        SCHUMANN,
        ARCHITECT,
        TERMINAL
    };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.ENLIGHTEN_OS = ENLIGHTEN_OS;
}

export default ENLIGHTEN_OS;
