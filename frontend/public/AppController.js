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

/**
 * CREATOR CONSOLE - Debug/Admin Panel
 * Shows brain state in real-time
 */
const CreatorConsole = {
    el: null,

    setup(containerId, systemBrain) {
        this.el = document.getElementById(containerId);
        if (!this.el) return console.error("Creator Area container not found.");

        this.render(systemBrain);
        
        // Refresh the view every 500ms (Heartbeat)
        setInterval(() => this.update(systemBrain), 500); 
    },

    render(brain) {
        this.el.innerHTML = `
            <div id="console-display" style="background:#000; color:#0f0; padding:20px; font-family:monospace; border:2px solid #333; border-radius:8px;">
                <h3 style="color:#fff; border-bottom:1px solid #333; margin-bottom:15px;">SYSTEM BRAIN READOUT</h3>
                <div id="brain-state-vars"></div>
                <hr style="border:0; border-top:1px solid #333; margin:15px 0;">
                <div id="manual-overrides" style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button onclick="window.location.reload()" style="background:#444; color:#fff; border:none; padding:8px 15px; cursor:pointer; border-radius:4px;">Hard Reset</button>
                    <button onclick="Brain.change_skin('cosmic_neon')" style="background:#0a0a0c; color:#7df9ff; border:1px solid #7df9ff; padding:8px 15px; cursor:pointer; border-radius:4px;">Cosmic</button>
                    <button onclick="Brain.change_skin('golden_ratio')" style="background:#1a1a1a; color:#d4af37; border:1px solid #d4af37; padding:8px 15px; cursor:pointer; border-radius:4px;">Golden</button>
                    <button onclick="Brain.change_skin('vegan_earth')" style="background:#1b261e; color:#a3b18a; border:1px solid #a3b18a; padding:8px 15px; cursor:pointer; border-radius:4px;">Earth</button>
                    <button onclick="Brain.export_code()" style="background:#222; color:#0f0; border:1px solid #0f0; padding:8px 15px; cursor:pointer; border-radius:4px;">Export HTML</button>
                </div>
            </div>
        `;
    },

    update(brain) {
        const varContainer = document.getElementById('brain-state-vars');
        if (!varContainer) return;

        let html = "";
        for (let key in brain) {
            if (typeof brain[key] !== 'function') {
                html += `
                    <div style="margin-bottom:8px; display:flex; justify-content:space-between;">
                        <span style="color:#888;">${key}:</span>
                        <span style="color:#fff;">${JSON.stringify(brain[key])}</span>
                    </div>
                `;
            }
        }
        varContainer.innerHTML = html || '<div style="color:#666;">No state variables defined</div>';
    }
};

window.Console = CreatorConsole;
