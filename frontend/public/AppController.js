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
    vaultUnlocked: false,

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
 * SOVEREIGN VAULT - Stealth Access System
 * Hidden "Dead Pixel" access point in top-left corner
 */
const SovereignVault = {
    isLocked: true,
    vaultKey: null,

    async init(encryptedBrainData) {
        // 1. Initial Scrubber - Kill distractions before they even render
        this.runHardScrub();
        
        // 2. Setup the "Dead Pixel" - The hidden access point
        const accessPoint = document.createElement('div');
        accessPoint.id = 'vault-access';
        accessPoint.style = "position:fixed;top:0;left:0;width:2px;height:2px;z-index:100000;cursor:crosshair;";
        document.body.appendChild(accessPoint);

        accessPoint.onclick = () => {
            const input = prompt("ENTER SOVEREIGN ACCESS KEY:");
            this.unlock(input, encryptedBrainData);
        };
        
        // Continuous background protection
        setInterval(() => this.runHardScrub(), 500);
        
        console.log("%c[Vault]: Stealth Mode Active - Dead Pixel at (0,0)", "color: #ff0; font-weight: bold;");
    },

    runHardScrub() {
        const targets = ['Journey', 'Ancient', 'Tour', 'Divination', 'Emergent'];
        document.querySelectorAll('button, span, div, h1, p').forEach(el => {
            if (targets.some(t => el.innerText && el.innerText.includes(t))) {
                el.style.display = 'none';
                el.remove();
            }
        });
        // Force-hide their global navigation if it tries to overlap
        const nav = document.querySelector('nav');
        if (nav) nav.style.zIndex = "1";
    },

    async unlock(key, data) {
        if (!key) return;
        
        // Simple hash check to verify the key before attempting decryption
        const encoder = new TextEncoder();
        const msgUint8 = encoder.encode(key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // The "Seal" - If hash matches, launch the Master Console
        // Hash is SHA-256 of "password"
        if (hashHex === "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8") {
            this.isLocked = false;
            Brain.vaultUnlocked = true;
            console.log("%c[Vault]: UNLOCKED - SOVEREIGN CONTROL RESTORED", "color: #0f0; font-size: 16px; font-weight: bold;");
            CreatorConsole.init(Brain); // Launch the UI
            CreatorConsole.toggle();    // Expand the Umbrella
        } else {
            console.error("%c[Vault]: ACCESS DENIED - INCORRECT KEY", "color: #f00; font-weight: bold;");
            alert("ACCESS DENIED: INCORRECT KEY");
        }
    }
};

/**
 * CREATOR CONSOLE - Sovereign Shield & Unified Console
 * ENLIGHTENMENT.MINT.CAFE // SOVEREIGN_CONTROL
 * Only visible after vault unlock
 */
const CreatorConsole = {
    isOpen: false,
    deferredPrompt: null,

    init(brain) {
        // Inject protection CSS
        this.activateSovereignShield();

        let el = document.getElementById('creator-area') || document.createElement('div');
        el.id = 'creator-area';
        document.body.appendChild(el);
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
        });

        this.render(el);
        this.attachListeners(brain);
        setInterval(() => this.update(brain), 500);
    },

    activateSovereignShield() {
        const style = document.createElement('style');
        style.innerHTML = `
            #creator-area { z-index: 99999 !important; position: relative; }
            [class*="Journey"], [class*="Ancient"], .made-with-emergent, [id*="divination"] {
                display: none !important;
                visibility: hidden !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    },

    toggle() {
        this.isOpen = !this.isOpen;
        Brain.consoleOpen = this.isOpen;
        const panel = document.getElementById('master-umbrella');
        const footer = document.getElementById('console-footer');
        panel.style.setProperty('height', this.isOpen ? '100dvh' : '60px', 'important');
        if (footer) footer.style.display = this.isOpen ? 'flex' : 'none';
        document.getElementById('toggle-label').innerText = this.isOpen ? 'CLOSE UMBRELLA' : 'OPEN CREATOR CONSOLE';
    },

    render(container) {
        container.innerHTML = `
            <div id="master-umbrella" style="position:fixed; top:0; left:0; width:100vw; height:60px; background:#000; color:#0f0; z-index:100000; transition: height 0.3s ease; font-family:monospace; overflow:hidden; border-bottom:2px solid #0f0;">
                
                <div style="height:60px; display:flex; justify-content:space-between; align-items:center; padding:0 15px; background:#000;">
                    <div style="font-size:12px; font-weight:bold;">ENLIGHTENMENT.MINT.CAFE // SOVEREIGN_CONTROL</div>
                    <button id="umbrella-toggle" style="background:#0f0; color:#000; border:none; padding:10px; font-weight:bold; cursor:pointer;">
                        <span id="toggle-label">OPEN CREATOR CONSOLE</span>
                    </button>
                </div>

                <div style="padding:20px; height: calc(100dvh - 120px); overflow-y:auto; display:flex; flex-direction:column; gap:20px;">
                    <div style="border:1px solid #0f0; padding:15px; background: rgba(0,20,0,0.9); min-height:80px;">
                        <h3 style="color:#fff; margin:0 0 10px 0; border-bottom:1px solid #0f0; padding-bottom:5px;">UTILITY BRAIN READOUT</h3>
                        <div id="brain-vars-list" style="font-size:13px; color:#0f0;"></div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <button id="install-app-btn" style="background:#00f; color:#fff; padding:15px; grid-column: span 2; font-weight:bold; border:none; cursor:pointer;">⬇️ INSTALL SOVEREIGN APP</button>
                        <button class="action-btn" data-action="setTheme" data-value="cosmic" style="background:#111; color:#0f0; border:1px solid #0f0; padding:12px; cursor:pointer;">COSMIC</button>
                        <button class="action-btn" data-action="setTheme" data-value="purelight" style="background:#111; color:#0f0; border:1px solid #0f0; padding:12px; cursor:pointer;">PURE LIGHT</button>
                        <button class="action-btn" data-action="exportSovereign" style="background:#004400; color:#fff; border:none; padding:15px; grid-column: span 2; cursor:pointer;">EXPORT SOVEREIGN CODE</button>
                        <button onclick="window.location.reload()" style="background:#440000; color:#fff; border:none; padding:10px; grid-column: span 2; cursor:pointer;">HARD RESET SYSTEM</button>
                    </div>
                </div>

                <div id="console-footer" style="display:none; position:absolute; bottom:0; width:100%; height:60px; background:#000; border-top:1px solid #333; align-items:center; padding:0 15px; font-size:10px; color:#444;">
                    BLACK_HILLS_SD // ENLIGHTENMENT_ENGINE // VAULT_UNLOCKED: TRUE
                </div>
            </div>
        `;
    },

    attachListeners(brain) {
        document.getElementById('umbrella-toggle').onclick = () => this.toggle();
        
        document.getElementById('install-app-btn').onclick = async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                this.deferredPrompt = null;
            } else {
                alert("App ready on Home Screen or PWA not primed.");
            }
        };

        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.onclick = () => {
                const action = btn.dataset.action;
                const val = btn.dataset.value;
                if (brain[action]) brain[action](val);
            };
        });
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
    }
};

// Expose globally
window.Brain = Brain;
window.Bridge = SystemBridge;
window.Console = CreatorConsole;
window.Vault = SovereignVault;

// IGNITION - Start in Stealth Mode
document.addEventListener('DOMContentLoaded', () => {
    StabilizeSpine();
    SystemBridge.init(Brain);
    SovereignVault.init(); // Start vault in stealth - NO visible console until unlocked
});
