/**
 * SYSTEM BRIDGE - The Spinal Cord
 * Connects UI buttons to the System Brain
 * ENLIGHTEN.MINT.CAFE | Sovereign Architecture
 */

const SystemBridge = {
    brain: null,

    init(systemBrain) {
        this.brain = systemBrain;
        
        document.addEventListener('click', (event) => {
            const target = event.target.closest('button, [role="button"], a');
            
            if (target && target.dataset.action) {
                const action = target.dataset.action;
                const value = target.dataset.value || null;

                console.log(`%c[Bridge] Routing action: ${action}`, "color: #00f2ff");

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
 */
const Brain = {
    // State variables
    currentTheme: 'cosmic',
    spineUnlocked: true,
    consoleOpen: false,

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

    // Skin Switching
    setTheme: (theme) => {
        const skins = {
            'cosmic': { '--bg': '#0a0a0c', '--accent': '#7df9ff' },
            'purelight': { '--bg': '#f5f5f5', '--accent': '#333333' },
            'golden': { '--bg': '#1a1a1a', '--accent': '#d4af37' },
            'earth': { '--bg': '#1b261e', '--accent': '#a3b18a' }
        };
        const colors = skins[theme] || skins['cosmic'];
        Object.entries(colors).forEach(([key, val]) => {
            document.documentElement.style.setProperty(key, val);
        });
        Brain.currentTheme = theme;
        console.log(`🎨 Skin: ${theme}`);
    },

    // Export Sovereign HTML
    exportSovereign: () => {
        const htmlContent = document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Enlightenment_Cafe_Sovereign_Code.html`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('[Sovereign] HTML Exported');
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

/**
 * CREATOR CONSOLE - Full Screen Umbrella Debug Panel
 * ENLIGHTENMENT.MINT.CAFE // CREATOR_MODE
 */
const CreatorConsole = {
    isOpen: false,

    init(brain) {
        let el = document.getElementById('creator-area') || document.createElement('div');
        el.id = 'creator-area';
        document.body.appendChild(el);
        this.render(el);
        this.attachListeners(brain);
        setInterval(() => this.update(brain), 500);
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('master-umbrella');
        // Smoothly expand from a 60px header to full viewport coverage
        panel.style.height = this.isOpen ? '100dvh' : '60px'; 
        document.getElementById('toggle-label').innerText = this.isOpen ? 'CLOSE UMBRELLA' : 'OPEN CREATOR CONSOLE';
    },

    render(container) {
        container.innerHTML = `
            <div id="master-umbrella" style="position:fixed; top:0; left:0; width:100vw; height:60px; background:#000; color:#0f0; z-index:10000; transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family:monospace; overflow:hidden; border-bottom:2px solid #0f0;">
                
                <div style="height:60px; display:flex; justify-content:space-between; align-items:center; padding:0 15px; background:#000; position:sticky; top:0;">
                    <div style="font-size:12px; font-weight:bold; color:#0f0;">ENLIGHTENMENT.MINT.CAFE // CREATOR_MODE</div>
                    <button id="umbrella-toggle" style="background:#0f0; color:#000; border:none; padding:10px; font-weight:bold; cursor:pointer; font-size:11px;">
                        <span id="toggle-label">OPEN CREATOR CONSOLE</span>
                    </button>
                </div>

                <div style="padding:20px; height: calc(100dvh - 120px); overflow-y:auto; display:flex; flex-direction:column; gap:20px;">
                    
                    <div style="border:1px solid #333; padding:15px; border-radius:4px;">
                        <h3 style="color:#fff; margin:0 0 10px 0; font-size:14px; border-bottom:1px solid #333;">SYSTEM BRAIN READOUT</h3>
                        <div id="brain-vars-list" style="font-size:13px; color:#0f0;"></div>
                    </div>

                    <div style="border:1px solid #333; padding:15px; border-radius:4px;">
                        <h3 style="color:#fff; margin:0 0 10px 0; font-size:14px; border-bottom:1px solid #333;">QUICK ACTIONS</h3>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <button class="action-btn" data-action="setTheme" data-value="cosmic" style="background:#222; color:#fff; border:1px solid #444; padding:12px;">COSMIC</button>
                            <button class="action-btn" data-action="setTheme" data-value="purelight" style="background:#222; color:#fff; border:1px solid #444; padding:12px;">PURE LIGHT</button>
                            <button class="action-btn" data-action="exportSovereign" style="background:#004400; color:#fff; border:none; padding:12px; grid-column: span 2;">EXPORT SOVEREIGN CODE</button>
                            <button onclick="window.location.reload()" style="background:#440000; color:#fff; border:none; padding:8px; grid-column: span 2; font-size:10px;">FORCE HARD RESET</button>
                        </div>
                    </div>
                </div>

                <div style="position:absolute; bottom:0; width:100%; height:60px; background:#000; border-top:1px solid #333; display:flex; align-items:center; padding:0 15px; font-size:10px; color:#444;">
                    BLACK_HILLS_SD // ENLIGHTENMENT_ENGINE_V1
                </div>
            </div>
        `;
    },

    update(brain) {
        const list = document.getElementById('brain-vars-list');
        if (!list) return;
        let html = "";
        for (let [key, val] of Object.entries(brain)) {
            if (typeof val !== 'function') {
                html += `<div>${key}: <span style="color:#fff;">${JSON.stringify(val)}</span></div>`;
            }
        }
        list.innerHTML = html;
    },

    attachListeners(brain) {
        document.getElementById('umbrella-toggle').onclick = () => this.toggle();
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.onclick = () => {
                const action = btn.dataset.action;
                const val = btn.dataset.value;
                if (brain[action]) brain[action](val);
            };
        });
    }
};

// Expose globally
window.Brain = Brain;
window.Bridge = SystemBridge;
window.Console = CreatorConsole;

// IGNITION
document.addEventListener('DOMContentLoaded', () => {
    StabilizeSpine();
    SystemBridge.init(Brain);
    CreatorConsole.init(Brain);
    console.log('%c[AppController] v2.0.0 - All Systems Online', 'color: #0f0; font-size: 14px; font-weight: bold;');
});
