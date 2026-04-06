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
 * User's exact specification
 */
const CreatorConsole = {
    isOpen: false,

    init(brain) {
        let el = document.getElementById('creator-area');
        if (!el) {
            el = document.createElement('div');
            el.id = 'creator-area';
            document.body.appendChild(el);
        }
        this.render(el);
        this.attachListeners(brain);
        setInterval(() => this.update(brain), 500);
        console.log('%c[CreatorConsole] Umbrella Initialized', 'color: #0f0; font-weight: bold;');
    },

    toggle() {
        this.isOpen = !this.isOpen;
        Brain.consoleOpen = this.isOpen; // Update brain state
        const panel = document.getElementById('master-umbrella');
        const content = document.querySelectorAll('.console-content');
        
        if (panel) {
            panel.style.setProperty('height', this.isOpen ? '100vh' : '60px', 'important');
            panel.style.setProperty('overflow', this.isOpen ? 'visible' : 'hidden', 'important');
            console.log(`[CreatorConsole] Toggle: isOpen=${this.isOpen}, height=${panel.style.height}`);
        }
        content.forEach(c => c.style.display = this.isOpen ? 'block' : 'none');
        const labelEl = document.getElementById('toggle-label');
        if (labelEl) {
            labelEl.innerText = this.isOpen ? 'CLOSE UMBRELLA' : 'OPEN CREATOR CONSOLE';
        }
    },

    render(container) {
        container.innerHTML = `
            <div id="master-umbrella" style="position:fixed; top:0; left:0; width:100%; height:60px; background:rgba(0,0,0,0.95); color:#0f0; z-index:10000; transition: all 0.4s ease; font-family:monospace; border-bottom:2px solid #333; overflow:hidden;">
                
                <div style="height:60px; display:flex; justify-content:space-between; align-items:center; padding:0 20px; border-bottom:1px solid #222;">
                    <div style="font-weight:bold; letter-spacing:2px;">ENLIGHTENMENT.MINT.CAFE // CREATOR_MODE</div>
                    <button id="umbrella-toggle" style="background:#0f0; color:#000; border:none; padding:8px 15px; font-weight:bold; cursor:pointer; border-radius:4px;">
                        <span id="toggle-label">OPEN CREATOR CONSOLE</span>
                    </button>
                </div>

                <div class="console-content" style="display:none; padding:20px; height: calc(100vh - 120px); overflow-y:auto;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
                        <div>
                            <h3 style="color:#fff; border-bottom:1px solid #333;">SYSTEM BRAIN READOUT</h3>
                            <div id="brain-vars-list" style="font-size:14px; line-height:1.6;"></div>
                        </div>
                        <div>
                            <h3 style="color:#fff; border-bottom:1px solid #333;">QUICK ACTIONS</h3>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:15px;">
                                <button class="action-btn" data-action="setTheme" data-value="cosmic" style="background:#222; color:#fff; border:1px solid #444; padding:10px; cursor:pointer;">SKIN: COSMIC</button>
                                <button class="action-btn" data-action="setTheme" data-value="purelight" style="background:#222; color:#fff; border:1px solid #444; padding:10px; cursor:pointer;">SKIN: PURE LIGHT</button>
                                <button class="action-btn" data-action="exportSovereign" style="background:#005500; color:#fff; border:none; padding:10px; cursor:pointer;">EXPORT SOVEREIGN CODE</button>
                                <button onclick="window.location.reload()" style="background:#440000; color:#fff; border:none; padding:10px; cursor:pointer;">FORCE HARD RESET</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="console-content" style="display:none; position:absolute; bottom:0; width:100%; height:60px; background:#111; border-top:2px solid #333; display:flex; align-items:center; padding:0 20px;">
                    <div style="font-size:12px; color:#666;">LATENCY: <span id="ping-val">0ms</span> | SYSTEM_READY: TRUE | REGION: BLACK_HILLS_SD</div>
                </div>
            </div>
        `;
    },

    update(brain) {
        if (!this.isOpen) return;
        const list = document.getElementById('brain-vars-list');
        if (!list) return;
        let html = "";
        for (let [key, val] of Object.entries(brain)) {
            if (typeof val !== 'function') {
                html += `<div style="border-bottom:1px solid #222; padding:5px 0;">
                    <span style="color:#888;">${key}:</span> <span style="color:#0f0;">${JSON.stringify(val)}</span>
                </div>`;
            }
        }
        list.innerHTML = html;
        const pingEl = document.getElementById('ping-val');
        if (pingEl) pingEl.innerText = Math.floor(Math.random() * 20) + "ms";
    },

    attachListeners(brain) {
        document.getElementById('umbrella-toggle').onclick = () => this.toggle();

        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.onclick = () => {
                const action = btn.dataset.action;
                const val = btn.dataset.value;
                if (brain[action]) brain[action](val);
                console.log(`[SYNAPSE] ${action} triggered with ${val}`);
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
