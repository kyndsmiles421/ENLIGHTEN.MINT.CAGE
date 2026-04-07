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

                if (this.brain && typeof this.brain[action] === 'function') {
                    this.brain[action](value, target);
                }
            }
        });
    }
};

/**
 * ENLIGHTENMENT BRAIN - The Logic Engine
 */
const Brain = {
    currentTheme: 'cosmic',
    spineUnlocked: true,
    consoleOpen: false,
    vaultUnlocked: false,

    sign_in: () => window.location.href = '/auth',
    begin_journey: () => window.location.href = '/auth',
    watch_intro: () => window.location.href = '/intro',
    open_dashboard: () => window.location.href = '/dashboard',
    scroll_top: () => window.scrollTo({ top: 0, behavior: 'smooth' }),

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
    },

    exportSovereign: () => {
        const htmlContent = document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Enlightenment_Cafe_Sovereign_Code.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

/**
 * SOVEREIGN VAULT - Stealth Access System
 * Hidden "Dead Pixel" access point - NO aggressive scrubbing
 */
const SovereignVault = {
    isLocked: true,

    init() {
        // Setup the "Dead Pixel" - The hidden access point (top-left corner)
        const accessPoint = document.createElement('div');
        accessPoint.id = 'vault-access';
        accessPoint.style.cssText = "position:fixed;top:0;left:0;width:10px;height:10px;z-index:999999;cursor:crosshair;background:transparent;";
        document.body.appendChild(accessPoint);

        accessPoint.onclick = () => {
            const input = prompt("ENTER SOVEREIGN ACCESS KEY:");
            if (input) this.unlock(input);
        };
    },

    async unlock(key) {
        const encoder = new TextEncoder();
        const msgUint8 = encoder.encode(key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // SHA-256 of "password"
        if (hashHex === "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8") {
            this.isLocked = false;
            Brain.vaultUnlocked = true;
            CreatorConsole.init(Brain);
            CreatorConsole.toggle();
        } else {
            alert("ACCESS DENIED");
        }
    }
};

/**
 * CREATOR CONSOLE - Sovereign Control Panel
 */
const CreatorConsole = {
    isOpen: false,
    deferredPrompt: null,

    init(brain) {
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

    toggle() {
        this.isOpen = !this.isOpen;
        Brain.consoleOpen = this.isOpen;
        const panel = document.getElementById('master-umbrella');
        const footer = document.getElementById('console-footer');
        if (panel) {
            panel.style.setProperty('height', this.isOpen ? '100dvh' : '60px', 'important');
        }
        if (footer) footer.style.display = this.isOpen ? 'flex' : 'none';
        const label = document.getElementById('toggle-label');
        if (label) label.innerText = this.isOpen ? 'CLOSE UMBRELLA' : 'OPEN CREATOR CONSOLE';
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

window.Brain = Brain;
window.Bridge = SystemBridge;
window.Console = CreatorConsole;
window.Vault = SovereignVault;

// IGNITION - Stealth mode, NO scrubber
document.addEventListener('DOMContentLoaded', () => {
    SystemBridge.init(Brain);
    SovereignVault.init();
});
