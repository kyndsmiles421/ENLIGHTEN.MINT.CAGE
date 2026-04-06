/**
 * ENLIGHTEN.MINT.CAFE - THE SOVEREIGN APPARATUS
 * Version: 1.1.0 | Author: Steven Michael (Sovereign Creator)
 * 
 * Bridges React onClick handlers with vanilla JS control layer.
 * Handles: Scrolling, Button Detection, Media, & App Routing.
 */

const Apparatus = {
    // --- 1. FREQUENCY MAP (The Brain) ---
    tools: {
        'nav_toggle': () => document.querySelector('.orbital-nav')?.classList.toggle('active'),
        'shield_toggle': () => document.body.classList.toggle('silence-shield'),
        'harvest_seed': (el) => Apparatus.utils.notify(`Resonance Harvested: ${el.id}`),
        'media_play': (el) => Apparatus.modules.mixer.play(el.dataset.src),
        'scroll_top': () => window.scrollTo({top: 0, behavior: 'smooth'}),
        'sync_google': () => Apparatus.modules.auth.googleSync(),
        'quick_reset': () => window.dispatchEvent(new CustomEvent('QUICK_RESET')),
        'sign_in': () => window.location.href = '/auth',
        'begin_journey': () => window.location.href = '/auth',
        'watch_intro': () => window.location.href = '/intro',
        'open_dashboard': () => window.location.href = '/dashboard',
        'default': (act) => console.log(`Frequency ${act} received.`)
    },

    // --- 2. THE IGNITION (The Nervous System) ---
    init() {
        console.log("%c[APPARATUS v1.1]: SYSTEM ENGAGED", "color: #7df9ff; font-weight: bold; font-size: 14px;");
        
        this.unlockSpine();
        this.stabilizeSpine();
        this.hardenUI();
        this.igniteWeb();
        this.bridgeReact();
        this.modules.mixer.init();
        this.utils.auditSovereignty();
    },

    // --- SOVEREIGN SPINE & VISIBILITY FIX ---
    unlockSpine() {
        const fix = document.createElement('style');
        fix.innerHTML = `
            html, body {
                background-color: #121214 !important;
                overflow-y: scroll !important;
                overflow-x: hidden !important;
                height: auto !important;
                min-height: 100.1vh !important;
                position: relative !important;
            }
            #root, #app-root, .page-wrapper, .main-content, #canvas-container, [class*="wrapper"] {
                overflow: visible !important;
                height: auto !important;
                min-height: 100% !important;
                position: relative !important;
                display: block !important;
            }
            [data-action] {
                filter: drop-shadow(0 0 8px var(--accent, #7df9ff));
                border-color: rgba(125, 249, 255, 0.5) !important;
            }
        `;
        document.head.appendChild(fix);
        console.log("🔓 [Spine]: All containers unlocked. Background contrast adjusted.");
    },

    // --- 3. THE SPINE (The Scroll & Layout Fix) ---
    stabilizeSpine() {
        const style = document.createElement('style');
        style.innerHTML = `
            html, body { 
                overflow-y: scroll !important; 
                height: auto !important; 
                position: relative !important; 
                scroll-behavior: smooth;
            }
            .aurora, .bg-layer, [class*="overlay"]:not(.modal):not(.dialog) { 
                pointer-events: none !important; 
                z-index: -1 !important; 
            }
            button, a, [data-action], [data-testid*="btn"] { 
                pointer-events: auto !important; 
                cursor: pointer !important;
            }
        `;
        document.head.appendChild(style);
    },

    // --- DIMENSIONAL SOLIDITY INJECTOR ---
    hardenUI() {
        const style = document.createElement('style');
        style.innerHTML = `
            [data-action] {
                background: rgba(20, 20, 25, 0.85) !important;
                border: 2px solid var(--accent, #7df9ff) !important;
                color: var(--accent, #7df9ff) !important;
                border-radius: 8px;
                padding: 12px 24px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 
                            inset 0 0 10px rgba(125, 249, 255, 0.2) !important;
                transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                backdrop-filter: blur(10px) !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            [data-action]:hover {
                background: var(--accent, #7df9ff) !important;
                color: #000 !important;
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 8px 25px rgba(125, 249, 255, 0.6) !important;
            }
            [data-action]:active {
                transform: translateY(1px) scale(0.98);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.9) !important;
            }
        `;
        document.head.appendChild(style);
        console.log("💎 [UI Physics]: Buttons Hardened and Dimensionalized.");
    },

    // --- 4. THE WEB (The Event Dispatcher for data-action) ---
    igniteWeb() {
        window.addEventListener('click', (e) => {
            const point = e.target.closest('[data-action]');
            if (!point) return;

            const action = point.dataset.action;
            this.utils.pulse(point);

            if (this.tools[action]) {
                this.tools[action](point);
            } else {
                this.tools['default'](action);
            }
        });
    },

    // --- 5. BRIDGE REACT (Catches ALL button clicks for debugging) ---
    bridgeReact() {
        window.addEventListener('click', (e) => {
            const btn = e.target.closest('button, a[href], [role="button"]');
            if (!btn) return;
            
            // Log every button click for debugging
            const testId = btn.dataset?.testid || btn.getAttribute('data-testid') || 'unknown';
            const text = btn.innerText?.slice(0, 30) || '';
            console.log(`%c[Click]: ${testId} - "${text}"`, "color: #00ff88");
        });
    },

    // --- 6. THE MODULES (The Toolset) ---
    modules: {
        mixer: {
            init() { console.log("🔊 Media Mixer Ready."); },
            play(src) { 
                if (src) {
                    const audio = new Audio(src);
                    audio.play();
                }
            }
        },
        auth: {
            googleSync() {
                window.location.href = "https://accounts.google.com/"; 
            }
        },
        wellness: {
            logEnergy: (val) => console.log(`Vibrational State: ${val}`)
        }
    },

    // --- 7. UTILITIES (The Maintenance) ---
    utils: {
        pulse(el) {
            el.style.transform = 'scale(0.95)';
            setTimeout(() => el.style.transform = '', 100);
        },
        notify(msg) {
            console.log(`%c[Crystal-Log]: ${msg}`, "color: #bada55");
        },
        auditSovereignty() {
            const subscriptionScripts = document.querySelectorAll('script[src*="their-platform-name"]');
            if (subscriptionScripts.length > 0) {
                console.warn("Found platform-specific scripts. Ready for removal.");
            }
        }
    }
};

// Start the Engine
document.addEventListener('DOMContentLoaded', () => Apparatus.init());

// Also run on React hydration (in case DOMContentLoaded already fired)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => Apparatus.init(), 100);
}
