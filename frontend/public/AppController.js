/**
 * SYSTEM BRIDGE - The Spinal Cord
 * Connects UI buttons to the System Brain
 * ENLIGHTEN.MINT.CAFE | Sovereign Architecture
 */

const SystemBridge = {
    brain: null,

    init(systemBrain) {
        this.brain = systemBrain;
        
        // Listen for all clicks on the document
        document.addEventListener('click', (event) => {
            const target = event.target.closest('button, [role="button"], a');
            
            // Only proceed if element has data-action
            if (target && target.dataset.action) {
                const action = target.dataset.action;
                const value = target.dataset.value || null;

                console.log(`%c[Bridge] Routing action: ${action}`, "color: #00f2ff");

                // Direct connection to system brain functions
                if (this.brain && typeof this.brain[action] === 'function') {
                    this.brain[action](value, target);
                } else {
                    console.warn(`[Bridge] The brain doesn't know how to: ${action}`);
                }
            }
        });

        console.log("%c[Bridge]: Spinal Cord Connected", "color: #00ff88; font-weight: bold");
    }
};

/**
 * ENLIGHTENMENT BRAIN - The Logic Engine
 * All system actions defined here
 */
const EnlightenmentBrain = {
    // Navigation
    sign_in: () => window.location.href = '/auth',
    begin_journey: () => window.location.href = '/auth',
    watch_intro: () => window.location.href = '/intro',
    open_dashboard: () => window.location.href = '/dashboard',
    scroll_top: () => window.scrollTo({ top: 0, behavior: 'smooth' }),

    // UI Controls
    nav_toggle: () => document.querySelector('.orbital-nav')?.classList.toggle('active'),
    shield_toggle: () => document.body.classList.toggle('silence-shield'),
    
    // Quick Reset
    quick_reset: () => {
        window.dispatchEvent(new CustomEvent('QUICK_RESET'));
        console.log("🔄 Quick Reset Triggered");
    },

    // Media
    media_play: (src) => {
        if (src) {
            const audio = new Audio(src);
            audio.play();
        }
    },

    // Harvest (RPG)
    harvest_seed: (value, el) => {
        el?.classList.add('harvested');
        console.log(`✨ Resonance Harvested: ${value || el?.id}`);
    },

    // Skin Switching
    change_skin: (theme) => {
        const skins = {
            'cosmic_neon': { '--bg': '#0a0a0c', '--accent': '#7df9ff' },
            'vegan_earth': { '--bg': '#1b261e', '--accent': '#a3b18a' },
            'golden_ratio': { '--bg': '#1a1a1a', '--accent': '#d4af37' }
        };
        const colors = skins[theme] || skins['cosmic_neon'];
        Object.entries(colors).forEach(([key, val]) => {
            document.documentElement.style.setProperty(key, val);
        });
        console.log(`🎨 Skin: ${theme}`);
    },

    // Export
    export_code: () => {
        const code = document.documentElement.outerHTML;
        const blob = new Blob([code], { type: "text/html" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "ENLIGHTEN-MINT-CAFE.html";
        a.click();
        console.log("📦 Code Exported");
    },

    // Google Sync
    sync_google: () => {
        window.open('https://console.cloud.google.com/', '_blank');
    }
};

/**
 * SPINE STABILIZER - Forces scroll to work
 */
const StabilizeSpine = () => {
    const fix = document.createElement('style');
    fix.innerHTML = `
        html, body {
            overflow-y: scroll !important;
            overflow-x: hidden !important;
            height: auto !important;
            min-height: 100vh !important;
            background: #121214 !important;
        }
        #root, .sanctuary-root {
            overflow: visible !important;
            height: auto !important;
        }
        .aurora, .bg-layer, [class*="overlay"]:not(.modal) {
            pointer-events: none !important;
            z-index: -1 !important;
        }
        button, a, [data-action] {
            pointer-events: auto !important;
            cursor: pointer !important;
        }
    `;
    document.head.appendChild(fix);
    console.log("🔓 [Spine]: Stabilized");
};

// IGNITION
document.addEventListener('DOMContentLoaded', () => {
    StabilizeSpine();
    SystemBridge.init(EnlightenmentBrain);
});

// Expose globally for console access
window.Brain = EnlightenmentBrain;
window.Bridge = SystemBridge;
