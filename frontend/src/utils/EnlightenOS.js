/**
 * ENLIGHTEN.MINT.CAFE - Grand Unified Sovereign Engine (V3.0)
 * INTEGRATION: Architecture + Perspective + Creator Mixing Board + Guard
 * This is the master controller that unifies all subsystems
 */

const ENLIGHTEN_OS = (() => {
    // 1. FREQUENCY DNA - The Master Perspective Map
    const PERSPECTIVES = {
        'INTENSE': { primary: '#FF0000', secondary: '#2D0000', glow: 'rgba(255, 0, 0, 0.7)', blur: '2px', haptic: 80 },
        'CALM':    { primary: '#22d3ee', secondary: '#083344', glow: 'rgba(34, 211, 238, 0.4)', blur: '12px', haptic: 20 },
        'ZENITH':  { primary: '#FFD700', secondary: '#4B2C20', glow: 'rgba(255, 215, 0, 0.5)', blur: '8px', haptic: 40 },
        'VOID':    { primary: '#FFFFFF', secondary: '#1A1A1A', glow: 'rgba(255, 255, 255, 0.1)', blur: '4px', haptic: 0 }
    };

    // Channel Registry for the Mixing Board
    const channelRegistry = new Map();
    let guardObserver = null;
    let routeObserver = null;

    // 2. THE MX 10-STEP BOOT SEQUENCE
    const runMXProtocol = () => {
        const steps = [
            "Initializing Sovereign Grid", "Locking Temporal Docks", "Calibrating Iridescent Toggles",
            "Clearing No-Fly Zones", "Binding Nodule Relations", "Syncing Biometric Handshake",
            "Activating Russian Doll Staircase", "Deploying Mutation Guard", "Flushing Legacy UI", "Confirming System Bloom"
        ];
        steps.forEach((step, i) => console.log(`%c MX Protocol [${i+1}/10]: ${step}`, `color: #a855f7`));
    };

    // 3. THE CREATOR MIXING BOARD (Live Wire Connection)
    const wireToMixer = (node) => {
        if (!node || node.nodeType !== 1) return;
        
        const id = node.id || `nodule-${Math.random().toString(36).substr(2, 9)}`;
        
        if (!channelRegistry.has(id)) {
            const channelStrip = { 
                element: node, 
                type: node.closest('.bar-top') ? 'PAST' : (node.closest('.bar-bottom') ? 'FUTURE' : 'PRESENT'),
                gain: 1.0,
                frequency: 1.0,
                pan: 0,
                muted: false,
                timestamp: Date.now()
            };
            
            channelRegistry.set(id, channelStrip);
            
            // Attach real-time listeners for Creator Mode faders
            node.addEventListener('updateMix', (e) => {
                const { gain, freq } = e.detail || {};
                if (gain !== undefined) {
                    node.style.filter = `brightness(${gain}) drop-shadow(0 0 ${gain * 15}px var(--primary-freq))`;
                    channelStrip.gain = gain;
                }
                if (freq !== undefined) {
                    node.style.animationDuration = `${4 / freq}s`;
                    channelStrip.frequency = freq;
                }
                channelStrip.timestamp = Date.now();
            });
            
            // Dispatch event for React components
            window.dispatchEvent(new CustomEvent('MIXER_CHANNEL_ADDED', { 
                detail: { noduleId: id, channelStrip } 
            }));
        }
    };

    const detachFromMixer = (noduleId) => {
        if (channelRegistry.has(noduleId)) {
            channelRegistry.delete(noduleId);
            window.dispatchEvent(new CustomEvent('MIXER_CHANNEL_REMOVED', { 
                detail: { noduleId } 
            }));
        }
    };

    // 4. THE SOVEREIGN GUARD (MutationObserver)
    const initSovereignGuard = () => {
        if (guardObserver) {
            guardObserver.disconnect();
        }
        
        guardObserver = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                // Handle added nodes
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // AUTO-DOCKING: Any rogue box is pulled into the Future/Manifest dock
                        const isRogue = node.matches && (
                            node.matches('.unauthorized-box, .floating-action-btn, .unauthorized-utility') || 
                            (node.style && node.style.position === 'absolute')
                        );
                        
                        if (isRogue && !node.closest('#app-stage') && !node.closest('.sovereign-toolbar')) {
                            const dock = document.getElementById('bottom-dock-future');
                            if (dock) {
                                dock.appendChild(node);
                                node.className = 'docked-nodule';
                                console.log(`%c Sovereign Guard: Rogue UI intercepted and docked.`, 'color: #a855f7');
                            }
                        }
                        
                        // Wire all elements to the mixer
                        wireToMixer(node);
                    }
                });
                
                // Handle removed nodes
                m.removedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.id) {
                        detachFromMixer(node.id);
                    }
                });
            });
        });
        
        guardObserver.observe(document.body, { childList: true, subtree: true });
        console.log('%c Sovereign Guard: Active. No-Fly Zone Protected.', 'color: #22d3ee');
    };

    // 5. SYSTEM-WIDE PERSPECTIVE SHIFTER
    const applyPerspective = (mode) => {
        const cfg = PERSPECTIVES[mode];
        if (!cfg) {
            console.warn(`ENLIGHTEN_OS: Unknown perspective "${mode}". Defaulting to VOID.`);
            return applyPerspective('VOID');
        }
        
        const root = document.documentElement;

        root.style.setProperty('--primary-freq', cfg.primary);
        root.style.setProperty('--secondary-freq', cfg.secondary);
        root.style.setProperty('--global-glow', cfg.glow);
        root.style.setProperty('--perspective-blur', cfg.blur);
        
        // Haptic Feedback Integration (Creator Connection)
        if (navigator.vibrate && cfg.haptic > 0) {
            navigator.vibrate(cfg.haptic);
        }

        document.body.setAttribute('data-perspective', mode);
        localStorage.setItem('cafe_perspective', mode);
        
        console.log(`%c System Shift: ${mode} Frequency Active`, `color: ${cfg.primary}; font-weight: bold`);
        
        // Dispatch event for React components
        window.dispatchEvent(new CustomEvent('PERSPECTIVE_SHIFT', { 
            detail: { mode, config: cfg } 
        }));
        
        return cfg;
    };

    // 6. ROUTE-SPECIFIC BLOOM (The Oracle/Meditation Split)
    const ROUTE_CONFIGS = {
        '/oracle': {
            topBarItems: ['past-readings', 'crystal-collection', 'zodiac-log'],
            bottomBarItems: ['oracle-quick-draw', 'gem-inventory', 'cosmic-forecast'],
            perspective: 'ZENITH'
        },
        '/meditation': {
            topBarItems: ['session-history', 'favorite-sounds', 'breath-patterns'],
            bottomBarItems: ['quick-breathwork', 'soundscape-mixer', 'timer-presets'],
            perspective: 'CALM'
        },
        '/hub': {
            topBarItems: ['archives', 'journal', 'ledger'],
            bottomBarItems: ['hub', 'oracle', 'discover'],
            perspective: null // Use saved preference
        }
    };

    const updateStaircaseContent = (route) => {
        const config = Object.entries(ROUTE_CONFIGS).find(([path]) => route.includes(path));
        
        if (config) {
            const [, routeConfig] = config;
            
            // Apply route-specific perspective if defined
            if (routeConfig.perspective) {
                applyPerspective(routeConfig.perspective);
            }
            
            // Dispatch route change event for React components to handle bar updates
            window.dispatchEvent(new CustomEvent('ROUTE_BLOOM', { 
                detail: { route, config: routeConfig } 
            }));
        }
        
        return config;
    };

    // 7. GLOBAL FREQUENCY CONTROL (Russian Doll Override)
    const setGlobalFrequency = (type, intensity) => {
        const root = document.documentElement;
        const clampedIntensity = Math.max(0, Math.min(2, intensity));
        
        if (type === 'PAST') {
            root.style.setProperty('--archive-cyan-intensity', clampedIntensity);
            root.style.setProperty('--archive-glow', `rgba(34, 211, 238, ${0.4 * clampedIntensity})`);
        }
        if (type === 'PRESENT') {
            root.style.setProperty('--hub-pulse-intensity', clampedIntensity);
            root.style.setProperty('--iridescent-glow', `rgba(192, 132, 252, ${0.5 * clampedIntensity})`);
        }
        if (type === 'FUTURE') {
            root.style.setProperty('--manifest-purple-intensity', clampedIntensity);
            root.style.setProperty('--manifest-glow', `rgba(168, 85, 247, ${0.4 * clampedIntensity})`);
        }
        
        // Update all channels of this type
        channelRegistry.forEach((channel, id) => {
            if (channel.type === type && channel.element) {
                channel.gain = clampedIntensity;
                channel.element.dispatchEvent(new CustomEvent('updateMix', { 
                    detail: { gain: clampedIntensity } 
                }));
            }
        });
        
        window.dispatchEvent(new CustomEvent('MIXER_GLOBAL_UPDATE', { 
            detail: { type, intensity: clampedIntensity } 
        }));
    };

    // 8. SIGNAL HEALTH MONITOR
    const getSignalHealth = () => {
        const health = {
            totalChannels: channelRegistry.size,
            byType: { PAST: 0, PRESENT: 0, FUTURE: 0 },
            staleChannels: [],
            currentPerspective: localStorage.getItem('cafe_perspective') || 'VOID'
        };
        
        const now = Date.now();
        channelRegistry.forEach((channel, id) => {
            health.byType[channel.type]++;
            if (now - channel.timestamp > 30000) {
                health.staleChannels.push(id);
            }
        });
        
        return health;
    };

    // 9. CLEANUP
    const destroy = () => {
        if (guardObserver) {
            guardObserver.disconnect();
            guardObserver = null;
        }
        if (routeObserver) {
            routeObserver.disconnect();
            routeObserver = null;
        }
        channelRegistry.clear();
        console.log('%c ENLIGHTEN_OS: Shutdown complete.', 'color: #666');
    };

    // PUBLIC API
    return {
        ignite: () => {
            runMXProtocol();
            initSovereignGuard();
            
            // Load saved perspective or default to VOID
            const saved = localStorage.getItem('cafe_perspective') || 'VOID';
            applyPerspective(saved);
            
            // Apply route-specific content
            updateStaircaseContent(window.location.pathname);
            
            console.log('%c ENLIGHTEN_OS V3.0: Grand Unified Engine Online', 'color: #a855f7; font-weight: bold; font-size: 14px');
        },
        
        destroy,
        
        // Perspective controls
        togglePerspective: applyPerspective,
        getPerspective: () => localStorage.getItem('cafe_perspective') || 'VOID',
        PERSPECTIVES,
        
        // Mixer controls
        getRegistry: () => channelRegistry,
        getChannel: (id) => channelRegistry.get(id),
        wireToMixer,
        detachFromMixer,
        setGlobalFrequency,
        
        // Health & diagnostics
        getSignalHealth,
        
        // Route management
        updateStaircaseContent,
        ROUTE_CONFIGS
    };
})();

// Expose globally for console access and React integration
if (typeof window !== 'undefined') {
    window.ENLIGHTEN_OS = ENLIGHTEN_OS;
}

export default ENLIGHTEN_OS;
