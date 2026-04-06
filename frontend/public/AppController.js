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
    init(systemBrain) {
        // Create the container if it doesn't exist
        let consoleEl = document.getElementById('creator-area');
        if (!consoleEl) {
            consoleEl = document.createElement('div');
            consoleEl.id = 'creator-area';
            document.body.appendChild(consoleEl);
        }

        this.render(consoleEl);
        this.attachListeners(systemBrain);
        
        // Start the heartbeat for the Brain Readout
        setInterval(() => this.updateReadout(systemBrain), 500);
        console.log('%c[Creator Console]: Active', 'color: #00ff00; font-weight: bold');
    },

    render(container) {
        container.innerHTML = `
            <div id="debug-panel" style="position:fixed; bottom:20px; right:20px; width:300px; background:rgba(0,0,0,0.9); color:#0f0; border:1px solid #333; padding:15px; font-family:monospace; z-index:9999; border-radius:8px; box-shadow: 0 0 15px rgba(0,0,0,0.5);">
                <div style="font-weight:bold; border-bottom:1px solid #333; padding-bottom:5px; margin-bottom:10px;">SYSTEM BRAIN READOUT</div>
                <div id="brain-vars" style="font-size:12px; max-height:150px; overflow-y:auto; margin-bottom:10px;"></div>
                
                <div style="font-weight:bold; border-bottom:1px solid #333; margin-bottom:8px;">SKINS</div>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:5px; margin-bottom:15px;">
                    <button class="skin-btn" data-skin="cosmic" style="background:#222; color:#fff; border:1px solid #444; cursor:pointer; padding:5px;">Cosmic</button>
                    <button class="skin-btn" data-skin="golden" style="background:#222; color:#fff; border:1px solid #444; cursor:pointer; padding:5px;">Golden</button>
                    <button class="skin-btn" data-skin="earth" style="background:#222; color:#fff; border:1px solid #444; cursor:pointer; padding:5px;">Earth</button>
                </div>

                <div style="display:flex; flex-direction:column; gap:5px;">
                    <button id="export-html" style="background:#005500; color:#fff; border:none; padding:8px; cursor:pointer; font-weight:bold;">EXPORT HTML (Sovereign)</button>
                    <button onclick="window.location.reload()" style="background:#440000; color:#fff; border:none; padding:5px; cursor:pointer; font-size:10px;">HARD RESET</button>
                </div>
            </div>
        `;
    },

    updateReadout(brain) {
        const varDisplay = document.getElementById('brain-vars');
        if (!varDisplay) return;

        let stateHtml = "";
        for (let [key, value] of Object.entries(brain)) {
            if (typeof value !== 'function') {
                stateHtml += `<div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="color:#888;">${key}:</span>
                    <span>${JSON.stringify(value)}</span>
                </div>`;
            }
        }
        varDisplay.innerHTML = stateHtml || '<div style="color:#666;">Brain online - no state vars</div>';
    },

    attachListeners(brain) {
        // Skin Switcher Logic
        document.querySelectorAll('.skin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skin = btn.dataset.skin;
                console.log(`[System] Applying ${skin} theme...`);
                if (brain.change_skin) brain.change_skin(skin === 'cosmic' ? 'cosmic_neon' : skin === 'golden' ? 'golden_ratio' : 'vegan_earth');
                document.body.className = `theme-${skin}`;
            });
        });

        // Export Logic
        document.getElementById('export-html')?.addEventListener('click', () => {
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Enlightenment_Cafe_Sovereign_Code.html`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
};

window.Console = CreatorConsole;

// Start the console after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        CreatorConsole.init(EnlightenmentBrain);
    }, 1500);
});
