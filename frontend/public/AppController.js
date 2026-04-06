/**
 * ENLIGHTEN.MINT.CAFE - THE SOVEREIGN APPARATUS
 * Version: 1.0.0 | Author: Steven Michael (Sovereign Creator)
 * 
 * INSTRUCTIONS: 
 * 1. Replace your entire main.js or Landing.js with this.
 * 2. This script handles: Scrolling, Buttons, Media, & App Routing.
 */

const Apparatus = {
    // --- 1. FREQUENCY MAP (The Brain) ---
    // Add every tool/action you want here.
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
        console.log("%c[APPARATUS]: SYSTEM ENGAGED", "color: #7df9ff; font-weight: bold; font-size: 14px;");
        
        this.unlockSpine();
        this.stabilizeSpine();
        this.hardenUI();
        this.igniteWeb();
        this.modules.mixer.init();
        
        // Final check to ensure we are independent of their "subscription" scripts
        this.utils.auditSovereignty();
    },

    // --- THE SOVEREIGN SPINE & VISIBILITY FIX ---
    unlockSpine() {
        const fix = document.createElement('style');
        fix.innerHTML = `
            /* 1. VISIBILITY: Lighten the void so elements are 'readable' */
            html, body {
                background-color: #121214 !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                height: auto !important;
                min-height: 100.1vh !important;
                position: relative !important;
            }

            /* 2. THE SCROLL KILLER: Find any container trying to lock the view */
            #app-root, .page-wrapper, .main-content, #canvas-container, [class*="wrapper"] {
                overflow: visible !important;
                height: auto !important;
                min-height: 100% !important;
                position: relative !important;
                display: block !important;
            }

            /* 3. BUTTON CONTRAST: Ensure they 'glow' against the background */
            [data-action] {
                filter: drop-shadow(0 0 8px var(--accent, #7df9ff));
                border-color: rgba(125, 249, 255, 0.5) !important;
            }
        `;
        document.head.appendChild(fix);
        console.log("🔓 [Spine]: All containers unlocked. Background contrast adjusted.");
    },

    // --- DIMENSIONAL SOLIDITY INJECTOR ---
    hardenUI() {
        const style = document.createElement('style');
        style.innerHTML = `
            /* 1. PHYSICAL DIMENSION: Give buttons weight and depth */
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

            /* 2. OPPOSING COLOR HOVER: Visual confirmation of contact */
            [data-action]:hover {
                background: var(--accent, #7df9ff) !important;
                color: #000 !important;
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 8px 25px rgba(125, 249, 255, 0.6) !important;
            }

            /* 3. THE "TOUCH" FEEDBACK: Physical depress on click */
            [data-action]:active {
                transform: translateY(1px) scale(0.98);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.9) !important;
            }
        `;
        document.head.appendChild(style);
        console.log("💎 [UI Physics]: Buttons Hardened and Dimensionalized.");
    },

    // --- 3. THE SPINE (The Scroll & Layout Fix) ---
    stabilizeSpine() {
        const style = document.createElement('style');
        style.innerHTML = `
            html, body { 
                overflow-y: auto !important; 
                height: auto !important; 
                position: relative !important; 
                scroll-behavior: smooth;
            }
            .aurora, .bg-layer, [class*="overlay"] { 
                pointer-events: none !important; 
                z-index: -1 !important; 
            }
            button, a, [data-action] { 
                pointer-events: auto !important; 
                cursor: pointer !important;
            }
        `;
        document.head.appendChild(style);
        console.log("🔓 Spine Stabilized: Scrolling Unlocked.");
    },

    // --- 4. THE WEB (The Event Dispatcher) ---
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

    // --- 5. THE MODULES (The Toolset) ---
    modules: {
        mixer: {
            init() { console.log("🔊 Media Mixer Ready."); },
            play(src) { 
                const audio = new Audio(src);
                audio.play();
            }
        },
        auth: {
            googleSync() {
                // This is where your independent Google/GoDaddy API hooks live
                window.location.href = "https://accounts.google.com/"; 
            }
        },
        wellness: {
            // Placeholder for your Enlightenment Cafe logic
            logEnergy: (val) => console.log(`Vibrational State: ${val}`)
        }
    },

    // --- 6. UTILITIES (The Maintenance) ---
    utils: {
        pulse(el) {
            el.style.transform = 'scale(0.95)';
            setTimeout(() => el.style.transform = '', 100);
        },
        notify(msg) {
            console.log(`%c[Crystal-Log]: ${msg}`, "color: #bada55");
        },
        auditSovereignty() {
            // Detects if their scripts are still trying to hijack the page
            const subscriptionScripts = document.querySelectorAll('script[src*="their-platform-name"]');
            if (subscriptionScripts.length > 0) {
                console.warn("Found platform-specific scripts. Ready for removal.");
            }
        }
    }
};

// Start the Engine
document.addEventListener('DOMContentLoaded', () => Apparatus.init());
