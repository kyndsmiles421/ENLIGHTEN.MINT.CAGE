/**
 * ENLIGHTEN.MINT.CAFE - Sovereign Master Controller (V2.0)
 * Integrates: Temporal Staircase, Frequency Engine, & MX 10-Step Logic
 */

const ENLIGHTEN_SYSTEM = (() => {
    // 1. THE FREQUENCY ENGINE (Mood & Perspective Toggles)
    const PERSPECTIVES = {
        'INTENSE': { primary: '#FF0000', secondary: '#2D0000', glow: 'rgba(255, 0, 0, 0.7)', blur: '2px' },
        'CALM':    { primary: '#22d3ee', secondary: '#083344', glow: 'rgba(34, 211, 238, 0.4)', blur: '12px' },
        'ZENITH':  { primary: '#FFD700', secondary: '#4B2C20', glow: 'rgba(255, 215, 0, 0.5)', blur: '8px' },
        'VOID':    { primary: '#FFFFFF', secondary: '#1A1A1A', glow: 'rgba(255, 255, 255, 0.2)', blur: '5px' }
    };

    // 2. THE MX 10-STEP INTEGRATION (Automated Deployment)
    const runMXProtocol = () => {
        const steps = [
            "Initialize Sovereign Grid", "Lock Temporal Docks", "Calibrate Iridescent Toggles",
            "Clear No-Fly Zones", "Bind Nodule Relations", "Sync Biometric Handshake",
            "Activate Russian Doll Staircase", "Deploy Mutation Guard", "Flush Legacy UI", "Confirm System Bloom"
        ];
        steps.forEach((step, i) => console.log(`MX Protocol [Step ${i+1}/10]: ${step}... [OK]`));
    };

    // 3. THE PERSPECTIVE SHIFTER
    const shiftPerspective = (mode) => {
        const config = PERSPECTIVES[mode];
        if (!config) {
            console.warn(`ENLIGHTEN_SYSTEM: Unknown perspective "${mode}". Defaulting to VOID.`);
            return shiftPerspective('VOID');
        }
        
        const root = document.documentElement;

        root.style.setProperty('--primary-freq', config.primary);
        root.style.setProperty('--secondary-freq', config.secondary);
        root.style.setProperty('--global-glow', config.glow);
        root.style.setProperty('--perspective-blur', config.blur);

        // Update global body state for CSS-based refactoring
        document.body.setAttribute('data-perspective', mode);
        console.log(`Sovereign Perspective shifted to: ${mode}`);
        
        // Dispatch event for React components to listen
        window.dispatchEvent(new CustomEvent('PERSPECTIVE_SHIFT', { 
            detail: { mode, config } 
        }));
    };

    // 4. THE SOVEREIGN GUARD (MutationObserver)
    let guardObserver = null;
    
    const initGuard = () => {
        if (guardObserver) {
            guardObserver.disconnect();
        }
        
        guardObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches && node.matches('.floating-action-btn, .unauthorized-box, .unauthorized-utility')) {
                        console.log("Sovereign Guard: Unauthorized Box detected. Re-routing to Manifest Dock.");
                        const dock = document.getElementById('bottom-dock-future');
                        if (dock) {
                            dock.appendChild(node);
                            node.className = 'docked-nodule';
                        }
                    }
                });
            });
        });
        guardObserver.observe(document.body, { childList: true, subtree: true });
    };

    // 5. BINDING THE DUAL TOOLBARS (Past/Future) - Russian Doll Staircase
    const bindStaircase = () => {
        document.querySelectorAll('.umbrella-trigger').forEach(trigger => {
            trigger.onclick = () => {
                const target = trigger.getAttribute('data-target');
                const stage = document.getElementById('app-stage');
                if (stage) {
                    stage.setAttribute('data-active-bloom', target);
                }
                // Trigger the "Russian Doll" animation
                trigger.classList.toggle('bloomed');
                
                // Dispatch bloom event for React integration
                window.dispatchEvent(new CustomEvent('STAIRCASE_BLOOM', { 
                    detail: { target, bloomed: trigger.classList.contains('bloomed') } 
                }));
            };
        });
    };

    // 6. TEMPORAL GLOW APPLICATION
    const applyTemporalGlow = () => {
        const TEMPORAL_MAP = {
            past: { color: '#22d3ee', anchor: 'top' },     // Cyan
            future: { color: '#a855f7', anchor: 'bottom' } // Purple
        };

        Object.entries(TEMPORAL_MAP).forEach(([key, config]) => {
            const bar = document.querySelector(`.bar-${config.anchor}`);
            if (bar) {
                bar.style.boxShadow = `0 0 25px 3px ${config.color}`;
                bar.style.borderBottom = config.anchor === 'top' ? `2px solid ${config.color}` : 'none';
                bar.style.borderTop = config.anchor === 'bottom' ? `2px solid ${config.color}` : 'none';
            }
        });
    };

    // 7. CLEANUP
    const destroy = () => {
        if (guardObserver) {
            guardObserver.disconnect();
            guardObserver = null;
        }
        console.log("ENLIGHTEN_SYSTEM: Sovereign Guard disconnected.");
    };

    return {
        ignite: () => {
            runMXProtocol();
            initGuard();
            bindStaircase();
            applyTemporalGlow();
            // Default to Saved User Preference or VOID
            const savedPref = localStorage.getItem('cafe_perspective') || 'VOID';
            shiftPerspective(savedPref);
            console.log("ENLIGHTEN_SYSTEM V2.0: Ignition complete. Temporal Architecture active.");
        },
        toggle: (mode) => {
            localStorage.setItem('cafe_perspective', mode);
            shiftPerspective(mode);
        },
        destroy,
        // Expose for external access
        PERSPECTIVES,
        getCurrentPerspective: () => localStorage.getItem('cafe_perspective') || 'VOID'
    };
})();

// Auto-execution on DOMContentLoaded (for vanilla JS usage)
if (typeof window !== 'undefined') {
    // Expose globally for console access
    window.ENLIGHTEN_SYSTEM = ENLIGHTEN_SYSTEM;
}

export default ENLIGHTEN_SYSTEM;
